---
layout: "docs"
title: "std::runtime::wasi::cwd"
description: "Source: std/runtime/wasi/cwd.slk"
docsCollection: "silk"
section: "std"
order: 212
sourcePath: "std/runtime-wasi-cwd.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/)

Source: [`std/runtime/wasi/cwd.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/cwd.slk)

This is the exact canonical documentation page for [`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/).

## Role

[`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [process](/silk/docs/std/process/)
- [fs](/silk/docs/std/fs/)

## Notes

- The shipped source for this module is [`std/runtime/wasi/cwd.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/cwd.slk).
- The canonical module name is [`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
