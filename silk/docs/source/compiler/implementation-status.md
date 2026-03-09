# Implementation status

This page is a downstream-facing snapshot of what the **reference** Silk compiler and toolchain support end-to-end
today. It is intentionally high-level: each language, standard-library, and compiler page carries the feature-specific
details for its own current subset.

Use this page to answer:

- What targets and artifact kinds can I rely on today?
- Which parts of Silk are implemented end-to-end versus specified ahead of implementation?
- Where should I look when the compiler rejects a program?

## What works end-to-end today

Silk’s current toolchain surface is strongest in three places:

- **Hosted native bring-up on `linux/x86_64`**
  - `silk check`, `silk test`, `silk build`, `silk doc`, `silk man`, `silk env`, `silk format`, and `silk package`
    are all part of the public CLI surface.
  - Native outputs currently cover executables, object files, static archives, and shared libraries.
  - Hosted runtime features such as async/task execution, diagnostics, and Z3-backed Formal Silk verification are
    documented and exercised here first.
- **WebAssembly targets**
  - `wasm32-unknown-unknown` for embedder-facing WebAssembly modules.
  - `wasm32-wasi` for WASI-style entrypoints.
  - See [WebAssembly back-end](?p=compiler/backend-wasm) and [Run WASI modules in Node](?p=usage/howto-run-wasi-node).
- **Package and distribution tooling**
  - `silk.toml` package manifests, package-target builds, and package lint/inspection are part of the public workflow.
  - See [Package manifests](?p=compiler/package-manifests), [Package distribution](?p=compiler/package-distribution),
    and [`silk-package` (1)](?p=man/silk-package.1).

## Broader target bring-up

The front-end, package loader, diagnostics, documentation tooling, and much of the ABI reference are broader than the
hosted `linux/x86_64` baseline. In particular:

- Silk documents additional native targets for const-main and ABI-oriented bring-up in the CLI and ABI references.
- The exact target matrix changes faster than this high-level page, so use:
  - [CLI reference](?p=compiler/cli-silk)
  - [C99 ABI and `libsilk.a`](?p=compiler/abi-libsilk)
  - [`silk` (1)](?p=man/silk.1)

## Supported public surfaces

These are user-facing and expected to stay in sync with the compiler:

- `silk check` — parse, resolve imports, type-check, and optionally verify.
- `silk test` — compile and run language-level tests with TAP output.
- `silk build` — emit artifacts for the selected target and output kind.
- `silk package inspect|lint` — inspect distributable package metadata and validate package roots.
- `silk doc` / `silk man` — extract and render documentation from Silkdoc comments.
- `silk env` / `silk format` — environment inspection and source formatting.
- `silk-lsp` — editor-facing diagnostics, navigation, hover, completion, and related language tooling.

## How to read the rest of the docs

Across the site:

- **Guides** teach the common workflow and give runnable examples.
- **Reference pages** define the syntax, semantics, and current compiler subset.
- **The spec** describes the full intended language surface, even when implementation is still catching up.

When you need the exact behavior of a feature, prefer the feature page over this summary.

## If the compiler rejects your program

Work in this order:

1. Look up the reported code in [Compiler diagnostics](?p=compiler/diagnostics).
2. Check the feature’s own “Implementation status” section in the language, stdlib, or compiler reference page.
3. Confirm the active target and package/build mode in [CLI reference](?p=compiler/cli-silk).
4. If the docs say the feature should work, file a minimal repro against the Silk compiler repository.

