---
layout: "docs"
description: "Keep app configuration, web source, and generated builds in separate places."
docsCollection: "runtime"
section: "guides"
order: 3
sourcePath: "guides/project-layout.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Project layout

Keep app configuration, web source, and generated builds in separate places.

## `oro.toml` at a glance

You’ll most commonly touch these sections:

- `[meta]` — identity and versioning (for example `bundle_identifier`, `title`, `version`)
- `[build]` — bundling inputs/outputs (`name`, [`copy_map`](/runtime/docs/config/copy-map/), `output`, `script`, `env`, `headless`)
- `[webview]` — routing and dev workflow (`default_index`, `allow_any_route`, `watch`)
- `[window]` — default window sizing and chrome
- `[permissions]` — runtime permission gates (for example notifications, clipboard, service workers)
- platform overrides: `[mac]`, `[linux]`, `[win]`, `[android]`, `[ios]`

See: [Config overview](/runtime/docs/config/overview/) and [Config reference](/runtime/docs/config/reference/).

## Copy-maps: bundle exactly what you ship

Copy-maps are small TOML/INI files mapping inputs to outputs inside your bundle. They’re designed to make builds
reproducible (and to keep “mystery files” out of your app).

See: [copy_map](/runtime/docs/config/copy-map/).

## Local overrides with `.ororc`

Some values are machine-local or secret (signing identities, provisioning profiles, simulator device names, tokens).
Put those in `.ororc` in the project root. It’s an override file that [`oroc`](/runtime/docs/cli/oroc/) merges with `oro.toml`.

See: [Config overview](/runtime/docs/config/overview/).

## Next

- Guides: [Hello world](/runtime/docs/guides/hello-world/) · [Windows and messaging](/runtime/docs/guides/windows-and-messaging/)
- CLI: [oroc](/runtime/docs/cli/oroc/)
