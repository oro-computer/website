# Silk Wiki

The Silk Wiki is the learning-first, example-driven side of the Silk
documentation set.

Use it when you want:

- a practical explanation of a concept,
- examples that show how a feature feels in real code,
- a gentler progression than the full reference material.

Choose the layer that matches your goal:

- [Wiki](?p=start) — guided explanations and compact examples,
- [Docs](../docs/?p=start) — canonical language, stdlib, and toolchain docs,
- [Spec](../spec/2026/) — full language/specification mirror.

## Minimal shape

```silk
import { println } from "std/io";

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

## Start here

- New project: [Getting started](../docs/?p=usage/getting-started)
- Language: [Overview](?p=language/cheat-sheet)
- Standard library: [Overview](?p=std/overview)
- Tooling: [CLI](../docs/?p=guides/cli)
- Formal verification: [Formal Silk](?p=language/formal-verification)
