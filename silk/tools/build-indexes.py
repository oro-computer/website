#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


EXCLUDE_BASENAMES = {
    "README.md",
    "PLAN.md",
    "STATUS.md",
    "llms.txt",
    "style-guide.md",
    "_template-language.md",
    "_template-stdlib.md",
}


SECTION_ORDER_DOCS = [
    "overview",
    "guides",
    "language",
    "std",
    "usage",
    "tooling",
    "compiler",
    "man",
]


SECTION_ORDER_WIKI = [
    "overview",
    "language",
    "std",
    "tooling",
]

GUIDE_ORDER = [
    "guides/purpose",
    "guides/hello-world",
    "guides/language-tour",
    "guides/modules-and-packages",
    "guides/standard-library",
    "guides/cli",
    "guides/testing",
    "guides/formal-silk",
]


@dataclass(frozen=True)
class Item:
    id: str
    title: str
    file: str
    section: str
    text: str
    summary: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def first_heading(markdown: str) -> str | None:
    in_comment = False
    for line in markdown.splitlines():
        if "<!--" in line:
            in_comment = True
        if in_comment:
            if "-->" in line:
                in_comment = False
            continue
        if line.startswith("#"):
            heading = line.lstrip("#").strip()
            heading = re.sub(r"\s+", " ", heading)
            return heading or None
        if line.strip() and not line.startswith("<!--"):
            # If real text starts before a heading, stop searching.
            break
    return None


def first_paragraph(markdown: str) -> str:
    in_code = False
    in_comment = False
    buf: list[str] = []
    for raw in markdown.splitlines():
        line = raw.rstrip()
        if "<!--" in line:
            in_comment = True
        if in_comment:
            if "-->" in line:
                in_comment = False
            continue
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if re.match(r"^(Status:|Implementation status:)\s*", line, flags=re.I):
            continue
        if line.startswith("#"):
            continue
        if line.startswith(("-", "*", "|")):
            continue
        if not line.strip():
            if buf:
                break
            continue
        buf.append(line.strip())
        # keep paragraphs short
        if sum(len(s) for s in buf) > 220:
            break
    text = " ".join(buf)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def strip_markdown(markdown: str) -> str:
    # Remove front-matter-like separators (not used here, but safe).
    md = markdown

    # Drop HTML comments.
    md = re.sub(r"<!--.*?-->", " ", md, flags=re.S)

    # Collapse fenced code blocks but keep code content.
    md = re.sub(r"```[^\n]*\n", "\n", md)
    md = md.replace("```", "\n")

    # Inline code.
    md = re.sub(r"`([^`]+)`", r"\1", md)

    # Links: [text](url) -> text
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)

    # Headings, list markers, emphasis.
    md = re.sub(r"^#+\s*", "", md, flags=re.M)
    md = re.sub(r"^[\s>*-]+\s*", "", md, flags=re.M)
    md = md.replace("**", "").replace("__", "").replace("*", "").replace("_", "")

    # Tables and pipes get noisy; keep words.
    md = md.replace("|", " ")

    md = re.sub(r"\s+", " ", md).strip()
    return md


def strip_internal_refs(markdown: str) -> str:
    drop_line = re.compile(
        r"(STATUS\.md|PLAN\.md|README\.md|llms\.txt|\bdocs/|\btests/)",
        flags=re.I,
    )
    status_line = re.compile(r"^(Status:|Implementation status:)\s*", flags=re.I)
    status_heading = re.compile(r"^(#{1,6})\s+(Status|Implementation status)\b", flags=re.I)

    def rewrite_outside_code(text: str) -> str:
        out = text

        out = re.sub(
            r"^(\s*#{1,6}\s+)What works today\b",
            r"\1Supported behavior",
            out,
            flags=re.I,
        )
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
        out = re.sub(
            r"\bthe current scalar-slot backend subset\b",
            "the scalar-slot backend",
            out,
            flags=re.I,
        )
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
        out = re.sub(r"\(\s*\)", "", out)

        leading = re.match(r"^\s*", out).group(0)
        body = out[len(leading) :]
        body = re.sub(r" {2,}", " ", body)
        body = re.sub(r"\s+:", ":", body)
        body = re.sub(r"\s+,", ",", body)
        body = re.sub(r"\(\s+", "(", body)
        body = re.sub(r"\s+\)", ")", body)
        return leading + body

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

    def rewrite_comment(text: str) -> str:
        out = text
        out = re.sub(r"\bwhat works today\b", "supported behavior", out, flags=re.I)
        out = re.sub(r"\bworks today\b", "Example", out, flags=re.I)
        out = re.sub(r"\bcurrent\s+(?:subset|support)\b", "", out, flags=re.I)
        out = re.sub(r"\bcurrently\s+not\b", "not", out, flags=re.I)
        out = re.sub(r" {2,}", " ", out)
        out = re.sub(r"\(\s*\)", "", out)
        return out.rstrip()

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

        if not in_code and (drop_line.search(raw) or status_line.match(raw)):
            continue

        if not in_code:
            parts = raw.split("`")
            for i in range(0, len(parts), 2):
                parts[i] = rewrite_outside_code(parts[i])
            line = "`".join(parts)
            # Status-y parentheticals can straddle inline-code spans; strip them on the full line.
            line = re.sub(r"\(\s*Implemented[^)]*\)", "", line, flags=re.I)
            line = re.sub(r"\(\s*Works today[^)]*\)", "", line, flags=re.I)
            line = re.sub(
                r"\(\s*(?:Planned|Selected|current\s+(?:subset|compiler|backend|checker|implementation))[^)]*\)",
                "",
                line,
                flags=re.I,
            )
            out_lines.append(line)
        else:
            # Keep code blocks searchable, but rewrite status-y language inside comment text.
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

    return "\n".join(out_lines)


