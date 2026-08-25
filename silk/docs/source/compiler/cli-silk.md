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

The implementation is intentionally smaller and focuses on:

- global options:
 - `--help` / `-h` — print global usage and exit,
 - `help` — print global usage and exit,
 - `help <command>` — print command-specific usage and exit,
 - live help surfaces group options and notes by purpose instead of emitting a
 flat option dump; for example `build`, `check`, `test`, `doc`, `man`,
 `package`, and the utility commands use grouped terminal help sections,
 - `--version` — print the Silk toolchain version, ABI version, and git commit and exit,
- `silk repl` — start an interactive “compile-and-run” REPL:
 - currently supported on:
 - `linux/x86_64` via the native ELF executable backend,
 - `macos/aarch64` on Apple Silicon hosts for session startup and non-printing declaration/state lines via the current host-backed `macos-aarch64` executable path,
 - current Apple Silicon note:
 - the REPL command itself now starts on `macos/aarch64`,
 - REPL value auto-printing and `std::io` formatting-driven runtime lines use
 the current host-backed `macos-aarch64` executable path, so unsupported
 backend shapes still report normal compile diagnostics,
 - intended as a node-like default when `silk` is launched with no arguments
 and stdin is a TTY,
 - stateful by replay of **state-building lines**:
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
 await operand diagnostic,
 - supports:
 - `.help` — show help,
 - `.man <query>` — render inline documentation for current-session symbols,
 imported symbols, and `std::...` modules/symbols, with highlighted Silk
 synopsis/examples and comment-colored prose descriptions when ANSI colors
 are available,
 - `.clear` — reset session state,
 - `.cls` — clear the screen,
 - `.undo` — undo the last committed line,
 - `.exit` — exit the REPL,
 - interactive TTY input is syntax-highlighted as the user types; when ANSI
 colors are available, shared completion prefixes also appear as a dim inline
 completion hint and `Tab` accepts or cycles the active completion, using
 the same ordered candidate set as the hint,
 - `Ctrl-R` starts reverse incremental history search in TTY mode; type to
 filter, press `Ctrl-R` again to move to older matches, `Enter` to accept
 the selected line, or `Escape` / `Ctrl-G` to cancel back to the original
 edited line,
 - completion candidates include REPL commands, language keywords, std
 namespace paths, quoted `from "std/..."` import specifier paths,
 current-session declarations and bindings, imported symbols, functions,
 static impl functions after `Type.`, and struct fields or receiver methods
 after typed values and receiver expressions such as call results, indexed
 values, chained field accesses, imported type aliases, and result/optional
 receiver chains,
 - the live highlighting/hint surface uses the same Silk lexer-backed ANSI
 colors as REPL `.man` source snippets and is disabled for non-TTY input,
 `NO_COLOR`, and dumb/unsupported terminals,
 - supports multi-line input: when delimiters are unbalanced (for example `{` without `}`),
 the REPL prompts with `... ` and keeps reading until the statement is complete,
 - continuation lines are pre-indented from the current unmatched delimiter
 depth so nested `{}`, `()`, and `[]` constructs carry indentation
 forward,
 - when a complete pasted chunk contains multiple top-level entries, the REPL
 splits and executes them in order while keeping multiline blocks/declarations
 together,
 - multiline expressions still use the normal expression/auto-print path when
 they are not declaration or statement forms, including multiline raw
 backtick strings,
 - Ctrl-C cancels a pending multi-line statement,
 - symbol queries: when a line is a bare identifier or qualified name (for example `User`,
 `User.method`, `std::fs`, `std::io::println`, or an imported namespace
 alias such as `fs` or `fs::FileResult` after `import fs from "std/fs";`),
 the REPL prints the matching declaration or module overview from the
 current session or imported modules instead of executing it,
 - `.man` is intentionally narrower than `silk man`:
 - it is for inline REPL browsing of module/symbol docs,
 - use `silk man ...` outside the REPL for sectioned/shipped pages,
 search, and list modes (for example `silk man 7 silk` or
 `silk man --search io`),
 - history is loaded/saved to:
 - `$SILK_REPL_HISTORY` when set, otherwise
 - `$SILK_WORK_DIR/repl_history` (default: `.silk/repl_history` under the
 nearest package root or current directory),
 - `Ctrl-R` searches that in-memory history during interactive editing,
- `silk check [--json] [--verify|--no-verify] [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--feature <spec> ...] [--arch <arch>] [--target <triple>] [--security-provider <auto|platform|builtin>] [--package <dir|manifest>] <file> [<file> ...]` — parse and type-check one or more Silk source files as a unit, exiting with:
 - code `0` on success,
 - non-zero on error, printing a human-readable diagnostic (format specified in [diagnostics](?p=compiler/diagnostics)).
 - `--json` writes a newline-terminated, schema-versioned JSON result packet
 to stdout instead of the human success line, and compiler diagnostics
 emitted through the standard diagnostic path are written as JSON diagnostic
 packets.
 - when `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk check` behaves as if `--package .` was provided.
 - when `--package` is provided and the root manifest enables a build module
 via `[build].build_module = true`, the compiler runs that build module and
 type-checks the emitted manifest/module set instead of the raw `silk.toml`;
 for compatibility, the build module currently receives the action string
 `build`.
- `silk targets [--json]` — inspect target triples and architecture aliases:
 - human output matches the target/architecture lists used by
 `silk build --list-targets` and `silk build --list-archs`; target lines
 show current-host output kinds and call out Apple Silicon macOS host-backed
 support when it is not available on the current host; AMDGPU targets are
 listed for metadata and backend-encoder discovery, but are not yet general
 `silk build` GPU lowering targets,
 - `--json` emits a packet with `schemaVersion`, `command`, `host`,
 `targets`, `architectures`, and per-target capability facts including
 baseline output kinds, current-host output kinds, native-input support,
 POSIX/Unix/WASM shape, and current async-runtime availability.
- `silk devices <subcommand> [options]` — discover and manage platform devices:
 - `list` and `doctor` report the local desktop backend plus platform device
 backends discovered from installed tools,
 - `--json` emits `schemaVersion`, `command: "devices"`, host metadata,
 normalized device records, backend/tool availability, and, for `list`, raw
 platform listing command output for editor, CI, and agent workflows,
 - `setup` delegates to setup/listing commands for the selected platform
 backend (`xcrun simctl`, `xcrun devicectl`, or `adb`),
 - `install`, `uninstall`, `boot`, `shutdown`, `launch`/`run`, and `logs`
 cover the app lifecycle for supported simulators, physical devices,
 emulators, and local desktop launch/log surfaces,
 - `--kind <desktop|ios-simulator|ios-device|android>` selects a backend;
 when omitted, install/launch actions infer from `--app`, `--bundle-id`,
 or `--package` where the artifact shape is unambiguous,
 - `--` passes remaining arguments to the underlying platform tool so users
 can reach SDK-specific flags without leaving the Silk CLI.
- `silk codesign <subcommand> [options]` — sign and verify platform artifacts:
 - `doctor` and `list-tools` report installed signing tools, including
 `codesign`, `apksigner`, `jarsigner`, `keytool`, `dpkg-sig`, `rpmsign`,
 `rpmkeys`, `appimagetool`, and `gpg`,
 - `--json` emits `schemaVersion`, `command: "codesign"`, host metadata, and
 tool availability,
 - `sign` and `verify` select a platform with `--platform <auto|macos|ios|android|linux>`
 or infer one from the input extension when possible,
 - macOS/iOS signing delegates to `codesign`; Android APK signing delegates
 to `apksigner` by default, Android App Bundle/JAR-compatible signing
 delegates to `jarsigner`, and Android keystore creation delegates to
 `keytool`;
 Linux signing selects `dpkg-sig`, `rpmsign`/`rpmkeys`, `appimagetool`, or
 `gpg` by artifact format,
 - `--tool` can override Android and Linux tool selection, and `--` passes
 remaining arguments through to the selected signing tool.
- `silk graph [--json] [--nostd] [--std-root <path>] [--feature <spec> ...] [--arch <arch>] [--target <triple>] [--package <dir|manifest>] <file> [<file> ...]` — inspect the module/package/import graph loaded by the CLI:
 - accepts the same stdlib, feature, package, and target selectors as
 `silk check`,
 - when inputs are omitted and `./silk.toml` exists, behaves as if
 `--package .` was provided,
 - loads the module set but does not type-check, lower, or emit code,
 - `--json` emits `schemaVersion`, `command`, `target`, module counts,
 package roots, and module entries with origin (`user`, `package`, or
 `std`) plus parsed import declarations.
