---
layout: "silk-docs"
title: "std::runtime::build"
description: "Source: std/runtime/build.slk"
docsCollection: "silk"
section: "std"
order: 180
sourcePath: "std/runtime-build.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::build`](/silk/docs/std/runtime-build/)

Source: [`std/runtime/build.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/build.slk)

This is the exact canonical documentation page for [`std::runtime::build`](/silk/docs/std/runtime-build/).

## Role

[`std::runtime::build`](/silk/docs/std/runtime-build/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [build](/silk/docs/std/build/)

## Notes

- The shipped source for this module is [`std/runtime/build.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/build.slk).
- The canonical module name is [`std::runtime::build`](/silk/docs/std/runtime-build/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
