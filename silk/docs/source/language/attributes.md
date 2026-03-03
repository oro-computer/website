# Attributes (`attr(...)`)

Attributes are first-class compile-time metadata.

You can use them to:

- annotate declarations with `attr(...)`,
- **select code at compile time** with `if attr(...) { ... } else { ... }`,
- and (in type positions) select ABIs for callback types (`attr(abi=c)`).

Attributes are intentionally small and explicit: they are a way to express
“this code only exists for target X” or “this code is only present when feature
Y is enabled”, without requiring runtime environment probes.

## Implementation status (current compiler subset)

Status: **in progress**.

Implemented:

- `attr(...)` as a prefix annotation on declarations and statements.
- `attr(...)` as a compile-time query expression of type `bool`.
- Declaration gating:
  - when an `attr(...)` annotation contains `arch` / `os` / `target` / `feature`,
    the annotated declaration is included only when the key/value constraints
    match the current build target.
- Conditional compilation:
  - `if <cond> { ... } else { ... }` prunes branches at compile time when
    `<cond>` is an attribute-query boolean expression built from:
    `attr(...)`, `!`, `&&`, `||`, and parentheses.
  - The pruned branch is not type-checked and is not lowered/code-generated.
- ABI selection:
  - `attr(abi=c) fn (...) -> ...` in type positions is accepted as a synonym for
    `c_fn (...) -> ...` (C ABI callback pointer types).

Not yet fully implemented:

- Per-dependency feature resolution and namespacing (Cargo-style feature graphs).
- A public feature-configuration mechanism (the current subset evaluates
  `attr(feature="...")` against an empty enabled set).
- ABI selectors beyond the initial `abi=c` support.

## Syntax (one screen)

### Attribute list

```silk
attr(one, two, debug=false, arch="x86_64", abi=c)
```

An attribute list is a comma-separated list of **items**:

- **tags**: `one`, `two` (identifiers)
- **key/value pairs**: `arch="x86_64"`, `debug=false`, `abi=c`

Values may be:

- booleans (`true` / `false`)
- integers (numeric literals)
- strings (`"..."` or raw string literals)
- identifiers (treated as a string value, e.g. `abi=c`)

A trailing comma is permitted.

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

- Statement-level attributes are **metadata only** in the current subset; use
  `if attr(...) { ... }` for compile-time selection inside blocks.

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

## Feature detection and conditional compilation

The most common “feature detection” pattern in Silk is:

- decide at compile time using `if attr(...)`,
- keep a single public API surface,
- and provide a fallback implementation for targets/features that don’t apply.

Two important consequences of compile-time pruning:

- The pruned branch is **not type-checked** (so it may refer to declarations
  that don’t exist on the active target).
- The pruned branch is **not emitted** (no IR, no codegen, no symbols).

<!-- tabs:start Attribute examples -->
### Declaration gating

Use declaration annotations to include/exclude whole declarations from a build:

```silk
import { println } from "std/io";

attr(os="linux") fn platform_name () -> string { return "linux"; }
attr(os="macos") fn platform_name () -> string { return "macos"; }
attr(os="windows") fn platform_name () -> string { return "windows"; }
attr(os="wasi") fn platform_name () -> string { return "wasi"; }
attr(os="unknown") fn platform_name () -> string { return "unknown"; }

fn main () -> int {
  println(platform_name());
  return 0;
}
```

Notes:

- This pattern relies on **declaration gating**: only the declarations whose
  `attr(...)` constraints match the current target are included.
- Keep a single ungated fallback when you want a defined behavior for
  otherwise-unrecognized targets.

### Compile-time pruning with `if attr(...)`

Use `if attr(...)` inside blocks when you want localized target selection:

```silk
import { println } from "std/io";

fn main () -> int {
  if attr(target="wasm32-wasi") {
    println("hello from wasi");
  } else {
    println("hello from a hosted target");
  }
  return 0;
}
```

The pruned branch is not type-checked, so you can safely fence off code that
only makes sense on some targets:

```silk
fn main () -> int {
  if attr(os="windows") {
    // This can mention Windows-only bindings/types.
    let x: WindowsOnlyType = windows_call();
    return 0;
  } else {
    return 0;
  }
}
```

### Feature flags (`attr(feature="...")`)

Features are named build-time toggles intended for conditional compilation:

```silk
import { println } from "std/io";

fn main () -> int {
  if attr(feature="tui") {
    println("tui enabled");
  } else {
    println("tui disabled");
  }
  return 0;
}
```

In the current compiler subset, feature configuration is not yet exposed, so
the enabled feature set is empty and `attr(feature="...")` always evaluates to
`false`. The structure above is still the intended shape for optional code.

### Tooling metadata (tags and custom keys)

Tags and non-built-in keys are available for tooling and future extensions:

```silk
// In the current subset, these do not affect compilation unless you use
// built-in keys like arch/os/target/feature.
attr(internal, since="0.3.0", owner="runtime") fn helper () -> void {
  return;
}
```

Prefer to keep metadata keys short and stable; treat them as part of your
project’s conventions.

### ABI selection (`abi=c`) and `c_fn`

In type positions, `attr(abi=c) fn (...) -> R` is equivalent to
`c_fn (...) -> R`. This is intended for C callback pointer types:

```silk
type InfoCb = attr(abi=c) fn (u64, u64) -> void;
type InfoCb2 = c_fn (u64, u64) -> void; // equivalent
```
<!-- tabs:end -->

## Built-in attribute keys (exhaustive in current subset)

The current compiler subset recognizes the following keys in queries and
conditional compilation contexts:

- `arch`
- `os`
- `target`
- `feature`
and additionally recognizes:

- `abi` (type positions only; see above)

The compiler normalizes the selected target to a canonical set of strings. All
values below are those canonical strings (they match `OS_PLATFORM` / `OS_ARCH`
as documented in `docs/language/target-metadata.md`).

### `arch`

Canonical CPU architecture name string:

- `"x86_64"`
- `"aarch64"`
- `"wasm32"`

### `os`

Canonical platform/OS name string:

- `"linux"`
- `"macos"`
- `"ios"`
- `"android"`
- `"windows"`
- `"wasi"`
- `"unknown"` (used for `wasm32-unknown-unknown`)

### `target`

Canonical target triple string:

- `"linux-x86_64"`
- `"linux-aarch64"`
- `"macos-x86_64"`
- `"macos-aarch64"`
- `"ios-aarch64"`
- `"android-aarch64"`
- `"windows-x86_64"`
- `"windows-aarch64"`
- `"wasm32-unknown-unknown"`
- `"wasm32-wasi"`

### `feature`

An enabled feature name string.

Feature configuration is not exposed in the current subset, so the enabled set
is empty and `attr(feature="...")` always evaluates to `false`.

## Relationship to target/build metadata

Attributes are one piece of the compile-time configuration story.

- For runtime-visible target metadata, see `docs/language/target-metadata.md`
  (`OS_PLATFORM`, `OS_ARCH`, `OS_IS_UNIX`, `OS_IS_POSIX`).
- For runtime-visible build metadata, see `docs/language/build-metadata.md`
  (`BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION`, ...).
