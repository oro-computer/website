# Results and errors

`pickup` is free; `delivery` costs 500 cents. A misspelled choice should explain the problem and return a failing exit status.

**Before you start:** use `first-silk` from [First program](/silk/learn/getting-started/). Compile this file on its own.

## 1. Validate the choice

### `src/shipping.slk`

```silk
package shipping;

import args from "std/args";
import { println } from "std/io";
import { expect } from "std/test";

type ShippingFee = Result(int, string);

fn shipping_fee (method: string) -> ShippingFee {
  if method == "pickup" { return Ok(0); }
  if method == "delivery" { return Ok(500); }
  return Err("Choose pickup or delivery.");
}

fn main (argc: int, argv: u64) -> int {
  let arguments = args::Args.init(argc, argv);
  if arguments.count() != 2 {
    println("Usage: shipping <pickup|delivery>");
    return 2;
  }
  match (shipping_fee(arguments.get(1))) {
    ShippingFee::Ok(fee) => {
      println("Shipping: {d} cents", fee);
      return 0;
    },
    ShippingFee::Err(message) => {
      println("{s}", message);
      return 1;
    },
  }
}

test "pickup is free" {
  match (shipping_fee("pickup")) {
    ShippingFee::Ok(fee) => { expect(fee == 0); },
    ShippingFee::Err(_) => { expect(false); },
  }
}

test "delivery costs 500 cents" {
  match (shipping_fee("delivery")) {
    ShippingFee::Ok(fee) => { expect(fee == 500); },
    ShippingFee::Err(_) => { expect(false); },
  }
}

test "unknown delivery method has a useful error" {
  match (shipping_fee("drone")) {
    ShippingFee::Ok(_) => { expect(false); },
    ShippingFee::Err(message) => {
      expect(message == "Choose pickup or delivery.");
    },
  }
}
```

`Result(int, string)` carries a fee or an explanation. `match` handles both. `Args` reads command-line strings; index `0` is the executable name.

## 2. Run valid and invalid choices

### Terminal

```bash
silk check src/shipping.slk
silk test src/shipping.slk
silk build src/shipping.slk -o build/shipping
./build/shipping pickup
./build/shipping delivery
```

**Expected result:** three tests pass. The runs print `Shipping: 0 cents` and `Shipping: 500 cents`, both with exit status `0`.

### Terminal — invalid choice

```bash
./build/shipping drone
echo $?
```

**Expected result:** `Choose pickup or delivery.` then `1`. `$?` reports the preceding command's exit status. Without an argument, expect usage and status `2`.

## Try a change

Add `bike` with a 250-cent fee. Update usage and error messages, add a test, and run it. Keep the unknown-method test.

## Next

Use `Result` for expected validation failures; see [typed errors](/silk/docs/language/errors/) for contract errors. Continue with [filesystem workflows](/silk/docs/usage/tutorials/04-filesystem/) or [testing](/silk/docs/guides/testing/).
