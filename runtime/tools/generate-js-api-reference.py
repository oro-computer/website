#!/usr/bin/env python3

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


MODULE_START = re.compile(r"^declare module ['\"](?P<name>oro:[^'\"]+)['\"]\s*\{\s*$")


CURATED_FAMILIES = {
    "oro:ai",
    "oro:application",
    "oro:fs",
    "oro:hooks",
    "oro:mcp",
    "oro:notification",
    "oro:secure-storage",
    "oro:window",
}


CURATED_FILES_BY_FAMILY = {
    "oro:ai": "ai.md",
    "oro:application": "application.md",
    "oro:fs": "fs.md",
    "oro:hooks": "hooks.md",
    "oro:mcp": "mcp.md",
    "oro:notification": "notification.md",
    "oro:secure-storage": "secure-storage.md",
    "oro:window": "window.md",
}


REF_START = "<!-- GENERATED: ORO_API_REFERENCE_START -->"
REF_END = "<!-- GENERATED: ORO_API_REFERENCE_END -->"


@dataclass(frozen=True)
class ModuleBlock:
    spec: str
    block: str


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text_if_changed(path: Path, text: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    prev = path.read_text(encoding="utf-8") if path.exists() else None
    if prev == text:
        return False
    path.write_text(text, encoding="utf-8")
    return True


def parse_index_d_ts(text: str) -> dict[str, ModuleBlock]:
    lines = text.splitlines()
    out: dict[str, ModuleBlock] = {}
    i = 0

    while i < len(lines):
        m = MODULE_START.match(lines[i])
        if not m:
            i += 1
            continue

        spec = m.group("name").strip()
        buf: list[str] = [lines[i].rstrip()]
        i += 1

        while i < len(lines):
            line = lines[i].rstrip()
            buf.append(line)
            if line == "}" and not lines[i].startswith((" ", "\t")):
                break
            i += 1

        block = "\n".join(buf).rstrip() + "\n"
        out[spec] = ModuleBlock(spec=spec, block=block)
        i += 1

    if not out:
        raise SystemExit("No `declare module 'oro:*' { ... }` blocks found.")

    return out


def family_of(spec: str) -> str:
    return spec.split("/", 1)[0]


def sort_specs_in_family(family: str, specs: list[str]) -> list[str]:
    return sorted(specs, key=lambda s: (s != family, s))


def preferred_import_spec(family: str, specs: list[str], blocks: dict[str, ModuleBlock]) -> str:
    if family in blocks:
        return family
    for s in specs:
        if s.endswith("/index"):
            return s
    return specs[0]


def family_title(family: str, blocks: dict[str, ModuleBlock]) -> str:
    if family in blocks:
        return f"`{family}`"
    return f"`{family}/*`"


def family_intro(family: str) -> str:
    if family == "oro:internal":
        return (
            "`oro:internal/*` modules are internal runtime building blocks. They exist so the runtime can compose its\n"
            "Node-compatibility surface and WebView integrations, but they are not considered stable application-facing API.\n"
        )
    if family == "oro:external":
        return (
            "`oro:external/*` modules expose bundled third-party libraries that the runtime ships internally.\n"
            "They are not a stable public API surface; prefer higher-level modules when available.\n"
        )
    if family == "oro:node":
        return (
            "`oro:node/*` modules provide Node interop helpers used by the runtime’s module loader.\n"
            "Most apps should not import these directly.\n"
        )
    if family == "oro:npm":
        return (
            "`oro:npm/*` modules support the runtime’s NPM/module integration paths.\n"
            "Most apps should not import these directly.\n"
        )
    return (
        "This page is the API reference for this runtime module family. It includes all exported bindings as\n"
        "declared by the runtime’s published TypeScript definitions.\n"
    )


def render_reference_section(family: str, specs: list[str], blocks: dict[str, ModuleBlock]) -> str:
    specs_sorted = sort_specs_in_family(family, specs)

    lines: list[str] = []
    lines.append("## API reference")
    lines.append("")
    lines.append(REF_START)
    lines.append("")
    lines.append("### Module specifiers")
    lines.append("")
    lines.append("```text")
    for s in specs_sorted:
        lines.append(s)
    lines.append("```")
    lines.append("")

    lines.append("### TypeScript declarations")
    lines.append("")
    for s in specs_sorted:
        lines.append("<details>")
        lines.append(f"<summary><code>{s}</code></summary>")
        lines.append("")
        lines.append("```ts")
        lines.extend(blocks[s].block.rstrip().splitlines())
        lines.append("```")
        lines.append("")
        lines.append("</details>")
        lines.append("")

    lines.append(REF_END)
    lines.append("")
    return "\n".join(lines)


def update_curated_page(path: Path, family: str, specs: list[str], blocks: dict[str, ModuleBlock]) -> bool:
    text = read_text(path)

    if REF_START in text and REF_END in text:
        before, rest = text.split(REF_START, 1)
        _, after = rest.split(REF_END, 1)
        # Keep content outside the generated region; regenerate the region itself.
        next_text = before.rstrip() + "\n\n" + render_reference_section(family, specs, blocks) + after.lstrip()
    else:
        next_text = text.rstrip() + "\n\n" + render_reference_section(family, specs, blocks)

    # Ensure trailing newline
    next_text = next_text.rstrip() + "\n"
    return write_text_if_changed(path, next_text)


def render_generated_page(path: Path, family: str, specs: list[str], blocks: dict[str, ModuleBlock]) -> str:
    title = family_title(family, blocks)
    specs_sorted = sort_specs_in_family(family, specs)
    import_spec = preferred_import_spec(family, specs_sorted, blocks)

    lines: list[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(family_intro(family).rstrip())
    lines.append("")
    lines.append("## Import")
    lines.append("")
    lines.append("```js")
    lines.append(f"import * as api from '{import_spec}'")
    lines.append("")
    lines.append("console.log(Object.keys(api))")
    lines.append("```")
    lines.append("")
    lines.append(render_reference_section(family, specs_sorted, blocks).rstrip())
    lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    root = repo_root()
    index_path = root / "legacy-runtime" / "api" / "index.d.ts"
    if not index_path.exists():
        raise SystemExit(f"Missing {index_path}")

    blocks = parse_index_d_ts(read_text(index_path))

    families: dict[str, list[str]] = {}
    for spec in blocks.keys():
        families.setdefault(family_of(spec), []).append(spec)

    out_dir = root / "website" / "runtime" / "docs" / "source" / "javascript"
    out_dir.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []

    for family in sorted(families.keys()):
        specs = families[family]

        if family in CURATED_FAMILIES:
            rel = CURATED_FILES_BY_FAMILY[family]
            path = out_dir / rel
            if not path.exists():
                raise SystemExit(f"Expected curated file to exist: {path}")
            if update_curated_page(path, family, specs, blocks):
                written.append(path)
            continue

        name = family.removeprefix("oro:")
        path = out_dir / f"{name}.md"
        text = render_generated_page(path, family, specs, blocks)
        if write_text_if_changed(path, text):
            written.append(path)

    if written:
        print("Wrote:")
        for p in written:
            print(f"- {p}")
    else:
        print("Unchanged: generated JavaScript API reference pages")


if __name__ == "__main__":
    main()
