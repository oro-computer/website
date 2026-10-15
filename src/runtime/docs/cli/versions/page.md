---
layout: "docs"
description: "Print Oro CLI/runtime and dependency versions."
docsCollection: "runtime"
section: "cli"
order: 46
sourcePath: "cli/versions.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc versions`](/runtime/docs/cli/versions/)

Print Oro CLI/runtime and dependency versions.

## Usage

```bash
oroc versions [options] [<dependency-name>]
```

## Options

| Option | Description |
| --- | --- |
| `-f, --format=<format>` | print as 'text' or 'json' |
| `--json` | shorthand for '--format=json' |
| `-V, --verbose` | enable verbose output |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc versions
oroc versions -f json
oroc versions sqlite
```

## Structured output

`oroc versions --json` is shorthand for `oroc versions --format=json`.
Place `--json` after `versions`; the global form enables log streaming.
