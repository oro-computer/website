# `silk` CLI

This document describes the command-line interface of the `silk` compiler from the downstream user’s perspective.

## Binary

- Name: `silk`.
- Alias entrypoints:
  - `slc` — behaves like `silk build ...` (convenience wrapper),
  - `slcc` — behaves like `silk cc ...` (convenience wrapper).

## Core Responsibilities

At maturity, the `silk` CLI should:

- Compile Silk source files into:
  - executables,
  - static libraries (`.a`),
  - shared libraries (`.so` / `.dylib` / `.dll` as appropriate).
- Provide options to:
  - select target triple and optimization level,
  - choose build mode (debug / release),
  - control linkage to the default `std::` implementation or an alternative,
  - enable/disable or tune Formal Silk verification checks,
  - configure external and ABI-related behaviors where appropriate (e.g. visibility of `libsilk.a` symbols, header emission).
- Emit clear diagnostics with stable error codes and machine‑readable output when requested.

The initial implementation is intentionally smaller and focuses on:

- global options:
  - `--help` / `-h` — print global usage and exit,
  - `help` — print global usage and exit,
  - `help <command>` — print command-specific usage and exit,
  - `--version` — print the embedding ABI version and exit,
- `silk repl` — start an interactive “compile-and-run” REPL:
  - currently supported only on `linux/x86_64` (native ELF backend),
  - intended as a node-like default when `silk` is launched with no arguments
    and stdin is a TTY,
  - stateful by replay: each successful line is appended to a session program.
    When you enter runtime lines (statements/expressions), the session is
    re-executed from the start (so side effects may repeat). Import and
    declaration lines are validated by compilation only (not executed),
  - supports:
    - `.help` — show help,
    - `.clear` — reset session state,
    - `.cls` — clear the screen,
    - `.undo` — undo the last successful line,
    - `.exit` — exit the REPL,
  - history is loaded/saved to:
    - `$SILK_REPL_HISTORY` when set, otherwise
    - `$SILK_WORK_DIR/repl_history` (default: `.silk/repl_history` under the
      nearest package root or current directory),
