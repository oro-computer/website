---
layout: "docs"
description: "Extract a pricing rule into a module, then reuse it from a receipt program."
docsCollection: "silk"
section: "guides"
order: 4
sourcePath: "guides/modules-and-packages.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Modules, packages, and publication

A receipt needs pricing, but another tool may need the same rule. Put the calculation in its own module and export it.

## Create the files

With [Silk installed](/silk/docs/usage/getting-started/), create a fresh workspace:

```bash
mkdir order-modules
cd order-modules
mkdir src build
```

### `src/pricing.slk`

```silk
package orders::pricing;

import { expect_equal } from "std/test";

export fn order_total (unit_price: int, quantity: int, delivery: int) -> int {
  return unit_price * quantity + delivery;
}

test "shared pricing includes delivery once" {
  expect_equal(2900, order_total(1200, 2, 500));
}
```

### `src/main.slk`

```silk
package orders::receipt;

import { println } from "std/io";
import { order_total } from "./pricing.slk";

fn main () -> int {
  println("Receipt: {d} cents", order_total(1200, 2, 500));
  return 0;
}
```

`export` makes the rule available to the importer. `./pricing.slk` is relative to `main.slk`. Source namespaces use `::`; quoted file paths use `/`.

## Build the module set

```bash
silk check src/main.slk src/pricing.slk
silk test src/main.slk src/pricing.slk
silk build src/main.slk src/pricing.slk -o build/receipt
./build/receipt
```

The pricing test should pass and the receipt should print `Receipt: 2900 cents`.

## Give the package a home

When listing files becomes repetitive, [add a manifest](/silk/learn/modules-and-packages/#1-create-the-package) and use `--package .`. For another package on disk, add a [local dependency](/silk/docs/guides/project-dependencies/).

Before sharing a package, define its [distribution files](/silk/docs/compiler/package-distribution/). Keep [ABI definitions](/silk/docs/compiler/abi-libsilk/) separate from normal source imports.

## Reference

[Import grammar](/silk/docs/language/packages-imports-exports/) · [Manifest fields](/silk/docs/compiler/package-manifests/) · [Prelude globals](/silk/docs/std/runtime-globals/)

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="the-model"></span>
<span id="file-layout"></span>
<span id="defining-modules"></span>
<span id="import-style-for-user-space-code"></span>
<span id="std-prelude-globals"></span>
<span id="direct-package-and-symbol-imports"></span>
<span id="exports"></span>
<span id="manifests-and-module-loading"></span>
<span id="dependencies"></span>
<span id="publishing-through-github"></span>
<span id="publishing-through-npm"></span>
<span id="targets-and-platform-selection"></span>
<span id="abi-and-ffi-packages"></span>
<span id="best-practices"></span>
<span id="next"></span>
