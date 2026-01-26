# Formal Silk

Formal Silk is Silk’s compile-time formal verification language. It lets you write *machine-checked* specifications next to
ordinary code, and have the compiler prove those specifications using the Z3 SMT solver.

Two properties make this practical:

- **Zero runtime cost.** Verification directives do not exist at runtime; they don’t slow down your program.
- **Opt-in by syntax.** Normal code stays normal. Proofs are required only where you write verification syntax.

The key design choice is **opt-in by syntax**:

- normal code stays normal, and
- proofs are required only when verification syntax is present.

Formal Silk is meant to be used the way you actually write systems code: small, local assertions around the parts that are
easy to get subtly wrong (boundary checks, invariants, protocol rules, and “this must never happen” assumptions).

## The basic pieces

Formal Silk uses a small vocabulary of directives:

- `#require` — preconditions (what must be true before a function runs)
- `#assure` — postconditions (what must be true when a function returns)
- `#assert` — a proof obligation at a specific point in a block
- `#invariant` — a property that must hold before/after loop iterations
- `#variant` — a measure used for termination reasoning (it must decrease)
- `#const` — a compile-time-only binding used inside specifications
- `theory` / `#theory` — reusable proof obligations

You’ll see these used in three places: function boundaries, inside blocks, and around loops.

## Function contracts: `#require` and `#assure`

You can attach preconditions and postconditions to a function:

```silk
#require x >= 0;
#assure result > x;
fn inc (x: int) -> int {
  return x + 1;
}
```

This gives you a mechanically checked contract with zero runtime cost.

### A more realistic example: `clamp`

`clamp` is simple, but it’s exactly the kind of function where off-by-one and boundary mistakes show up:

```silk
#require lo <= hi;
#assure result >= lo;
#assure result <= hi;
fn clamp (x: int, lo: int, hi: int) -> int {
  if x < lo { return lo; }
  if x > hi { return hi; }
  return x;
}
```

The postconditions say what callers actually care about: the result is within range.

## Loop invariants and termination

Formal Silk can express loop invariants (`#invariant`) and termination measures (`#variant`) to prove properties that span
iterations.

Invariants are “always true” properties around the loop. Variants are how you justify termination: the variant must move in
the right direction each iteration (usually decreasing toward a bound).

Example: counting up to a limit while remembering what the original limit was:

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  while i < limit {
    i = i + 1;
  }
  return 0;
}
```

This is a small example, but it illustrates a common pattern: use `#const` to name the “before” value you want to talk
about in specifications.

## Block-local proof obligations

Use `#assert` to create a proof obligation at a specific point in a block:

```silk
fn demo (x: int) -> int {
  #assert x == x;
  return x;
}
```

In practice, `#assert` is most useful for:

- documenting an assumption you want the compiler to enforce (not just a comment)
- breaking a large proof into smaller checkpoints
- expressing a local fact that helps downstream invariants

## Reusable proofs: theories

When you have a property that should hold in many places, you can write it as a `theory` and attach it where needed.

The idea is to keep verification **modular**: small reusable statements instead of one giant proof block.

## Why it’s valuable

Formal verification is most useful where bugs are expensive:

- memory safety boundaries
- cryptographic and security-sensitive logic
- protocol parsers and encoders
- concurrency invariants

Silk’s approach keeps verification lightweight and local: you opt in where it buys you confidence.

## Debugging failed proofs

When a proof fails, the compiler reports a normal diagnostic at the annotation site.

For deeper debugging, run with `--debug` so the verifier can emit additional information and (when available) write an
SMT‑LIB reproduction script you can replay with an external Z3 binary.

The workflow is intentionally pragmatic: when a proof fails, you should be able to iterate the same way you iterate on type
errors — with good diagnostics and small edits.
