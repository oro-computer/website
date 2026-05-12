# `slg`

`slg` is the canonical CLI entrypoint for Silk Line Grep.

## Synopsis

```text
slg [options] <pattern> [path ...]
slg --files [options] [path ...]
```

## Primary modes

### Search mode

Search file contents below one or more filesystem roots:

```bash
slg TODO src
slg -F "TODO:" .
```

The first positional is the pattern. Any later positional arguments are treated as root paths.

### File-list mode

List the files that would be searched, without searching content:

```bash
slg --files src
slg src --files --max-depth 0
```

In this mode, every positional argument is treated as a root path.

## Parsing model

- Options may appear before or after positional arguments
- `--` ends option parsing
- If no paths are provided, the root is `.` in both modes
- Long options that take values accept either `--flag value` or `--flag=value`
- Short options that take values use a separate argument
- Concurrency knobs accept `auto` case-insensitively
- `--color` accepts only lowercase `auto|always|never`

## Input model

`slg` is **filesystem-only**:

- roots can be regular files
- roots can be directories
- `-` is not stdin shorthand; it is treated like any other positional value
- there is no URL input mode
- there is no rc/config file layer

See [Input types and parsing](?p=cli/input-types-and-parsing) for the exact rules.

## Matching defaults

- regex is the default public surface
- patterns with no regex metacharacters are automatically handled by the fixed matcher in the current implementation
- `-F`, `-Q`, `--fixed-string`, `--literal`, and `--fixed-strings` force literal matching
- `-i` enables case-insensitive matching
- `-S` enables smart-case behavior

See [Patterns and matching](?p=cli/patterns-and-matching).

## Traversal defaults

By default `slg`:

- skips hidden files and directories
- skips `.git`, `.hg`, and `.svn`
- skips a small set of common heavy paths
- reads `.gitignore`, `.ignore`, and `.agignore`
- does not follow symlinks

See [Traversal and ignores](?p=cli/traversal-and-ignores).

## Output and exit status

Exit status:

- `0` — at least one match was found, or `--files` completed successfully
- `1` — no matches were found
- `2` — parse error, runtime error, or output failure

See [Output and exit codes](?p=cli/output-and-exit-codes) and [Diagnostics](?p=cli/diagnostics).

## No config file

`slg` does not currently read a user config file or project config file at runtime.

The only runtime environment knob is `NO_COLOR`, and only when color mode is `auto`.

## Next

- Exact roots and positionals: [Input types and parsing](?p=cli/input-types-and-parsing)
- Exhaustive flags: [Options reference](?p=cli/options-reference)
- Reader-friendly manual: [`slg(1)`](?p=man/slg-1)
