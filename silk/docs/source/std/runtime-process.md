# `std::runtime::process`

Source: `std/runtime/process.slk`

This is the exact canonical documentation page for `std::runtime::process`.

## Role

`std::runtime::process` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [process](?p=std/process)

## Notes

- The shipped source for this module is `std/runtime/process.slk`.
- The canonical module name is `std::runtime::process`.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
