# Getting Started (Repo Workflow)

This document is a practical starting point for working with the Silk compiler
repository: building the `silk` CLI, running a minimal program, and finding the
right documentation for deeper language and ABI details.

If you want language semantics, start with `docs/language/README.md`.

For tutorials and task-oriented guides, see `docs/usage/README.md`.

## Build `silk`

This repository is built with Zig.

From the repo root:

```sh
make build
```

If you want to fetch/build the pinned vendored crypto/TLS dependencies
(libsodium + mbedTLS) for `linux/x86_64`, run:

```sh
make deps
```

See `docs/compiler/vendored-deps.md` for details.

This produces:

- `zig-out/bin/silk` (the compiler CLI)
- `zig-out/lib/libsilk.a` (the C99 static library)
- `zig-out/lib/libsilk_std.a` (a stdlib archive for supported targets)

You can also run the Zig build directly:

```sh
zig build
```

## Run a Minimal Program

Create a file `hello.slk`:

```silk
fn main () -> int {
  return 0;
}
```

Then:

```sh
./zig-out/bin/silk check hello.slk
./zig-out/bin/silk build hello.slk -o hello
./hello
```

For more CLI examples (including stdlib use, wasm outputs, and library/object
builds), see `docs/usage/cli-examples.md`.

For step-by-step walkthroughs, see `docs/usage/tutorials/README.md`.

## What Works Today vs Full Design

The language docs describe both:

- the full language design, and
- the current implemented subset.

For “what works today”:

- `STATUS.md` summarizes the current compiler feature set.
- Many `docs/language/*.md` files include “Implementation status” sections.
- `tests/silk/pass_*.slk` are the most reliable working language examples.
- `docs/compiler/diagnostics.md` lists the stable error codes you will see for
  unsupported features.

## Run Tests

From the repo root:

```sh
make test
```

This runs:

- Zig unit tests (`zig build test`)
- C99 test harnesses under `c-tests/` that link against `libsilk.a`

## Where To Go Next

- Language guide: `docs/language/README.md`
- Language quick reference: `docs/language/cheat-sheet.md`
- Compiler CLI design: `docs/compiler/cli-silk.md` and `docs/man/silk.1.md`
- C99 ABI contract for embedding: `docs/compiler/abi-libsilk.md` and `docs/man/libsilk.7.md`
- Standard library overview: `docs/std/overview.md`
