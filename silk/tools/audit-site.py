#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


SILK_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = SILK_ROOT.parent

DOCS_SOURCE = SILK_ROOT / "docs" / "source"
WIKI_SOURCE = SILK_ROOT / "wiki" / "source"

DOCS_INDEX = SILK_ROOT / "docs" / "index.json"
WIKI_INDEX = SILK_ROOT / "wiki" / "index.json"


P_LINK_RE = re.compile(r"(?:(?P<kind>docs|wiki)/)?\?p=(?P<id>[a-zA-Z0-9_./-]+)")
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")

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

    # Ignore viewer links.
    if raw.startswith("?p=") or raw.startswith("/?p=") or "&p=" in raw:
        return None

    # Strip fragment/query.
    raw = raw.split("#", 1)[0].split("?", 1)[0].strip()
    if not raw:
        return None

    looks_like_doc = (
        raw.endswith(".md")
        or raw.endswith(".txt")
        or raw.startswith("docs/")
        or raw.startswith("wiki/")
        or raw.startswith("spec/")
    )
    if not looks_like_doc:
        return None

    if raw.startswith("docs/"):
        rel = normalize_rel_path(raw.removeprefix("docs/"))
        return (DOCS_SOURCE / rel) if rel else None
    if raw.startswith("wiki/"):
        rel = normalize_rel_path(raw.removeprefix("wiki/"))
        return (WIKI_SOURCE / rel) if rel else None
    if raw.startswith("spec/"):
        rel = normalize_rel_path(raw.removeprefix("spec/"))
        return (DOCS_SOURCE / "spec" / rel) if rel else None

    rel = normalize_rel_path(raw)
    if not rel:
        return None

    # Relative file reference.
    resolved = (current_file.parent / rel).resolve()
    try:
        resolved.relative_to(REPO_ROOT)
    except ValueError:
        return None
    return resolved


def check_index_files_exist(index_path: Path, source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for f in load_index_files(index_path):
        p = source_root / f
        if not p.exists():
            issues.append(Issue(index_path, f"Index refers to missing file: {f}"))
    return issues


def check_p_links(source_root: Path, current_kind: str, docs_ids: set[str], wiki_ids: set[str]) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        for m in P_LINK_RE.finditer(text):
            target_kind = m.group("kind") or current_kind
            target_id = m.group("id")
            ids = docs_ids if target_kind == "docs" else wiki_ids
            if target_id not in ids:
                issues.append(Issue(md, f"Broken ?p= link: {target_kind}/{target_id}"))
    return issues


def check_doclike_links(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    for md in source_root.rglob("*.md"):
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


def check_no_arena_identifiers(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    banned = re.compile(
        r"\bconst\s+region\s+arena\b"
        r"|\bexport\s+const\s+region\s+arena\b"
        r"|\bwith\s+arena\b\s*\{"
        r"|\bfrom\s+arena\b"
        r"|\bglobal_arena\b",
        flags=re.I,
    )
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        if banned.search(text):
            issues.append(Issue(md, "Found arena identifier in examples (use regions + neutral names)."))
    return issues


def check_no_works_today_labels(source_root: Path) -> list[Issue]:
    issues: list[Issue] = []
    banned = re.compile(
        r"\bWorks today\b|\bWhat works today\b|\(Works today\)|Syntax\s*\(Selected\)",
        flags=re.I,
    )
    for md in source_root.rglob("*.md"):
        text = md.read_text(encoding="utf-8")
        if banned.search(text):
            issues.append(Issue(md, "Found deprecated 'Works today' / 'Syntax (Selected)' labeling."))
    return issues


def check_spec_has_no_repo_internal_paths(spec_path: Path) -> list[Issue]:
    """
    The public spec should not cite internal implementation file paths or
    test harness directories (these frequently drift and are not meaningful to
    downstream users).
    """

    issues: list[Issue] = []
    if not spec_path.exists():
        return issues

    text = spec_path.read_text(encoding="utf-8")
    banned = re.compile(
        r"\bchecker\.[A-Za-z0-9_]+\b"
        r"|\bsrc/[A-Za-z0-9_./-]+"
        r"|\bc-tests/"
        r"|\btests/silk/",
        flags=re.I,
    )
    if banned.search(text):
        issues.append(Issue(spec_path, "Spec contains repo-internal paths/names (remove or generalize)."))
    return issues


def main() -> int:
    if not DOCS_INDEX.exists() or not WIKI_INDEX.exists():
        print("Missing Silk index.json files; run build scripts first.", file=sys.stderr)
        return 2

    docs_ids = load_ids(DOCS_INDEX)
    wiki_ids = load_ids(WIKI_INDEX)

    issues: list[Issue] = []
    issues += check_index_files_exist(DOCS_INDEX, DOCS_SOURCE)
    issues += check_index_files_exist(WIKI_INDEX, WIKI_SOURCE)
    issues += check_p_links(DOCS_SOURCE, "docs", docs_ids, wiki_ids)
    issues += check_p_links(WIKI_SOURCE, "wiki", docs_ids, wiki_ids)
    issues += check_doclike_links(DOCS_SOURCE)
    issues += check_doclike_links(WIKI_SOURCE)
    issues += check_no_arena_identifiers(DOCS_SOURCE)
    issues += check_no_arena_identifiers(WIKI_SOURCE)
    issues += check_no_works_today_labels(DOCS_SOURCE)
    issues += check_no_works_today_labels(WIKI_SOURCE)
    issues += check_spec_has_no_repo_internal_paths(DOCS_SOURCE / "spec" / "2026.md")

    if issues:
        for iss in issues[:200]:
            rel = iss.path.relative_to(REPO_ROOT)
            print(f"{rel}: {iss.message}", file=sys.stderr)
        if len(issues) > 200:
            print(f"... and {len(issues) - 200} more", file=sys.stderr)
        print(f"FAIL: {len(issues)} issues", file=sys.stderr)
        return 1

    print("OK: silk site audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
