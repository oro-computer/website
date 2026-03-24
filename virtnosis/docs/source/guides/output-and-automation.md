# Output and Automation

Virtnosis output is designed to stay machine-consumable even when the scan is partial, bounded, or degraded.

## Output formats

Supported formats:

- `default` — dotted-key records on stdout
- `json` — single JSON report document
- `xml` — single XML report document

`vnactl scan` supports all three formats.

## Important record families

The most important stable output families are:

- `inventory.*`
- `scan.warnings.warning.<n>.*`
- `scan.errors.error.<n>.*`
- `scan.risks_prefix.*`
- `scan.risks_full.*`
- `scan.exit_code`

These are the primary automation surface. They should be preferred over ad-hoc parsing of human-oriented text.

## Warnings and errors

Warnings and errors are structured records, not free-form prose.

Important properties:

- warning and error codes are stable automation keys
- many records carry correlation fields such as `key_prefix`
- partial and unavailable conditions are explicit

## Prefix and full evidence

Virtnosis separates:

- prefix-derived findings
- full-XML-confirmed findings

This matters for enterprise automation. A prefix-only signal can still be useful, but a full-confirmed signal is a stronger basis for gating or escalation.

## Partial and unavailable states

Consumers should not treat missing data as “clean” unless the relevant stage was complete.

Instead, check for:

- partial coverage markers
- unavailable markers
- warning and error totals

This is especially important for XML-derived subscans and nwfilter coverage analysis.

## Exit codes

Common exit behavior:

- `0` — success, or scan completed without tripping a fail policy
- `1` — scan completed, but fail policy triggered
- `2` — usage or argument error
- `3` — transport, protocol, runtime, or internal failure

`vnactl scan` exits with the scan exit code so it can be used directly in automation.

## Recommended CI pattern

Example:

```bash
./build/bin/vnactl scan \
  --connect unix:///run/virtnosis/agent.sock \
  --socket /var/run/libvirt/libvirt-sock \
  --uri qemu:///system \
  --deep --confirm-xml --redact \
  -f json
```

Recommended CI behavior:

- archive the full JSON or XML report
- gate on exit code
- inspect warning/error codes for targeted policy decisions
- treat partial/unavailable markers as first-class signals

## Agent status for automation

`vnactl status` and `vnactl version` are the machine-readable control-plane introspection surface.

They expose stable fields such as:

- supported methods in `result.methods`
- stable daemon identity in `result.pid`
- per-request handler identity in `result.handler_pid`
- serving executable path in `result.exe_path`
- effective listener path
- auto-path state
- transport policy fields
- auth target gid
- socket mode and writability diagnostics
- exact-build verification state in `result.build_identity_status`
- exact build identity in `result.build_identity` when verification succeeds, with `result.build_identity_source` and `result.build_identity_path`
- sampled executable-content fingerprint in `result.build_fingerprint`

This lets automation verify the control plane before submitting expensive scans.

### Build identity status

`result.build_identity_status` is always present. Current values are:

- `verified` — `result.build_identity` is trustworthy and present
- `not_found` — no nearby build/install metadata applies to the serving executable
- `metadata_unreadable` — exact identity metadata existed but could not be read
- `metadata_invalid` — exact identity metadata existed but did not parse or did not match the expected shape
- `fingerprint_mismatch` — metadata was readable but did not match the current executable fingerprint
- `fingerprint_unavailable` — the executable fingerprint could not be computed

When exact identity is verified, `result.build_identity` is an exact manifest-backed identifier for the serving executable. When it is not verified, `result.build_fingerprint` remains the bounded sampled fallback.

### Client-side identity checks

`vnactl status` and `vnactl version` prefer exact build-identity comparison when both sides can resolve it. Otherwise they fall back to sampled fingerprint comparison.

Automation should treat:

- stderr warnings about exact-identity mismatch or unavailable exact identity as actionable control-plane drift signals
- `build_identity_status = not_found` as a valid no-metadata state, not an automatic fault
- `exe_path`, `build_identity_status`, and `build_fingerprint` together as the practical minimum for diagnosing stale or mixed binaries

## Where to go next

- What is being scanned: [Scan Analysis](?p=reference/scan-analysis)
- Operator workflows: [Operator Guide](?p=guides/operator-guide)
- Protocol and product structure: [Architecture](?p=reference/architecture)
