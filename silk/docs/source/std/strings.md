# `std::strings`

Status: **Initial implementation (expanded)**. A small but growing subset is
implemented in `std/strings.slk` to support early toolchain bring-up; the rest
of this document describes the intended long-term API.

This module provides string utilities and abstractions built on top of the core
`string` type (UTF-8 bytes) and the `Buffer(T)` intrinsic.

See also:

- `docs/language/literals-string.md` (string semantics: UTF-8 bytes)
- `docs/language/ext.md` (ABI/external-call representation and null-termination rule)
- `docs/language/buffers.md` (Buffer(T) as the low-level backing store)
- `docs/std/conventions.md` (UTF-8, allocation, and error conventions)

## Current API (Implemented)

The following functions exist today in `std/strings.slk` and are available to
import:

```silk
module std::strings;

export fn eq (a: string, b: string) -> bool;
export fn ne (a: string, b: string) -> bool;
export fn lt (a: string, b: string) -> bool;
export fn le (a: string, b: string) -> bool;
export fn gt (a: string, b: string) -> bool;
export fn ge (a: string, b: string) -> bool;

export fn is_empty (s: string) -> bool;
export fn or_empty (s: string?) -> string;

export fn trim (s: string) -> string;
export fn trim_start (s: string) -> string;
export fn trim_end (s: string) -> string;

export fn pad_left (s: string, min_len: i64, pad: string) -> std::result::Result(String, std::memory::OutOfMemory);
export fn pad_right (s: string, min_len: i64, pad: string) -> std::result::Result(String, std::memory::OutOfMemory);
export fn pad_center (s: string, min_len: i64, pad: string) -> std::result::Result(String, std::memory::OutOfMemory);
```

Notes:

- These are simple wrappers over the language’s built-in string comparisons and
  optional-coalesce operator (`??`), chosen because they are implementable in
  the current compiler subset.
- This surface will grow alongside language/runtime features
  required for richer string operations (slicing, iteration, allocation, etc.).

In addition, a low-level `StringBuilder` type exists today for
incremental byte construction:

```silk
struct StringBuilder {
  ptr: u64,
  cap: i64,
  len: i64,
}

impl StringBuilder {
  public fn init (cap: i64) -> std::result::Result(StringBuilder, std::memory::AllocFailed);
  public fn empty () -> StringBuilder;
  public fn push_u8 (mut self: &StringBuilder, value: u8) -> std::memory::OutOfMemory?;
  public fn pop_u8 (mut self: &StringBuilder) -> u8?;
  public fn get_u8 (self: &StringBuilder, index: i64) -> u8;
  public fn set_u8 (mut self: &StringBuilder, index: i64, value: u8) -> void;
  public fn into_string (mut self: &StringBuilder) -> std::result::Result(String, std::memory::OutOfMemory);
}

impl StringBuilder as std::interfaces::ReserveAdditional {
  public fn reserve_additional (mut self: &StringBuilder, additional: i64) -> std::memory::OutOfMemory?;
}
```

Notes:

- `StringBuilder` builds raw bytes. It can be converted into an owned `String`
  via `into_string`; the resulting `String` can then yield a borrowed `string`
  view via `String.as_string()`.
- `StringBuilder` allocation failure is recoverable:
  - `init(cap)` returns `Err(AllocFailed)` when the initial allocation fails (or
    when `cap` is invalid),
  - `empty()` exists for infallible construction,
  - growth paths (`push_u8`, `reserve_additional`, `into_string`) return
    `std::memory::OutOfMemory?` / `Result(...)` and leave the builder unchanged
    on failure (including internal size arithmetic overflow).
- `StringBuilder` conforms to common `std::interfaces` protocols:
  - `Len`, `Capacity`, `IsEmpty`, `Clear`, `ReserveAdditional`, `WriteU8`, and `Drop`.

An owned `String` type exists today for dynamically produced strings:

