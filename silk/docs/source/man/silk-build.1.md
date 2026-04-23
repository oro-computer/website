# [`silk-build(1)`](?p=man/silk-build.1) — Build Silk Artifacts

> NOTE: This is the Markdown source for the eventual man 1 page for `silk build`. The roff-formatted manpage should be generated from this content.

## Name

`silk-build` — build an executable, object, static library, shared library, or package-owned manpage from Silk sources and link inputs (or a `silk.toml` package).

## Synopsis

- `silk build [options] <input> [<input> ...] -o <output>`
- `silk build [options] --package <dir|manifest> [--build-module] [--package-target <name> ...]`
- `silk build [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)
- `silk build install [options] --package <dir|manifest> [--build-module] [--package-target <name> ...]`
- `silk build uninstall [options] --package <dir|manifest> [--build-module]`

## Description

`silk build` compiles a module set and emits an output artifact. You can build:

- explicit inputs (`<input> ...`), or
- a package module set from a manifest (`silk.toml`) using `--package` / `--pkg`.

For package builds, outputs are selected by the manifest `[[target]]` entries. See [package manifests](?p=compiler/package-manifests).
Manifest `kind = "man"` targets build package-owned manpages from either static
man sources or source-doc queries. Source-doc queries are evaluated against the
root package’s own source modules, not dependency docs in the same manifest
graph.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving bare-specifier package imports (for example `import util from "util";`) from the package search path (`SILK_PACKAGE_PATH`).

Input kinds (by extension):

- `.slk` — Silk source file (part of the module set being compiled).
- `.o` — ELF relocatable object file linked into `--kind executable|shared` outputs (and included in `--kind static` archives).
- `.a` — static archive; its `.o` members are linked like object inputs (or included in a combined `--kind static` output).
- `.so` — shared library; treated as a dynamic dependency (equivalent to `--needed <soname>` using the library’s basename).
- `.c` — C source file; compiled to an object via the host C compiler (see [`silk-cc(1)`](?p=man/silk-cc.1) / `SILK_CC`) and then treated like a `.o` input.
- `.h` — header build input:
 - if a sibling `.c` exists next to the header, `silk build` compiles that
 `.c` and links the resulting object,
 - otherwise it compiles the header itself as a C translation unit and links
 the resulting object.

Package builds: when `--package` is provided, `.slk` inputs must be omitted, but non-`.slk` link inputs (`.c`, `.h`, `.o`, `.a`, `.so`) may still be provided.

Package installation:

- `silk build install` builds the selected package target(s) and installs:
 - package-owned artifacts under the canonical package root
 `<prefix>/lib/silk/<package>/...`,
 - package-owned manpages under
 `<prefix>/lib/silk/<package>/share/man/man{1,3,7}/...` and mirrored to
 `<prefix>/share/man/man{1,3,7}/...`,
 - emitted C headers inside that package root and mirrored to
 `<prefix>/include/silk/<package>/`,
 - executables inside that package root and mirrored to `<prefix>/bin`,
 - and, when `[package].definitions` is set, installs those definition files
 plus an installed `silk.toml` under `<prefix>/lib/silk/<package>/` so the
 package is importable via the system package search root (`PREFIX/lib/silk`).
 - when local `[package].readme` / `[package].documentation` landing pages are
 present, the install copies them into
 `<prefix>/lib/silk/<package>/share/silk/docs/readme/...` or
 `<prefix>/lib/silk/<package>/share/silk/docs/documentation/...` and
 rewrites the installed manifest to those packaged paths,
 - when `[package].documentation` points at a static man target source, the
 installed manifest rewrites it to the installed `share/man/...` path so
 `silk man docs` continues to resolve.
 Library targets require `[package].definitions`; executable-only and
 manpage-only packages do not.
 It writes an uninstall receipt at
 `<prefix>/lib/silk/<package>/.silk_install_receipt`.
- `--destdir <path>` stages install/uninstall paths under `<destdir><prefix>/...`
 for system packaging workflows.
- `silk build uninstall` removes files listed in the uninstall receipt (same
 prefix selection rules as install).

Notes:

- `.o`/`.a`/`.c`/`.h` link inputs are currently supported only for `linux-x86_64` outputs.
- `.so` inputs only affect executable/shared outputs (static archives cannot record dynamic dependencies).
- on interactive TTY stderr, `silk build` shows a single animated progress line
 while it visits source files, import/package traversal, dependency artifact
 scans, vendored external dependency auto-linking, and later
 `resolve` / `check` / `codegen` / `link` phases.
- that progress line is transient and is cleared before diagnostics or other
 stderr output; non-interactive output stays concise.
- successful builds report final artifacts as `build: <kind> -> <path>`.
- script-style entrypoints: when building an executable, if the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> int` that executes those statements and then returns `0`.
- for `--kind executable`, `--std-lib` / `--std <path>.a` is currently rejected when linking additional `.c`/`.o`/`.a` inputs (std sources are compiled into the build instead).
- on supported native hosts (`linux/x86_64`, `macos/aarch64`), when `std::crypto` / `std::tls` are present in the module set, or when linked native `.c` / `.h` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol families, `silk build` automatically links the vendored crypto/TLS archives produced by `zig build deps`.
- on `linux-x86_64`, when `std::sqlite` is present in the module set, or when linked native `.c` / `.h` / `.o` / `.a` inputs reference `sqlite3_*` symbols, `silk build` automatically links the vendored SQLite archive produced by `zig build deps`.
- on supported native hosts (`linux/x86_64`, `macos/aarch64`), when `std::ssh` / `std::ssh2` are present in the module set, or when linked native `.c` / `.h` / `.o` / `.a` inputs reference `libssh2_*` symbols, `silk build` automatically links the vendored libssh2 archive and its vendored crypto dependencies produced by `zig build deps`.
- on `linux-x86_64`, when `std::ggml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_ggml_init`), `silk build` automatically links the vendored ggml archives produced by `zig build deps` (see [ggml](?p=std/ggml)).
- on `linux-x86_64`, when `std::image::png` / `std::image::jpeg` are present in the module set (or when linked `.o`/`.a` inputs reference the shim symbols), `silk build` automatically links the vendored image archives produced by `zig build deps` (see [image](?p=std/image)).
- on `linux-x86_64`, when `std::xml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_xml_node_name_ptr`), `silk build` automatically links the vendored libxml2 archives produced by `zig build deps` (see [xml](?p=std/xml)).

