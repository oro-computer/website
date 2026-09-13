---
layout: "runtime-docs"
title: "oroc update sign"
description: "Sign an update manifest and emit a detached manifest.sig file."
docsCollection: "runtime"
section: "cli"
order: 40
sourcePath: "cli/update/sign.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc update sign`](/runtime/docs/cli/update/sign/)

Sign an update manifest and emit a detached `manifest.sig` file.

## Usage

```bash
oroc update sign [--manifest=<path>] (--keys=<file> | --private-key=<hex>) [options]
```

## Options

| Option | Description |
| --- | --- |
| `--manifest=<path>` | path to the manifest JSON file to sign |
| `--manifest-name=<name>` | manifest filename to use when --manifest is not provided |
| `--keys=<file>` | JSON file containing a signing key ("privateKey" or "secretKey" field) |
| `--private-key=<hex>` | Ed25519 private key as a hex string |
| `--key-id=<id>` | optional key identifier to embed in manifest.sig (default: pk-1) |
| `--out=<path>` | output path for manifest.sig (default: <manifest-without-extension>.sig) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update sign --keys key.json --manifest manifest.json
# sign manifest.json using the private key in key.json

oroc update sign --private-key <hex-private-key> --manifest manifest.json --out manifest.sig
# sign a manifest using a raw hex private key
```

## Considerations

- The signature file is JSON containing `schemaVersion`, `algorithm`, `keyId`, and `signature`.
- Clients verify exact manifest bytes against `manifest.sig` and configured public keys.
- Set `ORO_UPDATE_MANIFEST_FILENAME` or pass `--manifest-name` to change the default manifest filename.

## See also

- [`oroc update`](/runtime/docs/cli/update/)
- [`oroc update keygen`](/runtime/docs/cli/update/keygen/)
- [`oroc update verify`](/runtime/docs/cli/update/verify/)
