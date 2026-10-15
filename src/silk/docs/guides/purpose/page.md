---
layout: "docs"
description: "Native tools and libraries with visible types, imports, and checked contracts."
docsCollection: "silk"
section: "guides"
order: 1
sourcePath: "guides/purpose.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# What Silk is for

Use Silk for native tools and libraries where callers need to see the dependencies, possible failures, and contracts in the source.

Start with [an order calculator](/silk/learn/getting-started/). As it grows, [share the pricing rule](/silk/learn/modules-and-packages/) and [handle invalid input](/silk/learn/results-and-errors/).

## Put a rule beside the code

A withdrawal must leave a non-negative balance. This contract fragment makes that rule checkable:

```silk
#require balance >= 0;
#require amount >= 0 && amount <= balance;
#assure result == balance - amount;
#assure result >= 0;
fn withdraw (balance: int, amount: int) -> int {
  return balance - amount;
}
```

The compiler proves the contract where it is used. [Run the full example](/silk/docs/guides/formal-silk/) to see an accepted call and a rejected one.

## Choose a path

Build a [command-line tool](/silk/learn/getting-started/), [reuse a package](/silk/docs/guides/project-dependencies/), or [expose a C ABI](/silk/docs/compiler/abi-libsilk/). Check [implementation status](/silk/docs/compiler/implementation-status/) when choosing a target or feature.

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="why-it-exists"></span>
<span id="the-shape-of-useful-silk"></span>
<span id="where-it-fits"></span>
<span id="the-payoff"></span>
