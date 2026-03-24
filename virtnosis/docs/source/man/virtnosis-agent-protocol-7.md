# `virtnosis-agent-protocol(7)`

## Name

`virtnosis-agent-protocol` — control protocol and transport model for
Virtnosis

## Description

This is the framing and message model used between `vnactl` and
`virtnosis-agent`.

The protocol is designed to be:

- simple,
- bounded,
- transport-agnostic at the framing layer,
- safe to implement in Silk.

## Framing

For stream transports, each message is:

1. a 32-bit big-endian length prefix,
2. followed by that many payload bytes,
3. containing one UTF-8 JSON object.

Large scan output uses a separate raw frame or a streamed sequence of raw
stdout frames so the agent does not need to embed arbitrarily large multiline
scan output inside one JSON value.

## Message types

- `request`
- `response`
- `stream_start`
- `event` (reserved for future progress/server-originated traffic)

## Core fields

- `v`
- `id`
- `type`
- `method`
- `params`
- `ok`
- `result`
- `error`

## Status contract

`status` and `version` responses report:

- agent identity and version,
- serving executable path,
- build-identity verification state,
- supported methods,
- effective listen path and auto-selection state,
- socket-activation state,
- transport policy fields,
- listener/client security summaries,
- socket mode, gid, and local peer-auth diagnostics.

## Scan contract

Current scan methods:

- `scan` — JSON envelope plus a second framed raw-stdout payload
- `scan_stream` — start envelope, stdout frames, zero-length terminator, and a
  final response envelope

Clients should prefer `scan_stream` when supported.

## Transport policy

Public builds support only local UNIX domain sockets for the control plane,
either bound directly by the agent or inherited from `systemd`.

The protocol already classifies future transports, but the build does not
enable them today.

## Security properties

- strict length-prefix framing
- request and response size caps
- bounded timeouts
- no silent downgrade of partial results
- local peer-auth policy for UNIX sockets

## Examples

Example request envelope:

```json
{
  "v": 1,
  "id": "req-1",
  "type": "request",
  "method": "status",
  "params": {}
}
```

Example success envelope:

```json
{
  "v": 1,
  "id": "req-1",
  "type": "response",
  "ok": true,
  "result": {
    "methods": ["status", "version", "scan", "scan_stream"]
  }
}
```

## See also

- [vnactl(1)](?p=man/vnactl-1)
- [virtnosis-agent(1)](?p=man/virtnosis-agent-1)
- [virtnosis(7)](?p=man/virtnosis-7)
- [Architecture](?p=reference/architecture)
