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

If you want a step-by-step walkthrough, start with
[`Tutorial 7: Formal Silk in real code`](?p=usage/tutorials/07-formal-silk).

## Where directives live

Formal Silk directives attach to **specific syntactic sites**:

- Before `fn`: `#require`, `#assure`, `#theory`
- Before `struct`: `#require` (struct requirements)
- Before `while`: `#invariant`, `#variant`, `#monovariant`
- Inside blocks: `#const`, `#assert`, `#theory` (inline declaration + use)
- At top level: `theory` declarations (optionally `export`)

## The basic pieces

Formal Silk uses a small vocabulary of directives:

- `#require` — preconditions (what must be true before a function runs)
- `#assure` — postconditions (what must be true when a function returns)
- `#assert` — a proof obligation at a specific point in a block
- `#invariant` — a property that must hold before/after loop iterations
- `#variant` — a measure used for termination reasoning (it must decrease)
- `#monovariant` — a measure that must be monotonic (non-decreasing or non-increasing)
- `#const` — a compile-time-only binding used inside specifications
- `theory` / `#theory` — reusable proof obligations

You’ll see these used in three places: function boundaries, inside blocks, and around loops.

## Syntax (one screen)

This shows the *full* Formal Silk syntax surface in one place:

```silk
// Function contracts:
#require <bool-expr>;
#assure <bool-expr>;     // may reference `result`
#theory SomeTheory(args);
fn f (params) -> T { return <expr>; }

// Struct requirements:
#require <bool-expr>;    // may reference fields by name
struct S { field: int }

// Loop specifications:
#invariant <bool-expr>;
#variant <int-expr>;
#monovariant <int-expr>;
while <bool-expr> { ... }

// Block-local proofs + declarations:
#const name = <expr>;
#assert <bool-expr>;
#theory local_name(params) { ... }  // inline theory declaration
#theory local_name(args);           // theory use (asserts obligations here)

// Reusable proof bundles:
export theory SomeTheory (params) { ... }
```

Details and semantics: [`Formal Silk`](?p=language/formal-verification)

## Examples (copy/paste)

<!-- tabs:start Formal Silk examples -->

### Function contracts

Function contracts define what must be true **at the boundary** of a function:

- `#require` is proved at call sites.
- `#assure` is proved for the function body.

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}

#require x >= 0;
#assure result == x + 2;
fn inc2 (x: int) -> int {
  // Contracted calls are part of the “verified code” subset.
  return inc(inc(x));
}

fn main () -> int {
  // `inc2(40) == 42`, so exit code is 0.
  return inc2(40) - 42;
}
```

Notes:

- `result` is a built-in name available only in `#assure` expressions.
- Formal arithmetic uses fixed-width bitvectors (modular 2^N semantics). See the reference for details.

### Loop specifications

Loop specifications express facts that span iterations:

- `#invariant` — must hold at entry and after each iteration.
- `#variant` — must be non-negative at the loop head and decrease each iteration (termination reasoning).
- `#monovariant` — must be monotonic (either non-decreasing or non-increasing) each iteration.

Counting up (increasing monovariant, decreasing variant):

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  #monovariant i;
  while i < limit {
    i += 1;
  }

  return 0;
}
```

Counting down (decreasing monovariant and variant):

```silk
fn main () -> int {
  let mut remaining: int = 3;
  #invariant remaining >= 0;
  #variant remaining;
  #monovariant remaining;
  while remaining > 0 {
    remaining = remaining - 1;
  }
  return 0;
}
```

### Block-local proofs (`#assert`) and declarations (`#const`)

Use `#assert` to state a fact that must be provable **right here**, and `#const` to name intermediate values for specs:

```silk
fn main () -> int {
  let x: int = 3;
  #const x0 = x;

  let y: int = x + 1;
  #assert y > x0;

  return 0;
}
```

After a `#assert` succeeds, the verifier assumes it for the remainder of the block.

### Struct requirements

Struct requirements let you enforce shape invariants at *construction sites*:

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
  let s: SliceU8 = SliceU8{ ptr: 0, len: 0 };
  let b: BufferU8 = BufferU8{ ptr: 0, len: 1, cap: 1 };
  return (s.len + b.len) - 1;
}
```

Reference: [`Struct requirements`](?p=language/struct-requirements)

### Theories (`theory` / `#theory`)

Theories are reusable proof bundles. You can:

- define them at top level (`export theory ...`),
- apply them as part of a function contract (prefix `#theory ...;`), and
- apply them inside blocks (as a proof obligation at that point).

Top-level theory + contract attachment:

```silk
export theory add_commutes (x: int, y: int) {
  #assure (x + y) == (y + x);
}

#theory add_commutes(a, b);
#assure result == a + b;
fn add (a: int, b: int) -> int {
  return a + b;
}
```

Inline (block-local) theory declaration + use:

```silk
fn main () -> int {
  let x: int = 2;
  let y: int = 1;

  #theory local_sum_not_zero (x: int, y: int) {
    #const z = x + y;
    #assure z != 0;
  }

  #theory local_sum_not_zero(x, y);
  return 0;
}
```

Theory composition (a theory that applies other theories):

```silk
export theory add_commutes (x: int, y: int) {
  #assure (x + y) == (y + x);
}

export theory add_associates (x: int, y: int, z: int) {
  #assure (x + (y + z)) == ((x + y) + z);
}

export theory add_laws (x: int, y: int, z: int) {
  #theory add_commutes(x, y);
  #theory add_associates(x, y, z);
}
```

Reference: [`Formal Silk`](?p=language/formal-verification)

### Values and operators (what you can write in specs)

Formal Silk expressions are normal Silk expressions, but the verifier accepts a restricted subset. The Supported forms
includes:

- `bool` expressions (`!`, `&&`, `||`, comparisons, equality),
- `string` equality/inequality (`==`, `!=`),
- integer arithmetic, comparisons, and bitwise ops,
- layout queries: `sizeof`, `alignof`, `offsetof`.

```silk
struct Pair { a: int, b: int }

#require mode == "safe" || mode == "fast";
fn run (mode: string) -> int { return 0; }

fn main () -> int {
  #assert (1 + 2 * 3) == 7;
  #assert ((7 << 1) | 1) == 15;
  #assert (~0) == -1;
  #assert (10 % 3) == 1;

  // Layout queries (current subset).
  #assert offsetof(Pair, a) < offsetof(Pair, b);
  #assert sizeof(Pair) >= 16;
  #assert alignof(Pair) >= 8;

  return run("safe");
}
```

See the reference for the exact accepted subset and the Z3 mapping: [`Formal Silk`](?p=language/formal-verification)

### Build metadata in proofs

Formal Silk can reason about build metadata, which is useful when you want to
state “this helper is only valid in test builds” or “this proof assumes a
package version floor”.

```silk
#require BUILD_MODE == "test";
#assure result == 0;
fn test_only_status () -> int {
  return 0;
}

#require BUILD_VERSION_MAJOR >= 1;
#assure result >= 0;
fn stable_api_floor () -> int {
  return 0;
}
```

The current built-in metadata names are:

- `BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION`
- `BUILD_VERSION_MAJOR`, `BUILD_VERSION_MINOR`, `BUILD_VERSION_PATCH`

### Opaque contracts for precompiled helpers

Formal Silk is still useful when the implementation body lives somewhere else.
If a declaration has a visible contract but no visible body, the verifier treats
the call as opaque: it proves the preconditions, then assumes the
postconditions.

```silk
#require bytes >= 0;
#assure result >= bytes;
fn align_up_page (bytes: int) -> int;

fn main () -> int {
  let size = align_up_page(4096);
  #assert size >= 4096;
  return 0;
}
```

This is a practical way to document and verify assumptions around:

- allocator shims,
- precompiled libraries,
- host calls reached through a prototype surface.

### Real-world example: packet layout and constructor safety

`#require` on a `struct` is the right tool when the invariant belongs to the
type itself rather than to one helper function.

```silk
#require header_len == 8 || header_len == 12;
#require payload_len >= 0;
#require total_len == header_len + payload_len;
struct FrameLayout {
  header_len: int,
  payload_len: int,
  total_len: int,
}

fn main () -> int {
  let layout = FrameLayout{
    header_len: 8,
    payload_len: 24,
    total_len: 32,
  };

  return layout.total_len - 32;
}
```

This style works well for:

- wire headers,
- on-disk record layouts,
- buffer descriptors,
- length/capacity pairs.

### Real-world example: progress guarantees in a bounded loop

`#variant` and `#monovariant` are most valuable when a loop is easy to get
almost-right but expensive to debug after the fact.

```silk
fn main () -> int {
  let budget: int = 16;
  #const original_budget = budget;

  let mut used: int = 0;
  #invariant used >= 0;
  #invariant used <= original_budget;
  #variant original_budget - used;
  #monovariant used;
  while used < budget {
    used += 1;
  }

  #assert used == original_budget;
  return 0;
}
```

This is a good fit for:

- retry budgets,
- scan cursors,
- parser offsets,
- bounded work queues.

### Reusing `std::formal` theories

When the same proof shape appears repeatedly, prefer a shared theory rather
than restating the same bounds boilerplate in every function:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
#assure result == index;
fn checked_offset (index: i64, len: i64) -> i64 {
  return index;
}
```

This is the right pattern for parsers, pointer/length APIs, and any codebase
that wants a consistent verified vocabulary.

<!-- tabs:end -->

## Choosing the right directive

- Use `#require` when a caller must establish a fact before entering a
 function.
- Use `#assure` when a callee guarantees something about its return value.
- Use `#assert` when a fact matters only at one point inside a block.
- Use `#require` on a `struct` when the invariant belongs to the data type
 itself.
- Use `#invariant` / `#variant` / `#monovariant` when a property spans loop
 iterations.
- Use `theory` / `#theory` when the same proof shape appears in more than one
 place or more than one module.

## Why it’s valuable

Formal verification is most useful where bugs are expensive:

- memory safety boundaries
- cryptographic and security-sensitive logic
- protocol parsers and encoders
- concurrency invariants

Silk’s approach keeps verification lightweight and local: you opt in where it buys you confidence.

## A practical workflow

For most downstream code, the loop is:

```bash
silk check verified_logic.slk
silk build verified_logic.slk --debug -o build/verified_logic
z3 -smt2 .silk/z3/silk_z3_m0_0.smt2
```

Suggested habit:

1. start with a single `#assert` or `#require`,
2. introduce `#const` names when an expression becomes hard to read,
3. extract a `theory` only after the proof shape repeats,
4. use `--debug` only when the normal diagnostic is not enough.

## Debugging failed proofs

When a proof fails, the compiler reports a normal diagnostic at the annotation site.

For deeper debugging, run with `--debug` so the verifier can emit additional information and (when available) write an
SMT‑LIB reproduction script you can replay with an external Z3 binary.

The workflow is intentionally pragmatic: when a proof fails, you should be able to iterate the same way you iterate on type
errors — with good diagnostics and small edits.

The most common Formal Silk diagnostics in practice are:

- `E3001` / `E3002` / `E3003` for loop invariants and variants,
- `E3006` for `#assert` and theory obligations,
- `E3007` for contracted calls whose preconditions are not provable,
- `E3008` for non-monotonic `#monovariant` expressions.
