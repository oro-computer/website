#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path


SILK_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = SILK_ROOT.parent

DOCS_SOURCE = SILK_ROOT / "docs" / "source"
WIKI_SOURCE = SILK_ROOT / "wiki" / "source"

DOCS_INDEX = SILK_ROOT / "docs" / "index.json"
WIKI_INDEX = SILK_ROOT / "wiki" / "index.json"

sys.path.insert(0, str(REPO_ROOT / "tools"))

from site_audit_common import (
    Issue,
    check_doclike_links_in_tree,
    check_index_files_exist_at,
    check_no_editorial_status_framing_in_tree,
    check_no_raw_manpage_refs_in_tree,
    check_no_raw_viewer_refs_in_tree,
    check_p_links_in_tree,
    load_ids,
)


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
    ids_by_kind = {"docs": docs_ids, "wiki": wiki_ids}
    source_roots = {
        "docs": DOCS_SOURCE,
        "wiki": WIKI_SOURCE,
        "spec": DOCS_SOURCE / "spec",
    }

    issues: list[Issue] = []
    issues += check_index_files_exist_at(DOCS_INDEX, DOCS_SOURCE)
    issues += check_index_files_exist_at(WIKI_INDEX, WIKI_SOURCE)
    issues += check_p_links_in_tree(DOCS_SOURCE, "docs", ids_by_kind, include_kind_in_message=True)
    issues += check_p_links_in_tree(WIKI_SOURCE, "wiki", ids_by_kind, include_kind_in_message=True)
    issues += check_doclike_links_in_tree(DOCS_SOURCE, REPO_ROOT, source_roots)
    issues += check_doclike_links_in_tree(WIKI_SOURCE, REPO_ROOT, source_roots)
    issues += check_no_arena_identifiers(DOCS_SOURCE)
    issues += check_no_arena_identifiers(WIKI_SOURCE)
    issues += check_no_works_today_labels(DOCS_SOURCE)
    issues += check_no_works_today_labels(WIKI_SOURCE)
    issues += check_no_raw_viewer_refs_in_tree(DOCS_SOURCE)
    issues += check_no_raw_viewer_refs_in_tree(WIKI_SOURCE)
    issues += check_no_raw_manpage_refs_in_tree(DOCS_SOURCE)
    issues += check_no_raw_manpage_refs_in_tree(WIKI_SOURCE)
    issues += check_no_editorial_status_framing_in_tree(DOCS_SOURCE)
    issues += check_no_editorial_status_framing_in_tree(WIKI_SOURCE)
    issues += check_spec_has_no_repo_internal_paths(DOCS_SOURCE / "spec" / "2026.md")

    if issues:
        for issue in issues[:200]:
            rel = issue.path.relative_to(REPO_ROOT)
            print(f"{rel}: {issue.message}", file=sys.stderr)
        if len(issues) > 200:
            print(f"... and {len(issues) - 200} more", file=sys.stderr)
        print(f"FAIL: {len(issues)} issues", file=sys.stderr)
        return 1

    print("OK: silk site audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
