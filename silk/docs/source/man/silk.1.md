# [`silk(1)`](?p=man/silk.1) — Silk Language Compiler

> NOTE: This is the Markdown source for the eventual man 1 page for `silk`. The roff-formatted manpage should be generated from this content.

## Name

`silk` — compile Silk source code and packages.

## Synopsis

- `silk [--help|-h] [--version]`
- `silk <command> [options] [args...]`
- `silk help [<command>]`
- `silk repl`
- `silk check [--verify|--no-verify] [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--arch <arch>] [--target <triple>] [--package <dir|manifest>] <file> [<file> ...]`
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--jobs <n>] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [-Wz <spec> ...] [--feature <spec> ...] [-f <spec> ...] [--debug] [-O <0-3>] [--noheap] [--strip-unused] [--package <dir|manifest>] [--build-module] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [-S] [--arch <arch>] [--target <triple>] [--c-header <path>] [--cflag <arg> ...] [-I <path> ...] [-isystem <path> ...] [-L <path> ...] [-l <name> ...] [-Wl <arg> ...] [--ldflag <arg> ...] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>] [--elf-interp <path>]`
- `silk build install [--package <dir|manifest>] [--build-module] [--package-target <name> ...] [-p <path>|--prefix <path>] [--destdir <path>]`
- `silk build uninstall [--package <dir|manifest>] [--build-module] [-p <path>|--prefix <path>] [--destdir <path>]`
- `silk package inspect [--package <dir|manifest>]`
- `silk package lint [--package <dir|manifest>]`
- `silk cache [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache path [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache list [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache inspect [--package <dir|manifest>] [--cache-dir <path>] [<entry>]`
- `silk cache prune [--package <dir|manifest>] [--cache-dir <path>] [--max-age <age>] [--max-size <bytes>] [--keep-recent <n>] [--dry-run]`
- `silk cache compact [--package <dir|manifest>] [--cache-dir <path>] [--max-age <age>] [--max-size <bytes>] [--keep-recent <n>] [--dry-run]`
- `silk cache clear [--package <dir|manifest>] [--cache-dir <path>] [--dry-run]`
- `silk doc [--all] <file> [<file> ...] [-o <path>]`
- `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <path>]`
- `silk man [--list] [--search <pattern>] [--section <n>|-s <n>] [--package <dir|manifest|module>] [--std-root <path>] [<query>]`
- `silk guide [--db <path>] [--json] [--limit <n>] [--printer <cmd>] <query>`
- `silk guide --show <id-or-prefix>`
- `silk guide --list`
- `silk error <code>`
- `silk error --list`
- `silk proto [-I <dir> ...] [-o <dir>] [--include-imports] [--descriptor-out <path>] <schema.proto> [<schema.proto> ...]`
- `silk cc <cc args...>`
- `silk env`
- `silk format [--check] <path> [<path> ...]`

## Description

`silk` is the command-line compiler for the Silk language. It reads Silk source files, performs parsing and type checking, and (in the implementation) can build simple executable programs for a small, documented subset of the language. As the compiler matures, `silk` will grow to support full code generation for executables, static libraries, and shared libraries.

For command-specific help, run `silk help <command>` or see the corresponding manpages ([`silk-build(1)`](?p=man/silk-build.1), [`silk-package(1)`](?p=man/silk-package.1), [`silk-cache(1)`](?p=man/silk-cache.1), [`silk-check(1)`](?p=man/silk-check.1), [`silk-test(1)`](?p=man/silk-test.1), [`silk-doc(1)`](?p=man/silk-doc.1), [`silk-man(1)`](?p=man/silk-man.1), [`silk-guide(1)`](?p=man/silk-guide.1), [`silk-error(1)`](?p=man/silk-error.1), [`silk-proto(1)`](?p=man/silk-proto.1), [`silk-cc(1)`](?p=man/silk-cc.1), [`silk-env(1)`](?p=man/silk-env.1), [`silk-format(1)`](?p=man/silk-format.1)). Live terminal help groups options and notes by purpose instead of emitting a flat option dump. For a toolchain overview, see [`silk(7)`](?p=man/silk.7).

For terminal-first discovery, `silk man` is the main entrypoint: use
`silk man --list` to see the shipped surface, `silk man --search <pattern>` to
discover commands/concepts/modules/symbols, `silk man <query>` to open a page,
and `silk doc --man <query> -o <path>` when you need the generated roff file.

`silk format` is the canonical source formatter for Silk code; it enforces statement splitting, block-spacing readability rules, canonical import grouping, and comment preservation in addition to indentation cleanup. Semicolons inside paren/bracket groups remain inline (for example generic-call separators and C-style `for` headers) instead of being treated as standalone statement breaks. Newline-based `if` / `else if` headers keep chained condition lines one indent level deeper than the control keyword and keep the opening `{` on its own line. Recursive directory walks honor `.gitignore`, while explicitly named file paths still format on demand.

`silk guide` is the curated example discovery surface. It queries the installed
`share/silk/guide.db` database generated from `examples/guide/catalog.json` and
returns canonical runnable patterns for common Silk tasks.

`silk error` explains a stable compiler diagnostic code after a build, check,
test, or REPL diagnostic has printed it. `silk error --list` lists the stable
catalog.

`silk proto` compiles Protocol Buffers v3 schema files to Silk modules without
invoking `protoc` or linking a third-party protobuf runtime. Generated modules
use `std::protobuf` for wire encoding, decoding, skipping, and unknown-field
preservation.

`silk cache` is the managed cache inspection and maintenance surface. It
understands the recognized cache entries under `<work_root>/cache` (default:
`.silk/cache`), including CLI build-cache entries and `std::build` generated
file blobs, and provides conservative cleanup commands that preserve
unknown/unmanaged files under the cache root. Cache mutations are coordinated
through an internal managed-cache lock so explicit cleanup commands do not race
normal build-cache hits/fills.

Convenience entrypoints:

- `slc` — behaves like `silk build ...`.
- `slcc` — behaves like `silk cc ...`.

When invoked with no command and stdin is a TTY, `silk` enters the interactive
REPL (equivalent to running `silk repl`).

## Diagnostics

On error, `silk` prints a human-readable diagnostic to stderr and exits with a non-zero status. Diagnostics include a stable error code for known error kinds and, when available, a file/line/column location plus a caret snippet highlighting the primary span.

When stderr is a TTY, `silk` may decorate diagnostics with ANSI colors. Set `NO_COLOR` (or use `TERM=dumb`) to disable color output.

Use `silk error <code>` to look up a code such as `E2028`, `2028`,
`diag:E2028`, or `error[E2028]`. Use `silk error --list` or `silk error -l`
to print all stable compiler error codes and descriptions.

## Options

For the implementation, the supported options are:

- **Global options:**
 - `--help` / `-h` — show global usage and exit.
 - `help` — show global usage and exit.
 - `help <command>` — show command-specific usage and exit.
 - `--version` — show the Silk toolchain version, embedding ABI version, and git commit and exit.

- **REPL command:**
 - `silk repl` starts an interactive “compile-and-run” REPL.
 - Currently supported on:
 - `linux/x86_64` via the native ELF backend.
 - `macos/aarch64` on Apple Silicon hosts for session startup and non-printing declaration/state lines via the current host-backed `macos-aarch64` executable path.
 - Current Apple Silicon note:
 - the REPL command itself now starts on `macos/aarch64`,
 - REPL value auto-printing and `std::io` formatting-driven runtime lines use
 the current host-backed `macos-aarch64` executable path, so unsupported
 backend shapes still report normal compile diagnostics.
 - Stateful by replay of **state-building lines**:
 - import lines are persisted after syntax and import-target validation
 without building a temporary executable,
 - top-level declaration lines are persisted and validated by compilation
 only (not executed),
 - in the REPL only, import lines may omit the trailing semicolon; the
 session stores the semicolon-terminated form, and ordinary source files
 still require semicolon-terminated imports,
 - runtime lines that build state (for example `let`/`var` bindings and
 assignments) are persisted and replayed from the start on each new
 runtime line,
 - simple committed runtime bindings cache their rendered value when the
 existing validation run can capture it, and repeated bare value queries
 such as `n` reuse that cache until committed state changes,
 - lines that fail parsing, type checking, compilation, or execution are
 not committed and leave the previous completion/introspection state
 intact,
 - other runtime lines (for example `hello();` or `println("...");`) are
 executed once and are not replayed,
 - runtime snippets may use top-level `await`; the REPL emits an async
 synthetic entrypoint for snippets or replayed state lines that need one,
 - bare auto-printed `async fn` calls are awaited before formatting the
 resulting value, while non-promise await operands still report the normal
 await operand diagnostic.
 - Built-in commands:
 - `.help` — show help
 - `.man <query>` — render inline documentation for current-session symbols,
 imported symbols, and `std::...` modules/symbols, with highlighted Silk
 synopsis/examples and comment-colored prose descriptions when ANSI colors
 are available
 - `.clear` — reset session state
 - `.cls` — clear the screen
 - `.undo` — undo the last committed line
 - `.exit` — exit the REPL
 - Interactive TTY input is syntax-highlighted as the user types. When ANSI
 colors are available, shared completion prefixes also appear as a dim inline
 completion hint, and `Tab` accepts or cycles the active completion using
 the same candidate ordering as the hint. The live highlighting/hint
 surface uses the same Silk lexer-backed ANSI colors as REPL `.man` source
 snippets and is disabled for non-TTY input, `NO_COLOR`, and
 dumb/unsupported terminals.
 - `Ctrl-R` starts reverse incremental history search in TTY mode. Type to
 filter, press `Ctrl-R` again to move to older matches, `Enter` to accept
 the selected line, or `Escape` / `Ctrl-G` to cancel back to the original
 edited line.
 - Completion candidates include REPL commands, keywords, std namespace
 paths, quoted `from "std/..."` and `from "std::..."` import specifier
 paths, current-session declarations and bindings, imported symbols,
 functions, static impl functions after `Type.`, and struct fields or
 receiver methods after typed values and receiver expressions such as call
 results, indexed values, chained field accesses, imported type aliases, and
 result/optional receiver chains.
 - Multi-line input: when delimiters are unbalanced (for example `{` without `}`), the REPL
 prompts with `... ` and keeps reading until the statement is complete.
 - Continuation lines are pre-indented from the current unmatched delimiter
 depth so nested `{}`, `()`, and `[]` constructs carry indentation
 forward.
 - When a complete pasted chunk contains multiple top-level entries, the REPL
 splits and executes them in order while keeping multiline blocks together.
 - Multiline expressions still use the normal expression/auto-print path when
 they are not declaration or statement forms, including multiline raw
 backtick strings.
 - Ctrl-C cancels a pending multi-line statement.
 - Symbol queries: when a line is a bare identifier or qualified name (for example `User`,
 `User.method`, `std::fs`, `std::io::println`, or an imported namespace
 alias such as `fs` or `fs::FileResult` after `import fs from "std/fs";`),
 the REPL prints the matching declaration or module overview from the
 current session or imported modules instead of executing it.
 - `.man` is intentionally narrower than `silk man`:
 - it is for inline REPL browsing of module/symbol docs,
 - use `silk man ...` outside the REPL for section/search/list queries such
 as `silk man 7 silk` or `silk man --search io`.
 - History is loaded/saved to:
 - `$SILK_REPL_HISTORY` when set, otherwise
 - `$SILK_WORK_DIR/repl_history` (default: `.silk/repl_history`).
 - `Ctrl-R` searches that in-memory history during interactive editing.

 - **Check command:**
 - `silk check [--verify|--no-verify] [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--arch <arch>] [--target <triple>] [--package <dir|manifest>] <file> [<file> ...]`:
 - `--help`, `-h` — show `check` usage and exit.
 - `--verify` — enable Formal Silk verification for modules that contain Formal Silk directives.
 - `--no-verify` — disable Formal Silk verification (default).
 - `--nostd`, `-nostd` — disable stdlib auto-loading; std modules must be satisfied by explicitly passing source files.
 - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) — override the stdlib root directory used to resolve `from "std/<path>"` module specifiers and direct std ABI imports.
 - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) — select a stdlib archive path for linking auto-loaded `std::...` modules during builds (ignored by `check`).
 - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`; valid only with `--verify`).
 - `--debug`, `-g` — when Formal Silk verification fails, emit Z3 debugging output and write an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`; valid only with `--verify`).
 - `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`).
 - `--target <triple>` — target triple (mutually exclusive with `--arch`).
 - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided, `<file> ...` inputs must be omitted.
 - when the root manifest enables a build module via `[build].build_module = true`, `silk check --package` runs that build module and uses the emitted manifest/module set instead of the raw `silk.toml`,
 - for compatibility, package checks currently invoke the build module with the action string `build`,
 - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk check` behaves as if `--package .` was provided.
 - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).

- **Test command:**
 - `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [-O <0-3>] [--noheap] [--jobs <n>] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`:
 - `--help`, `-h` — show `test` usage and exit.
 - discovers language-level `test` declarations in the loaded module set,
 - compiles and runs each test, emitting TAP version 13 output,
 - each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite.
 - top-level test bodies that contain `await` are run through async test wrappers and awaited by the generated runner.
 - test executables use the native host target when Silk has a host-backed executable backend for it, and otherwise fall back to `linux-x86_64`; Formal Silk target metadata in `silk test` reflects that selected execution target.
 - `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
 - `--jobs <n>`, `-j <n>` — run up to `<n>` test processes in parallel. Default: `1`. `0` means “auto” (based on CPU count). Jobs are capped at `8`.
 - `--filter <pattern>` — run only tests whose test path contains `<pattern>` (substring match). The test path is the nested test name stack joined with `/` (for example `suite/case`).
 - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided:
 - `<file> ...` inputs must be omitted.
 - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
 - when the root manifest enables a build module via `[build].build_module = true`, `silk test --package` runs that build module and uses the emitted manifest/module set for package tests,
 - for compatibility, package tests currently invoke the build module with the action string `build`,
 - manifest-native link metadata for the test harness (`[[target]].inputs`, `cflags`, `ldflags`, `needed`, and `runpath`) comes from `[build].default_target` when it names a code target, otherwise the first declared code target; `kind = "man"` targets are ignored for this purpose.
 - raw manifest native sources (`.c`, `.h`, and supported `.m`) are compiled to temporary objects for the generated test harness; `.o`, `.a`, shared libraries, needed libraries, and runpaths are linked as declared.
 - hosted vendored native-input auto-linking for libsodium, mbedTLS, SQLite, and libssh2 follows the same supported-target rules as `silk build --package`.
 - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
 - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).

- **Build command:**
 - `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [-Wz <spec> ...] [--feature <spec> ...] [-f <spec> ...] [--debug] [-O <0-3>] [--noheap] [--strip-unused] [--package <dir|manifest>] [--build-module] [--build-module-path <path>] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [-S] [--arch <arch>] [--target <triple>] [--c-header <path>] [--cflag <arg> ...] [-I <path> ...] [-isystem <path> ...] [-L <path> ...] [-l <name> ...] [-Wl <arg> ...] [--ldflag <arg> ...] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>] [--elf-interp <path>]`:
 - `--help`, `-h` — show `build` usage and exit.
 - `-o <path>`, `--out <path>` — write the generated output to `<path>`.
 - if the parent directories of `<path>` do not exist, the compiler creates them (like `mkdir -p`).
 - `--package <dir|manifest>` (or `--pkg`) — load the module set from a package manifest (`silk.toml`) instead of explicit input files. When `--package` is provided:
 - `<file> ...` inputs must be omitted.
 - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk build` behaves as if `--package .` was provided.
 - `--build-module` — enable build-module support for package builds. When enabled, `silk` runs the package build module to compute the effective package manifest.
 - when a build module is executed and no explicit path override is provided, the compiler looks for `<package_root>/build.slk` (or uses `[build].build_module_path` from `silk.toml` when set).
 - the build module is invoked with `argv[1] = <package_root>` and `argv[2] = <action>` where `<action>` is `build`, `install`, or `uninstall`.
 - legacy aliases: `--build-script` and `--build-script-path`.
 - build modules are opt-in by default; to run one for `silk build --package` without passing `--build-module`, set `[build].build_module = true` in `silk.toml`.
 - `--build-module-path <path>` — override the build module path (implies `--build-module`).
 - if `<path>` is relative, it is resolved relative to `<package_root>`.
 - `--package-target <name>` — select one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias).
 - when omitted, `silk build --package ...` builds every manifest `[[target]]` entry by default.
 - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--cflag`, `-I`, `-isystem`, `--ldflag`, `-l`, `-L`, `--framework`, `-F`, `-Wl`, `--needed`, `--runpath`, `--soname`, `--elf-interp`).
 - on interactive TTY stderr, `silk build` keeps source/import/package/dependency traversal on one animated transient line instead of printing one line per visited file.
 - that line is cleared before diagnostics or other stderr output.
 - non-interactive output stays concise and successful builds print final artifact lines as `build: <kind> -> <path>`.
 - `silk build -h` groups flags into General; Stdlib and verification; Output and target selection; Link inputs and dynamic linking; Package builds; Install and uninstall. Terminal help shows Linux ELF-only options only on Linux compiler hosts and Apple SDK options only on Apple Silicon macOS compiler hosts; this manpage remains the full cross-target reference.
 - `-p <path>`, `--prefix <path>` — install/uninstall prefix (default: `$PREFIX` when set, otherwise `/usr/local`).
 - `--destdir <path>` — stage install/uninstall paths under `<destdir><prefix>/...`.
 - `silk build install` installs package artifacts, package-owned manpages, and writes an uninstall receipt (see [`silk-build(1)`](?p=man/silk-build.1)).
 - `silk build uninstall` removes files listed in the uninstall receipt (see [`silk-build(1)`](?p=man/silk-build.1)).
 - `silk package inspect|lint [--package <dir|manifest>]`:
 - `inspect` prints package metadata, public definitions, dependency constraints, declared artifacts, the current package hash, and any installed Formal Silk bundle paths discovered under `share/silk/formal/<artifact-relative-path>/...`.
 - `lint` validates that `[package].definitions`, `[dist]`, and `[[artifact]]` describe a coherent distributable package root.
 - when `--package` is omitted and `./silk.toml` exists, the current directory is used.
 - `--` — end of options; treat remaining args as file paths (even if they begin with `-`).
 - `--debug`, `-g` — enable debug build mode (supported subset, `linux/x86_64`):
 - failed `assert` prints a panic header + optional message + stack trace to stderr (via glibc `backtrace_symbols_fd`) before aborting, and
 - dynamically-linked executables preserve internal function symbols in `.dynsym` (similar to `-rdynamic`) for stack trace symbolization.
 - when Formal Silk verification fails, `--debug` also emits Z3 debugging output and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`).
 - compiled code can query this mode at runtime via `std::runtime::build::is_debug()`.
 - `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
 - `--noheap` — disable heap allocation for the Supported forms:
 - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
 - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
 - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
 - non-stdlib concurrency usage that declares or forms `Task(...)` / `Promise(...)` handles is rejected with `E2027` (`async fn`, `task fn`, `async {}`, `task {}`, `async loop`, `task loop`, `await`, `yield`, and calls or type positions that produce awaitable handles),
 - imported stdlib async/task declarations alone do not trigger `E2027`; the error is raised only once user code uses those awaitable surfaces under `--noheap`,
 - capturing closures are rejected with `E2027`,
 - region-backed `new` inside `with` is still permitted,
 - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`).
 - `--strip-unused` — force reachability-based pruning even at `-O0`:
 - for `--kind executable`, enables the same unreachable-function pruning normally tied to `-O1`+,
 - for `--kind static` and `--kind shared`, prunes unreachable non-exported helper functions from the root exported surface before emission,
 - for `--kind object`, unreachable non-exported helpers are already pruned; the flag is accepted for consistency,
 - when executable builds auto-load std modules, `--strip-unused` is incompatible with `--std-lib` / `--std <path>.a` because whole-archive std linking defeats fine-grained std reachability pruning.
 - `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
 - `-Wz <spec>`, `-Wz,<spec>` — pass a repeatable Z3 parameter spec to Formal Silk verification:
 - `NAME=VALUE` and `config:NAME=VALUE` call `Z3_set_param_value` on every verifier config,
 - `global:NAME=VALUE` calls `Z3_global_param_set` before verifier contexts are created,
 - names and values must be non-empty; Silk passes valid specs through without whitelisting Z3 parameter names.
 - `--kind <kind>` — select the output kind:
 - `executable` (default)
 - `object` (ELF64 relocatable object on `linux/x86_64`; Mach-O relocatable object on `macos/aarch64` hosts)
 - `static` (static library archive on `linux/x86_64`)
 - `shared` (shared library on `linux/x86_64`)
 - `--emit bin|asm` — select emission mode:
 - `bin` (default) emits the selected binary artifact at the `-o` / `--out` path.
 - `asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux/x86_64` and writes it to the `-o` / `--out` path.
 - `-S` — alias of `--emit asm` (defaults to `--kind object` when `--kind` is not set).
 - `--list-targets` — list the recognized `--target` triples (including supported output kinds and any current const-main-only notes) and exit.
 - `--list-archs` — list the recognized `--arch` values and exit.
 - `--arch <arch>` — shorthand for selecting a known target:
 - `x86_64` / `amd64` → `linux-x86_64`,
 - `aarch64` / `arm64` → `linux-aarch64`,
 - `wasm32` → `wasm32-unknown-unknown`,
 - `wasm32-wasi` → `wasm32-wasi`,
 - for convenience, `--arch` also accepts full target triples recognized by `--target`.
 - `--target <triple>` — select the compilation target (implementation):
 - `linux-x86_64` (default; emits ELF64 binaries as described below),
 - common `x86_64-*-linux-*` triples such as `x86_64-linux-gnu` are accepted as aliases for `linux-x86_64`,
 - const-main-only native executable output (no IR backend yet; requires a constant-expression `main` that reduces to a constant integer or a `void` main that falls through; supports `fn main () -> int`, `fn main () -> void`, `fn main(argc: int, argv: u64) -> int`, and `fn main(argc: int, argv: u64) -> void` when arguments are unused):
 - `linux-aarch64` (ELF64)
 - `android-aarch64` (ELF64)
 - `macos-x86_64` (Mach-O 64-bit)
 - `windows-x86_64` (PE32+)
 - `windows-aarch64` (PE32+)
 - `macos-aarch64`:
 - supports the const-main Mach-O path above everywhere the target is recognized, and
 - on Apple Silicon macOS hosts also has a temporary host `clang -c` /
 `ld` non-const executable bring-up path for the current integer/bool
 scalar IR subset,
 - and on those Apple Silicon hosts the target metadata and subset
 diagnostics reflect that narrower non-const subset instead of
 presenting `macos-aarch64` as uniformly const-main-only
 - `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64`:
 - support const-main Mach-O executable output everywhere the targets
 are recognized (`ios-aarch64` stamps iPhoneOS / device metadata;
 simulator targets stamp iPhoneSimulator metadata),
 - on Apple Silicon macOS hosts also support the same temporary
 host-backed non-const pure-Silk scalar executable subset via host
 `clang -c` / `ld`, including reachable float-to-int lowering via
 target-correct helper objects compiled from `src/silk_rt_f128.c`,
 - the same host-backed iOS path now also compiles the portable
 bundled runtime helper families on demand for the requested iOS SDK
 target (number / regex / unicode / filesystem / dns / process /
 signal / term / pty / readline / task-pool / async),
 - the same host-backed iOS path now also supports mixed `.slk` +
 native `.c` / `.h` / `.m` / `.o` / `.a` executable inputs, plus
 native-input-only executables whose `main` comes from linked
 objects or archives,
 - Objective-C `.m` inputs are compiled through the target SDK clang
 path and supported executable outputs that include them link the
 Objective-C runtime automatically,
 - Objective-C `.m` inputs that import Cocoa / AppKit or UIKit also add
 the corresponding Apple framework (`AppKit.framework` or
 `UIKit.framework`) to the host-backed Mach-O executable link; inputs
 that import Foundation add `Foundation.framework`,
 - on `macos-aarch64`, reachable Silk `ext` calls whose symbol name
 starts with `silk_appkit_` opt the executable link into
 `AppKit.framework`, supporting native AppKit `.m` providers shipped
 beside Silk code,
 - when reachable iOS executable code uses `std::window`, the CLI
 automatically materializes an adjacent `<output>.app` bundle
 containing the executable, `Info.plist`, and `PkgInfo`; this is
 opt-in through `std::window` usage, not a separate flag,
 - `wasm32-unknown-unknown` (IR-backed wasm32 mode; emits a `.wasm` module exporting `memory` and exported functions, including `main` when present; `ext` declarations become imports under `env.<name>`; also supports export-only modules with no `main` for JS/Node-style embedding),
 - `wasm32-wasi` (IR-backed wasm32 WASI mode; emits `memory` and `_start () -> void`, imports `wasi_snapshot_preview1.proc_exit`, and calls Silk `fn main () -> int` or `fn main () -> void`; also supports export-only modules for embedding, which do not include `_start`),
 - unknown or currently unsupported triples cause `silk build` to fail with `error[E4001]: unsupported code generation target`.
 - Note: wasm targets are only supported for `--kind executable` currently.
 - `--arch` and `--target` are mutually exclusive; passing both is an error.
 - `--c-header <path>` — emit a generated C header declaring the root package’s exported symbols (C ABI consumption):
 - writes prototypes for `export fn` and `extern const` declarations for supported `export let` constants,
 - if the parent directories of `<path>` do not exist, the compiler creates them (like `mkdir -p`),
 - only supported for `--kind object|static|shared` (rejected for `--kind executable`),
 - requires the root package (the first input module’s package) to be the global package (omit `package ...;` in exported library sources).
 - `--cflag <arg>` — add an additional native compiler argument used when compiling `.c`, `.h`, and `.m` inputs; may be repeated.
 - `-I <path>`, `-I<path>` — add a native include search path; may be repeated.
 - `-isystem <path>`, `-isystem<path>` — add a native system include search path; may be repeated.
 - `--ldflag <arg>` — add a backend linker argument; prefer the dedicated `-l` and `-Wl` flags for command-line builds. Recognized arguments follow the same backend rules as those dedicated flags; may be repeated.
 - `-L <path>`, `-L<path>` — add a library search path; host-backed Apple links pass it to the platform linker, and `linux-x86_64` uses it to resolve `-l` / `-l:` names to dynamic dependencies or static archives.
 - `-l <name>`, `-lname` — link with a library name; on host-backed Apple Mach-O this is passed to `ld`, while `linux-x86_64` searches `-L` paths first and otherwise translates it to a `DT_NEEDED` soname.
 - `-Wl <arg>`, `-Wl,<arg>` — pass backend linker arguments; platform-linker backends pass comma-split payloads through, while internal ELF supports the translated `-rpath`, `-soname`, and `--dynamic-linker` forms.
 - Apple SDK linking flags are shown in `silk build --help` only on Apple Silicon macOS compiler hosts and are supported for host-backed macOS/iOS executable targets:
 - `--framework <name>` — link an Apple framework by name,
 - `-F <path>`, `-F<path>` — add an Apple framework search path.
 - `--needed <soname>` — add a dynamic loader dependency (emitted as `DT_NEEDED`) for executable and shared outputs; may be repeated.
 - `--runpath <path>`, `--rpath <path>` — add a runtime search path element (emitted as `DT_RUNPATH`) for executable and shared outputs; may be repeated (joined with ':').
 - `--soname <soname>` — set the shared library soname recorded as `DT_SONAME` for shared outputs (an empty string clears it).
 - `--elf-interp <path>` — override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` executable outputs.
 - `--nostd`, `-nostd` — disable stdlib auto-loading; std modules must be satisfied by explicitly passing source files.
 - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) — override the stdlib root directory used to resolve `from "std/..."` module specifiers and direct std ABI imports.
 - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) — select a stdlib archive path for linking auto-loaded `std::...` modules during executable builds.
 - The build currently:
 - runs front-end checks,
 - when multiple input files are provided, performs module-set validation (package/import resolution + multi-module type checking that accounts for imported exported constants and imported `export fn` calls for the current scalar subset),
 - resolves `std::...` imports by loading stdlib source files from a configured stdlib root (see **Environment** below),
 - for `--kind executable` (the default):
 - when the module set defines a valid Silk entrypoint, enforces the executable entrypoint rule (exactly one `main` of either `fn main() -> int`, `fn main() -> void`, `async fn main() -> int`, `async fn main() -> void`, `fn main(argc: int, argv: u64) -> int`, or `fn main(argc: int, argv: u64) -> void`),
 - task-backed executable entrypoints such as `task fn main` and `async task fn main` are rejected by the executable runtime path and should be rewritten so task work happens inside an ordinary or async `main`,
 - script-style entrypoints: when the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> void` that executes those statements,
 - when the module set defines no valid Silk `main`, requires an object/archive-provided `main(argc: int, argv: u64) -> int` symbol (for example from a `.c`/`.m`/`.o`/`.a` input) and emits an entry stub that forwards `argc`/`argv` to it,
 - note: for now, `--std-lib` / `--std <path>.a` is rejected when linking additional `.c`/`.h`/`.m`/`.o`/`.a` inputs into an executable (std sources are compiled into the build instead),
 - on `linux/x86_64` native executables, when the `argc`/`argv` form is used, `argv` is a raw pointer to the argv pointer list (a C-style `char**`, where `argv[0]` is at byte offset `0`, `argv[1]` at `8`, etc.),
 - for `--kind object`, `--kind static`, and `--kind shared`, `main` is optional; the current backend emits supported `export fn` functions and supported exported constants (`export let` with an explicit type annotation and a literal initializer; currently scalar types and `string`), plus a valid executable `main` when present, as global symbols,
 - it is valid for a non-executable output to contain no globally-visible symbols (for example, type-only or interface-only modules); in that case the build still succeeds and produces an “empty” object/archive/shared library,
 - declaration-only exported function prototypes (`export fn name(...) -> T;`) are accepted as module exports for type-checking, but do not emit code; calls lower as link-time symbol references that must be satisfied by other Silk sources in the module set and/or `.c`/`.m`/`.o`/`.a` inputs,
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
 - on supported native hosts (`linux/x86_64`, `macos/aarch64`), when `std::crypto` and/or `std::tls` are imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol families, `silk` auto-links the vendored static archives (`libsodium.a` and the mbedTLS archives) from the compiler prefix so executables do not depend on system `libsodium` / `mbedTLS` shared libraries at runtime,
 - on `linux/x86_64`, when `std::sqlite` is imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `sqlite3_*` symbols, `silk` auto-links the vendored `libsqlite3.a` archive so executables do not depend on a system SQLite shared library at runtime,
 - on supported native hosts (`linux/x86_64`, `macos/aarch64`), when `std::ssh` or `std::ssh2` are imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `libssh2_*` symbols, `silk` auto-links the vendored `libssh2.a` archive (and its vendored crypto dependencies) so executables do not depend on a system `libssh2` shared library at runtime,
 - on `linux/x86_64`, when `std::dylib` is imported, or when linked native `.o` / `.a` inputs reference bundled `silk_rt_dylib_*` runtime symbols, `silk` automatically adds `libdl.so.2` as a `DT_NEEDED` dependency,
 - on supported native hosts (`linux/x86_64`, `macos/aarch64`), when `std::ggml` is imported, or when linked native `.o` / `.a` inputs reference `silk_ggml_init`, `silk` auto-links the vendored ggml archives; on `linux/x86_64` it also adds `libstdc++.so.6`, `libgcc_s.so.1`, `libm.so.6`, and `libdl.so.2`, while on Apple Silicon macOS hosts it adds `-lc++` for the native link,
 - on `linux/x86_64`, when `std::window` reaches the bundled runtime, `silk` adds the dynamic-loader dependency used by the runtime-loaded GTK provider (`libdl.so.2` on glibc targets, `libdl.so` on musl targets); GTK itself is not recorded as a required `DT_NEEDED` entry,
 - when bundled runtime helpers are imported (for example via `import regex from "std/regex";`), `silk` statically links the bundled runtime archive (`libsilk_rt.a`, or `libsilk_rt_noheap.a` when `--noheap`) into the output, and does not emit a runtime `DT_NEEDED` dependency on `libsilk_rt*`,
 - `--needed` entries starting with `libsilk_rt` are rejected; the bundled runtime support layer is always linked from the static archives,
 - additional dependencies must be declared via `--needed` (or be available in the process global scope at load time, for example via `LD_PRELOAD`),
 - multi-file builds are supported for `--kind executable` and for `--kind object`, `--kind static`, and `--kind shared`:
 - when multiple packages are present in a module set for a non-executable output, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output,
 - attempts to emit a native executable using:
 - a constant-expression backend for a small, fully constant subset of `main` bodies on platforms that support the minimal const-main stub (ELF64/Mach-O/PE32+), and
 - on `linux/x86_64`, an IR→ELF backend for a richer scalar subset (integers, `bool`, `char`, `f32`/`f64`, `Instant`, `Duration`),
 - when `silk build` runs on macOS and emits `macos-x86_64` or `macos-aarch64`, the compiler also applies an ad hoc host signing step so the generated Mach-O executable is runnable on macOS hosts, including Apple Silicon,
 - the `macos-aarch64` const-main subset is emitted by Silk’s native Mach-O backend before that host signing step runs,
 - Apple Silicon macOS hosts also use a temporary host `clang -c` /
 `ld` path for the current non-const scalar IR executable
 implementation on:
 - `macos-aarch64`,
 - `ios-aarch64`,
 - `ios-simulator-aarch64`,
 - and `ios-simulator-x86_64`,
 - on `macos-aarch64`, that temporary Apple Silicon path also links
 bundled runtime-backed executables by expanding `libsilk_rt*.a`
 into object members for the host linker,
 - on the three iOS device/simulator targets, the supported
 subset remains pure-Silk scalar based, but now also includes reachable
 float-to-int lowering plus the portable bundled runtime helper
 families for number / regex / unicode / filesystem / dns /
 process / signal / term / pty / readline / task-pool / async
 support via target-correct helper objects compiled for the
 requested iOS SDK target (mixed/native `.c` / `.h` / `.m` / `.o` / `.a`
 executable inputs are now supported there, and hosted async / task
 runtime linkage now works through the embedded `silk_rt_async.c`
 path),
 - diagnostics should describe these as concrete backend/target limits
 rather than generic "subset" failures; when lowering/codegen rejects a
 program after type-checking, the compiler should name the blocked
 target/output/function/construct directly,
 - when `--kind object`, `--kind static`, or `--kind shared` is selected, the build attempts the IR→ELF backend for `linux-x86_64` outputs for the same implemented coverage; on Apple Silicon macOS hosts it also attempts a Mach-O relocatable-object backend for `--kind object` with `--target macos-aarch64`, and emits `E4001` / `E4002` diagnostics for programs outside the implemented backend coverage,
 - when lowering cannot isolate a narrower statement / expression span, `E4001` falls back to the offending function declaration and names that function directly,
 - the constant subset consists of:
 - a single `main` with result type `int` or `void` (either `fn main() -> int`, `fn main() -> void`, `fn main(argc: int, argv: u64) -> int`, or `fn main(argc: int, argv: u64) -> void`; in the 2-parameter form the body must not depend on `argc`/`argv`) with:
 - zero or more `let` statements with constant integer initializers followed by exactly one `return` of a constant integer expression (literals, `+`, `-`, `*`, `/`, `%`, and references to constant `let` bindings), or
 - the same, with a final `if` whose condition is a compile-time boolean literal (`true` / `false`) and whose branches each satisfy the “constant lets + return constant expression” rule, and
 - optionally, one or more trivial constant `while` loops before the final `return`, with constant boolean conditions and bodies of constant `let` bindings followed by `break;`, with verification directives treated as metadata,
 - on `linux/x86_64`, the IR→ELF backend supports a broader subset in which:
 - `fn main() -> int`, `fn main() -> void`, and helper functions:
 - use only scalar parameters (defaulting to `int` when unannotated) drawn from `int`, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`, and the fixed-width integer types (`u8`/`i8` … `u64`/`i64`); helper functions return a scalar from the same set, or `void` (omitted result type or explicit `-> void`) when used only as standalone statements (`return;` and implicit fallthrough returns are supported for `void` helpers),
 - helpers may also accept and return `string` values at ABI boundaries (represented as `{ ptr: u64, len: i64 }` / `SilkString`; results return via `rax`/`rdx`),
 - use integer arithmetic (including unary `-x`), bitwise operators (including unary `~x`), and comparisons, plus floating-point arithmetic/comparisons over `f32`/`f64` (including unary `-x`),
 - use `char` literals (UTF-8 or escaped) and `==` / `!=` comparisons over `char` values,
 - use `bool` as a surface type (lowered to integer 0/1 in IR),
 - use structured control flow (`if` / `else`, `while`, `break;`, `continue;`) with conditions built from boolean literals, comparisons, calls to `bool`-returning helpers, logical operators `!` / `&&` / `||` (with `&&` / `||` short-circuiting), and boolean locals,
 - use boolean expressions in `let` initializers and `bool` return statements, including short-circuit `&&` / `||` (for example `let flag: bool = a && b;`),
 - allow call expressions as standalone statements (discarding the returned value),
 - allow assignment and compound assignment to `let mut` locals by name (`x = expr;`, `x += y;`); `=` is supported for all currently supported value types (including `string`, the supported `struct` subset, and optionals of those), and compound assignments are supported only for numeric scalar locals,
 - for optionals in the supported subset (scalar payloads, `string?`, and optionals of the supported `struct` subset), supports `None`, `Some(<expr>)`, `==` / `!=` comparisons (tag + payload equality; `opt == None` and `opt == Some(x)` infer type from the other operand), optional field access (`opt?.field`), `match <scrutinee> { None => <expr>, Some(<name|_>) => <expr>, }`, and `??` coalescing with short-circuit fallback evaluation (including unwrapping `T??` to `T?`); the same `??` operator is also accepted for recoverable `Result`-style values and for ordinary named enums with exactly two declared variants, where declaration order defines the coalescing shape (first variant = success side, second variant = fallback side); the right-hand side of `??` may also be the narrow terminal control-flow forms `return`, `break`, or `continue` (with the same validity rules as the statement forms); nested optionals (`T??`) are supported for the same payload subset, and optionals pass/return between helpers as `(bool tag, payload0, payload1, ...)` where the payload slots follow the lowering of the underlying type (for example `string?` is `(bool, u64 ptr, i64 len)`); for non-executable outputs, exported functions may accept and return these optionals,
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
 - Package-scoped source-doc queries are evaluated against the root package’s own source modules, not dependency docs in the same manifest graph.
