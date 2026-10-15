---
layout: "docs"
description: "This guide shows how to install the released Silk CLI in another GitHub Actions workflow without rebuilding the compiler from source."
docsCollection: "silk"
section: "usage"
order: 253
sourcePath: "usage/github-actions.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# GitHub Actions: Install Released `silk`

This guide shows how to install the released Silk CLI in another GitHub Actions
workflow without rebuilding the compiler from source.

Supported platforms:

- runner OS/arch:
 - `linux-x86_64`,
 - `linux-arm64`,
 - `macos-arm64`,
- source of truth: GitHub Release assets uploaded from the repo’s release
 distribution target,
- installed payload: the staged-prefix distribution tarball (`bin/`, `lib/`,
 [`include/`](https://github.com/oro-computer/silk/tree/master/include/), `share/`).

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

When the action ref is a `v*` or `nightly-*` tag and `version` is omitted, the action installs
that same release tag.

## Select a Different Version

If you use a floating action ref (for example `@master`) or want to install a
different release than the action ref, set `version` explicitly:

```yaml
- uses: oro-computer/silk@master
  with:
    version: v0.1.0
    github-token: ${{ github.token }}
```

Accepted `version` values:

- `v0.1.0`
- `0.1.0` (normalized to `v0.1.0`)
- `v0.1.0-rc.1` (or `0.1.0-rc.1`)
- `latest` (stable releases)
- `prerelease` (newest published SemVer prerelease)
- `nightly` (newest published nightly)
- an exact `nightly-<run ID>-<commit prefix>` tag

## Inputs

- `version`
 - optional,
 - release tag to install,
 - defaults to the action ref when it is a `v*` or `nightly-*` tag, otherwise `latest`.
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
 - empty installation root for the extracted staged prefix; occupied directories
 are rejected to prevent stale files or symlink destinations,
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

## Formal Silk on ARM64

The ARM64 packages support a native dynamic Z3 provider. Install `libz3-dev`
on Ubuntu or `z3` with Homebrew on macOS and set `SILK_Z3_LIB` to the native
shared library when compiling verified contracts. For example, on macOS:

```yaml
- run: |
    brew install z3
    echo "SILK_Z3_LIB=$(brew --prefix z3)/lib/libz3.dylib" >> "$GITHUB_ENV"
```

The release build jobs provision and architecture-check this dependency before
compiling the staged standard library. The setup action installs the Silk
payload; it does not install system packages.

## Integrity and Failure Modes

The action downloads both:

- `silk-<tag>-<platform>.tar.gz`
- `silk-<tag>-<platform>.tar.gz.sha256`

Where `<platform>` is one of:

- `linux-x86_64`
- `linux-arm64`
- `macos-arm64`

It verifies the archive with `sha256sum -c` when available and falls back to
`shasum -a 256 -c` on macOS runners before extracting it.

The action fails when:

- it is run on an unsupported runner platform,
- the target release does not exist,
- the expected release assets are missing,
- checksum verification fails or names a different archive,
- release metadata identifies a draft or the wrong requested tag,
- archive paths, links, or special files violate the single-root payload contract,
- or the requested installation directory is not empty.

## Release Channels and Automation

The CI workflow uses one release plan for testing, packaging, and publication:

| Trigger | Channel and identity | Result |
| --- | --- | --- |
| Push `vMAJOR.MINOR.PATCH` | stable, exact tag | Publish verified release |
| Push `vMAJOR.MINOR.PATCH-rc.N` (or another SemVer prerelease) | prerelease, exact tag | Publish verified prerelease |
| Daily schedule | CI | Focused tests; no packaging or publication |
| Default-branch push | CI | Focused tests; no packaging or publication |
| Pull request or other branch push | test only | No release writes |
| Manual `build_dist` | CI rehearsal by default | Verified Actions artifacts |
| Manual `release_channel=nightly` or `tag` | selected channel | Artifacts; publish only with `publish=true` |

Manual nightly publication is restricted to the default branch. Manual tag
publication requires selecting an existing version tag as the workflow ref.
The numeric version in a version tag must equal [`src/version.zig`](https://github.com/oro-computer/silk/blob/master/src/version.zig); malformed
tags fail before builds start. The compiler reports that numeric toolchain
version; the release tag and manifest identify the prerelease/nightly build.
Every packaging run selects the full Linux x86_64/macOS test suites and the
focused native ARM64 release suite. Manual `full_tests` also works without
packaging. Pull requests cannot publish or select privileged release modes.

Routine ARM64 checks use a Debug compiler/runtime build and stdlib sources;
release/full-suite runs retain the complete optimized prefix and precompiled
stdlib. Both paths run the maintained native backend and Formal Silk checks.
Build and test steps share compiler settings and a 4-GiB Zig cache budget.
Full stdlib staging compiles independent modules in parallel, bounded by
`STDLIB_JOBS` (defaults to `TEST_JOBS`); archive assembly waits for every module.

For macOS compiler-build crashes, download `failure-macos-arm64-build-N` (test
shard N) or `failure-dist-macos-arm64-build` (packaging lane). These three-day
artifacts contain the available recent Zig crash reports and toolchain/stack
metadata; the failed command remains in the job log. Absence of a crash report
is recorded explicitly and does not change the job's failed result.

For full-suite fixture failures or timeouts, download
`test-linux-x86_64-shard-N` or `test-macos-arm64-shard-N`. These three-day
artifacts are uploaded after successful and failed full-suite shards and retain
combined logs, shard summaries, and the incremental fixture report with selected
inputs, compiler commands, per-fixture timing, and diagnostics. Full Linux x64
uses four independent runners and macOS uses eight; packaging waits for all of
them. Shard deadlines remain one hour. Linux x64 sanitized C harnesses run with
two workers and Linux ARM64 with one, retaining every case and the 240-second
harness deadline. Routine CI retains one runner per platform. Pending fixtures
remain distinguishable from completed checks if the outer job is interrupted.

The fixture, top-level example, and guide sweeps each partition their sources
into eight selectable tests, distributed across the existing runners. Shards
print live progress every 30 seconds and retain per-test timing observations in
`shard-N.timings.json`. The dependency cache key includes [`build.zig`](https://github.com/oro-computer/silk/blob/master/build.zig), so CPU
portability changes invalidate archives built with earlier host tuning.
Default Zig builds use the target's baseline CPU; ggml's dependency build also
disables host-native tuning and optional x86 extensions. An explicit developer
`-Dcpu=...` override is outside that default portability guarantee.

Nightlies require an explicit manual `release_channel=nightly` run with
`publish=true`; the daily schedule does not publish. Version tags and explicit
release rehearsals retain all release gates.

Published nightly tags are immutable identities, not a moving Git tag.
`version: nightly` resolves the newest published nightly; `version: prerelease`
resolves the newest published SemVer prerelease, including RCs, excluding
nightlies. `version: latest` selects GitHub's stable latest release. Exact
stable, prerelease, and nightly tags remain installable. Channel lookups paginate
the release API and ignore drafts. Pin exact tags for reproducible builds.

Publication creates a draft, uploads the complete verified asset set, checks
remote sizes and SHA-256 digests, then publishes. It verifies that the remote
tag still points to the tested commit. Stable releases advance latest only when
their numeric version exceeds the current stable latest version. Prereleases
and nightlies never advance it. API authentication, rate-limit, and server
errors fail the job; only HTTP 404 means an absent release. Interrupted drafts
can resume; published releases are checked without replacing their assets.
If a rebuilt archive differs from a published one, the retry fails and a new
release identity is required. Release jobs use GitHub's `queue: max` concurrency policy (up to 100 pending
publications), so newer jobs do not replace pending releases. Test runs cannot
cancel publication. See [GitHub concurrency documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency). Repository release immutability may also be enabled.

Each platform includes `silk-<tag>-<platform>.manifest.json`, recording channel,
source commit, run identity, toolchain/Zig versions, and asset hashes. The release
checks also require `silk --version` to embed the planned numeric version, commit,
and ReleaseSmall build mode. The release notes link to its source and CI run.
All three native downloaded-package checks
must pass before the write-scoped publication job starts. Rehearsal artifacts
are consumed with `actions/download-artifact` from that run and the included
checksum; setup-silk consumes published releases. Tag/manual artifacts are
retained for 14 days; published releases persist independently of Actions retention.

The publication job uses `github.token` by default. If releasing a commit whose
workflow files differ from the current default branch, GitHub can require a
token with **Contents: write** and **Workflows: write**; the built-in token cannot
grant the latter. Configure the optional `SILK_RELEASE_TOKEN` repository secret
with an appropriately scoped GitHub App or fine-grained token for that case.
Repository tag/release rules must also permit the publisher. The secret is used
only in the publication job. See [GitHub's release creation permissions](https://docs.github.com/en/rest/releases/releases#create-a-release).

Release orchestration is implemented by `scripts/github-actions/release.py`;
its offline regressions use `python3 scripts/github-actions/test-release.py`.

## Producing Release Assets

Run the release distribution target on each supported native host before
uploading assets to a GitHub Release:

```sh
make dist
```

Release builds require Node.js 24 and pnpm (CI pins pnpm 11.24.0) for the
bundled coc.nvim extension. `make dist` runs `make editor-assets` first: it
installs the frozen `coc/pnpm-lock.yaml` development dependency graph with
lifecycle scripts disabled, including when `NODE_ENV=production`, and explicitly
builds the production bundle. Dependency or bundler
failures stop packaging; an ignored local `coc/lib/` is never a prerequisite
that a fresh checkout must already contain. Ordinary `make compiler` and
`make build` do not need the editor toolchain.

The target builds a size-optimized staged prefix with `ReleaseSmall` and
stripped binaries, then writes upload-ready assets under `build/release/`:

- `silk-v<toolchain-version>-linux-x86_64.tar.gz` on Linux x86_64,
- `silk-v<toolchain-version>-linux-arm64.tar.gz` on Linux AArch64,
- `silk-v<toolchain-version>-macos-arm64.tar.gz` on Apple Silicon macOS,
- and the matching `.sha256` checksum files.

For a local prerelease archive, override the asset tag explicitly; hosted version
tags must retain the numeric version declared in [`src/version.zig`](https://github.com/oro-computer/silk/blob/master/src/version.zig):

```sh
DIST_VERSION=v0.1.0-rc.1 make dist
```

CI uses this target on native runners for all three platforms, according to the
channel table above. Each platform uploads a required `dist-<platform>` Actions
artifact containing the archive, checksum, contents listing, and provenance
manifest. Fresh native jobs download them and exercise checksum verification,
`setup-silk` installation, compilation with the packaged stdlib, an LSP protocol
handshake, a C99 embedder linked to the packaged header/library, and the release
Makefile's install/uninstall behavior outside the source checkout. Any failure
blocks publication.

Manual dispatches with omitted or null input maps use the default CI settings:
no publication and no packaging unless explicitly selected.

For a rehearsal, select **Run workflow**, choose the candidate branch, and enable
`build_dist`. Leave `release_channel=ci` and `publish=false`; this tests the full
chain through downloaded-package verification without creating a GitHub Release.
To resume a failed tagged publication, rerun failed jobs in its original run or
manually select the tag ref with `release_channel=tag` and `publish=true`.
A new manual run receives a new provenance run ID, so it cannot silently replace
an already-published release. Draft recovery requires the same source commit.
Nightlies use the workflow run ID to preserve their identity across retries.

The archive contains the release-required installed `bin/`, `lib/`,
[`include/`](https://github.com/oro-computer/silk/tree/master/include/), and `share/` prefix payloads, plus a dedicated release-root `Makefile`
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

The CI workflow builds release distributions on native hosts, including native
Linux ARM64 rather than cross-built ARM64 packages. The macOS packages use the
macOS-native dependency layout. All packaging runs select full Linux
x86_64/macOS test suites; the Linux ARM64 lane retains its focused native backend,
C99 ABI, leak, hosted workflow, and GPU provider coverage. See the [testing strategy](/silk/docs/compiler/testing-strategy/)
for the exact platform coverage, native macOS socket-header regression, and
remaining macOS C99 ABI harness limitation.
