# `copy_map`

Copy-maps let you explicitly map build inputs into your app bundle. They are referenced from `oro.toml`:

```toml
[build]
copy_map = "copy-map.toml"
```

A copy-map file can be TOML or INI. It must contain only top-level key/value pairs:

- **key**: source path (relative to the copy-map file’s directory, unless absolute)
- **value**: destination path inside the bundle (relative to the bundle resource root)

## Minimal example

```toml
"./web/index.html" = "index.html"
"./web/main.js" = "main.js"
"./web/styles.css" = "styles.css"
```

If the destination value is empty, the source is copied into the resource root (advanced; typically avoid this and spell
out the destination).

## Conditional entries (platform + build mode)

Copy-map keys may be prefixed to include entries only on certain platforms or modes:

- `win_...`, `mac_...`, `ios_...`, `linux_...`, `android_...`
- `debug_...`
- `prod_...` / `production_...`

Example:

```toml
"./web/index.html" = "index.html"

"debug_./web/dev-tools.js" = "dev-tools.js"
"prod_./web/dev-tools.js" = ""

"mac_./icons/app.icns" = "icon.icns"
"win_./icons/app.ico" = "icon.ico"
```

## Common pitfalls

- The build warns when a copy-map entry source path doesn’t exist.
- Copy-map TOML must be a single table (no nested tables).
- Prefer paths relative to your project; avoid `..` in build inputs.

