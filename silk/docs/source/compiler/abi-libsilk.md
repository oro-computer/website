# C99 ABI and `libsilk.a`

This document defines the C99 ABI and the interface of the `libsilk.a` static library.

## Goals

- Provide a stable C ABI for embedders.
- Mirror the external-declaration semantics described in `docs/language/ext.md`.
- Keep the ABI small, explicit, and well-documented.

## Library & Headers

- Static library: `libsilk.a`.
- Primary header: `include/silk.h`.

### Linking on `linux/x86_64` (vendored Z3)

On `linux/x86_64`, `libsilk.a` vendors Z3 (via `vendor/lib/x64-linux/libz3.a`) to
support Formal Silk verification. The vendored Z3 static library is built as
**C++**, so downstream embedders linking against `libsilk.a` MUST also link the
system C++ runtime and any required system libraries:

```sh
cc -std=c99 -Wall -Wextra \
   -I/path/to/include your_app.c \
   -L/path/to/lib -lsilk \
   -lstdc++ -lpthread -lm
```

The `silk cc` wrapper adds these flags automatically when linking on
`linux/x86_64`.

The header must define:

- Core bridged types (e.g. `SilkString`, and any other structs or enums used by the ABI).
- Opaque handle types (`SilkCompiler`, `SilkModule`, `SilkError`) and their lifetime rules.
- Entry points for:
  - initializing and shutting down compiler/runtime state,
  - configuring compilation (target triple, stdlib name, optimization level),
  - adding source buffers,
  - compiling Silk source to executables, libraries, or object files,
  - interacting with diagnostics and error reporting.

### Initial C Header Shape (`include/silk.h`)

The initial C header provided in this repository defines:

- `SilkString` mirroring the internal Silk `string` layout:
  - Note: `SilkString` is also the C ABI shape for Silk `regexp` values
    (bytecode-backed `{ ptr, len }`), but the bytes are opaque and not required
    to be null-terminated.

  ```c
  typedef struct SilkString {
      char   *ptr;
      int64_t len;
  } SilkString;
  ```

- `SilkBytes` for owned binary buffers returned by in-memory build APIs:

  ```c
  typedef struct SilkBytes {
      uint8_t *ptr;
      int64_t  len;
  } SilkBytes;
  ```

- Opaque handles:

  ```c
  typedef struct SilkCompiler SilkCompiler;
  typedef struct SilkModule   SilkModule;
  typedef struct SilkError    SilkError;
  ```

- An output-kind enum:

  ```c
  typedef enum SilkOutputKind {
      SILK_OUTPUT_EXECUTABLE = 0,
      SILK_OUTPUT_STATIC_LIBRARY = 1,
      SILK_OUTPUT_SHARED_LIBRARY = 2,
      SILK_OUTPUT_OBJECT = 3,
  } SilkOutputKind;
  ```

- ABI version query:

  ```c
  void silk_abi_get_version(int *out_major,
                            int *out_minor,
                            int *out_patch);
  ```

- Compiler lifecycle:

  ```c
  SilkCompiler *silk_compiler_create(void);
  void          silk_compiler_destroy(SilkCompiler *compiler);
  ```

