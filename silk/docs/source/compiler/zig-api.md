# Zig Embedding API (Programmatic Compilation)

This document specifies the Zig-facing embedding API for using the Silk
compiler programmatically from Zig code.

It complements (and is intentionally aligned with) the C99 embedding API
documented in `docs/compiler/abi-libsilk.md`.

## Goals

- Allow Zig programs to compile Silk sources into:
  - native executables,
  - ELF relocatable objects (`.o`),
  - static libraries (`.a`),
  - shared libraries (`.so`),
  using the same implementation as the `silk` CLI and `libsilk.a`.
- Support filesystem-free embedding flows by building artifacts into owned
  in-memory byte buffers (and by allowing stdlib auto-loading to be disabled).
- Provide a Zig-friendly wrapper (slices, enums, error unions) over the
  existing embedding surface, while keeping the error semantics consistent.
- Keep the API small and stable: for feature gaps, return an error and surface
  details via the same “last error” mechanism as the C API.

## Relationship to the C ABI

The Zig embedding API is a thin wrapper over the same implementation that backs
`libsilk.a`.

Practical implications:

- The supported language subset and backend constraints are the same as the
  CLI and C API for a given build of the compiler.
- When an operation fails, the compiler records a human-readable last error.
  Zig callers can retrieve it via `Compiler.lastErrorAlloc`.
- The Zig API does not require `@cImport`; it reuses the Zig implementation
  directly.

## Public Module

The Silk compiler repository exports a Zig module named `silk` from `build.zig`
for downstream dependencies.

Downstream build snippet (illustrative):

```zig
const silk = b.dependency("silk", .{ .target = target, .optimize = optimize });
exe.root_module.addImport("silk", silk.module("silk"));
exe.root_module.link_libc = true;
```

Notes:

- The compiler implementation uses libc for filesystem and process I/O in the
  current prototype; downstream artifacts that import the `silk` module should
  link libc.
- The module is source-based: depending on it compiles the compiler into your
  Zig program (this is intended for embedding).

## `Compiler` API

The `silk` module exposes a `Compiler` type for constructing a compilation:

```zig
const silk = @import("silk");

var compiler = try silk.Compiler.init();
defer compiler.deinit();

try compiler.setStdRoot("./std");
try compiler.addSourceBuffer("main.slk", "fn main () -> int { return 0; }");
try compiler.build(.SILK_OUTPUT_EXECUTABLE, "out/hello");
```

For filesystem-free output, use `buildToBytes`:

```zig
var exe_bytes = try compiler.buildToBytes(.SILK_OUTPUT_EXECUTABLE);
defer exe_bytes.deinit();
```

### Configuration

The wrapper mirrors the existing embedding knobs:

- stdlib selection:
  - `setStdRoot(path)` to select the root for `import std::...;` resolution,
  - `setStdlib(name)` to select the stdlib package name (default `std`).
- stdlib auto-loading can be disabled (for sandboxed/WASM-like embedding) via:
  - `setNoStd(true)`.
- target selection: `setTargetTriple(triple)` (currently only a narrow subset
  of targets is implemented by the backend).
- optimization level: `setOptimizationLevel(0..3)`.
- dynamic linking metadata for outputs that support it:
  - `addNeededLibrary(soname)`,
  - `addRunpath(path)`,
  - `setSoname(soname)`.

### Error handling

Most operations return `error.Failed` on error, with details available via:

- `lastErrorAlloc(allocator) -> ?[]u8` (returns an owned UTF-8 message slice).

The last error is overwritten by subsequent operations, matching the C API.

## Stability and scope

The Zig embedding API is intended to remain stable in lockstep with the C ABI
and the `docs/` specification. Any change to this API must update:

- this document,
- the corresponding ABI documentation (for example `docs/compiler/abi-libsilk.md`),
- and add/adjust Zig tests that exercise the affected surface.
