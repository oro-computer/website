# `oroc update`

Update tooling for manifests, signatures, and bundles.

## Usage

```bash
oroc update <subcommand> [options]
```

## Common workflow

```bash
# 1) Scaffold a manifest
oroc update init

# 2) Generate a signing keypair
oroc update keygen > key.json

# 3) Build an update bundle (tar) and record it in the manifest
oroc update bundle --manifest manifest.json

# 4) Sign and verify the manifest
oroc update sign --keys key.json --manifest manifest.json
oroc update verify --keys key.json --manifest manifest.json
```

## Notes

- All subcommands support `--log-file=<path>` to mirror logs to a JSON file.
- Advanced: set `ORO_UPDATE_MANIFEST_FILENAME` or pass `--manifest-name` to override the default `manifest.json` filename.

## Subcommands

- [`oroc update init`](?p=cli/update/init) — scaffold a manifest JSON file.
- [`oroc update keygen`](?p=cli/update/keygen) — generate an Ed25519 signing keypair.
- [`oroc update sign`](?p=cli/update/sign) — sign a manifest and emit `manifest.sig`.
- [`oroc update verify`](?p=cli/update/verify) — verify a manifest and signature pair.
- [`oroc update validate`](?p=cli/update/validate) — validate manifest structure and consistency.
- [`oroc update bundle`](?p=cli/update/bundle) — archive a directory and optionally record it in a manifest.
- [`oroc update extract`](?p=cli/update/extract) — extract a bundle tarball safely.
- [`oroc update server`](?p=cli/update/server) — serve manifests and bundles over HTTP, TCP, or UDP.
- [`oroc update info`](?p=cli/update/info) — inspect a manifest URL or query an update server.

## See also

- [`oroc`](?p=cli/oroc)
- [`oroc help`](?p=cli/help)
- [Configuration reference](?p=config/reference)