- **Man command:**
 - `silk man [--list] [--search <pattern>] [--section <n>|-s <n>] [--package <dir|manifest|module>] [--std-root <path>] [<query>]`:
 - Resolves shipped toolchain pages, stdlib module/symbol docs, and source-derived package API docs.
 - When a package root is in scope via `--package`, nearest-manifest discovery, or package-search-path resolution, `silk man` also discovers package-authored overview, documentation, and manual pages from that root:
 - local `package.readme` paths act as the package overview page,
 - local `package.documentation` paths act as the package docs landing page,
 - local metadata doc paths must stay inside the package root; absolute paths and `..` escapes are rejected,
 - package manual roots are discovered from common in-package man source trees and installed `share/man/man{1,3,7}` layouts.
 - Package-scoped source-doc queries are evaluated against the root package’s own source modules, not dependency docs in the same manifest graph.
 - With no explicit query, `silk man` opens the nearest package overview when one is available; otherwise it falls back to the quick-start/list view.
 - `--list` and `--search` include these package-local pages whenever a package root is already in scope.
 - `--search <pattern>` searches:
 - shipped section `1` / `3` / `7` pages,
 - stdlib module names,
 - public stdlib symbol paths,
 - package-local overview, documentation, and manual pages when a package root is in scope,
 - and public root-package symbol paths when a package root is in scope.
 - When stdout is not a TTY, `silk man <query>` writes the resolved roff page to stdout instead of invoking the interactive viewer.
 - When the host `man` command cannot open the generated local page directly, `silk man` falls back to the configured pager (`MANPAGER` / `PAGER`).
 - When a local `package.readme` exists, `silk man readme`, `silk man overview`, `silk man <package-name>`, and qualified aliases such as `silk man <package-name> readme` prefer the package overview page.
 - When a local `package.documentation` page exists, `silk man docs`, `silk man documentation`, and qualified aliases such as `silk man <package-name> documentation` open it directly.
