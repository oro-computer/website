# `std::runtime::posix::dylib`

`std::runtime::posix::dylib` is the hosted POSIX dynamic-loader backend for
`std::runtime::dylib`.

It binds the bundled C runtime shim in `src/silk_rt_dylib.c`, which calls the
platform dynamic-loader API:

- `dlopen`
- `dlsym`
- `dlclose`
- `dlerror`

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

## Values

Handles and symbol addresses are represented as `u64` raw addresses. Loader
flags are represented as `i64` values returned by the runtime shim.

`supported()` returns `true` on hosted POSIX/macOS builds that expose the
bundled `dlfcn` shim. The backend returns `0` for failed opens or failed symbol
resolution. Callers that need diagnostic text should read `last_error_ptr()`
immediately after the failing operation and convert it with
`std::ffi::c::cstr_borrow`.

## Public Facade

Downstream applications should use `std::dylib`, which owns the public result,
handle, and close semantics.
