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

### `init`

Scaffold a minimal update manifest JSON file.

```bash
oroc update init [options]
```

Options:

```text
--config=<path>         use an explicit oro.toml/oro.ini when deriving defaults
--manifest-name=<name>  filename for the manifest JSON (default: manifest.json or ORO_UPDATE_MANIFEST_FILENAME)
--log-file=<path>       mirror logs to a JSON file
```

Notes:

This command creates a basic manifest with:

- `schemaVersion = 1`
- `appId` derived from your `oro.toml` (`meta.bundle_identifier`, falling back to `"com.example.app"`)
- `generatedAt =` current UTC timestamp
- `channels = [update_channel or "stable"]`
- `updates =` a single entry for the current version/channel (with an empty `targets` array)

Edit the generated file to add real targets, artifact metadata, or additional updates.

Examples:

```bash
oroc update init
# create ./manifest.json using oro.toml metadata

oroc update init --manifest-name app-updates.json
# create ./app-updates.json instead of manifest.json
```

### `keygen`

Generate an Ed25519 keypair for signing update manifests.

```bash
oroc update keygen [options]
```

Options:

```text
--out=<path>       write keypair JSON to a file instead of stdout
--key-id=<id>      optional key identifier (default: pk-1)
--log-file=<path>  mirror logs to a JSON file
```

Notes:

The generated JSON includes `keyId`, `publicKey`, and `privateKey` fields (hex-encoded).
Keep the private key secret; distribute only the public key with your application.

Examples:

```bash
oroc update keygen > key.json
# generate a default keypair and save it to key.json

oroc update keygen --key-id pk-prod --out prod-key.json
# generate a named keypair for production use
```

### `sign`

Sign an update manifest and emit a detached `manifest.sig` file.

```bash
oroc update sign [--manifest=<path>] (--keys=<file> | --private-key=<hex>) [options]
```

Options:

```text
--manifest=<path>       path to the manifest JSON file to sign
--manifest-name=<name>  manifest filename to use when --manifest is not provided
--keys=<file>           JSON file containing a signing key ("privateKey" or "secretKey" field)
--private-key=<hex>     Ed25519 private key as a hex string
--key-id=<id>           optional key identifier to embed in manifest.sig (default: pk-1)
--out=<path>            output path for manifest.sig (default: <manifest-without-extension>.sig)
--log-file=<path>       mirror logs to a JSON file
```

Notes:

The signature file is JSON containing `schemaVersion`, `algorithm`, `keyId`, and `signature` fields.
Clients verify manifest bytes against `manifest.sig` and the configured public key(s).

Advanced: set `ORO_UPDATE_MANIFEST_FILENAME` or pass `--manifest-name` to change the default manifest filename.

Examples:

```bash
oroc update sign --keys key.json --manifest manifest.json
# sign manifest.json using the private key in key.json

oroc update sign --private-key <hex-private-key> --manifest manifest.json --out manifest.sig
# sign a manifest using a raw hex private key
```

### `verify`

Verify a manifest + signature pair using an Ed25519 public key.

```bash
oroc update verify [--manifest=<path>] [--signature=<path>] (--keys=<file> | --public-key=<hex>) [options]
```

Options:

```text
--manifest=<path>       path to the manifest JSON file
--manifest-name=<name>  manifest filename to use when --manifest is not provided
--signature=<path>      path to the manifest.sig JSON file (default: <manifest>.sig)
--keys=<file>           JSON file containing a public key ("publicKey" or "key" field)
--public-key=<hex>      Ed25519 public key as a hex string
--log-file=<path>       mirror logs to a JSON file
```

Notes:

Exits with status `0` when the signature is valid for the manifest and public key; non-zero otherwise.

Advanced: set `ORO_UPDATE_MANIFEST_FILENAME` or pass `--manifest-name` to change the default manifest filename
(the default signature path is derived as `<manifest-without-extension>.sig`, e.g. `manifest.json -> manifest.sig`).

Examples:

```bash
oroc update verify --keys key.json --manifest manifest.json
# verify manifest.json against manifest.sig using the public key in key.json

oroc update verify --public-key <hex-public-key> --manifest manifest.json --signature manifest.sig
# verify using an explicit hex-encoded public key and signature file
```

