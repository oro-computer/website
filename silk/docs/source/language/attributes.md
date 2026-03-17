# Attributes (`attr(...)`)

Silk supports first-class **attributes** that can annotate declarations and can
also be queried at compile time for conditional compilation.

Attributes come in two forms:

- **Tags**: `attr(one, two, three)`
- **Key/value pairs**: `attr(arch="x86_64", feature="tui")`

Values may be:

- booleans (`true` / `false`)
- integers (numeric literals)
- strings (`"..."` or raw string literals)
- identifiers (treated as a string value, e.g. `abi=c`)

## Implementation status

Status: **Implemented subset + design**.

Implemented in the current compiler subset:

- `attr(...)` as a prefix annotation on declarations and statements.
- `attr(...)` as a compile-time query expression of type `bool`.
- Comparison operators in `attr(...)` items for numeric toolchain keys:
  - examples: `attr(silk_major>=0)`, `attr(silk_minor>=2)`, `attr(silk_patch=0)`
  - and: `attr(silk_abi_major>=0)`, `attr(silk_abi_minor>=2)`, `attr(silk_abi_patch=0)`
  where `<op>` is one of `=`, `<`, `<=`, `>`, `>=` and `<n>` is an integer literal.
- Declaration gating:
  - when an `attr(...)` annotation contains `arch` / `os` / `target` / `feature`,
    the annotated declaration is included only when the key/value constraints
    match the current build target.
- Conditional compilation:
  - `if <cond> { ... } else { ... }` prunes branches at compile time when
    `<cond>` is an attribute-query boolean expression (built from `attr(...)`,
    `!`, `&&`, `||`, and parentheses).
  - The pruned branch is not type-checked and is not lowered/code-generated.
- `attr(abi=c) fn (...) -> ...` in type positions is accepted as a synonym for
  `c_fn (...) -> ...` (C ABI callback pointer types).
- Task scheduling hints on `task` functions:
  - `attr(task=pool)` / `attr(task="pool")` schedules the task on the global
    task pool (see “Task scheduling” below),
  - `attr(task_pool)` is accepted as a tag-form synonym for `attr(task=pool)`.

Not yet fully implemented:

- Objective-C / FFM / WASI-component / other ABI selectors beyond the initial
  `abi=c` support.

## Syntax

### Attribute list

```silk
attr(one, two, debug=false, arch="x86_64", abi=c)
attr(silk_minor>=2, arch="x86_64")
```

Items are comma-separated. A trailing comma is permitted.

### Attribute operators

An attribute item may be either:

- a tag: `attr(one)`, or
- a key/value item: `attr(arch="x86_64")`.

In the current subset, key/value items use one of:

- `=` for string/identifier/bool keys (for example `arch="x86_64"`, `abi=c`),
- `=`, `<`, `<=`, `>`, `>=` for numeric toolchain keys (for example
  `silk_minor>=2`).

### Value forms

Annotation items may carry:

- booleans:
  - `attr(enabled=true)`
  - `attr(experimental=false)`
- integers:
  - `attr(tier=1)`
  - `attr(silk_minor>=2)`
- strings:
  - `attr(owner="runtime")`
  - `attr(feature="renderer=software")`
- identifiers (treated as string values):
  - `attr(abi=c)`
  - `attr(task=pool)`

In practice this gives you two categories of attributes:

- **project metadata** that humans and tooling may read (`owner`, `tier`,
  `unstable`, `internal`, ...), and
- **compiler-recognized keys** such as `arch`, `os`, `target`, `feature`,
  `abi`, `task`, and the toolchain version keys.

### Annotation form (prefix)

Attributes may prefix most declarations:

```silk
attr(one) fn hello () -> int { return 0; }
attr(feature="tui") struct TTY { /* ... */ }
attr(arch="x86_64", os="linux") interface Builder { /* ... */ }
```

Attributes may also prefix statements inside blocks:

```silk
fn main () -> int {
  attr(one, two) let x: int = 1;
  return x;
}
```

Notes:

- Statement-level attributes are metadata only; use `if attr(...) { ... }` for
  compile-time selection inside blocks.

### Query form (expression)

