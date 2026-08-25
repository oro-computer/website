# CLI and toolchain

Silk’s CLI is designed around a small number of commands that compose well:

1. **repl** — evaluate Silk interactively
2. **check** — parse, resolve imports, type-check, and optionally verify
3. **test** — compile and run language-level tests
4. **build** — produce executables, libraries, objects, or mixed CPU/GPU programs
5. **targets/graph/size** — inspect target support, module graphs, and artifacts
6. **devices/codesign** — delegate platform lifecycle and signing operations
7. **package/cache/doc/man/env/format** — author packages, maintain the cache, generate documentation, inspect the environment, and format source

This guide stays CLI-first: what each command is for, what inputs it accepts, and how the commands fit together in real
workflows.

## The key idea: the module set

Every command runs on a **module set**: the set of `.slk` files compiled together for that invocation.

You can define that set in two ways:

- **Explicit files**
  ```bash
  silk check app.slk util.slk
  ```
- **A package manifest**
  ```bash
  silk check --package .
  ```

That one idea explains most CLI behavior:

- imports only resolve within the active module/package graph
- package boundaries are explicit
- CI and editors get deterministic answers

## `silk repl`: interactive exploration

Use the REPL for quick expressions, declarations, multiline blocks, and
compile-and-run feedback without creating a project first:

```bash
silk repl
```

The full compile-and-run REPL is currently a Linux x86_64 host surface. On
Apple Silicon macOS, session startup and non-printing declaration/state lines
are available while executable evaluation catches up. Use `silk check`,
`silk test`, and `silk build` for repeatable module or package workflows. See
[`silk-repl(1)`](?p=man/silk-repl.1).

## `silk check`: fast feedback

Use `silk check` when you want the cheapest possible answer to “does this compile as a module set?”

```bash
silk check src/main.slk
silk check --package .
silk check --std-root ./toolchains/std src/main.slk
```

Feature detection is available at the command line as well:

```bash
silk check --package . --feature tui --feature renderer=mock
```

That maps directly to `attr(feature="...")` queries in the language reference. See [Attributes](?p=language/attributes).

## `silk test`: language-level tests with TAP

Silk tests live in the language, next to the code they exercise:

```silk
import { expect_equal } from "std/test";

fn add (a: int, b: int) -> int { return a + b; }

test "add returns the sum" {
  expect_equal(3, add(1, 2));
}
```

Typical invocations:

```bash
silk test src/main.slk
silk test --package .
silk test --package . --filter add
silk test --package . --jobs 4
```

The test runner emits TAP v13 output, so it drops into existing CI and terminal tooling cleanly.

## `silk build`: artifacts, targets, and non-Silk inputs

`silk build` is the artifact-producing command. Common output kinds:

```bash
silk build src/main.slk -o build/app
silk build src/lib.slk --kind object -o build/lib.o
silk build src/lib.slk --kind static -o build/libfoo.a
silk build src/lib.slk --kind shared -o build/libfoo.so
silk build src/lib.slk --kind static --c-header build/libfoo.h -o build/libfoo.a
```

### Build inputs

`silk build` is not limited to `.slk` sources. The current toolchain also accepts:

- `.slk` — Silk source files
- `.c` — host-compiled C translation units
- `.o` — relocatable objects
- `.a` — static archives
- `.so` — shared-library dependencies

Examples:

```bash
silk build src/main.slk src/extra.c -o build/app
silk build src/main.slk build/runtime.o vendor/libhelper.a -o build/app
silk build --package . vendor/libsqlite3.so
```

### Target selection

Use `--target` for an exact target triple, or `--arch` as shorthand:

```bash
silk build src/main.slk --target linux-x86_64 -o build/app
silk build src/main.slk --target linux-x86_64-musl -o build/app-musl
silk build src/main.slk --arch wasm32 --kind executable -o build/app.wasm
silk targets
silk targets --json
silk build --list-targets
silk build --list-gpu-targets
silk build --list-archs
```

For shared and executable outputs, the CLI also exposes link metadata such as `--needed`, `--runpath`, and `--soname`.

Linux x86_64 executables can select a separate AMD or NVIDIA device target for
root-package `attr(device=gpu)` functions:

```bash
silk build src/main.slk -o build/app \
  --target linux-x86_64 \
  --gpu-target nvptx64-nvidia-cuda-sm80
```

