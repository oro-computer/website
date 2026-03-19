# Silk Package Distribution

Status: **Current supported package-distribution model**. The manifest, CLI,
install, inspection/linting, and binary-dependency consumption behavior
described here are implemented in the current toolchain. This document
describes the package authoring, publication, and consumption model Silk uses
today.

## Summary

Silk treats a package as a portable filesystem root with `silk.toml` at
its root. That root may contain Silk source, definition/prototype files, native
artifacts, headers, documentation, and executables. Publication channels such
as npm, distro package managers, and GitHub releases should distribute that same
package root. Silk itself should not own or prescribe channel-native metadata;
authors may manage that separately for whatever ecosystems they target.

This keeps `silk.toml` as the single canonical manifest while letting packages
move through ordinary distribution systems.

## Goals

- Keep `silk.toml` as the canonical package manifest for authoring, packaging,
  and consumption.
- Make the package unit portable across:
  - local source checkouts,
  - vendored directories in a repo,
  - unpacked GitHub release/source archives,
  - filesystem trees populated by third-party package managers,
  - and system package manager installs.
- Support four first-class package shapes:
  - source packages,
  - interface-only packages,
  - binary-only packages,
  - hybrid packages that ship both source and prebuilt artifacts.
- Keep package identity independent of any external registry or package manager.
- Preserve ergonomic modularity inspired by successful package ecosystems:
  - one manifest at package root,
  - explicit public package metadata,
  - explicit packaged file set,
  - clear executable/library exposure,
  - and predictable install/lookup rules.

## Non-Goals

- A Silk-owned central registry.
- Requiring the `silk` compiler to fetch packages from the network during an
  ordinary build.
- Generating distro-native packaging recipes for every ecosystem in the first
  iteration.
- Replacing distro package managers, npm, or GitHub releases with Silk-specific
  infrastructure.
- Adding manager-specific manifest sections or resolver rules for each external
  ecosystem.

## Design Principles

### 1. The package root is the unit of distribution

The fundamental thing that is authored, versioned, archived, installed, and
consumed is a directory tree with:

- `silk.toml` at the root,
- relative paths inside the manifest,
- and enough files to type-check and/or link the package.

A registry entry, tarball, `.deb`, `.rpm`, PKGBUILD source tarball, or GitHub
release asset is only a transport for that package root.

### 2. Package identity is always Silk-native

The canonical package identity is `package.name` from `silk.toml`, for example:

- `http`
- `oro::http`
- `std::io`

External names used by GitHub, npm, distro repositories, or other ecosystems
must not replace Silk package identity.

### 3. Consumption is filesystem-first

The compiler should consume packages that already exist on disk:

- direct package paths,
- search roots such as `./packages`,
- unpacked release archives,
- system-installed package roots,
- or filesystem trees populated by third-party package managers.

This keeps builds portable, offline-friendly, and compatible with multiple host
ecosystems.

### 4. Binary packages must still be type-checkable

A binary-only Silk package cannot rely on native object introspection to expose
its API. It must ship definition/prototype files that describe:

- exported functions,
- exported types and structs,
- interfaces and theories,
- constants and externals as needed for import-time type checking.

If a package wants to be imported from Silk source, it must provide a Silk-level
surface even when its implementation is distributed only as `.a`, `.o`, or
`.so` files.

### 5. The package root should be self-contained

The distributed package root should be sufficient for both tooling and
installation. Silk now installs package-owned artifacts, definitions, headers,
and the installed `silk.toml` under the canonical package root
`<prefix>/lib/silk/<package>/...`, while still allowing compatibility mirrors
such as `<prefix>/bin/...` and `<prefix>/include/silk/<package>/...`.

## Package Shapes

### Source package

Contains `.slk` sources and may optionally contain definitions and prebuilt
artifacts.

Typical use:

- libraries consumed from source,
- applications,
- stdlib-style packages,
- actively developed workspace dependencies.

### Interface-only package

Contains only definition/prototype files and metadata.

Typical use:

