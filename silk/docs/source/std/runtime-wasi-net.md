# `std::runtime::wasi::net`

Source: `std/runtime/wasi/net.slk`

This is the exact canonical documentation page for `std::runtime::wasi::net`.

## Role

`std::runtime::wasi::net` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [net](?p=std/net)

## Notes

- The shipped source for this module is `std/runtime/wasi/net.slk`.
- The canonical module name is `std::runtime::wasi::net`.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
