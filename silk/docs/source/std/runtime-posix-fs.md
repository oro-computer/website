# `std::runtime::posix::fs`

Source: `std/runtime/posix/fs.slk`

This is the exact canonical documentation page for `std::runtime::posix::fs`.

## Role

`std::runtime::posix::fs` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [fs](?p=std/fs)

## Notes

- The shipped source for this module is `std/runtime/posix/fs.slk`.
- The canonical module name is `std::runtime::posix::fs`.
- The shipped POSIX backend now exposes the stable raw-stat fill helpers used
 by `std::runtime::fs::{stat,lstat,fstat}` and therefore by `std::fs::Stats`,
 plus `fstat_size` for allocation-free descriptor size probes.
- It exposes a borrowed `readdir(3)` entry-fill helper for
 `std::fs::Dir.next_view()`, including stable directory-entry type codes when
 `d_type` is available.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
