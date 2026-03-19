# Package Manifests (`silk.toml`)

This document specifies Silk’s package manifest format and how the `silk`
compiler consumes it.

Manifests are a *build/package* concept (they are not part of the core language
syntax). The language-level `package` / `import` / `export` semantics remain
defined in `docs/language/packages-imports-exports.md`.

For the broader package authoring/publication/consumption model, including
third-party distribution channels, binary-only packages, and the rationale for
the current manifest shape, see `docs/compiler/package-distribution.md`. This
document describes the current implemented manifest format and current CLI
behavior.

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

Package version string (recommended: Semantic Versioning such as
`MAJOR.MINOR.PATCH`).

When building from a package manifest, the compiler surfaces this value to
runtime code via `std::runtime::build::version()`
(otherwise it defaults to `"0.0.0"`).

When another package uses a dependency `version = "..."` constraint, the
compiler interprets this field as a SemVer string. Reusable packages SHOULD
therefore use SemVer-compatible versions.

Additional channel-agnostic metadata fields are supported under `[package]`:

- `description`
- `license`
- `homepage`
- `repository`
- `documentation`
- `readme`
- `authors`
- `keywords`

These fields are surfaced by `silk package inspect` and preserved in installed
package manifests.

`package.readme` and `package.documentation` may be either:

- ordinary package metadata strings (for example a hosted documentation URL), or
- local package-root-relative file or directory paths.

Local metadata doc paths must stay inside the package root. Absolute paths and
relative paths that escape the package root are rejected.

When a local path is used, `silk man` treats it as part of the package’s
discoverable documentation surface when that package root is selected via
`--package`, nearest-manifest discovery, or package-search-path resolution.

When `silk build install` packages a local `package.readme` or local
`package.documentation` landing page, the installed manifest rewrites that field
to a packaged copy under `share/silk/docs/readme/...` or
`share/silk/docs/documentation/...` inside the installed package root so the
overview/docs aliases remain self-contained after install.

When `package.documentation` points at a static `[[target]] kind = "man"`
source, installed manifests rewrite that field to the installed
`share/man/man<section>/...` path so `silk man docs` / `silk man documentation`
continue to work after `silk build install`.

## Package Documentation Discovery for `silk man`

When `silk man` resolves a package root from `silk.toml`, it may discover
package-authored documentation from that root in addition to source doc
comments. Source-doc queries from `silk man` and `silk doc --man` only consider
the root package’s own modules, not dependency docs in the same manifest graph:

- local `package.readme` paths provide the package overview page,
- local `package.documentation` paths provide a package documentation landing
  page,
- and package man sources are discovered recursively under
  `<root>/docs/man/`, `<root>/man/`, `<root>/share/man/`, and installed
  sectioned roots such as `<root>/share/man/man1/`.

Current conventions:

- Markdown man sources SHOULD be named `<name>.1.md`, `<name>.3.md`, or
  `<name>.7.md`.
- Markdown pages under `docs/man/` or `man/` that omit an explicit section
  suffix default to section 7, which makes package-authored overview/concept
  topics easy to ship without man-specific filenames.
- When `package.documentation` points at a directory, `silk man` looks for a
  landing page such as `README.md`, `readme.md`, `index.md`, or
  `<package>.md`.
- `silk man --list` and `silk man --search` include these package-local pages
  whenever a package root is already in scope.
- Remote `package.readme` / `package.documentation` URLs remain valid metadata;
  `silk man` prints them as references rather than fetching them.

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
  `PREFIX/lib/silk/<package>/...` so that the installed package remains
  importable (for
  example `import my_lib from "my_lib";`) via the system package search root.
- Executable-only and manpage-only packages do not need
  `[package].definitions`; this field matters only when an installed package
  must expose a Silk import surface for library-style targets.

## Distribution Payload (`[dist]`)

Packages may declare the distributable package payload separately from the
module-set source files:

```toml
[dist]
include = ["defs/**/*.slk", "lib/**/*.a", "README.md"]
exclude = ["**/.DS_Store"]
```

Rules:

- Patterns are evaluated against forward-slash (`/`) relative paths rooted at
  the manifest directory.
- Supported glob syntax matches `[sources]`:
  - `*` matches any characters within a single path segment.
  - `**` matches zero or more path segments.
