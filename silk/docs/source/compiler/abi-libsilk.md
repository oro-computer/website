# C99 ABI and `libsilk.a`

This document defines the C99 ABI and the interface of the `libsilk.a` static library.

## Goals

- Provide a stable C ABI for embedders.
- Mirror the external-declaration semantics described in [ext](?p=language/ext).
- Keep the ABI small, explicit, and well-documented.

## No open-world interface-object ABI

Silk’s ordinary `interface` feature is a language-level conformance mechanism.
In the current compiler, runtime interface values are implemented only through
the closed-world compilation strategy documented in
[interfaces](?p=language/interfaces):

- the compiler discovers the conformers visible in the current build,
- lowers an interface-typed runtime value to a concrete union of those
 conformers,
- and rewrites interface method calls into ordinary dispatch over that union.

This document does **not** define a generic C ABI for arbitrary Silk interface
values. In particular, `libsilk.a` does not currently promise:

- a public `SilkInterface` object,
- a stable `(data pointer, vtable pointer)` trait-object layout,
- or an open-world ABI where separately compiled libraries can exchange unknown
 future conformers through one stable interface-object representation.

Practical consequence:

- embedders must treat ordinary interface values as an internal compiler
 lowering choice, not as a stable cross-language interchange format,
- exported and imported ABI surfaces should use concrete structs, enums/unions,
 scalars, strings, ranges, handles, and other explicitly documented ABI
 shapes,
- and if an embedding boundary needs dynamic dispatch, that dispatch contract
 must be designed explicitly in the ABI itself, for example as a concrete
 function-table struct chosen by the API author.

## Library & Headers

- Static library: `libsilk.a`.
- Primary header: `include/silk/silk.h`.
- Legacy compatibility shim: `include/silk.h`.

Embedders should prefer `#include <silk/silk.h>`. The flat `include/silk.h`
wrapper remains available for compatibility during the transition.

### Linking When Static Z3 Is Bundled

When the host-native `vendor/lib/<host-layout>/libz3.a` archive is present,
`libsilk.a` includes built-in Z3 to support Formal Silk verification without requiring a
runtime Z3 dynamic library. The built-in Z3 static library is built as **C++**,
so downstream embedders linking against `libsilk.a` MUST also link the system
C++ runtime and any required system libraries:

```sh
cc -std=c99 -Wall -Wextra \
   -I/path/to/include your_app.c \
   -L/path/to/lib -lsilk \
   -lstdc++ -lpthread -lm
```

The `silk cc` wrapper adds these flags automatically when linking on
`linux/x86_64`.

If the static host archive is absent, `libsilk.a` still builds. Formal Silk
verification then requires a dynamic Z3 override via
`silk_compiler_set_z3_lib` or `SILK_Z3_LIB`.

The header must define:

- Core bridged types (e.g. `SilkString`, and any other structs or enums used by the ABI).
- Opaque handle types (`SilkCompiler`, `SilkModule`, `SilkError`) and their lifetime rules.
- Entry points for:
 - initializing and shutting down compiler/runtime state,
 - configuring compilation (target triple, stdlib name, optimization level),
 - adding source buffers,
 - compiling Silk source to executables, libraries, or object files,
 - serializing AMDGPU AQL dispatch packets for embedder-owned runtime paths,
 - interacting with diagnostics and error reporting.

### Initial C Header Shape (`include/silk/silk.h`)

The initial C header provided in the Silk compiler repository defines:

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

- `SilkRange` mirroring the Silk `range` primitive:

  ```c
  typedef struct SilkRange {
      int64_t  start;
      int64_t  end;
      uint64_t flags;
  } SilkRange;
  ```

 Notes:
 - The current `linux/x86_64` backend subset passes and returns `range` values
 as three 8-byte scalar slots (`start`, `end`, `flags`).
 - `flags` is a bitfield:
 - bit 0: `has_end` (when unset, `end` is ignored),
 - bit 1: `inclusive` (only valid when `has_end` is set).

