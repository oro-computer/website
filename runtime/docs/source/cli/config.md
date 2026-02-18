# `oroc config`

Inspect configuration values.

## Usage

```bash
oroc config [options] [<key-or-path>]
```

## Options

```text
--config=<path>         use an explicit oro.toml/oro.ini file
--list                  list known configuration keys with current and default values
--key=<name>            print the current value for a specific key
--describe=<name>       print help and metadata for a specific key
-f, --format=<format>   print the full configuration as toml | ini | json
--strict                treat unknown or unset keys as errors (non-zero exit)
```

## Notes

- Keys may be provided in flattened form (for example `filesystem_sandbox_enabled`) or TOML-style paths (for example `filesystem.sandbox_enabled`).
- A bare argument after `config` is treated as a key query (for example `oroc config filesystem.sandbox_enabled`).
- Unknown keys are printed when present in the active configuration but are marked as undocumented.

See: [Config overview](?p=config/overview) and [Config reference](?p=config/reference).

