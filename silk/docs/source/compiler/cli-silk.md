# `silk` CLI

This page describes the `silk` command-line interface from a downstream user’s perspective.

If you want the “why” and the recommended workflow, start with: [CLI and toolchain](?p=guides/cli).

If you want option-level reference, use the manpages:

- `silk` (1)
- `silk-check` (1), `silk-build` (1), `silk-test` (1)
- `silk-doc` (1), `silk-man` (1), `silk-cc` (1)

## Binary names

- Primary binary: `silk`
- Convenience wrappers (when available):
  - `slc` — behaves like `silk build ...`
  - `slcc` — behaves like `silk cc ...`

The wrappers exist to make common workflows terse without inventing separate tools.

## The key idea: a module set

Every `silk` command operates on a **module set**: the set of `.slk` files compiled together for that invocation.

You define the module set in one of two ways:

1. **Explicit files**
   - example: `silk check src/main.slk src/util.slk`
2. **A package manifest** (`silk.toml`)
   - example: `silk check --package .`

The module set is what makes the CLI predictable: you can always answer “what code is the compiler looking at?”.

## Commands

### `silk check`

`silk check` parses and type-checks a module set without producing an output artifact.

Common uses:

```bash
silk check src/main.slk
silk check src/main.slk src/util.slk
silk check --package .
```

Why it matters:

- fast feedback loops (editors + CI)
- deterministic dependency boundaries (imports resolve within the module set)

### `silk build`

`silk build` compiles and emits an artifact. The output kind is explicit:

```bash
silk build src/main.slk -o build/app                 # executable (default)
silk build src/lib.slk --kind object -o build/lib.o  # object
silk build src/lib.slk --kind static -o build/lib.a  # static library
silk build src/lib.slk --kind shared -o build/lib.so # shared library
```

Target selection is also explicit when needed:

```bash
silk build src/main.slk --target x86_64-linux-gnu -o build/app
silk build src/main.slk --arch wasm32 -o build/app.wasm
```

When building object/static/shared outputs for C consumers, you can emit a header for exported symbols:

```bash
silk build src/lib.slk --kind static -o build/libmylib.a --c-header build/mylib.h
```

### `silk test`

`silk test` discovers and runs language-level `test "name" { ... }` blocks in the module set and emits TAP output.

```bash
silk test src/main.slk
silk test --package .
silk test --filter parser
```

TAP output is designed to integrate with existing test tooling without custom adapters.

### `silk doc` and `silk man`

Silk can extract documentation from doc comments:

```bash
silk doc src/lib.slk -o build/api.md
```

And render a man-style view for a symbol/module/concept:

```bash
silk man std::io
```

This keeps “what the code means” close to the codebase without requiring a separate doc pipeline.

### `silk cc`

`silk cc` is a convenience wrapper around a C compiler invocation. It exists for embedding workflows where you need to link
against Silk artifacts or the Silk embedding library without re-learning the right flags every time.

```bash
silk cc -std=c99 -Wall -Wextra my_program.c -o build/my_program
```

## Standard library resolution (`std::`)

When a module imports `std::...`, the CLI resolves those modules from a configured stdlib root.

Common configuration knobs:

- `--std-root <path>` — override the stdlib root directory
- `SILK_STD_ROOT` — environment variable equivalent
- `--nostd` — disable std auto-loading for `import std::...;` (useful for sandboxed or fully explicit builds)

In addition, hosted builds may support linking against a stdlib archive selected with `--std-lib` / `SILK_STD_LIB`.

## Package builds (`--package`)

When you provide `--package <dir|manifest>`, the CLI loads the module set from `silk.toml`.

This is how you get:

- reproducible module discovery
- named build targets
- build-script driven configuration (when a project wants dynamic target selection)

Reference: `Package manifests` (sidebar → compiler).

## Formal Silk integration

Formal Silk verification is integrated into the normal commands:

- `silk check`
- `silk test`
- `silk build`

Verification is opt-in by syntax (you only pay the proof cost where you write verification directives).

Common knobs:

- `--z3-lib <path>` / `SILK_Z3_LIB` — select the Z3 library used by the verifier
- `--debug` — enable extra debug output for failures (including reproduction scripts when available)

Guide: [Formal Silk](?p=guides/formal-silk)

## Diagnostics

On failure, the CLI prints a diagnostic with a stable error code. This is designed to work for:

- humans (clear messages with locations)
- tools (codes and stable structure)

Reference: `Diagnostics` (sidebar → compiler).

