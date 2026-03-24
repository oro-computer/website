# `virtnosis-agent`

`virtnosis-agent` is the local control-plane daemon for Virtnosis.

It binds or adopts a local UNIX socket, accepts bounded JSON-framed requests,
and runs status, version, and scan work on behalf of operators and automation
clients.

## Synopsis

```bash
virtnosis-agent [--listen <abs-path|unix://...>] [--listen-mode <octal>] [--listen-gid <n>] [--backlog <n>] [--max-clients <n>] [--client-timeout-ms <n>]
                 [--max-request-bytes <n>] [--max-response-bytes <n>] [--scan-timeout-ms <n>]
                 [--peer-auth <none|same-uid|same-uid-or-listen-gid>] [--once] [--no-unlink-stale] [--verbose]

virtnosis-agent agent [same options]
```

## Purpose

Use `virtnosis-agent` when you want:

- a stable local control plane for repeated scans,
- rootless workflows that avoid `sudo` for `vnactl`,
- shared local access through a controlled socket gid,
- machine-readable status and build-identity metadata,
- bounded request/response behavior around the scan engine.

## Options

- `--listen <path>` — absolute UNIX socket path or `unix://` path. Remote
  listen transports are rejected.
- `--listen-mode <octal>` — post-bind socket mode such as `0660`. Ignored when
  the listener is inherited from `systemd`.
- `--listen-gid <gid>` — post-bind socket gid. Ignored when the listener is
  inherited from `systemd`.
- `--backlog <n>` — listen backlog.
- `--max-clients <n>` — max concurrent client handlers.
- `--client-timeout-ms <n>` — per-client transport timeout.
- `--max-request-bytes <n>` — request frame cap. Hard max: `4194304` bytes
  (4 MiB).
- `--max-response-bytes <n>` — response frame cap. Hard max: `33554432` bytes
  (32 MiB).
- `--scan-timeout-ms <n>` — default wall-time budget for agent-triggered scans.
- `--peer-auth <policy>` — peer-auth policy. Current values:
  `none`, `same-uid`, `same-uid-or-listen-gid`.
- `--once` — handle one successful request and exit.
- `--no-unlink-stale` — disable automatic stale-socket cleanup.
- `--verbose` — emit extra diagnostics to stderr.

## Rootless mode

When running as a non-root user and `--listen` is omitted, the agent binds:

```text
$XDG_RUNTIME_DIR/virtnosis/agent.sock
```

The runtime directory is created with mode `0700`.

## Systemd socket activation

Socket activation support is intentionally narrow:

- exactly one inherited listener fd,
- local UNIX sockets only,
- filesystem-backed absolute socket paths only,
- `.socket` units must use `Accept=no`.

When the listener is inherited from `systemd`, socket ownership and mode come
from the `.socket` unit, not from `--listen-mode` or `--listen-gid`.

## Peer authentication

### `same-uid`

Allows only the same effective UID and root.

### `same-uid-or-listen-gid`

Default policy. Allows:

- the same UID,
- root,
- or peers in the configured or resolved socket gid.

### `none`

Relies only on filesystem permissions for access control.

## Examples

### Rootless

```bash
XDG_RUNTIME_DIR=/run/user/1000 virtnosis-agent --verbose
```

### Shared local socket

```bash
virtnosis-agent \
  --listen /run/virtnosis/agent.sock \
  --listen-mode 0660 \
  --listen-gid 123
```

### One-shot diagnostic run

```bash
virtnosis-agent --once --verbose
```

## Considerations

- The control socket and the libvirt socket are separate concerns. Even if the
  agent is reachable, scans still fail if the agent process cannot access the
  requested libvirt socket or URI.
- Virtnosis is intentionally local-only on the control plane.
- The agent is safe-by-default: bounded frames, bounded timeouts, peer-auth, and
  conservative socket ownership.

## See also

- [Deployment Guide](?p=guides/deployment)
- [Systemd Guide](?p=guides/systemd)
- [`vnactl`](?p=cli/vnactl)
- [virtnosis-agent(1)](?p=man/virtnosis-agent-1)
- [virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7)
