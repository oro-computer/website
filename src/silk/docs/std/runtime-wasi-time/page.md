---
layout: "docs"
title: "std::runtime::wasi::time"
description: "Source: std/runtime/wasi/time.slk"
docsCollection: "silk"
section: "std"
order: 224
sourcePath: "std/runtime-wasi-time.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/)

Source: [`std/runtime/wasi/time.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/time.slk)

This is the exact canonical documentation page for [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/).

## Role

[`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [temporal](/silk/docs/std/temporal/)

## Notes

- The shipped source for this module is [`std/runtime/wasi/time.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/time.slk).
- The canonical module name is [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/).
- This module backs [`std::runtime::time`](/silk/docs/std/runtime-time/) on `wasm32-wasi` after the compiler
 rewrites the shipped runtime import path.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