- abstract API contracts,
- FFI surface declarations,
- theory bundles,
- packages that describe an implementation supplied elsewhere.

### Binary-only package

Contains native artifacts, optional package-owned manual pages, plus
definition/prototype files when the package exposes a Silk import surface.

Typical use:

- prebuilt static/shared libraries,
- packages distributed for fast install on supported targets,
- packages whose implementation is not shipped as Silk source.

### Hybrid package

Contains source, definitions, and one or more prebuilt artifacts.

Typical use:

- libraries that want both source portability and fast-path prebuilt binaries,
- packages that support source builds on unsupported targets and artifact reuse
  on common targets,
- system packages and GitHub releases that want one canonical payload.

## Recommended Package Root Layout

The exact directory names should remain manifest-driven, but Silk should
standardize a conventional layout so tarballs, third-party package-manager
payloads, and installed system packages all look similar:

```text
<package-root>/
  silk.toml
  README.md
  LICENSE
  src/
  defs/
  include/
  lib/
    linux-x86_64/
    linux-aarch64/
    wasm32-wasi/
  bin/
    linux-x86_64/
  share/
    man/
```

Notes:

- `src/` is for distributable Silk implementation sources.
- `defs/` is for definition/prototype modules that describe the importable
  public API.
- `include/` is for C headers, generated or hand-authored.
- `lib/<target>/` and `bin/<target>/` keep target-specific artifacts together
  inside the package root.
- `share/man/` mirrors ordinary system packaging practice for optional manual
  pages.
  - `[[target]] kind = "man"` installs built package manpages there under
    `share/man/man{1,3,7}/...` and mirrors them to the prefix-level
    `<prefix>/share/man/...` tree.
  - source checkouts may also keep Markdown man sources under `docs/man/` or
    `man/`; `silk man` discovers those roots alongside `share/man/` once the
    package root is known from `silk.toml`.
- `[package].readme` and `[package].documentation` identify the package’s
  overview/docs landing pages for `silk man` when they name local files or
  local directories (URLs remain valid metadata and are surfaced as references).
  Absolute paths and relative paths that escape the package root are invalid
  for these local landing pages.
  - `silk build install` copies local landing pages into
    `share/silk/docs/readme/...` or `share/silk/docs/documentation/...` inside
    the installed package root and rewrites the installed manifest to those
    packaged paths.
  - when `[package].documentation` points at a static `[[target]] kind = "man"`
    source that is also installed, the installed manifest instead rewrites it
    to `share/man/man{1,3,7}/...`, and the install skips any redundant
    `share/silk/docs/documentation/...` copy for the same page.

The manifest should continue to describe actual paths; the layout above is a
convention, not a hardcoded requirement.

## `silk.toml` Responsibilities

`silk.toml` owns all Silk-specific package metadata. It is the complete
package descriptor for the current authoring and distribution model.

### Canonical fields

- `[package]`
- `[sources]`
- `[dependencies]`
- `[[target]]`
- `[build]`
- `[package].definitions`

### Metadata that is now first-class

The package section standardizes the metadata most publication channels
need:

- `description`
- `license`
- `homepage`
- `repository`
- `documentation`
- `authors`
- `keywords`
- `readme`

These fields belong in `silk.toml` because they are channel-agnostic package
metadata that remain useful no matter where the package is published.

### Separate package contents from build sources

The current `[sources]` section defines which `.slk` files participate in the
module set. That is not enough to define what gets published.

`[dist]` is the distribution-oriented file whitelist. It describes the
package payload, for example:

```toml
[dist]
include = [
  "silk.toml",
  "src/**",
  "defs/**",
  "include/**",
  "lib/**",
  "bin/**",
  "README.md",
  "LICENSE*",
]
exclude = ["**/.DS_Store"]
```

This solves a different problem from `[sources]`:

- `[sources]` says what the compiler should compile.
- `[dist]` says what a published package contains.

### Artifact metadata should be explicit

`[[target]]` remains the build recipe surface. Published binaries and shipped
manual pages are described by `[[artifact]]`.

