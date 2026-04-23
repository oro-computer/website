# `oroc update verify`

Verify a manifest and signature pair using an Ed25519 public key.

## Usage

```bash
oroc update verify [--manifest=<path>] [--signature=<path>] (--keys=<file> | --public-key=<hex>) [options]
```

## Options

| Option | Description |
| --- | --- |
| `--manifest=<path>` | path to the manifest JSON file |
| `--manifest-name=<name>` | manifest filename to use when --manifest is not provided |
| `--signature=<path>` | path to the manifest.sig JSON file (default: <manifest>.sig) |
| `--keys=<file>` | JSON file containing a public key ("publicKey" or "key" field) |
| `--public-key=<hex>` | Ed25519 public key as a hex string |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update verify --keys key.json --manifest manifest.json
# verify manifest.json against manifest.sig using the public key in key.json

oroc update verify --public-key <hex-public-key> --manifest manifest.json --signature manifest.sig
# verify using an explicit hex-encoded public key and signature file
```

## Considerations

- Exit status `0` means the signature is valid for the manifest and public key.
- A non-zero exit status means verification failed or the inputs were invalid.
- Set `ORO_UPDATE_MANIFEST_FILENAME` or pass `--manifest-name` to change the default manifest filename and derived signature path.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update sign`](?p=cli/update/sign)
- [`oroc update validate`](?p=cli/update/validate)
