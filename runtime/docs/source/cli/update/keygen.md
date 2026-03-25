# `oroc update keygen`

Generate an Ed25519 keypair for signing update manifests.

## Usage

```bash
oroc update keygen [options]
```

## Options

```text
--out=<path>       write keypair JSON to a file instead of stdout
--key-id=<id>      optional key identifier to embed in the keypair (default: pk-1)
--log-file=<path>  mirror logs to a JSON file
```

## Examples

```bash
oroc update keygen > key.json
# generate a default keypair and save it to key.json

oroc update keygen --key-id pk-prod --out prod-key.json
# generate a named keypair for production use
```

## Considerations

- The generated JSON includes `keyId`, `publicKey`, and `privateKey` fields as hex.
- Treat the private key as secret material.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update sign`](?p=cli/update/sign)
- [`oroc update verify`](?p=cli/update/verify)
