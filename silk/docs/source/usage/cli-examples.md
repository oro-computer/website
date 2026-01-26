# CLI usage examples

This page is a grab bag of practical workflows for the `silk` toolchain. It focuses on *how people actually use the CLI*:
quick feedback (`check`), tests that integrate with CI (`test`), and explicit build outputs (`build`).

For the conceptual model, read: [CLI and toolchain](?p=guides/cli).

For flag-by-flag reference, use the manpages (sidebar → man).

## Minimal loop: check → test → build

Create `hello.slk`:

```silk
import std::io::println;

fn main () -> int {
  println("hello {s}", "world");
  return 0;
}
```

Then:

```bash
silk check hello.slk
silk test hello.slk
silk build hello.slk -o build/hello
```

This loop is intentionally boring: each command has one job, and it scales from a single file to large packages.

## Explicit module sets (multiple files)

Passing multiple files defines the module set explicitly:

```bash
silk check src/main.slk src/util.slk
silk test  src/main.slk src/util.slk
silk build src/main.slk src/util.slk -o build/app
```

If you’re just starting a project, this is a great way to keep things simple before introducing manifests and named build
targets.

## Package builds (`silk.toml`)

For larger projects, you typically describe the module set in `silk.toml` and ask the CLI to load it:

```bash
silk check --package .
silk test --package .
silk build --package .
```

Why this model is valuable:

- “what gets compiled” is explicit and reproducible
- tooling can reason about packages without executing code
- named targets let you build multiple artifacts from one codebase

## Build kinds: executable, object, static, shared

`silk build` makes the output kind explicit:

```bash
# Executable (default)
silk build src/main.slk -o build/app

# Object file
silk build src/lib.slk --kind object -o build/lib.o

# Static library
silk build src/lib.slk --kind static -o build/libfoo.a

# Shared library
silk build src/lib.slk --kind shared -o build/libfoo.so
```

### Emitting C headers for exports

When building libraries for C consumers, emit a header for exported symbols:

```bash
silk build src/lib.slk --kind static -o build/libmylib.a --c-header build/mylib.h
```

This is a practical bridge between “Silk as a language” and “Silk as a component inside another system”.

## Target selection

Cross compilation and alternate backends are selected explicitly:

```bash
silk build src/main.slk --target x86_64-linux-gnu -o build/app
silk build src/main.slk --arch wasm32 --kind executable -o build/app.wasm
```

Explicit targets keep builds readable: you can tell from the command line what you’re producing.

## Standard library selection (`--std-root`, `--nostd`, `--std-lib`)

When a module imports `std::...`, the CLI resolves the standard library from its configured stdlib root.

Common customizations:

```bash
# Point at an alternate stdlib root (for custom std distributions or runtimes)
silk check --std-root ./path/to/std src/main.slk
silk build --std-root ./path/to/std src/main.slk -o build/app

# Disable std auto-loading (useful for sandboxed embedding flows)
silk check --nostd src/main.slk
```

On hosted targets where stdlib archives are used, `--std-lib` selects the archive to link.

Reference: [Custom stdlib root](?p=usage/howto-custom-stdlib-root)

## Docs and manpages from source

Silk can extract documentation from doc comments:

```bash
silk doc src/main.slk -o build/api.md
```

And render a man-style view of a symbol/module/concept:

```bash
silk man std::io
```

## Embedding workflows (C)

Two common embedding shapes:

1. **Build a library for a C program to link against** (object/static/shared + optional C header).
2. **Embed the compiler itself** (`libsilk`) inside another program.

When you’re in the “call a C compiler” world, `silk cc` is a convenience wrapper:

```bash
silk cc -std=c99 -Wall -Wextra my_program.c -o build/my_program
```

Reference: `libsilk` (sidebar → man → `libsilk` (7)).

