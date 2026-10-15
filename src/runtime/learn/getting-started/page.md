# First run

Build **Field Notes**: write a draft, save it, and reopen the app to find it again.

**Before you start:** Node.js 22+, npm, and [native build tools](/runtime/docs/cli/setup/) for desktop Linux, macOS, or Windows. See [platform support](/runtime/docs/guides/platform-support/) for mobile.

## 1. Create the app

### Terminal

```bash
npm install --global @oro-computer/runtime
oroc --version
oroc init field-notes
cd field-notes
```

Run the remaining commands from `field-notes`.

## 2. Name it and choose what ships

Replace `oro.toml`. `copy = "src"` makes `src/index.html` the bundled entry page.

### `oro.toml`

```toml
[meta]
bundle_identifier = "com.example.field-notes"
title = "Field Notes"
version = "0.1.0"

[build]
name = "field-notes"
copy = "src"
output = "build"

[window]
width = "70%"
height = "80%"
```

## 3. Add the editor

Replace `src/index.html`; it loads the `main.js` file you will create next.

### `src/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Field Notes</title>
    <style>
      :root { color-scheme: light dark; font: 18px/1.6 system-ui; }
      main { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
      label, textarea { display: block; width: 100%; box-sizing: border-box; }
      textarea { min-height: 12rem; padding: .75rem; font: inherit; }
      button { min-height: 44px; margin-top: 1rem; padding: .5rem 1rem; font: inherit; }
    </style>
  </head>
  <body>
    <main>
      <h1>Field Notes</h1>
      <form id="note-form">
        <label for="note">Your draft</label>
        <textarea id="note" placeholder="What did you discover today?"></textarea>
        <button type="submit">Save draft</button>
      </form>
      <p id="status" role="status">Ready.</p>
    </main>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

## 4. Save the draft

Create `src/main.js`. The native import sets the window title; the form and storage use web APIs.

### `src/main.js`

```javascript
import application from 'oro:application'

const storageKey = 'field-notes:draft'
const form = document.getElementById('note-form')
const noteInput = document.getElementById('note')
const status = document.getElementById('status')

const currentWindow = await application.getCurrentWindow()
await currentWindow.setTitle('Field Notes — your draft')

try {
  noteInput.value = localStorage.getItem(storageKey) ?? ''
} catch (error) {
  status.textContent = `Could not restore your draft: ${error.message}`
}

function saveDraft() {
  try {
    localStorage.setItem(storageKey, noteInput.value)
    status.textContent = 'Draft saved on this device.'
    return true
  } catch (error) {
    status.textContent = `Could not save your draft: ${error.message}`
    return false
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  saveDraft()
})
```

`preventDefault()` keeps Save on the page. `localStorage` restores the draft on launch; clearing app storage removes it. For multiple notes, use [SQLite](/runtime/docs/guides/local-data-with-sqlite/).

## 5. Try the app

### Terminal

```bash
oroc build .
oroc run .
```

**Expected result:** **Field Notes — your draft** opens. Type `Check the west gate`, save, and look for **Draft saved on this device.** Close and reopen: your text should return.

Rebuild after edits; `oroc run` launches the last build. If the starter page still appears, check that `index.html` loads `./main.js`.

## Try it yourself

Rename the heading and native title to `Workshop Notes`. Build and run again to see which code controls each.

## Next

[Choose which files ship →](/runtime/learn/project-layout/)
