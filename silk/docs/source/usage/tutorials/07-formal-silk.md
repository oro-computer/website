# Tutorial 7: Formal Silk in real code

This tutorial shows how Formal Silk fits into ordinary systems code:

- function contracts for API boundaries,
- loop invariants for state that changes over time,
- struct requirements for construction-time guarantees, and
- reusable theories for proof rules you want to apply in more than one place.

Reference pages:

- [Formal Silk](?p=guides/formal-silk)
- [Formal verification reference](?p=language/formal-verification)
- [Struct requirements](?p=language/struct-requirements)

## 1) Guard a public function boundary

Start with a helper whose contract is obvious from the caller’s perspective:

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}

#require start >= 0;
#assure result == start + 2;
fn inc_twice (start: int) -> int {
  return inc(inc(start));
}

fn main () -> int {
  return inc_twice(40) - 42;
}
```

What to notice:

- `#require` describes the caller obligation.
- `#assure` describes the return guarantee.
- Contracted calls compose, so `inc_twice` can build on `inc` directly.

## 2) State loop facts explicitly

Formal Silk is especially useful when a loop mutates state and you want the
compiler to keep track of the intended bounds:

```silk
fn main () -> int {
  let limit: int = 4;
  #const original_limit = limit;

  let mut i: int = 0;
  let mut total: int = 0;

  #invariant i >= 0;
  #invariant i <= original_limit;
  #invariant total >= 0;
  #variant original_limit - i;
  #monovariant i;
  while i < limit {
    total += i;
    i += 1;
  }

  #assert i == original_limit;
  #assert total >= 0;
  return 0;
}
```

Here:

- `#invariant` captures what must stay true across iterations,
- `#variant` gives the decreasing termination measure,
- `#monovariant` states that `i` moves in one direction only.

## 3) Enforce construction-time invariants

Struct requirements let you move “valid shape” rules to the type’s construction
sites:

```silk
#require len >= 0;
struct SliceU8 {
  ptr: u64,
  len: int,
}

#require cap >= len;
struct BufferU8 {
  ptr: u64,
  len: int,
  cap: int,
}

fn main () -> int {
  let view: SliceU8 = SliceU8{ ptr: 0, len: 3 };
  let buf: BufferU8 = BufferU8{ ptr: 0, len: 3, cap: 8 };
  return view.len + buf.cap - 11;
}
```

That keeps the invariant close to the declaration instead of repeating ad-hoc
checks at every constructor call.

## 4) Reuse proof rules with theories

When a property is useful in more than one place, package it as a theory:

```silk
export theory add_zero_right (x: int) {
  #assure (x + 0) == x;
}

#theory add_zero_right(value);
#assure result == value;
fn keep (value: int) -> int {
  return value + 0;
}

fn main () -> int {
  return keep(7) - 7;
}
```

The same pattern works for parser states, protocol counters, table bounds, and
other rules you want to state once and reuse.

## 5) Local assertions inside ordinary code

You do not need a full contract-heavy style everywhere. For many functions, a
single local proof is enough:

```silk
fn main () -> int {
  let width: int = 1920;
  let height: int = 1080;
  #const pixels = width * height;

  let bytes_per_pixel: int = 4;
  let frame_bytes: int = pixels * bytes_per_pixel;
  #assert frame_bytes > 0;

  return 0;
}
```

This is the common “real code” pattern: write normal Silk, then pin down the
one fact that matters.

## Build and check

Save one of the examples above, then run:

```bash
silk check tutorial7_formal.slk
silk build tutorial7_formal.slk -o build/tutorial7_formal
./build/tutorial7_formal
```

When a proof fails, Silk reports a verification diagnostic instead of silently
accepting the program.

## Next

- Reference: [Formal verification](?p=language/formal-verification)
- Reference: [Struct requirements](?p=language/struct-requirements)
- Guide: [Formal Silk](?p=guides/formal-silk)
