# `silk` (1) — Silk Language Compiler

> NOTE: This is the Markdown source for the eventual man 1 page for `silk`. The roff-formatted manpage should be generated from this content.

## Name

`silk` — compile Silk source code and packages.

## Synopsis

- `silk [--help|-h] [--version]`
- `silk <command> [options] [args...]`
- `silk help [<command>]`
- `silk repl`
- `silk check [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--package <dir|manifest>] <file> [<file> ...]`
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--package <dir|manifest>] [--build-script] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [-S] [--arch <arch>] [--target <triple>] [--c-header <path>] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>]`
- `silk doc [--all] <file> [<file> ...] [-o <path>]`
- `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <path>]`
- `silk man <query>`
- `silk cc <cc args...>`

## Description

`silk` is the command-line compiler for the Silk language. It reads Silk source files, performs parsing and type checking, and (in the initial implementation) can build simple executable programs for a small, documented subset of the language. As the compiler matures, `silk` will grow to support full code generation for executables, static libraries, and shared libraries.

For command-specific help, run `silk help <command>` or see the corresponding manpages (`silk-build` (1), `silk-check` (1), `silk-test` (1), `silk-doc` (1), `silk-man` (1), `silk-cc` (1)). The full CLI reference lives in `docs/compiler/cli-silk.md`.

Convenience entrypoints:

- `slc` — behaves like `silk build ...`.
- `slcc` — behaves like `silk cc ...`.

When invoked with no command and stdin is a TTY, `silk` enters the interactive
REPL (equivalent to running `silk repl`).

## Diagnostics

On error, `silk` prints a human-readable diagnostic to stderr and exits with a non-zero status. Diagnostics include a stable error code for known error kinds and, when available, a file/line/column location plus a caret snippet highlighting the primary span.

When stderr is a TTY, `silk` may decorate diagnostics with ANSI colors. Set `NO_COLOR` (or use `TERM=dumb`) to disable color output.

The diagnostic text format and initial error code set are specified in `docs/compiler/diagnostics.md`.

## Options

For the initial implementation, the supported options are:

- **Global options:**
  - `--help` / `-h` — show global usage and exit.
  - `help` — show global usage and exit.
  - `help <command>` — show command-specific usage and exit.
  - `--version` — show the embedding ABI version (queried via `silk_abi_get_version`) and exit.

- **REPL command:**
  - `silk repl` starts an interactive “compile-and-run” REPL.
  - Currently supported only on `linux/x86_64` (native ELF backend).
  - Stateful by replay: each successful line is appended to a session program.
    When you enter runtime lines (statements/expressions), the session is
    re-executed from the start (so side effects may repeat). Import and
    declaration lines are validated by compilation only (not executed).
  - Built-in commands:
    - `.help` — show help
    - `.clear` — reset session state
    - `.cls` — clear the screen
    - `.undo` — undo the last successful line
    - `.exit` — exit the REPL
  - History is loaded/saved to:
    - `$SILK_REPL_HISTORY` when set, otherwise
    - `$SILK_WORK_DIR/repl_history` (default: `.silk/repl_history`).

- **Check command:**
  - `silk check [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--package <dir|manifest>] <file> [<file> ...]`:
    - `--help`, `-h` — show `check` usage and exit.
    - `--nostd`, `-nostd` — disable stdlib auto-loading; `import std::...;` must be satisfied by explicitly passing source files.
    - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) — override the stdlib root directory used to resolve `import std::...;` and std-root file imports (`from "std/<path>"` / `from "std/<path>.slk"`).
    - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) — select a stdlib archive path for linking auto-loaded `std::...` modules during builds (ignored by `check`).
    - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
    - `--debug`, `-g` — when Formal Silk verification fails, emit Z3 debugging output and write an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`).
    - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided, `<file> ...` inputs must be omitted.
    - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).

