# First program

Two notebooks at 1,200 cents each plus 500 cents delivery should cost **2,900 cents**. Build a calculator to check the total.

**Before you start:** `silk --version` must work with its standard library installed. See [toolchain setup](/silk/docs/usage/getting-started/#build-from-source-reference-compiler). Commands use a POSIX shell on Linux or macOS.

## 1. Create a workspace

### Terminal

```bash
mkdir first-silk
cd first-silk
mkdir src build
```

Stay in `first-silk` for the remaining commands.

## 2. Calculate the total

Create this complete file:

### `src/main.slk`

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

Prices use whole cents. `main` prints the total; the tests cover delivery and collection. Inputs here are non-negative; [a later chapter handles invalid choices](/silk/learn/results-and-errors/).

## 3. Run it

### Terminal

```bash
silk check src/main.slk
silk test src/main.slk
silk build src/main.slk -o build/orders
./build/orders
```

**Expected result:** both tests pass and the executable prints:

```text
Order total: 2900 cents
```

`check` validates, `test` executes assertions, and `build` produces the executable. See [CLI help](/silk/docs/guides/cli/) for options.

## Try a change

Change the quantity in `main` to `3`. Rebuild: expect **4,100 cents**. Add a test for that order; the original tests should still pass.

## Next

[Work out how many boxes the order needs →](/silk/learn/language-tour/)
