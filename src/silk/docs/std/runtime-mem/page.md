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

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [memory](/silk/docs/std/memory/)

## Notes

- The shipped source for this module is [`std/runtime/mem.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/mem.slk).
- The canonical module name is [`std::runtime::mem`](/silk/docs/std/runtime-mem/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
