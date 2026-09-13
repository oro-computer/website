---
layout: "runtime-docs"
title: "oroc print-build-dir"
description: "Print the build directory path."
docsCollection: "runtime"
section: "cli"
order: 33
sourcePath: "cli/print-build-dir.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc print-build-dir`](/runtime/docs/cli/print-build-dir/)

Print the build directory path.

## Usage

```bash
oroc print-build-dir [--platform=<platform>] [--prod] [--root] [<project-dir>]
```

## Options

| Option | Description |
| --- | --- |
| `--platform=<platform>` | android \| android-emulator \| ios \| ios-simulator (default: host) |
| `--prod` | use production build directory |
| `--root` | print only the root build directory |