The `[[artifact]]` table describes shipped outputs, for example:

```toml
[[artifact]]
name = "oro_http_static"
kind = "static"
path = "lib/linux-x86_64/liboro_http.a"
target = "linux-x86_64"
libc = "glibc"
libc_min = "2.31"
definitions = ["defs/http.slk"]
c_header = "include/oro_http.h"
```

The current fields are enough for the supported distribution model. If Silk
extends `[[artifact]]` later, those extensions must remain channel-agnostic and
preserve this package-root model.

### Publication-channel configuration should stay out of `silk.toml`

Silk packages should be publishable to npm, GitHub releases, and system package
managers without baking channel-specific configuration into the canonical
manifest.

`silk.toml` should stop at channel-agnostic package metadata. Publication
details that only matter to one ecosystem should live in:

- author-managed channel-native metadata maintained alongside the package,
- or packaging/release automation outside the manifest.

This keeps the manifest stable even when a package is published to multiple
ecosystems at once.

## Dependency Model

The dependency model should separate package identity from transport:

- identity:
  - Silk package name,
  - version requirement,
  - features,
  - optionality,
  - target conditions,
- transport/materialization:
  - local path,
  - vendored checkout,
  - unpacked tarball,
  - third-party-managed install tree,
  - system-installed package.

This keeps a dependency on `oro::http` stable regardless of where the package
came from.

### Version requirements

Non-path dependencies should use a small, channel-agnostic SemVer range string
in the manifest, for example:

```toml
[dependencies]
oro::http = { version = "^1.4.0" }
oro::tls = { version = ">=1.2.0, <2.0.0" }
oro::local = { path = "../oro-local" }
oro::vendored = { path = "vendor/oro-vendored", sha256 = "sha256:..." }
```

The initial supported forms should be:

- exact versions: `1.2.3`
- caret ranges: `^1.2.3`
- tilde ranges: `~1.2.3`
- wildcard ranges: `1.2.*`
- comparator sets: `>=1.2.0, <2.0.0`

This keeps version selection expressive without tying Silk to any one package
manager’s resolver.

### Integrity

Integrity metadata should cover the declared package payload, not only the
compiler input sources.

Once `[dist]` is present, the package hash should cover:

- `silk.toml`, and
- every file selected by `[dist]`.

For source-only packages that omit `[dist]`, the current source-oriented hash
scheme can remain as a backward-compatible fallback.

The older manifest model:

- local `path`,
- required `sha256`,
- search-path lookup when `path` is omitted,

was a useful starting point but too narrow for distributed packages. The
manifest now supports version-aware dependency descriptions, with
integrity checks reserved for vendored snapshots, tarballs, or other
content-addressed package materializations.

## Consumption Model

### Local development

The current workflows remain valid and should stay first-class:

- `path = "../my-lib"`
- vendoring packages under `./packages`
- `silk build --package .`

This is the lowest-friction authoring mode and should not require a separate
package server.

### GitHub tags and releases

GitHub should be treated as a normal distribution channel:

- source distribution:
  - release source tarball containing the package root,
- binary distribution:
  - release assets containing target-specific artifacts inside the package root
    layout.

Users should be able to:

- unpack the archive and depend on it by path,
- vendor it under a local package root,
- or repackage it for other publication workflows.

### Third-party package managers and registries

Third-party ecosystems may place a Silk package root anywhere in their own
managed directory trees. Silk does not need explicit support for each such
layout.

The contract is simpler:

- the author or consumer ensures a real Silk package root exists on disk,
- the compiler resolves it via an explicit `path` dependency or a directory
  listed in `SILK_PACKAGE_PATH`,
- and `package.name` inside `silk.toml` remains authoritative.

If an ecosystem requires its own metadata files, manifests, or release
descriptors, the author manages those directly outside Silk.

### System package managers

For apt, dnf/yum, pacman, and AUR-style workflows, Silk should lean on standard
system packaging practices:

- build from source tarballs or release tags,
- install into a staging root,
- let the system package manager own final placement/removal.

