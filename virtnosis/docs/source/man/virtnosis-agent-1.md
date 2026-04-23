# `virtnosis-agent(1)`

## Name

`virtnosis-agent` — Virtnosis local agent and daemon

## Synopsis

```bash
virtnosis-agent [agent] [options]
```

## Description

`virtnosis-agent` starts the Virtnosis control-plane daemon. It binds a local
UNIX domain socket itself or adopts one inherited from `systemd`, accepts
bounded JSON-framed requests, and runs libvirt scan work on behalf of operators
and automation clients.

## Options

- `--listen <path>`
- `--listen-mode <octal>`
- `--listen-gid <gid>`
- `--backlog <n>`
- `--max-clients <n>`
- `--client-timeout-ms <n>`
- `--max-request-bytes <n>`
- `--max-response-bytes <n>`
- `--scan-timeout-ms <n>`
- `--peer-auth none|same-uid|same-uid-or-listen-gid`
- `--once`
- `--no-unlink-stale`
- `--verbose`

## Systemd socket activation

Current support is intentionally narrow:

- exactly one inherited listener fd,
- a filesystem-backed absolute UNIX socket path,
- `.socket` units with `Accept=no`.

## Rootless mode

When `--listen` is not provided and the process is running as a non-root user,
the default listener is `$XDG_RUNTIME_DIR/virtnosis/agent.sock`.

## Peer authentication

- `same-uid` — allow the same effective UID and root
- `same-uid-or-listen-gid` — allow the same UID, root, or peers in the socket
  gid
- `none` — rely only on filesystem permissions

## Status surface

The agent answers `status` and `version` requests with machine-readable
metadata such as:

- effective listen path,
- auto-path selection state,
- socket-activation state,
- transport policy fields,
- resolved auth target gid,
- socket mode and writability diagnostics.

## Exit status

| Code | Meaning |
| --- | --- |
| `0` | Normal exit. |
| `2` | CLI usage error. |
| `3` | Listener setup, permission, or runtime failure. |

## Examples

```bash
virtnosis-agent --listen /run/virtnosis/agent.sock --verbose
virtnosis-agent --listen /run/virtnosis/agent.sock --listen-mode 0660 --listen-gid 123
XDG_RUNTIME_DIR=/run/user/1000 virtnosis-agent --verbose
```

## Files

| Path | Purpose |
| --- | --- |
| `/run/virtnosis/agent.sock` | System-wide default listener path. |
| `$XDG_RUNTIME_DIR/virtnosis/agent.sock` | Per-user default listener path when a runtime directory is available. |

## Environment

| Variable | Details |
| --- | --- |
| `XDG_RUNTIME_DIR` | Supplies the per-user runtime directory used when constructing the default listener path. |
| `LISTEN_PID` | Socket-activation metadata used when inheriting listeners from `systemd`. |
| `LISTEN_FDS` | Socket-activation metadata used when inheriting listeners from `systemd`. |

## See also

- [virtnosis-agent](?p=cli/virtnosis-agent)
- [vnactl(1)](?p=man/vnactl-1)
- [virtnosis(7)](?p=man/virtnosis-7)
- [Systemd Guide](?p=guides/systemd)
