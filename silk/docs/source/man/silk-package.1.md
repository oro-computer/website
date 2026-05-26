# [`silk-package(1)`](?p=man/silk-package.1) — Inspect And Lint Silk Packages

> NOTE: This is the Markdown source for the eventual man 1 page for `silk package`. The roff-formatted manpage should be generated from this content.

## Name

`silk-package` — inspect and lint a `silk.toml` package root.

## Synopsis

- `silk package inspect [--json] [--package <dir|manifest>]`
- `silk package lint [--json] [--package <dir|manifest>]`

## Description

`silk package` provides author-facing validation for portable Silk package
roots.

- `inspect` prints:
 - package metadata from `[package]`,
 - public definition files from `[package].definitions`,
 - dependency constraints from `[dependencies]`,
 - package native requirements from `[[native]]`,
 - declared shipped artifacts from `[[artifact]]`,
 - installed Formal Silk bundle paths discovered under
 `share/silk/formal/<artifact-relative-path>/...`,
 - and the current package `sha256:...` hash.
- `lint` validates that:
 - definition files exist,
 - declared native input files exist,
 - declared artifact files and headers exist,
 - artifact-local `definitions` remain within `[package].definitions`,
 - and `[dist]` covers the public surface, native inputs, and declared shipped
 artifacts.

When `--package` is omitted and `./silk.toml` exists, the current directory is
used.

Use `--json` for tooling that needs stable package facts without scraping
terminal text.

## Options

- `--help`, `-h` — show command help and exit.
- `--json` — emit newline-terminated, schema-versioned package metadata or
 lint result JSON on stdout.
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — inspect or lint the
 selected package root/manifest.

## JSON Output

`inspect --json` emits `schemaVersion`, `command`, `mode`, `root`, `sha256`,
and a structured `manifest` object containing definitions, dist patterns,
dependencies, artifacts, native requirements, and Formal Silk bundles.

`lint --json` emits `ok`, `issueCount`, and `issues`. Lint failures still exit
non-zero.

## Examples

```sh
# Inspect the current package root.
silk package inspect

# Lint a package manifest in another directory.
silk package lint --package ../my-lib

# Inspect package metadata as JSON.
silk package inspect --json
```

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-build(1)`](?p=man/silk-build.1)
- [package manifests](?p=compiler/package-manifests)
- [package distribution](?p=compiler/package-distribution)
