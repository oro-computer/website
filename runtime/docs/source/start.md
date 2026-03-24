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

## CLI input forms

The CLI accepts three common inputs:

- a **project directory** containing `oro.toml`
- a single **HTML entry point**
- a single **JavaScript module**

That means you can start with a full project or point `oroc run` / `oroc build` at one source file while the CLI infers a minimal configuration.

## Ask AI / `llms.txt`

For AI assistants and LLM tooling:

- Whole-site pack: [`llms.txt`](../../llms.txt)
- Runtime docs pack: [`runtime/llms.txt`](../llms.txt)

## A native “hello world”

Project layout:

```text
hello/
  oro.toml
  copy-map.toml
  src/
    index.html
    peer.html
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
"./src/index.html" = "index.html"
"./src/peer.html" = "peer.html"
"./src/main.js" = "main.js"
```

`src/index.html`:

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hello · Oro Runtime</title>

  <main>
    <h1>Oro Runtime</h1>
    <p id="status">Starting native runtime demo…</p>
    <button id="open-peer" type="button">Open peer window</button>
  </main>

  <script type="module" src="./main.js"></script>
</html>
```

`src/peer.html`:

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Peer window · Oro Runtime</title>

  <main>
    <h1>Second native window</h1>
    <p>This window was created with <code>oro:application</code>.</p>
  </main>
</html>
```

`src/main.js`:

```js
import application from 'oro:application'
import { showNotification } from 'oro:notification'

const status = document.getElementById('status')
const openPeer = document.getElementById('open-peer')
const currentWindow = await application.getCurrentWindow()

const { width, height } = await application.getScreenSize()
await currentWindow.setTitle(`Oro Runtime · ${width}×${height}`)

status.textContent = [
  `isOroRuntime=${globalThis.isOroRuntime === true}`,
  `runtime=${application.runtimeVersion}`,
  `screen=${width}×${height}`,
].join(' · ')

openPeer.addEventListener('click', async () => {
  const peer = await application.getWindow(1, { max: false })

  if (peer) {
    await peer.focus()
  } else {
    await application.createWindow({
      index: 1,
      path: 'peer.html',
      title: 'Peer window',
      width: 420,
      height: 320,
    })
  }

  await showNotification('Hello from Oro Runtime', {
    body: 'Opened a second native window from web code.',
  })
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
