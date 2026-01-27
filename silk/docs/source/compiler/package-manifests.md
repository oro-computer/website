# Package Manifests (`silk.toml`)

This document specifies Silk’s package manifest format and how the `silk`
compiler consumes it.

Manifests are a *build/package* concept (they are not part of the core language
syntax). The language-level `package` / `import` / `export` semantics remain
defined in `docs/language/packages-imports-exports.md`.

## Manifest Discovery

A package root directory MAY contain a manifest file with one of these names:

- `silk.toml`

Rules:

- When a manifest directory is provided (CLI via `--package <dir>`), the
  compiler looks for `silk.toml` in that directory.
- When a manifest path is explicitly provided (CLI via `--package <path>`), the
  compiler reads exactly that file (and it MUST be named `silk.toml`).

Manifests are encoded as TOML v1.0.

## Diagnostics

When a manifest is malformed (invalid TOML syntax or an invalid manifest shape),
the compiler reports a diagnostic with file, line, and column information and a
caret snippet pointing at the offending token when possible.

## Build Scripts (`build.silk`)

A package root directory MAY also contain a build script:

- `build.silk`

When a build script is enabled via the CLI, the compiler compiles and runs the
script and treats its stdout as a TOML manifest in this format (used in place
of reading `silk.toml` for the root package).

See `docs/compiler/build-scripts.md`.

## Package Metadata (`[package]`)

Minimal manifest shape:

```toml
[package]
name = "my_app"
version = "0.1.0"
```

### `package.name` (required)

The package name used for package imports (e.g. `import ui from "ui";`) and as
the default package name for modules that omit an explicit `package ...;`
declaration.

In the current implementation, `name` MUST be a valid Silk package path:

- one or more identifiers separated by `::`
- each identifier matches `[A-Za-z_][A-Za-z0-9_]*`

Examples:

- `ui`
- `my_app`
- `my_app::core`

### `package.version` (optional)

Free-form version string (commonly `MAJOR.MINOR.PATCH`).

In the current implementation, when building from a package manifest, the
compiler surfaces this value to runtime code via `std::runtime::build::version()`
(otherwise it defaults to `"0.0.0"`).

Additional optional metadata fields MAY be present under `[package]` (for
example `description`, `license`, `authors`, `repository`), but the current
compiler only uses `name` and `version`.

## Source Layout (`[sources]`: `include` / `exclude`)

Packages may specify which `.slk` files belong to the package with glob patterns:

```toml
[sources]
include = ["src/**/*.slk"]
exclude = ["src/experimental/**"]
```

Rules:

- Patterns are evaluated against forward-slash (`/`) relative paths rooted at
  the manifest directory.
- Supported glob syntax (current implementation):
  - `*` matches any characters within a single path segment.
  - `**` matches zero or more path segments.
- If `include` is omitted, the default is to include all `**/*.slk` under the
  manifest directory.
- `exclude` patterns always remove files, even if they match an `include`.
- When building a target, the target’s `entry` file MUST be included after
  applying `include`/`exclude` (or the build fails).

## Dependencies (`[dependencies]`)

Dependencies are a table mapping dependency import names to dependency specs:

```toml
[dependencies]
ui = { path = "../libs/silk-ui", sha256 = "sha256:0123456789abcdef..." }
```

Fields:

- The dependency key (`ui` above) is the package import name used in source
  (`import ui from "ui";`). In the current implementation, this MUST match the
  dependency’s own manifest `package.name`.
- `path` (optional): local filesystem path to the dependency package root,
  resolved relative to the importing manifest directory when not absolute.
  When `path` is omitted, the dependency is resolved from the package search
  path (see “Dependency discovery via `SILK_PACKAGE_PATH`” below).
- `sha256` (required): integrity hash string.

Dependency `sha256` verification:

- The `sha256` value must be of the form `sha256:<64 hex digits>` (case-insensitive).
- The compiler verifies it by hashing the dependency package’s contents using a
  deterministic scheme:
  - The hash input starts with the ASCII prefix `silk-package-sha256-v1\0`.
  - Then the exact bytes of the dependency’s `silk.toml`, followed by `\0`.
  - Then, in sorted (lexicographic) order by relative path:
    - the file’s relative path bytes, then `\0`,
    - the file’s bytes, then `\0`.
  - Only files included by that dependency manifest’s `[sources]` include/exclude
    rules are hashed.

