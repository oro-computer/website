# Silk Documentation

Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer
systems, mobile / tablet devices, WASM / WASI runtimes, and the web.

This documentation site is written for downstream users. It is organized into:

- **Guides** — purpose, mental model, hello worlds, and practical workflows.
- **Reference** — the detailed language, standard library, CLI, and ABI surfaces.

If you’re setting up a workspace, start with: [Getting started](?p=usage/getting-started).

## Ask AI / `llms.txt`

For AI assistants and LLM tooling:

- Whole-site pack: [`llms.txt`](../../llms.txt)
- Silk docs pack: [`silk/llms.txt`](../llms.txt)

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

1. **What Silk is for**: design goals, constraints, and the mental model.
2. **Hello world**: the smallest working program and the `check → test → build` loop.
3. **Language tour**: the shape of real programs (types, functions, control flow, errors).
4. **Modules & packages**: how code is organized and how imports/exports create clean dependency boundaries.
5. **Standard library**: what lives in `std::` and the common patterns it uses.
6. **CLI and toolchain**: module sets, build targets, package manifests, package distribution, docs/man, and diagnostics.
7. **Testing**: language-level tests and TAP output for CI and tooling.
8. **Formal Silk**: opt-in proofs with Z3; how to write verified code with zero runtime cost.

Start here:

- Usage: [Getting started](?p=usage/getting-started)
- Reference: [Implementation status](?p=compiler/implementation-status) · [Diagnostics](?p=compiler/diagnostics)
- Reference: [Package manifests](?p=compiler/package-manifests) · [Package distribution](?p=compiler/package-distribution)
- Reference: [`silk` CLI](?p=compiler/cli-silk) · [`silk-package` (1)](?p=man/silk-package.1)
- Guides: [What Silk is for](?p=guides/purpose)
- Guides: [Hello world](?p=guides/hello-world) · [Language tour](?p=guides/language-tour) · [Modules & packages](?p=guides/modules-and-packages)
- Guides: [Standard library](?p=guides/standard-library) · [CLI and toolchain](?p=guides/cli)
- Guides: [Testing](?p=guides/testing) · [Formal Silk](?p=guides/formal-silk)
- Spec: [Silk Spec (2026)](/silk/spec/2026/)
