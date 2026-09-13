---
layout: "silk-docs"
title: "std::runtime::process"
description: "Source: std/runtime/process.slk"
docsCollection: "silk"
section: "std"
order: 204
sourcePath: "std/runtime-process.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::process`](/silk/docs/std/runtime-process/)

Source: [`std/runtime/process.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/process.slk)

This is the exact canonical documentation page for [`std::runtime::process`](/silk/docs/std/runtime-process/).

## Role

[`std::runtime::process`](/silk/docs/std/runtime-process/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [process](/silk/docs/std/process/)

## Notes

- The shipped source for this module is [`std/runtime/process.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/process.slk).
- The canonical module name is [`std::runtime::process`](/silk/docs/std/runtime-process/).
- It includes the implementation-facing `executable_path_owned` bridge used by
 [`std::process::executable_path`](/silk/docs/std/process/).
- It includes the `effective_user_id` bridge used by
 [`std::process::effective_user_id`](/silk/docs/std/process/); hosted POSIX delegates to `geteuid(2)` and
 widens its `u32` ABI result to `u64`, while WASI Preview 1 returns its
 documented zero placeholder.
- It provides implementation-facing `set_process_group_self` and
 `kill_process_group` operations for the checked ownership surface in
 [`std::process::child`](/silk/docs/std/process-child/). The setter can only place the calling child into a
 group led by itself; the signal helper requires a positive, private group
 identity and negates it internally for POSIX `kill(2)`.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
