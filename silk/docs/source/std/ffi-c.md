# `std::ffi::c` (C FFI helpers)

Status: **Initial implementation**.

This module provides small, explicit helpers for interoperating with C APIs
from Silk via `ext` declarations.

The initial focus is **C strings** (`char*` / `const char*`): pointers to
NUL-terminated bytes. In Silk, these pointers are represented as raw addresses
(`u64`).

## Canonical C scalar aliases

Silk `int` is **not** C `int` (`int` is a 64-bit scalar in the current ABI; see
`docs/language/ext.md`). For conventional C APIs, prefer `std::ffi::c` scalar
aliases in your `ext` signatures:

- `c_int` / `c_uint`
- `c_long` / `c_ulong`
- `size_t` / `ssize_t`
- `intptr_t` / `uintptr_t` / `ptrdiff_t`

These are POSIX-first mappings intended to match the common C ABI widths on our
hosted targets.

## C string helpers

### Borrowed vs owned

- `cstr_borrow` / `cstr_string` produces a **borrowed** Silk `string` view into
  the original C memory. It does not allocate.
- `cstr_copy` produces an **owned** `std::strings::String` copy (heap
  allocation, NUL-terminated).
- `std::ffi::c_owned::OwnedCStr` represents an **owned** C string pointer
  (`char*`) paired with a user-provided release function and drops it
  deterministically.

Use `cstr_copy` when the C pointer is only valid temporarily (for example, when
it is owned by a C library object that may be freed, or when the pointer is
documented to be invalidated by the next API call).

### Null pointers

C APIs frequently use `NULL` as “no string”.

- `cstr_string(ptr)` treats `ptr == 0` as `""`.
- `cstr_string_opt(ptr)` returns `None` when `ptr == 0`.

Choose the form that matches the C API contract you are binding.

### Safety notes

- `cstr_len` scans memory until it finds a `0` byte. If the pointer is invalid
  or not NUL-terminated, behavior is undefined.
- These helpers do not validate UTF-8. A C string may contain arbitrary bytes.

## API

- C scalar aliases: `c_int`, `size_t`, `ssize_t`, …
- `cstr_len(ptr: u64) -> int`
- `cstr_borrow(ptr: u64) -> string`
- `cstr_string(ptr: u64) -> string` (alias of `cstr_borrow`)
- `cstr_borrow_opt(ptr: u64) -> string?`
- `cstr_string_opt(ptr: u64) -> string?` (alias of `cstr_borrow_opt`)
- `cstr_copy(ptr: u64) -> Result(std::strings::String, std::memory::OutOfMemory)`

## Owned pointers (`std::ffi::c_owned`)

- `CFreeFn = fn (u64) -> void`
- `cstr_copy_and_free(ptr: u64, free_fn: CFreeFn) -> Result(std::strings::String, std::memory::OutOfMemory)`
- `OwnedCStr` (owned pointer + drop)

## Example

```silk
import c from "std/ffi/c";

ext lib_version = fn () -> u64; // returns `const char*`

fn main () -> int {
  let p: u64 = lib_version();
  let v: string = c::cstr_string(p);
  return if v == "" { 1 } else { 0 };
}
```
