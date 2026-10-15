---
layout: "docs"
description: "Prove that a withdrawal preserves its balance, then check a failing call."
docsCollection: "silk"
section: "guides"
order: 10
sourcePath: "guides/formal-silk.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Formal Silk

A withdrawal must not spend more than the balance. Write the rule beside the function and let the compiler prove it.

## Check a valid withdrawal

With a [configured Silk toolchain](/silk/docs/usage/getting-started/), save this as `withdraw.slk`. Amounts are whole cents.

```silk
#require balance >= 0;
#require amount >= 0 && amount <= balance;
#assure result == balance - amount;
#assure result >= 0;
fn withdraw (balance: int, amount: int) -> int {
  return balance - amount;
}

fn main () -> int {
  let remaining = withdraw(100, 30);
  #assert remaining == 70;
  return 0;
}
```

`#require` is proved at each call. `#assure` is proved for the function body, and `#assert` checks the remaining balance.

```bash
mkdir -p build
silk check --verify withdraw.slk
silk build withdraw.slk -o build/withdraw
./build/withdraw
echo $?
```

Expect no app output and exit status `0`. Verification uses Z3 at compile time; it adds no runtime check here. `build` verifies by default; `check` needs `--verify`.

## Try a failing call

Change `withdraw(100, 30)` to `withdraw(100, 130)` and run `silk check --verify` again. The precondition cannot be proved, so compilation should fail. Restore the valid call before continuing.

For an amount read from user input, validate it first with [ordinary error handling](/silk/learn/results-and-errors/). A proof does not replace input validation.

## Prove the next rule

Use [loop specifications](/silk/docs/language/formal-verification/) for bounds and progress, or reuse [standard theories](/silk/docs/std/formal/). The [Formal Silk tutorial](/silk/docs/usage/tutorials/07-formal-silk/) applies proofs to larger workflows.

For directive syntax, fixed-width arithmetic, and proof failures, use the [formal verification reference](/silk/docs/language/formal-verification/).

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