def path_to_id(rel_path: str) -> str:
    rel = rel_path.replace("\\", "/")
    if rel.endswith(".md"):
        rel = rel[: -len(".md")]
    if rel.endswith(".txt"):
        rel = rel[: -len(".txt")]
    return rel


def collect_items(source_root: Path, section_order: list[str]) -> list[Item]:
    items: list[Item] = []

    for path in sorted(source_root.rglob("*")):
        if not path.is_file():
            continue
        if path.name in EXCLUDE_BASENAMES:
            continue
        if not (path.suffix in (".md", ".txt")):
            continue

        rel = path.relative_to(source_root).as_posix()
        section = rel.split("/", 1)[0] if "/" in rel else "overview"

        md = strip_internal_refs(read_text(path))
        title = first_heading(md) or path.stem.replace("-", " ").replace("_", " ").title()
        summary = first_paragraph(md)
        text = strip_markdown(md)

        items.append(
            Item(
                id=path_to_id(rel),
                title=title,
                file=rel,
                section=section,
                text=text,
                summary=summary,
            )
        )

    # Sort by section order, then title.
    order_index = {name: i for i, name in enumerate(section_order)}
    guide_index = {doc_id: i for i, doc_id in enumerate(GUIDE_ORDER)}

    def sort_key(item: Item):
        section_rank = order_index.get(item.section, 999)
        if item.section == "guides":
            return (
                section_rank,
                0,
                guide_index.get(item.id, 999),
                item.title.lower(),
                item.id,
            )
        return (section_rank, 0, item.title.lower(), item.id)

    items.sort(key=sort_key)
    return items


def group_sections(items: Iterable[Item], section_order: list[str]):
    grouped: dict[str, list[Item]] = {}
    for item in items:
        grouped.setdefault(item.section, []).append(item)

    out = []
    seen = set()
    for name in section_order:
        if name in grouped:
            out.append({"name": name, "items": [{"id": i.id, "title": i.title, "file": i.file} for i in grouped[name]]})
            seen.add(name)
    for name in sorted(k for k in grouped.keys() if k not in seen):
        out.append({"name": name, "items": [{"id": i.id, "title": i.title, "file": i.file} for i in grouped[name]]})
    return out


def write_json(path: Path, payload: object):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def build(kind_root: Path, kind: str, section_order: list[str]):
    source_root = kind_root / "source"
    items = collect_items(source_root, section_order)

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    index_payload = {
        "generatedAt": generated_at,
        "kind": kind,
        "count": len(items),
        "sections": group_sections(items, section_order),
    }

    search_payload = {
        "generatedAt": generated_at,
        "kind": kind,
        "count": len(items),
        "items": [
            {
                "id": i.id,
                "title": i.title,
                "section": i.section,
                "summary": i.summary,
                "text": i.text,
            }
            for i in items
        ],
    }

    write_json(kind_root / "index.json", index_payload)
    write_json(kind_root / "search.json", search_payload)


def main():
    repo_root = Path(__file__).resolve().parents[3]
    docs_root = repo_root / "website" / "silk" / "docs"
    wiki_root = repo_root / "website" / "silk" / "wiki"

    build(docs_root, "docs", SECTION_ORDER_DOCS)
    build(wiki_root, "wiki", SECTION_ORDER_WIKI)

    print("Wrote:")
    print(f"- {docs_root / 'index.json'}")
    print(f"- {docs_root / 'search.json'}")
    print(f"- {wiki_root / 'index.json'}")
    print(f"- {wiki_root / 'search.json'}")


if __name__ == "__main__":
    main()
