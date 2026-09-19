---
layout: "docs"
description: "Virtnosis is a read-only libvirt security analysis and diagnosis toolset."
docsCollection: "virtnosis"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/virtnosis"
githubRef: "master"
---

# Virtnosis Docs

Virtnosis is a read-only libvirt security analysis and diagnosis toolset.

It is built for operators, responders, and automation that need to inspect
libvirt-exposed infrastructure without mutating host or guest state. Public
binaries:

- [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/) — the local control-plane daemon
- [`vnactl`](/virtnosis/docs/cli/vnactl/) — the operator and automation client

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

Assume [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/) and [`vnactl`](/virtnosis/docs/cli/vnactl/) are installed and available on your `PATH`.

```bash
virtnosis-agent --verbose
vnactl status
vnactl scan --deep --confirm-xml --redact
```

## Recommended reading path

1. [Getting Started](/virtnosis/docs/guides/getting-started/)
2. [Install and Package](/virtnosis/docs/guides/install-and-package/)
3. [Operator Guide](/virtnosis/docs/guides/operator-guide/)
4. [Deployment Guide](/virtnosis/docs/guides/deployment/)
5. [Systemd Guide](/virtnosis/docs/guides/systemd/)
6. [`vnactl`](/virtnosis/docs/cli/vnactl/)
7. [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/)
8. [Scan Analysis](/virtnosis/docs/reference/scan-analysis/)
9. [Architecture](/virtnosis/docs/reference/architecture/)
10. [Repository Documents](/virtnosis/docs/reference/repository-docs/)
11. [Man pages](/virtnosis/docs/man/virtnosis-7/)

## Docs map

- **Guides** — build, install, deployment, systemd, operator workflows, and
  automation.
- **CLI** — the exact public surface of [`vnactl`](/virtnosis/docs/cli/vnactl/) and [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/).
- **Reference** — product model, scan semantics, architecture, contributor
  docs, and the repository documentation map.
- **Man pages** — [`virtnosis-agent(1)`](/virtnosis/docs/man/virtnosis-agent-1/), [`vnactl(1)`](/virtnosis/docs/man/vnactl-1/), [`virtnosis(7)`](/virtnosis/docs/man/virtnosis-7/),
  [`virtnosis-agent-protocol(7)`](/virtnosis/docs/man/virtnosis-agent-protocol-7/), and [`virtnosis-scan-report(7)`](/virtnosis/docs/man/virtnosis-scan-report-7/).
