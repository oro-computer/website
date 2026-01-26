# How-To: Use a Custom Stdlib Root (and Runtime)

The `std::...` modules are loaded from a *stdlib root* (a directory containing a
`std/` tree). Because `std::runtime` is part of that source tree, selecting a
different stdlib root is also how you select a different runtime implementation
underneath `std::fs`, `std::io`, `std::task`, and `std::sync`.

Reference: `std::runtime` (see the sidebar under “Standard library”).

## Use a Custom Std Root (CLI)

Point the compiler at an alternate stdlib root:

```sh
silk build --std-root /path/to/my-stdlib-root my_program.slk -o my_program
```

You can also set an environment variable:

```sh
export SILK_STD_ROOT=/path/to/my-stdlib-root
silk build my_program.slk -o my_program
```

Notes:

- `--nostd` disables auto-loading of `import std::...;` modules, but it does not
  prevent `from "std/..."` file imports from resolving relative to the selected
  std root. See: [CLI and toolchain](?p=guides/cli).

## Provide a Prebuilt Std Archive

On hosted targets where std archives are supported, you can also provide a prebuilt std archive:

```sh
silk build --std-root /path/to/my-stdlib-root --std-lib /path/to/libsilk_std.a my_program.slk -o my_program
```

Or via environment variable:

```sh
export SILK_STD_LIB=/path/to/libsilk_std.a
```

If no suitable archive is provided, the compiler may fall back to compiling
reachable std sources as part of the build on supported targets.

## Implementing a Custom Runtime

To reuse the shipped high-level `std::...` modules while changing the OS
integration, provide compatible `std::runtime::...` modules in your stdlib root.

Example (hosted POSIX baseline):

- `std/runtime/fs.slk` delegates to `std/runtime/posix/fs.slk`,
- `std/runtime/posix/fs.slk` implements primitives using `ext` (e.g. `open`,
  `read`, `close`).

For a new environment (for example Windows), the intent is to provide
`std/runtime/windows/fs.slk` and have `std/runtime/fs.slk` delegate to it in that
stdlib distribution.

Keep the stable contract at the `std::runtime::...` signature level, not at the
`ext` spelling level. Higher-level ergonomics belong in `std::...` modules.
