# `std::runtime::dylib`

`std::runtime::dylib` is the runtime interface used by `std::dylib`.

Application code should use `std::dylib` instead of this module. This page
documents the exact shipped runtime module for stdlib implementers and alternate
stdlib roots.

## Surface

- `supported() -> bool`
- `open(path, flags) -> u64`
- `open_self(flags) -> u64`
- `symbol(handle, name) -> u64`
- `close(handle) -> i64`
- `last_error_ptr() -> u64`
- `lazy() -> i64`
- `now() -> i64`
- `local() -> i64`
- `global() -> i64`

The functions return raw handles, raw symbol addresses, and platform flag bits.
`supported()` reports whether the bundled runtime has a hosted dynamic loader
backend for the current target. `0` means no handle or no address was produced.
`last_error_ptr()` returns a borrowed C string pointer owned by the platform
dynamic loader.

The shipped implementation delegates to `std::runtime::posix::dylib`.

## Contract

This module is intentionally low-level:

- It does not own handles.
- It does not copy loader error strings.
- It does not validate symbol signatures.
- It keeps platform constants behind functions so the stdlib can query the
 runtime boundary without hard-coding target-specific numeric values in Silk.

`std::dylib` is responsible for converting these primitives into `Result`
values and handle wrappers.
