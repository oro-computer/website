---
layout: "docs"
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
| `--platform` | platform to print build directory for (defaults to host):<br>- android<br>- android-emulator<br>- ios<br>- ios-simulator |
| `--prod` | indicate production build directory |
| `--root` | print the root build directory |
