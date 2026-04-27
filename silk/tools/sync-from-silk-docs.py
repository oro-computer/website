#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


EXCLUDE_BASENAMES = {
    # Arenas were removed from the user-facing surface; use regions instead.
    "arenas.md",
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
    "compiler/implementation-status.md",
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
    "usage/tutorials/06-async-io-streams-abort.md",
    "usage/tutorials/07-formal-silk.md",
    # Website-owned copy edits to avoid repo-internal wording/refs.
    "compiler/backend-wasm.md",
    "compiler/testing-strategy.md",
    "compiler/libsilk-quickstart.md",
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
    deleted: int = 0


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


def normalize_region_identifiers(markdown: str) -> str:
    out = markdown
    replacements = (
        (r"\bexport const region global_arena\b", "export const region global_region_buf"),
        (r"\bconst region arena\b", "const region region_buf"),
        (r"\bwith arena\b", "with region_buf"),
        (r"\bfrom arena\b", "from region_buf"),
        (r"\bglobal_arena\b", "global_region_buf"),
        (r"\barena\[", "region_buf["),
        (r"`arena`", "`region_buf`"),
        (r"`global_arena`", "`global_region_buf`"),
    )
    for pattern, replacement in replacements:
        out = re.sub(pattern, replacement, out)
    return out


def normalize_shared_markdown(markdown: str) -> str:
    markdown = markdown.replace("https://oro.computer/silk/docs/?p=", "?p=")
    markdown = markdown.replace("https://oro.computer/silk/wiki/?p=", "wiki/?p=")
    markdown = markdown.replace("?p=docs/", "?p=")
    markdown = markdown.replace("docs/?p=", "?p=")
    markdown = markdown.replace("?p=wiki/", "wiki/?p=")

    markdown = re.sub(r"(?m)^(\s*#{2,6}\s+)Syntax\s+\(Selected\)\s*$", r"\1Syntax", markdown)
    markdown = re.sub(
        r"(?m)^(\s*#{2,6}\s+)(Example|Examples)\s+\(Works today\)(?::\s*(.+))?\s*$",
        lambda m: f"{m.group(1)}{m.group(2)}" + (f": {m.group(3)}" if m.group(3) else ""),
        markdown,
    )
    markdown = re.sub(
        r"(?m)^(\s*#{2,6}\s+)Works today(?::\s*(.+))?\s*$",
        lambda m: f"{m.group(1)}Example" + (f": {m.group(2)}" if m.group(2) else ""),
        markdown,
    )
    markdown = re.sub(
        r"(?m)^(\s*#{2,6}\s+)What works today(?:\s*\([^)]*\))?\s*$",
        r"\1Current subset",
        markdown,
    )
    markdown = re.sub(r"(?m)^Works today\b", "Current subset", markdown)
    markdown = markdown.replace("examples labeled “Works today”", "examples labeled “Example”")
    markdown = normalize_region_identifiers(markdown)
    return markdown


def normalize_user_facing_links(markdown: str) -> str:
    def link_label(target: str) -> str:
        stem = target.rsplit("/", 1)[-1]
        return stem.replace("-", " ").replace("_", " ")

    def doc_link_target(target: str) -> str | None:
        target = target.removesuffix(".md")
        for prefix in ("docs/", "wiki/"):
            if target.startswith(prefix):
                target = target[len(prefix):]
        target = {
            "std/runtime-event-loop": "std/runtime",
        }.get(target, target)
        if target in {"std/foo", "std/foo-bar", "man/my-app.7"}:
            return None
        return target

    def normalize_line(line: str) -> str:
        line = re.sub(r"`?\?p=\.\.\.`?", "docs links", line)
        line = re.sub(
            r"`\?p=(?P<target>[a-zA-Z0-9_./-]+)`",
            lambda m: f"[{link_label(m.group('target'))}](?p={m.group('target')})",
            line,
        )

        def replace_raw_viewer_ref(match: re.Match[str]) -> str:
            prefix = match.group("prefix") or ""
            target = doc_link_target(match.group("target"))
            if prefix == "[" or target is None:
                return match.group(0)
            return f"{prefix}[{link_label(target)}](?p={target})"

        line = re.sub(
            r"(?P<prefix>^|[\s:;,(])(?<!\]\()(?<!/)\?p=(?P<target>[a-zA-Z0-9_./-]+)",
            replace_raw_viewer_ref,
            line,
        )

        def replace_man_ref(match: re.Match[str]) -> str:
            prefix = match.group("prefix") or ""
            name = match.group("name")
            section = match.group("section")
            return f"{prefix}[`{name}({section})`](?p=man/{name}.{section})"

        line = re.sub(
            r"(?P<prefix>^|[\s:;,(])(?<!\[)`(?P<name>[A-Za-z0-9_:+.-]+)`\s+\((?P<section>[137])\)",
            replace_man_ref,
            line,
        )

        def replace_markdown_docs_link(match: re.Match[str]) -> str:
            target = doc_link_target(match.group("target"))
            if target is None:
                return match.group(0)
            return f"[{link_label(target)}](?p={target})"

        line = re.sub(
            r"\[`?docs/(?P<target>[a-zA-Z0-9_./-]+\.md)`?\]\([^)]+\)",
            replace_markdown_docs_link,
            line,
        )

        def replace_docs_path(match: re.Match[str]) -> str:
            prefix = match.group("prefix") or ""
            target = doc_link_target(match.group("target"))
            if target is None:
                return match.group(0)
            return f"{prefix}[{link_label(target)}](?p={target})"

        line = re.sub(
            r"(?P<prefix>^|[\s:;,(])`?docs/(?P<target>[a-zA-Z0-9_./-]+\.md)`?",
            replace_docs_path,
            line,
        )
        return line

    out_lines: list[str] = []
    in_code = False
    for raw in markdown.splitlines():
        stripped = raw.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            out_lines.append(raw.rstrip())
            continue
        out_lines.append(raw.rstrip() if in_code else normalize_line(raw.rstrip()))
    return "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")


