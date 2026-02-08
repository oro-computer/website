# `silk` (7) — Silk Toolchain Overview

> NOTE: This is the Markdown source for the eventual man 7 page for Silk. The roff-formatted manpage should be generated from this content.

## Name

`silk` — overview of the Silk language toolchain, documentation, and conventions.

## Description

Silk is a native compiler toolchain with:

- a CLI entrypoint (`silk` (1)),
- an embedding API (`libsilk` (7) and the `silk_*` functions documented in section 3),
- and a standard library under the `std::` namespace (`docs/std/`).

The canonical specifications live in `docs/`:

- Language semantics: `docs/language/`
- Compiler behavior and architecture: `docs/compiler/`
- Standard library design and APIs: `docs/std/`
- Manpage sources: `docs/man/`

## Current Backend Subset

The compiler currently supports full parsing and type checking, but code
generation is implemented only for a subset of the language. When a program
type-checks but uses a construct outside this subset, builds fail with
`E4001` diagnostics that point at the rejected construct and name its kind.

The supported subset is documented in:

- `silk` (1) (see the `build` command and its notes),
- `docs/compiler/cli-silk.md`,
- and runnable fixtures under `tests/silk/`.

## Source Layout

- Silk source files use the `.slk` extension.
- Package builds are driven by a manifest file named `silk.toml` (see `docs/compiler/package-manifests.md`).
- The default stdlib implementation is a directory tree rooted at `std/` and is imported via `import std::...;`.

## Standard Library

The `std::` package namespace is the primary stdlib surface. The compiler can auto-load `std::...` modules from a configured stdlib root, and hosted builds may link a prebuilt stdlib archive.

See:

- `docs/std/overview.md` for module inventory and conventions,
- `docs/std/conventions.md` for ownership and error-handling patterns,
- `docs/compiler/cli-silk.md` for stdlib root selection and archive linking behavior.

## Formal Silk

Formal Silk verification is an optional part of the toolchain. The verifier uses Z3 and can be configured via CLI flags or environment variables.

See:

- `docs/language/formal-verification.md`
- `docs/compiler/diagnostics.md` (verifier diagnostics)

## See Also

- `silk` (1)
- `silk-build` (1), `silk-check` (1), `silk-test` (1), `silk-doc` (1), `silk-man` (1), `silk-cc` (1)
- `silk_compiler` (3), `silk_error` (3), `silk_bytes` (3), `silk_abi_get_version` (3)
- `libsilk` (7)
