#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass(frozen=True)
class DocItem:
    kind: str  # "docs" | "wiki"
    section: str
    id: str
    title: str
    file: str


def read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def file_to_id(file: str) -> str:
    if file.endswith(".md"):
        return file[: -len(".md")]
    if file.endswith(".txt"):
        return file[: -len(".txt")]
    return file


def load_items(kind_root: Path, kind: str) -> list[DocItem]:
    index_path = kind_root / "index.json"
    if not index_path.exists():
        raise SystemExit(f"Missing {index_path}. Run: python3 website/silk/tools/build-indexes.py")

    index = read_json(index_path)
    sections = index.get("sections") if isinstance(index, dict) else None
    if not isinstance(sections, list):
        raise SystemExit(f"Invalid index.json shape at {index_path}")

    items: list[DocItem] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        section_name = str(section.get("name") or "overview")
        for item in section.get("items") or []:
            if not isinstance(item, dict):
                continue
            doc_id = str(item.get("id") or "")
            title = str(item.get("title") or doc_id or "Untitled")
            file = str(item.get("file") or "")
            if not doc_id or not file:
                continue
            items.append(DocItem(kind=kind, section=section_name, id=doc_id, title=title, file=file))

    return items


def section_label(name: str) -> str:
    if name == "overview":
        return "Start"
    if name == "std":
        return "Standard library"
    return name.replace("-", " ").replace("_", " ").title()


def doc_url(item: DocItem) -> str:
    if item.kind == "docs":
        m = re.match(r"^spec/(\d{4})$", item.id)
        if m:
            return f"/silk/spec/{m.group(1)}/"
    if item.kind == "wiki":
        return f"/silk/wiki/?p={item.id}"
    return f"/silk/docs/?p={item.id}"


