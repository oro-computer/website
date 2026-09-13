---
layout: "virtnosis-docs"
title: "virtnosis(7)"
description: "virtnosis — libvirt security analysis and diagnosis architecture"
docsCollection: "virtnosis"
section: "man"
order: 16
sourcePath: "man/virtnosis-7.md"
githubRepo: "oro-computer/virtnosis"
githubRef: "master"
---

# [`virtnosis(7)`](/virtnosis/docs/man/virtnosis-7/)

## Name

`virtnosis` — libvirt security analysis and diagnosis architecture

## Description

Virtnosis is the project and product direction for this repository. It is a
read-only libvirt security analysis and diagnosis system built around:

- [`virtnosis-agent`](/virtnosis/docs/cli/virtnosis-agent/) — the long-running local control-plane daemon
- [`vnactl`](/virtnosis/docs/cli/vnactl/) — the operator and automation client

## Design goals

- read-only by default
- bounded resource use
- explicit partial-state reporting
- automation-friendly output
- safe transport exposure

## Public surface

The codebase provides:

- direct local libvirt scanning over libvirt UNIX sockets,
- a local agent with bounded JSON-framed control messages,
- rootless runtime socket defaults,
- local `systemd` socket activation for one inherited UNIX listener fd,
- peer-auth enforcement for local UNIX socket clients,
- stable status metadata and scan output contracts.

## Roadmap direction

Future design direction includes optional loopback TCP, stronger secure-remote
deployment paths, and web-facing adapters once the core local control plane is
considered stable enough to expose more broadly.

Those are not part of the public product surface.

## Security model

Important assumptions:

- use only against systems you own or are authorized to assess,
- keep control sockets local and permission-restricted by default,
- use redaction when output may enter shared logs,
- treat partial and unavailable sub-scans as first-class conditions.

## Example workflow

```bash
virtnosis-agent --listen /run/virtnosis/agent.sock --listen-mode 0660 --listen-gid 123
vnactl status --connect unix:///run/virtnosis/agent.sock
vnactl scan --connect unix:///run/virtnosis/agent.sock --deep --confirm-xml --redact
```

## Documents

- [Start](/virtnosis/docs/)
- [Architecture](/virtnosis/docs/reference/architecture/)
- [Repository documents](/virtnosis/docs/reference/repository-docs/)

## See also

- [virtnosis-agent(1)](/virtnosis/docs/man/virtnosis-agent-1/)
- [vnactl(1)](/virtnosis/docs/man/vnactl-1/)
- [virtnosis-agent-protocol(7)](/virtnosis/docs/man/virtnosis-agent-protocol-7/)
- [virtnosis-scan-report(7)](/virtnosis/docs/man/virtnosis-scan-report-7/)
