---
layout: "docs"
description: "This document specifies Silk’s package manifest format and how the silk compiler consumes it."
docsCollection: "silk"
section: "compiler"
order: 259
sourcePath: "compiler/package-manifests.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Package Manifests (`silk.toml`)

This document specifies Silk’s package manifest format and how the `silk`
compiler consumes it.

Manifests are a *build/package* concept (they are not part of the core language
syntax). The language-level `package` / `import` / `export` semantics remain
defined in [packages imports exports](/silk/docs/language/packages-imports-exports/).

For the broader package authoring/publication/consumption model, including
third-party distribution channels, binary-only packages, and the rationale for
the current manifest shape, see [package distribution](/silk/docs/compiler/package-distribution/). This
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

## Source Formatting (`[format]`)

`silk.toml` is the canonical home for project formatting policy. Every field is
optional. Omitted fields inherit the selected `style`; with no `[format]` table,
the effective configuration is the `silk` style.

```toml
[format]
style = "silk"
enabled = true

indent_style = "space"
indent_width = 2
line_width = 100
line_ending = "preserve"
final_newline = "always"
trim_trailing_whitespace = true

organize_imports = true
sort_import_names = true
named_import_multiline_threshold = 3
split_statements = true
multiline_condition_brace = "next-line"
blank_line_after_block = true
blank_line_after_multiline_expression = true
align_silkdoc = true

format_check = "error"
line_width_check = "off"
trailing_whitespace_check = "off"
final_newline_check = "off"
deny_warnings = false
max_warnings = 0
```

The settings are grouped by purpose below. Unknown keys, wrong value types,
out-of-range integers, and unsupported enum values are manifest errors. This is
intentional: a misspelled team policy must not silently fall back to a default.

### Style and indentation

- `style = "silk" | "compact"` selects defaults before the remaining explicit
 fields are applied. `silk` is the canonical repository style. `compact` uses
 the same syntax normalization but defaults both post-brace blank-line fields
 to `false` and raises `named_import_multiline_threshold` to `6`.
- `enabled = <bool>` enables all formatter rewrites. When `false`, `silk format`
 leaves bytes unchanged, while explicitly enabled checks such as
 `line_width_check` can still report policy violations.
- `indent_style = "space" | "tab"` chooses indentation units.
- `indent_width = <int>` is in `1..16`. It is the number of spaces per nesting
 level and the visual tab width used by the line-width check. When
 `indent_style = "tab"`, one tab is emitted per nesting level.
- `line_width = <int>` is in `40..1000`. It is a policy ceiling used by
 `line_width_check`; the formatter does not arbitrarily reflow expressions or
 prose merely to satisfy the ceiling.

### File layout

- `line_ending = "preserve" | "lf" | "crlf"` controls emitted newlines.
 `preserve` detects the first existing newline and defaults to LF for a
 single-line file. Newlines inside protected multiline strings and ordinary
 block-comment bodies remain verbatim.
- `final_newline = "always" | "preserve" | "never"` controls the final line
 ending of a non-empty file. `always` emits exactly one, `never` removes all
 terminal line endings, and `preserve` retains whether the input ended in a
 line ending. An empty file remains empty and satisfies either explicit
 policy.
- `trim_trailing_whitespace = <bool>` removes spaces and tabs immediately before
 line endings on formatter-owned lines. Protected multiline strings and
 ordinary block-comment bodies remain verbatim.

### Structural layout

- `organize_imports = <bool>` enables canonical top-of-file import ordering and
 std/package/relative grouping. Comment-bearing header regions remain in
 source order even when enabled.
- `sort_import_names = <bool>` alphabetizes names inside named imports when the
 import header can be organized safely.
- `named_import_multiline_threshold = <int>` is in `0..255`. A named import with
 more names than this value becomes one name per line. `0` disables this
 count-based expansion.
- `split_statements = <bool>` places top-level and block-level statements after
 semicolons on separate lines. Semicolons inside parentheses and brackets are
 never treated as statement boundaries.
- `multiline_condition_brace = "next-line" | "same-line" | "preserve"`
 controls the opening brace of a multiline `if` / `else if` header.
- `blank_line_after_block = <bool>` inserts one empty line between a standalone
 block-closing brace and a following construct. `} else {` and expression
 continuations remain attached.
- `blank_line_after_multiline_expression = <bool>` applies that separation to a
 semicolon-terminated multiline brace expression such as an assigned [`match`](/silk/wiki/language/flow-match/)
 or aggregate value.
- `align_silkdoc = <bool>` aligns the outer margin of standalone multiline
 `/** ... */` comments to structural indentation without reflowing their text.
 Ordinary block comments remain verbatim.

### Check policy

The four `*_check` settings accept `"off"`, `"warn"`, or `"error"`, following
the severity model used by configurable linters:

