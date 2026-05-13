# JavaScript API modules

Oro Runtime exposes native capabilities as explicit ES module imports under the
`oro:*` namespace. Treat those imports as the boundary between ordinary web code
and host capabilities.

Use this page when you need to find the right API family or confirm a public subpath import.

## Start here

| Need | Primary modules |
| --- | --- |
| App shell, windows, lifecycle | [`oro:application`](?p=javascript/application), [`oro:window`](?p=javascript/window), [`oro:hooks`](?p=javascript/hooks), [`oro:navigation`](?p=javascript/navigation) |
| Files, paths, process state | [`oro:fs`](?p=javascript/fs), [`oro:path`](?p=javascript/path), [`oro:os`](?p=javascript/os), [`oro:process`](?p=javascript/process) |
| User-facing desktop behavior | [`oro:notification`](?p=javascript/notification), [`oro:clipboard`](?p=javascript/clipboard), [`oro:secure-storage`](?p=javascript/secure-storage) |
| Network and HTTP work | [`oro:fetch`](?p=javascript/fetch), [`oro:http`](?p=javascript/http), [`oro:https`](?p=javascript/https), [`oro:net`](?p=javascript/net), [`oro:tls`](?p=javascript/tls) |
| Local data and formats | [`oro:sqlite`](?p=javascript/sqlite), [`oro:url`](?p=javascript/url), [`oro:buffer`](?p=javascript/buffer), [`oro:stream`](?p=javascript/stream), [`oro:toml`](?p=javascript/toml) |
| Background work and automation | [`oro:worker`](?p=javascript/worker), [`oro:worker_threads`](?p=javascript/worker_threads), [`oro:service-worker`](?p=javascript/service-worker), [`oro:shared-worker`](?p=javascript/shared-worker), [`oro:mcp`](?p=javascript/mcp), [`oro:ai`](?p=javascript/ai) |

## API families

### Application shell and lifecycle

- [`oro:application`](?p=javascript/application) — app/window management, menus, runtime metadata, and update hooks.
- [`oro:window`](?p=javascript/window) — per-window operations and hotkeys.
- [`oro:hooks`](?p=javascript/hooks) — lifecycle, notification, online/offline, and deep-link subscriptions.
- [`oro:navigation`](?p=javascript/navigation) — runtime navigation state.
- [`oro:notification`](?p=javascript/notification) — notifications and permissions.

### Filesystem, process, and platform

- [`oro:fs`](?p=javascript/fs) — filesystem APIs, including `oro:fs/promises`.
- [`oro:path`](?p=javascript/path) — cross-platform path handling.
- [`oro:os`](?p=javascript/os) — platform, CPU, temporary-directory, and system metadata.
- [`oro:process`](?p=javascript/process) — runtime process state, env access, signals, and scheduling helpers.
- [`oro:child_process`](?p=javascript/child_process) — subprocesses.
- [`oro:clipboard`](?p=javascript/clipboard) — clipboard text operations.

### Network and transport

- [`oro:fetch`](?p=javascript/fetch) — fetch stack and request/response primitives.
- [`oro:http`](?p=javascript/http), [`oro:https`](?p=javascript/https) — Node-compatible HTTP client/server APIs.
- [`oro:net`](?p=javascript/net), [`oro:tcp`](?p=javascript/tcp), [`oro:dgram`](?p=javascript/dgram), [`oro:dns`](?p=javascript/dns), [`oro:tls`](?p=javascript/tls) — lower-level network APIs.
- [`oro:network`](?p=javascript/network), [`oro:latica`](?p=javascript/latica), [`oro:iroh`](?p=javascript/iroh), [`oro:ipfs`](?p=javascript/ipfs) — higher-level transport and peer-to-peer surfaces.

### Data, storage, and formats

