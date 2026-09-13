---
layout: "silk-docs"
title: "std::runtime::env"
description: "Source: std/runtime/env.slk"
docsCollection: "silk"
section: "std"
order: 182
sourcePath: "std/runtime-env.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime::env`](/silk/docs/std/runtime-env/)

Source: [`std/runtime/env.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/env.slk)

This is the exact canonical documentation page for [`std::runtime::env`](/silk/docs/std/runtime-env/).

## Role

[`std::runtime::env`](/silk/docs/std/runtime-env/) is an implementation-facing runtime module in the shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](/silk/docs/std/runtime/)
- [env](/silk/docs/std/env/)

## Notes

- The shipped source for this module is [`std/runtime/env.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/env.slk).
- The canonical module name is [`std::runtime::env`](/silk/docs/std/runtime-env/).
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