`attr(...)` may be used as a boolean expression:

```silk
if attr(arch="x86_64") {
  // compiled only when the target arch is x86_64
} else {
  // compiled otherwise
}
```

Compound expressions are supported:

```silk
if attr(os="linux") && (attr(arch="x86_64") || attr(arch="wasm32")) {
  // ...
}
```

`attr(...)` queries are compile-time only; they are evaluated by the compiler
and do not exist as runtime calls.

Important distinction:

- annotation-form attributes can carry arbitrary tags/key/value metadata,
- query-form `attr(...)` has built-in compile-time semantics only for the keys
  documented on this page.

## Built-in attribute keys (current subset)

The current compiler subset recognizes the following keys in queries and
conditional compilation contexts:

- `arch`: `"x86_64"`, `"aarch64"`, or `"wasm32"`
- `os`: `"linux"`, `"macos"`, `"ios"`, `"android"`, `"windows"`, `"wasi"`, or `"unknown"`
- `target`:
  - `"linux-x86_64"` or `"linux-aarch64"`
  - `"macos-x86_64"` or `"macos-aarch64"`
  - `"ios-aarch64"`
  - `"android-aarch64"`
  - `"windows-x86_64"` or `"windows-aarch64"`
  - `"wasm32-unknown-unknown"` or `"wasm32-wasi"`
- `feature`: an enabled feature name (see “Features” below)
- Toolchain version keys (numeric; compare against an integer literal using `=`, `<`, `<=`, `>`, `>=`):
  - `silk_major`, `silk_minor`, `silk_patch`
  - `silk_abi_major`, `silk_abi_minor`, `silk_abi_patch`

## User-defined tags and key/value metadata

The compiler accepts user-defined tags and key/value items in annotation form:

```silk
attr(public_api, owner="runtime", tier=1)
fn parse_config () -> int {
  return 0;
}
```

Use these when you want declaration-local metadata for:

- generated docs,
- linting and policy tools,
- internal review or release processes.

In the current subset, these user-defined items are metadata only. They do not
participate in conditional compilation unless they use one of the built-in
semantic keys documented on this page.

## ABI selection (`abi=c`) and `c_fn`

In type positions, `attr(abi=c) fn (...) -> R` is equivalent to `c_fn (...) -> R`.
This is intended for C callback pointer types:

```silk
type InfoCb = attr(abi=c) fn (u64, u64) -> void;
type InfoCb2 = c_fn (u64, u64) -> void; // equivalent
```

## Task scheduling (`task=pool`)

In the current hosted subset, `task fn` execution is implemented on OS threads.
By default, calling a `task fn` spawns a dedicated OS thread for that call.

When a `task fn` (or `async task fn`) is annotated with:

- `attr(task=pool)` (or `attr(task="pool")`), or
- `attr(task_pool)` (tag-form synonym),

the compiler schedules calls to that task on the global **task pool** instead
of spawning a dedicated OS thread per call.

The task pool is:

- created lazily on the first pooled task submission,
- backed by OS worker threads,
- implemented as a queue-based pool with simple work stealing between workers.

### Configuration

On hosted targets, the worker count defaults to the detected CPU count (clamped
to a small fixed maximum).

You may override it by setting:

- `SILK_TASK_POOL_THREADS=<n>`

to request `n` worker threads (values `<= 0` are treated as `1`; non-numeric
values are ignored and the default is used).

## Features

Features are named build-time toggles intended for conditional compilation.

In the current compiler subset, features may be enabled from:

- the CLI (`--feature` / `-F`), and
- package manifests (`silk.toml`):
  - the root package via `[build].features`, and
  - dependency packages via `[dependencies].<dep>.features`.

In `silk.toml`, `[build].features` may be either:

- an array of strings (`["NAME", "NAME=VALUE", ...]`), or
- an inline table (`{ NAME = <bool|int|string>, ... }`).
  - `NAME = true` is equivalent to `NAME` (boolean enabled),
  - any other value is equivalent to `NAME=VALUE`.

Use `attr(feature="name")` in queries and conditional compilation:

```silk
if attr(feature="tui") {
  // code compiled when the build enables the "tui" feature
}
```

