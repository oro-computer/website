# JavaScript APIs overview

Oro Runtime apps run inside the platform WebView. You use standard web APIs (DOM, ES modules, `fetch`, URLs, WebCrypto,
WebAssembly) and import Oro-specific native capabilities as explicit ES modules under the `oro:*` namespace.

## How the JavaScript surface is organized

The runtime’s JavaScript surface is broad, but it stays predictable:

- **Application shell** — `oro:application`, `oro:window`, `oro:hooks`, `oro:navigation`
- **Filesystem and process** — `oro:fs`, `oro:path`, `oro:os`, `oro:process`, `oro:child_process`
- **Networking and transport** — `oro:fetch`, `oro:http`, `oro:https`, `oro:net`, `oro:dns`, `oro:tcp`, `oro:tls`
- **Security and identity** — `oro:secure-storage`, `oro:crypto`, `oro:cookies`, `oro:did`
- **Device and host integration** — `oro:usb`, `oro:hci`, `oro:dbus`, `oro:xpc`, `oro:extension`
- **Data and formats** — `oro:url`, `oro:querystring`, `oro:buffer`, `oro:stream`, `oro:sqlite`, `oro:toml`, `oro:semver`
- **Background work and automation** — `oro:worker`, `oro:worker_threads`, `oro:service-worker`, `oro:shared-worker`, `oro:background`, `oro:mcp`, `oro:ai`

See: [Module index](?p=javascript/module-index).

## Importing `oro:*` modules

Modules are standard ES modules:

```js
import application from 'oro:application'
import { onReady } from 'oro:hooks'
import * as secureStorage from 'oro:secure-storage'
```

If you need an exhaustive list of every `oro:*` specifier (including subpaths), see: [All module specifiers](?p=javascript/all-modules).

## Runtime boundary

Most application code does not need a special runtime-detection branch. Import
the `oro:*` modules you actually use and treat those imports as the explicit
native-capability boundary.

## Configuration in JavaScript

`oro:application` exposes the effective application configuration as `application.config`.

Config keys are flattened (for example `meta_bundle_identifier`, `build_output`) rather than nested tables.

```js
import application from 'oro:application'

console.log(application.config.meta_bundle_identifier)
console.log(application.runtimeVersion)
```

If you’re looking for the TOML keys and defaults, see: [Configuration](?p=config/overview).

## Next

- Core modules: [`oro:application`](?p=javascript/application) · [`oro:window`](?p=javascript/window) · [`oro:hooks`](?p=javascript/hooks)
- OS + data: [`oro:fs`](?p=javascript/fs) · [`oro:path`](?p=javascript/path) · [`oro:process`](?p=javascript/process) · [`oro:url`](?p=javascript/url)
- Networking: [`oro:fetch`](?p=javascript/fetch) · [`oro:http`](?p=javascript/http) · [`oro:https`](?p=javascript/https) · [`oro:tls`](?p=javascript/tls)
- Devices + services: [`oro:usb`](?p=javascript/usb) · [`oro:dbus`](?p=javascript/dbus) · [`oro:xpc`](?p=javascript/xpc) · [`oro:extension`](?p=javascript/extension)
- Services: [`oro:mcp`](?p=javascript/mcp) · [`oro:ai`](?p=javascript/ai) · [`oro:notification`](?p=javascript/notification) · [`oro:secure-storage`](?p=javascript/secure-storage)
