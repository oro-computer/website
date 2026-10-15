---
layout: "docs"
description: "Open a second native window and request a desktop notification."
docsCollection: "runtime"
section: "guides"
order: 2
sourcePath: "guides/hello-world.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Hello world

Open a second native window from an HTML page, then show a notification if the user allows it.

**Before you start:** [install the CLI and native tools](/runtime/docs/guides/from-zero-to-first-run/). This example targets desktop hosts. For a connected app tutorial, [build Field Notes](/runtime/learn/getting-started/).

## 1) Create the files

Create this layout:

```text
hello/
  oro.toml
  copy-map.toml
  src/
    index.html
    details.html
    main.js
```

Create `hello` and its `src` folder in your editor, or use your shell. Work from `hello` for the remaining steps. Each filename below is a complete file to create.

## 2) Add `oro.toml`

`oro.toml` is the project configuration file.

```toml
[meta]
bundle_identifier = "com.example.hello"
version = "0.1.0"

[build]
name = "hello"
copy_map = "copy-map.toml"

[permissions]
allow_notifications = true
```

## 3) Add a copy-map

Copy-maps define what files become part of your app bundle:

```toml
"./src/index.html" = "index.html"
"./src/details.html" = "details.html"
"./src/main.js" = "main.js"
```

See: [copy_map](/runtime/docs/config/copy-map/).

## 4) Add a page and a module

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
import process from 'oro:process'
import Notification, { showNotification } from 'oro:notification'

const status = document.getElementById('status')
const openDetails = document.getElementById('open-details')
const currentWindow = await application.getCurrentWindow()

const { width, height } = await application.getScreenSize()
await currentWindow.setTitle(`Oro Runtime · ${width}×${height}`)
status.textContent = `Runtime ${process.version} · screen ${width}×${height}`

openDetails.addEventListener('click', async () => {
  openDetails.disabled = true
  try {
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

    status.textContent = 'Details window opened.'
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await showNotification('Hello from Oro Runtime', {
          body: 'Opened a details window from web code.',
        })
      }
    } catch (error) {
      status.textContent = `Details opened; notification unavailable: ${error.message}`
    }
  } catch (error) {
    status.textContent = `Could not open details: ${error.message}`
  } finally {
    openDetails.disabled = false
  }
})
```

## 5) Run it

From the project directory:

```bash
oroc build .
oroc run .
```

**Expected result:** click **Open details window** to open a second window; click again to focus it. Declining notification permission still leaves the window usable.

For silent notifications, check OS settings. For a page stuck on its starting message, check `main.js` and the copy map, then rebuild.

## 6) Build it

```bash
oroc build .
```

## Optional: run a single HTML file

For quick experiments, [`oroc`](/runtime/docs/cli/oroc/) can infer a minimal configuration when no `oro.toml` is present:

```bash
oroc build src/index.html
oroc run src/index.html
```

## Next

- CLI: [oroc run](/runtime/docs/cli/run/) · [oroc build](/runtime/docs/cli/build/)
- Config: [Overview](/runtime/docs/config/overview/)
- JavaScript APIs: [Overview](/runtime/docs/javascript/overview/) · [`oro:application`](/runtime/docs/javascript/application/)
