# Standard Library Integration

This document describes how the `std::` package integrates with the compiler and the CLI.

Use this page when you need to answer:

- how `import std::...;` is resolved,
- when the default stdlib is auto-loaded,
- how to swap in an alternate stdlib root,
- and what `--nostd` actually changes.

## Core model

Key requirements:

- `std::` is a distinct package:
  - linked by default by `silk`,
  - replaceable with an alternative implementation via CLI or configuration.
- The default `std::` assumes POSIX semantics for OS-facing components.

Compiler responsibilities:

- Provide mechanisms for:
  - linking the default stdlib,
  - specifying an alternate stdlib,
  - ensuring FFI and ABI remain stable regardless of the stdlib implementation.

## Default workflow

In the common case, you do not need to configure anything explicitly:

```sh
silk check app.slk
silk build app.slk -o build/app
```

If `app.slk` imports `std::io`, `std::fs`, or other `std::...` modules, the
toolchain resolves them from the configured stdlib root and links the hosted
runtime pieces required by those modules for the active target.

## Selecting a stdlib root

The public control points are:

- `--std-root <path>` (or equivalent CLI aliases documented in
  [`silk` CLI](?p=compiler/cli-silk)) to point at a specific stdlib tree,
- `SILK_STD_ROOT` as the default when the flag is not provided,
- `--nostd` to disable stdlib auto-loading entirely.

Example:

```sh
silk check app.slk --std-root /opt/oro/silk/std
silk build app.slk --std-root /opt/oro/silk/std -o build/app
```

The alternate root must still provide the public `std::` module surface your
program imports.

## `--nostd`

`--nostd` means:

- `import std::...;` no longer resolves automatically,
- hosted stdlib archives are not linked automatically,
- and only the explicit module set / package graph you pass to the compiler is
  considered.

This is mainly useful for bring-up, freestanding targets, or experiments with a
replacement stdlib.

```sh
silk check freestanding.slk --nostd
silk build freestanding.slk --nostd --target wasm32-unknown-unknown -o out.wasm
```

## Packages and distribution

For package builds, stdlib integration still follows the same rules: the
package graph from `silk.toml` is resolved first, then `std::...` imports are
resolved from the active stdlib root.

See also:

- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
- [CLI reference](?p=compiler/cli-silk)
- [Standard library overview](?p=std/overview)