- `silk check [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--package <dir|manifest>] <file> [<file> ...]` — parse and type-check one or more Silk source files as a unit, exiting with:
  - code `0` on success,
  - non-zero on error, printing a human-readable diagnostic (format specified in `docs/compiler/diagnostics.md`).
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]` — compile and run language-level `test` declarations found in the module set, emitting TAP output:
  - uses TAP version 13 formatting (`TAP version 13`, `1..N`, `ok`/`not ok` lines),
  - each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite,
  - the supported code generation subset matches `silk build` for the active target (initially `linux/x86_64`).
  - `--filter <pattern>` runs only tests whose display name contains `<pattern>` (substring match).
  - when `<file> ...` inputs are omitted and `--package` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
- when `--package` is provided:
  - input files must be omitted (the compiler loads the package module set from the manifest),
  - the manifest file is `silk.toml` (when a directory is provided, it is discovered in that directory),
  - see `docs/compiler/package-manifests.md` for the manifest format and source discovery rules.
- `silk doc` — generate documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations:
  - Markdown mode: `silk doc [--all] <file> [<file> ...] [-o <output.md>]`
    - by default, includes exported `fn`/`let`/`ext` declarations and exported `impl` methods, plus all `struct` and `interface` declarations in the input modules,
    - `--all` includes non-exported functions, bindings, and methods,
    - when `-o` / `--out` is provided, writes the Markdown output to that path; otherwise writes to stdout.
  - Manpage mode: `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <output.man>]`
    - renders a single roff `man(7)` page to stdout (or to `-o` / `--out` when provided),
    - the page kind is derived from the documentation tags (`@cli` → section 1, `@misc` → section 7, otherwise section 3 for API pages),
    - when `<query>` is not `std::...`, the module set is loaded from `--package` when provided; otherwise the compiler searches the current working directory and its parents for `silk.toml` and uses the nearest match,
    - intended as a non-interactive complement to `silk man <query>`.
- `silk man <query>` — render and view a temporary manpage for a symbol/module/concept derived from source documentation:
  - `std::...` queries are resolved from the configured stdlib root (see “standard library import resolution” below),
  - other queries are resolved from `--package` when provided; otherwise the compiler searches the current working directory and its parents for `silk.toml` and uses the nearest match,
  - when no manifest is found, the compiler may also resolve the query from the package search path (`SILK_PACKAGE_PATH`).
- diagnostics (initial):
  - emits a single primary error diagnostic on error,
  - includes a stable error code for known error kinds,
  - includes a file/line/column location and caret snippet when available,
  - when stderr is a TTY, diagnostics are decorated with ANSI colors unless disabled via `NO_COLOR` or `TERM=dumb`,
  - the diagnostic format and initial error code set are specified in `docs/compiler/diagnostics.md`.
- standard library import resolution (first slice):
  - when a module contains `import std::...;`, the CLI automatically loads the
    referenced `std::...` package modules from a configured stdlib root, so
    downstream users do **not** need to pass std source files explicitly on the
    command line,
  - when `--nostd` (or `-nostd`) is provided, this auto-loading is disabled and `import std::...;`
    must be satisfied by explicitly passing source files (or the build fails),
    - note: `--nostd` only affects `import std::...;` auto-loading; it does not disable std-root file imports (`from "std/<path>"`), which still resolve relative to the selected stdlib root,
  - the stdlib root is selected via:
    - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) when provided, otherwise
    - `SILK_STD_ROOT` (environment variable) when set, otherwise
    - a `std/` directory in the current working directory (development default), otherwise
    - `../share/silk/std` relative to the `silk` executable (installed default), otherwise
    - walk upward from the `silk` executable’s directory to find a `std/` directory (developer build fallback).
  - package-to-path mapping is deterministic: `std::foo::bar` resolves to the
    file `<std_root>/foo/bar.slk`.
  - JS-style file imports may also target stdlib sources directly via
    `from "std/<path>"` (or `from "std/<path>.slk"`):
    - these specifiers are resolved relative to the selected stdlib root and
      treated as file imports,
    - when the `.slk` extension is omitted, it is appended during std-root
      resolution,
    - they always load and compile the referenced `.slk` source module (they do
      not rely on the prebuilt stdlib archive).
- package search path import resolution (non-`std::`):
  - when a module imports a bare package specifier (for example `import api from "my_api";`),
    the CLI may load that package from a search path configured by `SILK_PACKAGE_PATH`,
  - `SILK_PACKAGE_PATH` is PATH-like: a list of directories separated by `:` (POSIX),
  - package-to-path mapping is deterministic: `my_api::core` resolves to the candidate
    directory `<root>/my_api/core` and the manifest `<candidate>/silk.toml`,
  - qualified symbol imports resolve the longest package prefix that exists (for example
    `my_api::core::Thing` loads `my_api::core` if present, otherwise `my_api`),
  - the same search path is used when loading manifest dependencies that omit a `path`
    field (see `docs/compiler/package-manifests.md`).
- standard library archive linking (`linux/x86_64`, current archive layout):
  - `make stdlib` builds a target-specific static archive (`libsilk_std.a`)
    containing one ELF object per std module (development default:
    `zig-out/lib/libsilk_std.a`),
  - for supported `silk build --kind executable` builds, the compiler can treat
    auto-loaded `std::...` modules as **external** during code generation and
    resolve their exported functions from the archive when available (while
    still type-checking the std sources as part of the module set),
    - by default this archive-linking path is only used for `-O0` builds (when
      `-O` is omitted, this is usually the case only when `--debug` is enabled),
    - for `-O1`+ builds, `silk build` prefers compiling std sources into the
      executable so unreachable std code can be pruned,
    - `--std-lib` / `--std <path>.a` forces archive linking regardless of `-O`,
    - only std modules auto-loaded via `import std::...;` participate in this
      external/archive path; std modules imported by file path (including
      `from "std/<path>"`) are compiled into the build like ordinary file
      imports,
  - archive discovery (in order):
    - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) when provided, otherwise
    - `SILK_STD_LIB` when set, otherwise
    - `zig-out/lib/libsilk_std.a` when using the in-repo `std/` root, otherwise
    - `../lib/libsilk_std.a` relative to the `silk` executable, otherwise
    - common installed-layout heuristics derived from the selected stdlib root,
    - walk up from the current working directory to find `libsilk_std.a` or `lib/libsilk_std.a`,
  - when no suitable archive is found (or on unsupported targets), the compiler
    falls back to compiling the reachable std sources into the build,
  - `--nostd` disables stdlib auto-loading and avoids linking the default std
    archive (but users may still explicitly provide their own `std::...` inputs
    as ordinary source files),
- user-provided `package std::...;` modules continue to override the default
  std implementation for the same package names.
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--package <dir|manifest>] [--build-module] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [--arch <arch>] [--target <triple>] [--c-header <path>] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>]` (or `--out <path>`) — for now:
  - inputs are classified by extension:
    - `.slk` — Silk source files (compiled as the module set),
    - `.o` — ELF relocatable objects linked into `--kind executable|shared` outputs (and included in `--kind static` archives),
    - `.a` — static archives; their `.o` members are treated like object inputs,
    - `.so` — shared libraries treated as dynamic dependencies (equivalent to `--needed <soname>` using the library’s basename),
    - `.c` — C sources compiled to objects via the host C compiler (see `silk cc` / `SILK_CC`) and then treated like `.o` inputs,
    - note: linking `.o`/`.a`/`.c` inputs is currently supported only for `linux/x86_64` outputs,
  - when multiple input files are provided, runs module-set front-end checks (package/import resolver + multi-module type checking that accounts for imported exported constants and imported `export fn` calls),
  - declaration-only exported function prototypes (`export fn name(...) -> T;`) are accepted as module exports for type-checking, but do not emit code; calls lower as link-time symbol references that must be satisfied by other Silk sources in the module set and/or non-`.slk` link inputs (`.o`/`.a`/`.c`),
  - when a single input file is provided, runs the existing single-module front-end checks,
  - when no input files are provided and `--package` / `--pkg` is omitted, but `./silk.toml` exists, the compiler behaves as if `--package .` was provided (package builds from the current directory by default),
  - when `--package` is provided:
    - `.slk` input files must be omitted (the module set is loaded from the manifest), but non-`.slk` link inputs (`.c`, `.o`, `.a`, `.so`) may still be provided,
    - `--build-module` compiles and runs the package build module and uses its stdout as
      the package manifest (see `docs/compiler/build-scripts.md`),
      - when no path override is provided, the compiler looks for `<package_root>/build.slk`,
      - `--build-module-path <path>` overrides the build module path (relative paths are resolved relative to `<package_root>`),
      - legacy aliases are accepted for compatibility: `--build-script` and `--build-script-path`,
    - `--package-target <name>` selects one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias),
      - when omitted, the compiler builds every manifest `[[target]]` entry by default,
    - when building multiple targets (the default when `--package-target` is omitted, or when it is repeated), per-output flags are rejected:
      `-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--needed`, `--runpath`, `--soname`,
    - `-o/--out` is optional only when building a single target (defaults to the target’s `output` or a computed default under `build/`),
    - package dependencies are loaded from the manifest’s `[dependencies]` table,
    - see `docs/compiler/package-manifests.md`,
  - when `-o/--out` or `--c-header` includes parent directories that do not exist yet, the compiler creates them (like `mkdir -p`),
  - multi-file builds are supported for `--kind executable` and for `--kind object`, `--kind static`, and `--kind shared`:
    - when multiple packages are present in a module set for a non-executable output, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output,
  - for `--kind executable`:
    - when the module set defines a valid Silk entrypoint, enforces the executable entrypoint rule (exactly one `main` of either `fn main() -> int`, `async fn main() -> int`, or `fn main(argc: int, argv: u64) -> int`),
    - script-style entrypoints: when the **first** `.slk` input contains top-level *statements* (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` treats those statements as a script body and synthesizes an implicit `fn main() -> int` that executes them and then returns `0`,
    - when the module set defines no valid Silk `main`, requires an object/archive-provided `main(argc: int, argv: u64) -> int` symbol (for example from a `.c`/`.o`/`.a` input) and emits an entry stub that forwards `argc`/`argv` to it,
    - note: for now, `--std-lib` / `--std <path>.a` is rejected when linking additional `.c`/`.o`/`.a` inputs into an executable (std sources are compiled into the build instead),
    - for `linux/x86_64` native executables, when the `argc`/`argv` form is used, the entry stub passes:
      - `argc`: the process argument count, and
      - `argv`: a raw pointer to the argv pointer list (a C-style `char**`, where `argv[0]` is at byte offset `0`, `argv[1]` at `8`, etc.),
    - other targets and backends may continue to require the parameterless `fn main() -> int` form until they implement argument passing,
- for `--kind object`, `--kind static`, and `--kind shared`, `main` is optional; the current backend emits supported `export fn` functions and supported exported constants (`export let`/`export const`; scalar exports require an explicit type annotation, and string exports may omit `: string` when the initializer is a string literal), plus a valid executable `main` when present, as globally-visible symbols,
    - it is valid for a non-executable output to contain no globally-visible symbols (for example, type-only or interface-only modules); in that case the build still succeeds and produces an “empty” object/archive/shared library,
  - `--debug` (or `-g`) enables a debug build mode for the supported `linux/x86_64` back-end subset:
    - failed `assert` prints a panic header + optional message + stack trace to stderr (via glibc `backtrace_symbols_fd`) before aborting, and
    - dynamically-linked executables export internal function symbols in `.dynsym` (similar to `-rdynamic`) so stack traces can be symbolized without external tooling,
    - when Formal Silk verification fails, `--debug` also emits a Z3 debug block and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`; see `docs/language/formal-verification.md`),
    - compiled code can query build metadata at runtime via `std::runtime::build::{is_debug,kind,mode,version}()`,
  - `--noheap` disables heap allocation for the current compiler/runtime subset:
    - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
    - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
    - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
    - any use of `async`, `task`, `await`, `yield`, or capturing closures is rejected with `E2027`,
    - region-backed `new` inside `with` is still permitted,
    - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`),
  - by default, builds an executable (`--kind executable`),
  - when `--kind object`, `--kind static`, or `--kind shared` is provided:
    - on `linux/x86_64`, attempts to emit an ELF64 relocatable object, static library, or shared library (`.so`) for the same supported IR subset,
    - and otherwise exits non-zero with `E4001` (unsupported construct) or `E4002` (backend failure) diagnostics that explain the exact limitation,
  - attempts to emit an executable using:
    - for `--target linux-x86_64` (the default; also accepts common `x86_64-*-linux-*` triples such as `x86_64-linux-gnu`), an IR→ELF backend on `linux/x86_64` for a growing scalar subset, and a constant‑expression backend (with a tiny ELF64 stub) for purely constant `main` bodies,
    - for `--target wasm32-unknown-unknown`:
      - an IR→WASM backend for the current supported subset (multi-module builds, control flow, string/data segments, and `ext` imports),
      - exports `memory` plus `main` when present (embedder entry), or emits an **export-only** module (no `main`) that exports supported `export fn` declarations from the root package,
      - note: Silk `int` currently lowers to wasm `i64`, so wasm exports using `int` surface as `i64`,
    - for `--target wasm32-wasi`:
      - an IR→WASM backend that emits `memory` plus `_start () -> void`, imports `wasi_snapshot_preview1.proc_exit`, and calls Silk `fn main () -> int` (the `main(argc, argv)` entrypoint form is not supported yet for WASI),
      - also supports export-only modules for embedding (export-only modules do not include `_start`),
    - for both wasm targets, a smaller constant-only wasm backend remains as a fallback for programs that fit the constant subset,
    - other targets are not implemented yet (see `docs/compiler/backend-wasm.md`),
  - the *constant* subset (available on `linux-x86_64` and the initial `wasm32` targets) consists of:
    - a single `fn main() -> int` whose body is:
      - zero or more `let` statements with constant integer initializers, followed by exactly one `return` of a constant integer expression, or
      - the same, with a final `if` whose condition is a compile‑time boolean literal (`true` / `false`) and whose branches each satisfy the “constant lets + return constant expression” rule, and
      - optionally, one or more trivial constant `while` loops before the final `return`, with constant boolean conditions and bodies of constant `let` bindings followed by `break;`, as described in `docs/compiler/ir-overview.md`,
  - on `linux/x86_64`, a richer IR‑based backend is used first; for this backend, the currently supported (documented and tested) subset includes:
    - `fn main() -> int` and helper functions that:
      - take scalar parameters (defaulting to `int` when unannotated) drawn from `int`, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`, and the fixed-width integer types (`u8`/`i8` … `u64`/`i64`); helper functions return a scalar from the same set (while `main` remains `-> int`), or `void` (omitted result type or explicit `-> void`) when used only as standalone statements (`return;` and implicit fallthrough returns are supported for `void` helpers),
      - helpers may also accept and return `string` values at ABI boundaries (represented as `{ ptr: u64, len: i64 }` / `SilkString`; results return via `rax`/`rdx`),
      - use integer arithmetic (`+`, `-`, `*`, `/`, `%`, including unary `-x`), bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`), integer comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`), and floating-point arithmetic/comparisons (`+`, `-`, `*`, `/`, `==`, `!=`, `<`, `<=`, `>`, `>=`, including unary `-x`) over `f32`/`f64`,
      - use `char` literals (UTF-8 or escaped) and `==` / `!=` comparisons over `char` values (lowered as `u32` scalars in IR),
      - use `bool` as a distinct surface type, with booleans represented as integer values at the IR level,
      - use `if` / `else` and `while` with conditions drawn from:
        - boolean literals,
        - comparisons over integer and floating-point expressions, and `==` / `!=`
          over boolean expressions,
        - calls to `bool`-returning helpers of this subset,
        - logical operators `!`, `&&`, and `||` composed over those expressions (`&&` / `||` are short‑circuiting),
        - and boolean locals (`let flag: bool = <bool expr>; if flag { ... }`),
      - in addition to conditions, boolean *value* positions (for example `let flag: bool = a && b;` and `return a || b;` in `bool`-returning helpers) support the same boolean expression subset and preserve short-circuit evaluation,
      - use `break;` and `continue;` inside `while` loops,
      - allow call expressions as standalone statements (discarding the returned value),
      - allow assignment and compound assignment to `let mut` locals by name (`x = expr;`, `x += y;`); the left-hand side must be an identifier; `=` is supported for all currently supported value types (including `string`, the supported `struct` subset, and optionals of those); compound assignments are supported only for numeric scalar locals,
      - and, for helpers, use direct calls between functions of this shape; scalar parameters follow the System V AMD64 calling convention as documented in `docs/compiler/ir-overview.md`:
        - integer-like scalars (`bool` and integers) use up to 6 general-purpose registers (`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`),
        - `f32`/`f64` use up to 8 XMM registers (`xmm0`..`xmm7`),
        - remaining scalar arguments are spilled to the stack in order,
        - the caller maintains 16-byte stack alignment before `call` (padding by one 8-byte slot when needed), and
        - results return in registers for 0–2 scalar results (integer-like in `rax`/`rdx`, floats in `xmm0`/`xmm1`), and 3+ scalar results return indirectly via a hidden sret pointer passed in `rdi` (caller-allocated return buffer),
    - on `linux/x86_64`, the same backend also supports a limited `string` subset:
      - within function bodies, the compiler supports a small `string` expression subset: string literals, `let` bindings of `string`, `return` of a `string` value, direct calls to `string`-returning helpers, and `==`/`!=`/`<`/`<=`/`>`/`>=` comparisons over `string` values (producing `bool`); other string operations (concatenation, indexing, etc.) are not implemented yet,
      - string literals are embedded as rodata byte blobs and `.text`→rodata fixups are emitted/handled appropriately for each output kind (ELF relocations for object/static outputs; direct RIP-relative displacement patching for shared libraries and executables once the final `.text`/rodata layout is known),
    - for non-executable outputs, exported `string` constants (`export let`/`export const` with a string literal initializer; `: string` is optional) are emitted as `SilkString` data symbols for downstream C consumers, and exported functions of this subset may accept and return `string` values using the same `{ ptr: u64, len: i64 }` ABI.
    - on `linux/x86_64`, the current backend also supports a limited `struct` subset:
      - `struct` declarations with 0+ fields of supported value types:
        - scalar primitives (`int`/fixed-width ints, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`),
        - `string` (lowered as `{ ptr: u64, len: i64 }`),
        - nested (non-opaque) structs,
        - and optionals (`T?`) of supported payload types,
      - struct literals (`Type{ field: expr, ... }`) and field access (`value.field`) for those structs; in the current backend subset, struct literals may omit fields and omitted fields are zero-initialized,
      - `==`/`!=` comparisons over values of those structs (deep/slot-wise equality, including embedded strings, nested structs, and optionals) producing `bool`,
      - passing and returning such structs by value in helper calls by lowering them to their scalar slots in order (“slot flattening”) and using the same System V AMD64 calling convention as scalar arguments/results,
      - at ABI boundaries for exported/FFI functions, structs must be ABI-safe: after slot flattening, all slots must be `i64`/`u64`/`f64` (for example `string` fields are ABI-safe, but `bool`, `char`, and `f32` fields are not).
    - on `linux/x86_64`, the current backend also supports a limited optional subset:
      - optionals of scalar payload types (`T?` where `T` is `bool`, `char`, `f32`, `f64`, `int`, `Instant`, `Duration`, or a fixed-width integer),
      - optionals of `string` payload type (`string?`), and optionals of the supported `struct` subset (`Type?` where `Type` is a supported 0+ field `struct`),
      - nested optionals (`T??`) for these payload types,
      - constructing optionals via `None` and `Some(<expr>)` for those payload types,
      - `==` / `!=` comparisons over those optionals (tag + payload equality; nested optionals compare recursively); `None` / `Some(...)` can be used directly in equality expressions when the other operand provides the optional type context (for example `opt == None` and `opt == Some(x)`),
      - accessing fields of optional structs via optional field access (`opt?.field`), producing an optional result of the field type (`FieldType?`),
      - matching on optionals via `match <scrutinee> { None => <expr>, Some(<name|_>) => <expr>, }` (exactly one `None` arm and one `Some(...)` arm; arm bodies are expressions),
      - unwrapping optionals via `??` with short-circuit evaluation of the fallback expression (including unwrapping `T??` to `T?`),
      - and passing/returning optionals between helpers at ABI boundaries as `(bool tag, payload0, payload1, ...)`, where the payload slots follow the lowering of the underlying non-optional type (for example `string?` is `(bool, u64 ptr, i64 len)`).
      - for non-executable outputs, exported functions may accept and return these optionals; see `docs/compiler/abi-libsilk.md` for the exact C ABI mapping.
    - on `linux/x86_64`, the current backend also supports a limited external call subset:
      - top-level `ext` declarations of external functions (`ext name = fn (T, ...) -> R;`) may be called like normal functions from Silk code,
      - these calls are supported for all output kinds:
        - `--kind object` and `--kind static` emit relocations against undefined external symbols for downstream linkers, and
        - `--kind shared` emits dynamic imports and calls through the shared object’s GOT (symbols must be available at runtime),
        - `--kind executable` emits a dynamically-linked ELF64 executable and calls through the executable’s GOT (symbols must be available at runtime),
      - top-level `ext` declarations of external scalar variables (`ext name = T;`) may be read like normal values from Silk code:
        - `--kind object` and `--kind static` emit relocations against undefined external data symbols, and
        - `--kind shared` emits dynamic imports and loads through the shared object’s GOT (symbols must be available at runtime),
        - `--kind executable` emits a dynamically-linked ELF64 executable and loads through the executable’s GOT (symbols must be available at runtime),
      - writing to `ext` variables is not supported,
      - for executables and shared libraries, `silk build` supports declaring dynamic loader dependencies via `--needed <soname>` (repeatable), which are emitted as `DT_NEEDED` entries,
      - runtime search paths for those dependencies can be provided via `--runpath <path>` (repeatable), which is emitted as a single `DT_RUNPATH` entry (joined with ':'), and
      - for shared library outputs, the library soname can be set via `--soname <soname>` (emitted as `DT_SONAME`),
      - on `linux/x86_64` with the glibc dynamic loader (`ld-linux`), when an executable or shared library imports any external symbols, `silk` automatically adds `libc.so.6` as a `DT_NEEDED` dependency (so hosted `std::` modules do not require `--needed libc.so.6`),
      - on the same baseline, when libsodium-backed symbols are imported (for example via `import std::crypto;`), `silk` automatically adds `libsodium.so.23` as a `DT_NEEDED` dependency,
      - on the same baseline, when `std::ggml` is imported (or when linked `.o`/`.a` inputs reference `silk_ggml_init`) and the vendored ggml static archives are present, `silk` links them automatically and adds `libstdc++.so.6`, `libgcc_s.so.1`, `libm.so.6`, and `libdl.so.2` as `DT_NEEDED` dependencies (see `docs/std/ggml.md` and `docs/compiler/vendored-deps.md`),
      - on the same baseline, when bundled runtime support symbols are imported (for example via `import std::regex;`, `import std::unicode;`, or `import std::number;`), `silk` statically links the bundled runtime support archive into the output (`libsilk_rt.a`, or `libsilk_rt_noheap.a` when building with `--noheap`); the produced executable/shared library does not depend on `libsilk_rt*.so` at runtime,
      - additional non-libc, non-libsodium dependencies still must be declared via `--needed <soname>` (or otherwise be available in the process global scope at load time, for example via `LD_PRELOAD`),
      - bundled runtime archive discovery:
        - the compiler locates `libsilk_rt.a` / `libsilk_rt_noheap.a` via (in order):
          - `SILK_RT_LIBDIR` (environment variable; a directory containing the runtime archives),
          - `zig-out/lib` in the current working directory (development default),
          - `../lib` relative to the `silk` executable (installed default).
    - `fn main()` itself may be:
      - a single function with structured control flow as above, or
      - a small program that calls one or more helpers (with the same scalar subset), all lowered into IR and compiled together into a single executable,
    - when multiple input files are provided, this executable build path operates on the entire module set and supports:
      - same-package helper calls across modules (functions in one module calling functions defined in another module of the same package), and
      - imported exported calls (`export fn`) across packages for the current scalar subset (both `foo()` and `pkg::foo()` call forms are accepted initially after `import pkg;`),
    - examples that are known to be supported and tested include:
      - straight‑line integer programs such as `fn main() -> int { return 1 + 2 * 3; }`,
      - programs with local and top‑level integer `let` bindings used in the final `return`,
      - programs that branch on comparison conditions at runtime, for example:

        ```silk
        fn main () -> int {
          if 1 < 2 {
            return 10;
          } else {
            return 20;
          }
        }
        ```

      - small loops expressed in terms of `while` and `break;` / `continue;`,
      - helper‑call programs such as:

        ```silk
        fn helper (x, y) -> int {
          if x < y {
            let one: int = 1;
            return x + one;
          } else {
            let two: int = 2;
            return y + two;
          }
        }

        fn main () -> int {
          return helper(1, 3);
        }
        ```

      - helpers that take many integer parameters (exercising both register and stack‑passed arguments) and are called from `main`,
      - programs that use boolean locals and conditions, for example:

        ```silk
        fn main () -> int {
          let x: int = 1;
          let y: int = 2;
          let flag: bool = x < y;

          if flag {
            return 3;
          } else {
            return 4;
          }
        }
        ```

      - and small helper programs with boolean locals and `if` / `else`, such as:

        ```silk
        fn helper (x) -> int {
          let flag: bool = x < 0;
          if flag {
            return 1;
          } else {
            return 2;
          }
        }

        fn main () -> int {
          return helper(1);
        }
        ```
  - for programs that type‑check but fall outside both the constant subset and the current IR‑based backend subset, `silk build` exits non‑zero with `E4001` diagnostics that point at the rejected construct (or `E4002` when the backend fails unexpectedly).

## High-Level Command Model (Initial Implementation)

The initial CLI implementation supports a small, well-defined subset of the eventual UX.

Top-level commands:

- `silk help [<command>]`:
  - Prints global usage when `<command>` is omitted.
  - Prints command-specific usage when `<command>` is provided.
  - Subcommands also accept `--help` / `-h` to print command-specific usage.
  - For `check` / `test` / `build` / `doc`, `--` ends option parsing (all remaining args are treated as file paths, even if they begin with `-`).
- `silk check [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--package <dir|manifest>] <file> [<file> ...]`:
  - Reads one or more input files, runs lexing, parsing, package/import resolution, and type checking.
  - When `--package` is provided, input files must be omitted and the module set is loaded from the package manifest (see `docs/compiler/package-manifests.md`).
  - Prints a success message on stdout for valid programs.
  - Prints a human-readable error on stderr and exits non-zero for invalid programs.
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`:
  - Discovers language-level `test` declarations (see `docs/language/testing.md`) in the loaded module set.
  - Compiles and runs each test, emitting TAP version 13 output.
  - Each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite.
  - Optimization:
    - `-O <0-3>` selects the optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`).
    - `-O1`+ prunes unused extern symbols before code generation (typically reducing output size and stdlib linkage).
    - For IR-backed native executable builds, `-O1`+ also prunes unreachable functions from the executable entrypoint (function-level dead-code elimination).
  - When `--filter <pattern>` is provided, only tests whose display name contains `<pattern>` are executed.
  - When `<file> ...` inputs are omitted and `--package` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--package <dir|manifest>] [--build-module] [--package-target <name> ...] <file> [<file> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [--arch <arch>] [--target <triple>] [--c-header <path>] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>]` (or `--out <path>`):
  - Reads one or more input files, runs the same front-end pipeline as `check`.
  - Optimization:
    - `-O <0-3>` selects the optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`).
    - `-O1`+ prunes unused extern symbols before code generation.
    - For `--kind executable` builds, `-O1`+ also prunes unreachable functions from the executable entrypoint (function-level dead-code elimination), typically reducing output size.
  - When `--package` is provided:
    - input files must be omitted,
    - `--build-module` compiles and runs the package build module and uses its stdout as
      the package manifest (see `docs/compiler/build-scripts.md`),
      - when no path override is provided, the compiler looks for `<package_root>/build.slk`,
      - `--build-module-path <path>` overrides the build module path (relative paths are resolved relative to `<package_root>`),
      - legacy aliases are accepted for compatibility: `--build-script` and `--build-script-path`,
    - `--package-target <name>` selects one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias),
      - when omitted, the compiler builds every manifest `[[target]]` entry by default,
    - when building multiple targets (the default when `--package-target` is omitted, or when it is repeated), per-output flags are rejected:
      `-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--needed`, `--runpath`, `--soname`,
    - when building a single target, `-o/--out` is optional (defaults to that target’s `output` or a computed default under `build/`).
  - Target selection:
    - `--arch <arch>` and `--target <triple>` are mutually exclusive; omit both to use the default target.
  - Entrypoint rules:
    - for `--kind executable` (the default), there must be exactly one `main`, using either `fn main() -> int`, `async fn main() -> int`, or `fn main(argc: int, argv: u64) -> int`,
    - for `--kind object`, `--kind static`, and `--kind shared`, `main` is not required; at least one supported `export fn`, supported `export let` constant, or a valid executable `main` must be present so the output contains one or more globally-visible symbols.
  - Multi-file builds are supported for `--kind executable` and for `--kind object`/`--kind static`/`--kind shared`:
    - for non-executable outputs, when multiple packages are present in a module set, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output.
  - Output selection:
    - default: build an executable (`--kind executable`),
    - `--kind object`: build an ELF64 relocatable object (`.o`) on `linux/x86_64`,
    - `--kind static`: build a static library (`.a`) on `linux/x86_64`,
    - `--kind shared`: build a shared library (`.so`) on `linux/x86_64`.
  - Emission:
    - `--emit bin` (default) emits the selected binary artifact at `<path>`,
    - `--emit asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux/x86_64` and writes it to `<path>`,
    - `-S` is accepted as an alias of `--emit asm` and defaults to `--kind object` when `--kind` is not set.
  - Dynamic dependencies:
    - `--needed <soname>` adds a `DT_NEEDED` entry for executable and shared outputs; it may be repeated,
    - `--runpath <path>` (or `--rpath <path>`) adds a runpath element for executable and shared outputs; it may be repeated (joined with ':' into `DT_RUNPATH`),
    - `--soname <soname>` sets the shared library soname recorded as `DT_SONAME` for shared outputs (an empty string clears it),
    - for object and static library outputs, `--needed`, `--runpath`, and `--soname` are ignored.
    - on `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk` automatically adds:
      - `libc.so.6` as a `DT_NEEDED` dependency when external symbols are present (so hosted `std::` modules do not require `--needed libc.so.6`), and
      - `libpthread.so.0` when `pthread_*` symbols are imported, and
      - `libsodium.so.23` when libsodium-backed symbols are imported (for example via `import std::crypto;`).
    - when bundled runtime support symbols are imported (for example via `import std::regex;`), `silk` statically links `libsilk_rt.a` (or `libsilk_rt_noheap.a` when building with `--noheap`) into the output; no runtime `DT_NEEDED` entry is emitted for `libsilk_rt*`.
    - `--needed` entries starting with `libsilk_rt` are rejected; the bundled runtime support layer is always linked from the static archives.
  - Debug builds:
    - `--debug` (or `-g`) enables runtime stack traces for failed `assert` statements on `linux/x86_64` by printing a stack trace to stderr before aborting, and preserves internal function symbols in `.dynsym` for better symbolization.
    - when Formal Silk verification fails, `--debug` also emits Z3 debugging output and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`).
  - Heap control:
    - `--noheap` disables heap allocation:
      - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
      - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
      - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
      - any use of `async`, `task`, `await`, `yield`, or capturing closures is rejected with `E2027`,
      - region-backed `new` inside `with` is still permitted.
    - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`).
  - For the supported subset, emits the selected artifact (or an assembly listing when `--emit asm` is selected) at `<path>`.
  - C99 header emission (for downstream consumers of exported symbols):
    - `--c-header <path>` writes a generated C header at `<path>` that declares the root package’s exported symbols (`export fn` prototypes and `export let` extern declarations) for consumption from C/C++,
    - this option is only meaningful for non-executable outputs (`--kind object|static|shared`) and is rejected for `--kind executable`,
    - to keep the C ABI surface obvious and stable, `--c-header` requires the *root package* (the package of the first input module) to be the **global package** (i.e. omit `package ...;` in the exported library’s sources),
    - the generated header encodes the current ABI rules described in `docs/compiler/abi-libsilk.md`, including:
      - `string` values use `SilkString { ptr, len }` (from `silk.h`),
      - optionals and 3+ slot structs are lowered at call boundaries as multiple scalar parameters (so C prototypes for such parameters use flattened arguments rather than by-value C struct parameters).
  - For programs outside the supported subset that nonetheless type-check, exits non-zero with a clear `E4001` / `E4002` diagnostic (instead of a generic “code generation is not implemented yet” message).
- Formal Silk verification:
  - when Formal Silk syntax is present (for example `#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`, `#const`), `check` / `test` / `build` require proofs and fail the build when verification fails,
  - when `--debug` is set, failing proof obligations also emit Z3 debugging output and write an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`),
  - `--z3-lib <path>` overrides the Z3 dynamic library used by the verifier (it also honors `SILK_Z3_LIB`).
- `silk doc`:
  - Markdown mode: `silk doc [--all] <file> [<file> ...] [-o <output.md>]`
    - Generates Markdown documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations.
    - By default, includes exported `fn`/`let`/`ext` declarations and exported `impl` methods, plus all `struct` and `interface` declarations in the input modules.
    - `--all` includes non-exported functions, bindings, and methods.
    - When `-o` / `--out` is provided, writes the Markdown output to that path; otherwise writes to stdout.
  - Manpage mode: `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <output.man>]`
    - Renders a roff `man(7)` page derived from source docs (`@cli`/`@misc`/API docs) and writes it to stdout (or to `-o` / `--out`).
- `silk cc <cc args...>`:
  - Runs a host C compiler to build C99 (or C++) programs that embed or link against `libsilk.a`.
  - Selects the compiler executable via `SILK_CC` (when set), otherwise falls back to `cc`.
  - Automatically adds the include and library search paths adjacent to the installed `silk` binary (for example `../include` and `../lib`), plus `-lsilk`.
  - On `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (vendored Z3 is built as C++).
  - Passes through additional arguments verbatim to the underlying compiler (files, flags, `-o`, `-I`, `-L`, etc.).
  - Wrapper usage can be displayed via `silk help cc` (since `silk cc --help` is passed through to the underlying compiler).

Future commands (not yet implemented, but documented for roadmap clarity):

- `silk fmt <path>` — format Silk source files.
- `silk abi header` — emit `silk.h` and ABI descriptions for embedders.

## Documentation & Manpages

- CLI behavior must be mirrored in `docs/man/silk.1.md`.
- Examples of typical build invocations and workflows should also be documented under `docs/usage/cli-examples.md`.
