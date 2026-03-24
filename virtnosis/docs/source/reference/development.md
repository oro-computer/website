# Development Guide

This guide is for contributors working inside `virtnosis/`.

## Documentation model

Use the documentation stack intentionally:

- `README.md` — concise repo entrypoint
- `docs/` — structured product and operator documentation
- `man/man1/` and `man/man7/` — command and reference docs
- `deploy/systemd/` — example direct-bind and socket-activated unit files for maintained service deployments
- `VIRTNOSIS.md` — design target and roadmap
- `STATUS.md` — current implementation state
- `PLAN.md` — milestones and roadmap
- `NOTES.md` — implementation-focused engineering notes and Silk observations

For installed documentation and man pages, use:

```bash
cd virtnosis
make install-docs PREFIX=/usr/local
```

If behavior changes, update the appropriate layer rather than stuffing everything into one file.

## Build paths

Use `make help` for the full target list. The common contributor paths are below.

### Common commands

```bash
cd virtnosis
make build
make verify
```

`make build` is the normal build entrypoint and always runs through `build.slk`.

For local installation:

```bash
cd virtnosis
make install PREFIX=/usr/local
```

For staged systemd example assets:

```bash
cd virtnosis
make install-systemd-examples PREFIX=/usr \
  SYSTEM_LISTEN_GID=123 \
  SYSTEM_SOCKET_GROUP=virtnosis
```

`SYSTEM_LISTEN_GID` is validated as a numeric gid so the staged direct-bind system unit cannot be generated with an invalid `--listen-gid`.

Remove those staged assets with:

```bash
cd virtnosis
make uninstall-systemd-examples PREFIX=/usr
```

### Verification and release lanes

Routine verification:

```bash
cd virtnosis
make verify
```

Additional targeted lanes:

```bash
cd virtnosis
make runtime-deps
make binary-footprint
make repro-check
make systemd-verify
make control-plane-soak
make release-verify
make dist
```

What these do:

- `make runtime-deps` checks the direct ELF dependency surface
- `make binary-footprint` checks binary size and key section growth
- `make repro-check` builds the retained compiler/backend reduction cases
- `make systemd-verify` validates the staged systemd example assets
- `make control-plane-soak` runs the longer live control-plane stability lane
- `make release-verify` runs the release gate
- `make dist` produces the deterministic source release archive

### Packaging and install metadata

The repo ships a large packaging and provenance surface, but the commands fall into a few groups:

- install file lists: `make install-manifest*`
- install provenance JSON: `make install-metadata*`
- staged install checks: `make install-stage-verify`, `make package-stage-verify*`
- package metadata: `make package-metadata*`
- generated packaging outputs: `make package-templates*`, `make package-skeletons*`, `make package-artifacts*`

Use those when working on packaging, staged installs, or release provenance. The emitted metadata carries build, source-release, and package-artifact linkage forward into staged roots and generated package outputs.

### Build and provenance checks

These targets are useful when you are changing build or packaging behavior:

- `make build-preflight` checks the current host/toolchain against the maintained production build contract
- `make build-outputs` verifies the shipped executable target surface from `silk.toml`
- `make build-manifest` writes `build/build-manifest.json`
- `make build-manifest-check` verifies that manifest against the current binaries

`make build` already runs the preflight and refreshes the build manifest automatically.

### CI and stress lanes

`make control-plane-soak-nightly`, `make fake-libvirt-lint`, and `make workflow-lint` are the heavier repo-maintenance lanes. They back the scheduled and CI workflows under `.github/workflows/`.

Maintained verification lane:

```bash
cd virtnosis
make verify
```

`make verify` intentionally disables the test-script VM cap so the full maintained local developer verification lane is reliable on larger builds. It starts with `make build` (which already runs the production preflight, shipped-output check, and build-manifest write), includes the build-contract lint that mutates temporary `silk.toml` / `build.slk` copies to prove the parser fails closed, then runs `make repro-check`, which builds the retained embedded repro cases and verifies their maintained expected outcomes.

`make control-plane-soak` stays out of `make verify` intentionally, so the maintained default verification lane remains fast and deterministic.

## Test paths

Use the lighter default path first:

```bash
cd virtnosis
bash tools/test_default.sh
```

Heavier suites:

```bash
cd virtnosis
silk test -O 0 src/tests_deep_scan.slk
bash tools/test_full.sh
```

`tools/test_full.sh` runs sequentially and uses a best-effort virtual-memory cap. Set `VN_TEST_ULIMIT_V=0` to disable that cap.

## Key engineering constraints

- keep the scanner read-only by default
- prefer bounded memory and output behavior over broad convenience
- partial and unavailable states must be explicit in output
- do not silently widen the transport or auth surface
- keep CLI and agent behavior aligned

## Implementation anchors

Important code areas:

- `src/virtnosis/libvirt/` — low-level libvirt RPC and transport
- `src/virtnosis/scan/` — scan extraction, risk logic, and output helpers
- `src/virtnosis/agent/` — agent socket, auth, transport policy, and control helpers
- `src/virtnosis/output/` — record capture and report wrapping
- `src/entry_impl.slk` — main entry implementation for scanner and agent
- `src/vnactl.slk` — client CLI
- `src/virtnosis/cli.slk` — shared CLI parsing and usage text

## Silk-specific notes

Authoritative Silk and stdlib observations for this repo live in the repository
notes tracked in [Repository documents](?p=reference/repository-docs).

That file exists because the current Silk subset and stdlib have real engineering implications for:

- memory ownership
- string lifetime
- vector behavior
- build-module portability
- framing and write loops
- test-memory behavior

Do not treat those notes as optional background reading.

## Documentation maintenance expectations

When behavior changes:

- update `README.md` if the user-facing workflow changes
- update `docs/` if the product, operator, or architecture story changes
- update man pages if command or design references change
- update `deploy/systemd/` when service-unit examples or deployment assumptions change
- keep `tools/install_docs.sh` and `tools/lint_docs.py` aligned with the docs tree when adding or renaming docs pages
- update `STATUS.md` and `PLAN.md` if project state or direction changes
- update `NOTES.md` when the change teaches us something about Silk, the stdlib, or implementation pitfalls

## Where to go next

- Product and operator docs: [Start](?p=start) and [Overview](?p=reference/overview)
- Technical design target and internal engineering notes: [Repository documents](?p=reference/repository-docs)
