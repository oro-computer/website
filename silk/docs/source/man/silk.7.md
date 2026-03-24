# `silk` (7) — Silk Toolchain Overview

> NOTE: This is the Markdown source for the eventual man 7 page for Silk. The roff-formatted manpage should be generated from this content.

## Name

`silk` — overview of the Silk language toolchain, documentation, and conventions.

## Description

Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer systems, mobile / tablet devices, WASM / WASI runtimes, and the web.

Silk is a native compiler toolchain with:

- a CLI entrypoint ([silk (1)](?p=man/silk.1)),
- an embedding API ([libsilk (7)](?p=man/libsilk.7) and the `silk_*` functions documented in section 3),
- and a standard library under the `std::` namespace.

Online documentation:

- `https://oro.computer/silk` (entry point)
- `https://oro.computer/silk/docs/` (documentation)
- `https://oro.computer/silk/spec/2026/` (spec snapshot)

The toolchain is intended to be discoverable from the terminal instead of
requiring repository spelunking:

- `silk man` opens the nearest package overview when one is in scope; otherwise
  it shows the shipped entry surface,
- `silk man --list` lists the shipped commands/concepts plus common stdlib
  entrypoints,
- `silk man --search <pattern>` searches commands, concepts, stdlib modules,
  public stdlib symbols, and package-local pages/symbols when a package root is
  in scope,
- `silk doc --man <query> -o <path>` writes the generated roff page to a file,
- and REPL users can use `.man <query>` for current-session, imported, and
  `std::...` symbol/module docs.

## Discovery Workflow

Read the manpage sections as:

- section `1` — commands and subcommands,
- section `3` — public API / stdlib modules and symbols,
- section `7` — concepts, overviews, and workflows.

Recommended terminal workflow:

1. start with `silk man 7 silk`,
2. list or search when you do not know the exact page spelling yet,
3. open the exact page or symbol directly,
4. move to `silk doc --man` when you need a saved/generated roff file,
5. use `.man` inside the REPL for narrower session-level browsing.

## Current Code Generation Coverage

The compiler currently supports full parsing and type checking, but code
generation is not yet implemented for the full language surface. When a program
type-checks but uses a construct outside the currently implemented codegen
coverage, builds fail with `E4001` diagnostics that point at the rejected
construct and name its kind.

The currently implemented coverage is documented in:

- [silk (1)](?p=man/silk.1) (see the `build` command and its notes),
- [CLI reference](?p=compiler/cli-silk),
- and runnable examples in the language and standard-library docs.

## Source Layout

- Silk source files use the `.slk` extension.
- Package builds are driven by a manifest file named `silk.toml` (see [Package manifests](?p=compiler/package-manifests)).
- The default stdlib implementation is a directory tree rooted at `std/` and is imported via `import std::...;`.

## Standard Library

The `std::` package namespace is the primary stdlib surface. The compiler can auto-load `std::...` modules from a configured stdlib root, and hosted builds may link a prebuilt stdlib archive.

See:

- [Standard library overview](?p=std/overview) for module inventory and conventions,
- [Standard library conventions](?p=std/conventions) for ownership and error-handling patterns,
- [CLI reference](?p=compiler/cli-silk) for stdlib root selection and archive linking behavior.

## Formal Silk

Formal Silk verification is an optional part of the toolchain. The verifier uses Z3 and can be configured via CLI flags or environment variables.

See:

- [Formal verification](?p=language/formal-verification)
- [Diagnostics](?p=compiler/diagnostics) (verifier diagnostics)

## Examples

```sh
# Start from the toolchain overview.
silk man 7 silk

# List the shipped discovery surface.
silk man --list

# Search when you only know part of the name.
silk man --search fs
silk man --search String

# Open a command page, a stdlib module page, and a stdlib symbol page.
silk man build
silk man std::fs
silk man std::strings::String

# Use package-aware overview/docs aliases when silk.toml is in scope.
silk man readme
silk man docs

# Write a generated manpage to a file.
silk doc --man std::fs -o std_fs.3
```

## See Also

- [silk (1)](?p=man/silk.1)
- [silk-build (1)](?p=man/silk-build.1), [silk-package (1)](?p=man/silk-package.1), [silk-check (1)](?p=man/silk-check.1), [silk-test (1)](?p=man/silk-test.1), [silk-doc (1)](?p=man/silk-doc.1), [silk-man (1)](?p=man/silk-man.1), [silk-cc (1)](?p=man/silk-cc.1)
- [silk_compiler (3)](?p=man/silk_compiler.3), [silk_error (3)](?p=man/silk_error.3), [silk_bytes (3)](?p=man/silk_bytes.3), [silk_abi_get_version (3)](?p=man/silk_abi_get_version.3)
- [libsilk (7)](?p=man/libsilk.7)
- `https://oro.computer/silk`
