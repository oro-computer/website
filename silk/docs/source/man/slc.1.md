# `slc` (1) — Alias of `silk build`

> NOTE: This is the Markdown source for the eventual man 1 page for `slc`. The roff-formatted manpage should be generated from this content.

## Name

`slc` — convenience entrypoint for `silk build`.

## Synopsis

- `slc [options] <file> [<file> ...] -o <output>`
- `slc [options] --package <dir|manifest> [--build-script] [--package-target <name> ...]`

## Description

`slc` is an argv0-based alias of `silk build`. It behaves the same as running:

```sh
silk build <args...>
```

See `silk-build` (1) for full documentation of options, arguments, and behavior.

## See Also

- `silk` (1), `silk-build` (1)
