# Configure your runtime project

Oro Runtime projects are controlled by `oro.toml`, with optional machine-local overrides in `.ororc`. Treat those files as
part of the app contract: they define what ships, how the window behaves, which permissions are enabled, and how builds run.

## 1) Start with a deliberate `oro.toml`

This is a strong baseline for a multi-window desktop/mobile app:

```toml
[meta]
bundle_identifier = "com.example.field-notes"
title = "Field Notes"
version = "0.2.0"
description = "Local-first note capture for field teams."
lang = "en-US"

[build]
name = "field-notes"
copy_map = "copy-map.toml"
output = "build"
script = "./scripts/build-web.sh"
env = "API_BASE_URL SENTRY_DSN"

[webview]
root = "/"
default_index = "/index.html"
allow_any_route = true
watch = true
watch_reload = true

[window]
width = "70%"
height = "80%"
resizable = true

[permissions]
allow_notifications = true
allow_clipboard = true
allow_service_worker = true
```

Use `oro.toml` for values that belong in source control and should be shared by every developer and every CI build.

## 2) Put machine-local values in `.ororc`

`.ororc` is the right place for per-developer values and signing details:

```ini
[build]
platform = ios-simulator

[ios]
simulator_device = "iPhone 15"
provisioning_profile = "/Users/alex/profiles/field-notes.mobileprovision"

[env]
API_BASE_URL = "https://staging.example.com"
```

Keep `.ororc` out of version control. It should describe the local machine, not the product.

## 3) Understand precedence

The effective configuration comes from three places:

1. `oro.toml`
2. `.ororc`
3. explicit CLI flags such as `oroc build --platform=android`

When something behaves unexpectedly, inspect the merged result instead of guessing:

```bash
oroc config --format toml
oroc config --describe webview.root
oroc config --describe permissions.allow_notifications
```

## 4) Use `copy_map` to define your bundle

`copy_map` is where you decide what becomes part of the application bundle:

```toml
"./dist/index.html" = "index.html"
"./dist/main.js" = "main.js"
"./dist/styles.css" = "styles.css"
"./assets/icon.png" = "assets/icon.png"
```

This keeps builds reproducible. If a file is not in the map, it does not ship.

## 5) Use CLI flags only for temporary overrides

These are good for experiments:

```bash
oroc run . --headless
oroc build . --platform=android
oroc build . --prod --package
```

If you need the same behavior every day, move it into config instead of relying on shell memory.

## 6) Validate your mental model with the CLI

Two commands pay for themselves quickly:

```bash
oroc config --list
oroc env
```

The first tells you what keys the current runtime understands. The second shows the environment input the runtime sees.

## Next

- [Files and sandboxing](?p=guides/files-and-sandboxing)
- [Build and package](?p=guides/build-and-package)
- [Configuration reference](?p=config/reference)
