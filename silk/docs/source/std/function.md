# `std::function`

`std::function` provides a boxed holder for first-class Silk function values.

## Exported API

```silk
module std::function;

export struct Function(F) {
  value: F,
}

impl Function(F) {
  public fn new (value: F) -> Function(F);
  public fn get (self: &Function(F)) -> F;
  public fn into_inner (self: Function(F)) -> F;
}
```

## Notes

- `Function(F)` does not change the callable representation. It is a holder
 box around an already-typed function value.
- This is useful for storing function values in containers or attaching a
 nominal stdlib type to callback-bearing APIs.
- The Supported forms intentionally keeps this surface minimal. Call invocation
 still happens through the returned function value.
