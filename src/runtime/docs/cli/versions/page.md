---
layout: "runtime-docs"
title: "oroc versions"
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
oroc versions [options] [<dependency>]
```

## Options

| Option | Description |
| --- | --- |
| `-f, --format=<format>` | text \| json (default: text) |
| `-V, --verbose` | verbose output |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc versions
oroc versions -f json
oroc versions sqlite
```
