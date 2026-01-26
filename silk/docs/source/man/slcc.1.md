# `slcc` (1) — Alias of `silk cc`

> NOTE: This is the Markdown source for the eventual man 1 page for `slcc`. The roff-formatted manpage should be generated from this content.

## Name

`slcc` — convenience entrypoint for `silk cc`.

## Synopsis

- `slcc <cc args...>`

## Description

`slcc` is an argv0-based alias of `silk cc`. It behaves the same as running:

```sh
silk cc <cc args...>
```

See `silk-cc` (1) for details, including the default `-I`/`-L`/`-lsilk` flags.

## See Also

- `silk` (1), `silk-cc` (1)
