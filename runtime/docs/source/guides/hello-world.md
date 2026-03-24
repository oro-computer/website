# Hello world

This guide builds a small Oro Runtime app that does three things immediately:

- renders ordinary HTML in the main window,
- opens a second native window through `oro:application`,
- raises a desktop notification through `oro:notification`.

That makes the first example useful as a product demo, not just a smoke test.

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

## 2) Add `oro.toml`

`oro.toml` is the project configuration file.

```toml
[meta]
bundle_identifier = "com.example.hello"
version = "0.1.0"

[build]
name = "hello"
copy_map = "copy-map.toml"
```

## 3) Add a copy-map

Copy-maps define what files become part of your app bundle:

```toml
"./src/index.html" = "index.html"
"./src/details.html" = "details.html"
"./src/main.js" = "main.js"
```

See: [copy_map](?p=config/copy-map).

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

## 5) Run it

From the project directory:

```bash
oroc run .
```

## 6) Build it

```bash
oroc build .
```

What this example proves in one pass:

- the runtime is hosting ordinary HTML and ES modules,
- `oro:application` can inspect and control native windows,
- `oro:notification` reaches the host notification system,
- a bundled app can span more than one native window without changing the web programming model.

## Optional: run a single HTML file

For quick experiments, `oroc` can infer a minimal configuration when no `oro.toml` is present:

```bash
oroc run src/index.html
```

## Next

- CLI: [oroc run](?p=cli/run) · [oroc build](?p=cli/build)
- Config: [Overview](?p=config/overview)
- JavaScript APIs: [Overview](?p=javascript/overview) · [`oro:application`](?p=javascript/application)
