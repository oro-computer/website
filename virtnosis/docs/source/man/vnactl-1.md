# `vnactl(1)`

## Name

`vnactl` — Virtnosis agent control client

## Synopsis

```bash
vnactl status [options]
vnactl version [options]
vnactl scan [options]
```

## Description

`vnactl` connects to `virtnosis-agent` and performs control-plane operations
such as status queries, version probes, and remote scan requests.

The public implementation supports only local UNIX domain sockets for agent
transport.

## Commands

- `status` — fetch agent status and capability metadata
- `version` — fetch agent version metadata
- `scan` — request a scan from the agent and print or stream the result

## Common options

- `--connect <target>`
- `--timeout-ms <n>`
- `--max-response-bytes <n>`
- `--raw-json`

Accepted `--connect` forms today are `unix:///absolute/path` or a plain
absolute UNIX socket path.

## Scan options

- `--timeout-ms-agent-scan <n>`
- `-f, --format default|json|xml`
- `--socket <path>`
- `--uri <uri>`
- `--program remote|admin`
- `--deep`
- `--confirm-xml`
- `--redact`
- `--verbose`
- `--deep-enum-max <n>`
- `--deep-resolve-max <n>`
- `--deep-vol-resolve-max <n>`
- `--deep-xml-max <n>`
- `--deep-vol-xml-max <n>`
- `--timeout-ms-scan <n>`
- `--scan-timeout-ms <n>`

## Rootless behavior

For non-root users, `vnactl` auto-prefers
`$XDG_RUNTIME_DIR/virtnosis/agent.sock` when it exists. If that socket is
absent or stale, the client falls back to `/run/virtnosis/agent.sock`.

## Transport policy

Public builds support only local UNIX socket control connections.
Planned transports such as `tcp://`, `tls://`, `ssh://`, `http://`, `https://`,
`ws://`, and `wss://` are intentionally rejected today.

## Protocol notes

`vnactl` uses the length-prefixed JSON control protocol described in
[virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7).

For large scan output it prefers the streaming scan method when available and
falls back to the older framed raw-stdout mode for older agents.

## Exit status

- `0` — success
- `2` — CLI usage or argument error
- `3` — connection, protocol, framing, or internal runtime failure

For `scan`, the command propagates the scan exit code.

## Examples

```bash
vnactl status --connect unix:///run/virtnosis/agent.sock
vnactl version --connect /run/virtnosis/agent.sock
vnactl scan --connect unix:///run/virtnosis/agent.sock --deep --confirm-xml
```

## Files

- `/run/virtnosis/agent.sock`
- `$XDG_RUNTIME_DIR/virtnosis/agent.sock`

## Environment

- `XDG_RUNTIME_DIR`

## See also

- [vnactl](?p=cli/vnactl)
- [virtnosis-agent(1)](?p=man/virtnosis-agent-1)
- [virtnosis(7)](?p=man/virtnosis-7)
- [virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7)
- [virtnosis-scan-report(7)](?p=man/virtnosis-scan-report-7)
