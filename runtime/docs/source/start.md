# Oro Runtime Docs

Oro Runtime is a cross-platform runtime for building native applications as web applications: HTML/CSS for UI, JavaScript
for behavior, and a small native core for OS integration.

Your app runs inside the platform WebView. When you need native capabilities, you import them explicitly as ES modules
under the `oro:*` namespace.

This documentation is organized into:

- **Guides** — the programming model, “hello world”, and common workflows.
- **CLI** — `oroc` commands, flags, and environment variables.
- **Configuration** — `oro.toml`, `.ororc`, and `copy_map`.
- **JavaScript APIs** — `oro:*` modules like `oro:application`, `oro:window`, and `oro:hooks`.

## A minimal “hello world”

Project layout:

```text
hello/
  oro.toml
  copy-map.toml
  web/
    index.html
    main.js
```

`oro.toml`:

```toml
[meta]
bundle_identifier = "com.example.hello"
version = "0.1.0"

[build]
name = "hello"
copy_map = "copy-map.toml"
```

`copy-map.toml`:

```toml
"./web/index.html" = "index.html"
"./web/main.js" = "main.js"
```

`web/index.html`:

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hello · Oro Runtime</title>

  <main>
    <h1>Hello</h1>
    <p id="status">Starting…</p>
  </main>

  <script type="module" src="./main.js"></script>
</html>
```

`web/main.js`:

```js
import application from 'oro:application'

const status = document.getElementById('status')
status.textContent = `isOroRuntime: ${globalThis.isOroRuntime === true}`

application.getScreenSize().then(({ width, height }) => {
  status.textContent += ` · screen: ${width}×${height}`
})
```

Run it:

```bash
oroc run .
```

Build an installable bundle/package:

```bash
oroc build .
```

## Recommended reading path

1. Guides: [Hello world](?p=guides/hello-world)
2. Guides: [Project layout](?p=guides/project-layout)
3. Guides: [Build and package](?p=guides/build-and-package)
4. CLI: [oroc](?p=cli/oroc) → [run](?p=cli/run) → [build](?p=cli/build) → [update](?p=cli/update)
5. Config: [Overview](?p=config/overview) → [copy_map](?p=config/copy-map) → [reference](?p=config/reference)
6. JavaScript APIs: [Overview](?p=javascript/overview) → [module index](?p=javascript/module-index) → [all module specifiers](?p=javascript/all-modules) → [application](?p=javascript/application) → [window](?p=javascript/window) → [hooks](?p=javascript/hooks)
