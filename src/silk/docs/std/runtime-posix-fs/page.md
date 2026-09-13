---
layout: "silk-docs"
title: "std::runtime::posix::fs"
description: "Source: std/runtime/posix/fs.slk"
docsCollection: "silk"
section: "std"
order: 195
sourcePath: "std/runtime-posix-fs.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/)

Source: [`std/runtime/posix/fs.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/fs.slk)

This is the exact canonical documentation page for [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/).

## Role

[`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [fs](/silk/docs/std/fs/)

## Notes

- The shipped source for this module is [`std/runtime/posix/fs.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/fs.slk).
- The canonical module name is [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/).
- The shipped POSIX backend now exposes the stable raw-stat fill helpers used
 by [`std::runtime::fs::{stat,lstat,fstat}`](/silk/docs/std/runtime-fs/) and therefore by [`std::fs::Stats`](/silk/docs/std/fs/),
 plus `fstat_size` for allocation-free descriptor size probes.
- It exposes a borrowed `readdir(3)` entry-fill helper for
 [`std::fs::Dir.next_view()`](/silk/docs/std/fs/), including stable directory-entry type codes when
 `d_type` is available.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
