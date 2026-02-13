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

## Build Modules (`build.slk`)

A package root directory MAY also contain a build module:

- `build.slk`

When a build module is enabled (via the CLI or `[build].build_module = true`),
the compiler compiles and runs the
module and parses the manifest it emits in this format (used in place of
reading `silk.toml` for the root package).

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

`name` MUST be a valid Silk package path:

- one or more identifiers separated by `::`
- each identifier matches `[A-Za-z_][A-Za-z0-9_]*`

Examples:

- `ui`
- `my_app`
- `my_app::core`

### `package.version` (optional)

Free-form version string (commonly `MAJOR.MINOR.PATCH`).

When building from a package manifest, the compiler surfaces this value to
runtime code via `std::runtime::build::version()`
(otherwise it defaults to `"0.0.0"`).

Additional optional metadata fields MAY be present under `[package]` (for
example `description`, `license`, `authors`, `repository`), but the current
compiler only uses `name` and `version`.

### `package.definitions` (optional)

Optional list of *definition files* (header-style prototype modules) for this
package:

```toml
[package]
name = "my_lib"
definitions = ["defs/api.slk"]
```

Rules:

- Each entry MUST be a path to a `.slk` (or `.silk`) file, relative to the
  manifest directory.
- Definition files SHOULD consist of:
  - exported type declarations, and
  - declaration-only exported function prototypes (`export fn name(...) -> T;`)
    that describe the public API surface.
  See `docs/language/packages-imports-exports.md` (“Prototype exports”).
- The compiler does not treat definition files specially during ordinary
  builds; this field exists so tooling can locate an explicit “API surface”
  without scanning arbitrary source files.
- `silk build install` uses this list when installing libraries into
  `PREFIX/lib/silk` so that the installed package remains importable (for
  example `import my_lib from "my_lib";`) via the system package search root.

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
- Supported glob syntax:
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
  (`import ui from "ui";`). This MUST match the
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
PATH-like list of package roots.

Rules:

- The primary search path is `SILK_PACKAGE_PATH` when set (a list of
  directories separated by `:` on POSIX).
- When `SILK_PACKAGE_PATH` is not set, the compiler uses a small default set:
  - `./packages` when it exists (development convenience),
  - `../share/silk/packages` relative to the `silk` executable (installed layout),
  - `$HOME/.local/share/silk/packages` when it exists (user-local installs).
- Finally, the compiler appends a system library root at `PREFIX/lib/silk`
  (default `PREFIX=/usr/local`) as the last search path entry when it exists.
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
- `inputs` (optional): additional non-`.slk` build inputs for this target:
  - entries are paths (relative to the manifest directory when not absolute),
  - each entry MUST end with one of:
    - `.c` — compiled via the host C compiler and linked as an object,
    - `.h` — compiled via the host C compiler as a C translation unit (passed
      as `-x c`) and linked as an object,
    - `.o` — linked as an object (and included in static archives),
    - `.a` — linked as a static archive,
    - `.so` / `*.so.<ver>` — treated as a dynamic dependency (equivalent to
      adding a `needed` entry for the library’s basename),
  - `.slk` entries are rejected (use `[sources]` instead),
  - note: non-`.slk` inputs are currently supported only for `linux/x86_64`
    native targets (same limitation as `silk build` CLI inputs).
- `cflags` (optional): additional C compiler arguments used when compiling any
  `.c`/`.h` inputs for this target (from `inputs` and/or CLI native inputs when
  building a single target).
  - entries are single `cc` arguments (no shell splitting),
  - include paths passed via `-I<rel>` or `-I`, `<rel>` are resolved relative
    to the manifest directory.
- `ldflags` (optional): additional link-related arguments for this target.
  Note: `silk` does not invoke a system linker for native codegen; `ldflags`
  are translated into existing manifest/CLI linkage knobs.
  Supported forms:
  - `-Wl,-rpath,<path>` / `-Wl,-rpath=<path>` → adds a `runpath` entry,
  - `-Wl,-soname,<name>` / `-Wl,-soname=<name>` → sets `soname`,
  - `-lfoo` / `-l`, `foo` → adds a `needed` entry:
    - for common glibc-provided system libraries, `silk` maps to the versioned runtime soname
      (for example `-lm` → `needed = ["libm.so.6"]`, `-lpthread` → `needed = ["libpthread.so.0"]`),
    - otherwise, `silk` maps to `needed = ["libfoo.so"]` (note: some distros ship `libfoo.so` only in `*-dev`
      packages, so prefer `-l:libfoo.so.<ver>` or an explicit `needed = ["libfoo.so.<ver>"]` when targeting
      versioned shared libraries),
  - `-l:libfoo.so.1` → adds `needed = ["libfoo.so.1"]`.
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

Example:

```toml
[[target]]
name = "app"
kind = "executable"
entry = "src/main.slk"
inputs = ["src/logger.c", "vendor/libextra.a", "build/helpers.o", "lib/libfoo.so"]
cflags = ["-Isrc/include"]
runpath = ["$ORIGIN"]
```

## Build Defaults (`[build]`)

When a package defines multiple `[[target]]` entries, `silk build --package`
needs to know which one to build.

```toml
[build]
default_target = "my_app"
build_module = true            # optional opt-in (default: false)
build_module_path = "build.slk" # optional; default "build.slk"
```

Rules:

- If `build.default_target` is set, it MUST name an existing `[[target]]`.
- If `build.default_target` is not set:
  - if exactly one `[[target]]` exists, it is the default,
  - otherwise, `silk build --package` requires an explicit target selection
    flag (see `docs/compiler/cli-silk.md`).
- `build.build_module` (optional; default `false`) enables build module
  execution for package builds:
  - when `true`, the build module runs for `silk build --package` (and
    `silk build install` / `silk build uninstall`) without requiring
    `--build-module` on the CLI.
- `build.build_module_path` (optional) specifies the default build module path
  used when a build module is executed and the CLI does not provide
  `--build-module-path`.
  - If the path is relative, it is resolved relative to `<package_root>`.
  - If omitted, the default is `<package_root>/build.slk`.
  - Note: setting `build_module_path` does not enable build module execution by
    itself; use `build_module = true` or the CLI.
- When a build module is executed:
  - the manifest it emits replaces the root manifest for the remainder of the
    build (see `docs/compiler/build-scripts.md`),
  - the emitted manifest’s `[build].build_module` / `[build].build_module_path`
    values are ignored for the current invocation to prevent recursive build
    module execution,
  - CLI overrides:
    - `--build-module-path <path>` wins (and implies build module execution),
    - otherwise `--build-module` wins.

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
- richer native build configuration (additional include path kinds, defines,
  link search paths, platform selection),
- embedded targets / budgets.
