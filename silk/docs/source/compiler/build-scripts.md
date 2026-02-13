# Build Modules (`build.slk`)

This document specifies Silk’s *build module* concept: a package-local Silk
module named `build.slk` that can generate a package build plan at build time.

Build modules are intentionally *outside* the core language semantics (they are
a tooling/build feature). The language-level `package` / `import` / `export`
semantics remain defined in `docs/language/packages-imports-exports.md`.

## Overview

A build module is an optional file:

- `build.slk` (in the package root directory)

When enabled, `silk` compiles and runs a small wrapper program that imports the
build module and parses the manifest it emits as a TOML v1.0 package manifest in
the same format as `silk.toml`
(see `docs/compiler/package-manifests.md`).

This allows packages to compute targets, outputs, and dependency paths
dynamically (for example from environment variables, host information, or local
filesystem probes) while keeping the compiler’s build execution model centered
on a concrete manifest.

## Invocation

For package builds (`silk build --package ...`), build modules are opt-in: they
run only when enabled by the CLI or the root manifest.

CLI forms (always override defaults):

- `silk build --package <dir|manifest> --build-module`
- `silk build --package <dir|manifest> --build-module --build-module-path <path>`

Manifest configuration:

```toml
[build]
# Opt in to running the build module for package builds.
build_module = true

# Optional default path used when the build module is executed and the CLI does
# not provide `--build-module-path`.
build_module_path = "build.slk"
```

Legacy aliases (accepted for compatibility):

- `--build-script` → `--build-module`
- `--build-script-path` → `--build-module-path`

Rules:

- The build module is executed when either:
  - the CLI enables it (`--build-module` / `--build-module-path`), or
  - the root manifest sets `[build].build_module = true`.
- Precedence (highest to lowest):
  - `--build-module-path <path>` wins (and implies build module execution),
  - otherwise `--build-module` wins,
  - otherwise `[build].build_module = true` enables execution.
- When the build module is executed and `--build-module-path` is omitted, the
  compiler resolves the build module path as:
  - `[build].build_module_path` when set, otherwise
  - `<package_root>/build.slk`.
- When `--build-module-path <path>` is provided, that exact path is used.
  - If `<path>` is relative, it is resolved relative to `<package_root>`.
  - The file must exist, otherwise the build fails.
- The build module is executed as a hosted native program on the build host.
  This is currently supported only on `linux/x86_64`.
- The emitted manifest is parsed and used for the remainder of the build in
  place of reading `<package_root>/silk.toml`.
- The emitted manifest’s `[build].build_module` / `[build].build_module_path`
  values are ignored for the current invocation to prevent recursive build
  module execution.
- The build module source file itself is not treated as part of the package’s
  source set for subsequent compilation steps (even when the manifest omits
  `[sources]`).
- The build module may write logs to stderr; they are forwarded by the driver.

## Module Contract

Build modules are normal Silk modules.

The required contract is exporting an entrypoint matching the `Builder`
interface:

- The build module MUST export:
  - `export fn run (package_root: string, action: string) -> Promise(int);`
  - In practice, most build modules implement this as:
    - `export async fn run (package_root: string, action: string) -> int { ... }`
    - Note: for module interface conformance, an `async fn` is treated as
      returning `Promise(T)` at the call site (see `docs/language/interfaces.md`).

For clearer diagnostics and tooling, build modules SHOULD also declare module
conformance to `std::interfaces::Builder`. The interface name is resolved after
imports, so you may reference an imported `Builder` name instead of a fully
qualified path:

- `module <name> as std::interfaces::Builder;` (fully qualified), or
- `module <name> as Builder;` with `import { Builder } from "std/interfaces";`

The `silk` driver compiles and runs a wrapper program that:

- parses the build-module invocation arguments,
- imports the build module by file path, and
- calls `await build_module::run(package_root, action)`.

Build module requirements:

- The `run` entrypoint MUST return `0` on success.
- The build module MUST emit a valid TOML v1.0 manifest.
- The build module SHOULD avoid emitting non-manifest text as part of the
  manifest output (use stderr for logs).
- The build module output is subject to the same size cap as manifests:
  **1 MiB** (see `docs/compiler/limits.md`).

Parameters:

- `package_root` — the absolute package root directory.
- `action` — the build action (currently one of: `build`, `install`, `uninstall`).
  - When omitted by the driver, the action is treated as `build`.

## Security Model

Build modules are arbitrary code execution.

For this reason:

- package builds execute code on the build host when build modules are enabled
  (via `--build-module` / `--build-module-path` or `[build].build_module = true`),
- downstream tooling (package managers, CI, editor integrations) MUST treat
  build modules as untrusted inputs unless they are pinned and reviewed.

## Example

`build.slk` (emits a manifest that builds `src/main.slk` as an executable):

```silk
module hello::build as Builder;

import { Builder } from "std/interfaces";
import build from "std/build";

export async fn run (package_root: string, action: string) -> int {
  let _ = package_root;
  let _ = action;

  let mut b: build::Build = build::Build.init();
  b.package("hello", "0.1.0");
  let t = b.add_executable("hello", "src/main.slk");
  b.target_set_output(t, "build/hello");
  return b.emit();
}
```

## Recommended: `std::build`

Printing TOML directly is valid, but most build modules should use `std::build`
to construct a manifest programmatically.

The canonical spec for the build-module helper API is `docs/std/build.md`.

Typical pattern:

```silk
module hello::build as Builder;

import { Builder } from "std/interfaces";
import build from "std/build";

export async fn run (package_root: string, action: string) -> int {
  let _ = package_root;
  let _ = action;

  let mut b: build::Build = build::Build.init();
  b.package("hello", "0.1.0");
  let t = b.add_executable("hello", "src/main.slk");
  b.target_set_output(t, "build/hello");
  return b.emit();
}
```
