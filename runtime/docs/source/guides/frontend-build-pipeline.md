# Frontend build pipeline

Most production Oro Runtime applications do not ship raw source files. They run a web build first, then copy the built
artifacts into the runtime bundle. This guide shows a clean pipeline that works for Vite, Rollup, esbuild, or a custom
script without hiding the actual build contract.

## 1) Treat `dist/` as the bundle boundary

Keep source and shipped files separate:

```text
field-notes/
  oro.toml
  copy-map.toml
  package.json
  scripts/
    build-web.sh
  src/
    index.html
    main.js
    styles.css
  dist/
```

Your frontend tooling writes `dist/`. Oro Runtime copies from `dist/` into the application bundle.

## 2) Make the web build explicit in `oro.toml`

```toml
[build]
name = "field-notes"
script = "./scripts/build-web.sh"
copy_map = "copy-map.toml"
env = "API_BASE_URL SENTRY_DSN"
```

`build.script` is the hand-off point between your frontend toolchain and the runtime bundle step.

## 3) Copy only built artifacts

`copy-map.toml`:

```toml
"./dist/index.html" = "index.html"
"./dist/main.js" = "main.js"
"./dist/styles.css" = "styles.css"
"./dist/assets/logo.svg" = "assets/logo.svg"
```

That keeps shipping deterministic. If the build did not produce a file, it does not end up in the app.

## 4) Keep the build script boring

`scripts/build-web.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

npm ci
npm run build
```

The runtime should not guess how your web build works. A small shell wrapper makes the contract obvious and easy to
reproduce in CI.

## 5) Pass environment intentionally

If your frontend build needs environment variables, declare them instead of relying on everything from the shell:

```toml
[build]
env = "API_BASE_URL SENTRY_DSN RELEASE_CHANNEL"
```

That keeps local machines and CI builds aligned.

## 6) Use the same project model in dev and prod

During development:

```bash
oroc run .
```

For a production build:

```bash
oroc build . --prod
```

The point is not to maintain two different application shapes. The same `oro.toml` and `copy_map` should describe both.

## 7) A practical Vite-style mental model

If your frontend stack already outputs a web app, Oro Runtime is just the native bundling and integration layer:

- Vite/Rollup/esbuild produce `dist/`
- `copy_map` defines what ships
- `oroc run .` and `oroc build .` turn that output into a native application

That keeps your web tooling choice independent from the runtime.

## Considerations

- Do not copy `src/` directly once you have a real build step.
- Keep generated filenames stable unless you also update `copy_map`.
- Put machine-local build secrets in `.ororc` or the CI environment, not in `oro.toml`.

## Next

- [Configure your runtime project](?p=guides/configure-your-runtime-project)
- [Build and package](?p=guides/build-and-package)
- [Configuration reference](?p=config/reference)
