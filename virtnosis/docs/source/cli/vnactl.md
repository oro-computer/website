# `vnactl`

`vnactl` is the operator and automation client for `virtnosis-agent`.

It does not talk to libvirt directly. It connects to the agent, issues
`status`, `version`, or `scan` requests, and renders the resulting machine
output.

## Synopsis

```bash
vnactl status [--connect <unix:///abs-path|abs-path>] [--timeout-ms <n>] [--max-response-bytes <n>] [--raw-json]
vnactl version [--connect <unix:///abs-path|abs-path>] [--timeout-ms <n>] [--max-response-bytes <n>] [--raw-json]
vnactl scan [--connect <unix:///abs-path|abs-path>] [--timeout-ms <n>] [--max-response-bytes <n>] [--raw-json]
           [--timeout-ms-agent-scan <n>]
           [-f, --format <default|json|xml>]
           [--socket <abs-path>] [--uri <uri>] [--program remote|admin]
           [--deep-enum-max <n>] [--deep-resolve-max <n>] [--deep-vol-resolve-max <n>]
           [--deep-xml-max <n>] [--deep-vol-xml-max <n>]
           [--timeout-ms-scan <n>] [--scan-timeout-ms <n>]
           [--deep] [--confirm-xml] [--redact] [--verbose]
```

## Commands

### `status`

Fetches machine-readable daemon status and capability metadata.

Use it to answer questions such as:

- which socket is the agent actually serving,
- whether socket activation is in effect,
- which peer-auth policy is active,
- which build identity the agent is serving,
- which methods the agent supports.

### `version`

Fetches machine-readable version and build identity metadata for the serving
agent.

### `scan`

Requests a scan from the agent and prints or streams the resulting report.

## Common options

- `--connect <target>` — agent control target. Public builds accept
  only `unix:///absolute/path` or a plain absolute UNIX socket path.
- `--timeout-ms <n>` — control-plane connect and request/response timeout in
  milliseconds.
- `--max-response-bytes <n>` — upper bound for accepted response data.
  Hard-capped at `33554432` bytes (32 MiB).
- `--raw-json` — print the raw JSON response envelope instead of command-specific output.

## Scan options

### Target selection

- `--socket <abs-path>` — libvirt UNIX socket path for the scan
- `--uri <uri>` — libvirt URI for the scan
- `--program remote|admin` — select the libvirt RPC program family

Current defaults:

- socket: `/var/run/libvirt/libvirt-sock`
- URI: `qemu:///system`
- program: `remote`

### Scan depth and confirmation

- `--deep` — enable deeper inventory and XML-related analysis
- `--confirm-xml` — allow full XML confirmation fetches when prefix evidence is
  insufficient
- `--redact` — redact sensitive values from output
- `--verbose` — emit extra diagnostics

### Deep scan bounds

- `--deep-enum-max <n>` — max inventory enumeration per type
- `--deep-resolve-max <n>` — max objects resolved per type
- `--deep-vol-resolve-max <n>` — max storage volumes resolved per pool
- `--deep-xml-max <n>` — max resolved objects per type with XML fetch
- `--deep-vol-xml-max <n>` — max resolved volumes per pool with XML fetch

Current defaults:

- `--deep-enum-max 32`
- `--deep-resolve-max 8`
- `--deep-vol-resolve-max 16`
- `--deep-xml-max 2`
- `--deep-vol-xml-max 4`

### Timeouts and output

- `--timeout-ms-agent-scan <n>` — longer agent-scan socket timeout while
  waiting for scan output; default `600000` ms (10 minutes)
- `--timeout-ms-scan <n>` — libvirt scan socket timeout; default `5000` ms
- `--scan-timeout-ms <n>` — requested scan wall-time budget; `-1` means use the
  agent default
- `-f, --format default|json|xml` — select emitted scan formatting

## Rootless behavior

For non-root users, `vnactl` auto-prefers:

```text
$XDG_RUNTIME_DIR/virtnosis/agent.sock
```

when that socket exists. If it is absent or stale, the client falls back to
`/run/virtnosis/agent.sock`.

## Transport model

The control plane is local UNIX sockets only.

`vnactl` already classifies future transports and emits explicit
unsupported-transport guidance, but `tcp://`, `tls://`, `ssh://`, `http://`,
`https://`, `ws://`, and `wss://` are not public transport inputs.

## Examples

### `status`

```bash
vnactl status --connect unix:///run/virtnosis/agent.sock
```

### Version

```bash
vnactl version --connect /run/virtnosis/agent.sock
```

### Deep scan

```bash
vnactl scan \
  --connect unix:///run/virtnosis/agent.sock \
  --socket /var/run/libvirt/libvirt-sock \
  --uri qemu:///system \
  --deep --confirm-xml --redact \
  -f json
```

## Considerations

- `vnactl` is a control-plane client, not a general libvirt management client.
- `scan` prefers the streaming scan protocol when the agent advertises it, and
  falls back to a framed raw-stdout mode for older agents.
- `status` and `version` are one-request-per-connection probes so repeated
  health checks do not accumulate idle handlers in the agent.
- Public builds do not expose dedicated fail-policy flags; automation
  should gate on exit code and inspect structured warning/error records in the
  report.

## See also

- [Operator Guide](?p=guides/operator-guide)
- [Output and Automation](?p=guides/output-and-automation)
- [virtnosis-agent](?p=cli/virtnosis-agent)
- [vnactl(1)](?p=man/vnactl-1)
- [virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7)