### Feature scoping (package builds)

When building a package graph (via `silk build/check/test --package ...`),
features are **scoped per package**:

- `attr(feature="...")` queries observe only the enabled features for the
  current module’s package.
- Root package features do not implicitly affect dependency packages.

Dependency-scoped features are enabled via the root package manifest’s
dependency entries:

```toml
[dependencies]
ui = { path = "../ui", sha256 = "sha256:...", features = ["tui"] }
```

### Feature values

Features may optionally carry values. Use `attr(feature="name=value")` to
require a specific value:

```silk
if attr(feature="MY_FEATURE=123") {
  // compiled only when MY_FEATURE is set to 123
}

if attr(feature=enable_this_feature) {
  // compiled only when enable_this_feature is enabled
}
```

Rules (current subset):

- Feature specs are of the form `NAME` or `NAME=VALUE`.
  - When `VALUE` is omitted, the feature is treated as boolean `true`.
  - When `VALUE` is present:
    - `true` / `false` are parsed as booleans,
    - integer literals (including `0x...` / `0b...` / digit separators) are
      parsed as integers,
    - all other values are treated as strings.
- `attr(feature="NAME")` is `true` when the feature is enabled:
  - boolean features are enabled only when they are `true`,
  - non-boolean-valued features are enabled when present.
- `attr(feature="NAME=VALUE")` is `true` only when the named feature exists and
  its value equals `VALUE` after parsing.

Precedence:

- CLI `--feature` / `-F` entries override manifest-provided feature values of
  the same name.
  - For package builds, unscoped `--feature NAME[=VALUE]` entries target the
    **root package**.
  - You may target a specific package with a namespaced spec:
    `--feature <package>/<spec>` (for example `--feature ui/tui` or
    `--feature ui/tui=false`).
  - Namespaced feature specs are accepted only for package builds (those that
    use `--package`).

- For package builds, multiple manifests in the package graph may request
  features for the same dependency package. If the same feature name is
  assigned multiple different values for a single package, the build fails
  unless a CLI `--feature <package>/<spec>` entry overrides it.

## Real-world patterns

### Platform-specific declarations

Use declaration gating when the implementation should disappear entirely on
non-matching targets:

```silk
attr(os="linux") fn platform_name () -> string {
  return "linux";
}

attr(target="wasm32-wasi") fn platform_name () -> string {
  return "wasi";
}
```

Only the matching declaration is included in the build.

### Feature-valued backend selection

Feature values are a practical way to choose between real implementations:

```silk
fn renderer_name () -> string {
  if attr(feature="renderer=webgpu") {
    return "webgpu";
  } else if attr(feature="renderer=software") {
    return "software";
  } else {
    return "default";
  }
}
```

Examples of useful feature values:

- `renderer=webgpu`
- `tls=boringssl`
- `crypto=fips`
- `ui=tui`

### Toolchain and ABI gating

Use numeric toolchain keys for version-dependent source:

```silk
fn abi_ready () -> int {
  if attr(silk_abi_major>=0) && attr(silk_abi_minor>=2) {
    return 0;
  }
  return 1;
}
```

Use `abi=c` when the type itself must carry a C ABI:

```silk
type LogCallback = attr(abi=c) fn (u64, u64) -> void;
```

### Scheduling blocking work on the task pool

Use task-pool attributes when the function is safe to run on the shared worker
pool:

```silk
attr(task=pool)
task fn hash_chunk (chunk_id: int) -> int {
  return chunk_id;
}
```

This is a good fit for:

- CPU-heavy hashing or compression,
- per-file indexing work,
- bounded batches of blocking OS work.

## Practical feature workflows

### Root package features

```toml
[build]
features = ["tui", "renderer=software", "tls=false"]
```

### Dependency-scoped features

```toml
[dependencies]
ui = { path = "../ui", sha256 = "sha256:...", features = ["tui", "theme=dark"] }
```

### CLI overrides

```bash
silk build --package . \
  --feature tui \
  --feature renderer=software \
  --feature ui/theme=dark
```

This model lets one package compile with `attr(feature="tui")` while another
dependency in the same graph sees a different feature set.
