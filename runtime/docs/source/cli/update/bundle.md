# `oroc update bundle`

Build a tar archive containing a directory for use as an update artifact.

## Usage

```bash
oroc update bundle [--input=<dir>] [--output=<bundle.tar>] [options]
```

## Options

| Option | Description |
| --- | --- |
| `--input=<dir>` | directory whose contents will be archived (default: project directory) |
| `--output=<bundle.tar>` | path to the tar archive to write (default: <build_name>-<version>.tar) |
| `--manifest=<path>` | optional manifest path to update with a new target for this bundle |
| `--manifest-name=<name>` | manifest filename to use when --manifest is not provided |
| `--channel=<name>` | update channel to associate with this bundle (default: update_channel or "stable") |
| `--update-id=<id>` | update id to associate with this bundle (default: <channel>-<version>) |
| `--platform=<id>` | platform identifier for the bundle target (default: source) |
| `--arch=<id>` | architecture identifier for the bundle target (default: any) |
| `--artifact-url=<url-or-path>` | artifactUrl to record in the manifest target (default: bundle filename) |
| `--hash-algorithm=<sha256\|sha1>` | hash algorithm to use (default: sha256 when libsodium is available, otherwise sha1) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update bundle
# bundle the current project source into <build_name>-<version>.tar

oroc update bundle --manifest manifest.json
# bundle the project and record the artifact in manifest.json

oroc update bundle --input dist --output app-1.2.3.tar --manifest manifest.json --channel beta
# bundle a custom directory and attach it as a beta update in the manifest
```

## Considerations

- The archive is a plain tar file built using the runtime tar implementation.
- Directory layout and basic metadata such as mode bits and mtime are preserved.
- If omitted, `--input` defaults to the project directory and `--output` defaults to `<build_name>-<version>.tar` derived from `oro.toml`.
- When `--manifest` or `--manifest-name` is provided, the manifest is updated with a target entry describing this bundle, including length and hash.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update extract`](?p=cli/update/extract)
- [`oroc update validate`](?p=cli/update/validate)
