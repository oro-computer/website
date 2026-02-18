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

Status: **in progress**.

Implemented in the current compiler subset:

- `attr(...)` as a prefix annotation on declarations and statements.
- `attr(...)` as a compile-time query expression of type `bool`.
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

Not yet fully implemented:

- Per-dependency feature resolution and namespacing (Cargo-style feature graphs).
- A public feature-configuration mechanism (the current subset evaluates
  `attr(feature="...")` against an empty enabled set).
- Objective-C / FFM / WASI-component / other ABI selectors beyond the initial
  `abi=c` support.

## Syntax

### Attribute list

```silk
attr(one, two, debug=false, arch="x86_64", abi=c)
```

Items are comma-separated. A trailing comma is permitted.

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

## Built-in attribute keys (current subset)

The current compiler subset recognizes the following keys in queries and
conditional compilation contexts:

- `arch`: `"x86_64"` or `"wasm32"`
- `os`: `"linux"`, `"wasi"`, or `"unknown"`
- `target`: `"linux-x86_64"`, `"wasm32-unknown-unknown"`, or `"wasm32-wasi"`
- `feature`: an enabled feature name (see “Features” below)

## ABI selection (`abi=c`) and `c_fn`

In type positions, `attr(abi=c) fn (...) -> R` is equivalent to `c_fn (...) -> R`.
This is intended for C callback pointer types:

```silk
type InfoCb = attr(abi=c) fn (u64, u64) -> void;
type InfoCb2 = c_fn (u64, u64) -> void; // equivalent
```

## Features

Features are named build-time toggles intended for conditional compilation.

In the current compiler subset, feature configuration is not yet exposed, so
the enabled feature set is empty and `attr(feature="...")` always evaluates to
`false`.

Use `attr(feature="name")` in queries and conditional compilation:

```silk
if attr(feature="tui") {
  // code compiled when the build enables the "tui" feature
}
```
