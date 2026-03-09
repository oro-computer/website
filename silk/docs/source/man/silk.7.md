# `silk` (7) — Silk Toolchain Overview

> NOTE: This is the Markdown source for the eventual man 7 page for Silk. The roff-formatted manpage should be generated from this content.

## Name

`silk` — overview of the Silk language toolchain, documentation, and conventions.

## Description

Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer systems, mobile / tablet devices, WASM / WASI runtimes, and the web.

Silk is a native compiler toolchain with:

- a CLI entrypoint (`silk` (1)),
- an embedding API (`libsilk` (7) and the `silk_*` functions documented in section 3),
- and a standard library under the `std::` namespace.

Online documentation:

- `https://oro.computer/silk` (entry point)
- `https://oro.computer/silk/docs/` (documentation)
- `https://oro.computer/silk/spec/2026/` (spec snapshot)

## Current Backend Subset

The compiler currently supports full parsing and type checking, but code
generation is implemented only for a subset of the language. When a program
type-checks but uses a construct outside this subset, builds fail with
`E4001` diagnostics that point at the rejected construct and name its kind.

The supported subset is documented in:

- `silk` (1) (see the `build` command and its notes),
- `?p=compiler/cli-silk`,
- and the feature-specific implementation-status sections throughout the reference docs.

## Source Layout

- Silk source files use the `.slk` extension.
- Package builds are driven by a manifest file named `silk.toml` (see `?p=compiler/package-manifests`).
- The default stdlib implementation is a directory tree rooted at `std/` and is imported via `import std::...;`.

## Standard Library

The `std::` package namespace is the primary stdlib surface. The compiler can auto-load `std::...` modules from a configured stdlib root, and hosted builds may link a prebuilt stdlib archive.

See:

- `?p=std/overview` for module inventory and conventions,
- `?p=std/conventions` for ownership and error-handling patterns,
- `?p=compiler/cli-silk` for stdlib root selection and archive linking behavior.

## Formal Silk

Formal Silk verification is an optional part of the toolchain. The verifier uses Z3 and can be configured via CLI flags or environment variables.

See:

- `?p=language/formal-verification`
- `?p=compiler/diagnostics` (verifier diagnostics)

## See Also

- `silk` (1)
- `silk-build` (1), `silk-package` (1), `silk-check` (1), `silk-test` (1), `silk-doc` (1), `silk-man` (1), `silk-cc` (1)
- `silk_compiler` (3), `silk_error` (3), `silk_bytes` (3), `silk_abi_get_version` (3)
- `libsilk` (7)
- `https://oro.computer/silk`
