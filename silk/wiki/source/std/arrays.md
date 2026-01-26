# `std::arrays`

`std::arrays` defines borrowed views like `Slice(T)` and helpers for working
with fixed arrays and slices.

Canonical doc: `docs/std/arrays.md`.

## Status

- Implemented subset + design: a usable subset is implemented.
- Details: `docs/std/arrays.md` and `STATUS.md`

## Importing

```silk
import std::arrays;
```

## Examples

### Works today: `Slice(T)` + `SliceIter(T)`

```silk
import std::arrays;
import std::buffer;

fn main () -> int {
  let mut buf: BufferU64 = BufferU64.init(4);
  (mut buf).push(10);
  (mut buf).push(11);
  (mut buf).push(12);

  let s: std::arrays::Slice(u64) = { ptr: buf.ptr, len: buf.len() };
  let mut it = s.iter();
  let mut sum: u64 = 0;
  while true {
    let v: u64? = (mut it).next();
    if v == None {
      break;
    }
    sum += (v ?? 0 as u64);
  }

  (mut buf).drop();
  if sum != 33 {
    return 1;
  }
  return 0;
}
```

## See also

- Canonical doc: `docs/std/arrays.md`
- `for` iteration rules: `docs/language/flow-for.md`
