# Getting started

This guide covers the downstream story: build `slg`, install it, run a few real searches, then move into the exact CLI reference.

## Build from source

From a checkout of the `slg` repository:

```bash
cd slg
silk build --package .
```

The binary is written to:

```text
./build/bin/slg
```

A simple local install flow is:

```bash
install -m 0755 build/bin/slg ~/.local/bin/slg
```

## First searches

Regex search:

```bash
slg "TODO|FIXME" src
```

Literal search:

```bash
slg -F "TODO:" .
```

List the files that would be searched:

```bash
slg --files src
```

Search hidden files too:

```bash
slg --hidden "needle" .
```

Show a stats summary on stderr:

```bash
slg --stats error .
```

## How to think about `slg`

- It is **filesystem-only**. Inputs are files and directories, not stdin or URLs.
- It has **two modes**: search mode and `--files` mode.
- It walks directories **recursively** unless you limit depth.
- It skips hidden entries, VCS directories, common heavy paths, and ignore-file matches by default.
- It defaults to regex syntax, but patterns without regex metacharacters are automatically handled by the fixed matcher.

## Read the shipped manual

The project ships one manual page:

```bash
man ./man/slg.1
```

The website version is here: [`slg(1)`](?p=man/slg-1)

## Next

- Exact CLI shape: [`slg`](?p=cli/slg)
- Root/path behavior: [Input types and parsing](?p=cli/input-types-and-parsing)
- Common workflows: [Search recipes](?p=guides/search-recipes)
