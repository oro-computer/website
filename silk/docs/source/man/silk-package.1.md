# `silk-package` (1) — Inspect And Lint Silk Packages

> NOTE: This is the Markdown source for the eventual man 1 page for `silk package`. The roff-formatted manpage should be generated from this content.

## Name

`silk-package` — inspect and lint a `silk.toml` package root.

## Synopsis

- `silk package inspect [--package <dir|manifest>]`
- `silk package lint [--package <dir|manifest>]`

## Description

`silk package` provides author-facing validation for portable Silk package
roots.

- `inspect` prints:
  - package metadata from `[package]`,
  - public definition files from `[package].definitions`,
  - dependency constraints from `[dependencies]`,
  - declared shipped artifacts from `[[artifact]]`,
  - and the current package `sha256:...` hash.
- `lint` validates that:
  - definition files exist,
  - declared artifact files and headers exist,
  - artifact-local `definitions` remain within `[package].definitions`,
  - and `[dist]` covers the public surface and declared shipped artifacts.

When `--package` is omitted and `./silk.toml` exists, the current directory is
used.

## Options

- `--help`, `-h` — show command help and exit.
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — inspect or lint the
  selected package root/manifest.

## Examples

```sh
# Inspect the current package root.
silk package inspect

# Lint a package manifest in another directory.
silk package lint --package ../my-lib
```

## See Also

- [silk (1)](?p=man/silk.1)
- [silk-build (1)](?p=man/silk-build.1)
- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
