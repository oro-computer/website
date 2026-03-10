# Struct requirements (`#require`)

Use `#require` on a `struct` to state requirements that must hold for all
values constructed for that type.

```silk
struct Port {
  value: int,
}

#require value >= 0;
#require value <= 65535;
```

Use this when an invariant belongs to the type itself, not just to one helper
function.

See [Struct requirements](../docs/?p=language/struct-requirements) and
[Formal verification](../docs/?p=language/formal-verification).
