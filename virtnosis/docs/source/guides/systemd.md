# Systemd Guide

This guide documents the `systemd` deployment story for Virtnosis.

## Support boundary

Virtnosis supports two local deployment models:

- direct-bind services, where `virtnosis-agent` creates and owns the control socket
- socket-activated services, where `systemd` creates the control socket and passes one inherited listener fd to the agent

Socket-activation support is intentionally narrow:

- exactly one inherited listener fd
- UNIX domain sockets only
- filesystem-backed absolute paths only
- `.socket` units must use `Accept=no`

Multiple inherited fds, abstract UNIX sockets, and remote control-plane listeners are still outside the supported surface.

## Example files

Example units live in:

- `deploy/systemd/system/virtnosis-agent.service`
- `deploy/systemd/user/virtnosis-agent.service`
- `deploy/systemd/system/virtnosis-agent.socket`
- `deploy/systemd/system/virtnosis-agent-socket-activated.service`
- `deploy/systemd/user/virtnosis-agent.socket`
- `deploy/systemd/user/virtnosis-agent-socket-activated.service`
- `deploy/systemd/tmpfiles.d/virtnosis.conf`
- `deploy/systemd/sysusers.d/virtnosis.conf`
- `deploy/systemd/README.md`

These are examples, not a promise that the exact paths or gids match your environment.

## Direct-bind system service

Use the direct system service when:

- the host should expose a shared local control socket
- the agent should manage stale-socket cleanup itself
- multiple trusted local users need access through a controlled gid

Typical flow:

1. review `deploy/systemd/system/virtnosis-agent.service`
2. adjust `ExecStart=` and `--listen-gid`
3. install the unit under `/etc/systemd/system/`
4. run `systemctl daemon-reload`
5. run `systemctl enable --now virtnosis-agent.service`

## Direct-bind user service

Use the user service when:

- you want a per-user control plane
- you want `vnactl` to work without `sudo`
- the user account already has access to the target libvirt socket

Typical flow:

1. review `deploy/systemd/user/virtnosis-agent.service`
2. adjust `ExecStart=`
3. install the unit under `~/.config/systemd/user/`
4. run `systemctl --user daemon-reload`
5. run `systemctl --user enable --now virtnosis-agent.service`

## Socket-activated system service

Use the socket-activated system pair when:

- you want `systemd` to own socket creation and permissions
- you want lazy startup on first client connection
- you want the service and the socket configured separately

Typical flow:

1. review `deploy/systemd/system/virtnosis-agent.socket`
2. set `SocketGroup=` and `ListenStream=`
3. review `deploy/systemd/system/virtnosis-agent-socket-activated.service`
4. adjust `ExecStart=`
5. install both units under `/etc/systemd/system/`
6. run `systemctl daemon-reload`
7. run `systemctl enable --now virtnosis-agent.socket`

Important behavior:

- the `.socket` unit controls socket mode, gid, and directory mode
- `virtnosis-agent --listen-mode` and `--listen-gid` are ignored when the socket is inherited from `systemd`
- `vnactl status` reports `result.listen.socket_activation: true` when the agent is serving from an inherited listener

## Packaging assets

The repo now also ships packaging-oriented examples:

- `deploy/systemd/sysusers.d/virtnosis.conf` creates the shared local control-socket group used by the example socket-activated system deployment
- `deploy/systemd/tmpfiles.d/virtnosis.conf` optionally materializes `/run/virtnosis` before first service start

The tmpfiles asset is optional with the shipped unit files because:

- the direct-bind system service already uses `RuntimeDirectory=virtnosis`
- the socket-activated system unit pair already uses `DirectoryMode=` in the `.socket` unit

Use it when your packaging or wrapper conventions require the runtime directory to exist independently of those units.

For repo-side validation of the staged units, run:

```bash
cd virtnosis
make systemd-verify
```

That path stages the example assets into a temporary tree, rewrites `ExecStart=` to a temporary stub binary, runs `systemd-analyze verify` on the units, and validates the `tmpfiles.d` / `sysusers.d` assets with the native systemd tools when they are available on the host.

## Socket-activated user service

Use the rootless socket-activated pair when:

- you want rootless on-demand startup
- you want the control socket under `%t/virtnosis/agent.sock`
- you want `systemd --user` to own socket lifecycle

Typical flow:

1. review `deploy/systemd/user/virtnosis-agent.socket`
2. review `deploy/systemd/user/virtnosis-agent-socket-activated.service`
3. adjust `ExecStart=`
4. install both units under `~/.config/systemd/user/`
5. run `systemctl --user daemon-reload`
6. run `systemctl --user enable --now virtnosis-agent.socket`

## Hardening notes

The shipped service examples include a conservative baseline:

- `NoNewPrivileges=yes`
- `PrivateTmp=yes`
- `ProtectSystem=strict`
- `ProtectHome=` restrictions
- `ProtectKernelTunables=yes`
- `ProtectKernelModules=yes`
- `ProtectKernelLogs=yes`
- `LockPersonality=yes`
- `MemoryDenyWriteExecute=yes`
- `RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6`
- empty `CapabilityBoundingSet=` and `AmbientCapabilities=`

The address-family allowlist includes `AF_INET` and `AF_INET6` intentionally so the scan engine can still reach remote libvirt TCP/TLS URIs when operators use them.
If your deployment is strictly local-libvirt-only, you can narrow that directive to `AF_UNIX`.

## Important operational caveat

The control socket and the libvirt socket are separate concerns.

Even if `vnactl` can reach `virtnosis-agent`, the scan still fails if the agent process does not have access to the target libvirt socket or remote libvirt URI you asked it to inspect.

## Where to go next

- broader deployment guidance: [Deployment Guide](?p=guides/deployment)
- installable docs layout: [Install and Package](?p=guides/install-and-package)
- deeper design target: [Repository documents](?p=reference/repository-docs)
