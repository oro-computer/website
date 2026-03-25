# `oroc update info`

Query update servers or static manifests over HTTP, TCP, or UDP.

## Usage

```bash
oroc update info [--transport=<http|tcp|udp>] [options]
```

## Options

```text
--config=<path>            use an explicit oro.toml/oro.ini file for local CHECK request defaults
--transport=<http|tcp|udp> transport to use (default: http)
--http                     shorthand for --transport=http
--tcp                      shorthand for --transport=tcp
--udp                      shorthand for --transport=udp
--follow-manifest          fetch and inspect the manifest referenced by a server RESPONSE
--timeout-ms=<ms>          optional timeout for TCP/UDP CHECK requests (0 = no timeout)
--manifest-url=<url>       HTTP(S) URL of a statically hosted manifest.json
--signature-url=<url>      HTTP(S) URL of the corresponding signature JSON
--keys=<file>              JSON file containing a public key ("publicKey" or "key" field)
--public-key=<hex>         Ed25519 public key as a hex string
--host=<host>              host for HTTP/TCP/UDP update servers (default: 127.0.0.1)
--port=<port>              port for HTTP/TCP/UDP update servers (default: 8080)
--app-id=<id>              application identifier to send in CHECK messages
--channel=<name>           update channel hint
--current-version=<version> current application version hint
--runtime-version=<version> runtime version hint advertised in CHECK
--platform=<id>            platform hint advertised in CHECK
--arch=<id>                architecture hint advertised in CHECK
--log-file=<path>          mirror logs to a JSON file
```

## Examples

```bash
oroc update info --manifest-url https://cdn.example.com/app/manifest.json
# inspect a statically hosted manifest

oroc update info --manifest-url https://cdn.example.com/app/manifest.json --keys app-pubkey.json
# fetch and verify a statically hosted manifest and signature

oroc update info --http --host 127.0.0.1 --port 8080 --app-id com.example.app --follow-manifest
# query an HTTP update server and then fetch the referenced manifest
```

## Considerations

- With `--manifest-url`, the command fetches a manifest JSON and reports whether a signature file is reachable.
- When `--keys` or `--public-key` is provided and libsodium is available, the command also verifies the manifest signature.
- Without `--manifest-url`, the command sends a CHECK request to an update server and prints the RESPONSE payload.
- With `--follow-manifest`, a returned `manifestUrl` is fetched, validated, and optionally verified.
- When `--config` is omitted, the command looks for `oro.toml` first and falls back to `oro.ini` in the current workspace.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update server`](?p=cli/update/server)
- [`oroc update verify`](?p=cli/update/verify)
