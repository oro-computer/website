# What Silk is for

Silk is a **spec-first** programming language and toolchain: the design is written down as a readable, linkable reference,
and the compiler is built to match that contract.

This matters because it changes how the language evolves:

- The “meaning” of a construct lives in the docs, not in folklore.
- Tooling can rely on stable concepts (packages, imports, diagnostics, CLI shapes).
- The implementation can grow incrementally while staying predictable to users.

If you’re new to Silk, this page gives you the mental model: what you write, what you get, and why the design looks the way
it does.

## Design goals (practical)

Silk is designed around a handful of constraints that show up everywhere:

### Explicit structure

Real systems code is easier to maintain when it is obvious where names come from and how code is organized.

- Names are qualified with `::`.
- Files declare a `package` or `module` header at the top.
- Imports are explicit and live in a contiguous import block.

That gives you codebases where “what depends on what” is visible without special tooling.

### A language you can reason about

Silk pushes toward **predictable semantics**:

- Types matter most at boundaries (public APIs, FFI, storage formats). Silk keeps those boundaries explicit.
- Error handling is explicit and typed, so you can see what can fail and what must be handled.
- Verification is opt-in by syntax (Formal Silk): ordinary code stays ordinary.

### A toolchain you can embed

Silk is not only “a compiler binary”. It is also designed to be integrated as a library:

- a C99 embedding ABI (`libsilk`) for host applications and build systems
- a Zig embedding wrapper for Zig-native integrations

This is useful when you want compilation as a component inside another program (editors, language servers, build
orchestrators, analysis tools).

## The basic programming model

### Files form a module set

When you run the compiler, you compile a **module set**: a set of `.slk` files that are type-checked together.

You can provide that set explicitly (a list of files), or you can ask `silk` to load it from a package manifest
(`silk.toml`). Either way, the idea is the same: *“these files form a unit.”*

### Packages and imports keep boundaries obvious

A simple file often begins like this:

```silk
package app;

import std::io::println;
```

That header tells you the namespace (`app`) and the dependencies (here: `std::io::println`) before you read the rest of the
file.

### Programs are ordinary code

Executables use a conventional entry point: `fn main () -> int` (exit code).

```silk
import std::io::println;

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

Silk is designed so that “the smallest program” uses the same constructs you use at scale: packages, imports, types,
functions, and explicit boundaries.

## Where Silk fits well

Silk is aimed at code where clarity and correctness matter:

- tools and developer infrastructure
- network services and protocol code
- parsers, encoders, and data plumbing
- libraries that need a stable ABI boundary
- systems components that benefit from local verification (Formal Silk)

If you want a language that is both *low-level enough* to express systems concerns and *structured enough* to keep large
projects readable, Silk is built for that space.

## How to use this documentation

This site is organized into two layers:

- **Guides**: reading order, “how to think”, and realistic examples.
- **Reference**: precise language rules, standard library modules, and CLI/ABI details.

The recommended flow:

1. [Hello world](?p=guides/hello-world)
2. [Language tour](?p=guides/language-tour)
3. [Modules & packages](?p=guides/modules-and-packages)
4. [Standard library](?p=guides/standard-library)
5. [CLI and toolchain](?p=guides/cli)
6. [Testing](?p=guides/testing)
7. [Formal Silk](?p=guides/formal-silk)

If you already know what you’re looking for, use search and the sidebar reference sections.