- **Test command:**
  - `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`:
    - `--help`, `-h` — show `test` usage and exit.
    - discovers language-level `test` declarations (see `docs/language/testing.md`) in the loaded module set,
    - compiles and runs each test, emitting TAP version 13 output,
    - each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite.
    - `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
    - `--filter <pattern>` — run only tests whose display name contains `<pattern>` (substring match).
    - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided:
      - `<file> ...` inputs must be omitted.
      - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
    - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
    - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).

- **Build command:**
  - `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--package <dir|manifest>] [--build-script] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [-S] [--arch <arch>] [--target <triple>] [--c-header <path>] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>]`:
    - `--help`, `-h` — show `build` usage and exit.
    - `-o <path>`, `--out <path>` — write the generated output to `<path>`.
      - if the parent directories of `<path>` do not exist, the compiler creates them (like `mkdir -p`).
    - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided:
      - `<file> ...` inputs must be omitted.
      - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk build` behaves as if `--package .` was provided.
    - `--build-script` — compile and run `<package_root>/build.silk` and use its stdout as the package manifest (see `docs/compiler/build-scripts.md`).
    - `--package-target <name>` — select one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias).
      - when omitted, `silk build --package ...` builds every manifest `[[target]]` entry by default.
      - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--needed`, `--runpath`, `--soname`).
    - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).
    - `--debug`, `-g` — enable debug build mode (supported subset, `linux/x86_64`):
      - failed `assert` prints a panic header + optional message + stack trace to stderr (via glibc `backtrace_symbols_fd`) before aborting, and
      - dynamically-linked executables preserve internal function symbols in `.dynsym` (similar to `-rdynamic`) for stack trace symbolization.
      - when Formal Silk verification fails, `--debug` also emits Z3 debugging output and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`).
      - compiled code can query this mode at runtime via `std::runtime::build::is_debug()`.
    - `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
    - `--noheap` — disable heap allocation:
      - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
      - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
      - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
      - any use of `async`, `task`, `await`, `yield`, or capturing closures is rejected with `E2027`,
      - region-backed `new` inside `with` is still permitted,
      - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`).
    - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
    - `--kind <kind>` — select the output kind:
      - `executable` (default)
      - `object` (ELF64 relocatable object on `linux/x86_64`)
      - `static` (static library archive on `linux/x86_64`)
      - `shared` (shared library on `linux/x86_64`)
    - `--emit bin|asm` — select emission mode:
      - `bin` (default) emits the selected binary artifact at the `-o` / `--out` path.
      - `asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux/x86_64` and writes it to the `-o` / `--out` path.
    - `-S` — alias of `--emit asm` (defaults to `--kind object` when `--kind` is not set).
    - `--arch <arch>` — shorthand for selecting a known target:
      - `x86_64` / `amd64` → `linux-x86_64`,
      - `wasm32` → `wasm32-unknown-unknown`,
      - `wasm32-wasi` → `wasm32-wasi`,
      - for convenience, `--arch` also accepts full target triples recognized by `--target`.
    - `--target <triple>` — select the compilation target (initial implementation):
      - `linux-x86_64` (default; emits ELF64 binaries as described below),
      - common `x86_64-*-linux-*` triples such as `x86_64-linux-gnu` are accepted as aliases for `linux-x86_64`,
      - `wasm32-unknown-unknown` (IR-backed wasm32 mode; emits a `.wasm` module exporting `memory` and exported functions, including `main` when present; `ext` declarations become imports under `env.<name>`; also supports export-only modules with no `main` for JS/Node-style embedding),
      - `wasm32-wasi` (IR-backed wasm32 WASI mode; emits `memory` and `_start () -> void`, imports `wasi_snapshot_preview1.proc_exit`, and calls Silk `fn main () -> int`; also supports export-only modules for embedding, which do not include `_start`),
      - unknown or unsupported triples currently cause `silk build` to fail with a “target not implemented” error.
      - Note: wasm targets are only supported for `--kind executable` currently.
    - `--arch` and `--target` are mutually exclusive; passing both is an error.
    - `--c-header <path>` — emit a generated C header declaring the root package’s exported symbols (C ABI consumption):
      - writes prototypes for `export fn` and `extern const` declarations for supported `export let` constants,
      - if the parent directories of `<path>` do not exist, the compiler creates them (like `mkdir -p`),
      - only supported for `--kind object|static|shared` (rejected for `--kind executable`),
      - requires the root package (the first input module’s package) to be the global package (omit `package ...;` in exported library sources).
    - `--needed <soname>` — add a dynamic loader dependency (emitted as `DT_NEEDED`) for executable and shared outputs; may be repeated.
    - `--runpath <path>`, `--rpath <path>` — add a runtime search path element (emitted as `DT_RUNPATH`) for executable and shared outputs; may be repeated (joined with ':').
    - `--soname <soname>` — set the shared library soname recorded as `DT_SONAME` for shared outputs (an empty string clears it).
    - `--nostd`, `-nostd` — disable stdlib auto-loading; `import std::...;` must be satisfied by explicitly passing source files.
    - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) — override the stdlib root directory used to resolve `import std::...;`.
    - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) — select a stdlib archive path for linking auto-loaded `std::...` modules during executable builds.
    - The build currently:
      - runs front-end checks,
        - when multiple input files are provided, performs module-set validation (package/import resolution + multi-module type checking that accounts for imported exported constants and imported `export fn` calls for the current scalar subset),
      - resolves `std::...` imports by loading stdlib source files from a configured stdlib root (see **Environment** below),
      - for `--kind executable` (the default):
        - when the module set defines a valid Silk entrypoint, enforces the executable entrypoint rule (exactly one `main` of either `fn main() -> int`, `async fn main() -> int`, or `fn main(argc: int, argv: u64) -> int`),
        - script-style entrypoints: when the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> int` that executes those statements and then returns `0`,
        - when the module set defines no valid Silk `main`, requires an object/archive-provided `main(argc: int, argv: u64) -> int` symbol (for example from a `.c`/`.o`/`.a` input) and emits an entry stub that forwards `argc`/`argv` to it,
        - note: for now, `--std-lib` / `--std <path>.a` is rejected when linking additional `.c`/`.o`/`.a` inputs into an executable (std sources are compiled into the build instead),
        - on `linux/x86_64` native executables, when the `argc`/`argv` form is used, `argv` is a raw pointer to the argv pointer list (a C-style `char**`, where `argv[0]` is at byte offset `0`, `argv[1]` at `8`, etc.),
      - for `--kind object`, `--kind static`, and `--kind shared`, `main` is optional; the current backend emits supported `export fn` functions and supported exported constants (`export let` with an explicit type annotation and a literal initializer; currently scalar types and `string`), plus a valid executable `main` when present, as global symbols,
        - it is valid for a non-executable output to contain no globally-visible symbols (for example, type-only or interface-only modules); in that case the build still succeeds and produces an “empty” object/archive/shared library,
        - declaration-only exported function prototypes (`export fn name(...) -> T;`) are accepted as module exports for type-checking, but do not emit code; calls lower as link-time symbol references that must be satisfied by other Silk sources in the module set and/or `.c`/`.o`/`.a` inputs,
      - on `linux/x86_64`, the current backend also supports a limited `string` subset (SilkString `{ ptr, len }` ABI, string literals + `let`/`return` + calls to `string`-returning helpers + `==`/`!=`/`<`/`<=`/`>`/`>=` comparisons; exported `string` constants are supported for non-executable outputs),
      - on `linux/x86_64`, the current backend also supports a limited FFI call subset:
        - top-level `ext` declarations of external functions (`ext name = fn (T, ...) -> R;`) may be called like normal functions from Silk code,
        - supported for:
          - `--kind object` and `--kind static` (relocations are emitted against undefined external symbols for downstream linkers), and
          - `--kind shared` (dynamic imports emitted and calls go through the shared object’s GOT; symbols must be available at runtime),
          - `--kind executable` (a dynamically-linked ELF64 executable is emitted and calls go through the executable’s GOT; symbols must be available at runtime),
        - top-level `ext` declarations of external scalar variables (`ext name = T;`) may be read like normal values from Silk code:
          - `--kind object` and `--kind static` (relocations are emitted against undefined external data symbols), and
          - `--kind shared` (dynamic imports emitted and loads go through the shared object’s GOT; symbols must be available at runtime),
          - `--kind executable` (a dynamically-linked ELF64 executable is emitted and loads go through the executable’s GOT; symbols must be available at runtime),
        - writing to `ext` variables is not supported,
        - for executables and shared libraries, dynamic dependencies can be declared via `--needed <soname>` (emitted as `DT_NEEDED`) and runtime search paths can be declared via `--runpath <path>` (emitted as `DT_RUNPATH`); for shared outputs, the library soname can be set via `--soname <soname>` (emitted as `DT_SONAME`).
          - on `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk` automatically adds:
            - `libc.so.6` when external symbols are present,
            - `libpthread.so.0` when `pthread_*` symbols are imported,
            - `libsodium.so.23` when libsodium-backed symbols are imported (for example via `import std::crypto;`),
          - when bundled runtime helpers are imported (for example via `import std::{regex,unicode,number};`), `silk` statically links the bundled runtime archive (`libsilk_rt.a`, or `libsilk_rt_noheap.a` when `--noheap`) into the output, and does not emit a runtime `DT_NEEDED` dependency on `libsilk_rt*`,
          - `--needed` entries starting with `libsilk_rt` are rejected; the bundled runtime support layer is always linked from the static archives,
          - additional dependencies must be declared via `--needed` (or be available in the process global scope at load time, for example via `LD_PRELOAD`),
      - multi-file builds are supported for `--kind executable` and for `--kind object`, `--kind static`, and `--kind shared`:
        - when multiple packages are present in a module set for a non-executable output, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output,
      - attempts to emit a native executable using:
        - a constant-expression backend for a small, fully constant subset of `main` bodies on platforms that support the minimal ELF64 stub, and
        - on `linux/x86_64`, an IR→ELF backend for a richer scalar subset (integers, `bool`, `char`, `f32`/`f64`, `Instant`, `Duration`), as documented in `docs/compiler/cli-silk.md` and `docs/compiler/ir-overview.md`,
      - when `--kind object`, `--kind static`, or `--kind shared` is selected, the build attempts the IR→ELF backend on `linux/x86_64` for the same subset and emits `E4001` / `E4002` diagnostics for programs outside that subset,
      - the constant subset consists of:
        - a single `fn main() -> int` with:
          - zero or more `let` statements with constant integer initializers followed by exactly one `return` of a constant integer expression (literals, `+`, `-`, `*`, `/`, `%`, and references to constant `let` bindings), or
          - the same, with a final `if` whose condition is a compile-time boolean literal (`true` / `false`) and whose branches each satisfy the “constant lets + return constant expression” rule, and
          - optionally, one or more trivial constant `while` loops before the final `return`, with constant boolean conditions and bodies of constant `let` bindings followed by `break;`, with verification directives treated as metadata,
        - on `linux/x86_64`, the IR→ELF backend supports a broader subset in which:
        - `fn main() -> int` and helper functions:
          - use only scalar parameters (defaulting to `int` when unannotated) drawn from `int`, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`, and the fixed-width integer types (`u8`/`i8` … `u64`/`i64`); helper functions return a scalar from the same set (while `main` remains `-> int`), or `void` (omitted result type or explicit `-> void`) when used only as standalone statements (`return;` and implicit fallthrough returns are supported for `void` helpers),
          - helpers may also accept and return `string` values at ABI boundaries (represented as `{ ptr: u64, len: i64 }` / `SilkString`; results return via `rax`/`rdx`),
          - use integer arithmetic (including unary `-x`), bitwise operators (including unary `~x`), and comparisons, plus floating-point arithmetic/comparisons over `f32`/`f64` (including unary `-x`),
          - use `char` literals (UTF-8 or escaped) and `==` / `!=` comparisons over `char` values,
          - use `bool` as a surface type (lowered to integer 0/1 in IR),
          - use structured control flow (`if` / `else`, `while`, `break;`, `continue;`) with conditions built from boolean literals, comparisons, calls to `bool`-returning helpers, logical operators `!` / `&&` / `||` (with `&&` / `||` short-circuiting), and boolean locals,
          - use boolean expressions in `let` initializers and `bool` return statements, including short-circuit `&&` / `||` (for example `let flag: bool = a && b;`),
          - allow call expressions as standalone statements (discarding the returned value),
          - allow assignment and compound assignment to `let mut` locals by name (`x = expr;`, `x += y;`); `=` is supported for all currently supported value types (including `string`, the supported `struct` subset, and optionals of those), and compound assignments are supported only for numeric scalar locals,
          - for optionals in the supported subset (scalar payloads, `string?`, and optionals of the supported `struct` subset), supports `None`, `Some(<expr>)`, `==` / `!=` comparisons (tag + payload equality; `opt == None` and `opt == Some(x)` infer type from the other operand), optional field access (`opt?.field`), `match <scrutinee> { None => <expr>, Some(<name|_>) => <expr>, }`, and `??` coalescing with short-circuit fallback evaluation (including unwrapping `T??` to `T?`); nested optionals (`T??`) are supported for the same payload subset, and optionals pass/return between helpers as `(bool tag, payload0, payload1, ...)` where the payload slots follow the lowering of the underlying type (for example `string?` is `(bool, u64 ptr, i64 len)`); for non-executable outputs, exported functions may accept and return these optionals (see `docs/compiler/abi-libsilk.md`),
          - for a limited subset of structs (slot-flattened structs with 0+ fields of supported value types), supports `struct` declarations, struct literals (`Type{ field: expr, ... }`, including partial initialization), field access (`value.field`, including nested access), `==` / `!=` comparisons (deep/slot-wise), and passing/returning such structs by value using the System V AMD64 convention (one ABI “eightbyte” per slot). For non-executable outputs, exported functions accept only ABI-safe structs whose flattened scalar slots are restricted to `i64`/`u64`/`f64`; downstream C callers should declare separate parameters for 3+ slot structs,
          - and, for helpers, use direct calls between functions that fit this subset, following the System V AMD64 scalar calling convention (`rdi`..`r9` for integer-like args, `xmm0`..`xmm7` for `f32`/`f64`, stack spill for remaining args, and `rax`/`xmm0` results), and
        - `main` may either be a single structured function or call such helpers; the compiler lowers these programs into an IR program and compiles them to a single ELF64 executable,
        - when multiple input files are provided, helper calls may target:
          - functions defined in the same package across modules, and
          - imported exported functions (`export fn`) from any packages imported by the module that contains `main` (both `foo()` and `pkg::foo()` call forms are accepted initially),
      - examples known to be supported and tested include:
        - straight-line integer programs such as `fn main() -> int { return 1 + 2 * 3; }`,
        - programs with local and top-level integer `let` bindings in the final `return`,
        - programs that branch on comparison conditions evaluated at runtime,
        - small loops using `while` with `break;` / `continue;`,
        - helper-call programs equivalent to:

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

        - helpers with many integer parameters (exercising both register and stack-passed arguments),
        - and programs that use boolean locals in conditions, such as:

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
      - for programs that type-check but are outside both the constant subset and the current IR-based subset, `silk build` exits non-zero with `E4001` / `E4002` diagnostics describing the backend limitation.

