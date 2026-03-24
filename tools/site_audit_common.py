#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


P_LINK_RE = re.compile(r"(?:(?P<kind>[a-zA-Z0-9_-]+)/)?\?p=(?P<id>[a-zA-Z0-9_./-]+)")
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
RAW_VIEWER_REF_RE = re.compile(r"(?<!\]\()(?<!\()(?<!/)\?p=[a-zA-Z0-9_./-]+")
RAW_MANPAGE_REF_RE = re.compile(r"(?<!\[)`[A-Za-z0-9_:+.-]+` \(([137])\)")
STATUS_HEADING_RE = re.compile(
    r"^\s*#{1,6}\s+(?:Status(?:\s*\([^)]*\))?|Status and Future Work|Future Work|Follow-ups)\s*$",
    re.IGNORECASE,
)
PLANNED_HEADING_RE = re.compile(r"^\s*#{1,6}\s+.+\s+\(Planned(?:[^)]*)\)\s*$", re.IGNORECASE)
STATUS_BANNER_RE = re.compile(r"^\s*Status:\s*\*\*.+\*\*", re.IGNORECASE)
CURRENT_API_HEADING_RE = re.compile(r"^\s*#{1,6}\s+Current API(?:\s*\([^)]*\))?\s*$", re.IGNORECASE)
SELECTED_API_HEADING_RE = re.compile(
    r"^\s*#{1,6}\s+API\s*\((?:selected|implemented[^)]*|initial[^)]*|current[^)]*)\)\s*$",
    re.IGNORECASE,
)
TRANSITIONAL_PHRASE_RE = re.compile(
    r"\b(?:Implemented subset|Current supported|Implemented-subset|active expansion|current compiler subset|initial implementation)\b",
    re.IGNORECASE,
)

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#")


@dataclass(frozen=True)
class Issue:
    path: Path
    message: str


@dataclass(frozen=True)
class SiteAuditConfig:
    project_root: Path
    docs_source: Path
    docs_index: Path
    missing_index_message: str
    success_message: str

    @property
    def repo_root(self) -> Path:
        return self.project_root.parent


def load_ids(index_path: Path) -> set[str]:
    data = json.loads(index_path.read_text(encoding="utf-8"))
    ids: set[str] = set()
    for sec in data.get("sections", []):
        for item in sec.get("items", []):
            ids.add(item["id"])
    return ids


def load_index_files(index_path: Path) -> list[str]:
    data = json.loads(index_path.read_text(encoding="utf-8"))
    files: list[str] = []
    for sec in data.get("sections", []):
        for item in sec.get("items", []):
            files.append(item["file"])
    return files


def normalize_rel_path(input_path: str) -> str | None:
    if not input_path:
        return None

    raw_path = str(input_path).strip().replace("\\", "/").removeprefix("./").lstrip("/")
    parts: list[str] = []
    for raw_part in raw_path.split("/"):
        part = raw_part.strip()
        if not part or part == ".":
            continue
        if part == "..":
            if not parts:
                return None
            parts.pop()
            continue
        parts.append(part)

    normalized = "/".join(parts)
    if not normalized or "\0" in normalized:
        return None
    return normalized


def resolve_doclike_target_from_roots(
    href: str,
    current_file: Path,
    repo_root: Path,
    source_roots: dict[str, Path],
) -> Path | None:
    raw = href.strip()
    if not raw:
        return None
    if raw.startswith("<") and raw.endswith(">"):
        raw = raw[1:-1].strip()
    if not raw or raw.startswith(SKIP_PREFIXES):
        return None
    if raw.startswith("?p=") or raw.startswith("/?p=") or "&p=" in raw:
        return None

    raw = raw.split("#", 1)[0].split("?", 1)[0].strip()
    if not raw:
        return None

    looks_like_doc = raw.endswith(".md") or raw.endswith(".txt") or any(
        raw.startswith(f"{prefix}/") for prefix in source_roots
    )
    if not looks_like_doc:
        return None

    for prefix, root in source_roots.items():
        if raw.startswith(f"{prefix}/"):
            rel = normalize_rel_path(raw.removeprefix(f"{prefix}/"))
            return (root / rel) if rel else None

    rel = normalize_rel_path(raw)
    if not rel:
        return None

    resolved = (current_file.parent / rel).resolve()
    try:
        resolved.relative_to(repo_root)
    except ValueError:
        return None
    return resolved


def resolve_doclike_target(config: SiteAuditConfig, href: str, current_file: Path) -> Path | None:
    return resolve_doclike_target_from_roots(
        href=href,
        current_file=current_file,
        repo_root=config.repo_root,
        source_roots={"docs": config.docs_source},
    )


