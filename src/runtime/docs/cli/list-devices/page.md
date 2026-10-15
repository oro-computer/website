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
| `--platform=<platform>` | platform target to list devices for:<br>- android<br>- ios |
| `-f, --format=<format>` | print as 'text' or 'json' |
| `--json` | shorthand for '--format=json' |
| `--ecid` | show device ECID (ios only) |
| `--udid` | show device UDID (ios only) |
| `--only` | only show ECID or UDID of the first device (ios only) |
| `-V, --verbose` | enable verbose output |
| `--log-file=<path>` | mirror logs to a JSON file |
