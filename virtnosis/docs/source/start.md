# Virtnosis Docs

Virtnosis is a read-only libvirt security analysis and diagnosis toolset.

It is built for operators, responders, and automation that need to inspect
libvirt-exposed infrastructure without mutating host or guest state. Public
binaries:

- `virtnosis-agent` — the local control-plane daemon
- `vnactl` — the operator and automation client

Use it only on systems you own or are explicitly authorized to assess.

## Operating model

Virtnosis is:

- local-first and UNIX-socket-first,
- read-only by default,
- bounded in memory, output size, and scan timing,
- explicit about partial and unavailable scan stages,
- designed to emit stable machine-consumable output.

The control plane is local UNIX sockets only. Remote transports are not part of
the public product surface.

## Quick start

Assume `virtnosis-agent` and `vnactl` are installed and available on your `PATH`.

```bash
virtnosis-agent --verbose
vnactl status
vnactl scan --deep --confirm-xml --redact
```

## Recommended reading path

1. [Getting Started](?p=guides/getting-started)
2. [Install and Package](?p=guides/install-and-package)
3. [Operator Guide](?p=guides/operator-guide)
4. [Deployment Guide](?p=guides/deployment)
5. [Systemd Guide](?p=guides/systemd)
6. [`vnactl`](?p=cli/vnactl)
7. [`virtnosis-agent`](?p=cli/virtnosis-agent)
8. [Scan Analysis](?p=reference/scan-analysis)
9. [Architecture](?p=reference/architecture)
10. [Repository Documents](?p=reference/repository-docs)
11. [Man pages](?p=man/virtnosis-7)

## Docs map

- **Guides** — build, install, deployment, systemd, operator workflows, and
  automation.
- **CLI** — the exact public surface of `vnactl` and `virtnosis-agent`.
- **Reference** — product model, scan semantics, architecture, contributor
  docs, and the repository documentation map.
- **Man pages** — `virtnosis-agent(1)`, `vnactl(1)`, `virtnosis(7)`,
  `virtnosis-agent-protocol(7)`, and `virtnosis-scan-report(7)`.
