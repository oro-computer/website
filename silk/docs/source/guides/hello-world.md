# Hello world

This page teaches the Silk “shape of a program”: explicit imports, a normal `main`, and a workflow that makes it cheap to
iterate.

Assumption: you have a `silk` binary available on your PATH.

## The smallest program

Create a file named `hello.slk`:

```silk
import std::io::println;

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

### Why this looks the way it does

- **Imports are explicit.** If you want `println`, you import it. This keeps dependencies obvious and makes refactors
  safer.
- **`main` is a normal function.** Executables use a conventional entrypoint. There isn’t a special “program block” that
  behaves differently from the rest of the language.
- **The return type is explicit.** `-> int` is the process exit code on hosted platforms. A successful run returns `0`.

## Iteration loop: check → test → build

Most Silk workflows are intentionally simple:

```bash
silk check hello.slk
silk test hello.slk
silk build hello.slk -o build/hello
```

- `silk check` answers: “does this module set parse and type-check?”
- `silk test` discovers and runs `test "name" { ... }` blocks and emits TAP output.
- `silk build` compiles and produces an artifact. When you omit `--kind`, you’re building an executable.

The important term is **module set**: each command operates on a set of `.slk` files compiled together. Even in small
programs, thinking in module sets scales well to larger codebases.

Next: [CLI and toolchain](?p=guides/cli)

## A slightly richer example

This adds a helper function and shows how “real” Silk code stays ordinary:

```silk
import std::io::println;

fn greet (name: string) -> void {
  println("hello {s}", name);
}

fn main () -> int {
  greet("silk");
  return 0;
}
```

## A practical hello: reading arguments

On hosted targets, Silk can also accept a conventional `(argc, argv)` entrypoint shape. The standard library includes a
small `std::args` helper so you can treat raw `argv` pointers as `string` views.

```silk
import std::args;
import std::io::println;

fn main (argc: int, argv: u64) -> int {
  let a = std::args::Args.init(argc, argv);
  if a.count() < 2 {
    println("usage: hello <name>");
    return 2;
  }

  println("hello {s}", a.get(1));
  return 0;
}
```

This example is intentionally small, but it demonstrates the “systems” posture of Silk: when a boundary is low-level
(process arguments are ultimately raw pointers), the language and stdlib make that boundary explicit rather than hiding it
behind magic.

## Where to go next

- [Language tour](?p=guides/language-tour)
- [Modules & packages](?p=guides/modules-and-packages)
- Reference: packages/imports/exports (`Packages, imports, exports` in the sidebar under “Language”)