- Configuration:

  ```c
  bool silk_compiler_set_stdlib(SilkCompiler *compiler, SilkString stdlib_name);
  bool silk_compiler_set_std_root(SilkCompiler *compiler, SilkString std_root);
  bool silk_compiler_set_nostd(SilkCompiler *compiler, bool nostd);
  bool silk_compiler_set_target(SilkCompiler *compiler, SilkString target_triple);
  bool silk_compiler_add_needed_library(SilkCompiler *compiler, SilkString soname);
  bool silk_compiler_add_runpath(SilkCompiler *compiler, SilkString path);
  bool silk_compiler_set_soname(SilkCompiler *compiler, SilkString soname);
  bool silk_compiler_set_optimization_level(SilkCompiler *compiler, int level);
  ```

  `silk_compiler_set_std_root` configures the filesystem stdlib root directory used
  to auto-load `std::...` packages when modules contain `import std::...;`. The
  `std_root` string is copied. When set, it overrides `SILK_STD_ROOT` and the
  working-directory/default search behavior described below.

  `silk_compiler_set_nostd` disables this stdlib auto-loading behavior when set
  to `true`. When `nostd` is enabled, `import std::...;` declarations must be
  satisfied by explicitly adding the corresponding std sources as modules (for
  example via `silk_compiler_add_source_buffer`); the compiler will not consult
  `SILK_STD_ROOT` or the filesystem std root search paths.

  `silk_compiler_set_target` selects the code generation target. The
  `target_triple` string is copied. The initial implementation recognizes:

  - `linux-x86_64` (default), and common `x86_64-*-linux-*` triples such as
    `x86_64-linux-gnu` and `x86_64-unknown-linux-gnu`,
  - `wasm32-unknown-unknown`,
  - `wasm32-wasi` (and other `wasm32` triples containing `wasi`).

  For `wasm32` targets, only `SILK_OUTPUT_EXECUTABLE` is supported. The output
  bytes are a final WebAssembly module (`.wasm`) produced by the IR-backed wasm
  backend (`src/backend_wasm_ir.zig`), with a smaller constant-only fallback for
  programs that fit the constant subset.

  The wasm backend is still early-stage, but it is no longer limited
  to single-module constant programs:

  - Multi-module builds (packages + file imports) are supported.
  - `ext foo = fn (...) -> ...;` declarations become imported functions under
    `env.foo` for `wasm32-unknown-unknown`, analogous to `extern` symbols in C.
  - String and other constant data are emitted into wasm data segments.

  Entrypoint conventions:

  - `wasm32-unknown-unknown`:
    - when a valid executable `main` exists, it is exported as `main` for
      embedder use,
    - when no `main` exists, an export-only module is emitted that exports each
      supported `export fn` from the root package.
  - `wasm32-wasi`:
    - requires `fn main () -> int` (the `main(argc, argv)` form is not supported
      yet for WASI),
    - emits an exported `_start () -> void` wrapper that calls `main` and then
      imports/calls WASI `proc_exit`,
    - export-only modules are supported for embedding (export-only modules do
      not include `_start`).

  `silk_compiler_add_needed_library` records a dynamic loader dependency for
  executable and shared library outputs (emitted as `DT_NEEDED`). The `soname`
  string is copied; the function may be called multiple times (duplicates are
  ignored). For static library and object outputs, the value is ignored.
  On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), when an
  executable or shared library imports any external symbols, the compiler
  automatically adds `libc.so.6` as a `DT_NEEDED` dependency (so embedders do
  not need to manually add libc when using hosted `std::` modules like
  `std::io` and `std::fs`). Additional non-libc dependencies must still be
  declared via `silk_compiler_add_needed_library`.

  `silk_compiler_add_runpath` records a dynamic loader search path element for
  executable and shared library outputs (emitted as `DT_RUNPATH`). The `path`
  string is copied; the function may be called multiple times (duplicates are
  ignored) and the final `DT_RUNPATH` string is formed by joining all entries
  with ':'.

  `silk_compiler_set_soname` configures the shared library soname recorded as
  `DT_SONAME` for shared library outputs. The `soname` string is copied; passing
  an empty string clears the configured soname (no `DT_SONAME` entry). For
  executable, static library, and object outputs, the value is ignored.

- Source management:

  ```c
  SilkModule *silk_compiler_add_source_buffer(SilkCompiler *compiler,
                                              SilkString    name,
                                              SilkString    contents);
  ```

