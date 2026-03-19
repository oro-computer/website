# WebAssembly Back-End (`wasm32` / `wasm64`)

This document describes the shipped WebAssembly back-end, the target
conventions it uses today, and the remaining ABI boundaries for wasm targets.

## Description

The Silk compiler includes a `wasm32` back-end that emits final `.wasm`
modules from the compiler IR, plus a smaller constant-only fallback path:

- Implementations:
  - IR-backed wasm backend (primary path),
  - constant-only emitter (fallback path).
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
- Shipped capabilities:
  - supports multi-module builds (packages + file imports),
  - emits static data into the wasm data section (string/byte blobs and other
    lowered constants),
  - supports structured control flow (if/while/break/continue) for the shipped
    IR lowering path.
  - does not yet support the concurrency runtime on wasm targets (`task` /
    `async` are not lowered to a wasm-native scheduler); programs using
    concurrency constructs remain outside the wasm backend surface and are
    rejected during code generation.

The CLI exposes these targets via `silk build --target ...` and the shorthand
`silk build --arch wasm32|wasm32-wasi` (see [CLI reference](?p=compiler/cli-silk)
and [`silk(1)`](?p=man/silk.1)).

## Quickstart

### WASI executable

```silk
import std::io;

fn main () -> int {
  std::io::println("hello from wasm wasi");
  return 0;
}
```

```sh
silk build main.slk --target wasm32-wasi -o build/app.wasm
```

### Embedder-facing module

```silk
export fn add (a: int, b: int) -> int {
  return a + b;
}
```

```sh
silk build math.slk --target wasm32-unknown-unknown -o build/math.wasm
```

The resulting module exports the supported `export fn` surface from the root
package and can be loaded by a JS or native wasm embedder.

## Output Model

### Module kinds

The shipped back-end emits a *final* `.wasm` module (not a relocatable object),
analogous to the current `linux/x86_64` “emit a final ELF image” approach.

Relocatable “wasm object” emission is not part of the documented interface; it
would require relocation sections and a defined Silk↔WASM link model.

### Entry points

We need two distinct entrypoint conventions:

- `wasm32-wasi`:
  - emit a `_start` function (no parameters, no results),
  - `_start` calls Silk `fn main () -> int` and then imports/calls WASI
    `proc_exit(exit_code)`.
- `wasm32-unknown-unknown`:
  - export an Silk `main` function for embedder use.
    - Silk `int` lowers as wasm `i64`, so `main`’s return type is `i64` unless
      a target-specific wrapper is introduced.

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

Silk’s back-end assumes 64-bit pointers (`u64`) for native targets. For WASM,
pointer width depends on the target:

- `wasm32`: pointers are `u32` byte offsets into linear memory.
- `wasm64`: pointers are `u64` byte offsets into linear memory.

`string` is represented as `(ptr, len)` and, at the C ABI boundary, as
`SilkString { ptr, len }`. For WASM:

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

Internal calls lower to direct wasm calls using wasm’s native calling
convention (stack machine with typed locals), with the compiler responsible for
lowering Silk IR values onto the wasm value stack.

### `ext` declarations

`ext` declarations should map to wasm imports:

- Each `ext foo = fn (...) -> ...;` becomes an imported function with a stable
  module/name convention (for example `env.foo` by default).
- Each `ext bar = T;` (external global) becomes an imported global when the
  environment supports it, or a function-based accessor in environments that do
  not.

The module/name convention and supported import surface must be documented in
[External declarations (`ext`)](?p=language/ext) (WASM-specific subsection) and in
[CLI reference](?p=compiler/cli-silk).

### WASI integration

For `wasm32-wasi`, stdlib facilities such as `std::io` and `std::fs` use a
target-specific hosted surface rather than the POSIX libc-facing runtime used
on native targets. This implies:

- The hosted stdlib for WASI is a separate std distribution from the POSIX
  `std/` used for `linux/x86_64`.
- The stdlib archive must be target-specific (one archive per target ABI), and
  swapping stdlib roots should remain supported (`--std` / `--nostd` etc.).

## Tooling and Testing Strategy

- Add a small set of WASM end-to-end tests once codegen exists:
  - compile a program to `.wasm`,
  - run it with a runtime appropriate to the target (`wasmtime` for WASI, a JS
    harness for unknown-unknown),
  - assert exit code or exported return value.
- Keep tests target-scoped and avoid requiring network access.

## Design goals

- Keep final-module emission as the stable default interface for wasm targets.
- Define and document a stable Silk↔WASM ABI for exports, imports, strings, and
  static data layout.
- Extend the target story to `wasm64` only once pointer-width and ABI decisions
  are validated end-to-end.
- Add relocatable/object emission only alongside an explicit relocation and
  link model.
