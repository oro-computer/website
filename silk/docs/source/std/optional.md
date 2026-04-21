# `std::optional`

`Optional(T)` / `T?` is a language type, not a stdlib-defined enum. The
compiler already provides the method-oriented combinator surface on optional
values. `std::optional` exists as a stdlib namespace of free-function
companions for those built-in methods.

## Exported API

```silk
module std::optional;

export fn is_some (T; value: T?) -> bool;
export fn is_none (T; value: T?) -> bool;
export fn map (T, U; value: T?, f: fn(T) -> U) -> U?;
export fn and_then (T, U; value: T?, f: fn(T) -> U?) -> U?;
export fn or_else (T; value: T?, f: fn() -> T?) -> T?;
export fn unwrap_or (T; value: T?, fallback: T) -> T;
export fn unwrap_or_else (T; value: T?, f: fn() -> T) -> T;
```

## Notes

- These functions forward to the built-in optional methods.
- The canonical semantics remain specified in [optional](?p=language/optional).
- In Silk currently, higher-order generic calls may require
 explicit compile-time type arguments at the call site, for example
 `std::optional::map(int, int; value, f)`.