## Options

`silk build -h` groups the live terminal help into:

- General
- Stdlib and verification
- Output and target selection
- Link inputs and dynamic linking
- Package builds
- Install and uninstall

### General

- `--help`, `-h` — show command help and exit.
- `--feature <spec>`, `-F<spec>` — enable a build feature for `attr(feature="...")` queries and declaration gating. Repeatable.
 - Spec forms: `NAME` or `NAME=VALUE` (see [attributes](?p=language/attributes)).
 - For package builds, you may target a specific package with `PKG/NAME` or
 `PKG/NAME=VALUE` (for example `ui/tui` or `ui/tui=false`).
- `--debug`, `-g` — enable debug build mode (also enables extra Formal Silk debug output when verification fails).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset (see [memory model](?p=language/memory-model) and [cli silk](?p=compiler/cli-silk)).

### Stdlib and verification

- `--nostd`, `-nostd` — disable stdlib auto-loading for `import std::...;`.
- `--std-root <path>` — override the stdlib root directory used to resolve `import std::...;`.
- `--std-lib <path>` — select a stdlib archive path for linking hosted builds.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std <path>.a` — alias of `--std-lib`.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).

### Output and target selection

- `-o <path>`, `--out <path>` — output path. If parent directories do not exist, `silk` creates them.
- `--kind executable|object|static|shared` — output kind.
- `--emit bin|asm` — emission mode:
 - `bin` (default) emits the selected binary artifact at `-o` / `--out`,
 - `asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux-x86_64` and writes it to `-o` / `--out`.
- `-S` — alias of `--emit asm` (defaults to `--kind object` when `--kind` is not set).
- `--list-targets` — list the recognized `--target` triples (including supported output kinds and any current const-main-only notes) and exit.
- `--list-archs` — list the recognized `--arch` values and exit.
- `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`). Accepted values:
 - `x86_64` / `amd64` → `linux-x86_64` (default)
 - `aarch64` / `arm64` → `linux-aarch64`
 - `wasm32` → `wasm32-unknown-unknown`
 - `wasm32-wasi` → `wasm32-wasi`
 - `--target <triple>` — target triple (mutually exclusive with `--arch`).
 - executable code generation backends exist for:
 - `linux-x86_64` (IR-backed subset + const-main fallback)
 - `linux-aarch64` (const-main subset only)
 - `android-aarch64` (const-main subset only)
 - `macos-x86_64` (const-main subset only)
 - `macos-aarch64` (const-main subset everywhere; on Apple Silicon macOS
 hosts also supports a temporary non-const integer/bool scalar IR subset
 via host `as` / `ld`, including bundled runtime-backed executables linked
 from extracted `libsilk_rt*.a` object members; that host-supported
 subset is reflected by the target metadata instead of being labeled
 const-main-only on those hosts)
 - `ios-aarch64` (const-main subset only)
 - `windows-x86_64` (const-main subset only)
 - `windows-aarch64` (const-main subset only)
 - `wasm32-unknown-unknown` (IR-backed subset + const-main fallback)
 - `wasm32-wasi` (IR-backed subset + const-main fallback)
 - const-main stub outputs require `main` to reduce to a constant integer value (supports `fn main () -> int` and the standard `fn main(argc: int, argv: u64) -> int` form when arguments are unused).
 - target metadata and `attr(...)` gating are available for all recognized targets (including the const-main-only targets listed above).
- `--c-header <path>` — write a C header declaring exported symbols (valid only for `--kind object|static|shared`).

### Link inputs and dynamic linking

- `--cflag <arg>` — add a host C compiler argument used when compiling `.c` inputs and `.h` inputs that fall back to header-compilation (repeatable).
- `--ldflag <arg>` — add a link-related argument (repeatable). In the current toolchain these are translated into `--needed`/`--runpath`/`--soname`/`--elf-interp` effects (see [package manifests](?p=compiler/package-manifests)).
- `--needed <soname>` — add a `DT_NEEDED` entry (repeatable).
- `--runpath <path>` — add a `DT_RUNPATH` entry (repeatable).
- `--rpath <path>` — alias of `--runpath`.
- `--soname <soname>` — set `DT_SONAME` (shared only).
- `--elf-interp <path>` — override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` executable outputs (overrides `SILK_ELF_INTERP`; when cross-compiling from non-`linux/x86_64` hosts the default falls back to `/lib64/ld-linux-x86-64.so.2`). Rejected for non-`linux/x86_64` targets.

