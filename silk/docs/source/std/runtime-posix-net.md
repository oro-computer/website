# `std::runtime::posix::net`

Source: `std/runtime/posix/net.slk`

This is the exact canonical documentation page for `std::runtime::posix::net`.

## Role

`std::runtime::posix::net` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [net](?p=std/net)

## Notes

- The shipped source for this module is `std/runtime/posix/net.slk`.
- The canonical module name is `std::runtime::posix::net`.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
- Bounded DNS and TCP connection operations are implemented by
 `src/silk_rt_dns.c` and `src/silk_rt_net.c`; stable error-code mapping remains
 in `std::runtime::net`.
