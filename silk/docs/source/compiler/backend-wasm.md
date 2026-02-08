# WebAssembly Back-End (`wasm32` / `wasm64`)

Status: **Design + initial implementation**.

This document records the initial design and constraints for targeting
WebAssembly from the Silk compiler back-end. It is intended to guide future
implementation work and keep the compiler architecture spec-driven.

## Current Implementation (Phase 1, IR-backed wasm32)

The repository now includes an initial `wasm32` back-end capable of emitting a
final `.wasm` module from the compiler’s IR (CFG-based lowering for the current
subset), plus a smaller constant-only fallback:

- Implementations:
  - IR→WASM backend: `src/backend_wasm_ir.zig` (primary path),
  - constant-only emitter: `src/backend_wasm.zig` (fallback path).
- Supported targets:
  - `wasm32-unknown-unknown`:
    - emits a `.wasm` module exporting `memory` plus exported functions,
    - when a valid `main` exists, exports `main` for embedder use.
  - `wasm32-wasi`:
    - emits a `.wasm` module exporting `memory` and `_start () -> void`,
    - imports `wasi_snapshot_preview1.proc_exit (exit_code: i32) -> void`,
    - `_start` calls Silk `main` and then calls `proc_exit` with the wrapped exit code.
- Export-only modules (no `main`):
  - emit a `.wasm` module exporting `memory` plus each supported `export fn` in
    the root package (suitable for JS/Node-style embedding).
- FFI mapping (WASM):
  - `ext foo = fn (...) -> ...;` becomes an imported function `env.foo`,
  - `ext bar = T;` becomes an imported global `env.bar` (scalar `T`).
- Current capabilities (prototype quality):
  - supports multi-module builds (packages + file imports),
  - emits static data into the wasm data section (string/byte blobs and other
    lowered constants),
  - supports structured control flow (if/while/break/continue) for the current
    IR subset.
  - does not yet support the concurrency runtime on wasm targets (no `task` /
    `async` lowering to a wasm-native scheduler); programs using concurrency
    constructs may fail code generation with a “not implemented yet” error.

The CLI exposes these targets via `silk build --target ...` and the shorthand
`silk build --arch wasm32|wasm32-wasi` (see `docs/compiler/cli-silk.md` and
`docs/man/silk.1.md`).

## Goals

- Support emitting WebAssembly modules for:
  - `wasm32` (32-bit linear-memory addressing),
  - `wasm64` (64-bit linear-memory addressing; future-facing).
- Support both:
  - a hosted environment (`wasm32-wasi`), and
  - an embedder-driven environment (`wasm32-unknown-unknown`, typically JS).
- Preserve Silk’s “native compiler” principle: this is Silk-owned codegen (no C
  transpilation).

## Non-Goals (for initial implementation)

- A full WASM toolchain replacement (linker, LTO, debug formats) on day one.
- A single “portable” stdlib archive usable across all WASM environments
  (WASI vs JS embedder differ in available imports and conventions).
- Universal ABI compatibility with arbitrary third-party wasm linkers before we
  have a stable Silk ↔ WASM ABI specification.

## Output Model

### Module kinds

The initial back-end should emit a *final* `.wasm` module (not a relocatable
object) for the supported subset, analogous to the current `linux/x86_64`
“emit a final ELF image” approach.

Future work may add “wasm object” emission, but it requires relocation sections
and a defined link model.

### Entry points

We need two distinct entrypoint conventions:

- `wasm32-wasi`:
  - emit a `_start` function (no parameters, no results),
  - `_start` calls Silk `fn main () -> int` and then imports/calls WASI
    `proc_exit(exit_code)`.
- `wasm32-unknown-unknown`:
  - export an Silk `main` function for embedder use.
    - Silk `int` is currently lowered as wasm `i64`, so `main`’s return type is
      `i64` unless a wrapper is introduced in the future.

The CLI/ABI must document which convention is used for each target.

### Export-only modules (embedder mode)

For embedder-driven environments (especially `wasm32-unknown-unknown` / JS),
the toolchain also supports emitting a wasm module with **no entry point**
(`main` / `_start`) when the root package contains exported functions.

