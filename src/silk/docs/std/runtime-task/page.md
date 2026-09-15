---
layout: "docs"
description: "Source: std/runtime/task.slk"
docsCollection: "silk"
section: "std"
order: 209
sourcePath: "std/runtime-task.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::task`](/silk/docs/std/runtime-task/)

Source: [`std/runtime/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/task.slk)

This is the exact canonical documentation page for [`std::runtime::task`](/silk/docs/std/runtime-task/).

## Role

[`std::runtime::task`](/silk/docs/std/runtime-task/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [task](/silk/docs/std/task/)

## Notes

- The shipped source for this module is [`std/runtime/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/task.slk).
- The canonical module name is [`std::runtime::task`](/silk/docs/std/runtime-task/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
