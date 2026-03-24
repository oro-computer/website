# Operator Guide

This guide focuses on day-to-day use of Virtnosis as an operator, responder, or CI consumer.

## Agent-based workflow

Check the control plane:

```bash
./build/bin/vnactl status
./build/bin/vnactl version
```

Run a scan through the agent:

```bash
./build/bin/vnactl scan \
  --connect unix:///run/virtnosis/agent.sock \
  --socket /var/run/libvirt/libvirt-sock \
  --uri qemu:///system \
  --deep --confirm-xml --redact
```

## Deep scan tuning

The deep scan is bounded. Public controls exposed by `vnactl scan` today:

- `--deep-enum-max`: list enumeration bound per inventory type
- `--deep-resolve-max`: resolved objects per type
- `--deep-vol-resolve-max`: resolved volumes per pool
- `--deep-xml-max`: resolved objects per type with XML fetch
- `--deep-vol-xml-max`: resolved volumes per pool with XML fetch
- `--timeout-ms-scan`: libvirt socket timeout used during the scan
- `--scan-timeout-ms`: requested wall-time budget for the scan

Set any deep bound to `0` to disable that phase entirely.

## Redaction

Use `--redact` when output may be captured in shared logs, CI logs, tickets, or external systems.

Redaction suppresses or masks values such as:

- socket paths and URIs
- object names and UUIDs
- XML snippets and evidence excerpts
- selected remote error string prefixes

The scan still keeps structural fields, counts, and booleans so automation remains useful.

## Exit behavior

Public `vnactl` builds do not expose separate fail-policy flags.

For automation:

- gate on the command exit code,
- archive JSON or XML output for later inspection,
- inspect structured warning and error records,
- treat partial and unavailable markers as explicit control signals.

## JSON and XML output

`vnactl scan` supports:

- `-f default`
- `-f json`
- `-f xml`

Example:

```bash
./build/bin/vnactl scan --deep -f json
./build/bin/vnactl scan --deep -f xml
```

The JSON/XML wrappers preserve the same logical report as the default dotted-key output.

## Common operator problems

### `vnactl status` or `vnactl version` hangs

Status and version use one request per connection and close those sessions
immediately after replying. If a client still appears stuck, check the basics
first:

- confirm you are targeting the intended socket
- confirm the socket is live and not stale
- check whether `vnactl` has fallen back from a missing rootless socket to `/run/virtnosis/agent.sock`
- check `result.pid` across repeated probes; the daemon pid should stay stable
- check `result.exe_path` and `result.build_identity_status` to confirm which agent binary is actually serving the socket
- run `virtnosis-agent agent --verbose` and watch the accept / handler / response / reap sequence
- if the daemon is at `--max-clients`, expect a prompt `TOO_MANY_CLIENTS` error rather than a long timeout
- do not mix a stale installed `virtnosis-agent` from `$PATH` with a freshly rebuilt `./build/bin/vnactl`; use matching binaries or reinstall first

For the detailed status/build-identity field contract, use
[Output and Automation](?p=guides/output-and-automation). For deployment and
socket-selection behavior, use [Deployment Guide](?p=guides/deployment).

### Long or quiet scans

- raise `--timeout-ms-agent-scan` for `vnactl scan`
- lower deep scan bounds for very large installations
- use `--redact` if the output may be large and widely visible

### Response too large

- lower deep scan bounds
- increase `--max-response-bytes` only when necessary and stay within the hard cap

## Where to go next

- What the scanner checks: [Scan Analysis](?p=reference/scan-analysis)
- Stable fields and exit behavior: [Output and Automation](?p=guides/output-and-automation)
- Agent deployment and permissions: [Deployment Guide](?p=guides/deployment)