- [`oro:sqlite`](?p=javascript/sqlite) — SQLite databases.
- [`oro:secure-storage`](?p=javascript/secure-storage) — origin-scoped secret storage.
- [`oro:buffer`](?p=javascript/buffer), [`oro:stream`](?p=javascript/stream), [`oro:string_decoder`](?p=javascript/string_decoder) — byte and stream primitives.
- [`oro:url`](?p=javascript/url), [`oro:querystring`](?p=javascript/querystring), [`oro:mime`](?p=javascript/mime), [`oro:toml`](?p=javascript/toml), [`oro:semver`](?p=javascript/semver), [`oro:tar`](?p=javascript/tar), [`oro:zlib`](?p=javascript/zlib) — data formats and encoding helpers.

### Security, identity, and diagnostics

- [`oro:crypto`](?p=javascript/crypto) — hashing, random bytes, and sodium-backed helpers.
- [`oro:cookies`](?p=javascript/cookies), [`oro:did`](?p=javascript/did) — identity and web state helpers.
- [`oro:assert`](?p=javascript/assert), [`oro:errors`](?p=javascript/errors), [`oro:errno`](?p=javascript/errno), [`oro:diagnostics`](?p=javascript/diagnostics), [`oro:console`](?p=javascript/console) — correctness and inspection surfaces.

### Device and host integration

- [`oro:usb`](?p=javascript/usb), [`oro:hci`](?p=javascript/hci), [`oro:dbus`](?p=javascript/dbus), [`oro:xpc`](?p=javascript/xpc) — platform and device integration.
- [`oro:extension`](?p=javascript/extension), [`oro:cdp`](?p=javascript/cdp), [`oro:protocol-handlers`](?p=javascript/protocol-handlers) — host extension, inspection, and routing surfaces.

### Workers, automation, and advanced runtime surfaces

- [`oro:worker`](?p=javascript/worker), [`oro:worker_threads`](?p=javascript/worker_threads), [`oro:service-worker`](?p=javascript/service-worker), [`oro:shared-worker`](?p=javascript/shared-worker), [`oro:background`](?p=javascript/background) — background execution.
- [`oro:mcp`](?p=javascript/mcp), [`oro:ai`](?p=javascript/ai), [`oro:test`](?p=javascript/test) — automation, local AI, and test harnesses.
- [`oro:commonjs`](?p=javascript/commonjs), [`oro:module`](?p=javascript/module), [`oro:npm/module`](?p=javascript/npm), [`oro:npm/service-worker`](?p=javascript/npm), [`oro:vm`](?p=javascript/vm) — loader and compatibility APIs.

## Complete public specifier reference

The full public set is grouped below for search and exact subpath lookup. Most apps should use the primary family pages
above instead of browsing this list line by line.

<details>
<summary>App shell and lifecycle</summary>

- `oro:application`, `oro:application/client`, `oro:application/menu`, `oro:application/update`
- `oro:window`, `oro:window/constants`, `oro:window/hotkey`
- `oro:hooks`
- `oro:navigation`, `oro:navigation/navigation`
- `oro:notification`
- `oro:background`
- `oro:location`

</details>

<details>
<summary>Filesystem, process, and platform</summary>

- `oro:fs`, `oro:fs/bookmarks`, `oro:fs/constants`, `oro:fs/dir`, `oro:fs/fds`, `oro:fs/flags`, `oro:fs/handle`, `oro:fs/index`, `oro:fs/promises`, `oro:fs/stats`, `oro:fs/stream`, `oro:fs/watcher`, `oro:fs/web`
- `oro:path`, `oro:path/index`, `oro:path/mounts`, `oro:path/path`, `oro:path/posix`, `oro:path/well-known`, `oro:path/win32`
- `oro:os`, `oro:os/constants`
- `oro:process`, `oro:process/signal`
- `oro:child_process`, `oro:child_process/worker`
- `oro:clipboard`
- `oro:tty`
- `oro:signal`
- `oro:constants`

</details>

<details>
<summary>Network and transport</summary>

- `oro:fetch`, `oro:fetch/fetch`, `oro:fetch/index`
- `oro:http`, `oro:http/adapters`
- `oro:https`
- `oro:net`
- `oro:tcp`
- `oro:dgram`
- `oro:dns`, `oro:dns/constants`, `oro:dns/index`, `oro:dns/promises`, `oro:dns/utils`
- `oro:tls`
- `oro:network`
- `oro:ip`
- `oro:ipc`
- `oro:ipfs`
- `oro:iroh`
- `oro:latica`, `oro:latica/api`, `oro:latica/cache`, `oro:latica/encryption`, `oro:latica/index`, `oro:latica/nat`, `oro:latica/packets`, `oro:latica/proxy`, `oro:latica/worker`
- `oro:conduit`