- Building artifacts:

  ```c
  bool silk_compiler_build(SilkCompiler   *compiler,
                           SilkOutputKind  kind,
                           SilkString      output_path);
  ```

  For embedders that need filesystem-free compilation (for example sandboxed
  hosts or WASM-like environments), the ABI also provides an in-memory build
  API that returns an owned byte buffer:

  ```c
  bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                    SilkOutputKind  kind,
                                    SilkBytes      *out_bytes);

  void silk_bytes_free(SilkBytes *bytes);
  ```

  The returned bytes are target-specific: for example an ELF64 binary on
  `linux-x86_64`, or a `.wasm` module on `wasm32` targets.

  Ownership rules:

  - On success, `silk_compiler_build_to_bytes` fills `*out_bytes` with a pointer
    and length describing the produced artifact, and returns `true`.
  - The returned `out_bytes->ptr` is owned by `libsilk.a` and must be freed
    by calling `silk_bytes_free(&bytes)`. Callers must not free the pointer with
    `free()` (or any other allocator).
  - `silk_bytes_free` is a no-op when passed `NULL` or when `bytes->ptr` is
    `NULL`; it always clears the struct to `{ NULL, 0 }`.

  Note: the compiler may still consult the filesystem to auto-load `std::...`
  modules unless `silk_compiler_set_nostd(compiler, true)` has been set.

  At the current stage of implementation:

  - `silk_compiler_build` always performs full front‑end validation for all modules
    added via `silk_compiler_add_source_buffer`:
    - it lexes and parses each module into an internal representation,
    - it then type‑checks the *set* of modules as a unit, taking into account
      package/import relationships and exported constants, according to the
      language grammar and semantics documented under `docs/language/`,
    - if Formal Silk syntax is present (for example `#require`, `#assure`,
      `#assert`, `#invariant`, `#variant`, `#const`), it also runs the Z3-backed verifier
      and fails the build if verification fails (`E3001`..`E3005`),
      - the verifier is currently skipped for stdlib modules (`std::...`),
      - on `linux/x86_64`, Z3 is linked from the vendored static archive
        `vendor/lib/x64-linux/libz3.a`,
      - the verifier honors `SILK_Z3_LIB` (environment variable) to override
        the Z3 dynamic library at runtime,
    - it fails fast on the first front‑end error.
    - when packages/imports are present:
      - `import` declarations must refer to packages that exist in the current
        module set (otherwise a resolver error is reported, such as
        `"unknown imported package"`),
      - exported `let` bindings with explicit type annotations in an imported
        package are treated as ordinary, unqualified names in the importing
        modules for type‑checking purposes (for example, `import util;` and
        `export let answer: int = 42;` in `util` allows `let x: int = answer;`
        in `app`),
      - imported exported functions (`export fn`) are callable across packages
        for the current scalar subset (both unqualified `foo()` and qualified
        `pkg::foo()` call forms are accepted initially), and functions in the
        same package share a call namespace across modules in the same module
        set,
      - duplicate exported names within a single package are reported as a
        resolver error (`"duplicate exported symbol"`).
    - standard library import resolution (first slice):
      - when a module contains `import std::...;`, the compiler will attempt to
        auto-load the referenced `std::...` package modules from a configured
        stdlib root so embedders do **not** need to provide std sources
        explicitly in the common case,
      - the stdlib root is selected via:
        - `silk_compiler_set_std_root` when set, otherwise
        - `SILK_STD_ROOT` (environment variable) when set, otherwise
        - a toolchain default stdlib root.
      - package-to-path mapping is deterministic:
        - `std::foo::bar` resolves to the file `<std_root>/foo/bar.slk`,
      - if the embedder explicitly provides a `std::...` module via
        `silk_compiler_add_source_buffer`, that module is treated as authoritative
        for its package (auto-loading does not replace already-provided packages).
    - stdlib archives (hosted targets):
      - the toolchain may link `std::` from a target-specific stdlib archive
        (`libsilk_std.a`) when available,
      - embedders can select an explicit archive via `SILK_STD_LIB`,
      - when no archive is selected or available, the toolchain may fall back
        to compiling the needed std sources as part of the build.
  - When a front‑end error occurs (e.g. parse error, type mismatch, invalid
    control‑flow such as `break`/`continue`/`return` in the wrong context, or
    other semantic violations), the call returns `false` and
    `silk_compiler_last_error`/`silk_error_format` provide a human‑readable
    description (such as `"unexpected token while parsing module"`,
    `"type mismatch"`, `"invalid break statement"`, `"invalid return statement"`,
    `"missing return statement"`,
    etc.).
  - For executable outputs (`kind == SILK_OUTPUT_EXECUTABLE`), the compiler also
    enforces an entrypoint precondition on the front‑end:
    - there MUST be exactly one top‑level function

      ```silk
      fn main() -> int { ... }
      ```

      with no parameters and a declared result type of `int`,
    - otherwise `silk_compiler_build` fails with an error message such as
      `"no valid main function for executable output"` or
      `"multiple main functions for executable output"`.
  - When all modules pass front‑end validation (including the executable
    entrypoint requirement, where applicable), code generation behavior depends
    on `kind`:
    - for non-executable outputs (`SILK_OUTPUT_OBJECT`, `SILK_OUTPUT_STATIC_LIBRARY`, `SILK_OUTPUT_SHARED_LIBRARY`):
      - `main` is optional, but when more than one valid executable `main` exists in the module set,
        `silk_compiler_build` fails with `"multiple main functions for non-executable output"`,
      - when multiple packages are present in the module set, only exports from the *root package*
        (the package of the first module added to the compiler via `silk_compiler_add_source_buffer`)
        are emitted as globally-visible symbols for that output; other packages are compiled as
        dependencies and their `export` declarations are treated as internal for that output.
      - within the current `linux/x86_64` IR subset, `string` and `regexp` values are supported at ABI boundaries in a C-friendly `SilkString { ptr, len }` layout:
        - `string`/`regexp` parameters lower to two integer-like scalars in order (`u64` pointer, then `i64` byte length) and consume the normal integer argument locations (registers then stack),
        - `string`/`regexp` results return as two integer-like scalars in `rax`/`rdx`,
        - within function bodies, the compiler supports a small `string`/`regexp` expression subset:
          - `string`: string literals, `let` bindings of `string`, `return` of a `string` value, direct calls to `string`-returning helpers, and `==`/`!=`/`<`/`<=`/`>`/`>=` comparisons over `string` values (producing `bool`),
          - `regexp`: regex literals (`/pattern/flags`), `let` bindings of `regexp`, `return` of a `regexp` value, and direct calls between helpers that accept/return `regexp`,
          - other string operations (concatenation, indexing, etc.) are not implemented yet; higher-level regex matching lives in `std::regex` and is routed through `ext` calls.
      - within the current `linux/x86_64` IR subset, a limited `struct` subset is supported at ABI boundaries:
        - within function bodies and internal helper calls, `struct` declarations with 1+ fields of supported value types are supported (scalar primitives, `string`, nested structs, and supported optionals),
        - at ABI boundaries for exported/FFI functions, only ABI-safe structs are currently supported: after slot-flattening, all scalar slots must be `i64`/`u64`/`f64` (until packed ABI mapping for smaller fields is implemented),
        - at the C ABI surface, exported function *parameters* support 1+ slot ABI-safe structs by lowering the struct to its scalar slots in order; downstream C callers should declare separate parameters for 3+ slot structs (by-value C struct parameters are ABI-compatible only for the 1–2 slot cases), while exported function *returns* support 1+ slot ABI-safe structs (3+ slot returns use the native backend’s sret return path and are ABI-compatible with returning an equivalent C struct by value),
        - in all cases, the compiler lowers a struct value into N scalar slots in field order and assigns argument/result locations according to System V AMD64 integer/SSE classification for those slots.
      - within the current `linux/x86_64` IR subset, optionals (`T?`) are supported at ABI boundaries for the supported payload subset (scalar payloads, `string?`, and optionals of ABI-safe structs):
        - an optional lowers to a `Bool` tag followed by the payload scalar slots: `(tag, payload0, payload1, ...)` with `tag=0` for `None` and `tag=1` for `Some(...)`,
        - nested optionals (`T??`) lower by treating the payload slots as the full inner optional representation (for example `int??` lowers as `(tag0, tag1, i64 payload)`),
        - optional parameters are passed as these scalar slots in order (so downstream C callers should declare separate parameters, treating `tag` as an integer-like 0/1 value),
        - optional results return as the same scalar slots (1–2 slots in registers; 3+ slots via a hidden sret pointer as described above).
    - for object outputs (`SILK_OUTPUT_OBJECT`):
      - on `linux/x86_64`, the compiler can emit an ELF64 relocatable object
        (`ET_REL`) for the supported IR subset, emitting supported functions
        (scalar-returning, `void`-returning, and a limited `string` subset) and supported exported constants
        (`export let`/`export const`; scalar exports require an explicit type annotation and a literal initializer, and string exports may omit `: string` when the initializer is a string literal), and marking `export fn`
        declarations, supported exported constants, and a valid executable `main`
        (when present) as global symbols,
      - when the module set contains no supported globally-visible symbols (no
        supported `export fn`, no supported `export let` constants, and no valid
        executable `main`), `silk_compiler_build` still succeeds and writes a
        valid relocatable object with no globally-visible symbols,
      - for programs outside that subset (or on unsupported targets),
        `silk_compiler_build` returns `false` with an `E4001` / `E4002` formatted diagnostic (via `silk_compiler_last_error` / `silk_error_format`)
        and does not write an output file.
    - for static library outputs (`SILK_OUTPUT_STATIC_LIBRARY`):
      - on `linux/x86_64`, the compiler can emit a static library archive
        (`.a`) containing an object file for the supported IR subset, emitting
        supported functions (scalar-returning, `void`-returning, and a limited `string` subset) and supported
        exported constants (`export let`/`export const`; scalar exports require an explicit type annotation and a literal initializer, and string exports may omit `: string` when the initializer is a string literal), and
        marking `export fn` declarations, supported exported constants, and a
        valid executable `main` (when present) as global symbols,
      - when the module set contains no supported globally-visible symbols (no
        supported `export fn`, no supported `export let` constants, and no valid
        executable `main`), `silk_compiler_build` still succeeds and writes a
        valid archive containing an object file with no globally-visible symbols,
      - for programs outside that subset (or on unsupported targets),
        `silk_compiler_build` returns `false` with an `E4001` / `E4002` formatted diagnostic (via `silk_compiler_last_error` / `silk_error_format`)
        and does not write an output file.
    - for shared library outputs (`SILK_OUTPUT_SHARED_LIBRARY`):
      - on `linux/x86_64`, the compiler can emit an ELF64 shared library
        (`ET_DYN`, typically with a `.so` filename) for the supported IR subset,
        emitting supported functions (scalar-returning, `void`-returning, and a limited `string` subset) and
        supported exported constants (`export let`/`export const`; scalar exports require an explicit type annotation and a literal initializer, and string exports may omit `: string` when the initializer is a string literal), and
        marking `export fn` declarations, supported exported constants, and a
        valid executable `main` (when present) as dynamic global symbols,
      - when the module set contains no supported globally-visible symbols (no
        supported `export fn`, no supported `export let` constants, and no valid
        executable `main`), `silk_compiler_build` still succeeds and writes a
        valid shared library with an empty export set,
      - for programs outside that subset (or on unsupported targets),
        `silk_compiler_build` returns `false` with an `E4001` / `E4002` formatted diagnostic (via `silk_compiler_last_error` / `silk_error_format`)
        and does not write an output file.
    - for executable outputs (`SILK_OUTPUT_EXECUTABLE`):
      - the implementation supports a **minimal constant‑expression backend**:
        - the program must satisfy the entrypoint rule above,
        - the body of `main` must be one of the following shapes:
          - zero or more `let` statements whose initializers are constant
            integer expressions, followed by exactly one `return` statement
            that returns a *constant integer expression* built only from:
            - integer literals,
            - the arithmetic operators `+`, `-`, `*`, `/`, and `%`,
            - and references to immutable `let` bindings (top‑level or local
              to `main`, or imported exported scalar constants from imported
              packages) whose initializers are themselves constant integer
              expressions in this same sense (no side‑effecting operations);
              imported exported constants must be declared as `export let` or
              `export const` with the shape `export <binding> name: <scalar> =
              <literal>;` (explicit scalar type and literal initializer),
            - on `linux/x86_64`, direct calls to simple helper functions of
              the form

              ```silk
              fn helper (x, y) -> int {
                [let ...;]
                return <expr>;
              }
              ```

              where:
              - parameters may be annotated as scalar types (defaulting to
                `int` when unannotated),
              - arguments at each call site are drawn from the same
                scalar expression subset as `<expr>` (including `bool`,
                `char`, `Instant`, `Duration`, fixed-width integers, and
                `f32`/`f64` on `linux/x86_64`), with optionals (`T?`)
                supported for scalar
                payloads, `string?`, and optionals of the POD `struct`
                subset via `None` / `Some(...)` and `??`
                coalescing, and
              - in module-set builds, helper calls may target:
                - functions defined in the same package (across multiple
                  modules), and
                - imported exported functions (`export fn`) from any
                  packages imported by the module that contains `main`
                  (both `foo()` and `pkg::foo()` call forms are accepted
                  initially for imported exports),
              - the helper body either:
                - consists only of scalar `let` bindings and a final
                  `return`, or
                - ends in a simple `if` / `else` of the form:

                  ```silk
                  if <cond> {
                    [let ...;]
                    return <expr>;
                  } else {
                    [let ...;]
                    return <expr>;
                  }
                  ```

                  where `<cond>` is a boolean expression built from comparisons
                  over scalar expressions and boolean literals, and both
                  branches end in `return`;
              such calls are lowered to IR `Call` instructions and compiled
              to native code together with `main`, using the System V AMD64
              scalar calling convention on `linux/x86_64` (integer-like
              scalars in `rdi`..`r9`, `f32`/`f64` in `xmm0`..`xmm7`, with
              additional arguments spilled to the stack); helpers may have
              more than six integer parameters, and this path is exercised
              in both Zig tests and C tests (see `c-tests/build_exec_helper_params*.c`), or
          - a final `if` statement whose condition is a boolean expression:
            - for the purely constant subset, the condition is a
              **compile‑time boolean literal** (`true` or `false`) and each
              branch body itself satisfies the same “constant lets +
              `return` constant integer expression” rule, and
            - on `linux/x86_64`, a slightly richer branching `main` shape is
              also supported in which the body is exactly:

              ```silk
              fn main () -> int {
                if <cond> {
                  [let ...;]
                  return <expr>;
                } else {
                  [let ...;]
                  return <expr>;
                }
              }
              ```

              where `<cond>` is built from integer comparisons (`==`, `!=`,
              `<`, `<=`, `>`, `>=`) over integer expressions from the same
              constant subset; this shape is lowered to IR using `BrCond` and
              compiled to native code by the IR→ELF backend so that the
              condition is evaluated at runtime, or
          - one or more **trivial constant `while` loops** that appear before
            the final `return`, each of which has:
            - a condition that is a compile‑time boolean literal (`true` or
              `false`),
            - for `while false { ... }`, a body that is ignored by the
              constant backend, and
            - for `while true { ... }`, a body consisting of zero or more
              constant `let` statements followed by a `break;`, with no other
              control‑flow; loop invariants (`#invariant`) and variants
              (`#variant`) may be present but are treated as metadata and do
              not affect constant evaluation,
        - examples of supported forms include:

          ```silk
          fn main() -> int { return 0; }
          fn main() -> int { return 1; }
          fn main() -> int { return 1 + 2 * 3; }

          let answer: int = 21 * 2;

          fn main() -> int {
            return answer;
          }

          // Two-module imported constant example (module-set builds only):
          //
          // util.slk
          package util;
          export let answer: int = 42;
          //
          // app.slk
          package app;
          import util;
          fn main () -> int { return answer; }

          // Two-module imported function example (module-set builds only):
          //
          // util.slk
          package util;
          export fn add (x: int, y: int) -> int { return x + y; }
          //
          // app.slk
          package app;
          import util;
          fn main () -> int { return add(40, 2); }

          fn main () -> int {
            let a: int = 21;
            let b: int = a * 2;
            return b;
          }

          fn main () -> int {
            if true {
              return 0;
            } else {
              return 1;
            }
          }

          fn main () -> int {
            while true {
              break;
            }
            return 0;
          }
          ```

      - when these conditions hold and `output_path` names a valid path,
        `silk_compiler_build`:
        - evaluates the constant integer expression in the body of `main`,
        - emits a tiny native executable image directly using a Silk‑owned
          backend (no C stub, no external C compiler),
          - currently this backend writes a minimal ELF64 executable for
            `linux/x86_64` whose entrypoint immediately performs a
            `sys_exit(value)` system call,
        - returns `true` on success with no last error recorded.
      - when the program is front‑end valid but outside this subset
        (e.g. `main` contains non‑constant expressions, references to
        non‑constant values, or calls that fall outside the simple
        helper‑call subset described above),
        or when the backend cannot produce an executable for the current
        platform or output path, the call returns `false` and records either
        an `E4001` / `E4002` diagnostic (for unsupported constructs or backend failures) or
        a descriptive string for I/O/argument errors as the last error.

