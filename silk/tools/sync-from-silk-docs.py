#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


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
    "usage/editor-ctags.md",
    "usage/editor-vim.md",
    "usage/editor-textmate.md",
    "usage/getting-started.md",
    "usage/github-linguist.md",
    # Website-owned tutorial rewrites (avoid repo-build steps).
    "usage/tutorials/01-first-program.md",
    "usage/tutorials/02-structs-and-impls.md",
    "usage/tutorials/03-arrays-and-slices.md",
    "usage/tutorials/04-filesystem.md",
    "usage/tutorials/05-concurrency.md",
    # Website-owned copy edits to avoid repo-internal wording/refs.
    "compiler/backend-wasm.md",
    "compiler/abi-libsilk.md",
    "compiler/cli-silk.md",
    "compiler/lsp-silk.md",
    "compiler/testing-strategy.md",
    "compiler/vendored-deps.md",
    "compiler/zig-api.md",
    "language/conventions.md",
    "language/cheat-sheet.md",
    "language/buffers.md",
    "language/flow-overview.md",
    "language/grammar.md",
    "language/memory-model.md",
    "language/packages-imports-exports.md",
    "language/syntax-tour.md",
    "language/typed-errors.md",
    "man/silk.1.md",
    "std/crypto.md",
    "std/json.md",
    "std/url.md",
    "std/uuid.md",
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


def sanitize_wiki_markdown(markdown: str) -> str:
    """
    The upstream Silk wiki is written for repo contributors and sometimes
    references internal tracker files (STATUS.md, PLAN.md) that don't exist (or
    aren't meaningful) on the public website.

    This function keeps the useful parts of those lines while removing the
    internal-only references.
    """

    out_lines: list[str] = []

    drop_whole_line = re.compile(
        r"^\s*[-*+]\s*(End-to-end support snapshot|Implemented-subset notes)\s*:\s*`?(STATUS|PLAN)\.md`?\s*$",
        flags=re.I,
    )

    in_code = False

    for raw in markdown.splitlines():
        trimmed = raw.lstrip()
        if trimmed.startswith("```"):
            in_code = not in_code
            out_lines.append(raw.rstrip())
            continue

        if in_code:
            # Never rewrite inside fenced code blocks; preserve indentation and
            # exact spelling.
            out_lines.append(raw.rstrip())
            continue

        line = raw

        if drop_whole_line.match(line):
            continue

        # Rewrite a few common wiki-only phrasings.
        line = re.sub(r"^(\s*[-*+]\s+)Relevant fixtures:\s*", r"\1Fixtures: ", line, flags=re.I)
        line = re.sub(
            r"^\s*Status:\s*implemented for the current front-end \+\s*native backend subset\.\s*$",
            "Implemented in the reference compiler (front-end + native backend subset).",
            line,
            flags=re.I,
        )

        # Remove internal tracker refs while preserving surrounding prose.
        for basename in ("STATUS.md", "PLAN.md"):
            # Common: "... and `STATUS.md`"
            line = re.sub(rf"\s+(?:and|&)\s+`?{re.escape(basename)}`?\s*$", "", line, flags=re.I)
            # Strip any remaining mention.
            line = re.sub(rf"`?{re.escape(basename)}`?", "", line, flags=re.I)

        # If we removed a reference, clean up dangling conjunctions.
        line = re.sub(r"\s+(?:and|&)\s*$", "", line, flags=re.I)

        # Tidy up extra spaces introduced by stripping (but preserve indentation).
        leading = re.match(r"^\s*", line).group(0)
        body = line[len(leading) :]
        body = re.sub(r"[ \t]{2,}", " ", body)
        line = (leading + body).rstrip()

        # Drop empty bullets like "- Details:" after stripping.
        if re.match(r"^\s*[-*+]\s*[^A-Za-z0-9`]*\s*$", line):
            continue

        out_lines.append(line)

    return "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")


def sanitize_docs_markdown(markdown: str) -> str:
    """
    The upstream Silk docs are written for the Silk compiler repository and may
    use ambiguous phrasing like "this repository" or project-internal jargon
    like "repo dependency workflow". When we sync into the website, we rewrite
    a few phrases to be clearer to downstream readers.
    """

    def rewrite_outside_inline_code(text: str) -> str:
        out = text

        # Make references explicit.
        out = re.sub(r"\bThe repository\b", "The Silk compiler repository", out)
        out = re.sub(r"\bthe repository\b", "the Silk compiler repository", out)
        out = re.sub(r"\bThis repository\b", "The Silk compiler repository", out)
        out = re.sub(r"\bthis repository\b", "the Silk compiler repository", out)

        # Prefer a clearer name for the dependency build flow.
        out = re.sub(
            r"\brepo dependency workflow\b",
            "Silk compiler repository’s vendored dependency workflow",
            out,
            flags=re.I,
        )

        return out

    out_lines: list[str] = []
    in_code = False

    for raw in markdown.splitlines():
        trimmed = raw.lstrip()
        if trimmed.startswith("```"):
            in_code = not in_code
            out_lines.append(raw.rstrip())
            continue

        if in_code:
            out_lines.append(raw.rstrip())
            continue

        # Preserve inline-code spans (single-backtick) while rewriting prose.
        parts = raw.split("`")
        for i in range(0, len(parts), 2):
            parts[i] = rewrite_outside_inline_code(parts[i])
        out_lines.append("`".join(parts).rstrip())

    return "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")


def sync_tree(
    src_root: Path,
    dst_root: Path,
    *,
    keep_files: set[str],
    keep_prefixes: tuple[str, ...],
    sanitize: Callable[[str], str] | None = None,
) -> SyncStats:
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

        if sanitize and path.suffix == ".md":
            dst.write_text(sanitize(path.read_text(encoding="utf-8")), encoding="utf-8")
        else:
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
        sanitize=sanitize_docs_markdown,
    )

    # Wiki: copy everything under docs/wiki into website wiki source.
    if src_wiki.exists():
        wiki_stats = sync_tree(
            src_wiki,
            dst_wiki,
            keep_files=KEEP_WIKI_FILES,
            keep_prefixes=(),
            sanitize=sanitize_wiki_markdown,
        )
    else:
        wiki_stats = SyncStats()

    print("Synced Silk docs to website:")
    print(f"- Docs copied:   {docs_stats.copied} (skipped: {docs_stats.skipped})")
    print(f"- Wiki copied:   {wiki_stats.copied} (skipped: {wiki_stats.skipped})")


if __name__ == "__main__":
    main()
