---
layout: "docs"
title: "[slc(1)](?p=man/slc.1) — Alias of silk build"
description: "NOTE: This is the Markdown source for the eventual man 1 page for slc. The roff-formatted manpage should be generated from this content."
docsCollection: "silk"
section: "man"
order: 278
sourcePath: "man/slc.1.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`slc(1)`](/silk/docs/man/slc.1/) — Alias of `silk build`

> NOTE: This is the Markdown source for the eventual man 1 page for `slc`. The roff-formatted manpage should be generated from this content.

## Name

`slc` — convenience entrypoint for `silk build`.

## Synopsis

- `slc [options] <file> [<file> ...] -o <output>`
- `slc [options] --package <dir|manifest> [--build-module] [--package-target <name> ...]`

## Description

`slc` is an argv0-based alias of `silk build`. It behaves the same as running:

```sh
silk build <args...>
```

See [`silk-build(1)`](/silk/docs/man/silk-build.1/) for full documentation of options, arguments, and behavior.

## See Also

- [`silk(1)`](/silk/docs/man/silk.1/), [`silk-build(1)`](/silk/docs/man/silk-build.1/)
