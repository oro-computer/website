# `silk-build` (1) — Build Silk Artifacts

> NOTE: This is the Markdown source for the eventual man 1 page for `silk build`. The roff-formatted manpage should be generated from this content.

## Name

`silk-build` — build an executable, object, static library, or shared library from Silk sources and link inputs (or a `silk.toml` package).

## Synopsis

- `silk build [options] <input> [<input> ...] -o <output>`
- `silk build [options] --package <dir|manifest> [--build-script] [--package-target <name> ...]`
- `silk build [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)

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

Notes:

- `.o`/`.a`/`.c` link inputs are currently supported only for `linux/x86_64` outputs.
- `.so` inputs only affect executable/shared outputs (static archives cannot record dynamic dependencies).
- script-style entrypoints: when building an executable, if the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> int` that executes those statements and then returns `0`.
- for `--kind executable`, `--std-lib` / `--std <path>.a` is currently rejected when linking additional `.c`/`.o`/`.a` inputs (std sources are compiled into the build instead).
- on `linux/x86_64`, when `std::ggml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_ggml_init`), `silk build` automatically links the vendored ggml archives produced by `zig build deps` (see `docs/std/ggml.md`).

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

Output selection:

- `-o <path>`, `--out <path>` — output path. If parent directories do not exist, `silk` creates them.
- `--kind executable|object|static|shared` — output kind.

Target selection:

- `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`).
- `--target <triple>` — target triple (mutually exclusive with `--arch`).

Linker metadata (executable/shared only):

- `--needed <soname>` — add a `DT_NEEDED` entry (repeatable).
- `--runpath <path>` — add a `DT_RUNPATH` entry (repeatable).
- `--rpath <path>` — alias of `--runpath`.
- `--soname <soname>` — set `DT_SONAME` (shared only).

C header emission:

- `--c-header <path>` — write a C header declaring exported symbols (valid only for `--kind object|static|shared`).

Package builds:

- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files.
- `--build-script` — compile and run `<package_root>/build.silk` and use its stdout as the manifest.
- `--package-target <name>` — select one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias).
  - when omitted, `silk build --package ...` builds every manifest `[[target]]` entry by default.
  - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--arch`, `--target`, `--c-header`, `--needed`, `--runpath`, `--soname`).

Argument parsing:

- `--` — end of options; treat following args as file paths (even if they begin with `-`).

## Examples

```sh
# Build an executable from a single file.
silk build src/main.slk -o build/app

# Build an object file (and emit a C header for exported symbols).
silk build src/lib.slk --kind object -o build/lib.o --c-header build/lib.h

# Link an extra C object into a Silk executable.
cc -std=c99 -c -o build/extra.o src/extra.c
silk build src/main.slk build/extra.o -o build/app

# Build the current directory as a package (when ./silk.toml exists).
silk build

# Build a specific target from a manifest.
silk build --package . --package-target app
```

## Environment

- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve bare-specifier package imports (entries separated by `:` on POSIX).
- `SILK_CC` — host C compiler used by `silk cc` (also used when compiling `.c` inputs passed to `silk build`).

## Exit status

- `0` on success.
- non-zero on error.

## See Also

- `silk` (1), `silk-check` (1), `silk-test` (1)
- `docs/compiler/cli-silk.md`
- `docs/compiler/package-manifests.md`