def normalize_editorial_framing(markdown: str) -> str:
    replacements = (
        (r"\bStatus:\s*\*\*([^*]+)\*\*\.\s*", ""),
        (r"\bStatus:\s*\*\*([^*]+)\*\*\s*", ""),
        (r"\bStatus:\s*", ""),
        (r"\bImplementation status\s*\([^)]*\)\s*:\s*", ""),
        (r"\bImplementation status\s*:\s*", ""),
        (r"Returning readers typically want the “Implementation Status” section near the top", "Returning readers typically want the notes near the top"),
        (r"see “Implementation Status” below", "see the notes below"),
        (r"Implementation Status” sections", "notes sections"),
        (r"\bCurrent supported contexts include\b", "Supported contexts include"),
        (r"\bcurrent supported\b", "supported"),
        (r"\bCurrent compiler subset restriction\b", "Restriction"),
        (r"\bthe current compiler subset\b", "Silk currently"),
        (r"\bThe current compiler subset\b", "Silk currently"),
        (r"\bcurrent compiler subset\b", "current implementation"),
        (r"\bCurrent subset\b", "Supported forms"),
        (r"\bcurrent subset\b", "supported forms"),
        (r"\bInitial implementation target\b", "Implementation target"),
        (r"\binitial implementation target\b", "implementation target"),
        (r"\binitial implementation\b", "implementation"),
        (r"\bInitial implementation\b", "Implementation"),
        (r"\bImplemented-subset notes\b", "Notes"),
        (r"\bImplemented-subset details\b", "Reference details"),
        (r"\bImplemented-subset\b", "Reference"),
        (r"\bImplemented subset notes\b", "Notes"),
        (r"\bimplemented subset notes\b", "notes"),
        (r"\bImplemented subset\b", "Supported forms"),
        (r"\bimplemented subset\b", "supported forms"),
        (r"\bImplemented Subset\b", "Supported Forms"),
        (r"\bInitial Implemented Subset\b", "Supported Forms"),
        (r"\bCurrent Implemented Subset\b", "Supported Forms"),
        (r"\bexamples that exercise the supported forms\b", "examples"),
        (r"\bExamples that exercise the supported forms\b", "Examples"),
        (r"\bactive expansion\b", "current module surface"),
        (r"\bPartially implemented\b", "Implemented"),
        (r"\bpartially implemented\b", "implemented"),
        (r"\bin progress\b", "available"),
        (r"\bIn progress\b", "Available"),
    )

    out_lines: list[str] = []
    in_code = False
    for raw in markdown.splitlines():
        stripped = raw.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            out_lines.append(raw.rstrip())
            continue
        if in_code:
            out_lines.append(raw.rstrip())
            continue

        line = raw
        heading = re.match(r"^(?P<prefix>\s*#{1,6}\s+)(?P<title>.+?)\s*$", line)
        if heading:
            title = heading.group("title").strip()
            title = re.sub(
                r"\s+\((?:Initial\s+)?(?:Current\s+)?(?:Implemented|supported|compiler|initial|selected|planned|current|implementation status)[^)]*\)",
                "",
                title,
                flags=re.I,
            )
            title = re.sub(r"\s+\(Planned[^)]*\)", "", title, flags=re.I)
            if re.fullmatch(r"Status(?:\s*\([^)]*\))?|Implementation Status(?:\s*\([^)]*\))?|Status and Future Work|Future Work|Follow-ups", title, flags=re.I):
                title = "Notes"
            elif re.fullmatch(r"Notes and Limitations", title, flags=re.I):
                title = "Considerations"
            elif re.fullmatch(r"Current API(?:\s*\([^)]*\))?|Implemented API|Public API|API\s*\([^)]*\)|API\s*\(current\)", title, flags=re.I):
                title = "Exported API"
            elif re.fullmatch(r"Current Implemented Subset|Implemented Subset|Implemented subset", title, flags=re.I):
                title = "Notes"
            title = re.sub(r"\s{2,}", " ", title).strip()
            line = f"{heading.group('prefix')}{title}"

        for pattern, replacement in replacements:
            line = re.sub(pattern, replacement, line, flags=re.I)
        line = re.sub(r"\s{2,}", " ", line).rstrip()
        out_lines.append(line)

    return "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")


