#!/usr/bin/env python3

from __future__ import annotations

import sys
import os
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[2]
SLG_ROOT = Path(os.environ.get("ORO_SITE_OUTPUT", str(SITE_ROOT / "public"))) / "slg"
REPO_ROOT = SLG_ROOT.parent

sys.path.insert(0, str(SITE_ROOT / "tools"))

from site_audit_common import SiteAuditConfig, run_site_audit


def main() -> int:
    return run_site_audit(
        SiteAuditConfig(
            project_root=SLG_ROOT,
            docs_source=SLG_ROOT / "docs" / "source",
            docs_index=SLG_ROOT / "docs" / "index.json",
            missing_index_message="Missing Slg docs/index.json; run build scripts first.",
            success_message="OK: slg site audit passed",
        )
    )


if __name__ == "__main__":
    raise SystemExit(main())
