#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path


VIRTNOSIS_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = VIRTNOSIS_ROOT.parent

sys.path.insert(0, str(REPO_ROOT / "tools"))

from site_audit_common import SiteAuditConfig, run_site_audit


def main() -> int:
    return run_site_audit(
        SiteAuditConfig(
            project_root=VIRTNOSIS_ROOT,
            docs_source=VIRTNOSIS_ROOT / "docs" / "source",
            docs_index=VIRTNOSIS_ROOT / "docs" / "index.json",
            missing_index_message="Missing Virtnosis docs/index.json; run build scripts first.",
            success_message="OK: virtnosis site audit passed",
        )
    )


if __name__ == "__main__":
    raise SystemExit(main())
