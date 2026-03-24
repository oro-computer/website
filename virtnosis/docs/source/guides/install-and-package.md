# Install and Package

This guide covers source builds, local installs, docs installs, and the
packaging-oriented make targets shipped in the repository.

## Build from source

Recommended build path:

```bash
cd virtnosis
make build
make verify
```

`make build` always goes through `build.slk`, builds both shipped executables,
verifies the declared output surface, and writes `build/build-manifest.json`.
The resulting install surface is the `virtnosis-agent` and `vnactl` command
pair.

## Install

Install binaries, docs, and man pages:

```bash
cd virtnosis
make install PREFIX=/usr/local
```

Install docs and section-7 references only:

```bash
cd virtnosis
make install-docs PREFIX=/usr/local
```

What the install surface includes:

- executables under `$(PREFIX)/bin`
- markdown docs under `$(PREFIX)/share/doc/virtnosis/`
- section 1 and section 7 man pages under `$(PREFIX)/share/man/`
- install metadata under `$(PREFIX)/share/virtnosis/metadata/`

## Systemd example assets

Install example units and packaging assets:

```bash
cd virtnosis
make install-systemd-examples PREFIX=/usr \
  SYSTEM_LISTEN_GID=123 \
  SYSTEM_SOCKET_GROUP=virtnosis
```

Remove those staged assets again:

```bash
cd virtnosis
make uninstall-systemd-examples PREFIX=/usr
```

Use [Systemd Guide](?p=guides/systemd) for the operational story behind those
assets.

## Verification and release lanes

Common verification targets:

```bash
make verify
make runtime-deps
make binary-footprint
make repro-check
make systemd-verify
make control-plane-soak
```

Packaging and release-oriented targets:

```bash
make package-stage-verify
make package-stage-verify-systemd
make release-verify
make dist
```

These targets matter because the repo treats install metadata, staged install
verification, and packaging templates as part of the maintained product
surface.

## Packaging metadata and provenance

When you are building packages or auditing release outputs, the important
targets are:

- `make build-preflight`
- `make build-outputs`
- `make build-manifest`
- `make build-manifest-check`
- `make install-manifest*`
- `make install-metadata*`
- `make package-metadata*`
- `make package-templates*`
- `make package-skeletons*`
- `make package-artifact-manifest*`

## See also

- [Getting Started](?p=guides/getting-started)
- [Deployment Guide](?p=guides/deployment)
- [Systemd Guide](?p=guides/systemd)
- [Development](?p=reference/development)
- [Repository documents](?p=reference/repository-docs)