- When `[dist]` is omitted, package integrity hashing falls back to the
  source-oriented `[sources]` file set.
- When `[dist]` is present, package integrity hashing covers:
  - the manifest bytes, and
  - every file selected by `[dist]`.

This section is used by:

- `computePackageSha256String(...)` / dependency `sha256` verification,
- `silk package lint`,
- and installed package manifests emitted by `silk build install`.

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
ui = { path = "../libs/silk-ui", version = "^1.4.0", sha256 = "sha256:0123456789abcdef...", features = ["tui"] }
```

Fields:

- The dependency key (`ui` above) is the package import name used in source
  (`import ui from "ui";`). This MUST match the
  dependency’s own manifest `package.name`.
- `path` (optional): local filesystem path to the dependency package root,
  resolved relative to the importing manifest directory when not absolute.
  When `path` is omitted, the dependency is resolved from the package search
  path (see “Dependency discovery via `SILK_PACKAGE_PATH`” below).
- `version` (optional): SemVer requirement string checked against the
  dependency’s `package.version`.
  Supported forms:
  - exact version: `1.2.3`
  - caret range: `^1.4.0`
  - tilde range: `~1.4.0`
  - comma-separated comparator conjunctions such as `>=1.2.0, <2.0.0`
- `sha256` (optional): integrity hash string.
- `features` (optional): enabled build features for this dependency package.
  - It may be:
    - an array of strings of the form `NAME` or `NAME=VALUE`, or
    - an inline table mapping `NAME = <bool|int|string>`.
      - `NAME = true` is equivalent to `NAME`.
      - otherwise it is equivalent to `NAME=VALUE`.
  - These features populate the enabled feature set queried by
    `attr(feature="...")` within the dependency package’s modules (see
    `docs/language/attributes.md`).
  - When building a package graph (via `--package`), dependency feature specs
    are merged from every manifest in the graph.
    - If multiple manifests assign different values to the same feature name
      for a single package, the build fails unless overridden by a CLI
      `--feature <package>/<spec>` entry.

Dependency resolution + verification:

- When `version` is present, the dependency manifest’s `package.version` must
  exist, parse as SemVer, and satisfy the requirement.
- When `sha256` is present, the compiler verifies the dependency payload hash.

- The `sha256` value must be of the form `sha256:<64 hex digits>` (case-insensitive).
- The compiler verifies it by hashing the dependency package’s contents using a
  deterministic scheme:
  - When `[dist]` is omitted:
    - the hash input starts with the ASCII prefix `silk-package-sha256-v1\0`,
    - then the exact bytes of the dependency’s `silk.toml`, followed by `\0`,
    - then, in sorted order by relative path:
      - the file’s relative path bytes, then `\0`,
      - the file’s bytes, then `\0`,
    - and only files included by that dependency manifest’s `[sources]`
      include/exclude rules are hashed.
  - When `[dist]` is present:
    - the hash input starts with the ASCII prefix `silk-package-sha256-v2\0`,
    - then the exact bytes of the dependency’s `silk.toml`, followed by `\0`,
    - then the sorted `[dist]` payload files using the same
      `relative-path\0bytes\0` scheme.

Current limitations:

- Only local-path dependencies are supported (no remote fetch).
- Dependency features are currently selected only via the importer’s manifest
  (`[dependencies].<dep>.features`) and the CLI. A dependency’s own
  `[build].features` are applied only when that dependency is built as the root
  package.

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

## Distributed Artifacts (`[[artifact]]`)

Packages may declare shipped native artifacts explicitly:

```toml
[[artifact]]
name = "my_lib_static"
kind = "static"
path = "lib/linux-x86_64/libmy_lib.a"
target = "linux-x86_64"
definitions = ["defs/api.slk"]
c_header = "include/my_lib.h"
```

Fields:

- `name` (required): artifact identifier unique within the manifest.
- `kind` (required): one of `executable`, `object`, `static`, `shared`, or
  `man`.
- `path` (required): relative path inside the package root.
- `target` (optional): target triple for the artifact payload.
- `libc` / `libc_min` (optional): structured compatibility metadata for native
  libraries.
- `definitions` (optional): definition files associated with this artifact.
- `c_header` (optional): C header shipped with this artifact.

Additional rules for `kind = "man"`:

- `path` should typically live under `share/man/man1/`, `share/man/man3/`, or
  `share/man/man7/`.
- `target`, `libc`, `libc_min`, `definitions`, and `c_header` are invalid for
  manpage artifacts.

Current uses:

- `silk package inspect` prints declared artifacts,
- `silk package lint` validates that artifact files exist and are covered by
  `[dist]`,
- `silk build` and `silk test --package` auto-consume one compatible artifact
  for imported binary-only/interface-only dependencies (currently on
  `linux/x86_64`, preferring object, then static, then shared payloads),
- and `silk build install` emits installed `[[artifact]]` records for built
  package targets.

Example:

```toml
[dependencies]
my_api = { sha256 = "sha256:0123456789abcdef..." }
```

## Build Targets (`[[target]]`)

A package may declare one or more build targets. Each target produces one
artifact (an executable, an object, a static library, a shared library, a wasm
module, or a manpage).

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

[[target]]
kind = "man"
source = "man/my_app.1"
```

