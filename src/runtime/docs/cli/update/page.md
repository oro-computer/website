---
layout: "runtime-docs"
title: "oroc update"
description: "Update tooling for manifests, signatures, and bundles."
docsCollection: "runtime"
section: "cli"
order: 35
sourcePath: "cli/update.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc update`](/runtime/docs/cli/update/)

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

- [`oroc update init`](/runtime/docs/cli/update/init/) — scaffold a manifest JSON file.
- [`oroc update keygen`](/runtime/docs/cli/update/keygen/) — generate an Ed25519 signing keypair.
- [`oroc update sign`](/runtime/docs/cli/update/sign/) — sign a manifest and emit `manifest.sig`.
- [`oroc update verify`](/runtime/docs/cli/update/verify/) — verify a manifest and signature pair.
- [`oroc update validate`](/runtime/docs/cli/update/validate/) — validate manifest structure and consistency.
- [`oroc update bundle`](/runtime/docs/cli/update/bundle/) — archive a directory and optionally record it in a manifest.
- [`oroc update extract`](/runtime/docs/cli/update/extract/) — extract a bundle tarball safely.
- [`oroc update server`](/runtime/docs/cli/update/server/) — serve manifests and bundles over HTTP, TCP, or UDP.
- [`oroc update info`](/runtime/docs/cli/update/info/) — inspect a manifest URL or query an update server.

## See also

- [`oroc`](/runtime/docs/cli/oroc/)
- [`oroc help`](/runtime/docs/cli/help/)
- [Configuration reference](/runtime/docs/config/reference/)