Current limitations:

- Only local-path dependencies are supported (no remote fetch).

## Dependency discovery via `SILK_PACKAGE_PATH`

When a dependency entry omits `path`, the compiler resolves it by searching a
PATH-like list of package roots provided by `SILK_PACKAGE_PATH`.

Rules:

- `SILK_PACKAGE_PATH` is a list of directories separated by `:` (POSIX).
- For a dependency named `my_api::core`, each root directory contributes a
  candidate package root:
  - `<root>/my_api/core` (where `::` maps to `/`)
  - and the manifest is `<candidate>/silk.toml`.
- The compiler searches roots in order and uses the first candidate that exists.
- The discovered manifest MUST declare `package.name` exactly matching the
  dependency key, and the dependency is still subject to the `sha256`
  verification rules above.

Example:

```toml
[dependencies]
my_api = { sha256 = "sha256:0123456789abcdef..." }
```

## Build Targets (`[[target]]`)

A package may declare one or more build targets. Each target produces one
artifact (an executable, an object, a static library, a shared library, or a
wasm module).

Example:

```toml
[[target]]
name = "my_app"
kind = "executable"
entry = "src/main.slk"
output = "build/my_app"

[[target]]
name = "my_lib"
kind = "static"
entry = "src/lib.slk"
output = "build/libmy_lib.a"
c_header = "build/my_lib.h"
```

Fields:

- `name` (required): unique target name within the package.
- `kind` (required): one of `executable`, `object`, `static`, `shared`.
- `entry` (required): path to the entry module, relative to the manifest
  directory.
- `output` (optional): output path relative to the manifest directory.
  If omitted, the compiler chooses a default under `build/` based on `name` and
  `kind`:
  - `executable`: `build/<name>` (or `build/<name>.wasm` for wasm targets),
  - `object`: `build/<name>.o`,
  - `static`: `build/lib<name>.a`,
  - `shared`: `build/lib<name>.so` (current hosted baseline is `linux/x86_64`).
- `arch` / `target` (optional): default codegen target for this artifact.
  - `arch` is one of `x86_64`, `wasm32`, `wasm32-wasi` (same as `silk build --arch`).
  - `target` is a target triple string accepted by `silk build --target`
    (for example `linux-x86_64`, `wasm32-wasi`).
  - `arch` and `target` MUST NOT both be set for the same target.
- `c_header` (optional): emit a C header when building this target (only valid
  for `kind = object|static|shared`).
- Dynamic linkage fields (optional; passed through to the backend):
  - `needed = ["libc.so.6", "..."]` (repeatable `DT_NEEDED` entries),
  - `runpath = ["$ORIGIN", "..."]` (joined with `:` for `DT_RUNPATH`),
  - `soname = "libfoo.so"` (for shared libraries).
  - Note: `needed` entries starting with `libsilk_rt` are rejected; bundled runtime helpers are linked statically by `silk build` when referenced.

## Default Target (`[build]`)

When a package defines multiple `[[target]]` entries, `silk build --package`
needs to know which one to build.

```toml
[build]
default_target = "my_app"
```

Rules:

- If `build.default_target` is set, it MUST name an existing `[[target]]`.
- If `build.default_target` is not set:
  - if exactly one `[[target]]` exists, it is the default,
  - otherwise, `silk build --package` requires an explicit target selection
    flag (see `docs/compiler/cli-silk.md`).

## Interaction With `package` Declarations

- If a module contains an explicit `package name;` declaration, that name is
  authoritative.
- If a module omits `package`, the compiler assigns it to the manifest
  `package.name` (for files under that package root).

This defaulting behavior exists to support small projects that do not want to
repeat `package ...;` in every file.

## Reserved Fields

The manifest reserves additional fields for future build integration:

- provenance / integrity metadata (`repo`, richer dependency sources),
- native build configuration (`sources`, `link`, `compile`),
- embedded targets / budgets.