Fields:

- `name` (required for `executable|object|static|shared`; optional for `man`):
  unique target name within the package.
  - When omitted for `kind = "man"`, the compiler synthesizes a stable target
    name during manifest loading:
    - static man sources default to `<page>.<section>` derived from `source`
      (for example `man/my_app.1` -> `my_app.1`,
      `docs/man/my-app.7.md` -> `my-app.7`),
    - source-derived man targets default to the trimmed `query` string.
  - These synthesized names are the names used by `build.default_target`,
    `silk build --package-target <name>`, and installed manifest metadata.
- `kind` (required): one of `executable`, `object`, `static`, `shared`, or
  `man`.
- `entry` (required for `executable|object|static|shared`): path to the entry
  module, relative to the manifest directory.
- `source` (required for static `man` targets): path to a checked-in manpage
  source file, relative to the manifest directory.
  Supported static forms are:
  - roff pages named `name.1`, `name.3`, or `name.7`,
  - Markdown man sources named `name.1.md`, `name.3.md`, or `name.7.md`.
- `query` (required for source-derived `man` targets): documentation query
  rendered through the same source-doc pipeline as `silk doc --man`
  (for example a `@cli` page name or an `@misc` topic).
  - Source-derived package man targets query only the root package’s own
    source modules; dependency sources in the same manifest graph are not part
    of the query corpus.
  Exactly one of `source` or `query` must be set for `kind = "man"`.
- `inputs` (optional): additional non-`.slk` build inputs for this target:
  - entries are paths (relative to the manifest directory when not absolute),
  - entries may also use a toolchain-relative vendored archive reference:
    - `@vendored/<name>.a` — resolves to the vendored static archive under the
      active Silk prefix (for example `@vendored/libmbedtls.a`),
    - this form is supported only for `.a` inputs and only on `linux/x86_64`
      in the current toolchain,
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
  - On `linux/x86_64`, when compiling `.c`/`.h` inputs, `silk` also adds the
    active toolchain’s vendored include directory to the C compiler’s include
    search path, so C sources can include headers like
    `#include <mbedtls/net_sockets.h>` without hardcoding a repo-relative
    `-I.../vendor/include` path.
- `ldflags` (optional): additional link-related arguments for this target.
  Note: `silk` does not invoke a system linker for native codegen; `ldflags`
  are translated into existing manifest/CLI linkage knobs.
  Supported forms:
  - `-Wl,-rpath,<path>` / `-Wl,-rpath=<path>` → adds a `runpath` entry,
  - `-Wl,-soname,<name>` / `-Wl,-soname=<name>` → sets `soname`,
  - `-Wl,--dynamic-linker,<path>` / `-Wl,-dynamic-linker,<path>` / `-Wl,--dynamic-linker=<path>` / `-Wl,-dynamic-linker=<path>` → sets `elf_interp`,
  - `-lfoo` / `-l`, `foo` → adds a `needed` entry:
    - by default, `silk` maps to `needed = ["libfoo.so"]`,
    - when the selected dynamic loader looks like glibc (`ld-linux`), `silk` maps common system libraries
      to their versioned runtime sonames (for example `-lm` → `needed = ["libm.so.6"]`, `-lpthread` → `needed = ["libpthread.so.0"]`),
    - note: some distros ship `libfoo.so` only in `*-dev`
      packages, so prefer `-l:libfoo.so.<ver>` or an explicit `needed = ["libfoo.so.<ver>"]` when targeting
      versioned shared libraries),
  - `-l:libfoo.so.1` → adds `needed = ["libfoo.so.1"]`.
