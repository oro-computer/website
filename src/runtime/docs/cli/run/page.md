---
layout: "docs"
description: "Run an Oro Runtime application."
docsCollection: "runtime"
section: "cli"
order: 25
sourcePath: "cli/run.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc run`](/runtime/docs/cli/run/)

Run an Oro Runtime application.

You can provide a project directory, HTML file, or JavaScript module. When no `oro.toml` is found, [`oroc`](/runtime/docs/cli/oroc/) can infer a
minimal configuration automatically.

Build before launching, and rebuild after changing bundled source or configuration:

```bash
oroc build .
oroc run .
```

The current `run` implementation launches an existing artifact. Its help examples describe a build-and-launch flow, but `run` itself does not rebuild the project.

## Usage

```bash
oroc run [options] [<project-or-source>]
```

## Options

| Option | Description |
| --- | --- |
| `--headless` | run application in headless mode (without frame or window) |
| `--platform=<platform>` | platform target to run application on (defaults to host):<br>- android<br>- android-emulator<br>- ios<br>- ios-simulator |
| `--config=<path>` | use an explicit oro.toml/oro.ini file |
| `--port=<port>` | load "index.html" from a specific port (if host is not specified, defaults to localhost) |
| `--host=<host>` | load "index.html" from a specific host (if port is not specified, defaults to 80) |
| `--prod` | build for production (disables debugging info, inspector, etc.) |
| `--test[=path]` | indicate test mode, optionally importing a test file relative to resource files |
| `-D, --debug` | enable debug mode |
| `-q, --quiet` | hint for less log output |
| `-E, --env` | add environment variables |
| `-V, --verbose` | enable verbose output |
| `--allow-exec` | allow external command execution (gates ndk-build/gradle/git/build scripts) |
| `--tls-keylog=<path>` | write NSS TLS key log lines to `<path>` (OpenSSL provider) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Environment

| Variable | Meaning |
| --- | --- |
| `ORO_DEBUG` | enable debug mode (like -D) |
| `ORO_VERBOSE` | enable verbose logs (like -V) |

## Common errors

- CI/Linux headless: install `xvfb-run` or set a custom headless runner in your config.
- Use `--test=path` to run tests bundled with your app.
