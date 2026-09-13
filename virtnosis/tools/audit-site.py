#!/usr/bin/env python3

from __future__ import annotations

import sys
import os
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[2]
VIRTNOSIS_ROOT = Path(os.environ.get("ORO_SITE_OUTPUT", str(SITE_ROOT / "public"))) / "virtnosis"
REPO_ROOT = VIRTNOSIS_ROOT.parent

sys.path.insert(0, str(SITE_ROOT / "tools"))

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
