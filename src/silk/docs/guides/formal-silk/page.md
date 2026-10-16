---
layout: "docs"
description: "Validate CLI input at runtime and prove that every accepted withdrawal satisfies its numeric contract."
docsCollection: "silk"
section: "guides"
order: 10
sourcePath: "guides/formal-silk.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Formal Silk

Accept an amount from the command line, reject invalid requests, and prove that an accepted withdrawal cannot overdraw the balance.

Formal Silk is Silk’s compile-time verification language. `#require` states what callers must establish; `#assure` states what the function must guarantee. The compiler uses Z3 to prove these obligations across the modeled paths. The directives are erased from the executable.

External input still needs runtime checks: the compiler cannot know which text a user will type. A guard such as `if amount > balance { return -1; }` both rejects a bad request at runtime and establishes a fact the verifier uses on the remaining path.

## Parse, validate, then call the contracted function

With a [configured Silk toolchain](/silk/docs/usage/getting-started/), create this complete file. Prices and balances are whole cents; the demo starts with 10,000 cents. The balance is an in-memory example, not a persistent account.

### `withdraw.slk`

```silk
package withdrawals;

import args from "std/args";
import { println } from "std/io";
import number from "std/number";

#require balance >= 0;
#require amount >= 0 && amount <= balance;
#assure result == balance - amount;
#assure result >= 0 && result <= balance;
fn withdraw (balance: int, amount: int) -> int {
  return balance - amount;
}

// A negative result means the request was rejected.
fn try_withdraw (balance: int, amount: int) -> int {
  if balance < 0 { return -1; }
  if amount < 0 { return -1; }
  if amount > balance { return -1; }
  return withdraw(balance, amount);
}

fn main (argc: int, argv: u64) -> int {
  let arguments = args::Args.init(argc, argv);
  if arguments.count() != 2 {
    println("Usage: withdraw <amount-in-cents>");
    return 2;
  }
  match (number::atoi64(arguments.get(1))) {
    number::Atoi64Result::Ok(parsed) => {
      let remaining = try_withdraw(10000, parsed as int);
      if remaining < 0 {
        println("Amount must be between 0 and 10000 cents.");
        return 1;
      }
      println("Remaining: {d} cents", remaining);
      return 0;
    },
    number::Atoi64Result::Err(_) => {
      println("Enter a whole number of cents within the int range.");
      return 1;
    },
  }
}
```

The layers have separate jobs:

1. `Args` checks the argument count before reading index `1`.
2. `atoi64` parses the entire decimal input and reports invalid syntax or overflow. Parsing proves neither positivity nor affordability.
3. `try_withdraw` accepts arbitrary integers. Its ordinary `if` branches reject negative balances, negative amounts, and amounts above the balance. `-1` means rejection; every successful balance is non-negative.
4. At `withdraw(balance, amount)`, the compiler proves both preconditions from the branches that reached the call. It also proves that subtraction satisfies the stated postconditions for every permitted input, including zero and the full balance.

The bounds prevent subtraction from wrapping: `0 <= amount <= balance`, with a non-negative signed `int` balance, keeps the result between zero and the original balance. Formal Silk models integers at their fixed width; it does not silently treat them as unbounded mathematical integers.

## Build and exercise the boundary

```bash
mkdir -p build
silk check --verify withdraw.slk
silk build withdraw.slk -o build/withdraw
./build/withdraw 2500
```

**Expected result:** verification succeeds; the executable prints `Remaining: 7500 cents` and exits with status `0`. `build` verifies by default; plain `check` only type-checks, so use `check --verify` for proofs. Keep verification enabled in release and CI builds.

Try each request separately:

| Command | Expected output | Exit status |
| --- | --- | --- |
| `./build/withdraw 0` | `Remaining: 10000 cents` | 0 |
| `./build/withdraw 10000` | `Remaining: 0 cents` | 0 |
| `./build/withdraw -1` | `Amount must be between 0 and 10000 cents.` | 1 |
| `./build/withdraw 10001` | `Amount must be between 0 and 10000 cents.` | 1 |
| `./build/withdraw hello` | `Enter a whole number of cents within the int range.` | 1 |
| `./build/withdraw 9223372036854775808` | `Enter a whole number of cents within the int range.` | 1 |
| `./build/withdraw` | `Usage: withdraw <amount-in-cents>` | 2 |

In a POSIX shell, `echo $?` immediately after a command prints its exit status.

## Make a proof fail

Remove `if amount > balance { return -1; }` and run `silk check --verify withdraw.slk`. Expect `E3007`: the withdrawal call’s precondition may not hold. Restore the guard and verify again. Replacing the guard with `#assert amount <= balance;` also fails: an assertion asks for a proof; it does not validate input or supply a trusted assumption.

## Apply the same boundary to other sources

For a JSON request, configuration file, environment variable, or network message, decode the representation and handle decoding errors first. Pass the decoded integer through the same `try_withdraw` gate. Keep the gate’s checks beside the contracted call so every route to that call establishes its requirements.

The proof covers the numeric contracts and the checked call. It does not prove the parser’s implementation, the user’s identity, authorization, persistent storage, or concurrent account updates. Those need their own checks and design. An `unsafe` block supplies no proof facts. For expected application failures with richer messages, use [Results and errors](/silk/learn/results-and-errors/).

## Prove the next rule

Use [loop specifications](/silk/docs/language/formal-verification/) for bounds and progress, or reuse [standard theories](/silk/docs/std/formal/). The [Formal Silk tutorial](/silk/docs/usage/tutorials/07-formal-silk/) applies proofs to larger workflows.

For directive syntax, arithmetic, and proof failures, use the [formal verification reference](/silk/docs/language/formal-verification/).

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="where-directives-live"></span>
<span id="the-basic-pieces"></span>
<span id="syntax-one-screen"></span>
<span id="examples-copypaste"></span>
<span id="function-contracts"></span>
<span id="loop-specifications"></span>
<span id="block-local-proofs-assert-and-declarations-const"></span>
<span id="struct-requirements"></span>
<span id="theories-theory--theory"></span>
<span id="values-and-operators-what-you-can-write-in-specs"></span>
<span id="build-metadata-in-proofs"></span>
<span id="opaque-contracts-for-precompiled-helpers"></span>
<span id="real-world-example-packet-layout-and-constructor-safety"></span>
<span id="real-world-example-progress-guarantees-in-a-bounded-loop"></span>
<span id="reusing-stdformal-theories"></span>
<span id="choosing-the-right-directive"></span>
<span id="why-its-valuable"></span>
<span id="a-practical-workflow"></span>
<span id="debugging-failed-proofs"></span>
