---
layout: "docs"
description: "Build a native app, then add storage, windows, and release packaging."
docsCollection: "runtime"
section: "overview"
order: 0
sourcePath: "start.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Oro Runtime Docs

Build native apps with HTML, CSS, and JavaScript. Your interface runs in the platform WebView; `oro:*` imports connect it to native capabilities.

## Install the toolchain

Install the CLI from [npm](https://www.npmjs.com/package/@oro-computer/runtime) with Node.js 22+:

```bash
npm install --global @oro-computer/runtime@latest
oroc --version
```

<a href="https://www.npmjs.com/package/@oro-computer/runtime" data-runtime-release>Latest release on npm</a>. The `@latest` tag selects npm’s latest release; rerun the install command to update. Native builds also need [host tools and SDKs](/runtime/docs/cli/setup/).

## Start with a draft

[Build Field Notes](/runtime/learn/getting-started/): write a draft, save it, and reopen it. The five-chapter path then adds a preview window, clipboard, and notifications.

Already have a web project? [Create and run the scaffold](/runtime/docs/guides/from-zero-to-first-run/), then [connect your frontend build](/runtime/docs/guides/frontend-build-pipeline/).

## Grow the app

- Build the interface with [React and Vite](/runtime/docs/guides/frontend-build-pipeline/).
- Use [web platform APIs](/runtime/docs/guides/web-platform-apis/) such as global `fetch`, workers, streams, and storage.
- [Build a mobile app](/runtime/docs/guides/mobile-targets-and-device-installs/) for Android and iOS, with local drafts and native sharing.

- Keep multiple notes in [SQLite](/runtime/docs/guides/local-data-with-sqlite/).
- Stay usable offline with [service workers](/runtime/docs/guides/offline-first-with-service-workers/).
- Coordinate [windows and messages](/runtime/docs/guides/windows-and-messaging/).
- [Package a release](/runtime/docs/guides/build-and-package/) and add [signed updates](/runtime/docs/guides/release-packaging-and-signed-updates/).

## Look up a detail

Use the [JavaScript APIs](/runtime/docs/javascript/overview/), [CLI](/runtime/docs/cli/oroc/), or [configuration reference](/runtime/docs/config/reference/). Check [platform support](/runtime/docs/guides/platform-support/) before choosing a host-specific feature.

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="cli-input-forms"></span>
<span id="a-native-hello-world"></span>
<span id="recommended-reading-path"></span>
