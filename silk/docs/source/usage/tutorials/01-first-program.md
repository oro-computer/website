# Tutorial 1: your first program

This tutorial gets you from “a file” to “a runnable program” with the smallest useful workflow:

- `silk check` to validate code quickly
- `silk build` to produce an executable
- (optionally) `silk test` to run language-level tests

## 1) Create a minimal program

Create `hello.slk`:

```silk
import std::io::println;

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

## 2) Check it

```bash
silk check hello.slk
```

`check` is meant to be cheap: it answers “does this module set parse and type-check?”

## 3) Build and run

```bash
silk build hello.slk -o build/hello
./build/hello
```

On hosted platforms, `main` returns a conventional process exit code (`0` means success).

## 4) Add a tiny test (optional)

Add this to the same file:

```silk
import std::test::expect_equal;

fn add (a: int, b: int) -> int { return a + b; }

test "add returns the sum" {
  expect_equal(3, add(1, 2));
}
```

Run:

```bash
silk test hello.slk
```

## Next

- More workflows: [CLI examples](?p=usage/cli-examples)
- Tutorial 2: [Structs and `impl`](?p=usage/tutorials/02-structs-and-impls)