- 128-bit scalar primitives (`i128` / `u128` / `f128`) used by generated C
 headers for exported Silk interfaces:

  ```c
  typedef struct SilkU128 {
      uint64_t lo;
      uint64_t hi;
  } SilkU128;

  typedef struct SilkI128 {
      uint64_t lo;
      int64_t  hi;
  } SilkI128;

  typedef struct SilkF128 {
      uint64_t lo;
      uint64_t hi;
  } SilkF128;
  ```

 Notes:
 - `SilkF128` stores the IEEE‑754 binary128 bit pattern. It is not C `long double`.
 - These types are passed and returned as two integer-like 8-byte slots in the
 current `linux/x86_64` backend subset.

- Package export symbol helpers for C/Objective-C bridge headers:

  ```c
  SILK_C_ABI_EXPORT_FN(lumen_trail, silk_ios_daily_score)
  /* expands to lumen_trail_silk_ios_daily_score */

  SILK_PACKAGE_EXPORT_FN(lumen_trail, silk_ios_daily_score)
  /* expands to __silk_export_fn__lumen_trail__silk_ios_daily_score */

  SILK_PACKAGE_EXPORT_DATA(my_pkg, answer)
  /* expands to __silk_export_data__my_pkg__answer */
  ```

 Notes:
 - The macro arguments must be C identifier tokens.
 - For nested Silk packages, pass the spelling that matches the selected
 symbol family. `SILK_C_ABI_EXPORT_FN` uses the clean C ABI package spelling
 with namespace separators collapsed to one `_`, so package `ui::model` is
 passed as `ui_model`. `SILK_PACKAGE_EXPORT_FN` and
 `SILK_PACKAGE_EXPORT_DATA` use the reserved default Silk package spelling
 where each `:` becomes `_`, so the same package is passed as `ui__model`.
 - `SILK_C_ABI_EXPORT_FN` matches exported functions declared as
 `export attr(abi=c) fn ...` or `attr(abi=c) export fn ...` in a named
 package.
 - `SILK_PACKAGE_EXPORT_FN` and `SILK_PACKAGE_EXPORT_DATA` match the default
 Silk package export symbols that keep the reserved `__silk_export_*__`
 prefixes.
 - These helpers are spelling aids for named-package bridge headers. They do
 not change Silk import/export semantics, and they do not make named-package
 exports part of the generated `--c-header` surface.

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

