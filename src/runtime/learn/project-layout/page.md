# Project layout

Your draft works. Now give Field Notes an explicit list of files to ship.

**Before you start:** finish [First run](/runtime/learn/getting-started/), close the app, and work from `field-notes`.

## 1. Map the bundle

Create `copy-map.toml` beside `oro.toml`. Each source path maps to a path inside the bundle.

### `copy-map.toml`

```toml
"./src/index.html" = "index.html"
"./src/main.js" = "main.js"
```

The unused starter scripts can stay in `src`; only these two files will ship.

## 2. Use the map

Replace the existing `[build]` section in `oro.toml`. Remove `copy = "src"`; keep `[meta]` and `[window]`.

### `oro.toml` — replace `[build]`

```toml
[build]
name = "field-notes"
copy_map = "copy-map.toml"
output = "build"
```

The HTML's `./main.js` URL must match the destination `main.js`.

## 3. Check the bundle

### Terminal

```bash
oroc build .
oroc print-build-dir .
oroc run .
```

**Expected result:** saving and reopening still restores the draft. The printed build path is under `build`; its resources include `index.html` and `main.js`.

For missing-file warnings, check the source paths. For load errors, check destinations. See [copy-map rules](/runtime/docs/config/copy-map/).

## Try it yourself

Move the inline CSS into `src/styles.css` and replace the `<style>` block with:

### `src/index.html` — stylesheet link

```html
<link rel="stylesheet" href="./styles.css" />
```

Add `"./src/styles.css" = "styles.css"` to the map. Rebuild: the app should look the same. Keep that entry if you use the stylesheet in later chapters.

## Next

[Give local build settings their own home →](/runtime/learn/configuration/)
