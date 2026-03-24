# Deployment Guide

This guide covers local agent deployment, shared socket deployment, and the important permission and auth choices.

## Transport model

The agent supports local UNIX domain sockets only.

Important defaults:

- rootless socket: `$XDG_RUNTIME_DIR/virtnosis/agent.sock`
- system socket: `/run/virtnosis/agent.sock`
- rootless runtime directory mode: `0700`
- system-style listen directory mode: `0755`

## Rootless deployment

Recommended for a single local operator or CI user:

```bash
virtnosis-agent --verbose
```

This keeps the control plane local to the user account and avoids `sudo` for `vnactl`.

## Shared local deployment

Recommended when multiple trusted local users need access:

```bash
sudo virtnosis-agent \
  --listen /run/virtnosis/agent.sock \
  --listen-mode 0660 \
  --listen-gid 123
```

Replace `123` with the gid of the group you want to authorize.

## Socket-activated deployment

Virtnosis also supports a narrow `systemd` socket-activation path for local UNIX sockets.

Use it when:

- you want `systemd` to own socket permissions and lifecycle
- you want lazy startup on first client connection
- you are comfortable keeping the deployment to one inherited UNIX listener fd

Important constraints:

- `.socket` units must use `Accept=no`
- the inherited socket must be filesystem-backed and absolute
- `--listen-mode` and `--listen-gid` do not reconfigure an inherited socket

Use the example units in `deploy/systemd/` and the detailed walkthrough in
[Systemd Guide](?p=guides/systemd).

For package-style staging of those assets, use:

```bash
cd virtnosis
make install-systemd-examples PREFIX=/usr \
  SYSTEM_LISTEN_GID=123 \
  SYSTEM_SOCKET_GROUP=virtnosis
```

`SYSTEM_LISTEN_GID` must be numeric; `SYSTEM_SOCKET_GROUP` may be a group name or numeric gid.

Remove staged examples again with:

```bash
cd virtnosis
make uninstall-systemd-examples PREFIX=/usr
```

For package metadata, staged install verification, and release-facing build
requirements, use [Development](?p=reference/development).

## Peer authentication policies

### `same-uid`

Use when you want strict same-user local access.

### `same-uid-or-listen-gid`

Default. Use when:

- the socket mode and gid are controlled
- you want a shared local group model
- you still want local peer credential checks

### `none`

Use only when you intentionally want filesystem permissions to be the sole gate.

## Operational notes

- the agent creates a missing listen directory when possible
- the socket is bound with restrictive permissions by default
- the agent warns about group- or world-writable listen directories and sockets
- stale socket cleanup is enabled by default when the agent can safely determine the socket is not live

## Rootless and shared-agent interaction

For non-root users, `vnactl` auto-prefers the rootless socket when `--connect` is not set. If that socket is absent or stale, it falls back to the system socket target.

This gives a practical split:

- personal workflow: rootless agent
- team or host-level workflow: shared system agent

## Timeouts and bounded behavior

The agent enforces:

- request and response frame caps
- per-client transport timeouts
- scan wall-time budgets
- bounded client concurrency

`vnactl --timeout-ms` applies to the connect phase as well as request/response I/O.

## Deployment direction

The broader technical design includes:

- systemd service support
- local UNIX socket activation via `systemd`
- future explicit remote transports with stronger policy gates

Current systemd-facing examples and limitations are documented in
[Systemd Guide](?p=guides/systemd).

For the design target and security boundaries, read
[Architecture](?p=reference/architecture) and
[Repository documents](?p=reference/repository-docs).
