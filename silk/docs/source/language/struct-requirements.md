# Struct Requirements (`#require`)

Struct requirements are **value-shape contracts** attached directly to a
`struct`.

Use them when a property should hold for **every constructed value** of a type,
not just for one specific function call:

- `len >= 0`
- `cap >= len`
- `pos <= len`
- `ptr != 0` when `len > 0`

The verifier proves these requirements at construction sites such as
`Type{ ... }` and `new Type{ ... }`.

## Syntax

```silk
#require <bool-expr>;
struct Name {
  field: int,
}
```

Rules in the current subset:

- A `struct` may have one or more `#require` directives immediately before the
  declaration.
- Requirement expressions may reference the struct's fields by name.
- When Formal Silk syntax is present in the compiled module set, the verifier
  proves all struct requirements at literal construction sites:
  - `Type{ ... }`
  - `new Type{ ... }`
- Omitted fields use their normal default-initialization behavior, and the
  verifier reasons about those values too.
- If a struct extends a base struct, the derived struct inherits the base
  struct's requirements.

## When to use struct requirements

Use a struct requirement when the property is about the **shape of the data**:

- a parser cursor must stay within its byte slice,
- a buffer length must never exceed its capacity,
- a descriptor range must stay within a file or packet,
- a pair of fields must remain internally consistent.

Use a function `#require` when the property is about a **single operation**:

- “this function only accepts non-empty input,”
- “the caller must hold the lock,”
- “the offset + size window must fit inside this frame.”

## Example: simple identity rule

```silk
#require id > 0;
struct User {
  id: int,
}

#assure result > 0;
fn next_id () -> int {
  return 1;
}

fn main () -> int {
  let user = User{ id: next_id() };
  return user.id - 1;
}
```

The bad construction site is what fails:

```silk
// rejected: `id > 0` is not provable
// let bad = User{ id: 0 };
```

## Example: slice-like view

This is a typical ptr/len invariant.

```silk
#require len >= 0;
#require len == 0 || ptr != 0;
struct SliceU8 {
  ptr: u64,
  len: int,
}

fn main () -> int {
  let empty = SliceU8{ ptr: 0, len: 0 };
  return empty.len;
}
```

This pattern is useful for parser inputs, mmap views, packet payloads, and FFI
handles that carry a byte length.

## Example: bounded buffer

This is the most common “real” struct-requirement pattern in systems code:
capacity must dominate length.

```silk
#require len >= 0;
#require cap >= 0;
#require cap >= len;
#require cap == 0 || ptr != 0;
struct ByteBuffer {
  ptr: u64,
  len: int,
  cap: int,
}

#require extra >= 0;
#require buf.len + extra <= buf.cap;
#assure result == buf.len + extra;
fn end_after_append (buf: ByteBuffer, extra: int) -> int {
  return buf.len + extra;
}
```

The struct requirement keeps the type well-formed; the function contract models
the operation-specific append rule.

## Example: packet cursor

This is a good fit when you want parser code to stay simple while the verifier
enforces the bounds discipline.

```silk
#require len >= 0;
#require pos >= 0;
#require pos <= len;
struct PacketCursor {
  ptr: u64,
  len: int,
  pos: int,
}

#require need >= 0;
#assure result == (cursor.pos + need <= cursor.len);
fn can_read (cursor: PacketCursor, need: int) -> bool {
  return cursor.pos + need <= cursor.len;
}
```

This lets downstream code model “cursor is in bounds” once and then reason
about operation-specific windows separately.

## `new`, regions, and construction sites

Struct requirements are checked for both stack-style literals and `new`
allocations:

```silk
#require bytes >= 0;
struct Frame {
  bytes: int,
}

fn main () -> int {
  let a = Frame{ bytes: 1 };
  let b: &Frame = new Frame{ bytes: a.bytes };
  return b.bytes - 1;
}
```

This is especially useful with [`Regions`](?p=language/regions): allocation
strategy may change, but the constructed value still has to satisfy the same
type-level invariants.

## Debugging failed requirements

When a struct requirement fails, the right fix is usually one of:

- prove the field expression with a nearby helper contract,
- add a local `#assert` before construction to make the intended fact explicit,
- split one overloaded struct into two types with clearer invariants,
- or move an operation-specific rule out of the type and into a function
  `#require`.

Keep the requirement itself simple and structural. If it starts describing a
workflow, it probably belongs on a function or in a reusable `theory`.

## See also

- [`Formal Silk`](?p=language/formal-verification)
- [`Formal Silk guide`](?p=guides/formal-silk)
- [`std::formal`](?p=std/formal)