- **Guide command:**
 - `silk guide [--db <path>] [--json] [--limit <n>] [--printer <cmd>] <query>`:
 - queries the installed guide database generated from `examples/guide/catalog.json`.
 - the seeded corpus floor is `1000` entries, including documentation-backed reference guides for every canonical language and standard-library page.
 - generated public-symbol metadata routes shipped std `export` declarations and public methods (`public fn` and `public async fn`) to the matching API guide.
 - `--list` lists seeded guide ids/titles.
 - `--show <id>` prints a single guide entry with its stored source.
 - `--show <prefix>` expands matching guide ids such as `fs` -> `fs/...` and may print multiple guide entries.
 - `--json` emits structured search/show payloads without repo-relative source paths and with list metadata preserved as JSON arrays.
 - `--db <path>` overrides the database path.
 - `--limit <n>` caps list/search results (default: `8`).
 - query forms:
 - free text: `silk guide read file`
 - natural free text: `silk guide how to read a file`
 - exact tags: `silk guide tags:concurrency`
 - exact modules: `silk guide module:std::task`
 - exact public std symbols: `silk guide std::http::request`, `silk guide ByteSlice.find_bytes`, or `silk guide GL_TEXTURE_2D`
 - documentation-backed references: `silk guide tags:reference-guide`, `silk guide language types`, or `silk guide std io overview`
 - exact diagnostics: `silk guide diag:E2034` or `silk guide E2034`
 - exact guide ids: `silk guide fs/file-roundtrip`
 - exact aliases are preferred before free-text FTS search
 - free-text search first applies deterministic intent routing for common phrasing such as `read from stdin` and `how do i make a http request`, then uses the bundled SQLite FTS5 guide index, ignores common filler terms such as `how`, `to`, and `a`, and text output includes a `matched:` reason for each hit.
 - non-empty searches that still miss after alias/FTS routing report no matches instead of printing the alphabetical `--list` output.
 - `--printer <cmd>` selects the source printer used by `--show`; precedence is `--printer`, then `SILK_GUIDE_PRINTER`, then `bat`, then `cat`.
 - `--show` text omits `Run:`, `Source:`, and `Verified:` summary fields, renders `Docs:` as canonical docs links URLs, prints the stored Silk source directly instead of fenced code blocks, and collapses generated prefix matches that share the same source body.
 - database lookup order:
 - `SILK_GUIDE_DB` when set,
 - otherwise `../share/silk/guide.db` relative to the `silk` executable,
 - otherwise the staged development copy under `build/share/silk/guide.db` when available.
