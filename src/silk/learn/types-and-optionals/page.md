# Types and optionals

A customer can collect an order without supplying an email. Show an address when present and offer a printed receipt otherwise.

**Before you start:** return to `first-silk` from [First program](/silk/learn/getting-started/). Compile this new file on its own.

## 1. Represent the customer

### `src/customer.slk`

```silk
package customers;

import { println } from "std/io";
import { expect_equal } from "std/test";

struct Customer {
  name: string,
  email: string?,
}

fn receipt_email (customer: &Customer) -> string {
  return customer.email ?? "collect a printed receipt";
}

fn main () -> int {
  let ada = Customer{ name: "Ada", email: Some("ada@example.com") };
  let sam = Customer{ name: "Sam", email: None };
  println("{s}: {s}", ada.name, receipt_email(ada));
  println("{s}: {s}", sam.name, receipt_email(sam));
  return 0;
}

test "email is used when supplied" {
  let customer = Customer{ name: "Ada", email: Some("ada@example.com") };
  expect_equal("ada@example.com", receipt_email(customer));
}

test "missing email offers a printed receipt" {
  let customer = Customer{ name: "Sam", email: None };
  expect_equal("collect a printed receipt", receipt_email(customer));
}
```

`string?` holds `Some(address)` or `None`. `??` supplies the fallback for `None`; `&Customer` borrows the record. See [optionals](/silk/docs/language/optional/) for other ways to handle absence.

## 2. Check both cases

### Terminal

```bash
silk check src/customer.slk
silk test src/customer.slk
silk build src/customer.slk -o build/customer
./build/customer
```

**Expected result:** two tests pass; the executable prints:

```text
Ada: ada@example.com
Sam: collect a printed receipt
```

## Try a change

Give Sam `Some("sam@example.com")`. His receipt should show that address. Keep the missing-email test to protect the fallback.

## Next

[Explain why a delivery choice failed →](/silk/learn/results-and-errors/)
