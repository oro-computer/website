# Boxed Value Types

This document records the current design direction for boxed stdlib wrappers
around language primitive values and primitive-adjacent built-ins.

The goal is to make common primitive values usable as first-class stdlib
objects with methods, interface conformance, and container-friendly APIs
without forcing the language to erase the performance advantages of the
underlying primitive representation.

## Notes

Current implemented Supported forms.

Implemented boxed surfaces in the current tree:

- `std::strings::String` boxes borrowed `string` as an owned mutable value.
- `std::number::Number` provides an inline tagged numeric box with parsing,
 formatting, predicates, exact integer extraction helpers, and conservative
 mixed-kind equality.
- `std::boolean::Boolean` boxes `bool` without allocation.
- `std::path::Path` provides a borrowed method-bearing path box alongside the
 existing owned `PathBuf`.
- `std::range::Range` provides a stdlib-owned method surface that can emit the
 built-in `range` primitive via `as_range()`.
- `std::function::Function(F)` provides a boxed callable holder around an
 existing function-value type.
- `std::regex::RegExp` remains the owned runtime regex wrapper.
- `Optional(T)` already exposes the `Result`-style combinator subset, and
 `std::optional` now provides free-function companions for that built-in
 method surface.

## Box Families

### `std::number::Number`

`Number` should be the canonical boxed numeric sum type for user-facing numeric
 containers and generic numeric APIs.

Intended coverage:

- signed integers: `i8`, `i16`, `i32`, `i64`, `i128`
- unsigned integers: `u8`, `u16`, `u32`, `u64`, `u128`
- floats: `f32`, `f64`
- `int` / `uint` aliases should normalize to their canonical machine-width
 representation before boxing

Design notes:

- `Number` should be tag + payload, not heap allocation by default.
- Numeric subclass wrappers such as `Integer`, `Float`, `Double`, or
 width-specific wrappers should only be added when a concrete stdlib surface
 requires them.
- `Number` currently supports:
 - conversions to/from primitive numerics
 - explicit mixed-kind comparison helpers
 - formatting / parsing
 - predicates like `is_int`, `is_float`, `is_signed`
 - fallible exact casts within the current backend-supported cast envelope

### `std::path::Path`

`Path` should be the boxed path value.

Design direction:

- The current implementation is a borrowed wrapper over `string`, paired with
 the existing owned `PathBuf`.
- A future primitive `path` type is still reasonable, but that remains a
 language/ABI follow-up rather than part of the current stdlib rollout.

Minimum `Path` surface:

- borrowed view access
- normalization / join / parent / file-name helpers
- filesystem-facing conversions that preserve platform semantics

### `std::boolean::Boolean`

`Boolean` should box `bool` for method-oriented or interface-oriented APIs.

It should stay small and cheap:

- no heap allocation
- trivial `from_bool`, `as_bool`, formatting, parsing, equality, negation

### `std::regex::RegExp`

`RegExp` already exists conceptually as a boxed runtime value and should be
kept aligned with the same boxed-value rules:

- explicit ownership / lifetime
- predictable formatting / debugging surface
- no accidental fallback to a plain `string` mental model

### `std::optional`

`Optional(T)` now exposes the same style of combinator helpers already expected
from `Result`, including:

- `map`
- `and_then`
- `or_else`
- `unwrap_or`
- `unwrap_or_else`
- predicates / inspectors

The built-in method surface is specified in the language docs, and
`std::optional` provides a stdlib namespace of companion free functions for the
same operations.

### `std::range::Range`

`Range` should be the boxed method-bearing form of the built-in range value.

Likely responsibilities:

- normalization / emptiness
- inclusive/exclusive introspection
- iteration helpers
- string/debug formatting

### `std::function::Function`

`Function` should be a boxed callable holder for first-class function values.

This is specifically useful for:

- storing callables in containers
- passing higher-level callbacks through stdlib APIs
- attaching method-oriented helper surface around callable values

It should not erase the existing lightweight first-class function value model.

## Important Additional Surfaces

The request also implies design review for primitive-adjacent values not named
explicitly. These matter because partial boxing leaves the language feeling
arbitrary.

Important follow-ups to consider:

- `Char`
- `Duration`
- fixed arrays / slices where boxed collection helpers may be preferable to
 proliferating ad hoc module fns
- bytes / buffers as distinct from text
- error / diagnostic-code wrappers for CLI/LSP/tooling APIs

## Performance Constraints

Boxing must not become a blanket penalty on primitive-heavy code.

Required constraints:

- raw primitives stay the zero-overhead default
- boxes should prefer inline tagged payloads over heap allocation
- conversions between primitive and boxed forms must be explicit or
 contextually justified by the API contract
- formatting / parsing / comparison must avoid hidden allocation unless the API
 says it returns an owned value

## Spec Requirements For Implementors

When these boxed families are implemented, the docs must specify:

- ownership model
- primitive conversion rules
- formatting / parsing rules
- equality / ordering semantics
- ABI expectations where values can cross the C boundary
- which surfaces are zero-allocation vs allocating

## Considerations

1. Decide whether `std::range::Range` also needs a compiler-supported
 decomposition path from primitive `range` back into the stdlib box.
2. Decide whether `std::function::Function(F)` should grow arity-specialized
 `call(...)` helpers, or remain a holder-only box around first-class
 function values.
3. Revisit whether `path` should later become a distinct language primitive in
 addition to the current stdlib box.

## Design goals

- Keep primitive operations cheap when users stay on raw primitive values.
- Provide explicit boxed wrappers when users need methods, interface
 conformance, richer generic surfaces, or ownership.
- Keep the ABI/spec distinction clear:
 - primitives remain language/core ABI concepts,
 - boxes are stdlib contracts that stdlib implementors can provide
 consistently.
- Avoid introducing boxed wrappers that silently allocate or erase ownership
 semantics unless the contract says so explicitly.
