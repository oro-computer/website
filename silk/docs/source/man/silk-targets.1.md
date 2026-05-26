# [`silk-targets(1)`](?p=man/silk-targets.1) - Inspect Target Capabilities

> NOTE: This is the Markdown source for the eventual man 1 page for
> `silk targets`. The roff-formatted manpage should be generated from this
> content.

## Name

`silk-targets` - list supported Silk target triples and architecture aliases.

## Synopsis

- `silk targets [--json]`

## Description

`silk targets` prints the target triples and architecture aliases recognized by
the compiler. The human output matches the target lists used by
`silk build --list-targets` and `silk build --list-archs`. Output-kind labels
describe what the current compiler host can emit for that target. When a target
has extra Apple Silicon macOS host-backed support that is not available on the
current host, the text calls out that host requirement explicitly.

Use `--json` for editor, CI, release, and agent workflows that need stable
target capability facts without scraping terminal output.

## Options

- `--help`, `-h` - show command help and exit.
- `--json` - emit a newline-terminated JSON packet on stdout.

## JSON Output

The JSON packet has `schemaVersion: 1`, `command: "targets"`, host metadata,
recognized target triples, architecture aliases, target libc metadata (`glibc`,
`musl`, or `null`), and per-target capabilities.

Per-target capabilities include:

- baseline supported output kinds: executable, object, static library, shared
 library,
- current-host supported output kinds for the same artifact kinds,
- whether executable output is currently const-main-only on this host,
- whether the target has a current-host-backed non-constant executable path or
 object-output path,
- whether Apple Silicon macOS hosts can provide host-backed non-constant
 executable or object-output support for the target,
- native and Objective-C native-input support,
- Unix/POSIX/WASM classification,
- async-runtime availability.

## Examples

```sh
# Print target and architecture lists for a terminal user.
silk targets

# Emit the schema-versioned target capability packet.
silk targets --json
```

## Exit Status

- `0` on success.
- non-zero when arguments are invalid or output fails.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-graph(1)`](?p=man/silk-graph.1), [`silk-size(1)`](?p=man/silk-size.1)
- [cli silk](?p=compiler/cli-silk)
