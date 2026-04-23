# `oroc help`

Discover commands, options, and workflow entry points from the CLI help index.

## Usage

```bash
oroc help [query...]
oroc help [query...] [--json]
```

## Options

| Option | Description |
| --- | --- |
| `--json` | emit structured search results for automation and editor tooling |
| `--log-file=<path>` | mirror logs to a JSON file |

## Notes

- With no query, this subcommand prints the top-level CLI help.
- Exact command matches print the full subcommand page, for example `oroc help build` or `oroc help update validate`.
- Free-form queries search command names, descriptions, options, notes, and examples, then rank the closest matches.
- Use this for discovery topics such as `oroc help tls`, `oroc help ios signing`, `oroc help json logs`, or `oroc help agent tooling`.
- `oroc help --json <query>` returns a machine-readable result list with ranked matches and exact-help payloads.

## Examples

```bash
oroc help build
# print the full help page for the build command

oroc help update validate
# print the full help page for the nested update validate command

oroc help ios signing
# search for commands and notes related to iOS signing and provisioning

oroc help json --json
# return ranked JSON results for the query "json"
```

## See also

- [`oroc`](?p=cli/oroc)
- [`oroc update`](?p=cli/update)
- [`oroc mcp`](?p=cli/mcp)
