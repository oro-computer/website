# Notes

This page is a downstream-facing snapshot of what the **reference** Silk compiler and toolchain support end-to-end
today. It is intentionally high-level: each language, standard-library, and compiler page carries the feature-specific
details for its own supported forms.

Use this page to answer:

- What targets and artifact kinds can I rely on today?
- Which parts of Silk are implemented end-to-end versus specified ahead of implementation?
- Where should I look when the compiler rejects a program?

## Quick sanity check

If you want a fast read on what your local toolchain can do today, start here:

```sh
silk check hello.slk
silk build hello.slk -o build/hello
silk package lint
silk targets
silk env
```

- `silk check` tells you whether the parser, resolver, checker, and verifier all
 accept the current module set.
- `silk build` tells you whether the selected backend can lower that checked
 program to the target artifact you want.
- `silk package lint` validates package-root metadata and distribution shape.
- `silk targets` reports the target and artifact matrix for the current
 compiler host.
- `silk env` shows the resolved environment that affects stdlib and package
 discovery.

## End-to-end surfaces

Silk’s current toolchain surface is strongest in four places:

- **Hosted native toolchains**
 - `linux/x86_64` remains the most complete hosted path: checking, testing, building, docs/man generation, package
 tooling, diagnostics, Z3-backed Formal Silk verification, hosted dependencies, and prebuilt stdlib artifacts are
 exercised there first.
 - `macos/arm64` can build and stage the compiler, runtime libraries, headers, std sources, and manpage sources with the
 pinned Zig toolchain. Hosted async/runtime behavior is still Linux-first, and non-const native `macos-aarch64`
 executable lowering is not yet at Linux parity.
 - Native outputs cover executables, object files, static archives, and shared libraries where the selected target/backend
 supports that artifact shape.
- **WebAssembly targets**
 - `wasm32-unknown-unknown` for embedder-facing WebAssembly modules.
 - `wasm32-wasi` for WASI-style entrypoints.
 - See [WebAssembly back-end](?p=compiler/backend-wasm) and [Run WASI modules in Node](?p=usage/howto-run-wasi-node).
- **Package and distribution tooling**
 - `silk.toml` package manifests, package-target builds, and package lint/inspection are part of the public workflow.
 - See [Package manifests](?p=compiler/package-manifests), [Package distribution](?p=compiler/package-distribution),
 and [`silk-package` (1)](?p=man/silk-package.1).
- **Diagnostics and documentation tooling**
 - `silk error`, `silk guide`, `silk doc`, `silk man`, and `silk proto` are documented public surfaces for explaining
 diagnostics, browsing curated guide entries, extracting docs, rendering manpages, and working with protobuf schemas.
 - `silk targets`, `silk graph`, `silk size`, and `silk cache` expose stable
 inspection surfaces for target capabilities, loaded module graphs, artifact
 sizes, and managed cache state.
 - See [Compiler diagnostics](?p=compiler/diagnostics), [`silk-error` (1)](?p=man/silk-error.1),
 [`silk-guide` (1)](?p=man/silk-guide.1), [`silk-proto` (1)](?p=man/silk-proto.1),
 [`silk-targets` (1)](?p=man/silk-targets.1), [`silk-graph` (1)](?p=man/silk-graph.1), and
 [`silk-size` (1)](?p=man/silk-size.1).

## Broader target bring-up

The front-end, package loader, diagnostics, documentation tooling, and much of the ABI reference are broader than the
hosted `linux/x86_64` baseline. In particular:

- Silk documents additional native targets for const-main and ABI-oriented bring-up in the CLI and ABI references.
- The exact target matrix changes faster than this high-level page, so use:
 - [`silk-targets` (1)](?p=man/silk-targets.1) or `silk targets --json`
 - [CLI reference](?p=compiler/cli-silk)
 - [C99 ABI and `libsilk.a`](?p=compiler/abi-libsilk)
 - [`silk` (1)](?p=man/silk.1)

## Supported public surfaces

These are user-facing and expected to stay in sync with the compiler:

- `silk check` — parse, resolve imports, type-check, and optionally verify.
- `silk test` — compile and run language-level tests with TAP output.
- `silk build` — emit artifacts for the selected target and output kind.
- `silk targets` — inspect supported target triples and current-host artifact
 support.
- `silk graph` — inspect the loaded package/module/import graph.
- `silk size` — inspect artifact byte and section sizes.
- `silk package inspect|lint` — inspect distributable package metadata and validate package roots.
- `silk error` / `silk guide` — inspect diagnostics and curated guide entries.
- `silk doc` / `silk man` — extract and render documentation from Silkdoc comments.
- `silk proto` — generate or inspect protobuf-oriented Silk surfaces.
- `silk cache` / `silk env` / `silk format` — managed-cache maintenance,
 environment inspection, and source formatting.
- `silk-lsp` — editor-facing diagnostics, navigation, hover, completion, and related language tooling.

## How to read the rest of the docs

Across the site:

- **Guides** teach the common workflow and give runnable examples.
- **Reference pages** define the syntax, semantics, and current compiler behavior.
- **The spec** describes the full intended language surface, even when implementation is still catching up.

When you need the exact behavior of a feature, prefer the feature page over this summary.

## If the compiler rejects your program

Work in this order:

1. Look up the reported code in [Compiler diagnostics](?p=compiler/diagnostics).
2. Check the feature’s own notes in the language, stdlib, or compiler reference page.
3. Confirm the active target and package/build mode in [CLI reference](?p=compiler/cli-silk).
4. If the docs say the feature should work, file a minimal repro against the Silk compiler repository.
