---
layout: "docs"
title: "std::runtime::atomic"
description: "std::runtime::atomic is the stdlib runtime interface used by std::atomic."
docsCollection: "silk"
section: "std"
order: 179
sourcePath: "std/runtime-atomic.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::atomic`](/silk/docs/std/runtime-atomic/)

[`std::runtime::atomic`](/silk/docs/std/runtime-atomic/) is the stdlib runtime interface used by
[`std::atomic`](/silk/docs/std/atomic/).

This module is implementation-facing. User code should import [`std::atomic`](/silk/docs/std/atomic/)
instead.

## Surface

The module exports low-level functions for one atomic storage width:

- `u64_load(ptr, order) -> u64`
- `u64_store(ptr, value, order) -> void`
- `u64_swap(ptr, value, order) -> u64`
- `u64_fetch_add(ptr, value, order) -> u64`
- `u64_fetch_sub(ptr, value, order) -> u64`
- `u64_compare_exchange(ptr, expected, desired, success, failure) -> bool`
- `fence(order) -> void`

`ptr` is a raw pointer represented as `u64`. `order`, `success`, and `failure`
use the numeric encoding documented by [`std::atomic::Ordering`](/silk/docs/std/atomic/).

The shipped implementation delegates to [`std::runtime::posix::atomic`](/silk/docs/std/runtime-posix-atomic/).
