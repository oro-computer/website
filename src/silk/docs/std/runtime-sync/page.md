---
layout: "docs"
description: "Source: std/runtime/sync.slk"
docsCollection: "silk"
section: "std"
order: 208
sourcePath: "std/runtime-sync.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::sync`](/silk/docs/std/runtime-sync/)

Source: [`std/runtime/sync.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/sync.slk)

This is the exact canonical documentation page for [`std::runtime::sync`](/silk/docs/std/runtime-sync/).

## Role

[`std::runtime::sync`](/silk/docs/std/runtime-sync/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [sync](/silk/docs/std/sync/)

## Notes

- The shipped source for this module is [`std/runtime/sync.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/sync.slk).
- The canonical module name is [`std::runtime::sync`](/silk/docs/std/runtime-sync/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
