---
layout: "docs"
title: "Silk Wiki"
description: "The Silk Wiki is the learning-first, example-driven side of the Silk documentation set."
docsCollection: "silkWiki"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Silk Wiki

The Silk Wiki is the learning-first, example-driven side of the Silk
documentation set.

Use it when you want:

- a practical explanation of a concept,
- examples that show how a feature feels in real code,
- a gentler progression than the full reference material.

Choose the layer that matches your goal:

- [Wiki](/silk/wiki/) — guided explanations and compact examples,
- [Docs](/silk/docs/) — canonical language, stdlib, and toolchain docs,
- [Spec](/silk/spec/2026/) — full language/specification mirror.

## Minimal shape

```silk
import { println } from "std/io";

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

## Start here

- New project: [Getting started](/silk/docs/usage/getting-started/)
- Language: [Overview](/silk/wiki/language/cheat-sheet/)
- Standard library: [Overview](/silk/wiki/std/overview/)
- Tooling: [CLI](/silk/docs/guides/cli/)
- Formal verification: [Formal Silk](/silk/wiki/language/formal-verification/)
