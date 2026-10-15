# Modules and packages

Move pricing into its own file so a receipt program can reuse it.

**Before you start:** use the compiler from [First program](/silk/learn/getting-started/). Create a **new folder** to keep earlier `main` functions out of this package.

## 1. Create the package

### Terminal

```bash
mkdir order-tools
cd order-tools
mkdir src build
```

### `silk.toml`

```toml
[package]
name = "order_tools"
version = "0.1.0"

[sources]
include = ["src/**/*.slk"]

[[target]]
name = "receipt"
kind = "executable"
entry = "src/main.slk"
```

The manifest selects `src` files and gives the receipt one entry point.

## 2. Export the rule

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

`export` makes the function importable. Its test stays beside it.

## 3. Print a receipt

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

`./pricing.slk` resolves relative to `main.slk`; `std/io` comes from the installed standard library.

## 4. Build the package

Run from `order-tools`, beside `silk.toml`:

### Terminal

```bash
mkdir order-tools
cd order-tools
mkdir src build
```

**Expected result:** the pricing test passes and the executable prints:

```text
Receipt: 2900 cents
```

For an unknown imported name, check its path, `export`, and the manifest's include pattern. [Package manifests](/silk/docs/compiler/package-manifests/) covers dependencies and targets.

## Try a change

Set `main`'s delivery fee to `0`. Rebuild: expect **2,400 cents**. The shared delivery test should still pass.

## Next

[Handle a customer without an email address →](/silk/learn/types-and-optionals/)
