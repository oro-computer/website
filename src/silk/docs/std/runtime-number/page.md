---
layout: "docs"
title: "std::runtime::number"
description: "Source: std/runtime/number.slk"
docsCollection: "silk"
section: "std"
order: 190
sourcePath: "std/runtime-number.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::number`](/silk/docs/std/runtime-number/)

Source: [`std/runtime/number.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/number.slk)

This is the exact canonical documentation page for [`std::runtime::number`](/silk/docs/std/runtime-number/).

## Role

[`std::runtime::number`](/silk/docs/std/runtime-number/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [number](/silk/docs/std/number/)

## Notes

- The shipped source for this module is [`std/runtime/number.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/number.slk).
- The canonical module name is [`std::runtime::number`](/silk/docs/std/runtime-number/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
