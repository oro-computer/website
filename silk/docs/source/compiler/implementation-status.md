# Implementation status

This page is a downstream-facing snapshot of what the **reference** Silk compiler/toolchain supports **end-to-end** today.
It is intentionally high-level: each language / stdlib / compiler document includes an “Implementation status” section with
the precise, feature-specific subset.

Use this page to answer:

- “What targets can I build for?”
- “What does the toolchain do end-to-end vs. what is design work?”
- “Where do I look when something is rejected?”

## Supported targets (end-to-end)

Silk has a **hosted** baseline for native systems targets and an IR→WASM backend for `wasm32` targets.

- `linux-x86_64` (hosted): primary target for end-to-end bring-up.
  - Output kinds: executable, object (`.o`), static archive (`.a`), shared library (`.so`).
  - Debug mode support (stack traces for `assert`, Z3 reproduction scripts on failed proofs).
  - REPL support (`silk repl`).
- `wasm32-unknown-unknown`: build WebAssembly modules for embedding.
  - Emits `memory` plus `main` when present, or an export-only module that exposes `export fn` declarations.
  - Note: Silk `int` currently lowers to wasm `i64`, so exported functions using `int` surface as `i64` in wasm.
- `wasm32-wasi`: build WASI-compatible WebAssembly modules.
  - Emits `_start () -> void` and calls `fn main () -> int`, exiting via `wasi_snapshot_preview1.proc_exit`.
  - The `main(argc, argv)` entrypoint form is not supported yet for WASI.
- Other targets: not implemented end-to-end yet.

Details and exact flags live in: [`silk` CLI](?p=compiler/cli-silk) and [WebAssembly back-end](?p=compiler/backend-wasm).

## What’s “supported” vs. “design”

Across the docs:

- “Implementation status” sections describe what the reference compiler accepts and lowers end-to-end.
- The spec and concept docs also describe the broader language design, even when a feature is not yet fully implemented.
- When the compiler rejects a construct, it should do so with a stable error code when the error kind is known.

For “what just happened?”, start with: [Compiler Diagnostics](?p=compiler/diagnostics).

## Toolchain surfaces (public)

These are expected to work on supported targets:

- `silk check` — parse + type-check a module set.
- `silk test` — compile + run language-level `test` declarations (TAP output).
- `silk build` — build artifacts for the active target (`--target`).
- `silk doc` / `silk man` — generate/view docs from Silkdoc comments.
- `silk-lsp` — language-server process for editor integrations (diagnostics and navigation; see [LSP](?p=compiler/lsp-silk)).

## Feature bring-up notes (common)

Some language features depend on runtime and back-end support, so “parses + type-checks” may arrive before “runs
everywhere”.

Two examples:

- Concurrency (`async` / `task`): a hosted runtime exists on `linux-x86_64`, and the language-level subset is documented in
  [Concurrency](?p=language/concurrency) and [Async runtime](?p=compiler/async-runtime).
- Formal verification (Formal Silk): directives such as `#require` / `#assure` / `#invariant` make proofs mandatory for the
  module set (Z3-backed). Start with: [Formal Silk guide](?p=guides/formal-silk) and
  [Formal verification reference](?p=language/formal-verification).

## If you hit a gap

- Look up the error code in: [Compiler Diagnostics](?p=compiler/diagnostics).
- Check the feature’s “Implementation status” section (language / stdlib / compiler page).
- If the docs say it should work, file an issue in the Silk compiler repository with:
  - the smallest repro,
  - your target (`--target`),
  - and the full diagnostic output.

