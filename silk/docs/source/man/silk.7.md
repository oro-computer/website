# `silk` (7) — Silk Toolchain Overview


## Name

`silk` — overview of the Silk language toolchain, documentation, and conventions.

## Description

Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer systems, mobile / tablet devices, WASM / WASI runtimes, and the web.

Silk is a native compiler toolchain with:

- a CLI entrypoint (`silk` (1)),
- an embedding API (`libsilk` (7) and the `silk_*` functions documented in section 3),
- and a standard library under the `std::` namespace.

## Quickstart

The typical loop is:

```sh
silk check hello.slk
silk build hello.slk -o build/hello
./build/hello
```

For package-based workflows:

```sh
silk package inspect --package ./silk.toml
silk build --package ./silk.toml
```

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
- [`silk` CLI](?p=compiler/cli-silk),
- and the feature-specific implementation-status sections throughout the reference docs.

## Source Layout

- Silk source files use the `.slk` extension.
- Package builds are driven by a manifest file named `silk.toml` (see [Package manifests](?p=compiler/package-manifests)).
- The default stdlib implementation is a directory tree rooted at `std/` and is imported via `import std::...;`.

## Standard Library

The `std::` package namespace is the primary stdlib surface. The compiler can auto-load `std::...` modules from a configured stdlib root, and hosted builds may link a prebuilt stdlib archive.

See:

- [Standard library overview](?p=std/overview) for module inventory and conventions,
- [Standard library conventions](?p=std/conventions) for ownership and error-handling patterns,
- [`silk` CLI](?p=compiler/cli-silk) for stdlib root selection and archive linking behavior.

## Formal Silk

Formal Silk verification is an optional part of the toolchain. The verifier uses Z3 and can be configured via CLI flags or environment variables.

See:

- [Formal verification](?p=language/formal-verification)
- [Diagnostics](?p=compiler/diagnostics) (verifier diagnostics)

## See Also

- [`silk` (1)](?p=man/silk.1)
- [`silk-build` (1)](?p=man/silk-build.1), [`silk-package` (1)](?p=man/silk-package.1), [`silk-check` (1)](?p=man/silk-check.1), [`silk-test` (1)](?p=man/silk-test.1), [`silk-doc` (1)](?p=man/silk-doc.1), [`silk-man` (1)](?p=man/silk-man.1), [`silk-cc` (1)](?p=man/silk-cc.1)
- [`silk_compiler` (3)](?p=man/silk_compiler.3), [`silk_error` (3)](?p=man/silk_error.3), [`silk_bytes` (3)](?p=man/silk_bytes.3), [`silk_abi_get_version` (3)](?p=man/silk_abi_get_version.3)
- [`libsilk` (7)](?p=man/libsilk.7)
- [https://oro.computer/silk](https://oro.computer/silk)
