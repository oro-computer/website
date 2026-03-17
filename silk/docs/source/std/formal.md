# `std::formal`

Status: **Implemented subset**. `std::formal` exports reusable Formal Silk
theories for the proof obligations that show up constantly in real systems
code:

- non-negative lengths and counters,
- non-null pointers,
- bounds checks,
- and basic slice/vector well-formedness.

Use `std::formal` when the proof is common enough that you do not want to
repeat the same `#require` / `#assure` block in every parser, container, or
runtime helper.

See also:

- [`Formal Silk`](?p=language/formal-verification)
- [`Formal Silk guide`](?p=guides/formal-silk)

## Importing and applying theories

Theories are imported with named imports and applied with `#theory`:

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
fn get_at (index: i64, len: i64) -> i64 {
  return index;
}
```

This keeps the user-facing function contract compact while still letting the
verifier reuse standard facts.

## Current exported theory set

The current `std::formal` module exports these reusable theories:

- `nonnegative_i64(x: i64)`
  - proves / assumes `x >= 0`
- `nonnull_u64(ptr: u64)`
  - proves / assumes `ptr != 0`
- `bounds_i64(index: i64, len: i64)`
  - proves / assumes `0 <= index < len`
- `slice_well_formed(ptr: u64, len: i64)`
  - proves / assumes:
    - `len >= 0`
    - `len == 0 || ptr != 0`
- `vector_well_formed(ptr: u64, len: i64, cap: i64)`
  - proves / assumes:
    - `len >= 0`
    - `cap >= 0`
    - `len <= cap`
    - `cap == 0 || ptr != 0`

## Example: parser offset checks

This is the most common downstream use: make a parser helper obviously
bounds-safe without repeating the same arithmetic proof in every call site.

```silk
import { nonnegative_i64, bounds_i64 } from "std/formal";

#theory nonnegative_i64(len);
#theory bounds_i64(index, len);
#assure result == index;
fn checked_index (index: i64, len: i64) -> i64 {
  return index;
}
```

## Example: well-formed byte slices

```silk
import { slice_well_formed } from "std/formal";

#theory slice_well_formed(ptr, len);
#assure result == len;
fn byte_len (ptr: u64, len: i64) -> i64 {
  return len;
}
```

This is useful at FFI boundaries, parser front-ends, and buffer-view helpers
where the verifier should always know “zero length may allow a null pointer;
non-zero length does not.”

## Example: composing std theories with your own

`std::formal` gives you the primitives; your module can add domain-specific
facts on top.

```silk
import { vector_well_formed } from "std/formal";

export theory append_window_ok (ptr: u64, len: i64, cap: i64, extra: i64) {
  #theory vector_well_formed(ptr, len, cap);
  #require extra >= 0;
  #assure len + extra <= cap;
}

#theory append_window_ok(ptr, len, cap, extra);
#assure result == len + extra;
fn end_after_append (ptr: u64, len: i64, cap: i64, extra: i64) -> i64 {
  return len + extra;
}
```

This is the intended layering:

- `std::formal` for common arithmetic / shape lemmas,
- your own theories for protocol-, container-, or product-specific rules.

## When to prefer `std::formal`

Reach for `std::formal` when:

- the same proof shape appears in multiple modules,
- the property is generic (`index < len`, `len <= cap`, `ptr != 0`),
- you want a readable contract surface without repeating boilerplate.

Write a local theory instead when the fact is specific to one protocol,
container, or subsystem.
