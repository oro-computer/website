---
layout: "docs"
description: "Get the list of connected devices."
docsCollection: "runtime"
section: "cli"
order: 31
sourcePath: "cli/list-devices.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc list-devices`](/runtime/docs/cli/list-devices/)

Get the list of connected devices.

## Usage

```bash
oroc list-devices [options] --platform=<platform>
```

## Options

| Option | Description |
| --- | --- |
| `--platform=<platform>` | android \| ios |
| `--ecid` | show device ECID (iOS only) |
| `--udid` | show device UDID (iOS only) |
| `--only` | print only the first device identifier (iOS only) |
