#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote


@dataclass(frozen=True)
class DocItem:
    section: str
    id: str
    title: str
    file: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_json(path: Path) -> object:
    return json.loads(read_text(path))


def section_label(name: str) -> str:
    if name == "overview":
        return "Start"
    if name == "cli":
        return "CLI"
    if name == "config":
        return "Configuration"
    if name == "javascript":
        return "JavaScript APIs"
    if name == "ai":
        return "AI"
    if name == "mcp":
        return "MCP"
    if name in {"api", "apis"}:
        return "APIs"
    if not name:
        return "Docs"
    return name.replace("-", " ").replace("_", " ").title()


def doc_url(item: DocItem) -> str:
    return f"/runtime/docs/?p={quote(item.id)}"


def sanitize_markdown(markdown: str) -> str:
    """
    Create LLM-friendly content:
    - Drop Status / Implementation status sections.
    - Drop references to STATUS/PLAN/README/llms meta files.
    """

    drop_line = re.compile(r"(STATUS\.md|PLAN\.md|README\.md|\bllms\.txt\b)", flags=re.I)
    status_heading = re.compile(r"^(#{1,6})\s+(Status|Implementation status)\b", flags=re.I)
    status_line = re.compile(r"^(Status:|Implementation status:)\s*", flags=re.I)

    out_lines: list[str] = []
    in_code = False
    skip_level: int | None = None

    for raw in markdown.splitlines():
        trimmed = raw.lstrip()
        if trimmed.startswith("```"):
            in_code = not in_code
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

        out_lines.append(raw)

    return "\n".join(out_lines).rstrip() + "\n"


def load_items(docs_root: Path) -> list[DocItem]:
    index_path = docs_root / "index.json"
    if not index_path.exists():
        raise SystemExit(
            f"Missing {index_path}. Run: python3 website/runtime/tools/build-indexes.py"
        )

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
            items.append(DocItem(section=section_name, id=doc_id, title=title, file=file))
    return items


def normalize_generated_line(text: str) -> str:
    """
    Normalize only the *header* Generated timestamp so we can avoid rewriting
    llms.txt when content is unchanged.
    """

    lines = text.splitlines()
    out: list[str] = []
    in_header = True
    replaced = False

    for line in lines:
        if in_header and not replaced and line.startswith("Generated: "):
            out.append("Generated: <preserved>")
            replaced = True
            continue
        out.append(line)
        if line.strip() == "How to link:":
            in_header = False

    return "\n".join(out).rstrip() + "\n"


def main():
    repo_root = Path(__file__).resolve().parents[3]
    docs_root = repo_root / "website" / "runtime" / "docs"
    out_path = repo_root / "website" / "runtime" / "llms.txt"

    items = load_items(docs_root)
    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    lines: list[str] = []
    lines.append("Oro Runtime · LLMS Pack")
    lines.append("======================")
    lines.append("")
    lines.append("This file concatenates the full Oro Runtime documentation hosted on this website,")
    lines.append("so an LLM can answer questions using the same source of truth as readers.")
    lines.append("")
    lines.append(f"Generated: {generated_at}")
    lines.append("")
    lines.append("How to link:")
    lines.append("- Docs: /runtime/docs/?p=<id>")
    lines.append("")
    lines.append("Table of contents")
    lines.append("-----------------")
    lines.append("")
    lines.append("Runtime Docs")

    current_section: str | None = None
    for item in items:
        if item.section != current_section:
            current_section = item.section
            lines.append(f"- {section_label(current_section)}")
        lines.append(f"  - {item.id} — {item.title} — {doc_url(item)}")

    lines.append("")

    source_root = docs_root / "source"
    for item in items:
        lines.append("=" * 78)
        lines.append(f"DOCS: {item.title} ({item.id})")
        lines.append(f"URL: {doc_url(item)}")
        lines.append("=" * 78)
        lines.append("")
        content_path = source_root / item.file
        if not content_path.exists():
            lines.append(f"(Missing source file: {item.file})")
            lines.append("")
            continue
        lines.append(sanitize_markdown(read_text(content_path)))

    next_text = "\n".join(lines).rstrip() + "\n"
    prev_text = out_path.read_text(encoding="utf-8") if out_path.exists() else None

    if prev_text is not None and normalize_generated_line(prev_text) == normalize_generated_line(next_text):
        print(f"Unchanged: {out_path}")
        return

    out_path.write_text(next_text, encoding="utf-8")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
