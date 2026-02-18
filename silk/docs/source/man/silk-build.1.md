# `silk-build` (1) — Build Silk Artifacts

> NOTE: This is the Markdown source for the eventual man 1 page for `silk build`. The roff-formatted manpage should be generated from this content.

## Name

`silk-build` — build an executable, object, static library, or shared library from Silk sources and link inputs (or a `silk.toml` package).

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

For package builds, outputs are selected by the manifest `[[target]]` entries. See `docs/compiler/package-manifests.md`.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving bare-specifier package imports (for example `import util from "util";`) from the package search path (`SILK_PACKAGE_PATH`).

Input kinds (by extension):

- `.slk` — Silk source file (part of the module set being compiled).
- `.o` — ELF relocatable object file linked into `--kind executable|shared` outputs (and included in `--kind static` archives).
- `.a` — static archive; its `.o` members are linked like object inputs (or included in a combined `--kind static` output).
- `.so` — shared library; treated as a dynamic dependency (equivalent to `--needed <soname>` using the library’s basename).
- `.c` — C source file; compiled to an object via the host C compiler (see `silk-cc` (1) / `SILK_CC`) and then treated like a `.o` input.

Package builds: when `--package` is provided, `.slk` inputs must be omitted, but non-`.slk` link inputs (`.c`, `.o`, `.a`, `.so`) may still be provided.

Package installation:

- `silk build install` builds the selected package target(s) and installs:
  - executables to `<prefix>/bin`,
  - objects/static/shared libraries to `<prefix>/lib/silk`,
  - emitted C headers (when present) to `<prefix>/include/silk/<package>/`,
  - and, when `[package].definitions` is set, installs those definition files
    plus an installed `silk.toml` under `<prefix>/lib/silk/<package>/` so the
    package is importable via the system package search root (`PREFIX/lib/silk`).
  It writes an uninstall receipt at `<prefix>/lib/silk/<package>/.silk_install_receipt`.
- `silk build uninstall` removes files listed in the uninstall receipt (same
  prefix selection rules as install).

Notes:

- `.o`/`.a`/`.c` link inputs are currently supported only for `linux/x86_64` outputs.
- `.so` inputs only affect executable/shared outputs (static archives cannot record dynamic dependencies).
- script-style entrypoints: when building an executable, if the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> int` that executes those statements and then returns `0`.
- for `--kind executable`, `--std-lib` / `--std <path>.a` is currently rejected when linking additional `.c`/`.o`/`.a` inputs (std sources are compiled into the build instead).
- on `linux/x86_64`, when `std::ggml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_ggml_init`), `silk build` automatically links the vendored ggml archives produced by `zig build deps` (see `docs/std/ggml.md`).
- on `linux/x86_64`, when `std::image::png` / `std::image::jpeg` are present in the module set (or when linked `.o`/`.a` inputs reference the shim symbols), `silk build` automatically links the vendored image archives produced by `zig build deps` (see `docs/std/image.md`).
- on `linux/x86_64`, when `std::xml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_xml_node_name_ptr`), `silk build` automatically links the vendored libxml2 archives produced by `zig build deps` (see `docs/std/xml.md`).

## Options

- `--help`, `-h` — show command help and exit.
- `--nostd`, `-nostd` — disable stdlib auto-loading for `import std::...;`.
- `--std-root <path>` — override the stdlib root directory used to resolve `import std::...;`.
- `--std-lib <path>` — select a stdlib archive path for linking hosted builds.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std <path>.a` — alias of `--std-lib`.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
- `--debug`, `-g` — enable debug build mode (also enables extra Formal Silk debug output when verification fails).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset (see `docs/language/memory-model.md` and `docs/compiler/cli-silk.md`).
- `-p <path>`, `--prefix <path>` — install/uninstall prefix (default: `$PREFIX` when set, otherwise `/usr/local`).

Output selection:

- `-o <path>`, `--out <path>` — output path. If parent directories do not exist, `silk` creates them.
- `--kind executable|object|static|shared` — output kind.
- `--emit bin|asm` — emission mode:
  - `bin` (default) emits the selected binary artifact at `-o` / `--out`,
  - `asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux/x86_64` and writes it to `-o` / `--out`.
- `-S` — alias of `--emit asm` (defaults to `--kind object` when `--kind` is not set).

Target selection:

- `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`). Accepted values:
  - `x86_64` / `amd64` → `linux-x86_64` (default)
  - `aarch64` / `arm64` → `linux-aarch64`
  - `wasm32` → `wasm32-unknown-unknown`
  - `wasm32-wasi` → `wasm32-wasi`
- `--target <triple>` — target triple (mutually exclusive with `--arch`).
  - executable code generation backends exist for:
    - `linux-x86_64` (IR-backed subset + const-main fallback)
    - `linux-aarch64` (const-main subset only)
    - `wasm32-unknown-unknown` (IR-backed subset + const-main fallback)
    - `wasm32-wasi` (IR-backed subset + const-main fallback)
  - target metadata and `attr(...)` gating are also available for: `macos-x86_64`, `macos-aarch64`, `ios-aarch64`, `android-aarch64`, `windows-x86_64`, `windows-aarch64`

Native compilation:

- `--cflag <arg>` — add a host C compiler argument used when compiling `.c`/`.h` inputs (repeatable).

Linker metadata (executable/shared only):

- `--ldflag <arg>` — add a link-related argument (repeatable). In the current toolchain these are translated into `--needed`/`--runpath`/`--soname` effects (see `docs/compiler/package-manifests.md`).
- `--needed <soname>` — add a `DT_NEEDED` entry (repeatable).
- `--runpath <path>` — add a `DT_RUNPATH` entry (repeatable).
- `--rpath <path>` — alias of `--runpath`.
- `--soname <soname>` — set `DT_SONAME` (shared only).

C header emission:

- `--c-header <path>` — write a C header declaring exported symbols (valid only for `--kind object|static|shared`).

Package builds:

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
  - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--cflag`, `--ldflag`, `--needed`, `--runpath`, `--soname`).

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

- `PREFIX` — installation prefix used by `silk build install` / `silk build uninstall` when `-p/--prefix` is not provided (default: `/usr/local`).
- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve bare-specifier package imports (entries separated by `:` on POSIX). The compiler appends a system library root at `PREFIX/lib/silk` as the last search path entry when it exists.
- `SILK_CC` — host C compiler used by `silk cc` (also used when compiling `.c` inputs passed to `silk build`).

## Exit status

- `0` on success.
- non-zero on error.

## See Also

- `silk` (1), `silk-check` (1), `silk-test` (1)
- `docs/compiler/cli-silk.md`
- `docs/compiler/package-manifests.md`