def sanitize_markdown(markdown: str) -> str:
    """
    Create LLM-friendly content:
    - Drop status/meta framing (Status sections, PLAN/STATUS/README/llms refs).
    - Avoid "subset"/"works today" tone in prose and comments.
    - Avoid leaking internal file-path references like docs/... and tests/...
      outside of code fences (the LLMS pack already includes the full content).
    """

    drop_line = re.compile(
        r"(STATUS\.md|PLAN\.md|README\.md|\bllms\.txt\b|_template-[^`\s]+|style-guide\.md|\bdocs/|\btests/)",
        flags=re.I,
    )
    status_heading = re.compile(r"^(#{1,6})\s+(Status|Implementation status)\b", flags=re.I)
    status_line = re.compile(r"^(Status:|Implementation status:)\s*", flags=re.I)

    def rewrite_text(text: str) -> str:
        out = text
        out = re.sub(r"^(\s*#{1,6}\s+)What works today\b", r"\1Supported behavior", out, flags=re.I)
        out = re.sub(r"\bwhat works today\b", "supported behavior", out, flags=re.I)
        out = re.sub(r"^(\s*#{1,6}\s+)Syntax\s*\(Selected\)\s*$", r"\1Syntax", out, flags=re.I)
        out = re.sub(r"\bCurrent limitations\b", "Limitations", out, flags=re.I)
        out = out.replace("Implemented in", "Defined in")

        out = re.sub(r"\bExamples\s*\(Works today\)\b", "Examples", out, flags=re.I)
        out = re.sub(r"\bExample\s*\(Works today\)\s*:", "Example:", out, flags=re.I)
        out = re.sub(r"^(\s*#{1,6}\s+)Works today:\s*", r"\1Example: ", out, flags=re.I)
        out = re.sub(r"^(\s*#{1,6}\s+)Works today\b", r"\1Example", out, flags=re.I)
        out = re.sub(r"^(\s*[-*+]\s+)Works today:\s*", r"\1Example: ", out, flags=re.I)
        out = re.sub(r"^(\s*[-*+]\s+)Works today\b", r"\1Example", out, flags=re.I)
        out = re.sub(r"^\s*Works today:\s*", "Example: ", out, flags=re.I)
        out = re.sub(r"^(\s*)Works today\b", r"\1Example", out, flags=re.I)
        out = re.sub(r"\(Works today\)", "", out, flags=re.I)

        out = re.sub(
            r"^(\s*(?:[-*+]\s+)?)in the current (?:compiler/backend|compiler|backend|scalar-slot backend)?\s*subset\b",
            r"\1In Silk",
            out,
            flags=re.I,
        )
        out = re.sub(
            r"\bin the current (?:compiler/backend|compiler|backend|scalar-slot backend)?\s*subset\b",
            "in Silk",
            out,
            flags=re.I,
        )
        out = re.sub(r"\bthe current compiler/backend subset\b", "the compiler", out, flags=re.I)
        out = re.sub(r"\bthe current compiler subset\b", "the compiler", out, flags=re.I)
        out = re.sub(r"\bthe current scalar-slot backend subset\b", "the scalar-slot backend", out, flags=re.I)
        out = re.sub(r"\bthe current backend subset\b", "the backend", out, flags=re.I)
        out = re.sub(r"\bCurrent subset limitation\b", "Limitation", out, flags=re.I)
        out = re.sub(r"\bcurrent\s+(?:subset|support)\b", "", out, flags=re.I)
        out = re.sub(r"\s*\(\s*current\s+(?:subset|support)[^)]*\)", "", out, flags=re.I)

        if re.match(r"^\s*#{1,6}\s", out):
            out = re.sub(
                r"\s*\([^)]*(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))[^)]*\)",
                "",
                out,
                flags=re.I,
            )

        out = re.sub(
            r"^(\s*#{1,6}\s+.+?)\s*\(([^)]+)\)\s*$",
            lambda m: m.group(1)
            if re.search(
                r"(works today|implemented|planned|selected|current\s+(?:subset|compiler|backend|checker|implementation))",
                m.group(2),
                flags=re.I,
            )
            else m.group(0),
            out,
        )
        out = re.sub(
            r"^(\s*#{1,6}\s+)(?:Current\s+|Initial\s+)?Implemented\s+Subset\s*$",
            r"\1Details",
            out,
            flags=re.I,
        )
        out = re.sub(r"^(\s*#{1,6}\s+)Implemented\s*$", r"\1Details", out, flags=re.I)
        out = re.sub(r"^(\s*#{1,6}\s+)Implemented\s+API\b", r"\1API", out, flags=re.I)
        out = re.sub(r"^(\s*[-*+]\s+)Implemented\s*:\s*", r"\1", out, flags=re.I)
        out = re.sub(r"^\s*Implemented\s*:\s*", "", out, flags=re.I)
        out = re.sub(r"^(\s*(?:[-*+]\s+)?)Implemented subset notes:\s*", r"\1Notes: ", out, flags=re.I)
        out = re.sub(r"^(\s*(?:[-*+]\s+)?)Implemented initial subset:\s*", r"\1Notes: ", out, flags=re.I)
        out = re.sub(r"^(\s*(?:[-*+]\s+)?)Implemented subset:\s*", r"\1Notes: ", out, flags=re.I)
        out = re.sub(r"^(\s*(?:[-*+]\s+)?)Implemented runtime areas\b", r"\1Runtime areas", out, flags=re.I)
        out = re.sub(r"^(\s*(?:[-*+]\s+)?)Implemented as\b", r"\1Designed as", out, flags=re.I)
        out = re.sub(r"\s*\(\s*Implemented[^)]*\)", "", out, flags=re.I)

        out = re.sub(r"\bcurrently\s+not\b", "not", out, flags=re.I)

        return out

    def rewrite_comment(text: str) -> str:
        out = text
        out = re.sub(r"\bwhat works today\b", "supported behavior", out, flags=re.I)
        out = re.sub(r"\bworks today\b", "Example", out, flags=re.I)
        out = re.sub(r"\bcurrent\s+(?:subset|support)\b", "", out, flags=re.I)
        out = re.sub(r"\bcurrently\s+not\b", "not", out, flags=re.I)
        return out

    out_lines: list[str] = []
    in_code = False
    skip_level: int | None = None
    code_lang: str | None = None

    def drop_proposal_process(md: str) -> str:
        lines = md.splitlines()
        out: list[str] = []
        i = 0
        while i < len(lines):
            if re.match(r"^##\s+Silk Proposal Process\b", lines[i], flags=re.I):
                i += 1
                while i < len(lines) and not re.match(r"^##\s+", lines[i]):
                    i += 1
                continue
            out.append(lines[i])
            i += 1
        return "\n".join(out)

    markdown = drop_proposal_process(markdown)

    for raw in markdown.splitlines():
        trimmed = raw.lstrip()

        if trimmed.startswith("```"):
            entering = not in_code
            in_code = not in_code
            if entering:
                lang = trimmed[3:].strip().split(maxsplit=1)[0] if trimmed[3:].strip() else ""
                code_lang = lang.lower() if lang else None
            else:
                code_lang = None
            if skip_level is None:
                out_lines.append(raw)
            continue

        if not in_code:
            heading_match = re.match(r"^(#{1,6})\s+(.+?)\s*$", raw)
            if skip_level is not None and heading_match:
                level = len(heading_match.group(1))
                if level <= skip_level:
                    skip_level = None

            if skip_level is None:
                status_match = status_heading.match(raw)
                if status_match:
                    skip_level = len(status_match.group(1))
                    continue

        if skip_level is not None:
            continue

        if not in_code and (status_line.match(raw) or drop_line.search(raw)):
            continue

        if not in_code:
            line = rewrite_text(raw)
            out_lines.append(line)
            continue

        # In code fences: only rewrite comment text.
        if trimmed.startswith(("//", "#", "--", "/*", "*")):
            out_lines.append(rewrite_comment(raw))
            continue

        if code_lang in {"silk", "slk", "c", "cpp", "cc", "c++", "js", "javascript", "ts", "typescript", "zig"}:
            idx = raw.find("//")
            if idx != -1 and (idx == 0 or raw[idx - 1].isspace()):
                out_lines.append(raw[:idx] + rewrite_comment(raw[idx:]))
                continue

        if code_lang in {"bash", "sh", "zsh", "fish", "toml", "yaml", "yml"}:
            idx = raw.find("#")
            if idx != -1 and (idx == 0 or raw[idx - 1].isspace()):
                out_lines.append(raw[:idx] + rewrite_comment(raw[idx:]))
                continue

        out_lines.append(raw)

    return "\n".join(out_lines).rstrip() + "\n"


