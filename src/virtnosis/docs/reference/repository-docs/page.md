---
layout: "virtnosis-docs"
title: "Repository Documents"
description: "This page maps the documentation layers that exist in the virtnosis repository and explains which ones are public/operator-facing versus contributor/internal."
docsCollection: "virtnosis"
section: "reference"
order: 13
sourcePath: "reference/repository-docs.md"
githubRepo: "oro-computer/virtnosis"
githubRef: "master"
---

# Repository Documents

This page maps the documentation layers that exist in the `virtnosis`
repository and explains which ones are public/operator-facing versus
contributor/internal.

## Public documentation layers

- `docs/` — structured operator and product documentation
- `man/man1/` and `man/man7/` — command and design references

On this website, those layers are represented by:

- [Start](/virtnosis/docs/)
- [Guides](/virtnosis/docs/guides/getting-started/)
- [CLI](/virtnosis/docs/cli/vnactl/)
- [Man pages](/virtnosis/docs/man/virtnosis-7/)

## Technical and contributor documents

The repository also ships additional documents that are useful for contributors
and maintainers:

- [`VIRTNOSIS.md`](https://github.com/oro-computer/virtnosis/blob/master/VIRTNOSIS.md) —
  technical design target and roadmap
  implementation state and hardening notes
  milestones and roadmap tracking
- [`NOTES.md`](https://github.com/oro-computer/virtnosis/blob/master/NOTES.md) —
  implementation-focused Silk and engineering notes

These documents are part of the repository and were included in the audit for
this website pass, but they are not the primary downstream/operator entrypoint.

## Audit summary

The repository documentation breaks down cleanly into:

- operator docs for using the tool,
- deployment docs for shared/rootless/systemd use,
- reference docs for architecture, protocol, and report semantics,
- contributor docs for build, packaging, release, and engineering constraints.

Two important cleanup findings from the repo audit:

- public [`vnactl`](/virtnosis/docs/cli/vnactl/) builds do **not** expose the fail-policy flags
  mentioned in some upstream docs (`--fail-on-errors`, `--fail-on-warnings`,
  `--fail-severity`), so the website docs do not present them as public CLI
  surface;
- public [`vnactl`](/virtnosis/docs/cli/vnactl/) builds also do **not** expose
  `--evidence-max-bytes`, `--nwfilter-include-max-depth`, or
  `--nwfilter-include-max-filters`, so the website docs keep the public tuning
  story aligned with the actual parser and help text.

## Recommended use

- If you are adopting the tool: start with [Getting Started](/virtnosis/docs/guides/getting-started/)
  and [Operator Guide](/virtnosis/docs/guides/operator-guide/).
- If you are deploying it for multiple users: read [Deployment Guide](/virtnosis/docs/guides/deployment/)
  and [Systemd Guide](/virtnosis/docs/guides/systemd/).
- If you need protocol and output semantics: read
  [Architecture](/virtnosis/docs/reference/architecture/),
  [virtnosis-agent-protocol(7)](/virtnosis/docs/man/virtnosis-agent-protocol-7/), and
  [virtnosis-scan-report(7)](/virtnosis/docs/man/virtnosis-scan-report-7/).
- If you are contributing: read [Development](/virtnosis/docs/reference/development/), then
  the repository-side documents linked above.
