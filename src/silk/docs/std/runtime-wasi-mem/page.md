---
layout: "docs"
description: "Source: std/runtime/wasi/mem.slk"
docsCollection: "silk"
section: "std"
order: 217
sourcePath: "std/runtime-wasi-mem.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/)

Source: [`std/runtime/wasi/mem.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/mem.slk)

This is the exact canonical documentation page for [`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/).

## Role

[`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Exported API

The WASI Preview 1 backend exports:

```silk
fn alloc (bytes: i64) -> u64;
fn realloc_ptr (ptr: u64, bytes: i64) -> u64;
fn free_ptr (ptr: u64) -> void;
unsafe fn load_u8 (ptr: u64, offset: i64) -> u8;
unsafe fn store_u8 (ptr: u64, offset: i64, value: u8) -> void;
unsafe fn load_u64 (ptr: u64, offset: i64) -> u64;
unsafe fn store_u64 (ptr: u64, offset: i64, value: u64) -> void;
fn string_ptr (s: string) -> u64;
fn string_len (s: string) -> i64;
unsafe fn string_from_ptr_len (ptr: u64, len: int) -> string;
fn char_to_u32 (value: char) -> int;
fn trunc_u8 (value: int) -> u8;
fn page_size () -> i64;
```

`alloc`, `realloc_ptr`, and `free_ptr` adapt the allocator supplied by the WASI
toolchain. Zero or negative requested sizes produce a null address, and
`free_ptr(0)` is a no-op. `string_ptr` and `string_len` inspect existing string
storage without transferring ownership. `page_size` reports the WebAssembly
memory page size of 65536 bytes.

## Unsafe Contracts

The raw memory and borrowed-string functions have the same unsafe contract as
[`std::runtime::mem`](/silk/docs/std/runtime-mem/):

- `ptr + offset` must not overflow or leave the active WebAssembly memory.
- byte loads require one initialized, readable byte; byte stores require one
 writable byte.
- `u64` loads require eight initialized, readable bytes; `u64` stores require
 eight writable bytes. The address must meet the active target's alignment
 requirement.
- `string_from_ptr_len` requires a non-negative length and a readable,
 non-overflowing byte range that remains live and unchanged for the returned
 borrowed string's entire lifetime. The function neither copies nor owns the
 storage.

An `unsafe` context does not add runtime validation for these obligations.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [memory](/silk/docs/std/memory/)

## Notes

- The shipped source for this module is [`std/runtime/wasi/mem.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/mem.slk).
- The canonical module name is [`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/).
- Downstream users should usually start with the higher-level std module docs
 listed above unless they are implementing a runtime backend.
