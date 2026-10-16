---
layout: "docs"
description: "Build a React notes app with Vite and package its complete static output for desktop and mobile."
docsCollection: "runtime"
section: "guides"
order: 17
sourcePath: "guides/frontend-build-pipeline.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# React and a frontend build pipeline

Build Field Notes with React and Vite, then package the generated web files as a native app. The same static output can target desktop, Android, and iOS.

**Before you start:** install [Oro Runtime and native build tools](/runtime/learn/getting-started/). This example uses Node.js 22.12+ and pins the tooling’s major versions so the configuration below is reproducible. Commit the generated lockfile for exact dependency versions.

## Create the project

```bash
mkdir field-notes-react
cd field-notes-react
npm init -y
npm install react@19 react-dom@19
npm install --save-dev vite@7 @vitejs/plugin-react@5
npm pkg set type=module 'scripts.build=vite build' 'scripts.dev=vite'
mkdir src
```

Create each file below in `field-notes-react`. The HTML entry belongs at the project root for Vite.

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Field Notes</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.jsx"></script>
  </body>
</html>
```

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      external: (id) => id.startsWith('oro:'),
    },
  },
})
```

`base: './'` makes generated asset URLs relative to the bundled page. Vite bundles React and npm dependencies; `external` leaves native `oro:*` imports for Runtime to resolve. The app below uses web globals and needs no native imports. When adding `oro:*` features, preview those inside Runtime; an ordinary browser dev server cannot resolve them.

### `src/main.jsx`

```jsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const storageKey = 'field-notes:react-draft'

function readDraft() {
  try {
    return { text: localStorage.getItem(storageKey) ?? '', message: 'Ready.' }
  } catch (error) {
    return { text: '', message: `Could not restore your draft: ${error.message}` }
  }
}

function FieldNotes() {
  const [initial] = useState(readDraft)
  const [draft, setDraft] = useState(initial.text)
  const [status, setStatus] = useState(initial.message)

  function saveDraft(event) {
    event.preventDefault()
    try {
      localStorage.setItem(storageKey, draft)
      setStatus('Draft saved on this device.')
    } catch (error) {
      setStatus(`Could not save your draft: ${error.message}`)
    }
  }

  return (
    <main>
      <h1>Field Notes</h1>
      <form onSubmit={saveDraft}>
        <label htmlFor="draft">Your draft</label>
        <textarea id="draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button type="submit">Save draft</button>
      </form>
      <p role="status">{status}</p>
      <h2>Preview</h2>
      <p className="preview">{draft || 'Your note will appear here.'}</p>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<FieldNotes />)
```

The controlled textarea updates a live preview. React renders user input as text, including `<` and `>` characters. Saving handles storage failures and preserves the text in the editor. Web globals such as `localStorage`, `fetch`, and `URL` need no imports.

### `src/styles.css`

```css
:root { color-scheme: light dark; font: 18px/1.6 system-ui; }
* { box-sizing: border-box; }
body { margin: 0; }
main {
  max-width: 42rem;
  margin: auto;
  padding: max(1rem, env(safe-area-inset-top))
           max(1rem, env(safe-area-inset-right))
           max(1rem, env(safe-area-inset-bottom))
           max(1rem, env(safe-area-inset-left));
}
label, textarea { display: block; width: 100%; }
textarea { min-height: 12rem; padding: .75rem; font: inherit; }
button { min-height: 44px; margin-top: 1rem; padding: .5rem 1rem; font: inherit; }
.preview { white-space: pre-wrap; overflow-wrap: anywhere; }
```

## Package the web output

### `oro.toml`

```toml
[meta]
bundle_identifier = "com.example.field-notes-react"
title = "Field Notes"
version = "0.1.0"

[build]
name = "field-notes-react"
script = "npm run build"
copy = "dist"
output = "build"

[window]
width = "70%"
height = "80%"
```

`build.script` runs Vite before Runtime copies `dist/`. Copying the whole directory includes generated asset names, CSS, and split chunks. Do not keep the scaffold’s `copy = "src"` or list individual hashed files in a copy map.

```bash
npm run build
oroc build --allow-exec --run .
```

**Expected result:** `dist/index.html` and `dist/assets/` are generated; a native Field Notes window opens. Type `Inspect the north trail`, save, close, and run `oroc run .`: the draft should return. Type `<strong>Keep this text</strong>`: the preview should display the literal text.

Rebuild after source changes with `oroc build --allow-exec --run .`. `oroc run .` launches the existing native artifact. After cloning the project, run `npm ci` before building; dependency installation stays outside the native build hook.

## Use another frontend tool

Vue, Svelte, Preact, and plain JavaScript follow the same hand-off: generate a static HTML entry and assets, copy the entire output directory, and leave `oro:*` imports external. Set asset paths for the bundled location. For frameworks with server rendering, configure their static export or client build; the app bundle needs files it can load locally.

For client-side routes, hash routing works without a server. To use path routes, configure [routing](/runtime/docs/guides/custom-protocols-and-routing/) for direct navigation and reloads.

See the official [React root API](https://react.dev/reference/react-dom/client/createRoot) and [Vite build guide](https://vite.dev/guide/build) for the frontend concepts used here.

## Next

[Build this app for Android or iOS →](/runtime/docs/guides/mobile-targets-and-device-installs/). Explore [web platform APIs](/runtime/docs/guides/web-platform-apis/) and [calling HTTP APIs](/runtime/docs/guides/calling-http-apis/) to add sync.
