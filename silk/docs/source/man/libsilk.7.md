# `libsilk` (7) — C99 ABI for the Silk Compiler

> NOTE: This is the Markdown source for a man 7 page describing the C99 embedding ABI exposed by `libsilk.a`. The roff-formatted manpage should be generated from this content.

## Name

`libsilk` — C99-compatible embedding ABI for the Silk compiler.

## Synopsis

```c
#include "silk.h"

/* Core types */
typedef struct SilkString   SilkString;
typedef struct SilkRange    SilkRange;
typedef struct SilkBytes    SilkBytes;
typedef struct SilkCompiler SilkCompiler;
typedef struct SilkModule   SilkModule;
typedef struct SilkError    SilkError;

typedef enum SilkOutputKind SilkOutputKind;

/* Version */
void silk_abi_get_version(int *out_major,
                          int *out_minor,
                          int *out_patch);

/* Lifecycle */
SilkCompiler *silk_compiler_create(void);
void          silk_compiler_destroy(SilkCompiler *compiler);

/* Configuration */
bool silk_compiler_set_stdlib(SilkCompiler *compiler,
                              SilkString    stdlib_name);
bool silk_compiler_set_std_root(SilkCompiler *compiler,
                                SilkString    std_root);
bool silk_compiler_set_nostd(SilkCompiler *compiler,
                             bool          nostd);
bool silk_compiler_set_debug(SilkCompiler *compiler,
                             bool          debug);
bool silk_compiler_set_noheap(SilkCompiler *compiler,
                              bool          noheap);
bool silk_compiler_set_target(SilkCompiler *compiler,
                              SilkString    target_triple);
bool silk_compiler_set_z3_lib(SilkCompiler *compiler,
                              SilkString    path);
bool silk_compiler_set_std_archive(SilkCompiler *compiler,
                                   SilkString    path);
bool silk_compiler_add_needed_library(SilkCompiler *compiler,
                                      SilkString    soname);
bool silk_compiler_add_runpath(SilkCompiler *compiler,
                               SilkString    path);
bool silk_compiler_set_soname(SilkCompiler *compiler,
                              SilkString    soname);
bool silk_compiler_set_optimization_level(SilkCompiler *compiler,
                                          int           level);
bool silk_compiler_set_c_header(SilkCompiler *compiler,
                                SilkString    path);

/* Sources */
SilkModule *silk_compiler_add_source_buffer(SilkCompiler *compiler,
                                            SilkString    name,
                                            SilkString    contents);

/* Build */
bool silk_compiler_build(SilkCompiler   *compiler,
                         SilkOutputKind  kind,
                         SilkString      output_path);
bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                  SilkOutputKind  kind,
                                  SilkBytes      *out_bytes);
void silk_bytes_free(SilkBytes *bytes);

/* Errors */
SilkError *silk_compiler_last_error(SilkCompiler *compiler);
size_t     silk_error_format(const SilkError *error,
                             char            *buffer,
                             size_t           buffer_len);
```

Link with (on `linux/x86_64`, `libsilk.a` vendors Z3 which is built as C++):

```sh
cc -std=c99 -Wall -Wextra \
   -I/path/to/include \
   your_app.c \
   -L/path/to/lib -lsilk \
   -lstdc++ -lpthread -lm
```

## Description

`libsilk.a` exposes a stable C99 ABI for embedding the Silk compiler inside C (or C++) applications. The ABI is designed to be:

- simple and explicit,
- versioned independently of the compiler implementation,
- usable from plain C99 without extensions.

Embedders are expected to:

- include the public header `silk.h`,
- link against `libsilk.a`,
- drive compilation by creating a `SilkCompiler` handle, adding source buffers, and invoking `silk_compiler_build`,
- inspect error details via `silk_compiler_last_error` and `silk_error_format`.

This manpage summarizes the ABI; the normative specification lives in `docs/compiler/abi-libsilk.md`.

## Types

### `SilkString`

```c
typedef struct SilkString {
  char   *ptr;
  int64_t len;
} SilkString;
```

- Represents a UTF‑8 string as a pointer plus a length.
- `ptr` may be `NULL` when `len == 0`.
- Unless explicitly documented otherwise for a given API:
  - functions taking `SilkString` do **not** take ownership of `ptr`,
  - the caller is responsible for the lifetime of the underlying storage.

