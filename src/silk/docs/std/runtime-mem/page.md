---
layout: "docs"
description: "Source: std/runtime/mem.slk"
docsCollection: "silk"
section: "std"
order: 188
sourcePath: "std/runtime-mem.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::mem`](/silk/docs/std/runtime-mem/)

Source: [`std/runtime/mem.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/mem.slk)

This is the exact canonical documentation page for [`std::runtime::mem`](/silk/docs/std/runtime-mem/).

## Role

[`std::runtime::mem`](/silk/docs/std/runtime-mem/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Exported API

The selected backend exports:

```silk
fn alloc (bytes: i64) -> u64;
fn realloc (ptr: u64, bytes: i64) -> u64;
fn free (ptr: u64) -> void;
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

`alloc`, `realloc`, and `free` use the active runtime allocation context. Their
region-aware behavior and ownership rules are specified in [runtime](/silk/docs/std/runtime/).
`string_ptr` and `string_len` inspect existing string storage without
transferring ownership. `char_to_u32` exposes the scalar value of a `char`,
`trunc_u8` returns the low eight bits, and `page_size` reports the backend page
size.

## Unsafe Contracts

Calling any `unsafe fn` above requires an `unsafe` context. Before making the
call, the caller must establish all of the following relevant invariants:

- `ptr + offset` does not overflow.
- `load_u8` addresses one initialized, readable byte in a live allocation.
- `store_u8` addresses one writable byte in a live allocation.
- `load_u64` addresses eight initialized, readable bytes with the alignment
 required by the active target.
- `store_u64` addresses eight writable bytes with the alignment required by the
 active target.
- `string_from_ptr_len` receives a non-negative length and a readable,
 non-overflowing byte range that remains live and unchanged for the full
 lifetime of the returned borrowed string. It does not take ownership or copy
 the bytes. Callers must also honor the text assumptions of later string
 operations.

The unsafe boundary records that these obligations were reviewed; it does not
insert bounds, lifetime, initialization, writeability, or alignment checks.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [memory](/silk/docs/std/memory/)

## Notes

- The shipped source for this module is [`std/runtime/mem.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/mem.slk).
- The canonical module name is [`std::runtime::mem`](/silk/docs/std/runtime-mem/).
- Downstream users should usually start with the higher-level std module docs
 listed above unless they are implementing a runtime or a low-level container.
