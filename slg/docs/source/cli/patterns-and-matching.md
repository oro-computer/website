# Patterns and matching

This page documents how `slg` interprets patterns once parsing is complete.

## Regex is the public default

Without a literal flag, `<pattern>` is treated as a regular expression:

```bash
slg "TODO|FIXME" src
slg "^fn main" src
```

## Automatic fixed matching

Patterns that contain no regex metacharacters are automatically handled by the fixed matcher in the current implementation.

That means this:

```bash
slg TODO src
```

behaves like a literal substring search even though `-F` was not provided.

Use `-F` anyway when you want to make the intent explicit.

## Force literal matching

These flags are equivalent:

- `-F`
- `-Q`
- `--fixed-string`
- `--literal`
- `--fixed-strings`

Examples:

```bash
slg -F "TODO:" .
slg -Q "std::task" src
```

## Case behavior

### `-i`, `--ignore-case`

```bash
slg -i "error" logs
```

- regex mode delegates ignore-case to the regex engine
- fixed-string mode uses ASCII-only case folding

### `-S`, `--smart-case`

```bash
slg -S "todo" src
slg -S "Todo" src
```

Smart-case only enables ignore-case when:

- `-i` was not already set
- the pattern has **no** ASCII uppercase letters

So:

- `slg -S todo src` becomes case-insensitive
- `slg -S Todo src` stays case-sensitive

### `--no-smart-case`

This disables smart-case explicitly. It is the default state.

## Match count limit

Use `-m`, `--max-count` to stop after `N` matching lines per file:

```bash
slg -m 3 TODO src
```

Use `0` for unlimited.

Current parser behavior:

- `--max-count 3` works
- `--max-count=3` works
- `--max-count auto` is accepted
- `--max-count=auto` is rejected

For stable downstream use, prefer numeric values.

## Matching is line-based

`slg` searches one line at a time.

Important consequences:

- output is line-oriented
- regex matching is evaluated per line
- fixed strings that contain an actual newline cannot match

## Binary detection

By default, `slg` skips files that look binary.

The current rule is:

- if a file contains a NUL byte in the first 1024 bytes, it is treated as binary-like

Use `--text` to force searching those files:

```bash
slg --text "needle" artifacts
```

## Pattern failures

Invalid patterns fail with exit status `2`.

Typical causes:

- malformed regex syntax
- an empty pattern after shell expansion or quoting

See [Diagnostics](?p=cli/diagnostics).
