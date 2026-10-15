---
layout: "docs"
description: "Install the app to the device or host target."
docsCollection: "runtime"
section: "cli"
order: 32
sourcePath: "cli/install-app.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc install-app`](/runtime/docs/cli/install-app/)

Install the app to the device or host target.

## Usage

```bash
oroc install-app [--platform=<platform>] [--device=<identifier>] [options]
```

## Options

| Option | Description |
| --- | --- |
| `-D, --debug` | enable debug output |
| `--device[=identifier]` | identifier (ecid, ID) of the device to install to<br>if not specified, tries to run on the current device |
| `--platform=<platform>` | platform to install application to device (defaults to host)::<br>- android<br>- ios |
| `--prod` | install production application |
| `-V, --verbose` | enable verbose output |

## Common errors

- Android: list devices with `adb devices` or pass `--device`.
- iOS/macOS: list devices with `oroc list-devices --platform=ios` and pass `--device`.
