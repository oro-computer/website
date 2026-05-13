# `std::range`

`std::range` provides a boxed, method-bearing representation of the built-in
`range` primitive.

## Exported API

```silk
module std::range;

export struct Range {
  has_start: bool,
  start: int,
  end: int?,
  inclusive: bool,
}

impl Range {
  public fn full () -> Range;
  public fn from (start: int, end: int) -> Range;
  public fn from_inclusive (start: int, end: int) -> Range;
  public fn from_start (start: int) -> Range;
  public fn to_end (end: int) -> Range;
  public fn to_inclusive_end (end: int) -> Range;
  public fn as_range (self: &Range) -> range;
  public fn is_full (self: &Range) -> bool;
  public fn has_end (self: &Range) -> bool;
  public fn start_or (self: &Range, fallback: int) -> int;
  public fn end_or (self: &Range, fallback: int) -> int;
  public fn is_inclusive (self: &Range) -> bool;
  public fn shift (self: &Range, offset: int) -> Range;
  public fn is_empty_known (self: &Range) -> bool;
  public fn to_string (self: &Range) -> Result(std::strings::String, std::memory::OutOfMemory);
}
```

Implemented interface surface:

- `TrySerialize(std::memory::OutOfMemory)`

## Notes

- `Range.as_range()` emits the built-in primitive so boxed ranges can still be
 used with slicing and other existing primitive consumers.
- The Supported forms is one-way: it builds primitive `range` values from the
 stdlib box, but the language does not yet expose a decomposition path from a
 primitive `range` back into `std::range::Range`.
