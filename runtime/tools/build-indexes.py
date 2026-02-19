#!/usr/bin/env python3

from __future__ import annotations

import json
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
}


SECTION_ORDER_DOCS = [
    "overview",
    "guides",
    "cli",
    "config",
    "javascript",
]


SECTION_BY_BASENAME: dict[str, str] = {}


PINNED_ORDER = [
    "start",
    # Guides
    "guides/hello-world",
    "guides/project-layout",
    "guides/build-and-package",
    "guides/windows-and-messaging",
    # CLI
    "cli/oroc",
    "cli/run",
    "cli/build",
    "cli/setup",
    "cli/init",
    "cli/config",
    "cli/env",
    # Config
    "config/overview",
    "config/reference",
    "config/copy-map",
    # JavaScript APIs
    "javascript/overview",
    "javascript/module-index",
    "javascript/all-modules",
    "javascript/application",
    "javascript/window",
    "javascript/hooks",
    "javascript/fs",
    "javascript/secure-storage",
    "javascript/notification",
    "javascript/mcp",
    "javascript/ai",
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

def read_json(path: Path) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None


def first_heading(markdown: str) -> str | None:
    for line in markdown.splitlines():
        if line.startswith("#"):
            heading = line.lstrip("#").strip()
            heading = re.sub(r"\s+", " ", heading)
            return heading or None
        if line.strip() and not line.startswith("<!--"):
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
        if sum(len(s) for s in buf) > 220:
            break
    text = " ".join(buf)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def strip_markdown(markdown: str) -> str:
    md = markdown
    md = re.sub(r"<!--.*?-->", " ", md, flags=re.S)
    md = re.sub(r"```[^\n]*\n", "\n", md)
    md = md.replace("```", "\n")
    md = re.sub(r"`([^`]+)`", r"\1", md)
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)
    md = re.sub(r"^#+\s*", "", md, flags=re.M)
    md = re.sub(r"^[\s>*-]+\s*", "", md, flags=re.M)
    md = md.replace("**", "").replace("__", "").replace("*", "").replace("_", "")
    md = md.replace("|", " ")
    md = re.sub(r"\s+", " ", md).strip()
    return md


def sanitize_for_index(markdown: str) -> str:
    """
    Create a search-friendly version of markdown:
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

    return "\n".join(out_lines)


def path_to_id(rel_path: str) -> str:
    rel = rel_path.replace("\\", "/")
    if rel.endswith(".md"):
        rel = rel[: -len(".md")]
    if rel.endswith(".txt"):
        rel = rel[: -len(".txt")]
    return rel


def section_for_path(rel: str) -> str:
    if "/" in rel:
        return rel.split("/", 1)[0]
    return SECTION_BY_BASENAME.get(rel, "overview")


def collect_items(source_root: Path, section_order: list[str]) -> list[Item]:
    items: list[Item] = []

    for path in sorted(source_root.rglob("*")):
        if not path.is_file():
            continue
        if path.name in EXCLUDE_BASENAMES:
            continue
        if path.suffix not in {".md", ".txt"}:
            continue

        rel = path.relative_to(source_root).as_posix()
        section = section_for_path(rel)

        md = sanitize_for_index(read_text(path))
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

    order_index = {name: i for i, name in enumerate(section_order)}
    pinned_index = {doc_id: i for i, doc_id in enumerate(PINNED_ORDER)}

    def sort_key(item: Item):
        return (
            order_index.get(item.section, 999),
            pinned_index.get(item.id, 9999),
            item.title.lower(),
            item.id,
        )

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
            out.append(
                {
                    "name": name,
                    "items": [{"id": i.id, "title": i.title, "file": i.file} for i in grouped[name]],
                }
            )
            seen.add(name)
    for name in sorted(k for k in grouped.keys() if k not in seen):
        out.append(
            {
                "name": name,
                "items": [{"id": i.id, "title": i.title, "file": i.file} for i in grouped[name]],
            }
        )
    return out


def write_json(path: Path, payload: object):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

def write_json_if_changed(path: Path, payload: object, *, preserve_generated_at: bool = False) -> bool:
    """
    Avoid churning generated artifacts when inputs haven't changed.

    If `preserve_generated_at` is set and the only difference is `generatedAt`,
    keep the existing file verbatim.
    """

    path.parent.mkdir(parents=True, exist_ok=True)

    existing = read_json(path)
    if preserve_generated_at and isinstance(existing, dict) and isinstance(payload, dict):
        if "generatedAt" in existing and "generatedAt" in payload:
            preserved = dict(payload)
            preserved["generatedAt"] = existing["generatedAt"]
            if existing == preserved:
                return False

    if existing == payload:
        return False

    write_json(path, payload)
    return True


def build(docs_root: Path):
    source_root = docs_root / "source"
    items = collect_items(source_root, SECTION_ORDER_DOCS)

    generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    index_payload = {
        "generatedAt": generated_at,
        "kind": "docs",
        "count": len(items),
        "sections": group_sections(items, SECTION_ORDER_DOCS),
    }

    search_payload = {
        "generatedAt": generated_at,
        "kind": "docs",
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

    written = []
    index_path = docs_root / "index.json"
    search_path = docs_root / "search.json"
    if write_json_if_changed(index_path, index_payload, preserve_generated_at=True):
        written.append(index_path)
    if write_json_if_changed(search_path, search_payload, preserve_generated_at=True):
        written.append(search_path)

    if written:
        print("Wrote:")
        for path in written:
            print(f"- {path}")
    else:
        print("Unchanged: index.json and search.json")


def main():
    repo_root = Path(__file__).resolve().parents[3]
    docs_root = repo_root / "website" / "runtime" / "docs"

    build(docs_root)


if __name__ == "__main__":
    main()
