---
layout: "docs"
description: "Install the CLI, create a project, and run the generated desktop app."
docsCollection: "runtime"
section: "guides"
order: 1
sourcePath: "guides/from-zero-to-first-run.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# From zero to first run

Create and run the generated desktop app. Once it opens, [turn it into Field Notes](/runtime/learn/getting-started/) to save a draft.

## Install the toolchain

Install the CLI from [npm](https://www.npmjs.com/package/@oro-computer/runtime) with Node.js 22 or newer:

```bash
npm install --global @oro-computer/runtime@latest
oroc --version
```

<a href="https://www.npmjs.com/package/@oro-computer/runtime" data-runtime-release>Latest release on npm</a>. The `@latest` tag selects npm’s latest release. Rerun the install command to update an existing installation.

Native builds also need your host compiler and SDKs. See [host setup](/runtime/docs/cli/setup/) and [platform support](/runtime/docs/guides/platform-support/).

## Create a project

```bash
oroc init field-notes
cd field-notes
```

The scaffold includes `oro.toml`, a page, its JavaScript entry point, and a service worker. [Project layout](/runtime/docs/guides/project-layout/) explains where each belongs.

## Build and run

```bash
oroc build .
oroc run .
```

A native window should open with the starter page. Rebuild after changing files; `run` launches the last built artifact.

To locate that artifact:

```bash
oroc print-build-dir .
```

If compilation fails, check [setup](/runtime/docs/cli/setup/). For runtime failures, use [testing and diagnostics](/runtime/docs/guides/testing-and-diagnostics/).

## Next

[Save your first draft →](/runtime/learn/getting-started/)

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="1-create-a-project-with-oroc-init"></span>
<span id="2-inspect-the-scaffold"></span>
<span id="3-give-the-app-a-real-identity"></span>
<span id="4-replace-the-starter-page-with-something-useful"></span>
<span id="5-run-it-locally"></span>
<span id="6-confirm-the-build-path"></span>
