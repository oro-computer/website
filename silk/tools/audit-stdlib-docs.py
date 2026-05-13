#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path


SILK_ROOT = Path(__file__).resolve().parents[1]
STD_DOCS = SILK_ROOT / "docs" / "source" / "std"

ORDER = [
    "Description",
    "Exported API",
    "Examples",
    "Considerations",
    "Design goals",
    "See also",
]

BANNED_HEADINGS = (
    "API",
    "Current API",
    "Implemented API",
    "Public API",
    "High-Level API",
    "Intended Surface",
    "Current Surface",
    "Current Grammar Coverage",
    "Goals",
    "Design Goals",
    "Future Work",
    "Future work",
    "Follow-ups",
    "Remaining Follow-Ups",
    "Important Limitations",
    "Current Limitations",
    "Notes and Limitations",
)

BANNED_HEADING_PATTERNS = (
    re.compile(r"\bInitial Design\b", flags=re.I),
    re.compile(r"\bCurrent Scope\b", flags=re.I),
    re.compile(r"\bScope \(Current\)\b", flags=re.I),
    re.compile(r"\bMVP\b", flags=re.I),
)

BANNED_STATUS_PATTERNS = (
    re.compile(r"active expansion", flags=re.I),
    re.compile(r"current snapshot", flags=re.I),
    re.compile(r"Partially implemented", flags=re.I),
    re.compile(r"initial std wrapper", flags=re.I),
    re.compile(r"expansion path", flags=re.I),
    re.compile(r"\bMVP\b", flags=re.I),
)


@dataclass(frozen=True)
class Issue:
    path: Path
    message: str


def collect_h2s(path: Path) -> list[str]:
    headings: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            headings.append(line[3:].strip())
    return headings


def check_status(path: Path, text: str) -> list[Issue]:
    issues: list[Issue] = []
    for pattern in BANNED_STATUS_PATTERNS:
        if pattern.search(text):
            issues.append(Issue(path, f"Status/body uses banned transitional wording: {pattern.pattern}"))
    return issues


def check_headings(path: Path, headings: list[str]) -> list[Issue]:
    issues: list[Issue] = []

    for heading in headings:
        for banned in BANNED_HEADINGS:
            if heading == banned:
                issues.append(Issue(path, f"Banned heading: {heading}"))
        for pattern in BANNED_HEADING_PATTERNS:
            if pattern.search(heading):
                issues.append(Issue(path, f"Banned heading pattern: {heading}"))

    positions = {heading: index for index, heading in enumerate(headings) if heading in ORDER}
    last = -1
    seen: list[str] = []
    for heading in ORDER:
        pos = positions.get(heading)
        if pos is None:
            continue
        if pos < last:
            issues.append(
                Issue(
                    path,
                    f"Section order violation: {' -> '.join(seen + [heading])}",
                )
            )
            break
        last = pos
        seen.append(heading)

    return issues


def main() -> int:
    issues: list[Issue] = []

    for path in sorted(STD_DOCS.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        issues.extend(check_status(path, text))
        issues.extend(check_headings(path, collect_h2s(path)))

    if issues:
        for issue in issues:
            rel = issue.path.relative_to(SILK_ROOT.parent)
            print(f"{rel}: {issue.message}")
        return 1

    print("Stdlib doc audit passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
