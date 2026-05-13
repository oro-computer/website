# Expression statements

Many expressions can appear as standalone statements when followed by `;`
(assignment, calls, `++`/`--`, and other “statement-like” expressions).

Reference: [expression statements](../docs/?p=language/flow-expression-statements).

## What They Are

An expression statement evaluates an expression for its effects and discards the
result.

```silk
fn main () -> int {
  let mut x: int = 0;
  x += 1;
  ++x;
  return x;
}
```

Assignments and increments are common expression statements because their
purpose is the state change.

## Calls

Function calls can be statements when the useful result is the side effect:

```silk
import io from "std/io";

fn main () -> int {
  io::println("hello");
  return 0;
}
```

If the call returns a value you need, bind it instead:

```silk
fn main () -> int {
  let value: int = compute();
  return value;
}
```

## Async Forms

In async code, `await` can appear as a statement when the promise result is
`void` or intentionally discarded:

```silk
async fn flush () -> void {}

async fn main () -> int {
  await flush();
  return 0;
}
```

Task code similarly uses `yield` where the task interaction is the point of the
statement.

## What Not To Do

Do not leave pure computations as statements:

```silk
fn main () -> int {
  // Prefer: let x: int = 1 + 2;
  1 + 2;
  return 0;
}
```

Bind the value, return it, pass it to a function, or use it in control flow.

## See also

- Reference: [expression statements](../docs/?p=language/flow-expression-statements)
- Operators: [operators](?p=language/operators)
- Blocks: [blocks and statements](?p=language/flow-blocks-statements)
- Concurrency: [concurrency](?p=language/concurrency)