</details>

<details>
<summary>Data, storage, and formats</summary>

- `oro:buffer`
- `oro:stream`, `oro:stream/web`
- `oro:string_decoder`
- `oro:sqlite`
- `oro:url`, `oro:url/index`, `oro:url/url/url`, `oro:url/urlpattern/urlpattern`
- `oro:querystring`
- `oro:mime`, `oro:mime/index`, `oro:mime/params`, `oro:mime/type`
- `oro:toml`
- `oro:semver`
- `oro:tar`
- `oro:zlib`
- `oro:asn1`
- `oro:enumeration`

</details>

<details>
<summary>Security, identity, diagnostics, and correctness</summary>

- `oro:secure-storage`
- `oro:crypto`, `oro:crypto/sodium`
- `oro:cookies`
- `oro:did`, `oro:did/index`
- `oro:assert`
- `oro:errors`
- `oro:errno`
- `oro:events`
- `oro:diagnostics`, `oro:diagnostics/channels`, `oro:diagnostics/index`, `oro:diagnostics/metric`, `oro:diagnostics/runtime`, `oro:diagnostics/window`
- `oro:console`
- `oro:gc`

</details>

<details>
<summary>Device and host integration</summary>

- `oro:usb`
- `oro:hci`
- `oro:dbus`
- `oro:xpc`
- `oro:extension`
- `oro:cdp`
- `oro:protocol-handlers`
- `oro:language`
- `oro:i18n`

</details>

<details>
<summary>Workers, automation, loaders, and advanced runtime surfaces</summary>

- `oro:ai`, `oro:ai/ann`, `oro:ai/chat`, `oro:ai/llm`, `oro:ai/whisper`
- `oro:mcp`, `oro:mcp/index`
- `oro:worker`
- `oro:worker_threads`, `oro:worker_threads/init`
- `oro:service-worker`, `oro:service-worker/clients`, `oro:service-worker/container`, `oro:service-worker/context`, `oro:service-worker/debug`, `oro:service-worker/env`, `oro:service-worker/events`, `oro:service-worker/global`, `oro:service-worker/init`, `oro:service-worker/instance`, `oro:service-worker/notification`, `oro:service-worker/registration`, `oro:service-worker/state`, `oro:service-worker/storage`, `oro:service-worker/worker`
- `oro:shared-worker`, `oro:shared-worker/debug`, `oro:shared-worker/global`, `oro:shared-worker/index`, `oro:shared-worker/init`, `oro:shared-worker/state`, `oro:shared-worker/worker`
- `oro:test`, `oro:test/context`, `oro:test/dom-helpers`, `oro:test/fast-deep-equal`, `oro:test/harness`, `oro:test/index`
- `oro:timers`, `oro:timers/index`, `oro:timers/platform`, `oro:timers/promises`, `oro:timers/scheduler`, `oro:timers/timer`
- `oro:async`, `oro:async/context`, `oro:async/deferred`, `oro:async/hooks`, `oro:async/resource`, `oro:async/storage`, `oro:async/wrap`, `oro:async_hooks`
- `oro:commonjs`, `oro:commonjs/builtins`, `oro:commonjs/cache`, `oro:commonjs/loader`, `oro:commonjs/module`, `oro:commonjs/package`, `oro:commonjs/require`
- `oro:module`
- `oro:npm/module`, `oro:npm/service-worker`
- `oro:vm`, `oro:vm/init`, `oro:vm/world`
- `oro:util`, `oro:util/types`

</details>

## Notes

- The authoritative surface is the runtime’s published TypeScript declarations.
- This page excludes private implementation families and bundled third-party shims that are not part of the supported
  application-facing API.
- If you know the module name, use the docs search box or open the matching family page from the sidebar.
