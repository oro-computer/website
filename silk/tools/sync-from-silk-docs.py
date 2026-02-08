#!/usr/bin/env python3

from __future__ import annotations

import argparse
import shutil
from dataclasses import dataclass
from pathlib import Path


EXCLUDE_BASENAMES = {
    "README.md",
    "PLAN.md",
    "STATUS.md",
    "llms.txt",
    "style-guide.md",
    "TEMPLATE.md",
    "_template-language.md",
    "_template-stdlib.md",
}


KEEP_DOCS_PREFIXES = (
    "guides/",
)


KEEP_DOCS_FILES = {
    # Website-owned landing/start.
    "start.md",
    # Website-owned, downstream-facing rewrites.
    "usage/cli-examples.md",
    "usage/howto-custom-stdlib-root.md",
    "usage/howto-run-wasi-node.md",
    "usage/editor-coc-nvim.md",
    "usage/editor-textmate.md",
    "usage/getting-started.md",
    # Website-owned tutorial rewrites (avoid repo-build steps).
    "usage/tutorials/01-first-program.md",
    "usage/tutorials/02-structs-and-impls.md",
    "usage/tutorials/03-arrays-and-slices.md",
    "usage/tutorials/04-filesystem.md",
    "usage/tutorials/05-concurrency.md",
    # Website-owned copy edits to avoid repo-internal wording/refs.
    "language/conventions.md",
    "language/grammar.md",
    "language/typed-errors.md",
    "spec/2026.md",
}


KEEP_WIKI_FILES = {
    # Website-owned wiki landing/start.
    "start.md",
}


@dataclass(frozen=True)
class SyncStats:
    copied: int = 0
    skipped: int = 0


def should_skip(rel: str, keep_files: set[str], keep_prefixes: tuple[str, ...]) -> bool:
    name = Path(rel).name
    if name in EXCLUDE_BASENAMES:
        return True
    if rel in keep_files:
        return True
    for prefix in keep_prefixes:
        if rel.startswith(prefix):
            return True
    return False


def sync_tree(src_root: Path, dst_root: Path, *, keep_files: set[str], keep_prefixes: tuple[str, ...]) -> SyncStats:
    copied = 0
    skipped = 0

    for path in sorted(src_root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in (".md", ".txt"):
            continue

        rel = path.relative_to(src_root).as_posix()
        if should_skip(rel, keep_files, keep_prefixes):
            skipped += 1
            continue

        dst = dst_root / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, dst)
        copied += 1

    return SyncStats(copied=copied, skipped=skipped)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync Silk docs/wiki from the repo (silk/docs) into the website copies (website/silk)."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=None,
        help="Path to repo root (auto-detected by default).",
    )
    args = parser.parse_args()

    repo_root = args.repo_root if args.repo_root else Path(__file__).resolve().parents[3]

    src_docs = repo_root / "silk" / "docs"
    src_wiki = src_docs / "wiki"

    dst_docs = repo_root / "website" / "silk" / "docs" / "source"
    dst_wiki = repo_root / "website" / "silk" / "wiki" / "source"

    if not src_docs.exists():
        raise SystemExit(f"Missing source docs at {src_docs}")

    # Docs: copy everything except wiki/ subtree.
    docs_stats = sync_tree(
        src_docs,
        dst_docs,
        keep_files=KEEP_DOCS_FILES,
        keep_prefixes=KEEP_DOCS_PREFIXES + ("wiki/",),
    )

    # Wiki: copy everything under docs/wiki into website wiki source.
    if src_wiki.exists():
        wiki_stats = sync_tree(
            src_wiki,
            dst_wiki,
            keep_files=KEEP_WIKI_FILES,
            keep_prefixes=(),
        )
    else:
        wiki_stats = SyncStats()

    print("Synced Silk docs to website:")
    print(f"- Docs copied:   {docs_stats.copied} (skipped: {docs_stats.skipped})")
    print(f"- Wiki copied:   {wiki_stats.copied} (skipped: {wiki_stats.skipped})")


if __name__ == "__main__":
    main()
