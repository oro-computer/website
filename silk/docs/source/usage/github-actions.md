# GitHub Actions: Install Released `silk`

This guide shows how to install the released Silk CLI in another GitHub Actions
workflow without rebuilding the compiler from source.

Current support:

- runner OS/arch:
 - `linux-x86_64`,
 - `macos-arm64`,
- source of truth: GitHub Release assets produced by this repo’s tag CI,
- installed payload: the staged-prefix distribution tarball (`bin/`, `lib/`,
 `include/`, `share/`).

## Basic Usage

Pin the action to a released Silk tag:

```yaml
jobs:
  use-silk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oro-computer/silk@v0.1.0
        with:
          github-token: ${{ github.token }}
      - run: silk --version
```

When the action ref is a `v*` tag and `version` is omitted, the action installs
that same release tag.

## Select a Different Version

If you use a floating action ref (for example `@main`) or want to install a
different release than the action ref, set `version` explicitly:

```yaml
- uses: oro-computer/silk@main
  with:
    version: v0.1.0
    github-token: ${{ github.token }}
```

Accepted `version` values:

- `v0.1.0`
- `0.1.0` (normalized to `v0.1.0`)
- `latest`

## Inputs

- `version`
 - optional,
 - release tag to install,
 - defaults to the action ref when it is a `v*` tag, otherwise `latest`.
- `repository`
 - optional,
 - release repository in `owner/repo` form,
 - defaults to the action repository.
- `github-token`
 - optional,
 - bearer token used for the GitHub release API and asset downloads,
 - recommended: `${{ github.token }}`.
- `install-dir`
 - optional,
 - installation root for the extracted staged prefix,
 - default: `${RUNNER_TEMP}/silk/<tag>/<platform>`, where `<platform>` is
 the current runner platform tag.
- `add-to-path`
 - optional,
 - when `true` (default), appends `<install-dir>/bin` to `PATH`.

## Outputs

- `version` — resolved release tag that was installed.
- `root` — installed staged-prefix root.
- `bin` — installed `bin/` directory.
- `silk` — absolute path to the installed `silk` binary.

Example:

```yaml
- id: setup-silk
  uses: oro-computer/silk@v0.1.0
  with:
    github-token: ${{ github.token }}

- run: |
    "${{ steps.setup-silk.outputs.silk }}" --version
    ls "${{ steps.setup-silk.outputs.root }}/share"
```

## Integrity and Failure Modes

The action downloads both:

- `silk-<tag>-<platform>.tar.gz`
- `silk-<tag>-<platform>.tar.gz.sha256`

Where `<platform>` is one of:

- `linux-x86_64`
- `macos-arm64`

It verifies the archive with `sha256sum -c` when available and falls back to
`shasum -a 256 -c` on macOS runners before extracting it.

The action fails when:

- it is run on an unsupported runner platform,
- the target release does not exist,
- the expected release assets are missing,
- or checksum verification fails.

## Relationship to This Repo’s Release CI

This action does not build Silk. It consumes the same staged-prefix tarball that
the tag release workflow already publishes to GitHub Releases. That keeps
release CI as the single packaging path for downstream GitHub Actions usage.
The release workflow validates this installer on both Linux and macOS runners,
and macOS release packages are built from the macOS-native dependency layout
instead of reusing Linux dependency archives.