### `SilkBytes`

```c
typedef struct SilkBytes {
  uint8_t *ptr;
  int64_t  len;
} SilkBytes;
```

- Represents an *owned* byte buffer as a pointer plus a length.
- `ptr` may be `NULL` when `len == 0`.
- Buffers returned by `silk_compiler_build_to_bytes` must be freed with
  `silk_bytes_free`.

### `SilkRange`

```c
typedef struct SilkRange {
  int64_t  start;
  int64_t  end;
  uint64_t flags;
} SilkRange;
```

- Represents the Silk `range` primitive as three scalar slots.
- `flags` is a bitfield:
  - bit 0: `has_end` (when unset, `end` is ignored),
  - bit 1: `inclusive` (only valid when `has_end` is set).

### Opaque handles

```c
typedef struct SilkCompiler SilkCompiler;
typedef struct SilkModule   SilkModule;
typedef struct SilkError    SilkError;
```

- `SilkCompiler` represents a compiler instance and owns configuration, modules, and internal error state.
- `SilkModule` is an opaque handle returned when a source buffer is registered; its layout is not exposed.
- `SilkError` represents a diagnostic object owned by a `SilkCompiler`.

Callers must **never** allocate, free, or dereference these types directly. They are managed exclusively through the ABI functions.

### `SilkOutputKind`

```c
typedef enum SilkOutputKind {
  SILK_OUTPUT_EXECUTABLE     = 0,
  SILK_OUTPUT_STATIC_LIBRARY = 1,
  SILK_OUTPUT_SHARED_LIBRARY = 2,
  SILK_OUTPUT_OBJECT         = 3,
} SilkOutputKind;
```

Selects the kind of build artifact requested by `silk_compiler_build`. At the current stage of implementation, all kinds perform full front‑end validation; code generation is implemented only for a small, constant‑expression subset of executable builds on `linux/x86_64` (see **Build behavior**).

## Versioning

The header defines:

```c
#define SILK_ABI_VERSION_MAJOR 0
#define SILK_ABI_VERSION_MINOR 2
#define SILK_ABI_VERSION_PATCH 0
```

and the function:

```c
void silk_abi_get_version(int *out_major,
                          int *out_minor,
                          int *out_patch);
```

Callers should:

- compare the runtime version returned by `silk_abi_get_version` with the compile‑time macros,
- reject or warn on mismatches as appropriate for their integration.

The ABI is versioned so that future incompatible changes can be detected at runtime.

## Lifecycle

### `silk_compiler_create` / `silk_compiler_destroy`

```c
SilkCompiler *silk_compiler_create(void);
void          silk_compiler_destroy(SilkCompiler *compiler);
```

- `silk_compiler_create`:
  - returns a new compiler handle on success,
  - returns `NULL` on allocation error.
- `silk_compiler_destroy`:
  - may be called with `NULL` (it is a no‑op),
  - must be called exactly once for each non‑`NULL` handle from `silk_compiler_create`,
  - releases all modules and errors owned by the compiler.

A single `SilkCompiler` instance is not currently specified as thread-safe; callers should either confine it to one thread or synchronize access.

## Configuration

### Standard library selection

```c
bool silk_compiler_set_stdlib(SilkCompiler *compiler,
                              SilkString    stdlib_name);
```

- Sets the name of the standard library package (for example `"std"`).
- The function:
  - copies the name internally,
  - returns `true` on success,
  - returns `false` on error and records an error in the compiler.


### Standard library root

```c
bool silk_compiler_set_std_root(SilkCompiler *compiler,
                                SilkString    std_root);
```

- Sets the filesystem stdlib root directory used to resolve `import std::...;` declarations.
- This overrides `SILK_STD_ROOT` (environment variable) and the `std/` working-directory default.
- The function:
  - validates that the directory exists,
  - copies the path internally,
  - returns `true` on success,
  - returns `false` on error and records an error in the compiler.

### Disable stdlib auto-loading (`nostd`)

```c
bool silk_compiler_set_nostd(SilkCompiler *compiler,
                             bool          nostd);
```

- When `nostd` is `true`, the compiler disables filesystem-based stdlib
  auto-loading for `import std::...;`.
