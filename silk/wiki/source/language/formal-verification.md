# Formal verification (Formal Silk)

Formal Silk is the compile-time proof surface of the language. It lets a module
state facts that must be proven before code is accepted, without adding runtime
checks to the compiled artifact.

Silk includes syntax for contracts and verification metadata:

- `#require` / `#assure` for pre/postconditions
- `#assert` for local assertions
- `#invariant` / `#variant` / `#monovariant` for loops
- `#const` for proof-local constants
- `#theory` for reusable proof facts

Reference: [formal verification](../docs/?p=language/formal-verification).

## Function Contracts

`#require` describes the caller obligation. `#assure` describes what the
function proves for its result.

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

When another function calls `inc`, the verifier must prove the argument is
non-negative at the call site. After the call, verified code may use the
postcondition `result == x + 1`.

## Local Proof Steps

`#assert` is useful when a proof is true but not obvious from the immediate
expression. It gives the verifier a named checkpoint.

```silk
#require x >= 0;
fn double_non_negative (x: int) -> int {
  let y: int = x + x;
  #assert y >= 0;
  return y;
}
```

## Loops

Loops need explicit facts because the verifier must reason across iterations:

```silk
fn count_to (limit: int) -> int {
  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= limit;
  #variant limit - i;
  while i < limit {
    i += 1;
  }
  return i;
}
```

- `#invariant` must hold before and after each iteration.
- `#variant` proves termination by decreasing.
- `#monovariant` proves a measure moves in one direction.

## Struct Requirements

Use struct `#require` when the fact belongs to the data shape:

```silk
#require len >= 0;
#require cap >= len;
struct Span {
  ptr: u64,
  len: int,
  cap: int,
}
```

Every verified construction of `Span` must prove those requirements. This is
the right place for lengths, capacities, offsets, and other invariants that
should travel with the type.

## Mental Model

Formal Silk code is ordinary Silk plus proof obligations:

- no proof syntax: compile normally
- proof syntax present: generate verification conditions
- proof succeeds: compile continues
- proof fails: compilation fails with a diagnostic

The proof language is intentionally explicit. If a reader can see the
requirement in the source, tooling can also report where it came from and which
obligation failed.

## See also

- Reference: [formal verification](../docs/?p=language/formal-verification)
- Struct requirements: [struct requirements](?p=language/struct-requirements)
- Diagnostics: [diagnostics](../docs/?p=compiler/diagnostics)
