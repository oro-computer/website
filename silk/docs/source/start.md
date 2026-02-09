# Silk Documentation

Silk is a spec-first programming language and compiler toolchain. The goal is a language you can *read* as well as you can
compile: predictable semantics, explicit module boundaries, and a standard library designed for systems work.

This documentation site is written for downstream users. It is organized into:

- **Guides** — purpose, mental model, hello worlds, and practical workflows.
- **Reference** — the detailed language, standard library, CLI, and ABI surfaces.

If you’re setting up a workspace, start with: [Getting started](?p=usage/getting-started).

## A minimal “hello world”

Silk programs are ordinary `.slk` files. A small program can look like this:

```silk
import std::io::println;

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

From here, you can:

- explore the guided path in **Guides**
- jump straight to a topic in **Reference** (language, `std::`, tooling)
- use search to find concepts by name

## Recommended reading path

If you’re new to Silk, this is a good order:

1. **What Silk is for**: design goals, spec-first workflow, and the mental model.
2. **Hello world**: the smallest working program and the `check → test → build` loop.
3. **Language tour**: the shape of real programs (types, functions, control flow, errors).
4. **Modules & packages**: how code is organized and how imports/exports create clean dependency boundaries.
5. **Standard library**: what lives in `std::` and the common patterns it uses.
6. **CLI and toolchain**: module sets, build targets, package manifests, docs/man, and diagnostics.
7. **Testing**: language-level tests and TAP output for CI and tooling.
8. **Formal Silk**: opt-in proofs with Z3; how to write verified code with zero runtime cost.

Start here:

- Usage: [Getting started](?p=usage/getting-started)
- Guides: [What Silk is for](?p=guides/purpose)
- Guides: [Hello world](?p=guides/hello-world) · [Language tour](?p=guides/language-tour) · [Modules & packages](?p=guides/modules-and-packages)
- Guides: [Standard library](?p=guides/standard-library) · [CLI and toolchain](?p=guides/cli)
- Guides: [Testing](?p=guides/testing) · [Formal Silk](?p=guides/formal-silk)
- Spec: [Silk Spec (2026)](/silk/spec/2026/)
