# `std::boolean`

`std::boolean` provides a no-allocation boxed wrapper around the built-in
`bool` primitive for method-oriented APIs.

## Exported API

```silk
module std::boolean;

export enum ParseErrorKind {
  InvalidInput,
}

export error ParseFailed {
  code: int,
}

export struct Boolean {
  value: bool,
}

impl Boolean {
  public fn from_bool (value: bool) -> Boolean;
  public fn parse (value: string) -> Result(Boolean, ParseFailed);
  public fn as_bool (self: &Boolean) -> bool;
  public fn is_true (self: &Boolean) -> bool;
  public fn is_false (self: &Boolean) -> bool;
  public fn not (self: &Boolean) -> Boolean;
}
```

## Notes

- `Boolean` is an inline wrapper. It does not allocate.
- Parsing accepts only the exact lower-case spellings `"true"` and `"false"`.
