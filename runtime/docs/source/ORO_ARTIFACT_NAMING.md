# Oro Runtime Artifact Naming

This document defines the canonical naming for Oro Runtime build artifacts across
platforms and packaging ecosystems.

## Native libraries and archives

Primary Oro Runtime libraries use the `oro-runtime` stem:

- **Static libraries (desktop/mobile toolchains)**
  - Linux/macOS: `liboro-runtime.a`
  - Windows (MSVC): `oro-runtime.lib`
- **Dynamic libraries / shared objects (where produced)**
  - Linux: `liboro-runtime.so`
  - macOS: `liboro-runtime.dylib`
  - Windows: `oro-runtime.dll`

## pkg-config files

Oro Runtime ships a pkg-config file using the Oro name:

- Primary file: `oro-runtime.pc`
  - `Name: oro-runtime`
  - `Version: <runtime version>`

## CLI and configuration artifacts

- CLI binary: `oroc`
- Project config: `oro.toml`
- Per-developer overrides/secrets: `.ororc`
- Environment variables: `ORO_*`

## NPM packages and scopes

Oro Runtime publishes packages under the `@orocomputer` scope:

- `@orocomputer/runtime`
- `@orocomputer/runtime-{darwin,linux,win32}-{arm64,x64}`
- `@orocomputer/runtime-node`

## Updating this policy

If artifact naming changes, update this document alongside the implementation
and ensure `test/unit/bootstrap-tooling.test.js` continues to enforce Oro-only
release tooling.
