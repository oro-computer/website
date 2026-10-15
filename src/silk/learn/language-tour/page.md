# Language tour

A box holds two notebooks. Use a loop to count the boxes for an order, then label its delivery speed.

**Before you start:** finish [First program](/silk/learn/getting-started/). In `first-silk`, create a separate file; do not append it to `main.slk`.

## 1. Write the packing rule

### `src/packing.slk`

```silk
package packing;

import { println } from "std/io";
import { expect_equal } from "std/test";

fn boxes_needed (items: int) -> int {
  let mut remaining = items;
  let mut boxes = 0;
  while remaining > 0 {
    remaining = remaining - 2;
    boxes = boxes + 1;
  }
  return boxes;
}

fn delivery_label (days: int) -> string {
  if days <= 1 {
    return "express";
  }
  return "standard";
}

fn main () -> int {
  println("Pack {d} boxes", boxes_needed(5));
  println("Delivery: {s}", delivery_label(2));
  return 0;
}

test "empty order needs no boxes" {
  expect_equal(0, boxes_needed(0));
}

test "a full box fits two items" {
  expect_equal(1, boxes_needed(2));
}

test "an odd item needs another box" {
  expect_equal(3, boxes_needed(5));
}
```

`let mut` marks values that change. For five items, `remaining` goes **5 → 3 → 1 → −1** and `boxes` reaches **3**. The last box is partly empty. Inputs assume non-negative item counts and positive delivery days.

## 2. Run this file

### Terminal

```bash
silk check src/packing.slk
silk test src/packing.slk
silk build src/packing.slk -o build/packing
./build/packing
```

**Expected result:** three tests pass; the executable prints:

```text
Pack 3 boxes
Delivery: standard
```

## Try a change

Change the capacity to three. Run the tests before updating expectations: the five-item test should fail. Expect two boxes, rename the capacity test, and add a three-item case.

## Next

[Share the pricing rule between files →](/silk/learn/modules-and-packages/). For syntax details, see [loops](/silk/docs/language/flow-while/).
