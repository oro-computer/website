# Type Unions (`T1 | T2 | ...`)

Silk supports **type unions** in type annotations. A union type represents a
value that is exactly one of several **member types**.

This feature exists to model small, explicit “one-of-these-types” outcomes
without requiring a dedicated nominal `enum` declaration for every case.

Status: **implemented (subset)**.

See also:

- `docs/language/typed-errors.md` (unparenthesized `|` in function *signatures*
  is reserved for typed-error contracts),
- `docs/language/enums.md` (general tagged unions with named variants),
- `docs/language/flow-match.md` (`match` over union values).

## Surface Syntax

Union types use `|` between member types:

```silk
let x: Foo | Bar;
struct S { v: u8 | bool }
type U = Foo | Bar | Baz;
```

### Return types (important disambiguation)

In **function declarations**, unparenthesized `|` after `->` is reserved for
typed errors (`SuccessType | ErrorType...`). To write a union as a function’s
return type, the union must be parenthesized:

```silk
fn f () -> (Foo | Bar);
fn g () -> (Foo | Bar) | SomeTypedError;
```

This disambiguation is required so the parser and checker can treat typed-error
contracts as authoritative.

## Rules (Current Implemented Subset)

The initial implementation intentionally supports only unions whose member
types have a safe, well-defined representation in the current compiler/backend
subset.

A union type `T1 | T2 | ... | Tn` is permitted when all member types are in the
supported union-member set:

- **Primitive scalar** types in `{ bool, char, i8, u8, i16, u16, i32, u32, i64,
  u64, int, usize, size, Instant, Duration }` (`isize` is accepted as an alias
  for `size`), and/or
- **Nominal POD structs** (including `error` types) and **nominal POD enums**
  that lower to a scalar-slot representation in the current backend subset (no
  opaque structs).

Unions may freely **mix** primitive and nominal members in this subset.

For primitive members, the current native backend requires that **each member
type be distinguishable at injection sites**. In practice, that means a union
may not contain two primitive types that lower to the same backend scalar
representation (for example `int | i64`, `usize | u64`, `char | u32`,
`Duration | i64`). This restriction is specific to the current backend subset
and may be relaxed once union injection uses full type identity rather than a
backend-scalar heuristic.

Notes:

- Nested unions are flattened: `(A | B) | C` is the same union as `A | B | C`.
- Duplicate member types are rejected.

## Semantics

A value of a union type is a **tagged** value:

- It stores a runtime tag identifying which member type is active.
- It stores the payload value in a uniform representation compatible with all
  members in the current backend subset.

### Representation (current backend subset)

In the current native backend subset, unions are lowered as:

- `(u64 tag, u64 payload_0, ..., u64 payload_(N-1))`

where `N` is the maximum scalar-slot count across the union’s member types
(primitive members contribute `1`).

Member payload values are stored/loaded via raw-bit casts (`cast_raw`) to and
from the `u64` payload slots. Unused payload slots are **zero-filled** on
injection and on widening coercions.

### Union-to-union coercions (supersets)

When a context expects a union type `U_sup`, a value of a union type `U_sub`
may be used if `U_sub`’s member set is a subset of `U_sup`’s member set. The
compiler remaps the runtime tag to the destination union’s tag numbering when
needed so pattern matches on the destination union remain correct.

If `U_sup`’s payload is larger than `U_sub`’s payload (because `U_sup` contains a
member with a larger scalar-slot representation), the payload is widened by
copying existing payload slots and zero-filling the newly-added slots.

### Construction (injection)

When a context expects a union type, a value whose type is one of the union’s
member types may be used directly and is injected into the union.

Examples:

```silk
struct A { x: int }
struct B { x: int }
type U = A | B;

fn main () -> int {
  let a: A = A{ x: 1 };
  let u: U = a; // inject `A` into `U`
  return 0;
}
```

## Matching (`match`)

Union values are consumed via `match` expressions using **typed binder**
patterns:

```silk
type U = A | B;

let out: int = match u {
  a: A => a.x,
  b: B => b.x,
};
```

Rules (current subset):

- The scrutinee must have a union type.
- Patterns are restricted to `name: Type` (or `_: Type`) where `Type` is one of
  the union member types.
- Matches must be exhaustive: exactly one arm per member type (order does not
  matter).