### Package builds

- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files.
- `--build-module` — compile and run the package build module and use the manifest it emits as the package manifest.
 - when a build module is executed and no explicit path override is provided, the compiler looks for `<package_root>/build.slk` (or uses `[build].build_module_path` from `silk.toml` when set).
 - the build module is invoked with `argv[1] = <package_root>` and `argv[2] = <action>` where `<action>` is `build`, `install`, or `uninstall`.
- build modules are opt-in by default; to run one for `silk build --package` without passing `--build-module`, set `[build].build_module = true` in `silk.toml`.
- `--build-module-path <path>` — override the build module path.
 - if `<path>` is relative, it is resolved relative to `<package_root>`.
- Legacy aliases (accepted for compatibility): `--build-script` and `--build-script-path`.
- `--package-target <name>` — select one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias).
 - when omitted, `silk build --package ...` builds every manifest `[[target]]` entry by default.
 - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--cflag`, `--ldflag`, `--needed`, `--runpath`, `--soname`, `--elf-interp`).
 - build features may be enabled via `[build].features` in `silk.toml` (and may be overridden by `--feature` / `-F`).

### Install and uninstall

- `-p <path>`, `--prefix <path>` — install/uninstall prefix (default: `$PREFIX` when set, otherwise `/usr/local`).
- `--destdir <path>` — stage install/uninstall paths under `<destdir><prefix>/...`.

Argument parsing:

- `--` — end of options; treat following args as file paths (even if they begin with `-`).

## Examples

```sh
# Build an executable from a single file.
silk build src/main.slk -o build/app

# Build an object file (and emit a C header for exported symbols).
silk build src/lib.slk --kind object -o build/lib.o --c-header build/lib.h

# Emit an assembly listing (objdump-style disassembly) for an object build.
silk build src/main.slk -S -O2 -o build/main.s

# Link an extra C object into a Silk executable.
cc -std=c99 -c -o build/extra.o src/extra.c
silk build src/main.slk build/extra.o -o build/app

# Build the current directory as a package (when ./silk.toml exists).
silk build

# Build a specific target from a manifest.
silk build --package . --package-target app

# Install the current package to /usr/local.
silk build install

# Install to a custom prefix.
silk build install -p /tmp/silk-prefix

# Uninstall from a custom prefix.
silk build uninstall -p /tmp/silk-prefix
```

## Environment

| Variable | Details |
| --- | --- |
| `PREFIX` | installation prefix used by `silk build install` / `silk build uninstall` when `-p/--prefix` is not provided (default: `/usr/local`). |
| `SILK_PACKAGE_PATH` | PATH-like list of package root directories used to resolve bare-specifier package imports (entries separated by `:` on POSIX). The compiler appends a system library root at `PREFIX/lib/silk` as the last search path entry when it exists. |
| `SILK_ELF_INTERP` | override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` outputs when emitting dynamically-linked executables/shared libraries. |
| `SILK_Z3_LIB` | path to a dynamic Z3 library used by the Formal Silk verifier. |
| `SILK_VERIFY_JOBS` | override the number of worker threads used for Formal Silk verification (default: auto; capped at 8). |
| `SILK_CC` | host C compiler used by `silk cc` (also used when compiling `.c` inputs passed to `silk build`). |

## Exit status

| Status | Meaning |
| --- | --- |
| `0` | Success. |
| non-zero | Error. |

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-check(1)`](?p=man/silk-check.1), [`silk-test(1)`](?p=man/silk-test.1)
- [cli silk](?p=compiler/cli-silk)
- [package manifests](?p=compiler/package-manifests)
