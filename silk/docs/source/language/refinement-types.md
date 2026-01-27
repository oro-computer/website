# Refinement Types

Refinement types are types annotated with logical predicates that constrain the
set of values they may represent. They are a tool for making illegal states
unrepresentable and for turning certain classes of bugs into compile-time
errors.

Status: **design in progress**. Refinement types are not implemented in the
current compiler subset. Today, Silk provides verification annotations
(`#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`) and formal Silk declarations (`#const`)
as compile-time-only metadata; see `docs/language/formal-verification.md`.

Note: in Silk, any use of a `where` predicate is verification syntax. When
`where` predicates are implemented, their presence will require proof (VC
generation + Z3 discharge) for the compiled module set, per
`docs/language/formal-verification.md`.

## Overview

A refinement type consists of:

- a **base type** (for example `int`, `string`, `&T`, or a struct), and
- a **predicate** that must hold for all values of the refinement type.

The predicate is written in Silk’s specification expression language (the same
expression grammar used by `#require` / `#assure`).

## Proposed Surface Syntax

One intended surface form is a record-like binder with a `where` clause:

```silk
type NonEmptyString = { s: string where std::length(s) > 0 };
```

Notes:

- `type` aliases are not implemented yet (this is design work).
- The binder name (`s`) is a name for the value being constrained, usable
  inside the predicate.

## Checking Model (Planned)

The compiler/verifier discharges refinement predicates using:

- constant-folding and local reasoning for literals and simple expressions,
- facts established by control-flow (guards) when the verifier can prove them,
- facts provided by contracts (`#require` / `#assure`) and invariants
  (`#invariant`),
- and, where necessary, explicit evidence via helper constructors or lemmas.

When the compiler cannot prove a predicate, the program should fail to compile
with a diagnostic that:

- points to the predicate that could not be proven, and
- suggests how to provide evidence (guard, constructor, or contract).

## Relationship to `#require` / `#assure`

Refinement types and function contracts are meant to compose:

- A parameter of a refinement type encodes a precondition at the type level.
- A refinement return type encodes a postcondition at the type level.

Example (design-only):

```silk
type NonZeroInt = { n: int where n != 0 };
fn safe_divide(numer: int, denom: NonZeroInt) -> int {
  return numer / denom;
}
```

## Implementation Notes (Current Compiler)

In the current implementation:

- there is no `type` alias declaration,
- there is no `where` clause in types,
- and there is no verifier that can prove user-defined predicates.

The existing verification directives (`#require`, `#assure`, `#assert`,
`#invariant`, `#variant`, `#monovariant`) are parsed, type-checked as `bool` where appropriate, and preserved
as metadata, but they do not yet affect code generation.