### `validate`

Validate an update manifest against the expected schema shape.

```bash
oroc update validate [--manifest=<path>] [options]
```

Options:

```text
--manifest=<path>       path to the manifest JSON file
--manifest-name=<name>  manifest filename to use when --manifest is not provided
--strict                enable additional consistency checks (channels vs updates, artifactUrl shape)
--json                  print a machine-readable JSON result object (for CI)
--log-file=<path>       mirror logs to a JSON file
```

Notes:

This command parses the manifest and performs lightweight structural validation aligned with
`schemas/update-manifest.schema.json` (required fields, types, and key relationships).
It does not attempt full JSON Schema validation, but is suitable for fast local checks and CI.

When `--strict` is provided, additional consistency rules are enforced.

Examples:

```bash
oroc update validate --manifest manifest.json
# run basic structural checks against manifest.json

oroc update validate --manifest manifest.json --strict
# enable stricter consistency rules in addition to structural checks
```

### `bundle`

Build a tar archive containing the contents of a directory for use as an update artifact.

```bash
oroc update bundle [--input=<dir>] [--output=<bundle.tar>] [options]
```

Options:

```text
--input=<dir>                  directory whose contents will be archived (default: project directory)
--output=<bundle.tar>          path to the tar archive to write (default: <build_name>-<version>.tar)
--manifest=<path>              optional manifest path to update with a new target for this bundle
--manifest-name=<name>         manifest filename to use when --manifest is not provided
--channel=<name>               update channel to associate with this bundle (default: update_channel or "stable")
--update-id=<id>               update id to associate with this bundle (default: <channel>-<version>)
--platform=<id>                platform identifier for the bundle target (default: source)
--arch=<id>                    architecture identifier for the bundle target (default: any)
--artifact-url=<url-or-path>   artifactUrl to record in the manifest target (default: bundle filename)
--hash-algorithm=<sha256|sha1> hash algorithm to use (default: sha256 when libsodium is available, otherwise sha1)
--log-file=<path>              mirror logs to a JSON file
```

Notes:

The archive is a plain tar file (no compression) built using the runtime’s native tar implementation.
Directory layout and basic metadata (mode bits, mtime) are preserved.

When omitted:

- `--input` defaults to the project directory (app source)
- `--output` defaults to `<build_name>-<version>.tar` derived from your `oro.toml` metadata

When `--manifest` or `--manifest-name` (or `ORO_UPDATE_MANIFEST_FILENAME`) is provided, the manifest is updated
with a new target entry describing this bundle (including length and hash).

Examples:

```bash
oroc update bundle
# bundle the current project source into <build_name>-<version>.tar

oroc update bundle --manifest manifest.json
# bundle the project and record the artifact in manifest.json

oroc update bundle --input dist --output app-1.2.3.tar --manifest manifest.json --channel beta
# bundle a custom directory and attach it as a beta update in the manifest
```

### `extract`

Extract an update tar archive produced by `update bundle`.

```bash
oroc update extract --bundle=<bundle.tar> --dest=<dir> [options]
```

Options:

```text
--bundle=<bundle.tar>  path to the tar archive to extract
--dest=<dir>           destination directory (created if missing)
--log-file=<path>      mirror logs to a JSON file
```

Notes:

The extractor rejects absolute paths and any paths containing `..` or `:` to avoid directory traversal.
Special tar entries (symlinks, devices, etc.) are ignored; regular files and directories are restored.

Examples:

```bash
oroc update extract --bundle app-1.0.0.tar --dest ./update-staging
# extract the contents of app-1.0.0.tar into ./update-staging
```

### `server`

Run an update server over HTTP/TCP/UDP.

```bash
oroc update server [options]
```

Options:

```text
--root=<dir>           directory containing manifest trees and artifacts to serve
--host=<host>          interface to bind (default: 0.0.0.0)
--port=<port>          port to bind (default: 8080)
--manifest-name=<name> manifest filename to look up under each appId
--tcp                  run in TCP mode (binary OUP CHECK/RESPONSE)
--udp                  run in UDP mode (binary OUP CHECK/RESPONSE)
--log-file=<path>      mirror logs to a JSON file
```

