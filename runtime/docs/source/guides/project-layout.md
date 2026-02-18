# Project layout

An Oro Runtime project is a directory with:

- an app configuration (`oro.toml`)
- a copy-map (`copy_map`) that defines what gets bundled
- one or more web roots (HTML/CSS/JS that the WebView loads)
- optional backend code for platform work or long-running tasks

A common layout:

```text
my-app/
  oro.toml
  copy-map.toml
  web/
    index.html
    main.js
  backend/
    backend.js
```

## `oro.toml` at a glance

You’ll most commonly touch these sections:

- `[meta]` — identity and versioning (for example `bundle_identifier`, `title`, `version`)
- `[build]` — bundling inputs/outputs (`name`, `copy_map`, `output`, `script`, `env`, `headless`)
- `[webview]` — routing and dev workflow (`default_index`, `allow_any_route`, `watch`)
- `[window]` — default window sizing and chrome
- `[permissions]` — runtime permission gates (for example notifications, clipboard, service workers)
- platform overrides: `[mac]`, `[linux]`, `[win]`, `[android]`, `[ios]`

See: [Config overview](?p=config/overview) and [Config reference](?p=config/reference).

## Copy-maps: bundle exactly what you ship

Copy-maps are small TOML/INI files mapping inputs to outputs inside your bundle. They’re designed to make builds
reproducible (and to keep “mystery files” out of your app).

See: [copy_map](?p=config/copy-map).

## Local overrides with `.ororc`

Some values are machine-local or secret (signing identities, provisioning profiles, simulator device names, tokens).
Put those in `.ororc` in the project root. It’s an override file that `oroc` merges with `oro.toml`.

See: [Config overview](?p=config/overview).

## Next

- Guides: [Hello world](?p=guides/hello-world) · [Windows and messaging](?p=guides/windows-and-messaging)
- CLI: [oroc](?p=cli/oroc)

