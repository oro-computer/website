# Getting Started

This guide gets you from an installed Virtnosis CLI to a useful first scan.

## Requirements

- `virtnosis-agent` and `vnactl` installed on your `PATH`
- access to a target libvirt UNIX socket if you want to scan a real host

Virtnosis does not require external libvirt spec files at runtime.

## Install

Install `virtnosis-agent` and `vnactl` by package or from source. If you are
building from source, the reference flow is:

```bash
cd virtnosis
make build
make verify
```

Then install them into your preferred prefix so the commands are available on
your `PATH`.

For packaging details, install targets, and extended verification lanes, use
[Install and Package](?p=guides/install-and-package).

## First scan through the agent

```bash
virtnosis-agent --verbose
vnactl scan \
  --socket /var/run/libvirt/libvirt-sock \
  --uri qemu:///system \
  --deep --confirm-xml --redact
```

Use `--connect unix:///run/virtnosis/agent.sock` when talking to a shared system agent instead of the default rootless socket.

## Rootless agent workflow

For non-root users:

```bash
virtnosis-agent --verbose
vnactl status
vnactl scan --deep --redact
```

What this gives you:

- `virtnosis-agent` defaults to `$XDG_RUNTIME_DIR/virtnosis/agent.sock`
- `vnactl` auto-prefers that socket when `--connect` is not set
- this avoids `sudo` for the control plane

Important: the scan still depends on the agent process having access to the target libvirt socket.

## Shared system agent workflow

Start a system-visible socket:

```bash
sudo virtnosis-agent \
  --listen /run/virtnosis/agent.sock \
  --listen-mode 0660 \
  --listen-gid 123
```

Then connect:

```bash
vnactl status --connect unix:///run/virtnosis/agent.sock
```

Replace `123` with the numeric gid you actually want to authorize.

## Where to go next

- Daily workflows: [Operator Guide](?p=guides/operator-guide)
- Output interpretation: [Output and Automation](?p=guides/output-and-automation)
- Deployment details: [Deployment Guide](?p=guides/deployment)
- Troubleshooting: [Operator Guide](?p=guides/operator-guide#common-operator-problems)
- Build, install, and packaging details: [Install and Package](?p=guides/install-and-package)
- Contributor and maintenance details: [Development](?p=reference/development)
