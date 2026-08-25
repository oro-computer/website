# Getting started

This page gets you from “a file” to “a runnable program”, and points you at the docs you’ll use most often.

If you already have a `silk` binary on your `PATH`, start with “Write a program”.

If you don’t, see “Build from source” for the reference compiler workflow.

## Write a program

Create `hello.slk`:

```silk
import { println } from "std/io";

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
silk package inspect --package .
silk package lint --package .
```

Use `inspect` to confirm the package name, version, definitions, dependencies,
and declared artifacts. Use `lint` before installation or publication to catch
missing definition files, bad artifact paths, or incomplete `[dist]` coverage.

Reference:

- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
- [`silk-package` (1)](?p=man/silk-package.1)
- [CLI examples](?p=usage/cli-examples)

## Build from source (reference compiler)

The reference Silk compiler/toolchain is built with Zig.

From the Silk compiler repository root:

```bash
make build
```

This builds missing hosted dependencies on supported native hosts and stages a
repo-local toolchain. Among its outputs are:

- `build/bin/silk` (the CLI)
- `build/bin/silk-lsp` (the language server)
- `build/lib/libsilk.a` (the C ABI library)
- `build/lib/silk/std/libsilk_std.a` (the prebuilt stdlib archive on supported native hosts)
- `build/share/silk/std/` and `build/share/man/` (stdlib sources and manpages)

For a compiler-only Zig build or a custom staging prefix, use:

```bash
zig build
zig build install --prefix build
```

To fetch or rebuild only the pinned hosted dependency archives:

```bash
make deps
```

Reference: [Built-in dependencies](?p=compiler/builtin-deps)

## Troubleshooting

- If a command fails, look up the error code in: [Diagnostics](?p=compiler/diagnostics)
- If you hit backend/toolchain limits, start with: [Limits](?p=compiler/limits)

## Where to go next

- Guides: [What Silk is for](?p=guides/purpose) · [Hello world](?p=guides/hello-world) · [Language tour](?p=guides/language-tour)
- Formal verification: [Formal Silk](?p=guides/formal-silk) · [Tutorial 7: Formal Silk in real code](?p=usage/tutorials/07-formal-silk)
- Language quick reference: [Cheat sheet](?p=language/cheat-sheet)
- Standard library: [Overview](?p=std/overview)
- GPU: [Pure-Silk CPU/GPU program](?p=usage/pure-silk-gpu) · [`std::gpu`](?p=std/gpu)
- Platform apps: [Build LumenTrail for iOS](?p=usage/howto-lumen-trail) · [`silk-devices(1)`](?p=man/silk-devices.1)
- Embedding: [C ABI (`libsilk`)](?p=compiler/abi-libsilk) · [Zig embedding API](?p=compiler/zig-api)
- Spec: [Silk Spec (2026)](/silk/spec/2026/)
