# `std::runtime::wasi::fs`

Source: `std/runtime/wasi/fs.slk`

This is the exact canonical documentation page for `std::runtime::wasi::fs`.

## Role

`std::runtime::wasi::fs` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [fs](?p=std/fs)

## Notes

- The shipped source for this module is `std/runtime/wasi/fs.slk`.
- The canonical module name is `std::runtime::wasi::fs`.
- The shipped WASI backend now projects preview1 file metadata into the stable
 raw-stat layout used by `std::runtime::fs::{stat,lstat,fstat}` and
 `std::fs::Stats`, with documented zero/fallback fields where preview1 lacks
 POSIX metadata.
- It exposes the same borrowed directory-entry fill surface as the POSIX
 backend for `std::fs::Dir.next_view()`, backed by the per-directory WASI
 `fd_readdir` buffer.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