- AMDGPU AQL packet helpers:

  ```c
  #define SILK_AMDGPU_AQL_DISPATCH_PACKET_SIZE 64

  typedef enum SilkAmdGpuAqlFenceScope {
      SILK_AMDGPU_AQL_FENCE_SCOPE_NONE = 0,
      SILK_AMDGPU_AQL_FENCE_SCOPE_AGENT = 1,
      SILK_AMDGPU_AQL_FENCE_SCOPE_SYSTEM = 2,
  } SilkAmdGpuAqlFenceScope;

  typedef struct SilkAmdGpuAqlDispatchPacketConfig {
      uint16_t dimensions;
      uint16_t workgroup_size_x;
      uint16_t workgroup_size_y;
      uint16_t workgroup_size_z;
      uint32_t grid_size_x;
      uint32_t grid_size_y;
      uint32_t grid_size_z;
      uint32_t private_segment_size;
      uint32_t group_segment_size;
      uint32_t max_flat_workgroup_size;
      uint64_t kernel_object;
      uint64_t kernarg_address;
      uint64_t completion_signal;
      uint8_t  barrier;
      int32_t  acquire_fence_scope;
      int32_t  release_fence_scope;
  } SilkAmdGpuAqlDispatchPacketConfig;

  bool silk_amdgpu_aql_dispatch_packet_build(
      const SilkAmdGpuAqlDispatchPacketConfig *config,
      uint8_t                                *out_packet);
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
  bool silk_compiler_set_debug(SilkCompiler *compiler, bool debug);
  bool silk_compiler_set_noheap(SilkCompiler *compiler, bool noheap);
  bool silk_compiler_set_target(SilkCompiler *compiler, SilkString target_triple);
  bool silk_compiler_set_z3_lib(SilkCompiler *compiler, SilkString path);
  bool silk_compiler_set_std_archive(SilkCompiler *compiler, SilkString path);
  bool silk_compiler_add_needed_library(SilkCompiler *compiler, SilkString soname);
  bool silk_compiler_add_runpath(SilkCompiler *compiler, SilkString path);
  bool silk_compiler_set_soname(SilkCompiler *compiler, SilkString soname);
  bool silk_compiler_set_optimization_level(SilkCompiler *compiler, int level);
  bool silk_compiler_set_c_header(SilkCompiler *compiler, SilkString path);
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

 `silk_compiler_set_debug` enables the same debug build mode as the CLI
 (`silk --debug`): debug-mode lowering for supported native outputs, and
 additional Z3 debug output plus `.smt2` reproduction scripts on failing Formal
 Silk obligations (written under `.silk/z3/` or `$SILK_WORK_DIR/z3`).

 `silk_compiler_set_noheap` enables the same no-heap mode as the CLI
 (`silk --noheap`): heap-backed allocation is disabled for the supported
 subset. `--noheap` is currently incompatible with `--debug`; the ABI rejects
 configurations that enable both.

 `silk_compiler_set_optimization_level` selects the optimization level (0-3),
 matching the CLI `-O` flag. The default is level 0 unless overridden. Level
 1+ enables lowering-time pruning of unused
 extern symbols before code generation. For IR-backed native executable
 builds, it also prunes unreachable functions from the executable entrypoint
 (function-level dead-code elimination), typically reducing output size and
 over-linking when using the prebuilt `libsilk_std.a` archive to satisfy
 auto-loaded `import std::...;` modules.
 The CLI also exposes `silk build --strip-unused` to force analogous
 reachability-based pruning at `-O0` for executable/static/shared outputs; the
 current C ABI does not yet expose a separate setter for that flag.

 `silk_compiler_set_target` selects the code generation target. The
 `target_triple` string is copied. The implementation recognizes the
 same targets as the CLI (`silk build --list-targets`), including:

 - `linux-x86_64` (default), and common `x86_64-*-linux-*` triples such as
 `x86_64-linux-gnu` and `x86_64-unknown-linux-gnu`,
 - `linux-aarch64`,
 - `android-aarch64`,
 - `macos-x86_64`,
 - `macos-aarch64`,
 - `ios-aarch64`,
 - `ios-simulator-aarch64`,
 - `ios-simulator-x86_64`,
 - `windows-x86_64`,
 - `windows-aarch64`,
 - `wasm32-unknown-unknown`,
 - `wasm32-wasi` (and other `wasm32` triples containing `wasi`),
 - `amdgcn-amd-amdhsa-gfx942`,
 - `amdgcn-amd-amdhsa-gfx1100`,
 - `amdgcn-amd-amdhsa-gfx1151`.

 For `wasm32` targets, only `SILK_OUTPUT_EXECUTABLE` is supported. The output
 bytes are a final WebAssembly module (`.wasm`) produced by the IR-backed wasm
 backend (`src/backend_wasm_ir.zig`), with a smaller constant-only fallback for
 programs that fit the constant subset.

 For AMDGPU targets, `SILK_OUTPUT_OBJECT` emits an AMDHSA `.hsaco` code object
 for the current source-kernel subset: exactly one exported root-package
 void function with up to 32 immutable `u64` parameters whose body is empty or
 contains only supported compiler-backed GPU call statements. Low-level
 `__silk_amdgpu_*` calls retain integer-literal operands; the semantic
 `std::gpu::device::store_u32_at_global_x` and
 `std::gpu::device::classify_u32_at_global_x` helpers accept direct kernel
 parameter names.
 Dependency-package exports do not count as kernels. The function name becomes
 the AMDHSA kernel metadata name and the descriptor symbol is `kernel_name.kd`.
 Metadata register counts are derived from the highest SGPR/VGPR referenced by
 the accepted source intrinsics, with 32 SGPRs and 64 VGPRs as minimum values.
 [backend amdgpu](?p=compiler/backend-amdgpu) documents the canonical source-intrinsic
 declaration sets and authoring diagnostics.

 The provider-neutral mixed CPU/GPU executable option is currently a `silk
 build --gpu-target` CLI surface, not a `libsilk` compiler-setting function.
 This GPU-v1 work does not change the C99 ABI. Embedders retain the documented
 standalone AMDGPU object and AQL packet APIs.

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
 - programs that need process arguments must read them from WASI inside
 `main()` (for example via `std::args::{argc,argv,current}`),
 - emits an exported `_start () -> void` wrapper that calls `main` and then
 imports/calls WASI `proc_exit`,
 - export-only modules are supported for embedding (export-only modules do
 not include `_start`).

 `silk_compiler_add_needed_library` records a dynamic loader dependency for
 executable and shared library outputs (emitted as `DT_NEEDED`). The `soname`
 string is copied; the function may be called multiple times (duplicates are
 ignored). For static library and object outputs, the value is ignored.
 `DT_NEEDED` entries starting with `libsilk_rt` are rejected: bundled runtime
 helpers are linked statically from `libsilk_rt.a` / `libsilk_rt_noheap.a` and
 must not become runtime loader dependencies.
 On `linux/x86_64`, when an executable or shared library imports any external
 symbols, the compiler automatically adds the selected libc as a `DT_NEEDED`
 dependency (`libc.so.6` for glibc, `libc.so` for musl), so embedders do not
 need to manually add libc when using hosted `std::` modules like `std::io`
 and `std::fs`. Additional non-libc dependencies must still be declared via
 `silk_compiler_add_needed_library`.

 `silk_compiler_add_runpath` records a dynamic loader search path element for
 executable and shared library outputs (emitted as `DT_RUNPATH`). The `path`
 string is copied; the function may be called multiple times (duplicates are
 ignored) and the final `DT_RUNPATH` string is formed by joining all entries
 with ':'.

 `silk_compiler_set_soname` configures the shared library soname recorded as
 `DT_SONAME` for shared library outputs. The `soname` string is copied; passing
 an empty string clears the configured soname (no `DT_SONAME` entry). For
 executable, static library, and object outputs, the value is ignored.

 `silk_compiler_set_z3_lib` configures a Z3 dynamic library override for Formal
 Silk verification (equivalent to the CLI `--z3-lib <path>`). Passing an empty
 string clears the override and returns to the normal Z3 selection rules
 (including honoring `SILK_Z3_LIB`).

 `silk_compiler_set_std_archive` configures a stdlib archive override
 (equivalent to the CLI `--std-lib <path>`). Passing an empty string clears
 the override and returns to the normal stdlib archive selection rules
 (including honoring `SILK_STD_LIB`).

 `silk_compiler_set_c_header` configures C header generation for non-executable
 outputs (equivalent to the CLI `--c-header <path>`). The header is written
 when `silk_compiler_build` succeeds for `SILK_OUTPUT_OBJECT`,
 `SILK_OUTPUT_STATIC_LIBRARY`, or `SILK_OUTPUT_SHARED_LIBRARY`. C header
 generation is not supported for `silk_compiler_build_to_bytes`.

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
 `linux-x86_64`, a `.wasm` module on `wasm32` targets, or an AMDHSA `.hsaco`
 code object on AMDGPU object outputs.

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

 AMDGPU runtime packet helper:

 - `silk_amdgpu_aql_dispatch_packet_build` serializes a host-endian
 `SilkAmdGpuAqlDispatchPacketConfig` into a 64-byte HSA AQL
 kernel-dispatch packet.
 - The packet bytes use the HSA field offsets documented in
 [backend amdgpu](?p=compiler/backend-amdgpu): header at `0..2`, setup at `2..4`,
 workgroup sizes at `4..10`, grid sizes at `12..24`, segment sizes at
 `24..32`, `kernel_object` at `32..40`, `kernarg_address` at `40..48`,
 and `completion_signal` at `56..64`.
 - The function returns `false` for null pointers, invalid fence-scope values,
 dimensions outside `1..3`, zero workgroup or grid sizes, grids smaller than
 workgroups, non-1 unused dimensions, or flat work-group sizes larger than
 `max_flat_workgroup_size`. A zero `max_flat_workgroup_size` in the C config
 selects the conservative default of 1024 work-items. When `out_packet` is
 non-null, it is zeroed before validation, so failed calls leave no stale
 packet bytes.
 - The helper is independent of `SilkCompiler` and does not read or write the
 compiler last-error state.
 - The helper only builds the packet. Queue creation, executable loading,
 signal allocation, and doorbell submission remain the embedder or future
 ROCR runtime driver's responsibility.

 Current Apple host-backed note:

 - the CLI / driver now supports non-const `ios-aarch64`,
 `ios-simulator-aarch64`, and `ios-simulator-x86_64` executable, object,
 static-library, and shared-library builds on Apple Silicon macOS for the
 current pure-Silk scalar/library subset, including reachable float-to-int
 lowering and portable bundled runtime helper families
 (number / regex / unicode / filesystem / dns / process / signal / term /
 pty / readline / task-pool / async),
 - `silk_compiler_build(...)` and `silk_compiler_build_to_bytes(...)` now
 support that same iOS host-backed artifact subset on Apple Silicon macOS,
 - the remaining explicit `E4001` iOS limitation is narrower:
 it now applies only to narrower unsupported bundled runtime-internal
 helper families, while portable bundled helpers, hosted async/task
 linkage, and float-to-int now link on this path.

 At the current stage of implementation:

 - `silk_compiler_build` always performs full front‑end validation for all modules
 added via `silk_compiler_add_source_buffer`:
 - it lexes and parses each module into an internal representation,
 - it applies `attr(...)` declarations against the selected target before
 monomorphization and type checking, matching the CLI pipeline; this is
 required for `attr(device=gpu)` functions and target-gated declarations
 to retain their intended execution contract through both filesystem and
 in-memory output APIs,
 - it then type‑checks the *set* of modules as a unit, taking into account
 package/import relationships and exported constants, according to the
 language grammar and semantics documented under `docs/language/`,
 - if Formal Silk syntax is present (for example `#require`, `#assure`,
 `#assert`, `#invariant`, `#variant`, `#monovariant`, `#const`), it also runs the Z3-backed verifier
 and fails the build if verification fails (`E3001`..`E3008`),
 - the verifier is currently skipped for stdlib modules (`std::...`),
 - when the host-native archive is present, Z3 is linked from the built-in
 static archive `vendor/lib/<host-layout>/libz3.a`,
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
 - a `std/` directory in the current working directory (development default), otherwise
 - `../share/silk/std` relative to the current executable (installed default).
 - package-to-path mapping is deterministic:
 - `std::foo::bar` resolves to the file `<std_root>/foo/bar.slk`,
 - if the embedder explicitly provides a `std::...` module via
 `silk_compiler_add_source_buffer`, that module is treated as authoritative
 for its package (auto-loading does not replace already-provided packages).
 - standard library archive linking (`linux/x86_64`, current archive layout):
 - the toolchain can build a target-specific stdlib static archive
 (`libsilk_std.a`) containing one ELF object per std module (for example
 via `make stdlib`),
 - for supported executable builds, the compiler treats *auto-loaded*
 `std::...` modules as external during code generation and resolves their
 exported functions from the archive when available (while still
 type-checking the std sources as part of the module set),
 - archive discovery (in order):
 - `SILK_STD_LIB` when set, otherwise
 - `build/lib/silk/std/libsilk_std.a` when using the in-repo `std/` root, otherwise
 - `../lib/silk/std/libsilk_std.a` relative to the current executable, otherwise
 - `../lib/libsilk_std.a` relative to the current executable (legacy installed layout), otherwise
 - common installed-layout heuristics derived from the selected stdlib root,
 - walk up from the current working directory to find `libsilk_std.a`, `lib/libsilk_std.a`, or `lib/silk/std/libsilk_std.a`,
 - when no suitable archive is found (or on unsupported targets), the
 compiler falls back to compiling the reachable std sources into the
 build as part of module-set code generation.
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
 - there MUST be exactly one top‑level function with one of the forms

      ```silk
      fn main() -> int { ... }

      fn main(argc: int, argv: u64) -> int { ... }
      ```

 with a declared result type of `int`, and either:
 - no parameters, or
 - exactly two parameters whose types are `int` and `u64`,
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
 - `regexp` values remain opaque runtime-engine bytecode views: downstream C code may forward them, but must not construct them as if the byte layout were a stable public format,
 - regex literals and other borrowed `regexp` views are not caller-owned heap objects; only `std::regex::RegExp.compile(...)` produces runtime-owned regex bytecode,
 - when `std::regex` executes a foreign ABI-supplied `regexp`, the bundled runtime first validates the bytecode header/control-flow shape and reports malformed inputs as `EXEC_ERR_INVALID_INPUT` instead of entering the engine blindly,
 - when Silk code later frees or drops a `regexp` through the regex runtime, only those runtime-owned compiled values are released; borrowed/literal/foreign views are ignored safely,
 - the bundled runtime allocator override used by runtime regex compilation is process-global but internally synchronized; concurrent `silk_rt_set_allocator(...)` calls can affect which hook future runtime allocations use, but any individual allocation returned by `silk_rt_malloc_bytes(...)` keeps the realloc/free hooks that created it for its full lifetime, and foreign, forged, stale pre-`realloc`, or already-freed helper pointers that do not correspond to a live bundled-runtime allocation are ignored instead of steering helper realloc/free calls,
 - within function bodies, the compiler supports a small `string`/`regexp` expression subset:
 - `string`: string literals, `let` bindings of `string`, `return` of a `string` value, direct calls to `string`-returning helpers, and `==`/`!=`/`<`/`<=`/`>`/`>=` comparisons over `string` values (producing `bool`),
 - `regexp`: regex literals (`/pattern/flags`), `let` bindings of `regexp`, `return` of a `regexp` value, and direct calls between helpers that accept/return `regexp`,
 - other string operations (concatenation, indexing, etc.) are not implemented yet; higher-level regex matching lives in `std::regex` and is routed through `ext` calls.
 - within the current `linux/x86_64` IR subset, `i128`/`u128`/`f128` values are supported at ABI boundaries using the stable C99 `{ lo, hi }` struct shapes:
 - parameters lower to two integer-like scalars (`u64 lo`, then `u64`/`i64 hi`) and consume integer argument locations,
 - results return as two integer-like scalars in `rax`/`rdx`,
 - `f128` values are transported as raw IEEE binary128 bits in the two lanes (not via SSE registers).
 - within the current `linux/x86_64` IR subset, a limited `struct` subset is supported at ABI boundaries:
 - within function bodies and internal helper calls, `struct` declarations with 0+ fields of supported value types are supported (scalar primitives, `string`, nested structs, and supported optionals),
 - at ABI boundaries for exported/FFI functions, only ABI-safe structs are currently supported: after slot-flattening, all scalar slots must be `i64`/`u64`/`f64` (until packed ABI mapping for smaller fields is implemented),
 - ordinary borrowed references/slices are rejected up front on `ext` declarations and unnamed C-facing root-package `export fn` signatures; only opaque handle references (`&Handle` where `Handle` is `struct Name;`) may cross the external ABI boundary,
 - named-package Silk object exports may accept slice parameters (`T[]`) in the compiler-owned package ABI; these lower to two integer-like scalars (`u64` pointer, then `i64` element count) and are not emitted through C header generation,
 - at the C ABI surface, exported function *parameters* support 1+ slot ABI-safe structs by lowering the struct to its scalar slots in order; downstream C callers should declare separate parameters for 3+ slot structs (by-value C struct parameters are ABI-compatible only for the 1–2 slot cases), while exported function *returns* support 1+ slot ABI-safe structs (3+ slot returns use the native backend’s sret return path and are ABI-compatible with returning an equivalent C struct by value),
 - in all cases, the compiler lowers a struct value into N scalar slots in field order and assigns argument/result locations according to System V AMD64 integer/SSE classification for those slots.
 - named-package exported functions use the default package-qualified
 symbol `__silk_export_fn__pkg__name` unless the declaration uses
 `export attr(abi=c) fn ...` / `attr(abi=c) export fn ...`; C ABI
 exports omit the reserved prefix and emit clean C symbols by collapsing
 package `::` namespace separators to `_` and placing a single `_`
 between the package namespace and function name; declaration-level
 `attr(abi=c)` is currently supported only on top-level exported
 functions, with functions nested inside inline `module Name { ... }`
 blocks rejected until that export path is implemented end to end;
 clean C ABI symbols that collide with another C ABI export or any other
 function symbol emitted for the selected output are rejected before
 object or library emission; library outputs apply this check to the root
 package's public C ABI symbols and the dependency functions as they are
 actually emitted into that output, including internal raw dependency
 symbols,
 - named-package exported data currently uses the default
 package-qualified symbol `__silk_export_data__pkg__name`,
 - C/Objective-C bridge headers should spell those symbols through
 `SILK_C_ABI_EXPORT_FN(pkg, name)`, `SILK_PACKAGE_EXPORT_FN(pkg, name)`,
 or `SILK_PACKAGE_EXPORT_DATA(pkg, name)` from `silk/silk.h` instead of
 hardcoding generated spellings,
 - within the current `linux/x86_64` IR subset, optionals (`T?`) are supported at ABI boundaries for the supported payload subset (scalar payloads, `string?`, and optionals of ABI-safe structs):
 - an optional lowers to a `Bool` tag followed by the payload scalar slots: `(tag, payload0, payload1, ...)` with `tag=0` for `None` and `tag=1` for `Some(...)`,
 - nested optionals (`T??`) lower by treating the payload slots as the full inner optional representation (for example `int??` lowers as `(tag0, tag1, i64 payload)`),
 - optional parameters are passed as these scalar slots in order (so downstream C callers should declare separate parameters, treating `tag` as an integer-like 0/1 value),
 - optional results return as the same scalar slots (1–2 slots in registers; 3+ slots via a hidden sret pointer as described above).
 - for object outputs (`SILK_OUTPUT_OBJECT`):
 - on `linux/x86_64`, the compiler can emit an ELF64 relocatable object
 (`ET_REL`) for the supported IR subset; on Apple Silicon macOS hosts,
 `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64` can emit a Mach-O 64-bit relocatable object for
 the same current host-backed library subset, emitting supported functions
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
 - on `amdgcn-amd-amdhsa-gfx942`, `amdgcn-amd-amdhsa-gfx1100`, and
 `amdgcn-amd-amdhsa-gfx1151`, the compiler emits an AMDHSA `.hsaco` for
 exactly one exported source kernel in the AMDGPU intrinsic-call subset.
 The intrinsic declarations and user-facing diagnostics are documented in
 [backend amdgpu](?p=compiler/backend-amdgpu). Arbitrary Silk IR lowering is not
 part of this C ABI output path yet.
 - when lowering cannot isolate a narrower statement / expression span,
 that `E4001` diagnostic falls back to the offending function
 declaration and names that function directly.
 - for static library outputs (`SILK_OUTPUT_STATIC_LIBRARY`):
 - on `linux/x86_64`, the compiler can emit a static library archive
 (`.a`) containing an object file for the supported IR subset; on Apple
 Silicon macOS hosts, `macos-aarch64`, `ios-aarch64`,
 `ios-simulator-aarch64`, and `ios-simulator-x86_64` can emit a Mach-O
 static archive via Apple `libtool -static` for the same current
 host-backed library subset, emitting
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
 (`ET_DYN`, typically with a `.so` filename) for the supported IR subset;
 on Apple Silicon macOS hosts, `macos-aarch64`, `ios-aarch64`,
 `ios-simulator-aarch64`, and `ios-simulator-x86_64` can emit a Mach-O
 dylib for the same current host-backed library subset,
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
 - currently this backend writes a minimal target-specific executable
 that terminates the process with the evaluated `main` value:
 - ELF64 for `linux-x86_64`, `linux-aarch64`, and `android-aarch64`,
 - Mach-O 64-bit for `macos-x86_64`, `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, and `ios-simulator-x86_64`,
 - PE32+ for `windows-x86_64` and `windows-aarch64`,
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
 - The text format and initial stable error code set are specified in [diagnostics](?p=compiler/diagnostics). Embedders should treat the formatted message as user-facing text (not a stable machine-readable protocol).

Ownership, lifetime, and thread-safety guarantees for these APIs must be clearly documented and kept in sync with the implementation.

ABI rules:

- All exposed functions must be C99-compatible.
- Data layouts must be stable and match the Silk side.
- Ownership and lifetime of any pointers passed across the boundary must be explicitly documented.

In addition, the embedding ABI must clearly distinguish:

- functions that consume Silk‑owned values (e.g. `SilkString` whose storage is owned by the runtime) versus
- functions that take ownership of data supplied by the embedder (and are responsible for freeing it via documented APIs).

Any deviation from the mappings documented in [ext](?p=language/ext) must be justified here and reflected in tests.

## See Also

- [`libsilk(7)`](?p=man/libsilk.7) — C99 ABI manpage for embedders.
- `silk/silk.h` — canonical public C header shipped with the library.
