---
layout: "virtnosis-docs"
title: "vnactl(1)"
description: "vnactl — Virtnosis agent control client"
docsCollection: "virtnosis"
section: "man"
order: 14
sourcePath: "man/vnactl-1.md"
githubRepo: "oro-computer/virtnosis"
githubRef: "master"
---

# [`vnactl(1)`](/virtnosis/docs/man/vnactl-1/)

## Name

[`vnactl`](/virtnosis/docs/cli/vnactl/) — Virtnosis agent control client

## Synopsis

```bash
vnactl status [options]
vnactl version [options]
vnactl scan [options]
```

## Description

[`vnactl`](/virtnosis/docs/cli/vnactl/) connects to [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/) and performs control-plane operations
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

For non-root users, [`vnactl`](/virtnosis/docs/cli/vnactl/) auto-prefers
`$XDG_RUNTIME_DIR/virtnosis/agent.sock` when it exists. If that socket is
absent or stale, the client falls back to `/run/virtnosis/agent.sock`.

## Transport policy

Public builds support only local UNIX socket control connections.
Planned transports such as `tcp://`, `tls://`, `ssh://`, `http://`, `https://`,
`ws://`, and `wss://` are intentionally rejected today.

## Protocol notes

[`vnactl`](/virtnosis/docs/cli/vnactl/) uses the length-prefixed JSON control protocol described in
[virtnosis-agent-protocol(7)](/virtnosis/docs/man/virtnosis-agent-protocol-7/).

For large scan output it prefers the streaming scan method when available and
falls back to the older framed raw-stdout mode for older agents.

## Exit status

| Code | Meaning |
| --- | --- |
| `0` | Success. |
| `2` | CLI usage or argument error. |
| `3` | Connection, protocol, framing, or internal runtime failure. |

For `scan`, the command propagates the scan exit code.

## Examples

```bash
vnactl status --connect unix:///run/virtnosis/agent.sock
vnactl version --connect /run/virtnosis/agent.sock
vnactl scan --connect unix:///run/virtnosis/agent.sock --deep --confirm-xml
```

## Files

| Path | Purpose |
| --- | --- |
| `/run/virtnosis/agent.sock` | System-wide default agent socket. |
| `$XDG_RUNTIME_DIR/virtnosis/agent.sock` | Per-user default agent socket when a runtime directory is available. |

## Environment

| Variable | Details |
| --- | --- |
| `XDG_RUNTIME_DIR` | Supplies the per-user runtime directory used when resolving the default agent socket path. |

## See also

- [vnactl](/virtnosis/docs/cli/vnactl/)
- [virtnosis-agent(1)](/virtnosis/docs/man/virtnosis-agent-1/)
- [virtnosis(7)](/virtnosis/docs/man/virtnosis-7/)
- [virtnosis-agent-protocol(7)](/virtnosis/docs/man/virtnosis-agent-protocol-7/)
- [virtnosis-scan-report(7)](/virtnosis/docs/man/virtnosis-scan-report-7/)
