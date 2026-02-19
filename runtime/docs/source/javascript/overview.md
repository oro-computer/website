# JavaScript APIs overview

Oro Runtime apps run inside the platform WebView. You use standard web APIs (DOM, ES modules, `fetch`, URLs, WebCrypto,
WebAssembly) and import Oro-specific native capabilities as explicit ES modules under the `oro:*` namespace.

## Importing `oro:*` modules

Modules are standard ES modules:

```js
import application from 'oro:application'
import { onReady } from 'oro:hooks'
import * as secureStorage from 'oro:secure-storage'
```

See: [Module index](?p=javascript/module-index).

If you need an exhaustive list of every `oro:*` specifier (including subpaths), see: [All module specifiers](?p=javascript/all-modules).

## Runtime detection

Inside Oro Runtime, `globalThis.isOroRuntime === true`.

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
- Integrations: [`oro:mcp`](?p=javascript/mcp) · [`oro:ai`](?p=javascript/ai)
- Security: [`oro:secure-storage`](?p=javascript/secure-storage) · [`oro:fs`](?p=javascript/fs)
