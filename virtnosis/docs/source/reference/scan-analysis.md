# Scan Analysis

This guide explains what Virtnosis scans, what “deep” means, and how to interpret partial versus confirmed findings.

## Scan model

Virtnosis starts with a safe inventory pass and then layers additional analysis on top.

The scan can operate in multiple evidence modes:

- inventory-only and basic RPC-derived state
- XML prefix analysis from bounded captures
- full XML confirmation when `--confirm-xml` is enabled and needed

## Why prefix-first exists

Large libvirt replies can be expensive and risky to handle naively. Virtnosis therefore prefers bounded prefix capture first. This gives good signal without committing to large allocations or broad parsing by default.

When prefix-only evidence is not enough and `--confirm-xml` is enabled, the scanner can fetch and parse full XML for confirmation.

## Major analysis areas

### Domains

Current domain analysis includes:

- host-facing VNC, SPICE, websocket, serial, console, channel, and selected TCP-backed QEMU surfaces
- risky filesystem shares and host path exposure
- domain source path checks
- unix socket path checks
- network references and nwfilter references
- nwfilter coverage and partial-coverage signaling

### Networks

Current network analysis focuses on:

- risky forwarding posture
- bridge and exposure-related configuration
- XML-derived patterns that imply dangerous host reachability or weak isolation

### Storage pools and volumes

Current storage analysis includes:

- world-writable targets
- host-root or sensitive path targeting
- remote backends
- plaintext network disk protocols
- path-based file type and permission checks where available

### Nwfilters

Current nwfilter analysis includes:

- permissive or broad accept patterns
- include-chain following within configured bounds
- domain interface coverage checks for whether risky interfaces have usable filter references

## Partial, unavailable, and full confirmation

Virtnosis intentionally distinguishes:

- complete — the relevant scan stage ran successfully
- partial — the stage ran, but coverage was truncated or incomplete
- unavailable — the stage could not run and a reason is reported

This matters because a missing finding is only meaningful if the relevant stage actually ran.

## Interpreting severity

The scanner prefers high-signal findings. Not every risky pattern means immediate compromise, but each finding is intended to be operationally meaningful enough to review.

Use:

- `scan.risks_prefix.*` for prefix-derived signal
- `scan.risks_full.*` for full-XML-confirmed signal

Treat full-confirmed findings as stronger evidence when both are available.

## Recommended operating pattern

For most environments:

1. run a redacted deep scan
2. inspect warning and error totals
3. inspect partial/unavailable markers
4. review full-confirmed findings where present
5. tune bounds only if coverage is insufficient

## Examples

### Deep scan with confirmation

```bash
vnactl scan \
  --deep \
  --confirm-xml \
  --redact \
  -f json
```

### Records worth checking first

```text
scan.summary.warning_count
scan.summary.error_count
scan.domains.coverage
scan.networks.coverage
scan.storage.coverage
scan.risks_prefix.total
scan.risks_full.total
scan.exit_code
```

Read the coverage keys before concluding that an area is clean.

## Where to go next

- Stable output fields: [Output and Automation](?p=guides/output-and-automation)
- User workflows: [Operator Guide](?p=guides/operator-guide)
- Technical design: [Architecture](?p=reference/architecture)
