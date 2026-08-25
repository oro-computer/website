# `std::runtime::posix::time`

Source: `std/runtime/posix/time.slk`

This is the exact canonical documentation page for `std::runtime::posix::time`.

## Role

`std::runtime::posix::time` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [temporal](?p=std/temporal)

## Notes

- The shipped source for this module is `std/runtime/posix/time.slk`.
- The canonical module name is `std::runtime::posix::time`.
- Hosted clock reads use the bundled `silk_rt_clock_now_ns` implementation
 helper. The helper stores `struct timespec` on the calling thread's C stack,
 validates `tv_sec`, `tv_nsec`, and the final signed-nanosecond range, and
 reports failure as `-1`.
- Clock reads do not allocate from Silk's active region. They are therefore
 reentrant across task-pool workers and remain available in `--noheap`
 programs.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
