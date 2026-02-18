# Hello world

This guide builds a minimal Oro Runtime app: a web folder + an `oro.toml`, then runs it with `oroc`.

## 1) Create the files

Create this layout:

```text
hello/
  oro.toml
  copy-map.toml
  web/
    index.html
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
"./web/index.html" = "index.html"
"./web/main.js" = "main.js"
```

See: [copy_map](?p=config/copy-map).

## 4) Add a page and a module

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

## 5) Run it

From the project directory:

```bash
oroc run .
```

## 6) Build it

```bash
oroc build .
```

## Optional: run a single HTML file

For quick experiments, `oroc` can infer a minimal configuration when no `oro.toml` is present:

```bash
oroc run web/index.html
```

## Next

- CLI: [oroc run](?p=cli/run) · [oroc build](?p=cli/build)
- Config: [Overview](?p=config/overview)
- JavaScript APIs: [Overview](?p=javascript/overview) · [`oro:application`](?p=javascript/application)

