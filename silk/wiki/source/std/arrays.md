# `std::arrays`

`std::arrays` defines borrowed views like `Slice(T)` and helpers for working
with fixed arrays and slices.

[Canonical doc](../docs/?p=std/arrays).

## Status

- Implemented subset + design: a usable subset is implemented.
- [Details](../docs/?p=std/arrays)

## Importing

```silk
import std::arrays;
```

## Examples

### Example: `Slice(T)` + `SliceIter(T)`
```silk
import std::arrays;
import std::buffer;

fn main () -> int {
  let mut buf: BufferU64 = BufferU64.init(4);
  buf.push(10);
  buf.push(11);
  buf.push(12);

  let s: std::arrays::Slice(u64) = { ptr: buf.ptr, len: buf.len() };
  let mut it = s.iter();
  let mut sum: u64 = 0;
  while true {
    let v: u64? = it.next();
    if v == None {
      break;
    }
    sum += (v ?? 0 as u64);
  }

  buf.drop();
  if sum != 33 {
    return 1;
  }
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/arrays)
- `for` iteration rules: [for Loop](../docs/?p=language/flow-for)