def normalize_trailing_newlines(markdown: str) -> str:
    return markdown.rstrip() + "\n"


def normalize_headings_for_context(path: Path, markdown: str) -> str:
    markdown = markdown.replace("`docs/language/mutability.md`", "the mutability docs")
    markdown = markdown.replace("`docs/language/literals-duration.md`", "the duration literal docs")
    markdown = markdown.replace("?p=std/runtime-event-loop", "?p=std/runtime")

    if "/wiki/source/" in path.as_posix():
        markdown = re.sub(r"\]\(\?p=(compiler|man|usage|guides)/", r"](../docs/?p=\1/", markdown)

    if path.parent.name == "std":
        markdown = re.sub(r"(?m)^## API$", "## Exported API", markdown)
        markdown = re.sub(r"(?m)^## High-Level API$", "## Exported API", markdown)
        markdown = re.sub(r"(?m)^## Intended Surface$", "## Exported API", markdown)
        markdown = re.sub(r"(?m)^## Current Surface$", "## Exported API", markdown)
        markdown = re.sub(r"(?m)^## Current Grammar Coverage$", "## Grammar coverage", markdown)
        markdown = re.sub(r"(?m)^## Goals$", "## Design goals", markdown)
        markdown = re.sub(r"(?m)^## Design Goals$", "## Design goals", markdown)
        markdown = re.sub(r"(?m)^## Important Limitations$", "## Considerations", markdown)
        markdown = re.sub(r"(?m)^## Remaining Follow-Ups$", "## Considerations", markdown)
        markdown = re.sub(r"(?m)^## Implemented (`std::interfaces` surface)$", r"## \1", markdown)
        markdown = markdown.replace("current API surface", "exported API surface")
        markdown = markdown.replace("API surface (current):", "API surface:")
        markdown = move_section_to_end(markdown, "Design goals")

    if path.parent.name == "language":
        markdown = re.sub(r"(?m)^## Goals$", "## Semantics", markdown)
        markdown = re.sub(r"(?m)^## Design Goals$", "## Model", markdown)
        markdown = re.sub(r"(?m)^### Important Limitations$", "### Considerations", markdown)

        if path.name == "flow-for.md":
            markdown = markdown.replace(
                "element.\n\n: integer range iteration",
                "element.\n\nSupported forms include integer range iteration",
            )
            markdown = re.sub(
                r"\n## Semantics\n\n- Provide a readable, structured loop construct for iteration\.\n- Avoid .+? hidden allocation\.\n\n## Surface Syntax",
                "\n## Surface Syntax",
                markdown,
                flags=re.S,
            )

    return markdown