- `format_check` reports whether formatter output differs from the input.
- `line_width_check` reports source lines wider than `line_width` visual
 columns. Tabs advance to the next `indent_width` tab stop; each valid UTF-8
 scalar counts as one column.
- `trailing_whitespace_check` reports spaces or tabs before a line ending.
- `final_newline_check` reports disagreement with `final_newline`; it is inert
 when that setting is `"preserve"`.

Checks run only with `silk format --check`. An `error` produces a non-zero exit
status. A `warn` is reported but exits successfully unless
`deny_warnings = true` or the number of warnings exceeds `max_warnings`.
`max_warnings = 0` disables the warning-count ceiling; positive values fail when
the warning count is greater than the configured value. The count spans every
input in the invocation governed by the same resolved manifest (or the same
explicit/built-in policy); unrelated project manifests keep independent
budgets.

This separation lets a team adopt a new policy as `warn`, inspect it locally
and in CI, and promote it to `error` without changing the formatter algorithm.

### Discovery and precedence

For each source file, `silk format` and Silk LSP formatting perform two
independent ancestor searches: one for the nearest `silk.toml` and one for the
nearest `.silk/format.toml`. The manifest supplies the shared package policy;
the `.silk/format.toml` file is an optional partial developer/user overlay.
The resolution order from highest to lowest precedence is:

1. repeated CLI `--set key=value` overrides,
2. an explicit `--config <path/to/silk.toml>`, which disables ancestor
 discovery,
3. explicitly listed fields in the nearest `.silk/format.toml`,
4. the nearest `silk.toml` `[format]` table,
5. built-in `silk` style defaults.

Within the CLI override layer, `style` is resolved first and the remaining
scalar overrides are then applied, regardless of argument order. Thus
`--set indent_width=4 --set style=compact` and the reversed order resolve to
the same configuration.

`--no-config` skips both manifest and local-overlay discovery. `--print-config
<file>` prints the fully merged table, including inherited values and defaults,
and performs no rewrite. Project configuration wins over LSP client indentation
hints so save-time and CI formatting remain identical.

The `.silk/format.toml` overlay accepts the same `[format]` keys. It may contain
only the fields a developer wants to change; all omitted fields continue to
come from the nearest manifest or built-in defaults. Its ancestor search is
independent of the manifest search, so a project-local overlay can refine a
manifest above it and a home-level `.silk/format.toml` can refine a project
manifest below it. Only the nearest overlay applies. Teams may check this file
in when the extra layer is intentional, but its primary ergonomic use is as a
personal or development-only file that may be listed in `.gitignore`.
Configuration discovery reads the file directly, so ignoring it in version
control does not disable the overlay.

An overlay `style` selects that preset before the overlay's other explicit
fields are applied. Preset-managed defaults therefore change together, while
unrelated manifest fields remain inherited. For compatibility with the former
standalone parser, `.silk/format.toml` may omit the `[format]` header and place
formatter keys at the root; `--print-config` always prints the canonical table
form. An explicit `--config` is self-contained and is not combined with a
discovered local overlay.

