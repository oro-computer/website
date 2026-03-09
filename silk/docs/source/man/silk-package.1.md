# `silk-package` (1) — Inspect And Lint Silk Packages

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
  - distribution payload rules from `[dist]`,
  - and the current package `sha256:...` hash.
- `lint` validates that:
  - definition files exist,
  - declared artifact files and headers exist,
  - artifact-local `definitions` remain within `[package].definitions`,
  - and `[dist]` covers the public surface and declared shipped artifacts.

Use `inspect` when you want to confirm what a package exposes and ships. Use
`lint` before `silk build install`, before cutting a release archive, or before
handing a package root to another build system.

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

# Inspect an explicit manifest path.
silk package inspect --package ./vendor/acme-http/silk.toml

# Lint a package manifest in another directory.
silk package lint --package ../my-lib

# Lint the current package before install or publication.
silk package lint
```

## See Also

- `silk` (1)
- `silk-build` (1)
- `?p=compiler/package-manifests`
- `?p=compiler/package-distribution`