- `silk size [--json] <artifact>` — inspect an output artifact:
 - human output prints file size and available section sizes,
 - `--json` emits `schemaVersion`, `command`, `path`, `fileSize`, `format`,
 and `sections`,
 - ELF64 little-endian artifacts report section names, offsets, sizes, and
 allocation/write/execute flags; other artifact formats currently report
 `format: "unknown"` with an empty section list,
 - very large artifacts still report `fileSize` from filesystem metadata even
 when section parsing is skipped.
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [--feature <spec> ...] [--security-provider <auto|platform|builtin>] [-O <0-3>] [--noheap] [--jobs <n>] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]` — compile and run language-level `test` declarations found in the module set, emitting TAP output:
 - uses TAP version 13 formatting (`TAP version 13`, `1..N`, `ok`/`not ok` lines),
 - each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite,
 - top-level test bodies that contain `await` are run through async test wrappers and awaited by the generated runner,
 - executable test runners use the native host target when Silk has a host-backed executable backend for it, and otherwise fall back to the `linux/x86_64` executable backend. Formal Silk target metadata in `silk test` reflects that selected execution target.
 - the supported code generation subset matches `silk build` for the selected execution target.
 - `--filter <pattern>` runs only tests whose **test path** contains `<pattern>` (substring match). The test path is the nested `test "..." { ... }` stack joined with `/` (for example `suite/case`).
 - when nested tests are present, the runner prints subtest progress lines to stderr as they complete:
 - `ok - suite/case`
 - `not ok - suite/case`
 - execution controls:
 - `--jobs <n>` runs up to `<n>` test processes in parallel (default: `1`; `0` means auto; capped at `8`).
 - `SILK_TEST_JOBS` overrides `--jobs` when `--jobs` is not provided (default: `1`; `0` means auto; capped at `8`).
 - `SILK_TEST_TIMEOUT_MS` overrides the per-top-level-test process timeout (default: `30000`),
 - `SILK_TEST_MAX_OUTPUT_BYTES` caps captured stdout/stderr per test process for diagnostics (default: `1048576`; output beyond this limit is truncated).
 - when `<file> ...` inputs are omitted and `--package` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
- when `--package` is provided:
 - input files must be omitted (the compiler loads the package module set from the manifest),
 - the manifest file is `silk.toml` (when a directory is provided, it is discovered in that directory),
 - when the root manifest enables a build module via `[build].build_module = true`, the compiler runs that build module and uses the emitted manifest for package tests; for compatibility, the build module currently receives the action string `build`,
 - manifest-native link metadata for the test harness (`[[target]].inputs`, `cflags`, `ldflags`, `needed`, and `runpath`) is taken from:
 - `[build].default_target` when it names a code target,
 - otherwise the first declared code target,
 - matching package and dependency `[[native]]` entries are merged as
 package-level native requirements,
 - while `kind = "man"` targets are ignored for target metadata,
 - raw `.c`, `.h`, and supported `.m` source inputs are compiled to
 temporary objects before the harness is linked,
 - built-in provider native-input auto-linking for libsodium, mbedTLS, and
 libssh2, plus built-in SQLite auto-linking, follows the same
 supported-target rules as `silk build --package`,
 - and when no code target exists, tests run without manifest link metadata,
 - see [package manifests](?p=compiler/package-manifests) for the manifest format and source discovery rules.
- `silk doc` — generate documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations:
 - Markdown mode: `silk doc [--all] <file> [<file> ...] [-o <output.md>]`
 - by default, includes:
 - exported `fn`/`let`/`ext`/`type`/`theory` declarations and exported `impl` methods, and
 - all `struct`/`enum`/`error`/`interface` declarations in the input modules,
 - `--all` includes non-exported functions, bindings, and methods,
 - when `-o` / `--out` is provided, writes the Markdown output to that path; otherwise writes to stdout.
 - Manpage mode: `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <output.man>]`
 - renders a single roff `man(7)` page to stdout (or to `-o` / `--out` when provided),
 - the page kind is derived from the documentation tags (`@cli` → section 1, `@misc` → section 7, otherwise section 3 for API pages),
 - when `<query>` is not `std::...`, the module set is loaded from `--package` when provided; otherwise the compiler searches the current working directory and its parents for `silk.toml` and uses the nearest match,
 - package-scoped source-doc queries are evaluated against the root package’s own source modules, not dependency docs in the same manifest graph,
 - intended as a non-interactive complement to `silk man <query>`.
- `silk man <query>` — render and view a temporary manpage for a symbol/module/concept derived from source documentation:
 - `std::...` queries are resolved from the configured stdlib root (see “standard library import resolution” below),
 - other queries are resolved from `--package <dir|manifest|module>` when provided; otherwise the compiler searches the current working directory and its parents for `silk.toml` and uses the nearest match,
 - when a package root is in scope, `silk man` also discovers package-authored docs/man pages from that root:
 - local `package.readme` paths act as the package overview page,
 - local `package.documentation` paths act as a package docs landing page,
 - local metadata doc paths must stay inside the package root; absolute
 paths and `..` escapes are rejected,
 - and package man roots are discovered under `docs/man/`, `man/`,
 `share/man/`, and installed sectioned roots such as `share/man/man1/`,
 - package-scoped source-doc queries are evaluated against the root package’s own source modules, not dependency docs in the same manifest graph,
 - API symbol pages are derived from exported/public declarations; non-exported declarations are intentionally omitted so docs match the public surface,
 - when no manifest is found, the compiler may also resolve the query from the package search path (`SILK_PACKAGE_PATH`).
 - to select a shipped toolchain page by section, prefer `silk man 7 silk` or `silk man silk.7` (most shells require quoting `silk(7)`).
 - discovery helpers:
 - `silk man` (no arguments) opens the nearest package overview when one is in scope; otherwise it prints a quick-start plus a list of entrypoints,
 - `silk man --list` lists shipped pages, common stdlib entrypoints, and package-local pages when a package root is in scope,
 - `silk man --search <pattern>` searches:
 - shipped section 1/3/7 pages,
 - stdlib module names,
 - public stdlib API symbol paths,
 - package-local overview/docs/man pages when a package root is in scope,
 - and public root-package symbol paths when a package root is in scope.
 - use `silk man <query>` when you want to open docs immediately, and
 `silk doc --man <query> -o <path>` when you want the generated roff page
 as a file.
 - when stdout is not a TTY, `silk man <query>` writes the resolved roff
 page to stdout instead of invoking the interactive `man` viewer.
 - when the host `man` command cannot open the generated local page
 directly, `silk man` falls back to the configured pager (`MANPAGER` /
 `PAGER`).
 - shorthands:
 - `silk man build` opens `silk-build(1)` (same for `repl`, `package`,
 `cache`, `devices`, `codesign`, `check`, `targets`, `graph`, `size`,
 `test`, `doc`, `man`, `guide`, `error`, `proto`, `help`, `lsp`, `cc`,
 `env`, and `format` / `fmt`),
 - when no package is selected/resolvable, `silk man fs` is treated as `silk man std::fs` (and similarly for other top-level std modules).
 - when no package is selected/resolvable, `silk man io println` (or `silk man 3 io println`) is treated as `silk man std::io::println`.
 - when a package root is selected/resolved, `silk man readme`, `silk man overview`, `silk man <package-name>`, and qualified aliases such as `silk man <package-name> readme` prefer the package overview page when a local `package.readme` exists.
 - when a package root is selected/resolved, `silk man docs`, `silk man documentation`, and qualified aliases such as `silk man <package-name> documentation` open the local `package.documentation` page when present.
 - when a query cannot be resolved, `silk man` prints actionable next steps (try `--search`, `--list`, or qualify with `std::...` / `pkg::...`).
- `silk guide [options] <query>` — search a curated installed example corpus:
 - the source-of-truth catalog lives in `examples/guide/catalog.json`,
 - install/build staging generates `share/silk/guide.db`,
 - the seeded corpus target is at least `1000` entries and is guarded by repo tests,
 - the corpus combines runnable examples with documentation-backed reference guides covering every canonical page under `docs/language/` and `docs/std/`,
 - generated public-symbol metadata lets `silk guide` route shipped std `export` declarations and public methods (`public fn` and `public async fn`) to the matching `std/*-api` guide,
 - fixture-backed seeded guides are promoted to `verified_build` when they compile cleanly,
 - `silk guide --list` lists seeded guide ids and titles,
 - `silk guide --show <id>` renders one guide entry with an action-first summary plus the stored Silk source,
 - `silk guide --show <prefix>` expands guide-id prefixes such as `fs` or `task` and may render multiple matching guides; when generated variants share the same source body, show output keeps one entry and prefers the canonical overview variant,
 - `silk guide --json ...` emits machine-readable search/show payloads with list-valued metadata rendered as JSON arrays,
 - `silk guide tags:<name>` queries normalized tag metadata,
 - `silk guide module:std::task` queries normalized std-module metadata, and direct module names such as `silk guide std::task` still resolve as module lookups when they are not exact public-symbol matches,
 - `silk guide std::http::request`, `silk guide std::mime::content_type_with`, `silk guide std::atomic::AtomicU64.fetch_add`, `silk guide std::dylib::open_self`, `silk guide ByteSlice.find_bytes`, and `silk guide GL_TEXTURE_2D` query generated public std symbol metadata before free-text FTS search,
 - `silk guide diag:E2034` (or `silk guide E2034`) queries normalized diagnostic-code metadata,
 - exact alias matches are resolved before free-text FTS search,
 - free-text guide search first applies deterministic intent routing plus filler-word normalization for common natural-language queries such as `how to read a file`, `how can i open a file and read it`, `read from stdin`, and `how do i make a http request`,
 - free-text queries search a bundled SQLite FTS5 index over guide titles,
 summaries, stored source, aliases, keywords, tags, modules, requirements, docs, and diagnostics,
 - non-empty guide queries that still miss after alias/FTS routing return no matches instead of falling back to the alphabetical `--list` output,
 - documentation-backed reference guides are tagged with `reference-guide` and link directly to canonical language/std docs,
 - reference queries such as `silk guide language atomics` and `silk guide std io overview` route to documentation-backed entries,
 - text search results include an explicit `matched:` reason,
 - `--show` prioritizes `What`, `Why`, and other action-oriented metadata before secondary search metadata, does not print `Run:`, `Source:`, or `Verified:` summary fields, and renders `Docs:` as canonical docs links URLs,
 - the stored Silk source is printed directly through the configured printer path instead of fenced code blocks,
 - guide `Docs:` references are rendered as canonical docs URLs rather than repo-relative markdown paths,
 - guide source output is printed through the configured printer path (or direct plain source fallback), not wrapped in fenced code blocks,
 - high-traffic diagnostics may point directly at guide lookups such as `silk guide E2030` and `silk guide E2034`,
 - `--db <path>` overrides the database path for testing/staging,
 - `--printer <cmd>` chooses the source printer for `--show`; if omitted, `SILK_GUIDE_PRINTER` is used, then `bat`, then `cat`,
 - `SILK_GUIDE_DB` overrides the installed database path when `--db` is not provided,
 - `SILK_GUIDE_PRINTER` overrides the `--show` source printer when `--printer` is not provided.
- `silk error [--json] <code>` — look up a stable compiler diagnostic code:
 - prints the canonical code, category, short description, documentation
 references, any bundled example, and a guide lookup hint only when the
 installed guide catalog links that diagnostic code,
 - `--json` emits `schemaVersion`, `command`, `mode`, and a structured
 `diagnostic` object for lookup, or a `diagnostics` array for `--list`,
 - examples are syntax-highlighted when stdout is a color-capable TTY; piped
 output, `NO_COLOR`, and `TERM=dumb` stay plain,
 - accepted code forms include `E2028`, `2028`, `diag:E2028`, and
 `error[E2028]`,
 - `silk error --list` and `silk error -l` list all stable compiler error
 codes and their short descriptions in deterministic order.
- `silk proto [options] <schema.proto> [<schema.proto> ...]` — compile
 Protocol Buffers v3 schemas to Silk modules without invoking `protoc`:
 - `-I <dir>`, `-I<dir>`, `--proto-path <dir>`, and `--include <dir>` add
 schema import roots,
 - `-o <dir>` / `--out-dir <dir>` selects the output root (default: `.`),
 - `--module <name>` overrides the generated module name for a single input,
 - `--include-imports` is accepted for explicit import-closure output;
 imported schema dependencies are emitted automatically so generated Silk
 imports resolve,
 - `--descriptor-out <path>` writes a deterministic `version: 1` JSON schema
 summary for tooling, including files, imports, options, messages, fields,
 oneofs, enums, services, RPCs, reserved declarations, map metadata, packed
 field status, and resolved type names,
 - each file must declare `syntax = "proto3";`,
 - schema parsing accepts adjacent protobuf string literals in string-valued
 positions and supports normal imports, public import re-exports, and unused
 missing weak imports,
 - schema integer parsing accepts protobuf decimal, hexadecimal, octal, and
 signed integer literal forms where the grammar permits signed integers,
 - validation rejects cyclic imports, invalid or reversed reserved ranges, enum
 values outside the protobuf int32 range, labelled map fields, helper-name
 collisions, and unsupported `extend`/`extensions`/`group` forms,
 - output paths mirror generated module names (`acme::chat::person` becomes
 `<out-dir>/acme/chat/person.slk`),
 - generated modules use `std::protobuf` for protobuf binary wire helpers,
 - enum fields use generated raw-value wrappers so unknown proto3 enum numbers
 are preserved,
 - repeated scalar and enum fields encode with proto3 packed records by
 default unless `[packed = false]` is present, while generated decoders
 accept both packed and unpacked wire forms,
 - singular message fields and explicit `optional` fields use `T?` storage for
 proto3 presence, and singular message wire repeats merge into existing
 payloads,
 - generated service metadata includes RPC descriptor structs and lookup
 helpers,
 - generated modules type-check, build as object code, and can be imported by
 Silk programs that construct, encode, decode, and inspect messages.
- `silk package inspect|lint [--json] [--package <dir|manifest>]`:
 - `inspect` prints package metadata, public definitions, dependency
 constraints, declared artifacts, the current package hash, and any
 installed Formal Silk bundle paths discovered under
 `share/silk/formal/<artifact-relative-path>/...`,
 - `inspect --json` emits `schemaVersion`, `command`, `mode`, `root`,
 `sha256`, and a structured `manifest` object with definitions, dist
 patterns, dependencies, artifacts, native requirements, and Formal Silk
 bundles,
 - `lint` validates that `[package].definitions`, `[dist]`, and `[[artifact]]`
 describe a coherent distributable package root,
 - `lint --json` emits `ok`, `issueCount`, and an `issues` array while keeping
 the same exit-code behavior as human output,
 - when `--package` is omitted and `./silk.toml` exists, the current
 directory is used.
- `silk cache [subcommand] [--json] [--package <dir|manifest>] [--cache-dir <path>]`:
 - the managed cache root is `<work_root>/cache` where `<work_root>` defaults
 to `.silk` and can be overridden via `SILK_WORK_DIR`,
 - current recognized managed entry types include:
 - CLI build-cache artifact entries under `cache/build/<sha256-key>/`,
 - and `std::build` generated-file blobs under `cache/build/<fnv1a64>.blob`,
 - the default `silk cache` form prints a cache-root summary (same as
 `silk cache inspect`),
 - `--json` emits `schemaVersion`, `command`, `mode`, `cacheRoot`, and
 subcommand-specific fields:
 - `path`: the resolved cache root,
 - `list`: `summary` plus sorted `entries`,
 - `inspect`: root `summary`/`policy` or a single `entry`,
 - `prune`/`compact`/`clear`: `dryRun`, `healedEntries`,
 `removedEntries`, and `reclaimedBytes`,
 - subcommands:
 - `path` — print the effective cache root path,
 - `list` — list recognized managed cache entries with type/size/health,
 - `inspect [<entry>]` — inspect the cache root or one entry in detail,
 - `prune` — prune recognized managed entries by the active/default
 age/size policy,
 - `compact` — auto-heal recognized entries, remove stale broken managed
 residue, and then apply pruning policy,
 - `clear` — remove recognized managed entries under the selected cache root,
 - cleanup commands are conservative:
 - unknown/unmanaged files under the cache root are preserved,
 - and `--dry-run` previews removals without deleting anything,
 - policy defaults:
 - auto-heal enabled,
 - auto-prune enabled,
 - maximum size `2 GiB`,
 - maximum age `30d`,
 - keep at least `64` recent recognized managed entries,
 - policy overrides:
 - `SILK_CACHE_AUTO_HEAL`
 - `SILK_CACHE_AUTO_PRUNE`
 - `SILK_CACHE_MAX_BYTES`
 - `SILK_CACHE_MAX_AGE`
 - `SILK_CACHE_KEEP_RECENT`
- `silk env [--json]` — print key environment variables consulted by the `silk` CLI (stdlib resolution, Formal Silk verification, paging, build scratch dirs, C compiler selection).
 - `--json` emits `schemaVersion`, `command`, and `vars`, where each entry
 records `name`, `state` (`unset`, `empty`, or `set`), and `value`.
 - includes `SILK_GUIDE_DB`, which overrides the installed `share/silk/guide.db` path used by `silk guide`.
 - includes the cache-maintenance environment variables that control the
 managed cache policy (`SILK_CACHE_*`).
- `silk format [--json] [--check] <path> [<path> ...]` (alias: `silk fmt`) — format Silk source files (`.slk` / `.silk`) using project configuration from `.silk/format.toml` (discovered by walking upward from each formatted file’s directory).
 - `--json` emits `schemaVersion`, `command`, `ok`, `check`, `status`,
 `changedCount`, and `changedFiles`; in `--check` mode, files that would
 change still produce a non-zero exit code with `ok: false`,
 - recursive directory walks honor `.gitignore`, including parent repository
 ignore files when you format a subdirectory,
 - explicitly named file paths still format even when ignored, so targeted
 one-off formatting remains possible,
 - the formatter is intentionally readability-oriented rather than indentation-only:
 - same-line statement runs are split so each statement or block body starts on its own line,
 - semicolons nested inside paren/bracket groups stay inline instead of being treated as statement boundaries (for example `join(T; h)` and `for (...; ...; ...)` remain single-line unless the source already breaks them),
 - newline-based `if` / `else if` headers keep the opening `{` on its own
 line and indent chained condition lines one level deeper than the
 control keyword,
 - standalone block-closing `}` boundaries are given breathing room (for example an `if { ... }` followed by another statement becomes `}\n\nnext;` while `} else {` stays on one line),
 - formatter-emitted layout preserves the file’s detected newline style (`\n` vs `\r\n`) instead of introducing mixed line endings,
 - ordinary line/block comments are preserved instead of being deleted or reflowed away during formatting,
 - named import lists with more than three imported symbols are rewritten to one symbol per line,
 - and comment-free leading import headers are canonicalized into sections:
 - `std::...` / std-root imports first,
 - then non-relative package/module imports,
 - then relative file imports,
 with alphabetical sorting inside each section.
 - the header reordering pass is conservative:
 - when the leading package/module/import region contains ordinary comments or other non-whitespace trivia, the formatter preserves that header region instead of reordering it,
 - but it still normalizes the blank-line boundary between that preserved header region and the first non-header declaration.
- diagnostics (initial):
 - emits a single primary error diagnostic on error,
 - includes a stable error code for known error kinds,
 - includes a file/line/column location and caret snippet when available,
 - source and module read failures describe common filesystem problems in
 user-facing terms, such as a directory being provided where a file is
 expected, rather than exposing implementation error tags,
 - when stderr is a TTY, diagnostics are decorated with ANSI colors unless disabled via `NO_COLOR` or `TERM=dumb`,
 - `silk check --json` emits schema-versioned JSON packets with
 `ok`, `diagnostics`, and `summary` fields; diagnostic entries contain
 `severity`, `code`, `message`, optional `span`, optional `detail`, `notes`,
 and `helps`,
 - `silk error <code>` explains a diagnostic code after the fact, and
 `silk error --list` lists the stable catalog,
 - the diagnostic format and initial error code set are specified in [diagnostics](?p=compiler/diagnostics).
- standard library import resolution (first slice):
 - when a module contains `import std::...;` or a module-specifier import such
 as `import { println } from "std/io";`, the CLI automatically loads the
 referenced `std::...` package modules from a configured stdlib root, so
 downstream users do **not** need to pass std source files explicitly on the
 command line,
 - when `--nostd` (or `-nostd`) is provided, this auto-loading is disabled and
 `std::...` imports, including `from "std/..."` module specifiers, must be
 satisfied by explicitly passing source files (or the build fails),
 - the stdlib root is selected via:
 - `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) when provided, otherwise
 - `SILK_STD_ROOT` (environment variable) when set, otherwise
 - a `std/` directory in the current working directory (development default), otherwise
 - `../share/silk/std` relative to the `silk` executable (installed default), otherwise
 - walk upward from the `silk` executable’s directory to find a `std/` directory (developer build fallback).
 - package-to-path mapping is deterministic: `std::foo::bar` resolves to the
 file `<std_root>/foo/bar.slk`.
 - JS-style module specifiers that start with `std/` are std package
 specifiers, not file imports:
 - `from "std/foo/bar"` normalizes to package `std::foo::bar`,
 - a trailing `.slk` is accepted for compatibility and is stripped before
 package normalization,
 - named imports bind against the package export surface and can participate
 in prebuilt std archive linking.
- package search path import resolution (non-`std::`):
 - when a module imports an unquoted package path (for example `import api from my_api;`),
 the CLI may load that package from a package search path:
 - when `SILK_PACKAGE_PATH` is set, it is the primary search path (PATH-like list of roots separated by `:` on POSIX, `;` on Windows),
 - for package graph work, relative entries are resolved from the
 importing package root and then from parent package roots up to the
 graph root, with the historical current-working-directory fallback
 checked afterward,
 - when `SILK_PACKAGE_PATH` is not set, the CLI uses a small default set:
 - `packages/` relative to the importing package and each parent package
 root up to the graph root,
 - `./packages` from the current working directory,
 - `../share/silk/packages` relative to the `silk` executable (installed layout),
 - `$HOME/.local/share/silk/packages` when it exists (user-local installs),
 - finally, the CLI appends a system library root at `PREFIX/lib/silk` (default `PREFIX=/usr/local`) as the last search path entry when it exists,
 - package-to-path mapping is deterministic: `my_api::core` resolves to the candidate
 directory `<root>/my_api/core` and the manifest `<candidate>/silk.toml`,
 - qualified symbol imports resolve the longest package prefix that exists (for example
 `my_api::core::Thing` loads `my_api::core` if present, otherwise `my_api`),
 - the same search path is used when loading manifest dependencies that omit a `path`
 field; in that case the dependency key, not a quoted `from` package name, is
 the search candidate, and dot-separated dependency keys map to slash
 directories (`my.dep.b` -> `<root>/my/dep/b`) (see
 [package manifests](?p=compiler/package-manifests)).
- standard library archive linking (`linux/x86_64`, current archive layout):
 - `make stdlib` builds a target-specific static archive (`libsilk_std.a`)
 containing one ELF object per std module (repo default:
 `build/lib/silk/std/libsilk_std.a`),
 - for supported `silk build --kind executable` builds, the compiler can treat
 auto-loaded `std::...` modules as **external** during code generation and
 resolve their exported functions from the archive when available (while
 still type-checking the std sources as part of the module set),
 - by default this archive-linking path is only used for `-O0` builds (when
 `-O` is omitted, this is usually the case only when `--debug` is enabled),
 - for `-O1`+ builds, `silk build` prefers compiling std sources into the
 executable so unreachable std code can be pruned,
 - `--std-lib` / `--std <path>.a` forces archive linking regardless of `-O`,
 - std modules auto-loaded via `import std::...;` and package-shaped
 `from "std/..."` module specifiers participate in this external/archive
 path,
 - archive discovery (in order):
 - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) when provided, otherwise
 - `SILK_STD_LIB` when set, otherwise
 - `build/lib/silk/std/libsilk_std.a` when using the in-repo `std/` root, otherwise
 - `../lib/silk/std/libsilk_std.a` relative to the `silk` executable, otherwise
 - `../lib/libsilk_std.a` relative to the `silk` executable (legacy installed layout), otherwise
 - common installed-layout heuristics derived from the selected stdlib root,
 - walk up from the current working directory to find `libsilk_std.a`, `lib/libsilk_std.a`, or `lib/silk/std/libsilk_std.a`,
 - when no suitable archive is found (or on unsupported targets), the compiler
 falls back to compiling the reachable std sources into the build,
 - `--nostd` disables stdlib auto-loading and avoids linking the default std
 archive (but users may still explicitly provide their own `std::...` inputs
 as ordinary source files),
- user-provided `package std::...;` modules continue to override the default
 std implementation for the same package names.
- security provider selection:
 - `--security-provider <auto|platform|builtin>` is accepted by `silk build`,
 `silk check`, and `silk test`.
 - Precedence is CLI flag, then `SILK_SECURITY_PROVIDER`, then
 `[build] security_provider`, then `auto`.
 - `auto` selects platform-backed APIs first on Apple targets and falls back
 to built-in archives for std APIs that do not yet have an Apple platform
 mapping; it selects `builtin` elsewhere.
 - `platform` is valid only for Apple targets and is strict. It routes the
 currently supported `std::crypto` primitives (`init`, `memzero`, `equal`,
 and `std::crypto::random`) through the Apple Security runtime helpers and
 links `Security.framework`; `std::net` also links `Network.framework` for
 Apple-provider builds while Network-backed TCP/UDP work continues. It
 rejects `std::tls`, `std::ssh` / `std::ssh2`, native inputs that reference
 libsodium or mbedTLS symbols, and advanced `std::crypto::*` modules until
 platform mappings exist for those APIs.
 - `builtin` uses the toolchain-built libsodium, mbedTLS, and libssh2 static
 archives.
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [-Wz <spec> ...] [--feature <spec> ...] [-f <spec> ...] [--security-provider <auto|platform|builtin>] [--debug] [-O <0-3>] [--noheap] [--strip-unused] [--package <dir|manifest>] [--build-module] [--package-target <name> ...] <input> [<input> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [-S] [--arch <arch>] [--target <triple>] [--gpu-target <gpu-triple>] [--list-targets] [--list-gpu-targets] [--list-archs] [--c-header <path>] [--cflag <arg> ...] [-I <path> ...] [-isystem <path> ...] [-L <path> ...] [-l <name> ...] [-Wl <arg> ...] [--ldflag <arg> ...] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>] [--elf-interp <path>]` (or `--out <path>`) — for now:
 - `silk build -h` groups the live help into: General; Stdlib and verification; Output and target selection; Link inputs and dynamic linking; Package builds; Install and uninstall. Linux ELF-only flags are shown in terminal help only on Linux compiler hosts, and Apple SDK linking flags are shown only on Apple Silicon macOS compiler hosts. The static docs below remain the full cross-target reference.
 - inputs are classified by extension:
 - `.slk` — Silk source files (compiled as the module set),
 - `.o` — relocatable objects linked into `--kind executable|shared` outputs (and included in `--kind static` archives),
 - `.a` — static archives; their `.o` members are treated like object inputs,
 - `.so` — shared libraries treated as dynamic dependencies (equivalent to `--needed <soname>` using the library’s basename),
 - `.c` — C sources compiled to objects via the native compiler for the active target and then treated like `.o` inputs,
 - `.m` — Objective-C sources compiled to objects for the supported Apple host-backed Mach-O targets and then treated like `.o` inputs,
 - `.h` — header build inputs:
 - if a sibling `.c` exists next to the header, Silk compiles that `.c` and treats the resulting object like a `.o` input,
 - otherwise, if a sibling `.m` exists next to the header, Silk compiles that Objective-C source and treats the resulting object like a `.o` input,
 - otherwise Silk falls back to compiling the header itself as a C translation unit (`-x c`) and then treats the resulting object like a `.o` input,
 - note: linking `.o`/`.a`/`.c`/`.h` inputs is supported for `linux/x86_64` outputs and for `macos-aarch64` plus iOS device/simulator executable/object/static/shared outputs on Apple Silicon macOS hosts,
 - note: compiling Objective-C `.m` inputs is supported only for `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, and `ios-simulator-x86_64` on Apple Silicon macOS hosts; supported executable/shared outputs that include `.m` inputs are linked against the Objective-C runtime automatically,
 - note: Objective-C `.m` inputs that import Cocoa / AppKit or UIKit also
 add the corresponding Apple framework (`AppKit.framework` or
 `UIKit.framework`) to the host-backed Mach-O executable/shared link; inputs that
 import Foundation add `Foundation.framework`,
 - note: native C/Objective-C inputs that import Security or Network add
 `Security.framework` or `Network.framework` respectively to supported
 host-backed Apple executable/shared links,
 - note: on `macos-aarch64`, reachable Silk `ext` calls whose symbol name
 starts with `silk_appkit_` opt the executable link into
 `AppKit.framework`; this supports examples and applications that ship a
 native AppKit `.m` provider beside Silk code,
 - note: when linking non-PIC object inputs that reference external data symbols directly via `R_X86_64_PC32` (for example `stdout`/`stderr` from `fprintf`), the backend supports the common pointer-load pattern by emitting a writable COPY slot and `R_X86_64_COPY` relocation so the dynamic loader initializes it; other external-data `R_X86_64_PC32` patterns are rejected,
 - `--cflag <arg>` may be repeated to add additional native compiler arguments when compiling `.c`, `.m`, and `.h` inputs,
 - `-I <path>` / `-I<path>` and `-isystem <path>` / `-isystem<path>` are direct repeatable include-path forms for native `.c`, `.h`, and `.m` compilation,
 - when multiple input files are provided (or when imports load multiple modules), runs module-set front-end checks (package/import resolver + multi-module type checking that accounts for imported exported constants and imported `export fn` calls),
 - declaration-only exported function prototypes (`export fn name(...) -> T;`) are accepted as module exports for type-checking, but do not emit code; calls lower as link-time symbol references that must be satisfied by other Silk sources in the module set and/or non-`.slk` link inputs (`.o`/`.a`/`.c`/`.m`),
 - when a single input file is provided and no imports load additional modules, the compiler may run the existing single-module front-end checks (a fast path intended for constant-expression programs),
 - when no input files are provided and `--package` / `--pkg` is omitted, but `./silk.toml` exists, the compiler behaves as if `--package .` was provided (package builds from the current directory by default),
 - on interactive TTY stderr, `silk build` renders a single animated progress
 line while it walks source files, import/package traversal, dependency
 artifact scans, dependency native requirements, built-in external auto-link
 passes, and later
 `resolve` / `check` / `codegen` / `link` phases,
 - this line is transient and is cleared before diagnostics or other stderr
 output so build errors remain readable,
 - non-interactive output (for example CI logs or piped output) stays
 concise and only prints the final artifact summary lines,
 - successful builds now report final artifacts in the form
 `build: <kind> -> <path>`,
 - when `--package` is provided:
 - `.slk` input files must be omitted (the module set is loaded from the manifest), but non-`.slk` link inputs (`.c`, `.h`, `.m`, `.o`, `.a`, `.so`) may still be provided,
 - `--build-module` runs `<package_root>/build.slk` and uses the manifest it
 emits as the package manifest (see [build scripts](?p=compiler/build-scripts)),
 - `--build-module-path <path>` overrides the default build module path
 (and implies `--build-module`),
 - legacy aliases: `--build-script` and `--build-script-path`,
 - build modules are opt-in by default; to run one without `--build-module`,
 set `[build].build_module = true` in `silk.toml`
 (see [package manifests](?p=compiler/package-manifests)),
 - successful compilation or cache restoration of the compiler-generated
 build-module runner is intentionally silent; final artifact summaries
 describe only user-requested package targets, while runner diagnostics
 and build-module stderr are still emitted,
 - `--package-target <name>` selects one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias),
 - when omitted, the compiler builds every manifest `[[target]]` entry by default,
 - this includes manifest `kind = "man"` targets, which emit package-owned manpages from either static sources or source-doc queries,
 - source-doc man queries are evaluated against the root package’s own source modules, not dependency docs in the same manifest graph,
 - when building multiple targets (the default when `--package-target` is omitted, or when it is repeated), per-output flags are rejected:
 `-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--gpu-target`, `--c-header`, `--cflag`, `-I`, `-isystem`, `--ldflag`, `-l`, `-L`, `--framework`, `-F`, `-Wl`, `--needed`, `--runpath`, `--soname`, `--elf-interp`,
 - `-o/--out` is optional only when building a single target (defaults to the target’s `output` or a computed default under `build/`),
 - package dependencies are loaded from the manifest’s `[dependencies]` table,
 and matching dependency `[[native]]` entries are linked when the imported
 dependency is present in the loaded module set,
 - see [package manifests](?p=compiler/package-manifests),
 - `silk build install` installs package artifacts (package builds only):
 - prefix selection:
 - `-p <path>`, `--prefix <path>` when provided, otherwise
 - `$PREFIX` (environment variable) when set, otherwise
 - `/usr/local`.
 - staging:
 - `--destdir <path>` stages the install under `<destdir><prefix>/...`
 without changing the logical prefix recorded in the package layout.
 - installs:
 - package-owned artifacts under `<prefix>/lib/silk/<package>/...`
 (for example `lib/<target>/...` or `bin/<target>/...` inside the
 package root),
 - package-owned manpages under
 `<prefix>/lib/silk/<package>/share/man/man{1,3,7}/...` and mirrored to
 `<prefix>/share/man/man{1,3,7}/...`,
 - emitted C headers inside the package root and mirrored to
 `<prefix>/include/silk/<package>/` for compatibility,
 - executables inside the package root and mirrored to `<prefix>/bin` for
 compatibility,
 - and, when `[package].definitions` is set, installs those definition
 files plus an installed `silk.toml` under
 `<prefix>/lib/silk/<package>/` so the package is importable from the
 system package search root (`PREFIX/lib/silk`).
 - when a built artifact exposes exported Formal Silk surface, the install
 also copies the compiler-emitted Formal Silk bundle into
 `<prefix>/lib/silk/<package>/share/silk/formal/<artifact-relative-path>/`
 as `manifest.json` plus `bundle.smt2`,
 - when local `[package].readme` / `[package].documentation` landing pages
 are present, the install copies them into
 `<prefix>/lib/silk/<package>/share/silk/docs/readme/...` or
 `<prefix>/lib/silk/<package>/share/silk/docs/documentation/...` and
 rewrites the installed `silk.toml` to those packaged paths,
 - when `[package].documentation` points at a static man target source,
 the installed `silk.toml` rewrites it to the installed `share/man/...`
 path so package docs aliases continue to resolve after install, without
 also installing a redundant `share/silk/docs/documentation/...` copy.
 - note: installing library targets requires `[package].definitions` to be
 set and non-empty; executable-only and manpage-only packages do not.
 - writes an uninstall receipt at
 `<prefix>/lib/silk/<package>/.silk_install_receipt`.
 - `silk build uninstall` removes files listed in the uninstall receipt (same prefix selection rules as install).
 - when `-o/--out` or `--c-header` includes parent directories that do not exist yet, the compiler creates them (like `mkdir -p`),
 - multi-file builds are supported for `--kind executable` and for `--kind object`, `--kind static`, and `--kind shared`:
 - when multiple packages are present in a module set for a non-executable output, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output,
 - for `--kind executable`:
 - when the module set defines a valid Silk entrypoint, enforces the executable entrypoint rule (exactly one `main` of either `fn main() -> int`, `fn main() -> void`, `async fn main() -> int`, `async fn main() -> void`, `fn main(argc: int, argv: u64) -> int`, or `fn main(argc: int, argv: u64) -> void`),
 - script-style entrypoints: when the **first** `.slk` input contains top-level *statements* (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` treats those statements as a script body and synthesizes an implicit `fn main() -> void` that executes them,
 - when the module set defines no valid Silk `main`, requires an object/archive-provided `main(argc: int, argv: u64) -> int` symbol (for example from a `.c`/`.m`/`.o`/`.a` input) and emits an entry stub that forwards `argc`/`argv` to it,
 - note: for now, `--std-lib` / `--std <path>.a` is rejected when linking additional `.c`/`.h`/`.m`/`.o`/`.a` inputs into an executable (std sources are compiled into the build instead),
 - for `linux/x86_64` native executables, when the `argc`/`argv` form is used, the entry stub passes:
 - `argc`: the process argument count, and
 - `argv`: a raw pointer to the argv pointer list (a C-style `char**`, where `argv[0]` is at byte offset `0`, `argv[1]` at `8`, etc.),
 - other targets and backends may continue to require the parameterless `fn main() -> int` or `fn main() -> void` forms until they implement argument passing,
- for `--kind object`, `--kind static`, and `--kind shared`, `main` is optional; the current backend emits supported `export fn` functions and supported exported constants (`export let`/`export const`; scalar exports require an explicit type annotation, and string exports may omit `: string` when the initializer is a string literal), plus a valid executable `main` when present, as globally-visible symbols,
 - it is valid for a non-executable output to contain no globally-visible symbols (for example, type-only or interface-only modules); in that case the build still succeeds and produces an “empty” object/archive/shared library,
 - `--debug` (or `-g`) enables a debug build mode for the supported `linux/x86_64` back-end subset:
 - failed `assert` prints a panic header + optional message + stack trace to stderr (via glibc `backtrace_symbols_fd`) before aborting, and
 - dynamically-linked executables export internal function symbols in `.dynsym` (similar to `-rdynamic`) so stack traces can be symbolized without external tooling,
 - when Formal Silk verification fails, `--debug` also emits a Z3 debug block and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`; see [formal verification](?p=language/formal-verification)),
 - compiled code can query build metadata at runtime via `std::runtime::build::{is_debug,kind,mode,version}()`,
 - `--noheap` disables heap allocation for the current compiler/runtime subset:
 - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
 - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
 - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
 - non-stdlib concurrency usage that declares or forms `Task(...)` / `Promise(...)` handles is rejected with `E2027` (`async fn`, `task fn`, `async {}`, `task {}`, `async loop`, `task loop`, `await`, `yield`, and calls or type positions that produce awaitable handles),
 - imported stdlib async/task declarations alone do not trigger `E2027`; the error is raised only once user code uses those awaitable surfaces under `--noheap`,
 - capturing closures are rejected with `E2027`,
 - region-backed `new` inside `with` is still permitted,
 - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`),
 - by default, builds an executable (`--kind executable`),
 - when `--kind object`, `--kind static`, or `--kind shared` is provided:
 - on `linux/x86_64`, attempts to emit an ELF64 relocatable object, static library, or shared library (`.so`) for the same supported IR subset,
 - on Apple Silicon macOS hosts, `--target macos-aarch64`,
 `--target ios-aarch64`, `--target ios-simulator-aarch64`, and
 `--target ios-simulator-x86_64` attempt to emit Mach-O 64-bit
 relocatable objects, static library archives (`.a` via Apple
 `libtool -static`), and shared libraries (`.dylib` via the Apple linker)
 for the same supported IR subset,
 - and otherwise exits non-zero with `E4001` (unsupported construct) or `E4002` (backend failure) diagnostics that explain the exact limitation,
 - when lowering cannot isolate a narrower statement / expression span, `E4001` falls back to the offending function declaration and names that function directly,
 - attempts to emit an executable using:
 - for `--target linux-x86_64` (the default; also accepts common `x86_64-*-linux-gnu` triples), an IR→ELF backend for `linux-x86_64` outputs (host-agnostic) for a growing scalar subset, and a constant‑expression backend (with a tiny ELF64 stub) for purely constant `main` bodies,
 - for `--target linux-x86_64-musl` (also accepts common `x86_64-*-linux-musl` triples), the same x86_64 IR→ELF backend with musl defaults (`PT_INTERP` `/lib/ld-musl-x86_64.so.1`, default hosted libc dependency `libc.so`, and libc-aware package artifact selection),
 - for `--target linux-aarch64`, `--target linux-aarch64-musl`, and `--target android-aarch64`, a constant‑expression backend (with a tiny ELF64 stub) for purely constant `main` bodies (non-constant programs are rejected with `E4001`),
 - for Apple targets, a constant‑expression backend that emits a minimal Mach-O 64-bit `exit(code)` executable:
 - `macos-x86_64`
 - `macos-aarch64`
 - `ios-aarch64` (iPhoneOS / device)
 - `ios-simulator-aarch64`
 - `ios-simulator-x86_64`
 - when the build host is macOS and the output target is `macos-x86_64`
 or `macos-aarch64`, `silk build` also performs an ad hoc
 `codesign -s -` pass on the emitted executable so the result is
 directly runnable on macOS hosts, including Apple Silicon
 - `macos-aarch64` const-main executables are emitted by the Silk-owned
 Mach-O backend; the host signing step remains in place so the produced
 binary is runnable immediately on macOS hosts
 - on Apple Silicon macOS hosts, the temporary host-backed Mach-O
 non-const executable bring-up path now uses host `clang -c` / `ld`
 for:
 - `macos-aarch64`,
 - `ios-aarch64`,
 - `ios-simulator-aarch64`,
 - and `ios-simulator-x86_64`,
 - for `macos-aarch64`, that path also links bundled runtime-backed
 executables by expanding `libsilk_rt*.a` into object members for the
 host linker,
 - for `macos-aarch64`, `ios-aarch64`,
 `ios-simulator-aarch64`, and `ios-simulator-x86_64`,
 `--kind object|static|shared` can emit Mach-O library artifacts for
 the supported IR subset,
 - for `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64`, the supported subset is
 intentionally narrower than `macos-aarch64`, but now includes:
 - pure-Silk scalar executables,
 - reachable float-to-int lowering via target-correct helper objects
 compiled from `src/silk_rt_f128.c`,
 - and portable bundled runtime helpers compiled on demand for the
 requested iOS SDK target, including the public number / regex /
 unicode / filesystem / dns / process / signal / term / pty /
 readline / task-pool / async helper families,
 - mixed `.slk` + native `.c` / `.h` / `.m` / `.o` / `.a`
 executable/static/shared link-input support,
 - and native-input-only executables whose `main` is provided by
 linked objects or archives,
 - when a reachable iOS executable module graph includes
 `std::window`, `silk build` also materializes an adjacent
 `<output>.app` bundle containing the executable, `Info.plist`, and
 `PkgInfo`; importing/reaching `std::window` is the opt-in signal
 and no additional CLI flag is required,
 - and the same host-supported subset is reflected in target metadata /
 diagnostics instead of being reported as uniformly const-main-only
 - outside that Apple Silicon host-only subset, non-constant Apple-target
 programs are still rejected with `E4001`
 - on Apple Silicon macOS hosts, `macos-aarch64` and the three iOS
 device/simulator targets now have current-host artifact-kind parity
 with `linux-x86_64` for executable, object, static library, and shared
 library outputs; this is still host-backed and not yet the portable
 baseline for every compiler host.
 - for Windows targets, a constant‑expression backend that emits a minimal PE32+ `ExitProcess(code)` executable (non-constant programs are rejected with `E4001`):
 - `windows-x86_64`
 - `windows-aarch64`
 - for `--target wasm32-unknown-unknown`:
 - an IR→WASM backend for the supported subset (multi-module builds, control flow, string/data segments, and `ext` imports),
 - exports `memory` plus `main` when present (embedder entry), or emits an **export-only** module (no `main`) that exports supported `export fn` declarations from the root package,
 - note: Silk `int` currently lowers to wasm `i64`, so wasm exports using `int` surface as `i64`,
 - for `--target wasm32-wasi`:
 - an IR→WASM backend that emits `memory` plus `_start () -> void`, imports `wasi_snapshot_preview1.proc_exit`, and calls Silk `fn main () -> int` or `fn main () -> void` (the `main(argc, argv)` entrypoint form is not supported yet for WASI),
 - programs that need argv on `wasm32-wasi` should read it inside `main()`
 via `std::args::{argc,argv,current}` and then build the usual
 `std::args::Args` view,
 - also supports export-only modules for embedding (export-only modules do not include `_start`),
 - for both wasm targets, a smaller constant-only wasm backend remains as a fallback for programs that fit the constant subset,
 - `amdgcn-amd-amdhsa-gfx942`, `amdgcn-amd-amdhsa-gfx1100`, and
 `amdgcn-amd-amdhsa-gfx1151` are recognized for target metadata and the
 standalone AMDHSA
 code-object/AQL encoder (`src/backend_amdgpu.zig`); `silk build --kind
 object --target amdgcn-*` emits a `.hsaco` for exactly one exported
 root-package void source kernel with up to 32 immutable `u64` parameters
 whose body is empty or contains only supported compiler-backed GPU call
 statements. Dependency-package exports do not count as
 additional kernels. The copy-pasteable intrinsic declarations and current
 authoring diagnostics are documented in
 [backend amdgpu](?p=compiler/backend-amdgpu). The AMDHSA code-object metadata
 spellings with an empty environment field
 (`amdgcn-amd-amdhsa--gfx942` / `amdgcn-amd-amdhsa--gfx1100` /
 `amdgcn-amd-amdhsa--gfx1151`) are accepted as aliases,
 - other targets are not implemented yet (see [backend wasm](?p=compiler/backend-wasm)),
 - the *constant* subset (available on `linux-x86_64`, `linux-x86_64-musl`, `linux-aarch64`, `linux-aarch64-musl`, `android-aarch64`, `macos-x86_64`, `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, `ios-simulator-x86_64`, `windows-x86_64`, `windows-aarch64`, and the initial `wasm32` targets) consists of:
 - a single `fn main() -> int` whose body is:
 - zero or more `let` statements with constant integer initializers, followed by exactly one `return` of a constant integer expression, or
 - the same, with a final `if` whose condition is a compile‑time boolean literal (`true` / `false`) and whose branches each satisfy the “constant lets + return constant expression” rule, and
 - optionally, one or more trivial constant `while` loops before the final `return`, with constant boolean conditions and bodies of constant `let` bindings followed by `break;`, as described in [ir overview](?p=compiler/ir-overview),
 - or a `fn main() -> void` body in the same supported statement subset, with `return;` or implicit fallthrough producing exit status `0`,
 - on `linux/x86_64`, a richer IR‑based backend is used first; for this backend, the currently supported (documented and tested) subset includes:
 - `fn main() -> int`, `fn main() -> void`, and helper functions that:
 - take scalar parameters (defaulting to `int` when unannotated) drawn from `int`, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`, and the fixed-width integer types (`u8`/`i8` … `u64`/`i64`); helper functions return a scalar from the same set, or `void` (omitted result type or explicit `-> void`) when used only as standalone statements (`return;` and implicit fallthrough returns are supported for `void` helpers),
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
 - use `if` as an expression (`let x: T = if cond { a } else { b };`) when both branches produce the same supported value type `T` (scalars, `string`, unit-only enums, and supported optionals),
 - use `break;` and `continue;` inside `while` loops,
 - allow call expressions as standalone statements (discarding the returned value),
 - allow assignment and compound assignment to `let mut` locals by name (`x = expr;`, `x += y;`); the left-hand side must be an identifier; `=` is supported for all currently supported value types (including `string`, the supported `struct` subset, and optionals of those); compound assignments are supported only for numeric scalar locals,
 - and, for helpers, use direct calls between functions of this shape; scalar parameters follow the System V AMD64 calling convention as documented in [ir overview](?p=compiler/ir-overview):
 - integer-like scalars (`bool` and integers) use up to 6 general-purpose registers (`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`),
 - `f32`/`f64` use up to 8 XMM registers (`xmm0`..`xmm7`),
 - remaining scalar arguments are spilled to the stack in order,
 - the caller maintains 16-byte stack alignment before `call` (padding by one 8-byte slot when needed), and
 - results return in registers for 0–2 scalar results (integer-like in `rax`/`rdx`, floats in `xmm0`/`xmm1`), and 3+ scalar results return indirectly via a hidden sret pointer passed in `rdi` (caller-allocated return buffer),
 - on `linux/x86_64`, the same backend also supports a limited `string` subset:
 - within function bodies, the compiler supports a small `string` expression subset: string literals, `let` bindings of `string`, `return` of a `string` value, `if` expressions that produce `string` values, direct calls to `string`-returning helpers, and `==`/`!=`/`<`/`<=`/`>`/`>=` comparisons over `string` values (producing `bool`); other string operations (concatenation, indexing, etc.) are not implemented yet,
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
 - optionals of unit-only enum payload types (`E?` where `E` is an `enum` with no payload fields),
 - nested optionals (`T??`) for these payload types,
 - constructing optionals via `None` and `Some(<expr>)` for those payload types,
 - `==` / `!=` comparisons over those optionals (tag + payload equality; nested optionals compare recursively); `None` / `Some(...)` can be used directly in equality expressions when the other operand provides the optional type context (for example `opt == None` and `opt == Some(x)`),
 - accessing fields of optional structs via optional field access (`opt?.field`), producing an optional result of the field type (`FieldType?`),
 - calling methods on optional structs via optional chaining (`opt?.method(args...)`), producing an optional result of the method result type (`ResultType?`) and short-circuiting when the receiver is `None`,
 - matching on optionals via `match <scrutinee> { None => <expr>, Some(<name|_>) => <expr>, }` (exactly one `None` arm and one `Some(...)` arm; arm bodies are expressions),
 - unwrapping optionals via `??` with short-circuit evaluation of the fallback expression (including unwrapping `T??` to `T?`),
 - using the same `??` operator on:
 - recoverable `Result`-style enums,
 - and ordinary named enums with exactly two declared variants, where
 declaration order defines the coalescing shape:
 - if the first variant is unit, `value ?? fallback` yields that enum
 value,
 - if the first variant carries exactly one payload, it yields that
 payload,
 - and if the value is the second variant, the fallback expression is
 evaluated,
 - and permitting the narrow terminal control-flow forms on the
 right-hand side of `??`:
 - `value ?? return expr`,
 - `value ?? break`,
 - `value ?? continue`,
 with the same validity rules as the statement forms,
 - and passing/returning optionals between helpers at ABI boundaries as `(bool tag, payload0, payload1, ...)`, where the payload slots follow the lowering of the underlying non-optional type (for example `string?` is `(bool, u64 ptr, i64 len)`).
 - for non-executable outputs, exported functions may accept and return these optionals; see [abi libsilk](?p=compiler/abi-libsilk) for the exact C ABI mapping.
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
 - on `linux/x86_64` with the musl dynamic loader (`ld-musl`), the same hosted external-symbol path automatically adds musl's unified `libc.so` dependency; `-lm`, `-lpthread`, `-ldl`, `-lrt`, `-lutil`, `-lresolv`, `-lcrypt`, and `-lxnet` also map to `libc.so` when no matching `-L` library is found,
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::crypto` and/or `std::tls` are imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol families, `silk` auto-links the target-matched built-in static archives (`libsodium.a` and the mbedTLS archives) from `vendor/lib/<target-layout>/` (or an installed prefix) so executables do not depend on system `libsodium` / `mbedTLS` shared libraries at runtime,
 - on `linux/x86_64` glibc or musl, when `std::sqlite` is imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `sqlite3_*` symbols, `silk` auto-links the target-matched built-in `libsqlite3.a` archive so executables do not depend on a system SQLite shared library at runtime,
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ssh` or `std::ssh2` is imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `libssh2_*` symbols, `silk` auto-links the target-matched built-in `libssh2.a` archive (and its built-in crypto dependencies) so executables do not depend on a system `libssh2` shared library at runtime,
 - on `linux/x86_64` glibc, when `std::runtime::z3` is imported or linked native inputs reference `Z3_*` symbols, `silk` auto-links the built-in glibc `libz3.a`; on `linux/x86_64` musl the same use is accepted only when the build explicitly supplies a musl-built `libz3.a` input or a `libz3` dynamic dependency such as `--needed libz3.so.0`,
 - on `linux/x86_64`, when `std::dylib` or `std::gpu` is imported, or when linked native `.o` / `.a` inputs reference bundled `silk_rt_dylib_*` / `silk_rt_gpu_*` runtime symbols, `silk` automatically adds the libc component that provides `dlopen` (`libdl.so.2` on glibc, `libc.so` on musl),
 - on Linux x86_64 executable builds, `--gpu-target <gpu-target>` compiles root-package `attr(device=gpu)` functions into AMDHSA code objects or NVIDIA PTX and embeds them in a provider-tagged bundle. `std::gpu` dynamically loads HIP or the CUDA Driver API, so the application has no link-time GPU-provider dependency,
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ggml` is imported (or when linked `.o`/`.a` inputs reference `silk_ggml_init`) and the built-in ggml static archives are present, `silk` links them automatically; on Linux it also adds `libstdc++.so.6`, `libgcc_s.so.1`, and the target libc math/dynamic-loader providers, while on Apple Silicon macOS hosts it adds `-lc++` to the native link (see [ggml](?p=std/ggml) and [builtin deps](?p=compiler/builtin-deps)),
 - on `linux/x86_64` glibc or musl, when `std::image::png`/`std::image::jpeg` are imported (or when linked `.o`/`.a` inputs reference the shim symbols) and the built-in archives are present, `silk` links them automatically and adds `libz.so.1` and/or the target libc math provider as `DT_NEEDED` dependencies (see [image](?p=std/image) and [builtin deps](?p=compiler/builtin-deps)),
 - on `linux/x86_64` glibc or musl, when `std::xml` is imported (or when linked `.o`/`.a` inputs reference `silk_xml_node_name_ptr`) and the built-in libxml2 archives are present, `silk` links them automatically and adds the target libc math provider as a `DT_NEEDED` dependency (see [xml](?p=std/xml) and [builtin deps](?p=compiler/builtin-deps)),
 - on `linux/x86_64`, when `std::window` is imported and reaches the bundled runtime, `silk` links the bundled runtime archive and adds the dynamic-loader API provider used by the runtime-loaded GTK provider (`libdl.so.2` on glibc targets, `libc.so` on musl targets); GTK itself is loaded at runtime, so GTK libraries are not recorded as `DT_NEEDED` dependencies,
 - when the active security provider is `auto` on Apple targets,
 platform-backed `std::crypto` core/random helpers use
 `Security.framework`, and fallback-only TLS/SSH/advanced-crypto APIs
 auto-link the built-in archives,
 - when the active security provider is `builtin`, the crypto/TLS/SSH
 fallback paths above use the same target-matched built-in archive
 directories (`vendor/lib/<target-layout>/` or an installed prefix),
 - when bundled runtime support symbols are imported (for example via
 `import std::regex;`, `import std::unicode;`, or
 `import std::number;`), `silk` statically links the bundled runtime
 support archive into the output (`libsilk_rt.a`, or
 `libsilk_rt_noheap.a` when building with `--noheap`); the produced
 executable/shared library does not depend on `libsilk_rt*.so` at
 runtime,
 - additional non-libc dependencies still must be declared via `--needed <soname>` (or otherwise be available in the process global scope at load time, for example via `LD_PRELOAD`),
 - bundled runtime archive discovery:
 - the compiler locates `libsilk_rt.a` / `libsilk_rt_noheap.a` via (in order):
 - `SILK_RT_LIBDIR` (environment variable; a directory containing the runtime archives),
 - `build/lib` in the current working directory (repo default),
 - `zig-out/lib` in the current working directory (legacy zig build layout),
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

 - value-producing `if` expressions whose branch bodies are single expressions (Supported forms restriction), including optionals:
 - `tests/silk/pass_if_expr_basic.slk` (`let v: int = if cond { 123 } else { 456 };`)
 - `tests/silk/pass_if_expr_optional_call.slk` (`let m: i64? = if flag { f() } else { g() };`)

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

## High-Level Command Model

The initial CLI implementation supports a small, well-defined subset of the eventual UX.

Top-level commands:

- `silk help [<command>]`:
 - Prints global usage when `<command>` is omitted.
 - Prints command-specific usage when `<command>` is provided.
 - Subcommands also accept `--help` / `-h` to print command-specific usage.
 - For `check` / `test` / `build` / `doc`, `--` ends option parsing (all remaining args are treated as file paths, even if they begin with `-`).
- `silk devices list|doctor|setup|install|uninstall|boot|shutdown|launch|run|logs`
 — manage platform device and app lifecycle plumbing:
 - supported backend kinds are `desktop`, `ios-simulator`, `ios-device`, and
 `android`,
 - backend availability is detected from the current host and installed SDK
 tools: `xcrun simctl` for iOS simulators, `xcrun devicectl` for iPhone/iPad
 devices, `adb`/`emulator` for Android devices and emulators, and host tools
 for desktop launch/log actions,
 - `list` and `doctor` are discovery commands and support `--json`; JSON
 output includes host metadata, normalized device records, backend records,
 tool paths when found, setup hints when tools are missing, and raw platform
 listing output for `list`,
 - app lifecycle actions accept `--device`, `--booted`, `--name`, `--app`,
 `--bundle-id`, `--package`, and `--activity` as applicable,
 - `launch` / `run --app <path>` launches desktop executables directly,
 launches macOS `.app` bundles directly when `--kind desktop` is selected,
 and derives Apple bundle identifiers from iOS `.app` bundle `Info.plist`
 files; `.app` paths infer `ios-simulator` by default, while `.ipa`
 archives and Android `.apk` launches require explicit `--bundle-id` or
 `--package` values,
 - Android install delegates to `adb install` for APK inputs; Android App
 Bundles (`.aab`) are rejected until a bundletool-backed install path exists,
 - `--` passes remaining arguments to the platform tool after Silk has chosen
 the backend and assembled the canonical command shape.
- `silk codesign doctor|list-tools|setup-keystore|sign|verify` — manage
 platform signing and verification:
 - discovery commands report availability of `codesign`, `xcrun`,
 `apksigner`, `jarsigner`, `keytool`, `dpkg-sig`, `rpmsign`, `rpmkeys`,
 `appimagetool`, and `gpg`,
 - `sign` and `verify` accept `--input <path>` and
 `--platform <auto|macos|ios|android|linux>`; `auto` infers Android from
 `.apk`/`.aab`, Linux from `.deb`/`.rpm`/`.AppImage`, iOS from `.ipa`, and
 Apple signing for `.app`/`.dylib`/`.framework` on macOS hosts,
 - Apple signing uses `codesign --force --sign <identity>` with ad-hoc `-`
 as the default identity,
 - Android `.apk` signing uses `apksigner` by default; Android `.aab` signing
 uses `jarsigner` by default. `--tool apksigner` and `--tool jarsigner`
 select either Android backend explicitly. `setup-keystore` uses `keytool`
 to create Java keystores,
 - Linux signing selects the package/app tool appropriate for the input, and
 generic detached signatures use `gpg`,
 - `--tool` overrides Android or Linux tool selection and `--` passes
 remaining flags to the chosen signing tool.
- `silk check [--json] [--verify|--no-verify] [--nostd] [--std-root <path>] [--z3-lib <path>] [--debug] [--feature <spec> ...] [--arch <arch>] [--target <triple>] [--security-provider <auto|platform|builtin>] [--package <dir|manifest>] <file> [<file> ...]`:
 - Reads one or more input files, runs lexing, parsing, package/import resolution, and type checking.
 - Formal Silk verification is opt-in:
 - `--verify` enables verification for modules that contain Formal Silk directives.
 - `--no-verify` disables verification (default).
 - `--z3-lib` and `--debug` are meaningful only when `--verify` is enabled.
 - `--arch <arch>` and `--target <triple>` are mutually exclusive; omit both to use the default target (`linux-x86_64`).
 - The selected target controls `OS_PLATFORM` / `OS_ARCH` and `attr(...)` conditional compilation during checking.
 - `--feature <spec>` (repeatable) enables build features for `attr(feature="...")` queries and declaration gating.
 - Feature specs are of the form `NAME` or `NAME=VALUE` (see [attributes](?p=language/attributes)).
 - Feature names start with a letter or `_` and may contain letters,
 digits, `_`, and `-`.
 - For package builds (`--package`), you may target a specific package with
 `PKG/NAME` or `PKG/NAME=VALUE` (for example `ui/tui`).
 - When `--package` is provided, input files must be omitted and the module set is loaded from the package manifest (see [package manifests](?p=compiler/package-manifests)).
 - when the root manifest enables a build module via `[build].build_module = true`, `silk check --package` runs that build module and uses the emitted manifest/module set instead of the raw `silk.toml`,
 - for compatibility, package checks currently invoke the build module with the action string `build`,
 - When `<file> ...` inputs are omitted and `--package` / `--pkg` is also omitted, but `./silk.toml` exists, `silk check` behaves as if `--package .` was provided.
 - Prints a success message on stdout for valid programs.
 - Prints a human-readable error on stderr and exits non-zero for invalid programs.
- `silk test [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [--debug] [--feature <spec> ...] [--security-provider <auto|platform|builtin>] [-O <0-3>] [--noheap] [--jobs <n>] [--filter <pattern>] [--package <dir|manifest>] <file> [<file> ...]`:
 - Discovers language-level `test` declarations (see [testing](?p=language/testing)) in the loaded module set.
 - Compiles and runs each test, emitting TAP version 13 output.
 - Each test runs in its own process, so a failing `assert` (panic/abort) does not stop the whole suite.
 - Top-level test bodies that contain `await` are run through async test wrappers and awaited by the generated runner.
 - Test executables use the native host target when Silk has a host-backed executable backend for it, and otherwise fall back to `linux-x86_64` (or `linux-x86_64-musl` on musl x86_64 Linux hosts). Formal Silk target metadata in `silk test` reflects that selected execution target.
 - Optimization:
 - `-O <0-3>` selects the optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`).
 - `-O1`+ prunes unused extern symbols before code generation (typically reducing output size and stdlib linkage).
 - IR-backed native executable builds lower and emit only functions reachable
 from the executable entrypoint at every optimization level. `-O1`+ also
 prunes unused extern symbols before code generation.
 - When `--filter <pattern>` is provided, only tests whose test path contains `<pattern>` are executed. The test path is the nested test name stack joined with `/` (for example `suite/case`).
 - When nested tests are present, the runner prints subtest progress lines to stderr as they complete (in `--jobs 1` mode):
 - `ok - suite/case`
 - `not ok - suite/case`
 - When `--jobs` is greater than `1`, child stderr is captured (not streamed) to avoid interleaving output across tests.
 - Environment:
 - `SILK_TEST_TIMEOUT_MS` overrides the per-top-level-test process timeout in milliseconds (default: `30000`).
 - `SILK_TEST_JOBS` overrides the number of test processes run in parallel (default: `1`; `0` means auto; capped at `8`). Overridden by `--jobs`.
 - `SILK_TEST_MAX_OUTPUT_BYTES` caps captured stdout/stderr per test process for diagnostics (default: `1048576`; output beyond this limit is truncated).
 - When `<file> ...` inputs are omitted and `--package` is also omitted, but `./silk.toml` exists, `silk test` behaves as if `--package .` was provided.
 - When `--package` is provided and the root manifest enables a build module via `[build].build_module = true`, `silk test --package` runs that build module and uses the emitted manifest for the test harness/module set.
 - for compatibility, package tests currently invoke the build module with the action string `build`.
 - Manifest-native test-harness metadata comes from the selected code target:
 - `.c`, `.h`, and supported `.m` entries in `[[target]].inputs` are
 compiled to temporary objects and linked with the generated test harness,
 using that target’s `cflags`,
 - matching package and dependency `[[native]]` entries are also compiled and
 linked when their target gate matches the test execution target,
 - `.o`, `.a`, shared-library inputs, `needed`, `runpath`, and supported
 `ldflags` are linked as they are for package builds.
- `silk build [--nostd] [--std-root <path>] [--std-lib <path>] [--z3-lib <path>] [-Wz <spec> ...] [--debug] [--feature <spec> ...] [-f <spec> ...] [--security-provider <auto|platform|builtin>] [-O <0-3>] [--noheap] [--strip-unused] [--package <dir|manifest>] [--build-module] [--package-target <name> ...] <file> [<file> ...] -o <path> [--kind executable|object|static|shared] [--emit bin|asm] [--arch <arch>] [--target <triple>] [--gpu-target <gpu-triple>] [--list-gpu-targets] [--c-header <path>] [--cflag <arg> ...] [-I <path> ...] [-isystem <path> ...] [-L <path> ...] [-l <name> ...] [-Wl <arg> ...] [--ldflag <arg> ...] [--needed <soname> ...] [--runpath <path> ...] [--soname <soname>] [--elf-interp <path>]` (or `--out <path>`):
 - Reads one or more input files, runs the same front-end pipeline as `check`.
 - `--feature <spec>` and `-f <spec>` are repeatable build-feature specs for `attr(feature="...")` queries; `-F` is reserved for Apple framework search paths in `silk build`. Feature names start with a letter or `_` and may contain letters, digits, `_`, and `-`.
 - Optimization:
 - `-O <0-3>` selects the optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`).
 - `-O1`+ prunes unused extern symbols before code generation.
 - For `--kind executable` builds, only functions reachable from the
 executable entrypoint are lowered and emitted at every optimization
 level. `-O1`+ additionally prunes unused extern symbols.
 - `--strip-unused` forces reachability-based pruning even at `-O0`:
 - for `--kind executable`, it prunes unused extern symbols at `-O0`;
 unreachable functions are already excluded at every optimization level,
 - for `--kind static` and `--kind shared`, it prunes unreachable non-exported helper functions from the root exported surface before emission,
 - for `--kind object`, unreachable non-exported helper functions are already pruned; the flag is accepted for consistency,
 - when executable builds auto-load std modules, `--strip-unused` is incompatible with `--std-lib` / `--std <path>.a` because whole-archive std linking defeats fine-grained std reachability pruning.
 - When `--package` is provided:
 - explicit `.slk` inputs must be omitted (the module set is loaded from the package manifest),
 - native build inputs (`.c`, `.h`, `.m`, `.o`, `.a`, `.so`) may still be provided:
 - per-target via `[[target]].inputs` in `silk.toml`,
 - package-wide via target-gated `[[native]]` entries in the root package
 and imported dependencies,
 - and, when building a single target, on the command line (merged with the manifest inputs),
 - `.h` follows the same safer rule as direct CLI builds:
 - sibling `.c` wins when present,
 - sibling `.m` is used when no sibling `.c` exists,
 - otherwise the header itself is compiled as a C translation unit,
 - `--build-module` runs `<package_root>/build.slk` and uses the manifest it
 emits as the package manifest (see [build scripts](?p=compiler/build-scripts)),
 - `--build-module-path <path>` overrides the default build module path
 (and implies `--build-module`),
 - legacy aliases: `--build-script` and `--build-script-path`,
 - build modules are opt-in by default; to run one without `--build-module`,
 set `[build].build_module = true` in `silk.toml`
 (see [package manifests](?p=compiler/package-manifests)),
 - `--package-target <name>` selects one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias),
 - when omitted, the compiler builds every manifest `[[target]]` entry by default,
 - source-doc `kind = "man"` targets query only the root package’s own
 source modules,
 - executable iOS targets may set `ios_app_bundle = true` in the manifest
 so `silk build --package` also creates `<output>.app`, copies the
 executable and either the target `ios_info_plist` or a generated
 `Info.plist`, writes `PkgInfo`, and ad-hoc signs the bundle by default
 on macOS,
 - when building multiple targets (the default when `--package-target` is omitted, or when it is repeated), per-output flags are rejected:
 `-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--gpu-target`, `--c-header`, `--cflag`, `-I`, `-isystem`, `--ldflag`, `-l`, `-L`, `--framework`, `-F`, `-Wl`, `--needed`, `--runpath`, `--soname`, `--elf-interp`,
 - when building a single target, `-o/--out` is optional (defaults to that target’s `output` or a computed default under `build/`).
 - Target selection:
 - `--arch <arch>` and `--target <triple>` are mutually exclusive; omit both to use the default target.
 - `--gpu-target <gpu-target>` independently selects the device processor
 for `attr(device=gpu)` functions while `--target` continues to select the
 host. The GPU-v1 path is Linux x86_64 executable-only, accepts AMD
 `gfx942`, `gfx1100`, and `gfx1151` plus NVIDIA `sm80`, and embeds a
 provider-tagged version-3 bundle for `std::gpu`. It is rejected for other output
 kinds/host targets and for sources without a launchable root-package GPU
 entry; executable sources with GPU functions require it.
 - `--list-gpu-targets` prints canonical GPU target spellings, providers,
 and embedded artifact forms, then exits.
 - `--list-targets` prints the recognized `--target` triples, current-host
 output kinds, current-host const-main-only notes, and Apple Silicon macOS
 host-backed notes for targets with that extra support, then exits. AMDGPU
 triples are included for metadata and source-intrinsic `.hsaco` object
 output, not as general Silk IR-to-GPU lowering targets; see
 [backend amdgpu](?p=compiler/backend-amdgpu) for the source shape.
 - `--list-archs` prints the recognized `--arch` values and exits.
 - Entrypoint rules:
 - for `--kind executable` (the default), there must be exactly one `main`, using either `fn main() -> int`, `fn main() -> void`, `async fn main() -> int`, `async fn main() -> void`, `fn main(argc: int, argv: u64) -> int`, or `fn main(argc: int, argv: u64) -> void`,
 - for `--kind object`, `--kind static`, and `--kind shared`, `main` is not required; at least one supported `export fn`, supported `export let` constant, or a valid executable `main` must be present so the output contains one or more globally-visible symbols.
 - Multi-file builds are supported for `--kind executable` and for `--kind object`/`--kind static`/`--kind shared`:
 - for non-executable outputs, when multiple packages are present in a module set, only exports from the *root package* (the package of the first input module) are emitted as globally-visible symbols; other packages are compiled as dependencies and their `export` declarations are treated as internal for that output.
 - Output selection:
 - default: build an executable (`--kind executable`),
 - `--kind object`: build a relocatable object (`.o`):
 - ELF64 on `linux/x86_64`,
 - Mach-O 64-bit relocatable for `--target macos-aarch64` and the iOS
 device/simulator targets on Apple Silicon macOS hosts,
 - AMDHSA `.hsaco` for `--target amdgcn-amd-amdhsa-gfx942`,
 `--target amdgcn-amd-amdhsa-gfx1100`, and
 `--target amdgcn-amd-amdhsa-gfx1151` when the source contains exactly
 one exported source kernel in the AMDGPU intrinsic-call subset,
 - `--kind static`: build a static library (`.a`) on `linux/x86_64` and on
 host-backed Apple targets when running on Apple Silicon macOS,
 - `--kind shared`: build a shared library (`.so` on Linux, `.dylib` on
 macOS/iOS) on `linux/x86_64` and on host-backed Apple targets when
 running on Apple Silicon macOS.
 - Emission:
 - `--emit bin` (default) emits the selected binary artifact at `<path>`,
 - `--emit asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux/x86_64` and writes it to `<path>`,
 - `-S` is accepted as an alias of `--emit asm` and defaults to `--kind object` when `--kind` is not set.
 - Dynamic dependencies:
 - `--cflag <arg>` adds an additional native compiler argument used when compiling `.c`, `.h`, and `.m` inputs; it may be repeated,
 - `-I <path>` / `-I<path>` and `-isystem <path>` / `-isystem<path>` add native include and system include search paths; they may be repeated,
 - `--ldflag <arg>` adds a backend linker argument; prefer the dedicated `-l` and `-Wl` flags for command-line builds. Recognized arguments follow the same backend rules as those dedicated flags, including the internal ELF translations for `-Wl,-rpath`, `-Wl,-soname`, and `-Wl,--dynamic-linker` (see [package manifests](?p=compiler/package-manifests)),
 - `-L <path>` / `-L<path>` adds a library search path; host-backed Apple Mach-O executable/shared links pass it to `ld`, while `linux/x86_64` uses it to resolve `-l` / `-l:` names to dynamic dependencies or static archives,
 - `-l <name>` / `-lname` links with a library name; host-backed Apple Mach-O executable/shared links pass it to `ld`, while `linux/x86_64` searches `-L` paths first and otherwise translates it to a `DT_NEEDED` soname,
 - `-Wl <arg>` / `-Wl,<arg>` passes backend linker arguments; platform-linker backends receive comma-split payloads directly, while `linux/x86_64` supports translated `-rpath`, `-soname`, and `--dynamic-linker` payloads,
 - Apple SDK linking flags are shown in `silk build --help` only on Apple Silicon macOS compiler hosts and are supported for host-backed `macos-aarch64` plus iOS executable/shared outputs:
 - `--framework <name>` links an Apple framework by name,
 - `-F <path>` / `-F<path>` adds an Apple framework search path; `silk build` no longer uses `-F` for build features,
 - package iOS executable targets can request app bundle materialization
 with `ios_app_bundle = true`; the generated or copied bundle is named
 `<output>.app` and is ad-hoc signed by default for simulator use,
 - `--needed <soname>` adds a `DT_NEEDED` entry for executable and shared outputs; it may be repeated,
 - `--runpath <path>` (or `--rpath <path>`) adds a runpath element for executable and shared outputs; it may be repeated (joined with ':' into `DT_RUNPATH`),
 - `--soname <soname>` sets the shared library soname recorded as `DT_SONAME` for shared outputs (an empty string clears it),
 - `--elf-interp <path>` overrides the `PT_INTERP` dynamic loader path used for `linux/x86_64` executable outputs (this also influences glibc/musl linkage defaults for `-l...` mapping).
 - This option is rejected for non-`linux/x86_64` targets.
 - For `linux-x86_64-musl`, the default is `/lib/ld-musl-x86_64.so.1`; explicit glibc loader paths are rejected for that target.
 - For generic `linux-x86_64`, when omitted, `silk` probes common loader paths when running on `linux/x86_64`, and otherwise falls back to `/lib64/ld-linux-x86-64.so.2` for cross-compilation.
 - Override sources (highest priority first): `--elf-interp`, manifest `[[target]].elf_interp`, `SILK_ELF_INTERP`.
 - for object and static library outputs, `--ldflag`, `--needed`, `--runpath`, `--soname`, and `--elf-interp` are ignored.
 - on `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk` automatically adds:
 - `libc.so.6` as a `DT_NEEDED` dependency when external symbols are present (so hosted `std::` modules do not require `--needed libc.so.6`), and
 - `libpthread.so.0` when `pthread_*` symbols are imported.
 - on `linux/x86_64` with the musl dynamic loader (`ld-musl`), `silk` automatically adds musl's unified `libc.so` dependency when external symbols are present; common libc component link names such as `-lm`, `-lpthread`, and `-ldl` also map to `libc.so`.
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::crypto` and/or `std::tls` are imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol families, `silk` auto-links the target-matched built-in static archives (`libsodium.a` and the mbedTLS archives) from `vendor/lib/<target-layout>/` (or an installed prefix) so executables do not depend on system `libsodium` / `mbedTLS` shared libraries at runtime.
 - on `linux/x86_64` glibc or musl, when `std::sqlite` is imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `sqlite3_*` symbols, `silk` auto-links the target-matched built-in `libsqlite3.a` archive so executables do not depend on a system SQLite shared library at runtime.
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ssh` or `std::ssh2` is imported, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `libssh2_*` symbols, `silk` auto-links the target-matched built-in `libssh2.a` archive (and its built-in crypto dependencies) so executables do not depend on a system `libssh2` shared library at runtime.
 - on `linux/x86_64` glibc, when `std::runtime::z3` is imported or linked native inputs reference `Z3_*` symbols, `silk` auto-links the built-in glibc `libz3.a`; on `linux/x86_64` musl the same use is accepted only when the build explicitly supplies a musl-built `libz3.a` input or a `libz3` dynamic dependency such as `--needed libz3.so.0`.
 - on `linux/x86_64`, when `std::dylib` or `std::gpu` is imported, or when linked native `.o` / `.a` inputs reference bundled `silk_rt_dylib_*` / `silk_rt_gpu_*` runtime symbols, `silk` automatically adds the libc component that provides `dlopen` (`libdl.so.2` on glibc, `libc.so` on musl).
 - on Linux x86_64 executable builds, `--gpu-target <gpu-target>` compiles root-package `attr(device=gpu)` functions into AMDHSA code objects or NVIDIA PTX and embeds them in a provider-tagged bundle. `std::gpu` dynamically loads HIP or the CUDA Driver API, so the application has no link-time GPU-provider dependency.
 - on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ggml` is imported, or when linked native `.o` / `.a` inputs reference `silk_ggml_init`, `silk` auto-links the built-in ggml archives; on Linux it also adds `libstdc++.so.6`, `libgcc_s.so.1`, and the target libc math/dynamic-loader providers, while on Apple Silicon macOS hosts it adds `-lc++` for the native link.
 - on `linux/x86_64` glibc or musl, when `std::image::png`/`std::image::jpeg` are imported, or when linked native `.o` / `.a` inputs reference the shim symbols, `silk` auto-links the target-matched built-in image archives and adds `libz.so.1` and/or the target libc math provider as needed.
 - on `linux/x86_64` glibc or musl, when `std::xml` is imported, or when linked native `.o` / `.a` inputs reference `silk_xml_node_name_ptr`, `silk` auto-links the target-matched built-in libxml2 archives and adds the target libc math provider as needed.
 - on `linux/x86_64`, when `std::window` reaches the bundled runtime, `silk` adds the dynamic-loader API provider used by the runtime-loaded GTK provider (`libdl.so.2` on glibc targets, `libc.so` on musl targets); GTK remains runtime-loaded rather than a required `DT_NEEDED` entry.
 - when the active security provider is `auto` on an Apple target,
 `std::crypto` core/random helpers link `Security.framework`, and
 `std::net` links `Network.framework`; `std::tls`, `std::ssh` /
 `std::ssh2`, native libsodium/mbedTLS symbol references, and advanced
 `std::crypto::*` modules fall back to built-in archives.
 - when the active security provider is explicit `platform` on an Apple
 target, fallback-only std and native security APIs are rejected until
 platform mappings are implemented.
 - when the active security provider is `builtin`, the crypto/TLS/SSH
 fallback paths above use the same target-matched built-in archive
 directories (`vendor/lib/<target-layout>/` or an installed prefix).
 - when bundled runtime support symbols are imported (for example via `import std::regex;`), `silk` statically links `libsilk_rt.a` (or `libsilk_rt_noheap.a` when building with `--noheap`) into the output; no runtime `DT_NEEDED` entry is emitted for `libsilk_rt*`.
 - `--needed` entries starting with `libsilk_rt` are rejected; the bundled runtime support layer is always linked from the static archives.
 - Debug builds:
 - `--debug` (or `-g`) enables runtime stack traces for failed `assert` statements on `linux/x86_64` by printing a stack trace to stderr before aborting, and preserves internal function symbols in `.dynsym` for better symbolization.
 - when Formal Silk verification fails, `--debug` also emits Z3 debugging output and writes an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`).
 - Heap control (Supported forms):
 - `--noheap` disables heap allocation for the Supported forms:
 - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
 - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
 - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
 - non-stdlib concurrency usage that declares or forms `Task(...)` / `Promise(...)` handles is rejected with `E2027` (`async fn`, `task fn`, `async {}`, `task {}`, `async loop`, `task loop`, `await`, `yield`, and calls or type positions that produce awaitable handles),
 - imported stdlib async/task declarations alone do not trigger `E2027`; the error is raised only once user code uses those awaitable surfaces under `--noheap`,
 - capturing closures are rejected with `E2027`,
 - region-backed `new` inside `with` is still permitted.
 - `--noheap` is currently incompatible with `--debug` (debug panic traces require `malloc`/`free`).
 - For the supported subset, emits the selected artifact (or an assembly listing when `--emit asm` is selected) at `<path>`.
 - C99 header emission (for downstream consumers of exported symbols):
 - `--c-header <path>` writes a generated C header at `<path>` that declares the root package’s exported symbols (`export fn` prototypes and `export let` extern declarations) for consumption from C/C++,
 - this option is only meaningful for non-executable outputs (`--kind object|static|shared`) and is rejected for `--kind executable`,
 - to keep the C ABI surface obvious and stable, `--c-header` requires the *root package* (the package of the first input module) to be the **global package** (i.e. omit `package ...;` in the exported library’s sources),
 - when a package build must compile native C/Objective-C code against
 named-package exports in the same package target, the package may keep a
 small bridge header and use `SILK_C_ABI_EXPORT_FN(pkg, name)` for
 `export attr(abi=c) fn` functions, `SILK_PACKAGE_EXPORT_FN(pkg, name)`
 for default package exports, or `SILK_PACKAGE_EXPORT_DATA(pkg, name)` for
 exported data from `silk/silk.h` to spell package-qualified symbols
 without hardcoding generated names,
 - unnamed C-facing root-package `export fn` signatures may not use ordinary borrowed references or slices; the checker rejects those with `E2119` before object/header emission,
 - the generated header encodes the current ABI rules described in [abi libsilk](?p=compiler/abi-libsilk), including:
 - `string` values use `SilkString { ptr, len }` (from `silk/silk.h`),
 - optionals and 3+ slot structs are lowered at call boundaries as multiple scalar parameters (so C prototypes for such parameters use flattened arguments rather than by-value C struct parameters).
 - For programs outside the supported subset that nonetheless type-check, exits non-zero with a clear `E4001` / `E4002` diagnostic (instead of a generic “code generation is not implemented yet” message).
- Formal Silk verification:
 - when Formal Silk syntax is present (for example `#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`, `#const`), `check` / `test` / `build` require proofs and fail the build when verification fails,
 - when `--debug` is set, failing proof obligations also emit Z3 debugging output and write an SMT-LIB2 reproduction script under `.silk/z3/` (or `$SILK_WORK_DIR/z3`),
 - when a successful `build` output exposes exported theories or exported/public contract-bearing functions/methods, the compiler also writes a success-path export bundle under `.silk/formal/<output-identity>/` (or `$SILK_WORK_DIR/formal/<output-identity>/`) as `manifest.json` plus `bundle.smt2`,
 - `--z3-lib <path>` overrides the Z3 dynamic library used by the verifier (it also honors `SILK_Z3_LIB`).
 - `silk build` accepts repeatable `-Wz <spec>` / `-Wz,<spec>` Z3 parameter specs:
 - `NAME=VALUE` and `config:NAME=VALUE` are applied to every verifier `Z3_config` with `Z3_set_param_value`,
 - `global:NAME=VALUE` is applied once before context creation with `Z3_global_param_set`,
 - `NAME` and `VALUE` must be non-empty, and Silk intentionally does not whitelist Z3 parameter names because valid parameters are Z3-version-specific.
 - verification runs on multiple worker threads when there are enough proof obligations; set `SILK_VERIFY_JOBS=1` to force single-threaded verification.
- `silk doc`:
 - Markdown mode: `silk doc [--all] <file> [<file> ...] [-o <output.md>]`
 - Generates Markdown documentation from Silkdoc comments (`/** ... */` and `/// ...`) attached to declarations.
 - By default, includes:
 - exported `fn`/`let`/`ext`/`type`/`theory` declarations and exported `impl` methods, and
 - all `struct`/`enum`/`error`/`interface` declarations in the input modules.
 - `--all` includes non-exported functions, bindings, and methods.
 - When `-o` / `--out` is provided, writes the Markdown output to that path; otherwise writes to stdout.
 - Manpage mode: `silk doc --man [--package <dir|manifest>] [--std-root <path>] <query> [-o <output.man>]`
 - Renders a roff `man(7)` page derived from source docs (`@cli`/`@misc`/API docs) and writes it to stdout (or to `-o` / `--out`).