def build_llms_txt(site_root: Path) -> str:
    docs_root = site_root / "docs"
    wiki_root = site_root / "wiki"

    docs_items = load_items(docs_root, "docs")
    wiki_items = load_items(wiki_root, "wiki")

    all_items = docs_items + wiki_items

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    header = [
        "Silk · LLMS Pack",
        "================",
        "",
        "This file concatenates the full Silk documentation hosted on this website,",
        "so an LLM can answer questions using the same source of truth as readers.",
        "",
        f"Generated: {generated_at}",
        "",
        "How to link:",
        "- Docs: /silk/docs/?p=<id>",
        "- Wiki: /silk/wiki/?p=<id>",
        "",
        "Table of contents",
        "-----------------",
        "",
    ]

    toc_lines: list[str] = []
    toc_lines.append("Silk Docs")
    current = None
    for item in docs_items:
        if item.section != current:
            current = item.section
            toc_lines.append(f"- {section_label(current)}")
        toc_lines.append(f"  - {item.id} — {item.title} — {doc_url(item)}")

    toc_lines.append("")
    toc_lines.append("Silk Wiki")
    current = None
    for item in wiki_items:
        if item.section != current:
            current = item.section
            toc_lines.append(f"- {section_label(current)}")
        toc_lines.append(f"  - {item.id} — {item.title} — {doc_url(item)}")

    body: list[str] = []
    body.extend(header)
    body.extend(toc_lines)
    body.append("")
    body.append("Content")
    body.append("-------")
    body.append("")

    for item in all_items:
        source_root = docs_root if item.kind == "docs" else wiki_root
        source_path = source_root / "source" / item.file
        if not source_path.exists():
            # Keep the pack buildable even if a source file is missing.
            body.append("=" * 78)
            body.append(f"{item.kind.upper()}: {item.title} ({item.id})")
            body.append(f"URL: {doc_url(item)}")
            body.append("ERROR: source file missing")
            body.append("=" * 78)
            body.append("")
            continue

        raw = source_path.read_text(encoding="utf-8")
        content = sanitize_markdown(raw)

        body.append("=" * 78)
        body.append(f"{item.kind.upper()}: {item.title} ({item.id})")
        body.append(f"URL: {doc_url(item)}")
        body.append("=" * 78)
        body.append("")
        body.append(content.rstrip())
        body.append("")

    return "\n".join(body).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Build website/silk/llms.txt from the docs + wiki sources.")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output path (defaults to website/silk/llms.txt).",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[3]
    site_root = repo_root / "website" / "silk"
    out_path: Path = args.output if args.output is not None else (site_root / "llms.txt")

    out_path.write_text(build_llms_txt(site_root), encoding="utf-8")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
