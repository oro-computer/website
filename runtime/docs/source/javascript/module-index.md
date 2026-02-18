# Module index

Oro Runtime exposes native capabilities as explicit ES modules under the `oro:*` namespace.

## Core modules (start here)

- [`oro:application`](?p=javascript/application) — app/window management, menus, runtime metadata
- [`oro:window`](?p=javascript/window) — `ApplicationWindow` instances and per-window operations
- [`oro:hooks`](?p=javascript/hooks) — lifecycle and runtime event subscriptions
- [`oro:secure-storage`](?p=javascript/secure-storage) — origin-scoped secret storage
- [`oro:notification`](?p=javascript/notification) — notifications and permissions
- [`oro:fs`](?p=javascript/filesystem) — filesystem APIs (Node/POSIX-style)
- [`oro:mcp`](?p=javascript/mcp) — register tools/resources and start the embedded MCP bridge
- [`oro:ai`](?p=javascript/ai) — local AI helpers (LLM + chat)

See also: [All module specifiers](?p=javascript/all-modules).

## Top-level module specifiers

Many modules also have subpath imports (for example `oro:fs/promises`, `oro:url/index`, `oro:test/*`).

Top-level `oro:*` modules:

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
oro:external
oro:fetch
oro:fs
oro:gc
oro:hci
oro:hooks
oro:http
oro:https
oro:i18n
oro:internal
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
oro:node
oro:node-esm-loader
oro:notification
oro:npm
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
oro:util
oro:vm
oro:window
oro:worker
oro:worker_threads
oro:xpc
oro:zlib
```
