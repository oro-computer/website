# Struct requirements (`#require`)

Struct requirements attach invariants directly to a data type. Use `#require`
before a `struct` when every value of that type must satisfy a condition, no
matter where the value is constructed.

That is different from a function precondition. A function `#require` describes
what callers must prove before entering one function. A struct `#require`
describes what must be true for every literal, defaulted value, or allocation of
that struct.

## Shape

```silk
#require field_name >= 0;
struct Name {
  field_name: int,
}
```

The requirement may refer to the struct fields by name. At construction sites,
the verifier proves the requirement using the field initializers and defaults
that are actually present.

## Example

```silk
#require len >= 0;
#require cap >= len;
struct BufferView {
  ptr: u64,
  len: int,
  cap: int,
}

fn empty_view () -> BufferView {
  return BufferView{
    ptr: 0,
    len: 0,
    cap: 0,
  };
}
```

The constructor is accepted because both requirements are provable:

- `len >= 0`
- `cap >= len`

If a caller tries to construct `BufferView{ ptr: 0, len: 8, cap: 4 }`, the
struct requirement is the failing obligation, not a later runtime check.

## Defaults Count

Defaults participate in the proof the same way explicit fields do:

```silk
#require quantity > 0;
struct LineItem {
  sku: string,
  quantity: int = 1,
}

fn one (sku: string) -> LineItem {
  return LineItem{ sku };
}
```

Because `quantity` defaults to `1`, the requirement is still proven when the
literal omits that field.

## Field Writes

Verified direct field writes must re-establish the target struct requirements
after the write. That keeps the invariant attached to the value, not just to
the original literal.

```silk
#require value >= 0;
struct Counter {
  value: int,
}

fn reset (mut c: &Counter) -> void {
  c.value = 0;
}
```

Assignments that cannot prove `value >= 0` are rejected in verified code.

## Use It For

- lengths, capacities, and offsets
- enum-like integer domains
- protocol header relationships
- invariants that should survive refactors
- public structs exposed across module or ABI boundaries

## Avoid It For

- facts that only matter inside one function
- expensive semantic checks that are not expressible as compile-time proof
- invariants involving resources whose state changes outside the value

Use a function `#require` for caller obligations, `#assert` for local proof
steps, and struct `#require` for type-wide shape guarantees.

## Related

- Reference: [struct requirements](../docs/?p=language/struct-requirements)
- Formal Silk: [formal verification](?p=language/formal-verification)
- Structs and methods: [structs and impl](?p=language/structs-impls-layout)