This now implies a staging-friendly install flow, for example:

- `silk build install --prefix /usr --destdir <pkgdir>`

so distro packages can stage files without mutating the live filesystem.

System packages should install the canonical package root under a stable Silk
search prefix, while optionally exposing convenience files in ordinary system
locations:

- package root under `/usr/lib/silk/...`
- executables in `/usr/bin`
- headers in `/usr/include/silk/...`
- manpages in `/usr/share/man/...`

The system package manager, not Silk, should own uninstallation in these
workflows.

## Public Surface Rules

To keep packages ergonomic and safe to consume:

- the manifest should explicitly declare the package’s public definition files,
- binary artifacts must name the definition files they pair with,
- private implementation sources should not become part of the import surface
  merely because they are present in the tarball,
- and publication tooling should package only the declared distribution file
  set.

`[package].definitions` is the canonical package-wide public-surface
declaration, with optional per-artifact narrowing via
`[[artifact]].definitions` where needed.

## Authoring Workflow

The intended authoring flow for a reusable package is:

1. Create a package root with `silk.toml`.
2. Keep distributable implementation under `src/`.
3. Keep public prototype/interface modules under `defs/`.
4. Use `[[target]]` to define how artifacts are built.
5. When distributing prebuilt libraries, record them as explicit package
   artifacts with target metadata.
6. Publish the same package root through one or more channels:
   - GitHub release archive,
   - third-party package manager publication managed by the author,
   - distro package source or binary package,
   - or direct vendoring.

## Built-In Tooling

Silk’s built-in package-distribution surface is intentionally small and
channel-agnostic:

- staging-aware install
  - `silk build install --destdir <path>` stages installs under
    `<destdir><prefix>/...`,
- dependency artifact consumption
  - `silk build` and `silk test --package` auto-consume compatible
    dependency `[[artifact]]` entries for packages that expose definitions but
    no implementation sources,
  - current selection is deterministic and package-manager-agnostic:
    object first, then static library, then shared library,
  - ambiguous compatible artifacts currently fail with a diagnostic rather than
    guessing,
- package inspection
  - `silk package inspect` prints resolved package metadata, artifacts,
    dependency constraints, and the current package hash,
- manifest linting
  - `silk package lint` validates that `silk.toml`, `[dist]`, `[[artifact]]`,
    and `[package].definitions` describe a coherent distributable package.

Archive creation and publication are intentionally external concerns. Because
the package root is the canonical unit of distribution, authors may use
ordinary tar/zip tooling, GitHub release assets, npm packaging workflows, or
system-package build scripts directly without needing Silk-specific registry or
archive semantics.

Out of scope for the package model itself:

- automatic upload to every external ecosystem,
- full Debian/RPM/PKGBUILD recipe generation,
- and mandatory online resolution from manifests.

## Resolved Decisions

- Version requirements for non-path dependencies should use a small SemVer range
  string in the dependency spec.
- Package search roots should stay directory-based and deterministic; manifest
  indexes or caches may exist as implementation details, but not as part of the
  package format.
- Installed package artifacts should live inside the canonical package root.
  Mirrored top-level files may exist for compatibility, but package resolution
  should not depend on them.
- Binary artifact compatibility should be expressed with structured artifact
  fields such as `target`, `libc`, `libc_min`, and similar package-owned
  metadata, rather than overloading one manager- or platform-specific string.
- `[package].definitions` should remain the canonical package-wide public
  surface field. Per-artifact `definitions` may narrow that surface when
  needed, but Silk does not currently need a separate `[exports]` table.

## Current Operational Limits

- Dependency artifact auto-consumption is currently implemented for
  `linux/x86_64` outputs.
- Artifact selection is intentionally strict: for a given package, target, and
  output kind, authors must ship one unambiguous compatible artifact. Multiple
  equally compatible artifacts are treated as an authoring error rather than
  being guessed at runtime.
- For `silk test --package`, manifest native inputs that start as C sources must
  currently be precompiled to `.o` files before they are listed in
  `[[target]].inputs`.
