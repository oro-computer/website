# `oroc version`

Inspect or bump the project version defined in your configuration file.

## Usage

```bash
oroc version [options]
oroc version <new-version | release> [options]
```

## Options

```text
--config=<path>         explicit oro.toml/oro.ini to update
--preid=<id>            pre-release tag for pre* bumps (default: rc)
-V, --verbose           verbose output
--log-file=<path>       mirror logs to a JSON file
```

## Examples

```bash
oroc version
oroc version minor
oroc version prepatch --preid beta
oroc version 1.2.3
```

## Notes

- With no arguments, `version` prints the current semantic version from `[meta]`.
- With a `<new-version>` argument, it sets the version to that exact SemVer 2.0.0 value.
- With a release type, it bumps the version using SemVer rules (major/minor/patch, pre* variants).
- The command updates only your app configuration file; it does not call git or create tags.

