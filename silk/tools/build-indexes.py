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
    for line in markdown.splitlines():
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
    buf: list[str] = []
    for raw in markdown.splitlines():
        line = raw.rstrip()
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
    lines: list[str] = []
    drop_line = re.compile(
        r"(STATUS\.md|PLAN\.md|README\.md|llms\.txt|\bdocs/|\btests/)",
        flags=re.I,
    )
    for raw in markdown.splitlines():
        if drop_line.search(raw):
            continue
        if re.match(r"^(Status:|Implementation status:)\s*", raw, flags=re.I):
            continue
        lines.append(raw)
    return "\n".join(lines)


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
