---
layout: "docs"
description: "Oro Runtime is a cross-platform runtime for building native applications as web applications: HTML/CSS for UI, JavaScript for behavior, and a small native core for OS integration."
docsCollection: "runtime"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Oro Runtime Docs

Oro Runtime is a cross-platform runtime for building native applications as web applications: HTML/CSS for UI, JavaScript
for behavior, and a small native core for OS integration.

Your app runs inside the platform WebView. When you need native capabilities, you import them explicitly as ES modules
under the `oro:*` namespace.

This documentation is organized into:

- **Guides** — the programming model, “hello world”, and common workflows.
- **CLI** — [`oroc`](/runtime/docs/cli/oroc/) commands, flags, and environment variables.
- **Configuration** — `oro.toml`, `.ororc`, and [`copy_map`](/runtime/docs/config/copy-map/).
- **JavaScript APIs** — `oro:*` modules like [`oro:application`](/runtime/docs/javascript/application/), [`oro:window`](/runtime/docs/javascript/window/), and [`oro:hooks`](/runtime/docs/javascript/hooks/).

## CLI input forms

The CLI accepts three common inputs:

- a **project directory** containing `oro.toml`
- a single **HTML entry point**
- a single **JavaScript module**

That means you can start with a full project or point [`oroc run`](/runtime/docs/cli/run/) / [`oroc build`](/runtime/docs/cli/build/) at one source file while the CLI infers a minimal configuration.

For command discovery, start with `oroc help <query>`.

## A native “hello world”

Project layout:

```text
hello/
  oro.toml
  copy-map.toml
  src/
    index.html
    details.html
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
"./src/details.html" = "details.html"
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
    <button id="open-details" type="button">Open details window</button>
  </main>

  <script type="module" src="./main.js"></script>
</html>
```

`src/details.html`:

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Details window · Oro Runtime</title>

  <main>
    <h1>Details window</h1>
    <p>This window was created with <code>oro:application</code>.</p>
  </main>
</html>
```

`src/main.js`:

```js
import application from 'oro:application'
import { showNotification } from 'oro:notification'

const status = document.getElementById('status')
const openDetails = document.getElementById('open-details')
const currentWindow = await application.getCurrentWindow()

const { width, height } = await application.getScreenSize()
await currentWindow.setTitle(`Oro Runtime · ${width}×${height}`)
status.textContent = `Runtime ${application.runtimeVersion} · screen ${width}×${height}`

openDetails.addEventListener('click', async () => {
  const detailsWindow = await application.getWindow(1)

  if (detailsWindow) {
    await detailsWindow.focus()
  } else {
    await application.createWindow({
      index: 1,
      path: 'details.html',
      title: 'Details window',
      width: 420,
      height: 320,
    })
  }

  await showNotification('Hello from Oro Runtime', {
    body: 'Opened a details window from web code.',
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

1. **Start from nothing** — [From zero to first run](/runtime/docs/guides/from-zero-to-first-run/) → [Hello world](/runtime/docs/guides/hello-world/) → [Project layout](/runtime/docs/guides/project-layout/)
2. **Shape the app** — [Configure your runtime project](/runtime/docs/guides/configure-your-runtime-project/) → [Files and sandboxing](/runtime/docs/guides/files-and-sandboxing/) → [Desktop integrations](/runtime/docs/guides/desktop-integrations/)
3. **Add real app value** — [Local data with SQLite](/runtime/docs/guides/local-data-with-sqlite/) → [Secure storage and sessions](/runtime/docs/guides/secure-storage-and-sessions/) → [Calling HTTP APIs](/runtime/docs/guides/calling-http-apis/)
4. **Scale the runtime model** — [Windows and messaging](/runtime/docs/guides/windows-and-messaging/) → [Worker threads for heavy work](/runtime/docs/guides/worker-threads-for-heavy-work/) → [Shared workers across windows](/runtime/docs/guides/shared-workers-across-windows/)
5. **Ship a resilient app** — [Offline-first with service workers](/runtime/docs/guides/offline-first-with-service-workers/) → [Custom protocols and routing](/runtime/docs/guides/custom-protocols-and-routing/) → [Lifecycle hooks and deep links](/runtime/docs/guides/lifecycle-hooks-and-deep-links/)
6. **Production workflows** — [Frontend build pipeline](/runtime/docs/guides/frontend-build-pipeline/) → [Build and package](/runtime/docs/guides/build-and-package/) → [Mobile targets and device installs](/runtime/docs/guides/mobile-targets-and-device-installs/)
7. **Operate and automate** — [Release packaging and signed updates](/runtime/docs/guides/release-packaging-and-signed-updates/) → [Testing and diagnostics](/runtime/docs/guides/testing-and-diagnostics/) → [MCP and agent automation](/runtime/docs/guides/mcp-and-agent-automation/)
8. **Reference** — [oroc](/runtime/docs/cli/oroc/) → [help](/runtime/docs/cli/help/) → [run](/runtime/docs/cli/run/) → [build](/runtime/docs/cli/build/) → [update](/runtime/docs/cli/update/)
9. **Configuration** — [Overview](/runtime/docs/config/overview/) → [copy_map](/runtime/docs/config/copy-map/) → [reference](/runtime/docs/config/reference/)
10. **JavaScript APIs** — [Overview](/runtime/docs/javascript/overview/) → [specifier reference](/runtime/docs/javascript/all-modules/) → [application](/runtime/docs/javascript/application/) → [window](/runtime/docs/javascript/window/) → [hooks](/runtime/docs/javascript/hooks/)