```silk
struct String {
  ptr: u64,
  cap: i64,
  len: i64,
}

impl String {
  public fn empty () -> String;
  public fn from_string (s: string) -> std::result::Result(String, std::memory::OutOfMemory);
  public fn from_buffer_u8 (mut v: &std::buffer::BufferU8) -> std::result::Result(String, std::memory::OutOfMemory);
  public fn as_string (self: &String) -> string;

  public fn push_u8 (mut self: &String, value: u8) -> std::memory::OutOfMemory?;
  public fn push_string (mut self: &String, s: string) -> std::memory::OutOfMemory?;
  public fn push_repeat_u8 (mut self: &String, byte: u8, count: i64) -> std::memory::OutOfMemory?;

  public fn trim (mut self: &String) -> void;
  public fn trim_start (mut self: &String) -> void;
  public fn trim_end (mut self: &String) -> void;

  public fn pad_left (mut self: &String, min_len: i64, pad: string) -> std::memory::OutOfMemory?;
  public fn pad_right (mut self: &String, min_len: i64, pad: string) -> std::memory::OutOfMemory?;
  public fn pad_center (mut self: &String, min_len: i64, pad: string) -> std::memory::OutOfMemory?;
}
```

Notes:

- The current `String` maintains a trailing NUL terminator so the
  `string` view it yields is safe to pass to C APIs that expect `const char *`.
- The current `String` implementation does **not** validate UTF‑8.
- `String.as_string()` yields a non-owning view into the `String` allocation;
  callers must not use the returned `string` after the `String` is dropped.

## Scope

`std::strings` is responsible for:

- Construction, slicing, and concatenation.
- UTF-8-aware utilities (iteration by `char`, validation when constructing from
  raw bytes).
- Interoperability with FFI (`SilkString`, C-string compatibility).

Non-goals (initially):

- Locale-aware collation and normalization (future work).
- Full Unicode grapheme segmentation (future work).

## Core Types (Initial Design)

The language provides a built-in `string` type (an immutable UTF-8 byte
sequence). The stdlib adds:

- `Str` — a non-owning view over UTF-8 bytes (useful when the caller wants an
  explicit view type rather than `string`).
- `String` — an owning, growable UTF-8 string backed by `Buffer(u8)` plus a
  length (a dynamic array of bytes that maintains UTF-8 validity).
- `StringBuilder` — a convenience for incremental construction; typically a
  thin wrapper around `String` or a packed byte buffer (for example
  `std::buffer::BufferU8`).

Key invariants:

- `String` must always contain valid UTF-8.
- When converting a `String` to a `string` for FFI, the backing storage must be
  null-terminated (with the trailing `\0` byte not counted in `.len`), matching
  the external-call contract in `docs/language/ext.md`.

## API Sketch (Illustrative)

These signatures are illustrative and will be refined alongside the language
features required to implement them (references, generics, enums/results, etc.).

```silk
module std::strings;

export struct String {
  // Invariant: `buf[0..len]` is valid UTF-8; `buf[len] == 0` for C interop.
  buf: Buffer(u8),
  len: int,
}

export fn empty () -> String;
export fn from_string (alloc: std::memory::Allocator, s: string) -> String;
export fn from_utf8 (alloc: std::memory::Allocator, bytes: std::arrays::Slice(u8)) -> Result(String, Utf8Error);

export fn as_string (s: &String) -> string;
export fn len_bytes (s: string) -> int;
export fn is_empty (s: string) -> bool;

export fn starts_with (s: string, prefix: string) -> bool;
export fn ends_with (s: string, suffix: string) -> bool;
export fn find (s: string, needle: string) -> int?;

export fn concat (alloc: std::memory::Allocator, a: string, b: string) -> String;
```

## FFI Interop

`string` values crossing the C ABI use `SilkString { ptr, len }` as documented
in `docs/language/ext.md` and `docs/compiler/abi-libsilk.md`.

`std::strings` should provide helpers for common interop patterns:

- Passing `string` to C APIs that expect `const char *` (use `.ptr`; Silk’s
  runtime representation guarantees a trailing NUL).
- Producing an owned, NUL-terminated string for FFI calls that require the
  backing storage to outlive the call (e.g. when C stores the pointer).

## Future Work

- `split`, `replace`, `join`.
- UTF-8 scalar iteration (`chars()`), case mapping, and normalization.
- Formatting integration (shared with `std::io`).

Implementation must respect the ownership and lifetime rules from
`docs/language/ext.md` and `docs/language/buffers.md`.
