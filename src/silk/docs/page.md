---
layout: "silk-docs"
title: "Silk Documentation"
description: "Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer systems, mobile / tablet devices, WASM / WASI runtimes, and the web."
docsCollection: "silk"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Silk Documentation

Silk is a high performance general purpose programming language with formal verification built in. Silk targets computer
systems, mobile / tablet devices, WASM / WASI runtimes, and the web.

This documentation site is written for downstream users. It is organized into:

- **Guides** — purpose, mental model, hello worlds, and practical workflows.
- **Reference** — the detailed language, standard library, CLI, and ABI surfaces.

If you’re setting up a workspace, start with: [Getting started](/silk/docs/usage/getting-started/).

## A minimal “hello world”

Silk programs are ordinary `.slk` files. A small program can look like this:

```silk
import { println } from "std/io";
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
5. **Project dependencies**: how to build an application with path and package-search dependencies, using Cove as the reference layout.
6. **Practical logger module**: a reusable logging package walkthrough with configuration, sinks, targets, ABI notes, and publication.
7. **Standard library**: what lives in `std::` and the common patterns it uses.
8. **CLI and toolchain**: module sets, build targets, package manifests, package distribution, docs/man, and diagnostics.
9. **Testing**: language-level tests and TAP output for CI and tooling.
10. **Formal Silk**: opt-in proofs with Z3; how to write verified code with zero runtime cost.
11. **GPU programming**: portable device functions, checked launch blocks, [`std::gpu`](/silk/docs/std/gpu/), and AMD/NVIDIA backends.
12. **Platform applications**: manifest-driven iOS bundles plus device and signing workflows.

Start here:

- Usage: [Getting started](/silk/docs/usage/getting-started/)
- Reference: [Implementation status](/silk/docs/compiler/implementation-status/) · [Diagnostics](/silk/docs/compiler/diagnostics/)
- Reference: [Package manifests](/silk/docs/compiler/package-manifests/) · [Package distribution](/silk/docs/compiler/package-distribution/)
- Reference: [`silk` CLI](/silk/docs/compiler/cli-silk/) · [`silk-package` (1)](/silk/docs/man/silk-package.1/)
- Guides: [What Silk is for](/silk/docs/guides/purpose/)
- Guides: [Hello world](/silk/docs/guides/hello-world/) · [Language tour](/silk/docs/guides/language-tour/) · [Modules & packages](/silk/docs/guides/modules-and-packages/) · [Project dependencies](/silk/docs/guides/project-dependencies/)
- Guides: [Practical logger module](/silk/docs/guides/practical-logger-module/) · [Standard library](/silk/docs/guides/standard-library/) · [CLI and toolchain](/silk/docs/guides/cli/)
- Guides: [Testing](/silk/docs/guides/testing/) · [Formal Silk](/silk/docs/guides/formal-silk/)
- Tutorials: [Concurrency basics](/silk/docs/usage/tutorials/05-concurrency/) · [Async I/O + Streams + Abort Signals](/silk/docs/usage/tutorials/06-async-io-streams-abort/) · [Formal Silk in real code](/silk/docs/usage/tutorials/07-formal-silk/)
- GPU: [Execution placement](/silk/docs/language/gpu-execution/) · [Launch blocks](/silk/docs/language/gpu-launch-blocks/) · [`std::gpu`](/silk/docs/std/gpu/) · [Pure-Silk CPU/GPU program](/silk/docs/usage/pure-silk-gpu/)
- Platform apps: [Build LumenTrail for iOS](/silk/docs/usage/howto-lumen-trail/) · [`silk-devices(1)`](/silk/docs/man/silk-devices.1/) · [`silk-codesign(1)`](/silk/docs/man/silk-codesign.1/)
- Spec: [Silk Spec (2026)](/silk/spec/2026/)
