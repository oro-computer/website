# `silk-cc` (1) — C Compiler Wrapper for `libsilk`

> NOTE: This is the Markdown source for the eventual man 1 page for `silk cc`. The roff-formatted manpage should be generated from this content.

## Name

`silk-cc` — run a host C compiler with default include and link flags for `libsilk.a`.

## Synopsis

- `silk cc <cc args...>`

## Description

`silk cc` is a convenience wrapper for building C/C++ programs that embed or link against `libsilk.a`.

It selects the underlying compiler via `SILK_CC` (default: `cc`) and:

- adds `-I <install>/include` automatically,
- unless you pass `-c`/`-E`/`-S`/`-M`/`-MM`, also adds `-L <install>/lib -lsilk`,
- on `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (vendored Z3 is built as C++).

## Environment

- `SILK_CC` — host C compiler executable (default: `cc`).

## Examples

```sh
# Build an embedder (assumes `silk` is installed).
silk cc -std=c99 -Wall -Wextra your_app.c -o your_app
```

## Exit status

- the exit status of the underlying compiler.

## See Also

- `silk` (1)
- `libsilk` (7)
- `include/silk.h`
