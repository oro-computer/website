---
layout: "runtime-docs"
title: "Build and package"
description: "This guide summarizes the workflows downstream app developers use most:"
docsCollection: "runtime"
section: "guides"
order: 7
sourcePath: "guides/build-and-package.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Build and package

This guide summarizes the workflows downstream app developers use most:

- run an app locally during development
- bundle and package an app for distribution
- install onto a device/target
- prepare update artifacts and serve them

## 1) Install toolchain dependencies

For host builds, [`oroc setup`](/runtime/docs/cli/setup/) with no `--platform` installs dependencies for your host OS. To target a platform:

```bash
oroc setup --platform=android
oroc setup --platform=ios
```

See: [`oroc setup`](/runtime/docs/cli/setup/).

## 2) Development loop

From your project directory:

```bash
oroc run .
```

Common knobs:

- `-D/--debug` or `ORO_DEBUG=1` for debug mode
- `-V/--verbose` or `ORO_VERBOSE=1` for verbose logging
- `--log-file=...` to mirror logs to a JSON file

If you want file watching during development, use `webview.watch` / `webview.watch_reload` in `oro.toml`.

See: [`oroc run`](/runtime/docs/cli/run/) and [Configuration reference](/runtime/docs/config/reference/).

## 3) Bundle inputs with [`copy_map`](/runtime/docs/config/copy-map/)

Copy-maps define exactly what files are included in your app bundle.

```toml
"./src/index.html" = "index.html"
"./src/main.js" = "main.js"
```

See: [`copy_map`](/runtime/docs/config/copy-map/).

## 4) Add a web build step (optional, common)

Many apps run a web build step (Vite, Rollup, etc.) and then map the generated output into the runtime bundle.

Use `build.script` to run your web build before the copy phase:

```toml
[build]
script = "./scripts/build-web.sh"
copy_map = "copy-map.toml"
```

## 5) Production build + packaging

For a production build:

```bash
oroc build . --prod --package
```

Packaging is platform-specific (for example Linux deb/rpm, macOS zip/pkg, Windows appx). See:

- [`oroc build`](/runtime/docs/cli/build/)
- [Configuration reference](/runtime/docs/config/reference/)

## 6) Install onto a device/target

List devices:

```bash
oroc list-devices --platform=ios
oroc list-devices --platform=android
```

Install:

```bash
oroc install-app --platform=ios --device <identifier>
oroc install-app --platform=android --device <identifier>
```

See: [`oroc list-devices`](/runtime/docs/cli/list-devices/) and [`oroc install-app`](/runtime/docs/cli/install-app/).

## 7) Build update artifacts (optional)

Update tooling can:

- scaffold and validate update manifests
- bundle app artifacts as tar files
- sign and verify manifests
- run an update server (HTTP/TCP/UDP)

See: [`oroc update`](/runtime/docs/cli/update/).