def sanitize_wiki_markdown(rel: str, markdown: str) -> str:
    """
    The upstream Silk wiki is written for repo contributors and sometimes
    references internal tracker files (STATUS.md, PLAN.md) that don't exist (or
    aren't meaningful) on the public website.

    This function keeps the useful parts of those lines while removing the
    internal-only references.
    """

    markdown = normalize_shared_markdown(markdown)

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

    cleaned = "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")
    cleaned = normalize_editorial_framing(cleaned)
    cleaned = normalize_user_facing_links(cleaned)
    return normalize_trailing_newlines(cleaned)


def sanitize_docs_markdown(rel: str, markdown: str) -> str:
    """
    The upstream Silk docs are written for the Silk compiler repository and may
    use ambiguous phrasing like "this repository" or project-internal jargon
    like "repo dependency workflow". When we sync into the website, we rewrite
    a few phrases to be clearer to downstream readers.
    """

    def drop_named_section(md: str, heading: str) -> str:
        target = heading.strip().lower()
        out_lines: list[str] = []
        in_code = False
        skip_level: int | None = None

        for raw in md.splitlines():
            trimmed = raw.lstrip()
            if trimmed.startswith("```"):
                in_code = not in_code
                if skip_level is None:
                    out_lines.append(raw.rstrip())
                continue

            if not in_code and skip_level is not None:
                heading_match = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw)
                if not heading_match:
                    continue
                level = len(heading_match.group(1))
                if level > skip_level:
                    continue
                skip_level = None

            if not in_code:
                heading_match = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw)
                if heading_match and heading_match.group(2).strip().lower() == target:
                    skip_level = len(heading_match.group(1))
                    continue

            if skip_level is None:
                out_lines.append(raw.rstrip())

        return "\n".join(out_lines) + ("\n" if md.endswith("\n") else "")

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
        out = re.sub(r"\bwhat works today\b", "current implementation notes", out, flags=re.I)

        return out

    def sanitize_std_markdown(text: str) -> str:
        out = text
        out = re.sub(r"(?m)^Status:\s*\*\*[^*]+\*\*\.\s*", "", out)
        out = re.sub(r"(?m)^Status:\s*\*\*[^*]+\*\*\.\s*$", "", out)
        out = re.sub(r"(?m)^##\s+Current API\s*$", "## Exported API", out)
        out = re.sub(r"(?m)^##\s+Implemented API\s*$", "## Exported API", out)
        out = re.sub(r"(?m)^##\s+Public API\s*$", "## Exported API", out)
        out = re.sub(
            r"(?m)^##\s+(Future Work|Future work|Follow-ups|Current Limitations|Notes and Limitations)\s*$",
            "## Considerations",
            out,
        )
        out = re.sub(r"(?m)^##\s+Current Scope\s*$", "## Considerations", out)
        out = re.sub(r"(?m)^##\s+(.+?)\s+\((?:Initial Design|MVP|Current)\)\s*$", r"## \1", out)
        out = re.sub(r"active expansion", "current module surface", out, flags=re.I)
        out = re.sub(r"current snapshot", "current implementation", out, flags=re.I)
        out = re.sub(r"Partially implemented", "Implemented", out, flags=re.I)
        out = re.sub(r"initial std wrapper", "stdlib wrapper", out, flags=re.I)
        out = re.sub(r"\bMVP\b", "baseline", out)
        return out

    def sanitize_spec_markdown(text: str) -> str:
        out = drop_named_section(text, "Silk Proposal Process (TC39-Inspired)")
        out = out.replace("// Works today", "// Supported")
        out = out.replace("checker.checkModuleSetWithImports", "the module-set import helper")
        out = re.sub(
            r"CLI output:\s*`+silk` CLI`?\s+and\s+`+silk`\s+\(1\)\s+—\s+Silk Language Compiler`?\s+\(`silk --version`\)",
            "CLI output: the `silk` CLI and [`silk(1)`](?p=man/silk.1) (`silk --version`)",
            out,
        )
        return out

    markdown = normalize_shared_markdown(markdown)
    markdown = drop_named_section(markdown, "Arenas")
    markdown = drop_named_section(markdown, "Tests")
    if rel.startswith("std/"):
        markdown = sanitize_std_markdown(markdown)
    if rel == "spec/2026.md":
        markdown = sanitize_spec_markdown(markdown)

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

    cleaned = "\n".join(out_lines) + ("\n" if markdown.endswith("\n") else "")
    cleaned = normalize_editorial_framing(cleaned)
    cleaned = normalize_user_facing_links(cleaned)
    return normalize_trailing_newlines(cleaned)



