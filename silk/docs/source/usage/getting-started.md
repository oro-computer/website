# Getting started

This page gets you from “a file” to “a runnable program”, and points you at the docs you’ll use most often.

If you already have a `silk` binary on your `PATH`, start with “Write a program”.

If you don’t, see “Build from source” for the reference compiler workflow.

## Write a program

Create `hello.slk`:

```silk
import std::io::println;

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

Run the normal loop:

```bash
silk check hello.slk
silk test hello.slk
silk build hello.slk -o build/hello
./build/hello
```

If you prefer a step-by-step walkthrough, start here:

- Tutorial 1: [your first program](?p=usage/tutorials/01-first-program)

## Packages (`silk.toml`)

For larger projects, describe the module set in `silk.toml` and use `--package`:

```bash
silk check --package .
silk test  --package .
silk build --package .
```

Reference:

- [Package manifests](?p=compiler/package-manifests)
- [CLI examples](?p=usage/cli-examples)

## Build from source (reference compiler)

The reference Silk compiler/toolchain is built with Zig.

From the Silk compiler repository root:

```bash
zig build
```

This produces (among other artifacts):

- `zig-out/bin/silk` (the CLI)
- `zig-out/lib/libsilk.a` (the C ABI library)

If you use the Make wrapper:

```bash
make build
```

Some features use pinned vendored dependencies (for example crypto/TLS on hosted targets). To fetch/build them for the
supported host platform:

```bash
make deps
```

Reference: [Vendored deps](?p=compiler/vendored-deps)

## Troubleshooting

- If a command fails, look up the error code in: [Diagnostics](?p=compiler/diagnostics)
- If you hit backend/toolchain limits, start with: [Limits](?p=compiler/limits)

## Where to go next

- Guides: [What Silk is for](?p=guides/purpose) · [Hello world](?p=guides/hello-world) · [Language tour](?p=guides/language-tour)
- Language quick reference: [Cheat sheet](?p=language/cheat-sheet)
- Standard library: [Overview](?p=std/overview)
- Embedding: [C ABI (`libsilk`)](?p=compiler/abi-libsilk) · [Zig embedding API](?p=compiler/zig-api)
- Spec: [Silk Spec (2026)](/silk/spec/2026/)
