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

## Notes



Implemented in Silk currently:

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
 - `attr(task=thread)` / `attr(task="thread")` forces a dedicated OS thread
 for each call instead of the default task-pool schedule.

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

In the Supported forms, key/value items use one of:

- `=` for string/identifier/bool keys (for example `arch="x86_64"`, `abi=c`),
- `=`, `<`, `<=`, `>`, `>=` for numeric toolchain keys (for example
 `silk_minor>=2`).

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

## Built-in attribute keys

Silk currently recognizes the following keys in queries and
conditional compilation contexts:

- `arch`: `"x86_64"`, `"aarch64"`, or `"wasm32"`
 - The ARM64 family accepts `"aarch64"` as the canonical spelling, plus the aliases `"arm64"` and `"aarch"` in any letter case.
- `os`: `"linux"`, `"macos"`, `"ios"`, `"android"`, `"windows"`, `"wasi"`, or `"unknown"`
 - `os` comparisons accept those names in any letter case.
- `target`:
 - `"linux-x86_64"`, `"linux-x86_64-musl"`, `"linux-aarch64"`, or
 `"linux-aarch64-musl"`
 - `"macos-x86_64"` or `"macos-aarch64"`
 - `"ios-aarch64"`, `"ios-simulator-aarch64"`, or `"ios-simulator-x86_64"`
 - `"android-aarch64"`
 - `"windows-x86_64"` or `"windows-aarch64"`
 - `"wasm32-unknown-unknown"` or `"wasm32-wasi"`
- `feature`: an enabled feature name (see “Features” below)
- Toolchain version keys (numeric; compare against an integer literal using `=`, `<`, `<=`, `>`, `>=`):
 - `silk_major`, `silk_minor`, `silk_patch`
 - `silk_abi_major`, `silk_abi_minor`, `silk_abi_patch`

## ABI selection (`abi=c`) and `c_fn`

In type positions, `attr(abi=c) fn (...) -> R` is equivalent to `c_fn (...) -> R`.
This is intended for C callback pointer types:

```silk
type InfoCb = attr(abi=c) fn (u64, u64) -> void;
type InfoCb2 = c_fn (u64, u64) -> void; // equivalent
```

## Task scheduling (`task=pool` / `task=thread`)

In the current hosted subset, `task fn` execution is implemented on OS threads.
By default, calling a `task fn` schedules that task on the global task pool.

When a `task fn` (or `async task fn`) is annotated with:

- `attr(task=pool)` (or `attr(task="pool")`), or
- `attr(task_pool)` (tag-form synonym),

the compiler keeps the default global **task pool** schedule for that task.

When a `task fn` (or `async task fn`) is annotated with:

- `attr(task=thread)` (or `attr(task="thread")`),

the compiler spawns a dedicated OS thread for each call instead of using the
global task pool.

The task pool is:

- created lazily on the first pooled task submission,
- backed by OS worker threads,
- implemented as a shared queue-based worker pool (see
 `src/silk_rt_task_pool.c`).

### Configuration

On hosted targets, the worker count defaults to the detected CPU count (clamped
to a small fixed maximum).

You may override it by setting:

- `SILK_TASK_POOL_THREADS=<n>`

to request `n` worker threads (values `<= 0` are treated as `1`; non-numeric
values are ignored and the default is used).

You may also bound queued work by setting:

- `SILK_TASK_POOL_MAX_QUEUED=<n>`

to request at most `n` queued tasks beyond the worker set (`0` or missing means
unbounded). When the queue is full, non-worker submitters block until space is
available; worker threads fall back to inline execution for that submission so
the pool does not deadlock itself.

## Features

Features are named build-time toggles intended for conditional compilation.

In Silk currently, features may be enabled from:

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

Rules (Supported forms):

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