Notes:

Default mode is HTTP; the server exposes:

- `GET /health` — readiness metadata
- `POST /check` — accepts a CHECK JSON payload with `appId` and responds with a RESPONSE JSON whose `manifestUrl`
  points at `/<appId>/<manifest-name>` when present
- `GET /<path>` — serves files rooted under `--root`, including `<appId>/<manifest-name>` and `<appId>/<manifest-name>.sig`

HTTP mode is designed to be run behind a load balancer or reverse proxy in production.
TCP and UDP modes implement the same CHECK/RESPONSE selection semantics using the binary OUP framing.

Examples:

```bash
oroc update server --root ./updates
# serve manifests and bundles over HTTP on port 8080

oroc update server --root ./updates --tcp --port 9090
# run a TCP OUP server on port 9090

oroc update server --root ./updates --udp --port 9090
# run a UDP OUP server on port 9090
```

### `info`

Query update servers or static manifests over HTTP/TCP/UDP.

```bash
oroc update info [--transport=<http|tcp|udp>] [options]
```

Options:

```text
--transport=<http|tcp|udp>  transport to use (default: http)
--http                      shorthand for --transport=http
--tcp                       shorthand for --transport=tcp
--udp                       shorthand for --transport=udp
--follow-manifest           when contacting servers, follow manifestUrl in the RESPONSE and fetch/validate the manifest over HTTP(S)
--timeout-ms=<ms>           optional timeout for TCP/UDP CHECK requests (0 = no timeout)
--manifest-url=<url>        HTTP(S) URL of a statically hosted manifest.json
--signature-url=<url>       optional signature URL (default: derived from --manifest-url)
--keys=<file>               JSON file containing a public key ("publicKey" or "key" field)
--public-key=<hex>          Ed25519 public key as a hex string
--host=<host>               host for HTTP/TCP/UDP update servers (default: 127.0.0.1)
--port=<port>               port for HTTP/TCP/UDP update servers (default: 8080)
--app-id=<id>               application identifier to send in CHECK messages (default: oro.toml meta.bundle_identifier)
--channel=<name>            update channel hint (default: update_channel or "stable")
--current-version=<version> current app version hint (default: meta.version)
--runtime-version=<version> runtime version hint advertised in CHECK (optional)
--platform=<id>             platform hint advertised in CHECK (optional)
--arch=<id>                 architecture hint advertised in CHECK (optional)
--log-file=<path>           mirror logs to a JSON file
```

Notes:

- With `--manifest-url`, this command fetches and pretty-prints a manifest JSON and reports whether a signature file is
  reachable. When `--keys` or `--public-key` is provided and libsodium is available, it also verifies the manifest
  signature before printing.
- With HTTP/TCP/UDP transports and no `--manifest-url`, it sends a CHECK message to an update server and pretty-prints the
  RESPONSE JSON. With `--follow-manifest`, if the RESPONSE includes a `manifestUrl`, it will fetch, validate, and
  optionally verify that manifest as well. When `--app-id` is provided, the fetched manifest must have a matching `appId`
  or the command exits with an error.
- When using TCP/UDP, `--timeout-ms` can be used to bound how long the client waits for a response.
- `--http`, `--tcp`, and `--udp` are shorthands for `--transport=http`, `--transport=tcp`, and `--transport=udp`.

Examples:

```bash
oroc update info --manifest-url https://cdn.example.com/app/manifest.json
# inspect a statically hosted manifest

oroc update info --manifest-url https://cdn.example.com/app/manifest.json --keys app-pubkey.json
# fetch and verify a statically hosted manifest + signature

oroc update info --http --host 127.0.0.1 --port 8080 --app-id com.example.app --follow-manifest
# query an HTTP update server and then fetch the referenced manifest

oroc update info --tcp --host 127.0.0.1 --port 9000 --app-id com.example.app --follow-manifest
# query a TCP update server using the binary OUP protocol
```
