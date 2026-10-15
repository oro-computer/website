# Windows and messaging

Give your draft a read-only preview. The first click opens a window; later clicks update the same window.

**Before you start:** continue from [Configuration](/runtime/learn/configuration/). Keep the existing editor and save code.

## 1. Add the preview button

Insert this after `</form>` in `src/index.html`, before the status paragraph:

### `src/index.html` — insert after the form

```html
<button id="preview" type="button">Preview draft</button>
```

## 2. Create the preview

### `src/preview.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Draft preview</title>
    <style>
      :root { color-scheme: light dark; font: 18px/1.6 system-ui; }
      main { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
      #draft { white-space: pre-wrap; overflow-wrap: anywhere; }
    </style>
  </head>
  <body>
    <main><h1>Draft preview</h1><p id="draft">Waiting for your draft…</p></main>
    <script type="module" src="./preview.js"></script>
  </body>
</html>
```

### `src/preview.js`

```javascript
import application from 'oro:application'

const draft = document.getElementById('draft')
globalThis.addEventListener('message', (event) => {
  const message = event.data ?? event.detail
  if (message?.type === 'draft:changed' && typeof message.body === 'string') {
    draft.textContent = message.body || 'Your draft is empty.'
  }
})

try {
  const mainWindow = await application.getWindow(0)
  await mainWindow.postMessage({ type: 'preview:ready' })
} catch (error) {
  draft.textContent = `Could not request the draft: ${error.message}`
}
```

The preview installs its listener, then tells the main window (`0`) it is ready. The main window can now send the draft to preview window `1`.

## 3. Connect the editor

Append this to `src/main.js`, below the save handler. It reuses `application`, `noteInput`, and `status` from [First run](/runtime/learn/getting-started/#4-save-the-draft).

### `src/main.js` — append preview handling

```javascript
const previewButton = document.getElementById('preview')

async function sendDraft() {
  const preview = await application.getWindow(1)
  if (preview) {
    await preview.postMessage({ type: 'draft:changed', body: noteInput.value })
  }
}

// The new window asks for data only after its listener is ready.
globalThis.addEventListener('message', (event) => {
  const message = event.data ?? event.detail
  if (message?.type === 'preview:ready') {
    sendDraft().catch((error) => { status.textContent = error.message })
  }
})

previewButton.addEventListener('click', async () => {
  previewButton.disabled = true
  try {
    let preview = await application.getWindow(1)
    if (preview) {
      await preview.focus()
      await sendDraft()
    } else {
      preview = await application.createWindow({
        index: 1,
        path: 'preview.html',
        title: 'Field Notes — preview',
        width: 520,
        height: 420,
      })
      await preview.focus()
    }
  } catch (error) {
    status.textContent = `Could not open preview: ${error.message}`
  } finally {
    previewButton.disabled = false
  }
})
```

A new window requests its first draft; an existing window receives it immediately. Disabling the button during creation prevents duplicate windows. Previewing does not save.

## 4. Include the preview files

Replace `copy-map.toml`. Keep your `styles.css` entry if you added one.

### `copy-map.toml`

```toml
"./src/index.html" = "index.html"
"./src/main.js" = "main.js"
"./src/preview.html" = "preview.html"
"./src/preview.js" = "preview.js"
```

## 5. Try both paths

### Terminal

```bash
oroc build .
oroc run .
```

**Expected result:** type `Check the west gate` and click **Preview draft**. Edit the text and click again: the same window updates. Close the preview and click again to check the first-open path.

If it stays on “Waiting…”, check both scripts and the [bundle paths](/runtime/docs/config/copy-map/).

## Try it yourself

Preview `<strong>Keep this literal</strong>`. You should see the brackets: `textContent` displays the draft without interpreting HTML.

## Next

[Copy your draft and add save notifications →](/runtime/learn/desktop-integrations/)