In this mode, the compiler emits a `.wasm` module that exports each supported
`export fn` declaration from the root package as a wasm export (with parameters
and results lowered according to the current scalar ABI).

Notes:

- For `wasm32-wasi`, export-only modules are intended for embedding; they do
  **not** include an `_start` wrapper and are not directly runnable as WASI
  executables.

## Types, Layout, and Memory

### Integer and float types

- `int` maps to:
  - `i64` in wasm32/wasm64 backends (matching current compiler semantics).
- Fixed-width ints map to their obvious wasm integer types:
  - `u8`/`i8`/`u16`/`i16`/`u32`/`i32` lower to `i32` values (with masking/sign
    rules applied in codegen),
  - `u64`/`i64` lower to `i64` values.
- `f32` and `f64` map to wasm `f32`/`f64`.
- `bool` maps to `i32` (0/1).

### Pointers and `string`

Silk’s current back-end assumes 64-bit pointers (`u64`). For WASM, pointer width
depends on the target:

- `wasm32`: pointers are `u32` byte offsets into linear memory.
- `wasm64`: pointers are `u64` byte offsets into linear memory.

`string` is currently represented as `(ptr, len)` and, at the C ABI boundary,
as `SilkString { ptr, len }`. For WASM:

- In `wasm32`, the natural representation is `(u32 ptr, i64 len)` (or `(u32,u32)`
  if we later choose a fully-32-bit ABI for wasm-only code).
- In `wasm64`, `(u64 ptr, i64 len)` matches the existing layout.

The chosen WASM ABI for strings must be documented and kept stable.

### Static data

- String literals and other constant data should be emitted into the wasm data
  section and referenced by linear-memory offsets.
- The compiler must define a deterministic data layout (alignment rules) so
  field access and pointer arithmetic remain correct.

## Calls, Imports, and FFI

### Internal calls

For the initial subset, internal calls should be direct wasm calls using wasm’s
native calling convention (stack machine with typed locals), with the compiler
responsible for lowering Silk IR values into the wasm value stack.

### `ext` declarations

`ext` declarations should map to wasm imports:

- Each `ext foo = fn (...) -> ...;` becomes an imported function with a stable
  module/name convention (for example `env.foo` by default).
- Each `ext bar = T;` (external global) becomes an imported global when the
  environment supports it, or a function-based accessor in environments that do
  not.

The module/name convention and supported import surface must be documented in
`docs/language/ext.md` (WASM-specific subsection) and in CLI docs.

### WASI integration

For `wasm32-wasi`, stdlib facilities like `std::io` and `std::fs` should
eventually target WASI syscalls rather than libc symbols. This implies:

- The “hosted” stdlib for WASI is a separate std distribution from the POSIX
  `std/` currently used for `linux/x86_64`.
- The stdlib archive must be target-specific (one archive per target ABI), and
  swapping stdlib roots should remain supported (`--std` / `--nostd` etc.).

## Tooling and Testing Strategy

- Add a small set of WASM end-to-end tests once codegen exists:
  - compile a program to `.wasm`,
  - run it with a runtime appropriate to the target (`wasmtime` for WASI, a JS
    harness for unknown-unknown),
  - assert exit code or exported return value.
- Keep tests target-scoped and avoid requiring network access.

## Roadmap (Suggested Phases)

1. **Minimal wasm32 module**: emit a module that exports `main` returning `i32`
   for `fn main () -> int` (constant subset first). (Implemented for `wasm32-unknown-unknown`.)
2. **Data and strings**: support string literals and `string` values backed by
   linear-memory data segments.
3. **Control flow and helpers**: lower the existing IR CFG into wasm blocks,
   loops, branches, and calls.
4. **WASI `_start`**: add the `_start` wrapper and `proc_exit` import for
   `wasm32-wasi`. (Implemented for the constant-main subset.)
5. **wasm64 exploration**: validate pointer-width changes and ABI decisions.

Each phase should be reflected in the docs, and any new CLI surface must be
documented in `docs/compiler/cli-silk.md` and `docs/man/silk.1.md`.