- `silk cc <cc args...>`:
 - Runs a host C compiler to build C99 (or C++) programs that embed or link against `libsilk.a`.
 - Selects the compiler executable via `SILK_CC` (when set), otherwise falls back to `CC`, then `cc`.
 - Automatically adds the include and library search paths adjacent to the installed `silk` binary (for example `../include`, `../include/silk`, and `../lib`), plus `-lsilk`.
 - On `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (built-in Z3 is built as C++).
 - Passes through additional arguments verbatim to the underlying compiler (files, flags, `-o`, `-I`, `-L`, etc.).
 - Wrapper usage can be displayed via `silk help cc` (since `silk cc --help` is passed through to the underlying compiler; `slcc --help` prints wrapper usage).
- `silk cache [subcommand] [--package <dir|manifest>] [--cache-dir <path>]`:
 - current command model:
 - `silk cache` prints a cache-root summary,
 - `silk cache path` prints the effective cache root,
 - `silk cache list` lists recognized managed cache entries,
 - `silk cache inspect [<entry>]` inspects the root or one entry,
 - `silk cache prune` prunes recognized managed cache entries by policy,
 - `silk cache compact` heals recognized managed entries and reclaims stale
 managed space and drops now-empty managed directories such as `build/`,
 - `silk cache clear` removes recognized managed entries while preserving
 unknown files under the cache root,
 - cache mutation commands coordinate through an internal managed-cache lock:
 - normal `silk build` cache hits/fills use the same lock,
 - `silk cache prune|compact|clear` wait for in-flight managed cache work,
 - automatic maintenance skips itself when the lock is already held,
 - root selection:
 - `--cache-dir <path>` selects an explicit cache root,
 - otherwise the command uses `<work_root>/cache`,
 - and the work root comes from `SILK_WORK_DIR` or the default `.silk`
 resolution rules,
 - current recognized managed entry types:
 - CLI build-cache artifact entries under `build/<sha256-key>/`,
 - `std::build` generated-file blobs under `build/<fnv1a64>.blob`,
 - common options:
 - `--dry-run` previews cleanup,
 - `--max-age <age>` overrides the prune age limit for `prune` and
 `compact`,
 - `--max-size <bytes>` overrides the prune size cap for `prune` and
 `compact`,
 - `--keep-recent <n>` preserves at least `<n>` recent managed entries
 during pruning,
 - default maintenance policy:
 - auto-heal enabled,
 - auto-prune enabled,
 - max size `2 GiB`,
 - max age `30d`,
 - keep recent `64`,
 - environment overrides:
 - `SILK_CACHE_AUTO_HEAL`
 - `SILK_CACHE_AUTO_PRUNE`
 - `SILK_CACHE_MAX_BYTES`
 - `SILK_CACHE_MAX_AGE`
 - `SILK_CACHE_KEEP_RECENT`

Future commands (not yet implemented, but documented for roadmap clarity):

- `silk abi header` — emit `silk/silk.h` and ABI descriptions for embedders.

## Documentation & Manpages

- CLI behavior must be mirrored in [silk.1](?p=man/silk.1).
- Examples of typical build invocations and workflows should also be documented under [cli examples](?p=usage/cli-examples).
