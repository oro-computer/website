# GitHub Actions: Install Released `silk`

This guide shows how to install the released Silk CLI in another GitHub Actions
workflow without rebuilding the compiler from source.

Current support:

- runner OS/arch:
 - `linux-x86_64`,
 - `macos-arm64`,
- source of truth: GitHub Release assets uploaded from the repo’s release
 distribution target,
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

## Producing Release Assets

Run the release distribution target on each supported native host before
uploading assets to a GitHub Release:

```sh
make dist
```

The target builds a size-optimized staged prefix with `ReleaseSmall` and
stripped binaries, then writes upload-ready assets under `build/release/`:

- `silk-v<toolchain-version>-linux-x86_64.tar.gz` on Linux x86_64,
- `silk-v<toolchain-version>-macos-arm64.tar.gz` on Apple Silicon macOS,
- and the matching `.sha256` checksum files.

For a release tag that intentionally differs from `src/version.zig`, override
the asset tag explicitly:

```sh
DIST_VERSION=v0.1.1 make dist
```

Default branch CI does not publish GitHub Release assets. Its scheduled nightly
path may upload short-retention distribution artifacts for inspection, but those
artifacts are separate from release publication.

The archive contains the release-required installed `bin/`, `lib/`,
`include/`, and `share/` prefix payloads, plus a dedicated release-root `Makefile`
that supports `make install PREFIX=/usr/local`, staged
`DESTDIR=/tmp/pkgroot` installs, and `make uninstall` for the files owned by
that release archive. Its install path removes previously installed owned files
from the installed receipt before copying the new payload, so upgrades can
remove files that were owned by an older release but are no longer shipped.
Uninstall is idempotent for missing prefixes and tolerates stale or malformed
receipt entries, missing owned files, and unreadable installed receipts by
falling back to the current archive's owned file list when necessary. It also
includes curated editor/syntax files under `share/silk/editor/` for Highlight.js,
Vim, Sublime Text, TextMate,
VS Code, and coc.nvim. Development-only payloads such as source tests,
intermediate object files, source-only Markdown manpage copies, editor build
metadata, cache directories, dependency build trees, `node_modules`, and
editor scratch files are not included.

## Relationship to This Repo’s CI

This action does not build Silk. It consumes the same staged-prefix tarball that
the Silk compiler repository publishes as release assets.

The default CI workflow keeps artifact publication on the scheduled nightly
path only. Pull requests, branch pushes, tag pushes, and manual dispatches run
correctness checks without uploading staged-prefix artifacts. Release
publication should use the same `make dist` outputs described above and publish
them deliberately to GitHub Releases; macOS release packages are built from the
macOS-native dependency layout instead of reusing Linux dependency archives.
