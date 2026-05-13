#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
from pathlib import Path


RUNTIME_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = RUNTIME_ROOT.parent
JAVASCRIPT_DOCS = RUNTIME_ROOT / "docs" / "source" / "javascript"
CLI_DOCS = RUNTIME_ROOT / "docs" / "source" / "cli"
UPSTREAM_RUNTIME_INDEX = REPO_ROOT.parent / "runtime" / "api" / "index.d.ts"
UPSTREAM_RUNTIME_CLI = REPO_ROOT.parent / "runtime" / "api" / "CLI.md"

sys.path.insert(0, str(REPO_ROOT / "tools"))

from site_audit_common import SiteAuditConfig, run_site_audit


CURATED_FILES_BY_FAMILY = {
    "oro:ai": "ai.md",
    "oro:application": "application.md",
    "oro:extension": "extension.md",
    "oro:fs": "fs.md",
    "oro:hooks": "hooks.md",
    "oro:mcp": "mcp.md",
    "oro:notification": "notification.md",
    "oro:secure-storage": "secure-storage.md",
    "oro:window": "window.md",
}


EXCLUDED_PUBLIC_FAMILIES = {
    "oro:bootstrap",
    "oro:external",
    "oro:internal",
    "oro:node",
    "oro:node-esm-loader",
}


MODULE_START = re.compile(r"^declare module ['\"](?P<name>oro:[^'\"]+)['\"]", re.M)
EXAMPLE_HEADING_RE = re.compile(r"^\s*##\s+.*examples?\b", re.I | re.M)

CLI_SECTION_TO_DOC = {
    "oroc": "cli/oroc.md",
    "oroc help": "cli/help.md",
    "oroc update": "cli/update.md",
    "oroc update-init": "cli/update/init.md",
    "oroc update-server": "cli/update/server.md",
    "oroc update-info": "cli/update/info.md",
    "oroc update-keygen": "cli/update/keygen.md",
    "oroc update-sign": "cli/update/sign.md",
    "oroc update-verify": "cli/update/verify.md",
    "oroc update-validate": "cli/update/validate.md",
    "oroc update-bundle": "cli/update/bundle.md",
    "oroc update-extract": "cli/update/extract.md",
    "oroc build": "cli/build.md",
    "oroc run": "cli/run.md",
    "oroc list-devices": "cli/list-devices.md",
    "oroc env": "cli/env.md",
    "oroc mcp": "cli/mcp.md",
    "oroc init": "cli/init.md",
    "oroc install-app": "cli/install-app.md",
    "oroc print-build-dir": "cli/print-build-dir.md",
    "oroc setup": "cli/setup.md",
    "oroc config": "cli/config.md",
    "oroc versions": "cli/versions.md",
    "oroc version": "cli/version.md",
}


def family_reference_re(family: str) -> re.Pattern[str]:
    return re.compile(rf"`?{re.escape(family)}(?:/\*|/[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*)`?")


def parse_runtime_specifiers() -> tuple[set[str], set[str]]:
    if not UPSTREAM_RUNTIME_INDEX.exists():
        return set(), set()
    text = UPSTREAM_RUNTIME_INDEX.read_text(encoding="utf-8")
    specifiers = set(MODULE_START.findall(text))
    families = {spec.split("/", 1)[0] for spec in specifiers}
    return families, specifiers


def parse_runtime_cli_sections() -> set[str]:
    if not UPSTREAM_RUNTIME_CLI.exists():
        return set()
    text = UPSTREAM_RUNTIME_CLI.read_text(encoding="utf-8")
    return set(re.findall(r"^##\s+([^\n]+)$", text, re.M))


