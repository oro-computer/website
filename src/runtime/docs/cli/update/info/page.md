---
layout: "docs"
description: "Query update servers or static manifests over HTTP, TCP, or UDP."
docsCollection: "runtime"
section: "cli"
order: 38
sourcePath: "cli/update/info.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc update info`](/runtime/docs/cli/update/info/)

Query update servers or static manifests over HTTP, TCP, or UDP.

## Usage

```bash
oroc update info [--transport=<http|tcp|udp>] [options]
```

## Options

| Option | Description |
| --- | --- |
| `--config=<path>` | use an explicit oro.toml/oro.ini file for local CHECK request defaults |
| `--transport=<http\|tcp\|udp>` | transport to use (default: http) |
| `--http` | shorthand for --transport=http |
| `--tcp` | shorthand for --transport=tcp |
| `--udp` | shorthand for --transport=udp |
| `--follow-manifest` | when contacting servers, follow 'manifestUrl' in the RESPONSE and fetch/validate that manifest over HTTP(S) |
| `--timeout-ms=<ms>` | optional timeout for TCP/UDP CHECK requests (0 = no timeout) |
| `--manifest-url=<url>` | HTTP(S) URL of a manifest.json hosted statically |
| `--signature-url=<url>` | optional HTTP(S) URL of the corresponding signature JSON (default: derived from --manifest-url) |
| `--keys=<file>` | JSON file containing a public key ("publicKey" or "key" field) for manifest verification |
| `--public-key=<hex>` | Ed25519 public key as a hex string for manifest verification |
| `--host=<host>` | host for HTTP/TCP/UDP update servers (default: 127.0.0.1) |
| `--port=<port>` | port for HTTP/TCP/UDP update servers (default: 8080) |
| `--app-id=<id>` | application identifier to send in CHECK messages (default: active config meta.bundle_identifier when available) |
| `--channel=<name>` | update channel hint (default: active config update_channel or "stable") |
| `--current-version=<version>` | current application version hint (default: active config meta.version when available) |
| `--runtime-version=<version>` | runtime version hint advertised in CHECK (optional) |
| `--platform=<id>` | platform hint advertised in CHECK (optional) |
| `--arch=<id>` | architecture hint advertised in CHECK (optional) |
| `--log-file=<path>` | mirror logs to a JSON file |

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

- [`oroc update`](/runtime/docs/cli/update/)
- [`oroc update server`](/runtime/docs/cli/update/server/)
- [`oroc update verify`](/runtime/docs/cli/update/verify/)
