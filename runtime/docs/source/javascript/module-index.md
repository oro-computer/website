# Module index

Oro Runtime exposes native capabilities as explicit ES modules under the `oro:*` namespace.

## Core modules (start here)

- [`oro:application`](?p=javascript/application) — app/window management, menus, runtime metadata
- [`oro:window`](?p=javascript/window) — `ApplicationWindow` instances and per-window operations
- [`oro:hooks`](?p=javascript/hooks) — lifecycle and runtime event subscriptions
- [`oro:secure-storage`](?p=javascript/secure-storage) — origin-scoped secret storage
- [`oro:notification`](?p=javascript/notification) — notifications and permissions
- [`oro:fs`](?p=javascript/fs) — filesystem APIs (Node/POSIX-style)
- [`oro:mcp`](?p=javascript/mcp) — register tools/resources and start the embedded MCP bridge
- [`oro:ai`](?p=javascript/ai) — local AI helpers (LLM + chat)

See also: [All module specifiers](?p=javascript/all-modules).

## Public API families

The runtime publishes many module families. The highest-traffic groups are:

- **App shell and lifecycle** — [`oro:application`](?p=javascript/application), [`oro:window`](?p=javascript/window), [`oro:hooks`](?p=javascript/hooks), [`oro:navigation`](?p=javascript/navigation), [`oro:notification`](?p=javascript/notification)
- **Filesystem, process, and platform** — [`oro:fs`](?p=javascript/fs), [`oro:path`](?p=javascript/path), [`oro:os`](?p=javascript/os), [`oro:process`](?p=javascript/process), [`oro:child_process`](?p=javascript/child_process), [`oro:clipboard`](?p=javascript/clipboard)
- **Networking and transport** — [`oro:fetch`](?p=javascript/fetch), [`oro:http`](?p=javascript/http), [`oro:https`](?p=javascript/https), [`oro:net`](?p=javascript/net), [`oro:dns`](?p=javascript/dns), [`oro:tcp`](?p=javascript/tcp), [`oro:tls`](?p=javascript/tls), [`oro:network`](?p=javascript/network)
- **Data, formats, and storage** — [`oro:buffer`](?p=javascript/buffer), [`oro:stream`](?p=javascript/stream), [`oro:url`](?p=javascript/url), [`oro:querystring`](?p=javascript/querystring), [`oro:sqlite`](?p=javascript/sqlite), [`oro:toml`](?p=javascript/toml), [`oro:semver`](?p=javascript/semver), [`oro:mime`](?p=javascript/mime)
- **Security and identity** — [`oro:secure-storage`](?p=javascript/secure-storage), [`oro:crypto`](?p=javascript/crypto), [`oro:cookies`](?p=javascript/cookies), [`oro:did`](?p=javascript/did)
- **Device and host integration** — [`oro:usb`](?p=javascript/usb), [`oro:hci`](?p=javascript/hci), [`oro:dbus`](?p=javascript/dbus), [`oro:xpc`](?p=javascript/xpc), [`oro:extension`](?p=javascript/extension)
- **Workers, services, and automation** — [`oro:worker`](?p=javascript/worker), [`oro:worker_threads`](?p=javascript/worker_threads), [`oro:service-worker`](?p=javascript/service-worker), [`oro:shared-worker`](?p=javascript/shared-worker), [`oro:background`](?p=javascript/background), [`oro:mcp`](?p=javascript/mcp), [`oro:ai`](?p=javascript/ai)
- **Advanced or compatibility surfaces** — [`oro:commonjs`](?p=javascript/commonjs), [`oro:module`](?p=javascript/module), [`oro:bootstrap`](?p=javascript/bootstrap), [`oro:diagnostics`](?p=javascript/diagnostics), and the `oro:npm/*` family

## Importable top-level module specifiers

Each module family has its own API reference page in this docs set. Use the sidebar search for `oro:<name>`.

Many modules also have subpath imports (for example `oro:fs/promises`, `oro:url/index`, `oro:test/*`).

Top-level `oro:*` specifiers you can import directly:

```text
oro:ai
oro:application
oro:asn1
oro:assert
oro:async
oro:async_hooks
oro:background
oro:bootstrap
oro:buffer
oro:cdp
oro:child_process
oro:clipboard
oro:commonjs
oro:conduit
oro:console
oro:constants
oro:cookies
oro:crypto
oro:dbus
oro:dgram
oro:diagnostics
oro:did
oro:dns
oro:enumeration
oro:errno
oro:errors
oro:events
oro:extension
oro:fetch
oro:fs
oro:gc
oro:hci
oro:hooks
oro:http
oro:https
oro:i18n
oro:ip
oro:ipc
oro:ipfs
oro:iroh
oro:language
oro:latica
oro:location
oro:mcp
oro:mime
oro:module
oro:navigation
oro:net
oro:network
oro:node-esm-loader
oro:notification
oro:os
oro:path
oro:process
oro:protocol-handlers
oro:querystring
oro:secure-storage
oro:semver
oro:service-worker
oro:shared-worker
oro:signal
oro:sqlite
oro:stream
oro:string_decoder
oro:tar
oro:tcp
oro:test
oro:timers
oro:tls
oro:toml
oro:tty
oro:url
oro:usb
oro:util
oro:vm
oro:window
oro:worker
oro:worker_threads
oro:xpc
oro:zlib
```

## Subpath-only public module families

Some public module families only exist as subpath imports (there is no `oro:<family>` top-level specifier):

- `oro:npm/*` — NPM/module integration helpers

See: [All module specifiers](?p=javascript/all-modules).