- **Error command:**
 - `silk error <code>`:
 - prints the canonical diagnostic code, category, short description,
 documentation references, any bundled example, and a guide lookup hint
 only when the installed guide catalog links that diagnostic code,
 - accepts copied forms such as `E2028`, `2028`, `diag:E2028`, and
 `error[E2028]`,
 - syntax-highlights bundled examples when stdout is a color-capable TTY;
 non-TTY output, `NO_COLOR`, and `TERM=dumb` stay plain.
 - `silk error --list` / `silk error -l`:
 - prints every stable compiler error code and its short description in
 deterministic order.
- **Proto command:**
 - `silk proto [options] <schema.proto> [<schema.proto> ...]`:
 - parses Protocol Buffers v3 schemas and emits Silk source without invoking `protoc`,
 - `--help`, `-h` — show `proto` usage and exit,
 - `-I <dir>` / `-I<dir>` / `--proto-path <dir>` / `--include <dir>` — add schema import roots,
 - `-o <dir>` / `--out-dir <dir>` — select the output root (default: `.`),
 - `--module <name>` — override the generated module name for a single input schema,
 - `--include-imports` — accepted for explicit import-closure output; imported schema dependencies are emitted automatically so generated Silk imports resolve,
 - `--descriptor-out <path>` — write a deterministic `version: 1` JSON schema summary for tooling, including files, imports, options, messages, fields, oneofs, enums, services, RPCs, reserved declarations, map metadata, packed field status, and resolved type names,
 - `--` — end of options; treat remaining args as schema paths,
 - each schema must declare `syntax = "proto3";`,
 - schema parsing accepts adjacent protobuf string literals in string-valued positions and supports normal imports, public import re-exports, and unused missing weak imports,
 - schema integer parsing accepts protobuf decimal, hexadecimal, octal, and signed integer literal forms where the grammar permits signed integers,
 - validation rejects cyclic imports, invalid or reversed reserved ranges, enum values outside the protobuf int32 range, labelled map fields, helper-name collisions, and unsupported `extend`/`extensions`/`group` forms,
 - output paths mirror generated module names (`acme::chat::person` writes `<out-dir>/acme/chat/person.slk`),
 - generated modules use `std::protobuf` for wire-format encoding, decoding, skipping, and unknown-field preservation,
 - enum fields use generated raw-value wrappers so unknown proto3 enum numbers are preserved,
 - repeated scalar and enum fields encode with proto3 packed records by default unless `[packed = false]` is present, while generated decoders accept both packed and unpacked wire forms,
 - singular message fields and explicit `optional` fields use `T?` storage for proto3 presence, and singular message wire repeats merge into existing payloads,
 - generated service metadata includes RPC descriptor structs and lookup helpers,
 - generated modules type-check, build as object code, and can be imported by Silk programs that construct, encode, decode, and inspect messages.
