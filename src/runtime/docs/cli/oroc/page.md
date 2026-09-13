---
layout: "runtime-docs"
title: "oroc"
description: "oroc is the Oro Runtime command line tool. It builds, runs, packages, and inspects Oro Runtime projects."
docsCollection: "runtime"
section: "cli"
order: 23
sourcePath: "cli/oroc.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc`](/runtime/docs/cli/oroc/)

[`oroc`](/runtime/docs/cli/oroc/) is the Oro Runtime command line tool. It builds, runs, packages, and inspects Oro Runtime projects.

## Usage

```bash
oroc [SUBCOMMAND] [options] [<project-dir>]
oroc [SUBCOMMAND] -h
```

## Subcommands

- `help` — [Search help and command pages](/runtime/docs/cli/help/)
- `build` — [Build](/runtime/docs/cli/build/)
- `run` — [Run](/runtime/docs/cli/run/)
- `init` — [Create a project](/runtime/docs/cli/init/)
- `setup` — [Install toolchain dependencies](/runtime/docs/cli/setup/)
- `install-app` — [Install to a device/target](/runtime/docs/cli/install-app/)
- `list-devices` — [List connected devices](/runtime/docs/cli/list-devices/)
- `print-build-dir` — [Print build output path](/runtime/docs/cli/print-build-dir/)
- `config` — [Inspect config values](/runtime/docs/cli/config/)
- `env` — [Print relevant environment variables](/runtime/docs/cli/env/)
- `mcp` — [Run an MCP server](/runtime/docs/cli/mcp/)
- `version` — [Inspect or bump project version](/runtime/docs/cli/version/)
- `versions` — [Print CLI/runtime dependency versions](/runtime/docs/cli/versions/)
- `update` — [Update tooling](/runtime/docs/cli/update/)

## Global options

| Option | Description |
| --- | --- |
| `-h, --help` | print help |
| `--prefix` | print install path |
| `-v, --version` | print program version |
| `-q, --quiet` | hint for less log output |
| `-V, --verbose` | verbose output (can be global) |
| `-D, --debug` | debug output (can be global) |
| `--no-color` | disable colored log output |
| `--json` | structured JSON logs on stdout |
| `--log-file=<path>` | mirror logs to a JSON file |

## Logging and debug environment

| Variable | Meaning |
| --- | --- |
| `ORO_DEBUG` | enable debug mode (like `-D`) |
| `ORO_VERBOSE` | enable verbose logs (like `-V`) |
| `ORO_LOG_NO_COLOR` | disable colored log output |
| `ORO_LOG_JSON` | enable structured JSON logs on stdout |
| `ORO_LOG_FILE` | mirror logs to a JSON file |
| `ORO_ALLOW_EXEC` | allow external exec during builds |
| `ORO_ENABLE_SANITIZERS` | enable ASan/UBSan on desktop builds |

## Config discovery (project vs source)

Most commands accept a project directory. `build` and `run` can also take a single HTML file or JavaScript module.
When no `oro.toml` is found, [`oroc`](/runtime/docs/cli/oroc/) infers a minimal configuration automatically.

See: [Config overview](/runtime/docs/config/overview/).
