# Architecture

This document explains the product architecture from a systems perspective.

## Product shape

The codebase exposes:

- `virtnosis-agent` as a local control-plane daemon
- `vnactl` as the client CLI

The agent and client share the same core scan and transport engine.

## High-level model

```text
vnactl
  |
  | control protocol
  v
virtnosis-agent
  |
  | libvirt RPC
  v
libvirt daemon sockets / libvirt URI targets
```

## Core layers

### Transport layer

Responsibilities:

- bounded I/O
- framing
- connect/read/write timeouts
- size caps

Control-plane transport is local UNIX sockets only.

### Libvirt RPC layer

Responsibilities:

- virNet framing
- XDR encoding and decoding
- remote error handling
- procedure mapping for libvirt program families

### Scan engine

Responsibilities:

- inventory collection
- prefix-only XML analysis
- full XML confirmation when allowed
- risk extraction and summary generation
- structured warning and error emission

### Agent control plane

Responsibilities:

- request/response envelope handling
- status, version, scan, and streaming scan endpoints
- peer authentication
- request/response size limits
- concurrency and timeout boundaries

## Control protocol

The control protocol is a length-prefixed JSON envelope over stream transports.

Important characteristics:

- bounded message framing
- explicit method set
- explicit success/error envelopes
- separate handling for larger scan stdout payloads
- streaming mode for backpressure-aware scan delivery

For the protocol reference and broader repository design documents, see
[virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7) and
[Repository documents](?p=reference/repository-docs).

## Security boundaries

The architecture assumes:

- untrusted input can arrive from libvirt replies
- untrusted local users may exist on a host
- control sockets must not be treated as safe by default
- partial and unavailable states must be surfaced explicitly

The agent therefore prefers:

- local-only transport by default
- deny-by-default peer auth
- explicit request/response caps
- bounded scan execution

## Transport direction

Virtnosis implements local UNIX socket transport for the agent.

The design direction includes future, explicitly gated support for:

- `tcp://`
- `tls://`
- `ssh://`
- `http(s)://`
- `ws(s)://`

Those transports are not part of the product surface and require stronger auth
and channel-security policy before being enabled.

## Operational consequence

There is one shared truth to keep in mind:

- the scanner is the analysis engine
- the agent is the bounded control plane around that engine
- `vnactl` is the operator and automation entrypoint for the control plane

## Where to go next

- Roadmap and design target: [Repository documents](?p=reference/repository-docs)
- Deployment details: [Deployment Guide](?p=guides/deployment)
- Development details: [Development](?p=reference/development)
