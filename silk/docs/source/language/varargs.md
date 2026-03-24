# Varargs (Variable Arguments)

Silk supports declaring functions that accept a variable number of trailing
arguments (“varargs”). This is used heavily by `std::io::print` /
`std::io::println` for formatted output.

## Syntax

Varargs are declared by prefixing the final parameter with `...`:

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  std::io::println(fmt, args);
}
```

Rules:

- A function may declare **at most one** varargs parameter.
- The varargs parameter must be **the final** parameter in the list.
- The varargs parameter must have an explicit **type annotation**.
- Varargs parameters are **not** permitted to be `mut` in the current subset.
- Varargs parameters may not have a default expression (`= ...`) in the current
  subset.
- The same trailing-varargs form may be used in interface method signatures,
  and `impl ... as ...` / `module ... as ...` conformance compares the varargs
  marker as part of the required signature.

## Call Semantics

At call sites:

- All non-varargs parameters are matched positionally as usual.
- Any additional arguments are collected into the varargs parameter.

Example:

```silk
std::io::println("hello {s} answer={d}", "world", 42);
```

Here `"world"` and `42` become varargs elements.

### Forwarding

Because Silk does not yet have a general “spread” operator for calls, the
compiler supports forwarding a varargs pack when you pass a
varargs binding as the final argument.

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  // `args` is forwarded as-is to `println`.
  std::io::println(fmt, args);
}
```

This is primarily intended for building wrappers that preserve the caller’s
argument list without repacking.

## Indexing and Iteration

Varargs packs expose a `len: int` field and support array-style indexing.

```silk
fn first_or_none (...args: string) -> string? {
  if args.len <= 0 {
    return None;
  }
  return Some(args[0]);
}
```

Indexing `args[i]` traps when `i` is out of bounds (`i < 0` or `i >= args.len`),
matching slice/array indexing rules in the current backend subset.

To iterate, use `len` + indexing:

```silk
var i: int = 0;
while i < args.len {
  let v = args[i];
  i = i + 1;
}
```

## Representation

In the current compiler/backend subset, a varargs parameter is lowered as a
fixed-size **pack value** with:

- `len: int` — the number of provided varargs arguments.
- `a0 .. a(N-1)` — storage for up to `N` arguments (implementation-defined,
  currently `N = 32`).

The pack is passed by value using the same “flattened scalar slot” ABI as other
POD structs.

Notes:

- `args[i]` performs bounds checks against `len` and traps on out-of-bounds.
- Directly reading `aK` is not bounds-checked; when `K >= len`, the value is
  unspecified. Prefer `args[i]` unless you are working with the raw
  representation intentionally.
- Calls supplying more than `N` varargs arguments are rejected.

## FFI (C Variadics)

This document is about Silk varargs. C variadic functions declared via `ext`
(`printf`-style `...`) are a separate concern and are **not** implemented yet
in the current subset.
