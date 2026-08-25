# `std::runtime::globals`

Source: `std/runtime/globals.slk`

This is the exact canonical documentation page for `std::runtime::globals`.

## Role

`std::runtime::globals` defines the replaceable standard-library prelude. When
the standard library is enabled, the compiler loads this module on demand when
user source refers to one of its aliases. Its module-scope `using` declarations
make their target types and interfaces available without an explicit import.

Prelude aliases are transparent during checking and generic
monomorphization. For example, the shipped
`using Result = std::result::Result;` permits `Result(int, Error)` with the same
generic template, arity, and semantics as the fully qualified target.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)

## Notes

- The shipped source for this module is `std/runtime/globals.slk`.
- The canonical module name is `std::runtime::globals`.
- Alternative standard-library roots may replace the aliases by shipping a
 compatible module at the same canonical name.
- `--nostd` disables prelude loading.
