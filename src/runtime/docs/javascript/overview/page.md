---
layout: "docs"
title: "JavaScript APIs overview"
description: "Oro Runtime apps run inside the platform WebView. You use standard web APIs (DOM, ES modules, fetch, URLs, WebCrypto, WebAssembly) and import Oro-specific native capabilities as explicit ES modules un"
docsCollection: "runtime"
section: "javascript"
order: 50
sourcePath: "javascript/overview.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# JavaScript APIs overview

Oro Runtime apps run inside the platform WebView. You use standard web APIs (DOM, ES modules, `fetch`, URLs, WebCrypto,
WebAssembly) and import Oro-specific native capabilities as explicit ES modules under the `oro:*` namespace.

## How the JavaScript surface is organized

The runtime’s JavaScript surface is broad, but it stays predictable:

- **Application shell** — [`oro:application`](/runtime/docs/javascript/application/), [`oro:window`](/runtime/docs/javascript/window/), [`oro:hooks`](/runtime/docs/javascript/hooks/), [`oro:navigation`](/runtime/docs/javascript/navigation/)
- **Filesystem and process** — [`oro:fs`](/runtime/docs/javascript/fs/), [`oro:path`](/runtime/docs/javascript/path/), [`oro:os`](/runtime/docs/javascript/os/), [`oro:process`](/runtime/docs/javascript/process/), [`oro:child_process`](/runtime/docs/javascript/child_process/)
- **Networking and transport** — [`oro:fetch`](/runtime/docs/javascript/fetch/), [`oro:http`](/runtime/docs/javascript/http/), [`oro:https`](/runtime/docs/javascript/https/), [`oro:net`](/runtime/docs/javascript/net/), [`oro:dns`](/runtime/docs/javascript/dns/), [`oro:tcp`](/runtime/docs/javascript/tcp/), [`oro:tls`](/runtime/docs/javascript/tls/)
- **Security and identity** — [`oro:secure-storage`](/runtime/docs/javascript/secure-storage/), [`oro:crypto`](/runtime/docs/javascript/crypto/), [`oro:cookies`](/runtime/docs/javascript/cookies/), [`oro:did`](/runtime/docs/javascript/did/)
- **Device and host integration** — [`oro:usb`](/runtime/docs/javascript/usb/), [`oro:hci`](/runtime/docs/javascript/hci/), [`oro:dbus`](/runtime/docs/javascript/dbus/), [`oro:xpc`](/runtime/docs/javascript/xpc/), [`oro:extension`](/runtime/docs/javascript/extension/)
- **Data and formats** — [`oro:url`](/runtime/docs/javascript/url/), [`oro:querystring`](/runtime/docs/javascript/querystring/), [`oro:buffer`](/runtime/docs/javascript/buffer/), [`oro:stream`](/runtime/docs/javascript/stream/), [`oro:sqlite`](/runtime/docs/javascript/sqlite/), [`oro:toml`](/runtime/docs/javascript/toml/), [`oro:semver`](/runtime/docs/javascript/semver/)
- **Background work and automation** — [`oro:worker`](/runtime/docs/javascript/worker/), [`oro:worker_threads`](/runtime/docs/javascript/worker_threads/), [`oro:service-worker`](/runtime/docs/javascript/service-worker/), [`oro:shared-worker`](/runtime/docs/javascript/shared-worker/), [`oro:background`](/runtime/docs/javascript/background/), [`oro:mcp`](/runtime/docs/javascript/mcp/), [`oro:ai`](/runtime/docs/javascript/ai/)

## Importing `oro:*` modules

Modules are standard ES modules:

```js
import application from 'oro:application'
import { onReady } from 'oro:hooks'
import * as secureStorage from 'oro:secure-storage'
```

If you need an exhaustive list of every `oro:*` specifier (including subpaths), see: [All module specifiers](/runtime/docs/javascript/all-modules/).

## Runtime boundary

Most application code does not need a special runtime-detection branch. Import
the `oro:*` modules you actually use and treat those imports as the explicit
native-capability boundary.

## Configuration in JavaScript

[`oro:application`](/runtime/docs/javascript/application/) exposes the effective application configuration as `application.config`.

Config keys are flattened (for example `meta_bundle_identifier`, `build_output`) rather than nested tables.

```js
import application from 'oro:application'

console.log(application.config.meta_bundle_identifier)
console.log(application.runtimeVersion)
```

If you’re looking for the TOML keys and defaults, see: [Configuration](/runtime/docs/config/overview/).

## Next

- Core modules: [`oro:application`](/runtime/docs/javascript/application/) · [`oro:window`](/runtime/docs/javascript/window/) · [`oro:hooks`](/runtime/docs/javascript/hooks/)
- OS + data: [`oro:fs`](/runtime/docs/javascript/fs/) · [`oro:path`](/runtime/docs/javascript/path/) · [`oro:process`](/runtime/docs/javascript/process/) · [`oro:url`](/runtime/docs/javascript/url/)
- Networking: [`oro:fetch`](/runtime/docs/javascript/fetch/) · [`oro:http`](/runtime/docs/javascript/http/) · [`oro:https`](/runtime/docs/javascript/https/) · [`oro:tls`](/runtime/docs/javascript/tls/)
- Devices + services: [`oro:usb`](/runtime/docs/javascript/usb/) · [`oro:dbus`](/runtime/docs/javascript/dbus/) · [`oro:xpc`](/runtime/docs/javascript/xpc/) · [`oro:extension`](/runtime/docs/javascript/extension/)
- Services: [`oro:mcp`](/runtime/docs/javascript/mcp/) · [`oro:ai`](/runtime/docs/javascript/ai/) · [`oro:notification`](/runtime/docs/javascript/notification/) · [`oro:secure-storage`](/runtime/docs/javascript/secure-storage/)
