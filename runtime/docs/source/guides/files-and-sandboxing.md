# Files and sandboxing

Most serious applications need two kinds of file access:

- bundled resources that ship with the app,
- mutable user data created at runtime.

Oro Runtime supports both, but you should treat the filesystem sandbox as a feature, not an obstacle.

## 1) Start with a dedicated app-data directory

Create a directory for mutable data inside your working tree or chosen output location:

```js
import * as fs from 'oro:fs/promises'

await fs.mkdir('./data', { recursive: true })
await fs.writeFile('./data/state.json', JSON.stringify({ notes: [] }, null, 2), 'utf8')
```

Use ordinary JSON for early iterations. Move to SQLite once the model is stable.

## 2) Read and write structured files

```js
import * as fs from 'oro:fs/promises'

async function loadState() {
  try {
    const text = await fs.readFile('./data/state.json', 'utf8')
    return JSON.parse(text)
  } catch {
    return { notes: [] }
  }
}

async function saveState(state) {
  await fs.writeFile('./data/state.json', JSON.stringify(state, null, 2), 'utf8')
}
```

This is enough for preferences, cached drafts, import history, and lightweight app state.

## 3) Keep the sandbox enabled by default

The sandbox exists to prevent accidental or unsafe file access:

```toml
[filesystem]
sandbox_enabled = true
no_follow_symlinks = true
```

Keep both on unless you have a concrete reason not to. They make your app’s file behavior easier to reason about.

## 4) Use native pickers for external files

When users need to import or inspect files outside your app’s controlled data directory, use a picker:

```js
import application from 'oro:application'
import * as fs from 'oro:fs/promises'

const currentWindow = await application.getCurrentWindow()
const [path] = await currentWindow.showOpenFilePicker({ multiple: false })

if (path) {
  const text = await fs.readFile(path, 'utf8')
  console.log(text)
}
```

That keeps explicit user intent in the loop.

## 5) Bundle only what the app needs

Your bundle inputs should stay separate from mutable user data:

```toml
"./dist/index.html" = "index.html"
"./dist/main.js" = "main.js"
"./assets/icon.png" = "assets/icon.png"
```

Do not write back into the bundled resource tree at runtime. Treat it as read-only application content.

## 6) A practical rule of thumb

- **Bundle**: HTML, CSS, JS, icons, offline shell assets.
- **Runtime data**: user notes, caches, imported files, session state.
- **Secure storage**: secrets such as refresh tokens or encryption keys.

Keeping those boundaries clean makes packaging, updates, and debugging simpler.

## Next

- [Secure storage and sessions](?p=guides/secure-storage-and-sessions)
- [Local data with SQLite](?p=guides/local-data-with-sqlite)
- [`oro:fs`](?p=javascript/fs)
