---
layout: "docs"
description: "Source: std/runtime/posix/io.slk"
docsCollection: "silk"
section: "std"
order: 196
sourcePath: "std/runtime-posix-io.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/)

Source: [`std/runtime/posix/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/io.slk)

This is the exact canonical documentation page for [`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/).

## Role

[`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [io](/silk/docs/std/io/)

## Notes

- `fcntl(fd: i32, cmd: i32, arg: i32) -> i32` calls the bundled
 `silk_rt_fs_fcntl_int` fixed-signature wrapper. It supports commands with
 integer arguments (including `F_GETFD` and `F_SETFD`); pointer-valued commands
 are outside this binding's contract. Return values and `errno` follow libc.
 The wrapper supplies the platform's variadic calling convention, including
 stack-passed variadic arguments on Apple ARM64.

- The shipped source for this module is [`std/runtime/posix/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/io.slk).
- The canonical module name is [`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
