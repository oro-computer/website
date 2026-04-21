# From zero to first run

This guide starts from an empty directory and gets you to a runnable Oro Runtime application using the installed
toolchain. The goal is not just to boot a page, but to end with a project that already looks like something you can keep.

## 1) Create a project with `oroc init`

Start from any workspace where you want the app directory to live:

```bash
oroc init field-notes
cd field-notes
```

This gives you a project with an `oro.toml`, a default web root, and the minimum bundle metadata the runtime needs.

## 2) Inspect the scaffold

The first files to look at are:

- `oro.toml` — project configuration
- `src/index.html` — your initial page
- `src/main.js` — your entry module

Use the CLI to confirm what the runtime thinks your configuration is:

```bash
oroc config --format toml
oroc config --describe meta.bundle_identifier
oroc config --describe build.copy_map
```

That gives you the effective config, not just the file on disk.

## 3) Give the app a real identity

Update `oro.toml` so the bundle metadata already looks production-ready:

```toml
[meta]
bundle_identifier = "com.example.field-notes"
title = "Field Notes"
version = "0.1.0"
description = "A small local-first notes app built on Oro Runtime."

[build]
name = "field-notes"
```

This metadata is reused by packaging, installation, and updates later. Setting it early avoids churn.

## 4) Replace the starter page with something useful

`src/index.html`:

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Field Notes</title>

  <main>
    <h1>Field Notes</h1>
    <p id="status">Booting…</p>
    <button id="capture" type="button">Capture note</button>
  </main>

  <script type="module" src="./main.js"></script>
</html>
```

`src/main.js`:

```js
import application from 'oro:application'

const status = document.getElementById('status')
const capture = document.getElementById('capture')
const currentWindow = await application.getCurrentWindow()

await currentWindow.setTitle('Field Notes')
status.textContent = `Runtime ${application.runtimeVersion}`

capture.addEventListener('click', () => {
  status.textContent = `Captured at ${new Date().toLocaleTimeString()}`
})
```

That already proves three things:

- the runtime is serving ordinary HTML and ES modules,
- `oro:application` is available from the main window,
- the project is ready to grow into a real app instead of a demo snippet.

## 5) Run it locally

```bash
oroc run .
```

Use these when you need more visibility during development:

```bash
oroc run . -D
oroc run . -V --log-file runtime-log.json
```

## 6) Confirm the build path

Before you add more files, learn where the runtime writes outputs:

```bash
oroc print-build-dir .
oroc build .
```

At this point you have a working app, a stable bundle identifier, and a buildable project model.

## Next

- [Hello world](?p=guides/hello-world)
- [Configure your runtime project](?p=guides/configure-your-runtime-project)
- [Project layout](?p=guides/project-layout)
