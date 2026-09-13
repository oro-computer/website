---
layout: "docs"
title: "oroc env"
description: "Print environment variables relevant to the Oro CLI and build configuration."
docsCollection: "runtime"
section: "cli"
order: 30
sourcePath: "cli/env.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc env`](/runtime/docs/cli/env/)

Print environment variables relevant to the Oro CLI and build configuration.

## Usage

```bash
oroc env
```

## Notes

- Prints a curated set of CLI, runtime, toolchain, and platform variables (for example `ORO_DEBUG`, `JAVA_HOME`, `ANDROID_HOME`, `SIGNTOOL`).
- Merges `[env]` / `env_*` entries from the active configuration and local `.ororc` files when present.
- Filters out unset variables; each line prints as `KEY=VALUE`.
