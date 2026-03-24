# `virtnosis-scan-report(7)`

## Name

`virtnosis-scan-report` — output model and reporting semantics for Virtnosis
scans

## Description

Virtnosis scan output is designed to remain machine-consumable even when the
scanner operates under partial failure, bounded capture, or mixed prefix/full
XML availability.

Virtnosis emits a stable dotted-key record stream. Higher-level JSON and XML
wrappers preserve that logical report.

## Output principles

- stable keys
- explicit incompleteness
- bounded evidence
- redaction-aware output

## Major record families

- `inventory.*`
- `scan.warnings.warning.<n>.*`
- `scan.errors.error.<n>.*`
- `scan.risks_prefix.*`
- `scan.risks_full.*`
- `scan.exit_code`

## Partial and unavailable states

The report distinguishes:

- `complete`
- `partial`
- `unavailable`

That distinction is important because a missing finding is only meaningful if
the relevant stage actually ran.

## Redaction

With `--redact`, the scanner preserves structural output and booleans but
suppresses sensitive values such as object names, UUIDs, socket paths, URIs,
XML prefixes, evidence excerpts, and selected remote error details.

## Formats

- `default`
- `json`
- `xml`

## Examples

```bash
vnactl scan --deep --confirm-xml --redact -f default
vnactl scan --deep --confirm-xml --redact -f json
```

```text
scan.summary.warning_count=2
scan.summary.error_count=0
scan.domains.coverage=partial
scan.risks_prefix.total=3
scan.risks_full.total=1
scan.exit_code=0
```

## Operator guidance

Consumers should treat:

- warning and error codes as stable automation keys,
- coverage and unavailable markers as first-class signals,
- prefix-vs-full risk totals as distinct evidence levels.

## See also

- [Output and Automation](?p=guides/output-and-automation)
- [vnactl(1)](?p=man/vnactl-1)
- [virtnosis(7)](?p=man/virtnosis-7)
- [virtnosis-agent-protocol(7)](?p=man/virtnosis-agent-protocol-7)
