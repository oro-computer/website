---
layout: "docs"
description: "Build an Oro Runtime application."
docsCollection: "runtime"
section: "cli"
order: 26
sourcePath: "cli/build.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc build`](/runtime/docs/cli/build/)

Build an Oro Runtime application.

You can provide a project directory, HTML file, or JavaScript module. When no `oro.toml` is found, [`oroc`](/runtime/docs/cli/oroc/) can infer a
minimal configuration automatically.

## Usage

```bash
oroc build [options] [<project-or-source>]
```

## Options

| Option | Description |
| --- | --- |
| `--platform=<platform>` | platform target to build application for (defaults to host):<br>- android<br>- android-emulator<br>- ios<br>- ios-simulator |
| `--config=<path>` | use an explicit oro.toml/oro.ini file |
| `--copy=<source:dest>` | extra copy mapping (like [build] copy; can be repeated) |
| `--port=<port>` | load "index.html" from a specific port (if host is not specified, defaults to localhost) |
| `--host=<host>` | load "index.html" from a specific host (if port is not specified, defaults to 80) |
| `--test[=path]` | indicate test mode, optionally importing a test file relative to resource files |
| `--headless` | build application to run in headless mode (without frame or window) |
| `--prod` | build for production (disables debugging info, inspector, etc.) |
| `-D, --debug` | enable debug mode |
| `-E, --env` | add environment variables |
| `-o, --only-build` | only run build step, |
| `-p, --package` | package the app for distribution |
| `-q, --quiet` | hint for less log output |
| `-r, --run` | run after building |
| `-V, --verbose` | enable verbose output |
| `-w, --watch` | watch for changes to rerun build step |
| `--allow-exec` | allow external command execution (gates ndk-build/gradle/git/build scripts) |
| `--sanitizers` | enable developer sanitizers (ASan/UBSan) for desktop core builds |
| `--tls-keylog=<path>` | write NSS TLS key log lines to `<path>` (OpenSSL provider) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Environment

| Variable | Meaning |
| --- | --- |
| `ORO_ALLOW_EXEC` | allow external exec during builds |
| `ORO_ENABLE_SANITIZERS` | enable ASan/UBSan on desktop builds |

## Common errors

- Android builds: run `oroc setup --platform=android` and accept SDK licenses.
- macOS/iOS signing: set `ios.provisioning_profile` (or platform-specific signing keys) in your config.
- “external command execution is disabled”: pass `--allow-exec` or set `ORO_ALLOW_EXEC=1`.

## Platform-specific options

### Linux

| Option | Description |
| --- | --- |
| `-f, --package-format=<format>` | deb \| rpm \| zip \| aur (default: deb) |
| `--sign` | sign Linux packages with GPG (writes .asc next to the artifact) |
| `--sign-key=<id>` | optional GPG key ID/fingerprint for --sign |

Dependencies:

- deb packaging requires `dpkg` and `fakeroot` (example: `sudo apt-get install dpkg-dev fakeroot`)
- rpm packaging requires `rpmbuild` (example: `sudo dnf install rpm-build`)

### macOS

| Option | Description |
| --- | --- |
| `-c, --codesign` | code sign the app with codesign |
| `-n, --notarize` | notarize with notarytool |
| `-f, --package-format=<format>` | zip (default) \| pkg |

Dependencies:

- Xcode and Command Line Tools are required (`xcode-select --install`)
- For Gradle/JDK, install via Homebrew (`brew install gradle openjdk`) or SDKMAN

### iOS

| Option | Description |
| --- | --- |
| `-c, --codesign` | code sign during xcodebuild (requires ios.provisioning_profile in config) |

### Windows

| Option | Description |
| --- | --- |
| `-f, --package-format=<format>` | appx (default) |

Dependencies:

- Windows 10/11 SDK and Visual Studio Build Tools are recommended
- Ensure `signtool.exe` is available (set `SIGNTOOL` or add SDK bin to `PATH`)

## Next

- Run: [`oroc run`](/runtime/docs/cli/run/)
- Config: [copy_map](/runtime/docs/config/copy-map/) · [reference](/runtime/docs/config/reference/)