The host code remains native x86_64 while device functions are embedded in the
same executable. See [Target-neutral GPU compilation](?p=compiler/backend-gpu)
and [Pure-Silk CPU/GPU program](?p=usage/pure-silk-gpu).

## Inspection commands for tools and CI

Several commands have schema-versioned JSON output so editors, CI jobs, and
automation do not need to scrape terminal prose:

```bash
silk check --json src/main.slk
silk targets --json
silk graph --json --package .
silk size --json build/app
silk package inspect --json --package .
silk cache inspect --json
silk devices doctor --json
silk codesign doctor --json
```

Use these when you need stable facts about diagnostics, target capabilities,
the loaded module graph, output artifact size, package metadata, or cache
state.

## Package workflow: `silk.toml`, `silk package`, install/uninstall

Once a project grows beyond a couple of files, switch to a manifest-driven workflow:

```bash
silk check --package .
silk build --package .
silk package inspect --package .
silk package lint --package .
```

Package-target builds and install flows are part of the public CLI:

```bash
silk build --package . --package-target cli
silk build install --package . --prefix /usr/local
silk build uninstall --package . --prefix /usr/local
```

If the package uses `build.slk`, enable it explicitly:

```bash
silk build --package . --build-module
```

See [Package manifests](?p=compiler/package-manifests), [Package distribution](?p=compiler/package-distribution), and
[`silk-package` (1)](?p=man/silk-package.1).

## Platform devices and signing

`silk devices` discovers installed platform SDKs and delegates device or app
lifecycle actions. `silk codesign` does the same for signing and verification
tools:

```bash
silk devices doctor --json
silk devices list --json
silk devices install --kind ios-simulator --app build/MyApp.app
silk devices run --kind ios-simulator --app build/MyApp.app

silk codesign doctor --json
silk codesign verify --platform ios --input build/MyApp.app
```

Exact behavior depends on the SDK tools installed on the host; Silk reports
their paths and delegated output instead of inventing platform state. See
[`silk-devices(1)`](?p=man/silk-devices.1),
[`silk-codesign(1)`](?p=man/silk-codesign.1), and [Build LumenTrail for
iOS](?p=usage/howto-lumen-trail).

## Features and conditional compilation

Feature detection is shared across the manifest format and the CLI:

- root-package features can come from `[build].features` in `silk.toml`
- dependency features come from dependency entries
- ad hoc feature toggles can be passed with `--feature`

Example:

```bash
silk build --package . --feature ui --feature backend=wayland
```

Language-side usage:

```silk
if attr(feature="ui") {
  // compiled only when the "ui" feature is enabled
}
```

## Documentation, man pages, environment, and formatting

The toolchain includes first-party documentation commands:

```bash
silk doc src/main.slk -o build/api.md
silk doc --man --package . my_pkg::client::connect -o build/connect.3
silk man std::io::println
silk man --search println
silk guide read file
silk error E2028
silk help build
silk env
silk fmt src
silk fmt --check .
```

References:

- [`silk-doc` (1)](?p=man/silk-doc.1)
- [`silk-man` (1)](?p=man/silk-man.1)
- [`silk-guide` (1)](?p=man/silk-guide.1)
- [`silk-error` (1)](?p=man/silk-error.1)
- [`silk-env` (1)](?p=man/silk-env.1)
- [`silk-format` (1)](?p=man/silk-format.1)
- [`silk-help` (1)](?p=man/silk-help.1)
- [`silk-targets` (1)](?p=man/silk-targets.1)
- [`silk-graph` (1)](?p=man/silk-graph.1)
- [`silk-size` (1)](?p=man/silk-size.1)

## Embedding and `silk cc`

For host-side integration:

- use `silk build --kind object|static|shared` to generate consumable artifacts
- use `--c-header` for exported-library headers
- use `silk cc` when building host C code that embeds `libsilk`

Deep references:

- [C99 ABI and `libsilk.a`](?p=compiler/abi-libsilk)
- [Zig embedding API](?p=compiler/zig-api)

## Diagnostics

When a command fails, Silk emits a stable error code and a terminal-friendly diagnostic. That makes the CLI usable for:

- interactive development in terminals and editors
- CI log parsing
- embedding/tooling that needs stable error categories

Reference: [Compiler diagnostics](?p=compiler/diagnostics)

## Next

- [Testing](?p=guides/testing)
- [Formal Silk](?p=guides/formal-silk)