- In this mode, any `std::...` packages must be provided explicitly by adding
  the corresponding sources as modules (for example via
  `silk_compiler_add_source_buffer`).

### Debug build mode (`debug`)

```c
bool silk_compiler_set_debug(SilkCompiler *compiler,
                             bool          debug);
```

- Enables the same debug build mode as the CLI (`silk --debug` / `-g`) for the
  supported subset:
  - debug-mode lowering for supported native outputs (e.g. stack traces on
    failed `assert` for `linux/x86_64`),
  - additional Z3 debug output and `.smt2` dump emission on failing Formal Silk
    verification (see `docs/language/formal-verification.md`).
- `--debug` is currently incompatible with `--noheap`.

### No-heap build mode (`noheap`)

```c
bool silk_compiler_set_noheap(SilkCompiler *compiler,
                              bool          noheap);
```

- Enables the same no-heap build mode as the CLI (`silk --noheap`), disabling
  heap-backed allocation for the supported subset.
- `--noheap` is currently incompatible with `--debug`.

### Target triple

```c
bool silk_compiler_set_target(SilkCompiler *compiler,
                              SilkString    target_triple);
```

- Sets the code generation target triple (for example `"x86_64-linux-gnu"`).
- The triple is copied; errors are recorded in the compiler’s last‑error state.
- Supported targets (initial implementation):
  - `linux-x86_64` (default), plus common `x86_64-*-linux-*` triples such as `x86_64-linux-gnu` and `x86_64-unknown-linux-gnu`,
- `wasm32-unknown-unknown` (IR-backed wasm32 mode; emits a final `.wasm` module exporting `memory` and exported functions, including `main` when present; `ext` declarations become imports under `env.<name>`; also supports export-only modules with no `main` for JS/Node-style embedding),
  - `wasm32-wasi` (IR-backed wasm32 WASI mode; emits `memory` and `_start () -> void`, imports `wasi_snapshot_preview1.proc_exit`, and calls Silk `fn main () -> int`; also supports export-only modules for embedding, which do not include `_start`).
- Note: for `wasm32` targets, only `SILK_OUTPUT_EXECUTABLE` is supported. `wasm32-wasi` currently supports only `fn main () -> int` (no argv).

### Z3 dynamic library override (`z3_lib`)

```c
bool silk_compiler_set_z3_lib(SilkCompiler *compiler,
                              SilkString    path);
```

- Configures a Z3 dynamic library override for Formal Silk verification
  (equivalent to `silk --z3-lib <path>`).
- Passing an empty string clears the override and returns to normal Z3
  resolution (including honoring `SILK_Z3_LIB`).

### Stdlib archive override (`std_archive`)

```c
bool silk_compiler_set_std_archive(SilkCompiler *compiler,
                                   SilkString    path);
```

- Configures a stdlib archive override for native builds (equivalent to
  `silk --std-lib <path>`).
- Passing an empty string clears the override and returns to normal stdlib
  archive resolution (including honoring `SILK_STD_LIB`).

### Dynamic linker metadata

These configuration functions affect dynamic metadata emitted for executable and
shared library outputs on platforms/backends that support dynamic linking (the
current target: `linux/x86_64`).

#### `silk_compiler_add_needed_library`

```c
bool silk_compiler_add_needed_library(SilkCompiler *compiler,
                                      SilkString    soname);
```

- Adds a dynamic loader dependency for executable and shared outputs by emitting
  a `DT_NEEDED` entry.
- The `soname` string is copied; the function may be called multiple times
  (duplicates are ignored).
- Ignored for static library and object outputs.
- On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), when an
  executable or shared library imports any external symbols, the compiler
  automatically adds `libc.so.6` as a `DT_NEEDED` dependency (so hosted `std::`
  modules like `std::io` and `std::fs` do not require manually adding libc).
  Additional non-libc dependencies still require explicit `DT_NEEDED` entries
  via this API.
- `DT_NEEDED` entries starting with `libsilk_rt` are rejected: bundled runtime
  helpers are linked statically from `libsilk_rt.a` / `libsilk_rt_noheap.a` and
  must not become runtime loader dependencies.

#### `silk_compiler_add_runpath`

```c
bool silk_compiler_add_runpath(SilkCompiler *compiler,
                               SilkString    path);
```

