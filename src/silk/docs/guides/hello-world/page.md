---
layout: "docs"
description: "Build an order calculator, test its pricing rules, and run the native executable with a known result."
docsCollection: "silk"
section: "guides"
order: 2
sourcePath: "guides/hello-world.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Hello world

Two notebooks at 1,200 cents each plus 500 cents delivery should total **2,900 cents**. Check that rule with a small program.

**Before you start:** [install Silk and its standard library](/silk/docs/usage/getting-started/). Commands use a POSIX shell on Linux or macOS.

For a step-by-step walkthrough, follow [Learn Silk: First program](/silk/learn/getting-started/).

## The smallest useful program

Create a workspace:

```bash
mkdir silk-orders
cd silk-orders
mkdir src build
```

Save this complete file as **`src/main.slk`**:

```silk
package orders;

import { println } from "std/io";
import { expect_equal } from "std/test";

fn order_total (unit_price: int, quantity: int, delivery: int) -> int {
  return unit_price * quantity + delivery;
}

fn main () -> int {
  let total = order_total(1200, 2, 500);
  println("Order total: {d} cents", total);
  return 0;
}

test "two notebooks with delivery" {
  expect_equal(2900, order_total(1200, 2, 500));
}

test "collection has no delivery fee" {
  expect_equal(2400, order_total(1200, 2, 0));
}
```

Prices use whole cents. The tests cover delivery and collection; [results and errors](/silk/learn/results-and-errors/) adds input validation.

## Check, test, build, and run

Run from `silk-orders`:

<!-- tabs:start Run the order calculator -->

### Build and run

```bash
silk check src/main.slk
silk build src/main.slk -o build/orders
./build/orders
```

Expected stdout:

```text
Order total: 2900 cents
```

`check` validates the source; only `build` creates `build/orders`. The executable exits with status `0`.

### Run the tests

```bash
silk test src/main.slk
```

Expected result: both named tests pass in TAP output. A failing assertion makes the test command fail, so this same command is useful in CI.

### Change the order

In `main`, change the quantity from `2` to `3`. Then:

```bash
silk build src/main.slk -o build/orders
./build/orders
silk test src/main.slk
```

Expected stdout from the app: `Order total: 4100 cents`. The original tests still pass because their inputs are unchanged. Add a third test for the three-notebook order.

<!-- tabs:end -->

## Next

[Plan the packing](/silk/learn/language-tour/), [share the pricing rule](/silk/learn/modules-and-packages/), or [read a file](/silk/docs/guides/standard-library/). For setup problems, return to [toolchain setup](/silk/docs/usage/getting-started/).

<a id="hello-standard-library"></a>
<a id="concurrency-async-and-task"></a>
<a id="formal-silk-invariant-variant-monovariant"></a>
<a id="webassembly-and-wasi"></a>

For API details, use the [standard library reference](/silk/docs/std/overview/) or [CLI and toolchain guide](/silk/docs/guides/cli/).
