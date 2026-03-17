# Struct requirements (`#require`)

Use `#require` on a `struct` when the invariant belongs to the value itself and
must hold at every construction site.

```silk
#require len >= 0;
#require cap >= len;
struct BufferState {
  ptr: u64,
  len: int,
  cap: int,
}
```

This is a good fit for packet headers, range descriptors, and `len` / `cap`
pairs.

## Construction sites

The verifier checks struct requirements at:

- `Type{ ... }`
- `new Type{ ... }`

This means the allocation strategy may change, but the type-level invariant
does not.

## Example: parser cursor

```silk
#require len >= 0;
#require pos >= 0;
#require pos <= len;
struct PacketCursor {
  ptr: u64,
  len: int,
  pos: int,
}
```

This is the right pattern when the invariant belongs to the data model rather
than to one helper function.

See:

- [Canonical doc](../docs/?p=language/struct-requirements)
- [Formal verification](?p=language/formal-verification)
