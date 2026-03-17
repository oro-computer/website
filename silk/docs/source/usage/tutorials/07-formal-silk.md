# Tutorial 7: Formal Silk in real code

This tutorial shows how to introduce Formal Silk the same way you would
introduce tests or types: incrementally, around code that is easy to get subtly
wrong.

You will use:

- `#require` / `#assure` for function contracts,
- `#require` on `struct` for type-level invariants,
- `#assert` for local proof points,
- `#invariant` / `#variant` / `#monovariant` for loops,
- `theory` / `#theory` for reusable proof bundles.

Reference pages:

- [Formal Silk](?p=language/formal-verification)
- [Struct requirements](?p=language/struct-requirements)
- [`std::formal`](?p=std/formal)
- [Diagnostics](?p=compiler/diagnostics)

## 1) Start with a single boundary contract

Create `formal_remaining.slk`:

```silk
#require total >= 0;
#require used >= 0;
#require used <= total;
#assure result == total - used;
fn remaining_bytes (total: int, used: int) -> int {
  return total - used;
}

fn main () -> int {
  return remaining_bytes(64, 16) - 48;
}
```

Run the normal verification loop:

```bash
silk check formal_remaining.slk
silk build formal_remaining.slk -o build/formal_remaining
./build/formal_remaining
```

What this buys you:

- callers must prove `used <= total`,
- the function body must prove the postcondition,
- downstream verified callers can reuse the postcondition.

## 2) Move data invariants onto the type

If the fact belongs to the type itself, put it on the `struct` instead of
repeating it in every helper.

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
  let frame = FrameLayout{
    header_len: 8,
    payload_len: 24,
    total_len: 32,
  };

  return frame.total_len - 32;
}
```

This is the right shape for:

- packet and record headers,
- `len` / `cap` pairs,
- range descriptors,
- parsed configuration values with internal constraints.

## 3) Add a local proof point before the bug gets farther away

`#assert` is the smallest useful Formal Silk tool. Use it where you would
otherwise leave a comment like “this must always be true”.

```silk
fn main () -> int {
  let header_len: int = 8;
  let payload_len: int = 24;
  let total_len: int = header_len + payload_len;

  #assert total_len >= header_len;
  #assert total_len >= payload_len;

  return total_len - 32;
}
```

Prefer this over prose when:

- a parser offset must stay in bounds,
- a retry budget must not go negative,
- a capacity calculation must dominate a payload length.

## 4) Prove a loop, not just its final result

Loop bugs usually come from one of three failures:

- the cursor leaves its valid range,
- the progress measure stops decreasing,
- the implementation and the intended bound drift apart.

Formal Silk gives you one directive for each of those concerns.

```silk
fn main () -> int {
  let total: int = 5;
  #const original_total = total;

  let mut processed: int = 0;
  #invariant processed >= 0;
  #invariant processed <= original_total;
  #variant original_total - processed;
  #monovariant processed;
  while processed < total {
    processed += 1;
  }

  #assert processed == original_total;
  return 0;
}
```

Interpretation:

- `#invariant` keeps the loop state inside its legal range,
- `#variant` proves termination progress,
- `#monovariant` proves a monotonic quantity such as a cursor, sequence number,
  or bytes-written counter.

## 5) Reuse proof bundles with `theory`

Once the same proof shape appears twice, stop copy/pasting it.

```silk
export theory bounded_progress (current: int, limit: int) {
  #require limit >= 0;
  #assure current >= 0;
  #assure current <= limit;
}

#theory bounded_progress(sent, total);
#assure result == total - sent;
fn remaining (sent: int, total: int) -> int {
  return total - sent;
}
```

You can also import standard theories:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn checked_index (index: i64, len: i64) -> i64 {
  return index;
}
```

Use custom `theory` declarations for domain rules and `std::formal` for common
bounds/non-negativity/container-shape facts.

## 6) Verify against precompiled or external implementations

The callee does not need a visible body if you have a visible contract.

```silk
#require bytes >= 0;
#assure result >= bytes;
fn align_up_page (bytes: int) -> int;

fn main () -> int {
  let size = align_up_page(8192);
  #assert size >= 8192;
  return 0;
}
```

This is useful for:

- precompiled package dependencies,
- ABI surfaces exposed through `libsilk`,
- code generators that emit prototypes and contracts separately from bodies.

## 7) Debug failed proofs with the normal toolchain

When a proof fails, start with the normal diagnostic. If you need the raw SMT
query, rebuild with debug output enabled.

```bash
silk build formal_remaining.slk --debug -o build/formal_remaining
z3 -smt2 .silk/z3/silk_z3_m0_0.smt2
```

Useful diagnostics:

- `E3001` — loop invariant may not hold
- `E3002` — loop variant may be negative
- `E3003` — loop variant may not decrease
- `E3006` — assertion may not hold
- `E3007` — call precondition may not hold
- `E3008` — loop monovariant may not be monotonic

## Next

- Guide: [Formal Silk](?p=guides/formal-silk)
- Reference: [Formal Silk](?p=language/formal-verification)
- Reference: [Struct requirements](?p=language/struct-requirements)
- Library: [`std::formal`](?p=std/formal)
