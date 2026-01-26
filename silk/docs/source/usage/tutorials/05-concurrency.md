# Tutorial 5: concurrency basics (`async`, `task`, `yield`, `await`)

Silk’s concurrency model is built from two orthogonal modifiers:

- `async` — “this function can be awaited” (concurrency / pausable execution)
- `task` — “this function can run as a task” (parallel work / worker execution)

Calling a concurrency-marked function produces a **handle**:

- calling a `task fn ... -> T` produces a `Task(T)`
- calling an `async fn ... -> T` produces a `Promise(T)`

You then use:

- `yield` to receive values from tasks (and to send values from inside a task)
- `await` to unwrap promises

Reference: [Concurrency](?p=language/concurrency).

## 1) A minimal task + receiver

Create `concurrency_basic.slk`:

```silk
task fn add (a: int, b: int) -> int {
  return a + b;
}

async fn main () -> int {
  let h = add(1, 2); // h: Task(int)

  // `task { ... }` establishes a task context so `yield` is available.
  task {
    let v: int = yield h;
    if v != 3 { return 1; }
    return 0;
  }
}
```

Build and run:

```bash
silk check concurrency_basic.slk
silk build concurrency_basic.slk -o build/concurrency_basic
./build/concurrency_basic
```

What to notice:

- Calling `add(1, 2)` does not immediately give you an `int`; it gives you a handle.
- `yield h` receives the task’s produced value.
- The task/async split keeps “what can block” explicit in the code.

## 2) A minimal promise + `await`

Promises are the `async` counterpart:

```silk
async fn answer () -> int { return 42; }

async fn main () -> int {
  let p = answer();     // p: Promise(int)
  let v: int = await p; // unwrap the promise
  if v != 42 { return 1; }
  return 0;
}
```

## Why this model is valuable

Silk’s concurrency keywords are intentionally explicit because they communicate “shape”:

- If a function is `async`, callers know they’re getting a promise-like handle.
- If a function is `task`, callers know they’re spawning work that must be joined/drained.
- `yield`/`await` make synchronization points visible in code review (no hidden “maybe blocks here”).

## Next

- Reference: `std::task` and `std::sync` (sidebar → standard library)