def iter_runtime_doc_issues() -> list[str]:
    issues: list[str] = []

    if (JAVASCRIPT_DOCS / "module-index.md").exists():
        issues.append(
            f"{(JAVASCRIPT_DOCS / 'module-index.md').relative_to(REPO_ROOT)}: remove this page; link JavaScript API entry points to javascript/overview."
        )

    for path in sorted(JAVASCRIPT_DOCS.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO_ROOT)

        if "console.log(Object.keys(api))" in text:
            issues.append(f"{rel}: remove generic Object.keys(api) examples; document a real usage flow instead.")

        if (
            path.stem not in {"overview", "all-modules"}
            and path.name not in set(CURATED_FILES_BY_FAMILY.values())
            and not EXAMPLE_HEADING_RE.search(text)
        ):
            issues.append(f"{rel}: missing an Examples section.")

    families, specifiers = parse_runtime_specifiers()
    if families and specifiers:
        public_families = {family for family in families if family not in EXCLUDED_PUBLIC_FAMILIES}
        public_specifiers = {
            spec for spec in specifiers if spec.split("/", 1)[0] not in EXCLUDED_PUBLIC_FAMILIES
        }

        for family in sorted(public_families):
            expected = CURATED_FILES_BY_FAMILY.get(family, f"{family.removeprefix('oro:')}.md")
            if not (JAVASCRIPT_DOCS / expected).exists():
                issues.append(
                    f"{(JAVASCRIPT_DOCS / expected).relative_to(REPO_ROOT)}: missing docs page for published module family {family}."
                )

        for family in sorted(EXCLUDED_PUBLIC_FAMILIES):
            excluded_path = JAVASCRIPT_DOCS / f"{family.removeprefix('oro:')}.md"
            if excluded_path.exists():
                issues.append(
                    f"{excluded_path.relative_to(REPO_ROOT)}: excluded private module family {family} should not have a public docs page."
                )

        all_modules = (JAVASCRIPT_DOCS / "all-modules.md").read_text(encoding="utf-8")

        for family in sorted(EXCLUDED_PUBLIC_FAMILIES):
            family_ref = family_reference_re(family)
            if family_ref.search(all_modules):
                issues.append(
                    f"{(JAVASCRIPT_DOCS / 'all-modules.md').relative_to(REPO_ROOT)}: excluded private module family {family} should not appear in the public module listing."
                )

        for spec in sorted(public_specifiers):
            if spec not in all_modules:
                issues.append(
                    f"{(JAVASCRIPT_DOCS / 'all-modules.md').relative_to(REPO_ROOT)}: missing published module specifier {spec}."
                )

    cli_sections = parse_runtime_cli_sections()
    if cli_sections:
        for section, rel_path in sorted(CLI_SECTION_TO_DOC.items()):
            if section not in cli_sections:
                continue
            path = RUNTIME_ROOT / "docs" / "source" / rel_path
            if not path.exists():
                issues.append(
                    f"{path.relative_to(REPO_ROOT)}: missing website docs page for upstream CLI section `{section}`."
                )

    stale_repo_patterns = (
        (re.compile(r"oro-computer/" + r"oro" + r"-runtime"), "deprecated runtime repository alias"),
        (re.compile(r"oro-computer/" + r"legacy" + r"-runtime"), "deprecated runtime repository alias"),
        (re.compile(r"\blegacy" + r"-runtime\b"), "deprecated runtime repository alias"),
    )
    for path in (
        REPO_ROOT / "index.html",
        RUNTIME_ROOT / "index.html",
        RUNTIME_ROOT / "docs" / "index.html",
    ):
        text = path.read_text(encoding="utf-8")
        for pattern, label in stale_repo_patterns:
            if pattern.search(text):
                issues.append(f"{path.relative_to(REPO_ROOT)}: stale runtime repository reference ({label}).")

    return issues


def main() -> int:
    rc = run_site_audit(
        SiteAuditConfig(
            project_root=RUNTIME_ROOT,
            docs_source=RUNTIME_ROOT / "docs" / "source",
            docs_index=RUNTIME_ROOT / "docs" / "index.json",
            missing_index_message="Missing Runtime docs/index.json; run build scripts first.",
            success_message="OK: runtime site audit passed",
        )
    )
    if rc != 0:
        return rc

    issues = iter_runtime_doc_issues()
    if issues:
        for issue in issues[:200]:
            print(issue, file=sys.stderr)
        if len(issues) > 200:
            print(f"... and {len(issues) - 200} more", file=sys.stderr)
        print(f"FAIL: {len(issues)} runtime docs issues", file=sys.stderr)
        return 1

    print("OK: runtime docs audit passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
