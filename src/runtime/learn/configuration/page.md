# Configuration

Field Notes keeps its shared settings in `oro.toml`. Use `.ororc` when your machine needs a different build directory.

**Before you start:** continue from [Project layout](/runtime/learn/project-layout/) in `field-notes`.

## 1. Keep the shared output

Your existing `oro.toml` has:

### `oro.toml` — existing build section

```toml
[build]
name = "field-notes"
copy_map = "copy-map.toml"
output = "build"
```

## 2. Override it locally

Create `.ororc` beside `oro.toml`. `settings.build` overrides the shared build settings.

### `.ororc`

```ini
[settings.build]
output = "build-local"
```

Keep `.ororc` ignored, and append the new output directory to `.gitignore`:

### `.gitignore` — append

```text
build-local/
```

## 3. Verify the path

### Terminal

```bash
oroc config --describe build.output
oroc print-build-dir .
oroc build .
oroc run .
```

**Expected result:** the printed path and build output are under **`build-local`**. The app still restores your draft.

Use `print-build-dir` for this check: [formatted config dumps can omit RC overrides](/runtime/docs/cli/config/#notes). See [configuration precedence](/runtime/docs/config/overview/) for the full lookup order.

## Try it yourself

Remove `[settings.build]` from `.ororc` and run `oroc print-build-dir .` again. The path should return to `build`. Leave `.ororc` empty for the next chapter.

## Next

[Preview your draft in another window →](/runtime/learn/windows-and-messaging/)
