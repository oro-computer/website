# Build Scripts (`build.silk`)

This document specifies Silk’s *build script* concept: a package-local Silk
program named `build.silk` that can generate a package build plan at build time.

Build scripts are intentionally *outside* the core language semantics (they are
a tooling/build feature). The language-level `package` / `import` / `export`
semantics remain defined in `docs/language/packages-imports-exports.md`.

## Overview

A build script is an optional file:

- `build.silk` (in the package root directory)

When enabled, `silk` compiles and runs the build script and treats its stdout as
a TOML v1.0 package manifest in the same format as `silk.toml`
(see `docs/compiler/package-manifests.md`).

This allows packages to compute targets, outputs, and dependency paths
dynamically (for example from environment variables, host information, or local
filesystem probes) while keeping the compiler’s build execution model centered
on a concrete manifest.

## Invocation (CLI)

Build scripts are executed only when explicitly requested.

- `silk build --package <dir|manifest> --build-script`

Rules:

- The build script path is `<package_root>/build.silk`, where `<package_root>` is
  the directory containing the package.
- If `build.silk` does not exist, `silk build --build-script` fails.
- The build script is executed as a hosted native program on the build host.
  In the current implementation, this is supported only on `linux/x86_64`.
- The build script’s stdout is parsed as a manifest and used for the remainder
  of the build in place of reading `<package_root>/silk.toml`.
- The build script may write logs to stderr; they are forwarded by the driver.

## Script Contract

- The build script MUST exit with status code `0` on success.
- The build script MUST print a valid TOML v1.0 manifest to stdout.
- The build script SHOULD avoid printing non-manifest text to stdout (use stderr
  for logs).
- The build script output is subject to the same size cap as manifests:
  **1 MiB** (see `docs/compiler/limits.md`).

The build script is invoked with one positional argument:

- `argv[1]` — the absolute package root directory.

## Security Model

Build scripts are arbitrary code execution.

For this reason:

- build scripts are **not** run implicitly by `silk build` in the current
  implementation; they require `--build-script`,
- downstream tooling (package managers, CI, editor integrations) MUST treat
  build scripts as untrusted inputs unless they are pinned and reviewed.

## Example

`build.silk` (prints a manifest that builds `src/main.slk` as an executable):

```silk
import std::io;

fn main (argc: int, argv: u64) -> int {
  _ = argc;
  _ = argv;

  std::io::print(`[package]
name = "hello"

[[target]]
name = "hello"
kind = "executable"
entry = "src/main.slk"
`);
  return 0;
}
```