def iter_auditable_lines(md: Path) -> list[tuple[int, str]]:
    text = md.read_text(encoding="utf-8")
    out: list[tuple[int, str]] = []
    in_fence = False
    for lineno, line in enumerate(text.splitlines(), start=1):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_fence = not in_fence
            continue
        if in_fence or stripped.startswith("#"):
            continue
        out.append((lineno, line))
    return out


def check_index_files_exist_at(index_path: Path, source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for file_name in load_index_files(index_path):
        target = source_root / file_name
        if not target.exists():
            issues.append(Issue(index_path, f"Index refers to missing file: {file_name}"))
    return issues


def check_index_files_exist(config: SiteAuditConfig) -> list[Issue]:
    return check_index_files_exist_at(config.docs_index, config.docs_source)


def check_p_links_in_tree(
    source_root: Path,
    default_kind: str,
    ids_by_kind: dict[str, set[str]],
    *,
    include_kind_in_message: bool = False,
) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        for match in P_LINK_RE.finditer(text):
            target_kind = match.group("kind") or default_kind
            target_id = match.group("id")
            ids = ids_by_kind.get(target_kind, set())
            if target_id not in ids:
                message = f"Broken ?p= link: {target_kind}/{target_id}" if include_kind_in_message else f"Broken ?p= link: {target_id}"
                issues.append(Issue(md, message))
    return issues


def check_p_links(config: SiteAuditConfig, ids: set[str]) -> list[Issue]:
    return check_p_links_in_tree(config.docs_source, "docs", {"docs": ids})


def check_doclike_links_in_tree(
    source_root: Path,
    repo_root: Path,
    source_roots: dict[str, Path],
) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        for match in MD_LINK_RE.finditer(text):
            href = match.group(1)
            target = resolve_doclike_target_from_roots(href, md, repo_root, source_roots)
            if not target:
                continue
            if not target.exists():
                try:
                    rel = target.relative_to(repo_root)
                except ValueError:
                    rel = target
                issues.append(Issue(md, f"Missing link target: {href} -> {rel}"))
    return issues


def check_doclike_links(config: SiteAuditConfig) -> list[Issue]:
    return check_doclike_links_in_tree(
        config.docs_source,
        config.repo_root,
        {"docs": config.docs_source},
    )


def check_no_raw_viewer_refs_in_tree(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        for lineno, line in iter_auditable_lines(md):
            if RAW_VIEWER_REF_RE.search(line):
                issues.append(Issue(md, f"Line {lineno}: raw ?p= reference must be a markdown link."))
    return issues


def check_no_raw_viewer_refs(config: SiteAuditConfig) -> list[Issue]:
    return check_no_raw_viewer_refs_in_tree(config.docs_source)


def check_no_raw_manpage_refs_in_tree(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        for lineno, line in iter_auditable_lines(md):
            if RAW_MANPAGE_REF_RE.search(line):
                issues.append(Issue(md, f"Line {lineno}: raw manpage reference must be a markdown link."))
    return issues


def check_no_raw_manpage_refs(config: SiteAuditConfig) -> list[Issue]:
    return check_no_raw_manpage_refs_in_tree(config.docs_source)


def check_no_editorial_status_framing_in_tree(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        in_fence = False
        for lineno, line in enumerate(text.splitlines(), start=1):
            stripped = line.lstrip()
            if stripped.startswith("```") or stripped.startswith("~~~"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            if (
                STATUS_HEADING_RE.search(line)
                or PLANNED_HEADING_RE.search(line)
                or STATUS_BANNER_RE.search(line)
                or CURRENT_API_HEADING_RE.search(line)
                or SELECTED_API_HEADING_RE.search(line)
                or TRANSITIONAL_PHRASE_RE.search(line)
            ):
                issues.append(
                    Issue(
                        md,
                        f"Line {lineno}: avoid status-style or transitional editorial framing in published docs.",
                    )
                )
    return issues


def check_no_editorial_status_framing(config: SiteAuditConfig) -> list[Issue]:
    return check_no_editorial_status_framing_in_tree(config.docs_source)


def run_site_audit(config: SiteAuditConfig) -> int:
    if not config.docs_index.exists():
        print(config.missing_index_message, file=sys.stderr)
        return 2

    ids = load_ids(config.docs_index)
    issues: list[Issue] = []
    issues += check_index_files_exist(config)
    issues += check_p_links(config, ids)
    issues += check_doclike_links(config)
    issues += check_no_raw_viewer_refs(config)
    issues += check_no_raw_manpage_refs(config)
    issues += check_no_editorial_status_framing(config)

    if issues:
        for issue in issues[:200]:
            rel = issue.path.relative_to(config.repo_root)
            print(f"{rel}: {issue.message}", file=sys.stderr)
        if len(issues) > 200:
            print(f"... and {len(issues) - 200} more", file=sys.stderr)
        print(f"FAIL: {len(issues)} issues", file=sys.stderr)
        return 1

    print(config.success_message)
    return 0