- Error reporting:

  ```c
  SilkError *silk_compiler_last_error(SilkCompiler *compiler);

  size_t silk_error_format(const SilkError *error,
                           char            *buffer,
                           size_t           buffer_len);
  ```

  - `silk_error_format` returns a human-readable diagnostic message. When the compiler can associate the error with a source span, the formatted message includes the module name/path plus line/column and a caret snippet.
  - The text format and initial stable error code set are specified in `docs/compiler/diagnostics.md`. Embedders should treat the formatted message as user-facing text (not a stable machine-readable protocol).

Ownership, lifetime, and thread-safety guarantees for these APIs must be clearly documented and kept in sync with the implementation.

ABI rules:

- All exposed functions must be C99-compatible.
- Data layouts must be stable and match the Silk side.
- Ownership and lifetime of any pointers passed across the boundary must be explicitly documented.

In addition, the embedding ABI must clearly distinguish:

- functions that consume Silk‑owned values (e.g. `SilkString` whose storage is owned by the runtime) versus
- functions that take ownership of data supplied by the embedder (and are responsible for freeing it via documented APIs).

Any deviation from the mappings documented in `docs/language/ext.md` must be justified here and reflected in tests.

## See Also

- `libsilk` (7) — C99 ABI manpage for embedders.
- `silk.h` — public C header shipped with the library.