- Adds a runtime search path element for executable and shared outputs by
  emitting a `DT_RUNPATH` entry.
- The `path` string is copied; the function may be called multiple times
  (duplicates are ignored) and the final `DT_RUNPATH` string is formed by
  joining entries with `:`.
- Ignored for static library and object outputs.

#### `silk_compiler_set_soname`

```c
bool silk_compiler_set_soname(SilkCompiler *compiler,
                              SilkString    soname);
```

- Sets the shared library soname recorded as `DT_SONAME` for shared outputs.
- The `soname` string is copied; passing an empty string clears the configured
  soname (no `DT_SONAME` entry).
- Ignored for executable, static library, and object outputs.

### Optimization level

```c
bool silk_compiler_set_optimization_level(SilkCompiler *compiler,
                                          int           level);
```

- `level` must be in the range `[0, 3]`:
  - `0` — no optimization (fastest compile),
  - `1` — light optimization,
  - `2` — balanced optimization,
  - `3` — aggressive optimization.
- The default optimization level is `0` unless overridden.
- `level >= 1` enables lowering-time pruning of
  unused extern symbols before code generation. This typically reduces output
  size and over-linking when using the prebuilt stdlib archive (`libsilk_std.a`)
  to satisfy auto-loaded `import std::...;` modules.
- Returns:
  - `true` on success,
  - `false` and records an error (e.g. `"invalid optimization level (expected 0-3)"`) when the value is invalid.

### C header generation (`c_header`)

```c
bool silk_compiler_set_c_header(SilkCompiler *compiler,
                                SilkString    path);
```

- Configures C header generation for non-executable outputs (equivalent to the
  CLI `--c-header <path>`).
- Passing an empty string clears the configured header output path.
- The header is written when `silk_compiler_build` succeeds for:
  - `SILK_OUTPUT_OBJECT`,
  - `SILK_OUTPUT_STATIC_LIBRARY`,
  - `SILK_OUTPUT_SHARED_LIBRARY`.
- C header generation is not supported for `silk_compiler_build_to_bytes`.

## Source buffers

### `silk_compiler_add_source_buffer`

```c
  SilkModule *silk_compiler_add_source_buffer(SilkCompiler *compiler,
                                              SilkString    name,
                                              SilkString    contents);
```

- Registers a source buffer with the compiler:
  - `name` is a logical module name used in diagnostics (e.g. `"main.slk"` or `"<memory>"`),
  - `contents` is the UTF‑8 Silk source.
- On success:
  - returns a non‑`NULL` `SilkModule *`,
  - copies both `name` and `contents` into memory owned by the compiler.
- On error:
  - returns `NULL`,
  - records an error describing the cause.

The returned `SilkModule *` must not be freed by the caller and remains valid until the compiler is destroyed.

## Build behavior

### `silk_compiler_build`

```c
bool silk_compiler_build(SilkCompiler   *compiler,
                         SilkOutputKind  kind,
                         SilkString      output_path);
```

- Performs a build for all modules added to the compiler:
  - lexes and parses each module,
  - type‑checks statements and expressions according to the language spec,
  - enforces additional front‑end constraints (see below),
  - stops on the first error.
- `output_path`:
  - is the requested output location for the artifact,
  - for executable outputs (`SILK_OUTPUT_EXECUTABLE`) in the supported subset
    (see below), it is used as the path of the native executable that is
    produced,
  - for other output kinds, it is used as the output file path in supported
    backend subsets; for unsupported programs/targets, no output is written.

Return value:

- On any front‑end error, returns `false` and records a descriptive error string. Examples include:
  - `"unexpected token while parsing module"`,
  - `"type mismatch"`,
  - `"invalid break statement"`,
  - `"invalid continue statement"`,
  - `"invalid return statement"`.
