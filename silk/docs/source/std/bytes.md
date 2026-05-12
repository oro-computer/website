# `std::bytes`

`std::bytes` is the byte-oriented facade for allocation-free work over borrowed
memory. It reuses `std::arrays::ByteSlice` as the concrete slice type and gives
CLI/search/build tools short, stable names for common hot-path operations.

## Exported API

```silk
module std::bytes;

export type ByteSlice = std::arrays::ByteSlice;

export fn from_raw (ptr: u64, len: i64) -> ByteSlice;
export fn from_string (s: string) -> ByteSlice;

export fn memchr (haystack: ByteSlice, needle: u8) -> i64?;
export fn memmem (haystack: ByteSlice, needle: ByteSlice) -> i64?;
export fn memcmp (a: ByteSlice, b: ByteSlice) -> int;
export fn equal (a: ByteSlice, b: ByteSlice) -> bool;
export fn copy (dst: ByteSlice, src: ByteSlice) -> i64;
export fn copy_nonoverlapping (dst: ByteSlice, src: ByteSlice) -> i64;

export fn starts_with (haystack: ByteSlice, prefix: ByteSlice) -> bool;
export fn ends_with (haystack: ByteSlice, suffix: ByteSlice) -> bool;
export fn contains (haystack: ByteSlice, needle: ByteSlice) -> bool;

export fn is_ascii_alpha (b: u8) -> bool;
export fn is_ascii_digit (b: u8) -> bool;
export fn is_ascii_alnum (b: u8) -> bool;
export fn is_ascii_whitespace (b: u8) -> bool;
export fn to_ascii_lower (b: u8) -> u8;
export fn to_ascii_upper (b: u8) -> u8;
export fn ascii_equal_ignore_case (a: ByteSlice, b: ByteSlice) -> bool;
export fn find_ascii_ignore_case (haystack: ByteSlice, needle: ByteSlice) -> i64?;
```

## Ownership

`ByteSlice` is a borrowed view. None of these helpers allocate or take
ownership of memory. Returned offsets are byte offsets into the input slice.

`copy(dst, src)` copies at most `min(dst.len, src.len)` bytes and returns the
number of bytes copied. It is overlap-safe and may be used like a small
`memmove` helper.

`copy_nonoverlapping(dst, src)` has the same count/return behavior, but its
contract requires that the regions do not overlap. Use it for buffer growth and
output assembly paths where the caller already knows that `memcpy` semantics are
valid.

## Relationship To `std::arrays`

`std::arrays::ByteSlice` remains the canonical packed-byte view type used by
existing OS/FFI APIs. `std::bytes::ByteSlice` is an alias plus a focused
function surface for byte search and comparison.

## Current Performance Note

On hosted targets, `memchr`, `memcmp`, `copy`, and `copy_nonoverlapping` are
backed by runtime/libc byte primitives, and `memmem` uses a runtime helper built
from `memchr` plus `memcmp`. The public contract remains the borrowed
`ByteSlice` contract above; applications should not import runtime or libc byte
bindings directly for these common search/copy paths.
