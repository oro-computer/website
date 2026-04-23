# `oroc update server`

Run an update server that speaks the Oro Application Update Protocol.

## Usage

```bash
oroc update server [options]
```

## Options

| Option | Description |
| --- | --- |
| `--root=<dir>` | directory containing manifest trees and artifacts to serve |
| `--host=<host>` | interface to bind (default: 0.0.0.0) |
| `--port=<port>` | TCP/UDP port to bind (default: 8080) |
| `--manifest-name=<name>` | manifest filename to look up under each appId (default: manifest.json or ORO_UPDATE_MANIFEST_FILENAME) |
| `--tcp` | run in TCP mode (binary OUP CHECK/RESPONSE) |
| `--udp` | run in UDP mode (binary OUP CHECK/RESPONSE) |
| `--log-file=<path>` | mirror logs to a JSON file |

## Examples

```bash
oroc update server --root ./updates
# serve manifests and bundles over HTTP on port 8080

oroc update server --root ./updates --tcp --port 9090
# run a TCP OUP server on port 9090

oroc update server --root ./updates --udp --port 9090
# run a UDP OUP server on port 9090
```

## Considerations

- Default mode is HTTP.
- The HTTP server exposes `GET /health`, `POST /check`, and `GET /<path>` for manifest and artifact serving.
- TCP and UDP modes implement the same CHECK and RESPONSE selection semantics using binary OUP framing.
- Run HTTP mode behind a reverse proxy or load balancer in production.

## See also

- [`oroc update`](?p=cli/update)
- [`oroc update info`](?p=cli/update/info)
