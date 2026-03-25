# `oroc update init`

Scaffold a minimal update manifest JSON file.

## Usage

```bash
oroc update init [options]
```

## Options

```text
--config=<path>         use an explicit oro.toml/oro.ini file when deriving defaults
--manifest-name=<name>  filename for the manifest JSON (default: manifest.json or ORO_UPDATE_MANIFEST_FILENAME)
--log-file=<path>       mirror logs to a JSON file
```

## Examples

```bash
oroc update init
# create ./manifest.json using oro.toml metadata

oroc update init --manifest-name app-updates.json
# create ./app-updates.json instead of manifest.json
```

## Considerations

- The generated manifest includes `schemaVersion = 1`.
- `appId` is derived from `oro.toml` metadata (`meta.bundle_identifier`), falling back to `com.example.app`.
- `generatedAt` is set to the current UTC timestamp.
- `channels` defaults to `[update_channel or "stable"]`.
- `updates` starts with a single entry for the current version and channel, with an empty `targets` array.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update validate`](?p=cli/update/validate)
- [`oroc update sign`](?p=cli/update/sign)