def move_section_to_end(markdown: str, heading: str) -> str:
    lines = markdown.splitlines()
    section: list[str] = []
    out: list[str] = []
    in_code = False
    capture = False
    capture_level = 0

    for raw in lines:
        stripped = raw.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code

        if not in_code:
            m = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw)
            if m:
                level = len(m.group(1))
                title = m.group(2).strip()
                if capture and level <= capture_level:
                    capture = False
                if not capture and title.lower() == heading.lower():
                    capture = True
                    capture_level = level

        if capture:
            section.append(raw.rstrip())
        else:
            out.append(raw.rstrip())

    if not section:
        return markdown
    while out and not out[-1].strip():
        out.pop()
    while section and not section[-1].strip():
        section.pop()
    return "\n".join(out + ["", *section]) + "\n"


def postprocess_tree(root: Path) -> None:
    for path in sorted(root.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        next_text = normalize_editorial_framing(text)
        next_text = normalize_user_facing_links(next_text)
        next_text = normalize_headings_for_context(path, next_text)
        next_text = normalize_trailing_newlines(next_text)
        if next_text != text:
            path.write_text(next_text, encoding="utf-8")


def sync_tree(
    src_root: Path,
    dst_root: Path,
    *,
    keep_files: set[str],
    keep_prefixes: tuple[str, ...],
    sanitize: Callable[[str, str], str] | None = None,
) -> SyncStats:
    copied: set[str] = set()
    skipped = 0
    deleted = 0

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
            dst.write_text(sanitize(rel, path.read_text(encoding="utf-8")), encoding="utf-8")
        else:
            shutil.copyfile(path, dst)
        copied.add(rel)

    # Prune any previously-synced files that no longer exist upstream.
    for path in sorted(dst_root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in (".md", ".txt"):
            continue

        if path.name in EXCLUDE_BASENAMES:
            path.unlink()
            deleted += 1
            continue

        rel = path.relative_to(dst_root).as_posix()
        if should_skip(rel, keep_files, keep_prefixes):
            continue
        if rel in copied:
            continue
        path.unlink()
        deleted += 1

    return SyncStats(copied=len(copied), skipped=skipped, deleted=deleted)


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

    postprocess_tree(dst_docs)
    postprocess_tree(dst_wiki)

    print("Synced Silk docs to website:")
    print(
        f"- Docs copied:   {docs_stats.copied} (skipped: {docs_stats.skipped}, deleted: {docs_stats.deleted})"
    )
    print(
        f"- Wiki copied:   {wiki_stats.copied} (skipped: {wiki_stats.skipped}, deleted: {wiki_stats.deleted})"
    )


if __name__ == "__main__":
    main()