The configuration model deliberately combines ideas proven by
[clang-format](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)
(style defaults plus explicit overrides),
[ESLint](https://eslint.org/docs/latest/use/configure/rules) (per-check
severities), and [Oxc](https://oxc.rs/docs/guide/usage/linter/config.html)
(project discovery, CLI precedence, and resolved-config inspection), while
keeping one TOML source of truth for Silk packages.

## Code-Quality Checks (`[check]`)

Code-quality rules are separate from `[format]` because they analyze program
structure rather than source layout. They run after successful parsing and type
checking in `silk check` and are also published by `silk-lsp`.

```toml
[check]
deny_warnings = false
max_warnings = 0

[check.rules.cyclomatic_complexity]
severity = "warn"
max = 20
variant = "classic"
```

- `[check].deny_warnings = <bool>` makes any rule warning fail `silk check`.
- `[check].max_warnings = <int>` is in `0..65535`; `0` disables the ceiling and
 a positive value fails when the warning count exceeds it. Warnings are
 counted across every checked source governed by the same resolved manifest;
 unrelated manifests keep independent budgets.
- Every rule has `severity = "off" | "warn" | "error"`. `off` disables both
 analysis and reporting, `warn` reports without failing by itself, and `error`
 reports and fails.

Unknown `[check]` keys, rule names, and rule options are manifest errors. Rule
diagnostics use stable `L...` codes whose severity is determined by
configuration rather than baked into the code name.

### `cyclomatic_complexity`

The cyclomatic-complexity rule limits the number of linearly independent paths
through each named function, method, anonymous function, and test body. The
term follows the graph-theoretic definition of
[cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity),
adapted below to Silk's concrete runtime decision points.

- `severity` defaults to `"off"`.
- `max` is in `1..65535` and defaults to `20`.
- `variant = "classic" | "modified"` defaults to `"classic"`.

Every analyzed body begins at complexity `1`. Silk adds one for each runtime
decision point in that body:

- `if`, `if let`, `let ... else`, [`while`](/silk/wiki/language/flow-while/), `while let`, `for`, C-style `for`,
 [`loop`](/silk/wiki/language/flow-loop/), `async loop`, and `task loop`;
- every additional short-circuit `&&` clause in an `if let` / `while let`
 chain;
- short-circuit `&&`, `||`, and `??` expressions, optional field access `?.`,
 error propagation `?`, and `if` expressions;
- a parameter default, because the call may either supply or omit that value;
- and [`match`](/silk/wiki/language/flow-match/) alternatives.

The refutable pattern filter in `for let <pattern> in <iterable>` adds one
decision in addition to the loop decision. A typed match binder such as
`value: SomeType` is selective and therefore contributes in classic mode.

For `variant = "classic"`, each non-catch-all [`match`](/silk/wiki/language/flow-match/) arm adds one. Wildcard and
untyped whole-value statement binder arms are catch-all arms and do not add
another path. For
`variant = "modified"`, each [`match`](/silk/wiki/language/flow-match/) expression or statement adds exactly one,
regardless of arm count. Nested anonymous functions are measured independently
and do not contribute their internal decisions to the enclosing body.

The rule emits `L5001` at the body name (or anonymous-function/test token),
states the measured and allowed values, and suggests extracting decisions or
raising the explicit project threshold. A body is reported only when its value
is strictly greater than `max`.

The default and classic/modified distinction intentionally align with the
[ESLint complexity rule](https://eslint.org/docs/latest/rules/complexity) and
[Oxc implementation](https://oxc.rs/docs/guide/usage/linter/rules/eslint/complexity),
adapted to Silk control-flow constructs.

The reusable report schema, evidence model, ownership rules, category taxonomy,
and mathematical invariants are specified in
[complexity analysis](/silk/docs/compiler/complexity-analysis/).

## Build Modules (`build.slk`)

A package root directory MAY also contain a build module:

- `build.slk`

When a build module is enabled (via the CLI or `[build].build_module = true`),
the compiler compiles and runs the
module and parses the manifest it emits in this format (used in place of
reading `silk.toml` for the root package).

See [build scripts](/silk/docs/compiler/build-scripts/).

## Package Metadata (`[package]`)

Minimal manifest shape:

```toml
[package]
name = "my_app"
version = "0.1.0"
```

### `package.name` (required)

The package name used for package imports (for example `import ui;` or
`import ui from ui;`) and as
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
runtime code via [`std::runtime::build::version()`](/silk/docs/std/runtime-build/)
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
 - when a package expects downstream Formal Silk consumers to verify imported
 calls or import reusable theories without the implementation sources, the
 relevant exported theories and exported function/method contracts SHOULD be
 mirrored in these definition files too.
 See [packages imports exports](/silk/docs/language/packages-imports-exports/) (“Prototype exports”).
- The compiler does not treat definition files specially during ordinary
 builds; this field exists so tooling can locate an explicit “API surface”
 without scanning arbitrary source files.
- `silk build install` uses this list when installing libraries into
 `PREFIX/lib/silk/<package>/...` so that the installed package remains
 importable (for example `import my_lib;`) via the system package search root.
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
- installed package manifests emitted by `silk build install`,
- and package-graph loading / package inspection when installed packages expose
 Formal Silk bundles under `share/silk/formal/...`.

Installed manifests also include compiler-emitted Formal Silk bundle files under
`share/silk/formal/<artifact-relative-path>/...` when the built artifact carries
exported Formal Silk surface.

## Source Layout (`[sources]`: [`include`](https://github.com/oro-computer/silk/tree/master/include) / `exclude`)

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
- If [`include`](https://github.com/oro-computer/silk/tree/master/include) is omitted, the default is to include all `**/*.slk` under the
 manifest directory.
- `exclude` patterns always remove files, even if they match an [`include`](https://github.com/oro-computer/silk/tree/master/include).
- When building a target, the target’s `entry` file MUST be included after
 applying [`include`](https://github.com/oro-computer/silk/tree/master/include)/`exclude` (or the build fails).

## Dependencies (`[dependencies]`)

Dependencies are a table mapping dependency import names to dependency specs:

```toml
[dependencies]
ui = { path = "../libs/silk-ui", version = "^1.4.0", sha256 = "sha256:0123456789abcdef...", features = ["tui"] }
my.dep.b = { version = "^0.1.0" }
```

Fields:

- The dependency key (`ui` above) is a local dependency import root used by
 quoted POSIX module specifiers. An exact root import such as
 `import ui from "ui";` resolves to the dependency's default source module
 ([`src/lib.slk`](https://github.com/oro-computer/silk/blob/master/src/lib.slk)) or, for a binary-only dependency, to its single definition
 file. Subpath imports such as `import form from "ui/form";` resolve under the
 dependency's source-module directory. The key MUST be a Silk identifier or
 dot-separated identifier path and MUST NOT contain `::` or `/`.
- Dotted dependency keys provide package-style namespacing for dependency roots:
 `my.dep.b` maps to quoted dependency paths rooted at `"my/dep/b"` and to a
 search-path candidate directory named `my/dep/b`.
- The dependency key does not need to match the dependency's own manifest
 `package.name`. Quoted imports use the local dependency key; unquoted
 package-path imports such as `import ui from vendor::ui;` use the dependency
 manifest's `package.name`.
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
 - Feature names start with a letter or `_` and may contain letters, digits,
 `_`, and `-`.
 - These features populate the enabled feature set queried by
 `attr(feature="...")` within the dependency package’s modules (see
 [attributes](/silk/docs/language/attributes/)).
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

Limitations:

- Only local-path dependencies are supported (no remote fetch).
- Dependency features are currently selected only via the importer’s manifest
 (`[dependencies].<dep>.features`) and the CLI. A dependency’s own
 `[build].features` are applied only when that dependency is built as the root
 package.

## Dependency discovery via contextual package roots and `SILK_PACKAGE_PATH`

When a dependency entry omits `path`, the compiler resolves it by searching a
PATH-like list of package roots.

Rules:

- During package-graph loading, search roots are contextual to the importing
 package:
 - relative entries from `SILK_PACKAGE_PATH` are resolved from the importing
 package root and then from each parent package root up to the graph root,
 - when `SILK_PACKAGE_PATH` is not set, `packages/` is searched using that same
 importer-to-graph-root walk.
 This means a dependency manifest can declare its own pathless dependencies
 and find packages in `packages/` next to the dependency, or in `packages/`
 directories between that dependency and the root package being built.
- Absolute entries in `SILK_PACKAGE_PATH` are searched as written. Relative
 entries also retain the historical current-working-directory fallback after
 the contextual importer roots.
- When `SILK_PACKAGE_PATH` is not set, the compiler also uses these install/user
 roots after contextual `packages/` roots and the historical `./packages`
 fallback:
 - `../share/silk/packages` relative to the `silk` executable (installed layout),
 - `$HOME/.local/share/silk/packages` when it exists (user-local installs).
- Finally, the compiler appends a system library root at `PREFIX/lib/silk`
 (default `PREFIX=/usr/local`) as the last search path entry when it exists.
- For a dependency key named `my_api`, each root directory contributes the
 candidate package root `<root>/my_api`.
- For a dotted dependency key named `my.dep.b`, dots are path separators and
 each root directory contributes the candidate package root:
 - `<root>/my/dep/b`
 - and the manifest is `<candidate>/silk.toml`.
- The compiler searches roots in order and uses the first candidate that exists.
- The discovered manifest's `package.name` may be namespaced and may differ from
 the dependency key. The dependency is still subject to the `version` and
 `sha256` verification rules above.
- Explicit dependency `path` entries remain resolved relative to the importing
 manifest directory, so nested dependency manifests may use `path = "../peer"`
 or omit `path` and rely on contextual package roots.

## Worked Dependency Mapping Example

This layout demonstrates the four dependency shapes that are expected to work
together:

```text
workspace/
  app/
    silk.toml
    src/main.slk
  libs/
    logger/
      silk.toml
      src/lib.slk
    local-math/
      silk.toml
      src/lib.slk
  packages/
    my/dep/a/
      silk.toml
      src/lib.slk
    my/dep/b/
      silk.toml
      defs/api.slk
      lib/linux-x86_64/libdep_b.a
  libs/logger/packages/
    log_backend/
      silk.toml
      src/lib.slk
```

The root package declares explicit path dependencies and package-search
dependencies in the same `[dependencies]` table:

```toml
# workspace/app/silk.toml
[package]
name = "app"
version = "0.1.0"

[sources]
include = ["src/**/*.slk"]

[dependencies]
logger = { path = "../libs/logger", version = "^0.1.0" }
local.math = { path = "../libs/local-math", version = "0.3.0" }
my.dep.a = { version = "^1.2.0" }
my.dep.b = { version = "^2.0.0" }

[[target]]
name = "app"
kind = "executable"
entry = "src/main.slk"
```

The meaning of each dependency key is:

- `logger` is a path-based dependency rooted at `../libs/logger`. Quoted
 dependency module imports use the key (`"logger"` for [`src/lib.slk`](https://github.com/oro-computer/silk/blob/master/src/lib.slk), or a
 subpath such as `"logger/api"`), while unquoted package imports use the
 dependency package's own `package.name`.
- `local.math` is also path-based. Its quoted dependency root is
 `"local/math"` because dots in dependency keys map to slashes in quoted
 module paths.
- `my.dep.a` has no `path`, so the package search path is used. With
 `SILK_PACKAGE_PATH=../packages`, the package root is
 `../packages/my/dep/a`.
- `my.dep.b` also has no `path`, so the package root is
 `../packages/my/dep/b`. This example is binary-only: it ships definitions and
 a compatible native archive instead of implementation sources.
- If `logger` declares `log_backend = { version = "^0.1.0" }`, that nested
 pathless dependency is resolved from `workspace/libs/logger/packages/` before
 the search walks upward toward `workspace/app` and then falls back to the
 configured global/install roots.

The path dependency may expose a package namespace that differs from the local
dependency key:

```toml
# workspace/libs/logger/silk.toml
[package]
name = "oro::logger"
version = "0.1.2"

[sources]
include = ["src/**/*.slk"]
```

```silk
// workspace/libs/logger/src/lib.slk
package oro::logger;

export fn info () -> int {
  return 1;
}
```

The dotted path dependency maps quoted `"local/math"` imports to its source
root:

```toml
# workspace/libs/local-math/silk.toml
[package]
name = "local::math"
version = "0.3.0"

[sources]
include = ["src/**/*.slk"]
```

```silk
// workspace/libs/local-math/src/lib.slk
package local::math;

export fn add (a: int, b: int) -> int {
  return a + b;
}
```

The package-search dependency is stored under the package root path. Its
manifest path is discovered from the dependency key:

```toml
# workspace/packages/my/dep/a/silk.toml
[package]
name = "my::dep::a"
version = "1.2.3"

[sources]
include = ["src/**/*.slk"]
```

```silk
// workspace/packages/my/dep/a/src/lib.slk
package my::dep::a;

export fn transform (value: int) -> int {
  return value + 10;
}
```

The binary-only dependency ships a definition file plus a native archive:

```toml
# workspace/packages/my/dep/b/silk.toml
[package]
name = "my::dep::b"
version = "2.0.1"
definitions = ["defs/api.slk"]

[sources]
include = ["defs/**/*.slk"]

[dist]
include = ["defs/**/*.slk", "lib/linux-x86_64/*.a"]

[[artifact]]
name = "dep_b_static"
kind = "static"
path = "lib/linux-x86_64/libdep_b.a"
target = "linux-x86_64"
definitions = ["defs/api.slk"]
```

```silk
// workspace/packages/my/dep/b/defs/api.slk
package my::dep::b;

export fn some_function () -> int;
```

The consuming source can mix quoted dependency-rooted imports and unquoted
package-namespace imports:

```silk
// workspace/app/src/main.slk
import log_file from "logger";
import log_pkg from oro::logger;
import { add } from "local/math";
import my::dep::a::transform;
import my::dep::b::some_function;
import { some_function as some_function_from_defs } from "my/dep/b";

fn main () -> int {
  return log_file::info()
    + log_pkg::info()
    + add(20, 1)
    + transform(10)
    + some_function()
    + some_function_from_defs();
}
```

Important resolution rules shown by this example:

- Quoted strings use POSIX-style dependency paths and MUST NOT contain `::`.
- An exact quoted dependency-key import such as `"logger"` or `"local/math"`
 resolves to that dependency's root module ([`src/lib.slk`](https://github.com/oro-computer/silk/blob/master/src/lib.slk)) even when the
 dependency manifest declares a different `package.name`.
- Unquoted package paths use `::` and resolve by the package graph's
 `package.name` values.
- Dotted dependency keys map to slash prefixes for quoted imports:
 `local.math` -> `"local/math"`, `my.dep.b` -> `"my/dep/b"`.
- The longest dependency key wins. If both `my` and `my.dep.b` are declared,
 `"my/dep/b"` resolves through `my.dep.b`, while `"my/other"` can still
 resolve through `my` when that key exists.
- A pathless dependency is resolved from the package search path only; it is
 not fetched remotely.
- `version` and `sha256` checks apply to the resolved dependency manifest, not
 to the local dependency key.
- A binary-only dependency root can satisfy unquoted package-symbol imports
 through its definition file and auto-link a compatible native artifact. When
 the package has one definition file and no default source module, an exact
 quoted dependency-root import such as `"my/dep/b"` can bind named imports from
 that definition file.
- Compiler and LSP module graphs resolve that exact quoted dependency-root
 import to the same definition-file identity. This applies to named imports
 and default/namespace imports, including dotted dependency keys matched
 through their slash-separated spelling.

A checked-in runnable companion for these rules lives at
[`examples/projects/cove/`](https://github.com/oro-computer/silk/tree/master/examples/projects/cove/). It is a static HTTP file server that
uses an explicit local `path` dependency for its document-root abstraction and a
pathless `access_log` dependency resolved from the root package's default
`packages/` directory. The docroot dependency owns a target-gated
`[[native]]` C helper for POSIX `realpath(3)` containment checks on
`linux-x86_64` and `macos-aarch64`; the root package owns a target-gated native
socket helper that detects idle browser preconnects and bounds request reads on
the same hosted POSIX example targets.

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
 libraries. Supported `libc` values are `glibc`/`gnu` and `musl`; this is used
 when selecting artifacts for Linux targets such as `linux-x86_64` and
 `linux-x86_64-musl`.
- `definitions` (optional): definition files associated with this artifact.
- `c_header` (optional): C header shipped with this artifact.

Additional rules for `kind = "man"`:

- `path` should typically live under `share/man/man1/`, `share/man/man3/`, or
 `share/man/man7/`.
- `target`, `libc`, `libc_min`, `definitions`, and `c_header` are invalid for
 manpage artifacts.

Current uses:

- `silk package inspect` prints declared artifacts and any installed Formal
 Silk bundles attached to those artifacts,
- `silk package lint` validates that artifact files exist and are covered by
 `[dist]`,
- `silk build` and `silk test --package` auto-consume one compatible artifact
 for imported binary-only/interface-only dependencies (currently on
 `linux/x86_64` glibc or musl, preferring object, then static, then shared
 payloads),
- and `silk build install` emits installed `[[artifact]]` records for built
 package targets.

Example:

```toml
[dependencies]
my_api = { sha256 = "sha256:0123456789abcdef..." }
```

## Package Native Requirements (`[[native]]`)

Packages may declare native code and link requirements that should be applied
when that package participates in a build:

```toml
[[native]]
target = "linux-x86_64"
inputs = ["native/portable.c", "lib/linux-x86_64/libhelper.a"]
cflags = ["-Inative/include"]
ldflags = ["-lm"]
runpath = ["$ORIGIN/../lib/linux-x86_64"]
```

Fields:

- `target` (optional): target triple that gates this native requirement. When
 omitted, the requirement applies to every target that can consume the listed
 native inputs. When present, the requirement applies only when the active
 compiler target exactly matches the triple.
- `inputs` (optional): native input paths using the same file-kind rules as
 `[[target]].inputs` (`.c`, `.h`, supported `.m`, `.o`, `.a`, `.so`, and
 versioned `.so.*`; `@builtin/<name>.a` is also accepted).
- `cflags` (optional): native compiler arguments used for `.c` / `.h` /
 supported `.m` inputs from this requirement. Relative `-I` and `-isystem`
 paths are resolved relative to the owning package root.
- `ldflags` (optional): linker arguments using the same supported forms as
 `[[target]].ldflags`. Relative `-L` paths are resolved relative to the owning
 package root.
- `needed` (optional): dynamic-library sonames to add to the consuming link.
- `runpath` (optional): runtime search-path entries to add to the consuming
 executable or shared-library link.

Rules:

- At least one of `inputs`, `cflags`, `ldflags`, `needed`, or `runpath` must be
 present.
- Matching root-package `[[native]]` entries are merged into `silk build
 --package` and `silk test --package` for the selected code target.
- Matching dependency-package `[[native]]` entries are merged when the imported
 dependency package is present in the loaded module set. This is the preferred
 manifest surface for source or hybrid dependencies whose Silk implementation
 calls package-owned native helpers through `ext`.
- `[[artifact]]` remains the distribution surface for prebuilt package outputs.
 Binary-only/interface-only dependencies should continue to expose native
 payloads as `[[artifact]]` entries paired with definition files.
- `[[target]].inputs` remains available for native files that belong only to a
 specific artifact recipe. Prefer `[[native]]` for package-level native code
 that dependencies should carry with them.
- `silk package lint` validates declared native input files and `[dist]`
 coverage for non-`@builtin/...` inputs.

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
 - for package-level native code that should travel with a source/hybrid
 dependency, prefer `[[native]]`; `inputs` is for files specific to this one
 build target,
 - entries are paths (relative to the manifest directory when not absolute),
 - entries may also use a toolchain-relative built-in archive reference:
 - `@builtin/<name>.a` — resolves to the built-in static archive under the
 active Silk prefix (for example `@builtin/libmbedtls.a`),
 - this form is supported only for `.a` inputs and only on supported native
 hosts (`linux/x86_64`, `macos/aarch64`) in the current toolchain,
 - explicit `@builtin/...` entries remain supported when a package wants to
 pin a specific built-in archive input, but common built-in dependency
 families are also auto-linked for executable/shared targets:
 - `libsodium`, `mbedTLS`, and `libssh2` are auto-linked by the `builtin`
 security provider on supported native hosts (`linux/x86_64`,
 `macos/aarch64`) when the Silk module set imports [`std::crypto`](/silk/docs/std/crypto/) /
 [`std::tls`](/silk/docs/std/tls/) / [`std::ssh`](/silk/docs/std/ssh/) / [`std::ssh2`](/silk/docs/std/ssh2/), or when native `.c` / `.h` /
 `.m` / `.o` / `.a` inputs reference their symbol families,
 - `libsqlite3` is auto-linked on `linux/x86_64` when the Silk module set
 imports [`std::sqlite`](/silk/docs/std/sqlite/), or when native `.c` / `.h` / `.m` / `.o` / `.a` inputs
 reference `sqlite3_*` symbols,
 - each entry MUST end with one of:
 - `.c` — compiled via the native compiler for the active target and linked
 as an object,
 - `.m` — compiled as Objective-C for supported Apple host-backed Mach-O
 targets and linked as an object,
 - `.h` — treated as a C build input:
 - if a sibling `.c` file exists next to the header, Silk compiles that
 `.c` file and links the resulting object,
 - otherwise, if a sibling `.m` file exists next to the header, Silk
 compiles that Objective-C file and links the resulting object,
 - otherwise Silk falls back to compiling the header itself as a C
 translation unit (passed as `-x c`) and links the resulting object,
 - `.o` — linked as an object (and included in static archives),
 - `.a` — linked as a static archive,
 - `.so` / `*.so.<ver>` — treated as a dynamic dependency (equivalent to
 adding a `needed` entry for the library’s basename),
 - `.slk` entries are rejected (use `[sources]` instead),
 - note: non-`.slk` inputs are supported for `linux/x86_64` native targets
 and for `macos-aarch64` plus iOS device/simulator executable/object/static/shared outputs on
 Apple Silicon macOS hosts (same limitation as `silk build` CLI inputs).
 - note: Objective-C `.m` inputs are supported only for `macos-aarch64`,
 `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64` on Apple Silicon macOS hosts; supported
 executable/shared outputs that include `.m` inputs link the Objective-C
 runtime automatically.
- `cflags` (optional): additional native compiler arguments used when compiling
 any `.c`/`.h`/`.m` inputs for this target (from `inputs` and/or CLI native
 inputs when building a single target).
 - entries are single `cc` arguments (no shell splitting),
 - include paths passed via `-I<rel>` / `-I`, `<rel>` and
 `-isystem<rel>` / `-isystem`, `<rel>` are resolved relative to the
 manifest directory.
 - On `linux/x86_64`, when compiling `.c`/`.h` inputs, `silk` also adds the
 active toolchain’s built-in include directory to the native compiler’s
 include search path, so C sources can include headers like
 `#include <mbedtls/net_sockets.h>` without hardcoding a repo-relative
 `-I.../vendor/include` path.
- `ldflags` (optional): additional backend linker arguments for this target.
 Platform-linker backends can pass supported arguments through directly.
 Internal backends translate the forms they can represent into existing
 manifest/CLI linkage state and reject unsupported payloads.
 Supported forms:
 - `-L<rel>` / `-L`, `<rel>` → adds a library search path; relative paths are
 resolved relative to the manifest directory,
 - `-Wl,-rpath,<path>` / `-Wl,-rpath=<path>` → adds a `runpath` entry,
 - `-Wl,-soname,<name>` / `-Wl,-soname=<name>` → sets `soname`,
 - `-Wl,--dynamic-linker,<path>` / `-Wl,-dynamic-linker,<path>` / `-Wl,--dynamic-linker=<path>` / `-Wl,-dynamic-linker=<path>` → sets `elf_interp`,
 - `-lfoo` / `-l`, `foo` → links with a library name:
 - on `linux/x86_64`, `-L` paths are searched first; a found `.so` adds a
 `needed` entry by basename, and a found `.a` is linked as a static
 archive,
 - if no matching `-L` library is found, `silk` maps to
 `needed = ["libfoo.so"]`,
 - when the selected dynamic loader looks like glibc (`ld-linux`), `silk` maps common system libraries
 to their versioned runtime sonames (for example `-lm` → `needed = ["libm.so.6"]`, `-lpthread` → `needed = ["libpthread.so.0"]`),
 - when the selected dynamic loader looks like musl (`ld-musl`), `silk` maps
 musl's libc component libraries (`-lc`, `-lm`, `-lpthread`, `-ldl`,
 `-lrt`, `-lutil`, `-lresolv`, `-lcrypt`, `-lxnet`) to
 `needed = ["libc.so"]`,
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
- iOS app bundle fields (optional; only valid for `kind = executable`):
 - `ios_app_bundle = true` tells `silk build --package` to materialize an
 iOS `.app` directory next to the executable output for
 `ios-aarch64`, `ios-simulator-aarch64`, or `ios-simulator-x86_64`
 targets.
 - `ios_info_plist = "Info.plist"` copies a package-root-relative
 `Info.plist` into the bundle. If omitted, `ios_bundle_identifier` is
 required and Silk writes a small generated plist.
 - `ios_bundle_identifier = "com.example.app"` and
 `ios_bundle_name = "ExampleApp"` provide metadata for the generated plist.
 `ios_bundle_name` defaults to the executable basename.
 - `ios_codesign = "ad-hoc"` signs the app bundle with an ad-hoc identity on
 macOS after the executable and `Info.plist` are copied. This is the default
 when `ios_app_bundle = true`; use `ios_codesign = "none"` to leave the
 bundle unsigned.
 - The executable output path remains the `output` field. The app bundle path
 is `<output>.app`, and the executable is copied into that bundle under its
 basename.
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
 iOS app-bundle fields, `needed`, `runpath`, `soname`, and `elf_interp` are
 invalid.
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
security_provider = "auto"     # optional: auto, platform, or builtin
build_module = true            # optional opt-in (default: false)
build_module_path = "build.slk" # optional; default "build.slk"
features = ["tui", "MY_FEATURE=123", "enable_this_feature=true"] # optional
# or:
# features = { tui = true, MY_FEATURE = 123, enable_this_feature = true }
```

Rules:

- If `build.default_target` is set, it MUST name an existing `[[target]]`.
- `build.security_provider` (optional) selects the package default for
 security-sensitive stdlib primitives and auto-linking. Accepted values are:
 - `auto` — Apple targets use platform-backed APIs first and fall back to
 built-in archives for std APIs that do not yet have an Apple platform
 mapping; other targets use the built-in provider,
 - `platform` — Apple targets use Apple Security-backed [`std::crypto`](/silk/docs/std/crypto/)
 core/random helpers and Apple framework linkage, and reject fallback-only
 std/native security APIs,
 - `builtin` — use the toolchain-built libsodium, mbedTLS, and libssh2 static
 archives.
 CLI `--security-provider` wins over this field, and
 `SILK_SECURITY_PROVIDER` wins when the CLI flag is absent.
- `silk build --package` builds every manifest `[[target]]` by default when
 `--package-target` is omitted.
- `build.default_target` is still used by contexts that need one code-bearing
 target:
 - package-graph entry ordering prefers that target’s `entry`,
 - `silk test --package` uses that target’s `inputs`, `cflags`, `ldflags`,
 `needed`, and `runpath`, plus matching package `[[native]]` entries, as the
 manifest native/link metadata for the test harness.
- For `silk test --package`:
 - `build.default_target` must name a code target (one with `entry = "..."`);
 pointing it at `kind = "man"` is an error,
 - when `build.default_target` is unset, the first declared code target is
 used,
 - raw manifest native source inputs (`.c`, `.h`, and supported `.m`) are
 compiled to temporary objects and linked with the generated test harness,
 using that target’s `cflags`,
 - built-in provider native-input auto-linking for libsodium, mbedTLS, and
 libssh2, plus built-in SQLite auto-linking, follows the same
 supported-target rules as package builds,
 - when no code targets exist, tests still run from the package source set but
 no manifest link metadata is applied.
- `build.build_module` (optional; default `false`) enables build module
 execution for manifest-driven package commands:
 - when `true`, the build module runs for:
 - `silk build --package`,
 - `silk check --package`,
 - `silk test --package`,
 - `silk build install`,
 - and `silk build uninstall`,
 without requiring CLI build-module opt-in.
- `build.build_module_path` (optional) specifies the default build module path
 used when a build module is executed and the CLI does not provide
 `--build-module-path`.
 - If the path is relative, it is resolved relative to `<package_root>`.
 - If omitted, the default is `<package_root>/build.slk`.
 - Note: setting `build_module_path` does not enable build module execution by
 itself; use `build_module = true` or the CLI.
- When a build module is executed:
 - the manifest it emits replaces the root manifest for the remainder of the
 build (see [build scripts](/silk/docs/compiler/build-scripts/)),
 - the emitted manifest’s `[build].build_module` / `[build].build_module_path`
 values are ignored for the current invocation to prevent recursive build
 module execution,
 - `silk check --package` and `silk test --package` currently invoke the build
 module with the action string `"build"` for compatibility with existing
 build modules,
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
 - Feature names start with a letter or `_` and may contain letters, digits,
 `_`, and `-`.
 - These features populate the enabled feature set queried by `attr(feature="...")`
 (see [attributes](/silk/docs/language/attributes/)).
 - CLI `--feature` / `-F` entries override manifest features of the same name.
 - The effective feature selection participates in package target cache keys.
 Changing a selected feature invalidates artifacts whose checked or emitted
 declarations may differ.
 - Target cache keys also include the complete resolved local file-import
 closure, including modules reached from a declared source but not listed
 separately in `[sources]`.

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
