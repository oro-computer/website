# `std::runtime::fs`

Source: `std/runtime/fs.slk`

This is the exact canonical documentation page for `std::runtime::fs`.

## Role

`std::runtime::fs` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [fs](?p=std/fs)

## Notes

- The shipped source for this module is `std/runtime/fs.slk`.
- The canonical module name is `std::runtime::fs`.
- This module now carries the implementation-facing raw metadata surface used
 by `std::fs::Stats` (`StatInfo`, `StatResult`, `stat`, `lstat`, `fstat`),
 plus `fstat_size` for allocation-free descriptor size probes.
- It also carries the borrowed directory-entry bridge used by
 `std::fs::Dir.next_view()` (`DirEntryBorrowed`,
 `DirEntryBorrowedResult`, `readdir_borrowed`, and
 `readdir_borrowed_into`).
- The hosted implementation exposes raw `chmod` and advisory `flock`/unlock
 operations for the typed `std::fs` wrappers. Unsupported runtimes return the
 stable filesystem `Unsupported` code rather than exposing a platform errno.
- The wrapper's internal errno mapping is defined for every compilation target.
 macOS selects its platform values where they differ; WASI stubs use the
 Linux-shaped `ENOTSUP` value they store in their runtime errno cell, so merely
 importing the portable filesystem graph never depends on a hosted-only
 declaration.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
