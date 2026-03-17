# Refinement types (removed)

Silk no longer uses a separate refinement-type surface.

Use:

- `#require` / `#assure` for function contracts,
- `#require` on `struct` declarations for type-level invariants,
- `#assert` for local proof points,
- const parameters for compile-time shape.

## Example

```silk
#require len >= 0;
#require cap >= len;
struct BufferState {
  ptr: u64,
  len: int,
  cap: int,
}
```

## See also

- [Formal verification](../docs/?p=language/formal-verification)
- [Struct requirements](../docs/?p=language/struct-requirements)
- [Dependent types](../docs/?p=language/dependent-types)
