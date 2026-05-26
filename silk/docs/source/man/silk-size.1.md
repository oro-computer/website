# [`silk-size(1)`](?p=man/silk-size.1) - Inspect Artifact Sizes

> NOTE: This is the Markdown source for the eventual man 1 page for
> `silk size`. The roff-formatted manpage should be generated from this
> content.

## Name

`silk-size` - inspect file size and available section sizes for an artifact.

## Synopsis

- `silk size [--json] <artifact>`

## Description

`silk size` reports an artifact's byte size. For ELF64 little-endian files, it
also reports section names, offsets, sizes, and allocation/write/execute flags.
Other artifact formats are still accepted, but section details are reported as
unavailable. Very large artifacts still report file size from filesystem
metadata even when section parsing is skipped.

The command exists so build, release, and agent workflows can inspect retained
bytes from the Silk CLI itself instead of depending on external size tools.

## Options

- `--help`, `-h` - show command help and exit.
- `--json` - emit a newline-terminated JSON size packet on stdout.

## JSON Output

The JSON packet has `schemaVersion: 1`, `command: "size"`, `path`, `fileSize`,
`format`, and `sections`.

For ELF64 little-endian artifacts, each section includes:

- `name`,
- `offset`,
- `size`,
- `alloc`,
- `writable`,
- `executable`.

For formats without section parsing support, `format` is `unknown` and
`sections` is empty.

## Examples

```sh
# Print a concise terminal report.
silk size zig-out/bin/app

# Emit a machine-readable report.
silk size --json zig-out/bin/app
```

## Exit Status

- `0` on success.
- non-zero when the input is missing, is not a file, cannot be read, or the
 arguments are invalid.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-targets(1)`](?p=man/silk-targets.1)
- [cli silk](?p=compiler/cli-silk)
