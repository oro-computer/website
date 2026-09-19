---
layout: "docs"
description: "Source: std/runtime/wasi/io.slk"
docsCollection: "silk"
section: "std"
order: 216
sourcePath: "std/runtime-wasi-io.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/)

Source: [`std/runtime/wasi/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/io.slk)

This is the exact canonical documentation page for [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/).

## Role

[`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [io](/silk/docs/std/io/)

## Notes

- The shipped source for this module is [`std/runtime/wasi/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/wasi/io.slk).
- The canonical module name is [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
