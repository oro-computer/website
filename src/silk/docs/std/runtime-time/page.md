---
layout: "docs"
title: "std::runtime::time"
description: "Source: std/runtime/time.slk"
docsCollection: "silk"
section: "std"
order: 210
sourcePath: "std/runtime-time.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::time`](/silk/docs/std/runtime-time/)

Source: [`std/runtime/time.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/time.slk)

This is the exact canonical documentation page for [`std::runtime::time`](/silk/docs/std/runtime-time/).

## Role

[`std::runtime::time`](/silk/docs/std/runtime-time/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [temporal](/silk/docs/std/temporal/)

## Notes

- The shipped source for this module is [`std/runtime/time.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/time.slk).
- The canonical module name is [`std::runtime::time`](/silk/docs/std/runtime-time/).
- On `wasm32-wasi`, the shipped implementation rewrites its delegated backend
 imports to [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/) so higher-level modules such as
 [`std::temporal`](/silk/docs/std/temporal/) keep the same public contract across hosted and WASI targets.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
