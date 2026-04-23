# [`silk-cc(1)`](?p=man/silk-cc.1) — C Compiler Wrapper for `libsilk`

> NOTE: This is the Markdown source for the eventual man 1 page for `silk cc`. The roff-formatted manpage should be generated from this content.

## Name

`silk-cc` — run a host C compiler with default include and link flags for `libsilk.a`.

## Synopsis

- `silk cc <cc args...>`

## Description

`silk cc` is a convenience wrapper for building C/C++ programs that embed or link against `libsilk.a`.

It selects the underlying compiler via `SILK_CC` (fallback: `CC`, default: `cc`) and:

- adds `-I <install>/include` automatically,
- adds `-I <install>/include/silk` automatically so vendored headers such as `mbedtls/error.h` resolve from the staged toolchain prefix,
- unless you pass `-c`/`-E`/`-S`/`-M`/`-MM`, also adds `-L <install>/lib -lsilk`,
- on `linux/x86_64`, also adds `-lstdc++ -lpthread -lm` (vendored Z3 is built as C++).

## Environment

| Variable | Details |
| --- | --- |
| `SILK_CC` | host C compiler executable (falls back to `CC`, then `cc`). |
| `CC` | host C compiler executable (used when `SILK_CC` is unset or empty). |

## Examples

```sh
# Build an embedder (assumes `silk` is installed).
silk cc -std=c99 -Wall -Wextra your_app.c -o your_app
```

## Exit status

| Status | Meaning |
| --- | --- |
| inherited | The exit status of the underlying compiler. |

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`libsilk(7)`](?p=man/libsilk.7)
- `include/silk/silk.h`