- On success of front‑end validation:
  - for non‑executable outputs (`SILK_OUTPUT_STATIC_LIBRARY`,
    `SILK_OUTPUT_SHARED_LIBRARY`, `SILK_OUTPUT_OBJECT`):
    - on supported targets/backends (currently `linux/x86_64`), the compiler
      attempts code generation for the documented backend subset and returns
      `true` after writing the requested artifact on success,
    - for front‑end valid programs outside that subset (or on unsupported
      targets), the call returns `false` and records either an `E4001` / `E4002`
      formatted diagnostic (unsupported construct / backend failure) or a more
      direct descriptive error string (for example invalid arguments), and does
      not write output.
  - for executable outputs (`SILK_OUTPUT_EXECUTABLE`):
    - if the program satisfies the executable entrypoint rule (below) and
      `main` returns a constant integer expression in the supported subset:
      - the body of `main` must be one of the following:
        - zero or more `let` statements with constant integer initializers
          followed by exactly one `return` of a constant expression built from
          integer literals, `+`, `-`, `*`, `/`, `%`, and references to
          immutable `let` bindings whose initializers are themselves constant
          integer expressions, or
        - a final `if` statement whose condition is a compile‑time boolean
          literal (`true` or `false`) and whose branches each satisfy the same
          “constant lets + `return` constant expression” rule, or
        - one or more trivial constant `while` loops that appear before the
          final `return`, each of which has:
          - a condition that is a compile‑time boolean literal (`true` or
            `false`),
          - for `while false { ... }`, a body that is ignored by the constant
            backend, and
          - for `while true { ... }`, a body consisting of zero or more
            constant `let` statements followed by a `break;`, with no other
            control flow; loop invariants (`#invariant`), variants (`#variant`),
            and monovariants (`#monovariant`) may be present but are treated as
            metadata and do not affect constant evaluation,
      - then `silk_compiler_build`:
        - evaluates the constant integer expression determined by `main`,
        - emits a tiny native executable image *directly* using an Silk‑owned
          backend (no C stub, no external C compiler):
          - currently this backend writes a minimal ELF64 executable for
            `linux/x86_64` whose entrypoint immediately calls
            `sys_exit(value)`,
        - returns `true` on success and leaves the last error unset,
    - if the program is front‑end valid but outside this subset (for example,
      `main` contains non‑constant expressions, references to non‑constant
      values, function calls, or unsupported control flow), or if the backend
      cannot produce an executable for the current platform or output path,
      the call returns `false` and typically records either `"code generation
      is not implemented yet"` or `"failed to build executable output"` as the
      last error.

#### Executable entrypoint rule

For executable builds (`kind == SILK_OUTPUT_EXECUTABLE`), the ABI currently enforces a simple entrypoint rule:

- there MUST be exactly one top‑level function with the signature:

  ```silk
  fn main() -> int { ... }
  ```

  - name: `main`,
  - zero parameters,
  - result type: `int`.

If this condition is not met:

- `silk_compiler_build` returns `false`,
- records an error message such as:
  - `"no valid main function for executable output"`, or
  - `"multiple main functions for executable output"`.

This rule is enforced before code generation exists so that embedders and tests can rely on a stable definition of an “executable module”.

For other `SilkOutputKind` values (static/shared libraries, object files), no `main` entrypoint is required by the current front‑end.

### `silk_compiler_build_to_bytes`

```c
bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                  SilkOutputKind  kind,
                                  SilkBytes      *out_bytes);
```

Builds the requested artifact as an owned in-memory byte buffer instead of
writing to a filesystem path.

- Behavior and supported subsets match `silk_compiler_build` for the same
  `kind` (front‑end validation is always performed; code generation exists only
  for documented target/backend subsets).
- On success:
  - returns `true`,
  - fills `*out_bytes` with `(ptr, len)` describing the produced artifact,
  - leaves the last error unset.
- On error:
  - returns `false`,
  - records an error message retrievable via `silk_compiler_last_error`,
  - and sets `out_bytes` to `{ NULL, 0 }`.

The returned buffer must be freed with:

```c
void silk_bytes_free(SilkBytes *bytes);
```

When `bytes->ptr` is `NULL`, `silk_bytes_free` is a no-op. After freeing, it
clears the struct to `{ NULL, 0 }`.

## Error handling

### `silk_compiler_last_error`

```c
SilkError *silk_compiler_last_error(SilkCompiler *compiler);
```

- Returns a pointer to the last error object produced by operations on `compiler`, or `NULL` if no error is recorded.
- Ownership and lifetime:
  - the pointer is owned by the compiler,
  - it remains valid until:
    - the compiler is destroyed, or
    - a subsequent operation overwrites the last‑error state.
  - callers must not attempt to free it.

