---
layout: "docs"
description: "Setup build tools for the host or a target platform."
docsCollection: "runtime"
section: "cli"
order: 27
sourcePath: "cli/setup.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc setup`](/runtime/docs/cli/setup/)

Setup build tools for the host or a target platform.

## Usage

```bash
oroc setup [options] [--platform=<platform>] [-y|--yes]
```

## Options

| Option | Description |
| --- | --- |
| `--platform=<platform>` | platform target to run setup for (defaults to host):<br>- android<br>- ios<br>- linux<br>- windows |
| `-q, --quiet` | hint for less log output |
| `-y, --yes` | answer yes to any prompts |

## Notes

Without `--platform`, setup defaults to the host. Verify with [`oroc env`](/runtime/docs/cli/env/).
