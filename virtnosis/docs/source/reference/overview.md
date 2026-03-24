# Overview

Virtnosis is a read-only libvirt security analysis and diagnosis toolset.

Its purpose is to assess libvirt-exposed infrastructure without mutating host or guest state. The product is built for operators who need high-signal findings, explicit degraded-state reporting, and stable machine-consumable output.

## Product surfaces

Virtnosis exposes two user-facing binaries:

- `virtnosis-agent` — long-running local control-plane daemon
- `vnactl` — client CLI for the agent

## When to use each binary

### `virtnosis-agent` + `vnactl`

Use this when:

- you want repeated scans through a stable local control plane
- you want rootless operator workflows
- you need a cleaner interface for automation
- you want agent status, control-socket diagnostics, and a bounded request/response protocol

## Core properties

Virtnosis is built around these principles:

- read-only by default
- bounded memory and output behavior
- explicit reporting of partial and unavailable scan stages
- stable output suitable for automation and CI gating
- local-first transport and permission boundaries

## What the scanner looks for

At a high level, Virtnosis looks for risky patterns in:

- domain exposure surfaces such as VNC, SPICE, serial, channel, and selected QEMU TCP listeners
- network forwarding and other host-facing network posture
- storage pools and volumes with dangerous host paths, remote backends, or weak permissions
- nwfilter configurations that look ineffective or overly permissive
- XML-derived footguns that are common in libvirt and QEMU environments

## Safety boundary

Virtnosis is intended for authorized defensive use. It should only be used on systems you own or are explicitly authorized to assess.

## Example workflow

```bash
./build/bin/virtnosis-agent --verbose
./build/bin/vnactl status
./build/bin/vnactl scan --deep --confirm-xml --redact -f json
```

That flow gives you:

- control-plane status and capability metadata,
- a bounded scan through the agent,
- structured output that can be archived or fed into automation.

## Where to go next

- First run: [Getting Started](?p=guides/getting-started)
- Daily use: [Operator Guide](?p=guides/operator-guide)
- Deeper semantics: [Scan Analysis](?p=reference/scan-analysis)
- Protocol and product design: [Architecture](?p=reference/architecture)
