# `std::runtime::net`

Source: `std/runtime/net.slk`

This is the exact canonical documentation page for `std::runtime::net`.

## Role

`std::runtime::net` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [net](?p=std/net)

## Notes

- The shipped source for this module is `std/runtime/net.slk`.
- The canonical module name is `std::runtime::net`.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
- Hosted implementations expose bounded DNS lookup, bounded TCP connect, and
 socket I/O timeout primitives used by the monotonic HTTPS request deadline.
- The DNS worker condition and its absolute timeout always use the same clock;
 implementations without monotonic pthread conditions fall back to a
 realtime condition deadline while the public caller retains its monotonic
 whole-request deadline.
- A timed-out lookup may leave its detached worker alive until the platform
 resolver returns. The runtime caps those in-flight timed workers at 64;
 a later bounded caller waits for admission only within its original absolute
 timeout. If no slot becomes available by that deadline, the lookup reports a
 timeout without retaining another worker.