- `output` (optional): output path relative to the manifest directory.
  If omitted, the compiler chooses a default under `build/` based on `name` and
  `kind`:
  - `executable`: `build/<name>` (or `build/<name>.wasm` for wasm targets, or `build/<name>.exe` for Windows targets),
  - `object`: `build/<name>.o`,
  - `static`: `build/lib<name>.a`,
  - `shared`: `build/lib<name>.so` (current hosted baseline is `linux/x86_64`).
  - `man`: `build/share/man/man<section>/<page>.<section>` where `<page>` and
    `<section>` come from the static source filename or the rendered `query`
    result.
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
  - `elf_interp = "/lib64/ld-linux-x86-64.so.2"` (for `linux/x86_64` executable outputs; emitted as `PT_INTERP`; also influences glibc/musl defaults for `ldflags` `-l...` mapping).
    - This field is rejected for non-`linux/x86_64` targets.
  - Note: `needed` entries starting with `libsilk_rt` are rejected; bundled runtime helpers are linked statically by `silk build` when referenced.

Additional rules for `kind = "man"`:

- `name` may be omitted; when omitted, the compiler derives the internal target
  name from `source` or `query` using the rules above.
- `entry`, `inputs`, `cflags`, `ldflags`, `arch`, `target`, `c_header`,
  `needed`, `runpath`, `soname`, and `elf_interp` are invalid.
- Static Markdown sources are rendered to roff at build time.
- Static roff sources are copied into the target output and normalized to the
  filename-derived page name and section.
- `silk build install` installs built man targets into the package root under
  `share/man/man<section>/...` and mirrors them to
  `<prefix>/share/man/man<section>/...`.
- `silk build install` also packages local `package.readme` /
  `package.documentation` landing pages under `share/silk/docs/...` inside the
  package root and rewrites the installed manifest to those packaged paths,
  unless `package.documentation` is rewritten to an installed man target under
  `share/man/...`; in that case no redundant
  `share/silk/docs/documentation/...` copy is installed.
- Ad hoc metadata tables such as `[docs]` remain inert; only `[[target]]`
  entries participate in `silk build` / `silk build install`.

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

`[build]` records package-wide defaults used by single-target contexts and
build-module execution.

```toml
[build]
default_target = "my_app"
build_module = true            # optional opt-in (default: false)
build_module_path = "build.slk" # optional; default "build.slk"
features = ["tui", "MY_FEATURE=123", "enable_this_feature=true"] # optional
# or:
# features = { tui = true, MY_FEATURE = 123, enable_this_feature = true }
```

Rules:

- If `build.default_target` is set, it MUST name an existing `[[target]]`.
- `silk build --package` builds every manifest `[[target]]` by default when
  `--package-target` is omitted.
- `build.default_target` is still used by contexts that need one code-bearing
  target:
  - package-graph entry ordering prefers that target’s `entry`,
  - `silk test --package` uses that target’s `inputs`, `needed`, and `runpath`
    as the manifest link metadata for the test harness.
- For `silk test --package`:
  - `build.default_target` must name a code target (one with `entry = "..."`);
    pointing it at `kind = "man"` is an error,
  - when `build.default_target` is unset, the first declared code target is
    used,
  - when no code targets exist, tests still run from the package source set but
    no manifest link metadata is applied.
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
- `build.features` (optional) enables build features for this package when it
  is selected as the root package for `silk build` / `silk check` / `silk test`.
  - It may be:
    - an array of strings of the form `NAME` or `NAME=VALUE`, or
    - an inline table mapping `NAME = <bool|int|string>`.
      - `NAME = true` is equivalent to `NAME`.
      - otherwise it is equivalent to `NAME=VALUE`.
  - These features populate the enabled feature set queried by `attr(feature="...")`
    (see `docs/language/attributes.md`).
  - CLI `--feature` / `-F` entries override manifest features of the same name.

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
