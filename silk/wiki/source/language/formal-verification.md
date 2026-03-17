# Formal verification (Formal Silk)

Formal Silk is Silk’s compile-time verification language. It lets you keep
proofs close to ordinary code:

- `#require` / `#assure` for function contracts,
- `#assert` for local proof points,
- `#invariant` / `#variant` / `#monovariant` for loops,
- `theory` / `#theory` for reusable proof bundles.

[Canonical doc](../docs/?p=language/formal-verification).

## When it is useful

Formal Silk pays off most when the bug is subtle and expensive:

- parser and packet bounds checks,
- `len` / `cap` invariants,
- protocol state assumptions,
- monotonic counters and loop progress.

## Example: function contract

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## Example: loop invariant

```silk
fn main () -> int {
  let limit: int = 4;
  let mut i: int = 0;

  #invariant i >= 0;
  #invariant i <= limit;
  #variant limit - i;
  #monovariant i;
  while i < limit {
    i += 1;
  }

  return 0;
}
```

## Example: reusable theory

```silk
export theory bounded_window (offset: int, size: int, total: int) {
  #require offset >= 0;
  #require size >= 0;
  #assure offset + size <= total;
}
```

## See also

- [Canonical doc](../docs/?p=language/formal-verification)
- [Formal Silk guide](../docs/?p=guides/formal-silk)
- [`std::formal`](../docs/?p=std/formal)
