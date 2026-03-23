#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


RUNTIME_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = RUNTIME_ROOT.parent

DOCS_SOURCE = RUNTIME_ROOT / "docs" / "source"
DOCS_INDEX = RUNTIME_ROOT / "docs" / "index.json"


P_LINK_RE = re.compile(r"\?p=(?P<id>[a-zA-Z0-9_./-]+)")
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
RAW_VIEWER_REF_RE = re.compile(r"(?<!\]\()(?<!\()(?<!/)\?p=[a-zA-Z0-9_./-]+")
RAW_MANPAGE_REF_RE = re.compile(r"(?<!\[)`[A-Za-z0-9_:+.-]+` \(([137])\)")

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#")


@dataclass(frozen=True)
class Issue:
    path: Path
    message: str


def load_ids(index_path: Path) -> set[str]:
    data = json.loads(index_path.read_text(encoding="utf-8"))
    ids: set[str] = set()
    for sec in data.get("sections", []):
        for it in sec.get("items", []):
            ids.add(it["id"])
    return ids


def load_index_files(index_path: Path) -> list[str]:
    data = json.loads(index_path.read_text(encoding="utf-8"))
    files: list[str] = []
    for sec in data.get("sections", []):
        for it in sec.get("items", []):
            files.append(it["file"])
    return files


def normalize_rel_path(input_path: str) -> str | None:
    if not input_path:
        return None
    p = str(input_path).strip()
    p = p.replace("\\", "/")
    p = p.removeprefix("./")
    p = p.lstrip("/")
    parts: list[str] = []
    for raw in p.split("/"):
        part = raw.strip()
        if not part or part == ".":
            continue
        if part == "..":
            if not parts:
                return None
            parts.pop()
            continue
        parts.append(part)
    out = "/".join(parts)
    if not out or "\0" in out:
        return None
    return out


def resolve_doclike_target(href: str, current_file: Path) -> Path | None:
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

    looks_like_doc = (
        raw.endswith(".md")
        or raw.endswith(".txt")
        or raw.startswith("docs/")
    )
    if not looks_like_doc:
        return None

    if raw.startswith("docs/"):
        rel = normalize_rel_path(raw.removeprefix("docs/"))
        return (DOCS_SOURCE / rel) if rel else None

    rel = normalize_rel_path(raw)
    if not rel:
        return None

    resolved = (current_file.parent / rel).resolve()
    try:
        resolved.relative_to(REPO_ROOT)
    except ValueError:
        return None
    return resolved


def iter_auditable_lines(md: Path) -> list[tuple[int, str]]:
    text = md.read_text(encoding="utf-8")
    out: list[tuple[int, str]] = []
    in_fence = False
    for lineno, line in enumerate(text.splitlines(), start=1):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if stripped.startswith("#"):
            continue
        out.append((lineno, line))
    return out


def check_index_files_exist() -> list[Issue]:
    issues: list[Issue] = []
    for f in load_index_files(DOCS_INDEX):
        p = DOCS_SOURCE / f
        if not p.exists():
            issues.append(Issue(DOCS_INDEX, f"Index refers to missing file: {f}"))
    return issues


def check_p_links(ids: set[str]) -> list[Issue]:
    issues: list[Issue] = []
    for md in DOCS_SOURCE.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        for m in P_LINK_RE.finditer(text):
            target_id = m.group("id")
            if target_id not in ids:
                issues.append(Issue(md, f"Broken ?p= link: {target_id}"))
    return issues


def check_doclike_links() -> list[Issue]:
    issues: list[Issue] = []
    for md in DOCS_SOURCE.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        for m in MD_LINK_RE.finditer(text):
            href = m.group(1)
            target = resolve_doclike_target(href, md)
            if not target:
                continue
            if not target.exists():
                try:
                    rel = target.relative_to(REPO_ROOT)
                except ValueError:
                    rel = target
                issues.append(Issue(md, f"Missing link target: {href} -> {rel}"))
    return issues


def check_no_raw_viewer_refs() -> list[Issue]:
    issues: list[Issue] = []
    for md in DOCS_SOURCE.rglob("*.md"):
        for lineno, line in iter_auditable_lines(md):
            if RAW_VIEWER_REF_RE.search(line):
                issues.append(Issue(md, f"Line {lineno}: raw ?p= reference must be a markdown link."))
    return issues


def check_no_raw_manpage_refs() -> list[Issue]:
    issues: list[Issue] = []
    for md in DOCS_SOURCE.rglob("*.md"):
        for lineno, line in iter_auditable_lines(md):
            if RAW_MANPAGE_REF_RE.search(line):
                issues.append(Issue(md, f"Line {lineno}: raw manpage reference must be a markdown link."))
    return issues


def main() -> int:
    if not DOCS_INDEX.exists():
        print("Missing Runtime docs/index.json; run build scripts first.", file=sys.stderr)
        return 2

    ids = load_ids(DOCS_INDEX)
    issues: list[Issue] = []
    issues += check_index_files_exist()
    issues += check_p_links(ids)
    issues += check_doclike_links()
    issues += check_no_raw_viewer_refs()
    issues += check_no_raw_manpage_refs()

    if issues:
        for iss in issues[:200]:
            rel = iss.path.relative_to(REPO_ROOT)
            print(f"{rel}: {iss.message}", file=sys.stderr)
        if len(issues) > 200:
            print(f"... and {len(issues) - 200} more", file=sys.stderr)
        print(f"FAIL: {len(issues)} issues", file=sys.stderr)
        return 1

    print("OK: runtime site audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