### `silk_error_format`

```c
size_t silk_error_format(const SilkError *error,
                         char            *buffer,
                         size_t           buffer_len);
```

- Formats a human‑readable error message into the caller‑provided `buffer`.
- Behavior:
  - writes up to `buffer_len - 1` bytes of UTF‑8 into `buffer`,
  - always NUL‑terminates if `buffer_len > 0`,
  - returns the number of bytes that would be required to format the full message, **excluding** the terminating NUL.
- If the return value is greater than or equal to `buffer_len`, the message was truncated.
- The formatted message is intended for end-user display and follows the standard compiler diagnostic format (error code + optional file/line/column + caret snippet) as specified in `docs/compiler/diagnostics.md`.

Callers can use a two‑step pattern:

1. Call with `buffer = NULL`, `buffer_len = 0` to discover the required size.
2. Allocate a buffer of that size plus one and call again to retrieve the full message.

## Build and link integration

Typical integration in a C99 project:

1. Install or vendor:
  - `include/silk.h`,
   - `libsilk.a`.
2. Include the header from your C source:

   ```c
  #include "silk.h"
   ```

3. Link against the static library:

   ```sh
   cc -std=c99 -Wall -Wextra \
      -I/path/to/include \
      your_app.c \
      -L/path/to/lib -lsilk \
      -lstdc++ -lpthread -lm
   ```

4. Create and drive a compiler instance:

   ```c
   SilkCompiler *compiler = silk_compiler_create();
   if (!compiler) { /* handle allocation error */ }

   silk_compiler_set_stdlib(compiler, make_string("std"));
   silk_compiler_set_target(compiler, make_string("x86_64-linux-gnu"));
   silk_compiler_set_optimization_level(compiler, 2);

   silk_compiler_add_source_buffer(
     compiler,
     make_string("main.slk"),
     make_string("fn main() -> int { return 0; }"));

   if (!silk_compiler_build(compiler, SILK_OUTPUT_EXECUTABLE, make_string("out.exe"))) {
     SilkError *err = silk_compiler_last_error(compiler);
     char buf[256];
     size_t n = silk_error_format(err, buf, sizeof buf);
     /* handle error message in buf */
   }

   silk_compiler_destroy(compiler);
   ```

At this stage, successful builds are limited to the backends implemented by the
compiler:

- On `linux/x86_64`, the compiler can emit native ELF64 executables, objects,
  static libraries, and shared libraries for the current IR subset documented
  in `docs/compiler/abi-libsilk.md` (structured control flow, helper calls,
  limited `string`/`struct`/optional support, and a limited FFI subset).
- On `wasm32-unknown-unknown` and `wasm32-wasi`, executable builds emit `.wasm`
  modules for the current IR-backed wasm32 subset documented in
  `docs/compiler/abi-libsilk.md` (including multi-module builds, export-only
  modules, and `ext` imports under `env.<name>`).
- On other targets, no code generation backend is available yet.
- For well‑typed programs outside these subsets, `silk_compiler_build` fails
  with `E4001` / `E4002` diagnostics (or a more specific build error) until the
  back‑end is extended.

When Formal Silk verification syntax is present (for example `#require`,
`#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`, `#const`), `libsilk` runs the Z3-backed
Formal Silk verifier and fails the build if verification conditions cannot be
proven. The verifier is currently skipped for `std::...` modules until it
covers the full std surface.

## Environment

- `SILK_STD_ROOT` — path to the stdlib root directory used to resolve
  `import std::...;` declarations when the embedder has not called
  `silk_compiler_set_std_root`.
- `SILK_STD_LIB` — path to a target-specific stdlib static archive
  (`libsilk_std.a`). When present, supported executable builds treat auto-loaded
  `std::...` modules as external and resolve their exported functions from this
  archive.
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier.
  When set, it overrides the default vendored Z3 linkage for verification.

## See Also

- `silk` (1) — Silk language compiler CLI.
- `silk_abi_get_version` (3), `silk_compiler` (3), `silk_error` (3), `silk_bytes` (3)
- `silk` (7)
- `docs/compiler/abi-libsilk.md` — normative ABI spec.
- `silk.h` — C99 ABI header in the source tree.
