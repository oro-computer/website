# `std::interfaces`

`std::interfaces` defines shared std protocol interfaces such as `Drop`,
`Len`, and `Iterator(T)`.

[Canonical doc](../docs/?p=std/interfaces).

## Example: `Iterator(T)` and `next() -> T?`
```silk
import std::interfaces;

struct CounterIter {
  cur: int,
  end: int,
}

impl CounterIter {
  public fn init (end: int) -> CounterIter {
    return { cur: 0, end: end };
  }
}

impl CounterIter as std::interfaces::Iterator(int) {
  public fn next (mut self: &CounterIter) -> int? {
    if self.cur >= self.end {
      return None;
    }
    let v: int = self.cur;
    self.cur = self.cur + 1;
    return Some(v);
  }
}
```

## See also

- [Canonical doc](../docs/?p=std/interfaces)
- `for` iterator iteration: [for loops](?p=language/flow-for)