- **Doc command:**
  - Markdown mode: `silk doc [--all] <file> [<file> ...] [-o <path>]`:
    - Generates Markdown documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations.
    - By default, includes exported `fn`/`let`/`ext` declarations and exported `impl` methods, plus all `struct` and `interface` declarations in the input modules.
    - `--help`, `-h` — show `doc` usage and exit.
    - `--all` includes non-exported functions, bindings, and methods.
    - `-o <path>`, `--out <path>` writes the Markdown output to `<path>`; when omitted, output is written to stdout.
    - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).
  - Manpage mode: `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <path>]`:
    - Renders a single roff `man(7)` page to stdout (or to `-o` / `--out` when provided).
    - The manpage kind is derived from documentation tags (`@cli` → section 1, `@misc` → section 7, otherwise section 3 for API pages).
    - See `docs/language/doc-comments.md` for the manpage-oriented doc tags.

- **C compiler wrapper:**
  - `silk cc <cc args...>`:
    - runs a host C compiler to build programs that embed or link against `libsilk.a`,
    - selects the compiler executable via `SILK_CC` (when set), otherwise falls back to `cc`,
    - automatically adds include and library search paths adjacent to the installed `silk` binary (for example `../include` and `../lib`), plus `-lsilk`,
    - on `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (vendored Z3 is built as C++),
    - passes through additional arguments verbatim to the underlying compiler (files, flags, `-o`, `-I`, `-L`, etc.); use `silk help cc` for wrapper usage.

As the CLI is extended (additional flags, subcommands, and fully-featured backends), this manpage and `docs/compiler/cli-silk.md` MUST be updated in lockstep, per `AGENTS.md`.

## Environment

- `SILK_STD_ROOT` — path to the stdlib root directory used to resolve
  `import std::...;` declarations when `--std`/`--std-root` is not provided. When neither
  is set (and `--nostd` is not set), `silk` searches for:
  - a `std/` directory in the current working directory (development default), otherwise
  - `../share/silk/std` relative to the `silk` executable (installed default).
- `SILK_WORK_DIR` — base directory for compiler-generated scratch/debug artifacts (defaults to `.silk`).
  - For example, Formal Silk Z3 dumps are written under `$SILK_WORK_DIR/z3` and `silk man` may write temporary roff output under `$SILK_WORK_DIR/man`.
- `SILK_STD_LIB` — path to a target-specific stdlib static archive (`libsilk_std.a`).
  When present, supported executable builds treat auto-loaded `std::...` modules as
  external and resolve their exported functions from this archive.
- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve
  bare-specifier package imports (non-`std::`) in file-list workflows (when `--package`
  is not used). Entries are separated by `:` (POSIX).
  - A package like `my_api::core` maps to the candidate manifest
    `<root>/my_api/core/silk.toml` (where `::` maps to `/`).
  - When `SILK_PACKAGE_PATH` is not set, `silk` also checks `./packages` when it exists
    (development convenience).
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier. When `--z3-lib` is not provided, the verifier will use this value when set.
- `SILK_CC` — the host C compiler executable used by `silk cc` (defaults to `cc` when unset).

## See Also

- `silk-build` (1), `silk-check` (1), `silk-test` (1), `silk-doc` (1), `silk-man` (1), `silk-cc` (1), `silk-lsp` (1)
- `silk` (7)
- `docs/compiler/cli-silk.md`
- `docs/compiler/abi-libsilk.md`
- `libsilk` (7)
