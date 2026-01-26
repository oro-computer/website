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
current implementation supports forwarding a varargs pack when you pass a
varargs binding as the final argument.

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  // `args` is forwarded as-is to `println`.
  std::io::println(fmt, args);
}
```

This is primarily intended for building wrappers that preserve the caller’s
argument list without repacking.

## Representation (Current Compiler Subset)

In the current compiler/backend subset, a varargs parameter is lowered as a
fixed-size **pack value** with:

- `len: int` — the number of provided varargs arguments.
- `a0 .. a(N-1)` — storage for up to `N` arguments (implementation-defined,
  currently `N = 128`).

The pack is passed by value using the same “flattened scalar slot” ABI as other
POD structs.

Notes:

- Accessing `aK` where `K >= len` is a logic error (the value is unspecified).
- Calls supplying more than `N` varargs arguments are rejected.

## FFI (C Variadics)

This document is about Silk varargs. C variadic functions declared via `ext`
(`printf`-style `...`) are a separate concern and are **not** implemented yet
in the current subset.
