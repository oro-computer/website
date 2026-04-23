# `oroc update validate`

Validate an update manifest JSON file against the expected schema shape.

## Usage

```bash
oroc update validate [--manifest=<path>] [options]
```

## Options

| Option | Description |
| --- | --- |
| `--manifest=<path>` | path to the manifest JSON file |
| `--manifest-name=<name>` | manifest filename to use when --manifest is not provided |
| `--strict` | enable additional consistency checks |
| `--json` | print a machine-readable JSON result object |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update validate --manifest manifest.json
# run basic structural checks against manifest.json

oroc update validate --manifest manifest.json --strict
# enable stricter consistency rules in addition to structural checks

oroc update validate --manifest manifest.json --json
# print validation status as JSON for CI or agents
```

## Considerations

- Validation is aligned with `schemas/update-manifest.schema.json`.
- The command checks required fields, types, and key relationships without attempting full JSON Schema validation.
- `--strict` enables additional consistency checks such as channels versus updates and `artifactUrl` shape.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update init`](?p=cli/update/init)
- [`oroc update verify`](?p=cli/update/verify)
