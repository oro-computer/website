---
layout: "docs"
description: "Use web globals for networking, storage, workers, media, and device features; import native modules when you need their additional APIs."
docsCollection: "runtime"
section: "guides"
order: 26
sourcePath: "guides/web-platform-apis.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Web platform APIs

Use the web APIs you already know inside a native app. Oro Runtime loads your HTML, CSS, and JavaScript in the platform WebView and installs web-compatible bridges for native capabilities. `fetch`, `URL`, streams, workers, and other web globals are ready to use in the app; they need no `oro:*` imports.

## APIs at your fingertips

These are application-window APIs. Workers have their own scopes and no DOM; permission-sensitive and engine-specific features also depend on the target OS and WebView version.

| Task | Web APIs | Example use |
| --- | --- | --- |
| Interfaces | DOM, CSS, ES modules, custom elements, Shadow DOM, forms, events, `MutationObserver`, `ResizeObserver`, `IntersectionObserver` | Build with React, Vue, Svelte, or web components |
| HTTP and data transfer | `fetch`, `Headers`, `Request`, `Response`, `XMLHttpRequest`, `FormData` | Call JSON APIs or upload a selected file |
| URLs and routes | `URL`, `URLSearchParams`, `URLPattern`, History and navigation APIs | Build a query or match an app route |
| Cancellation | `AbortController`, `AbortSignal` | Cancel a request when a view closes |
| Binary data | `Blob`, `File`, `ArrayBuffer`, typed arrays, `TextEncoder`, `TextDecoder` | Read an imported document or encode a payload |
| Streaming | `ReadableStream`, BYOB readers, `WritableStream`, `TransformStream`, queuing strategies | Process data in chunks |
| Local state | `localStorage`, `sessionStorage`, IndexedDB | Save drafts or maintain structured local records |
| Offline delivery | `navigator.serviceWorker`, `caches`, `Cache`, `Request`, `Response` | Cache responses and handle requests offline |
| Background work | `Worker`, `SharedWorker`, `MessageChannel`, `MessagePort`, `BroadcastChannel` | Keep computation off the UI thread and pass messages |
| Cryptography | `crypto.getRandomValues`, `crypto.subtle` | Generate secure random values and use WebCrypto algorithms supported by the engine |
| Computation | `WebAssembly`, promises, timers, `queueMicrotask`, `performance` | Run compiled modules and measure work |
| Media and graphics | Canvas, SVG, WebGL, HTML audio/video, `navigator.mediaDevices` | Visualize data or capture media with permission |
| User-selected files | `showOpenFilePicker`, `showSaveFilePicker`, `showDirectoryPicker`, file-system handles | Import and export through native pickers |
| Location and notifications | `navigator.geolocation`, `navigator.permissions`, `Notification` | Attach a location or notify after permission |
| Clipboard and sharing | `navigator.clipboard`, `navigator.share`, `navigator.canShare` | Copy a note or open a system share sheet |
| Connected devices | `navigator.bluetooth`, `navigator.usb`, `navigator.hid` | Request user-selected hardware where a backend supports the operation |
| One-time codes | `navigator.credentials.get({ otp: … })` | Retrieve an origin-bound SMS code on supported mobile platforms |

WebView features such as WebSocket, EventSource, Web Audio, CSS animations, internationalization, and accessible HTML controls also fit this model. Availability of an API name does not guarantee every method, algorithm, or device operation on every target. Feature-detect optional functionality, handle rejected operations, and consult [platform support](/runtime/docs/guides/platform-support/) when selecting hardware or media features.

Runtime’s `TCPSocket`, `UDPSocket`, and `TCPServerSocket` globals expose the **Direct Sockets proposal**. They are additional capabilities, with their own policy checks, rather than universally implemented browser APIs. See [networking modules](/runtime/docs/javascript/network/).

## Use globals directly

This function uses only web globals. Call it with a real API origin and handle failures in your view:

```js
async function loadProject(apiOrigin, projectId, signal) {
  const url = new URL(`/projects/${encodeURIComponent(projectId)}`, apiOrigin)
  const response = await fetch(url.href, {
    headers: { accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new Error(`Project request failed (${response.status})`)
  const project = await response.json()
  if (!project || typeof project.name !== 'string') {
    throw new Error('Expected a project with a name')
  }
  return { name: project.name }
}
```

For timeouts, cancellation, authentication, and persistence, follow [Calling HTTP APIs](/runtime/docs/guides/calling-http-apis/). A decoder checks that input is JSON; application validation checks that it is useful data.

## Import additional native capabilities

Use `oro:*` imports for API surfaces your app needs beyond the web globals:

```js
import { DATA } from 'oro:path/well-known'
import { join } from 'oro:path'
import * as fs from 'oro:fs/promises'

async function exportLocalBackup(notes) {
  if (!DATA) throw new Error('App data directory is unavailable')
  await fs.mkdir(DATA, { recursive: true })
  const filename = join(DATA, 'notes-backup.json')
  await fs.writeFile(filename, JSON.stringify(notes, null, 2), 'utf8')
  return filename
}
```

The [`oro:fetch`](/runtime/docs/javascript/fetch/), [`oro:url`](/runtime/docs/javascript/url/), and worker modules document Runtime’s module interfaces too. Application examples can use their installed globals directly. Imports remain useful for module-only helpers such as `oro:crypto`’s hashing utilities, `oro:timers/promises`, `oro:sqlite`, `oro:secure-storage`, and native window management.

## Permissions and platform behavior

Geolocation, notifications, file pickers, clipboard access, sharing, and hardware access can require user gestures, OS permissions, and project configuration. Bluetooth, USB, HID, and OTP have platform-specific boundaries; check the [capability matrix](/runtime/docs/guides/platform-support/) before relying on a method. Configure only the [permissions](/runtime/docs/config/reference/#permissions) your app uses, and explain failures in the view.

Inspect the API you need rather than treating a platform name as proof of support. A function may exist but reject with `NotSupportedError` or `NotAllowedError`; handle both. Importing its module does not grant permission or add a missing native backend.

## Next

- [Build with React and Vite](/runtime/docs/guides/frontend-build-pipeline/)
- [Build a mobile app](/runtime/docs/guides/mobile-targets-and-device-installs/)
- [Offline-first with service workers](/runtime/docs/guides/offline-first-with-service-workers/)
- [JavaScript modules reference](/runtime/docs/javascript/overview/)