- **Cache command:**
 - `silk cache [subcommand] [--package <dir|manifest>] [--cache-dir <path>]`:
 - manages the recognized compiler cache under `<work_root>/cache`
 (default: `.silk/cache`; see `SILK_WORK_DIR` below).
 - current recognized managed entry types:
 - CLI build-cache artifact entries under `build/<sha256-key>/`,
 - and `std::build` generated-file blobs under `build/<fnv1a64>.blob`.
 - `silk cache` by itself prints a cache-root summary (same as
 `silk cache inspect`).
 - subcommands:
 - `path` — print the effective cache root.
 - `list` — list recognized managed cache entries with type, size,
 recency, and health.
 - `inspect [<entry>]` — inspect the cache root or one recognized entry.
 - `prune` — prune recognized managed cache entries by age/size policy.
 - `compact` — auto-heal recognized entries, remove stale broken managed
 residue, and then apply pruning policy.
 - `clear` — remove recognized managed cache entries while preserving
 unknown/unmanaged files under the cache root.
 - common maintenance options:
 - `--dry-run`
 - `--max-age <age>`
 - `--max-size <bytes>`
 - `--keep-recent <n>`
 - safety model:
 - cleanup commands remove only recognized managed cache entries or stale
 broken managed residue,
 - unknown/unmanaged files under the cache root are preserved.
 - default automatic maintenance policy:
 - auto-heal enabled,
 - auto-prune enabled,
 - maximum size `2 GiB`,
 - maximum age `30d`,
 - keep recent `64`.
 - environment overrides:
 - `SILK_CACHE_AUTO_HEAL`
 - `SILK_CACHE_AUTO_PRUNE`
 - `SILK_CACHE_MAX_BYTES`
 - `SILK_CACHE_MAX_AGE`
 - `SILK_CACHE_KEEP_RECENT`
- **C compiler wrapper:**
 - `silk cc <cc args...>`:
 - runs a host C compiler to build programs that embed or link against `libsilk.a`,
 - selects the compiler executable via `SILK_CC` (when set), otherwise falls back to `cc`,
 - automatically adds include and library search paths adjacent to the installed `silk` binary (for example `../include`, `../include/silk`, and `../lib`), plus `-lsilk`,
 - on `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (vendored Z3 is built as C++),
 - passes through additional arguments verbatim to the underlying compiler (files, flags, `-o`, `-I`, `-L`, etc.); use `silk help cc` for wrapper usage.

## Environment

See also: [`silk-env(1)`](?p=man/silk-env.1) for a complete list of environment variables printed by `silk env`.

- `SILK_STD_ROOT` — path to the stdlib root directory used to resolve
 `from "std/..."` module specifiers and direct std ABI imports when `--std`/`--std-root` is not provided. When neither
 is set (and `--nostd` is not set), `silk` searches for:
 - a `std/` directory in the current working directory (development default), otherwise
 - `../share/silk/std` relative to the `silk` executable (installed default).
- `SILK_WORK_DIR` — base directory for compiler-generated scratch/debug artifacts (defaults to `.silk`).
 - For example, the managed cache root is `$SILK_WORK_DIR/cache`, Formal Silk Z3 dumps are written under `$SILK_WORK_DIR/z3`, and `silk man` may write temporary roff output under `$SILK_WORK_DIR/man`.
- `SILK_CACHE_AUTO_HEAL` — enable/disable built-in healing of recognized managed cache entries during normal builds (default: enabled).
- `SILK_CACHE_AUTO_PRUNE` — enable/disable built-in pruning of recognized managed cache entries during normal builds (default: enabled).
- `SILK_CACHE_MAX_BYTES` — maximum size of recognized managed cache entries before size-based pruning runs (default: `2147483648`, or `2 GiB`; `0` disables size pruning).
- `SILK_CACHE_MAX_AGE` — maximum age of recognized managed cache entries before age-based pruning runs (default: `30d`; `0` disables age pruning).
- `SILK_CACHE_KEEP_RECENT` — preserve at least this many most-recently-used recognized managed cache entries during pruning (default: `64`).
- `SILK_STD_LIB` — path to a target-specific stdlib static archive (`libsilk_std.a`).
 When present, supported executable builds treat auto-loaded `std::...` modules as
 external and resolve their exported functions from this archive.
- `SILK_GUIDE_DB` — override the installed guide database path used by
 `silk guide` when `--db <path>` is not provided.
- `SILK_GUIDE_PRINTER` — override the source printer used by `silk guide --show`
 when `--printer <cmd>` is not provided.
- `PREFIX` — installation prefix used for:
 - the system package search root at `PREFIX/lib/silk` (searched last when it exists), and
 - `silk build install` / `silk build uninstall` when `-p/--prefix` is not provided.
 Default: `/usr/local`.
- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve
 bare-specifier package imports (non-`std::`) in file-list workflows (when `--package`
 is not used).
 - When `SILK_PACKAGE_PATH` is set, it is the primary search path (entries separated by `:` on POSIX, `;` on Windows).
 - When `SILK_PACKAGE_PATH` is not set, `silk` uses a small default set:
 - `./packages` when it exists (development convenience),
 - `../share/silk/packages` relative to the `silk` executable (installed layout),
 - `$HOME/.local/share/silk/packages` when it exists (user-local installs).
 - Finally, `silk` appends a system library root at `PREFIX/lib/silk` as the last search path entry when it exists.
 - A package like `my_api::core` maps to the candidate manifest
 `<root>/my_api/core/silk.toml` (where `::` maps to `/`).
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier. When `--z3-lib` is not provided, the verifier will use this value when set.
- `SILK_VERIFY_JOBS` — override the number of worker threads used for Formal Silk verification (default: auto; capped at 8).
- `SILK_TEST_TIMEOUT_MS` — per-top-level-test process timeout in milliseconds (default: `30000`).
- `SILK_TEST_JOBS` — override the number of test processes run in parallel (default: `1`; `0` means auto; capped at 8). Overridden by `silk test --jobs`.
- `SILK_TEST_MAX_OUTPUT_BYTES` — maximum bytes of stdout/stderr captured per test process for diagnostics (default: `1048576`). Output beyond this limit is truncated.
- `SILK_CC` — the host C compiler executable used by `silk cc` (defaults to `cc` when unset).
- `SILK_ELF_INTERP` — override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` outputs when emitting dynamically-linked executables/shared libraries.

## See Also

- [`silk-build(1)`](?p=man/silk-build.1), [`silk-package(1)`](?p=man/silk-package.1), [`silk-cache(1)`](?p=man/silk-cache.1), [`silk-check(1)`](?p=man/silk-check.1), [`silk-test(1)`](?p=man/silk-test.1), [`silk-doc(1)`](?p=man/silk-doc.1), [`silk-man(1)`](?p=man/silk-man.1), [`silk-guide(1)`](?p=man/silk-guide.1), [`silk-error(1)`](?p=man/silk-error.1), [`silk-cc(1)`](?p=man/silk-cc.1), [`silk-lsp(1)`](?p=man/silk-lsp.1)
- [`silk(7)`](?p=man/silk.7)
- [`libsilk(7)`](?p=man/libsilk.7)
- `https://oro.computer/silk`
