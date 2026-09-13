---
layout: "docs"
title: "JavaScript API modules"
description: "Oro Runtime exposes native capabilities as explicit ES module imports under the oro:* namespace. Treat those imports as the boundary between ordinary web code and host capabilities."
docsCollection: "runtime"
section: "javascript"
order: 51
sourcePath: "javascript/all-modules.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# JavaScript API modules

Oro Runtime exposes native capabilities as explicit ES module imports under the
`oro:*` namespace. Treat those imports as the boundary between ordinary web code
and host capabilities.

Use this page when you need to find the right API family or confirm a public subpath import.

## Start here

| Need | Primary modules |
| --- | --- |
| App shell, windows, lifecycle | [`oro:application`](/runtime/docs/javascript/application/), [`oro:window`](/runtime/docs/javascript/window/), [`oro:hooks`](/runtime/docs/javascript/hooks/), [`oro:navigation`](/runtime/docs/javascript/navigation/) |
| Files, paths, process state | [`oro:fs`](/runtime/docs/javascript/fs/), [`oro:path`](/runtime/docs/javascript/path/), [`oro:os`](/runtime/docs/javascript/os/), [`oro:process`](/runtime/docs/javascript/process/) |
| User-facing desktop behavior | [`oro:notification`](/runtime/docs/javascript/notification/), [`oro:clipboard`](/runtime/docs/javascript/clipboard/), [`oro:secure-storage`](/runtime/docs/javascript/secure-storage/) |
| Network and HTTP work | [`oro:fetch`](/runtime/docs/javascript/fetch/), [`oro:http`](/runtime/docs/javascript/http/), [`oro:https`](/runtime/docs/javascript/https/), [`oro:net`](/runtime/docs/javascript/net/), [`oro:tls`](/runtime/docs/javascript/tls/) |
| Local data and formats | [`oro:sqlite`](/runtime/docs/javascript/sqlite/), [`oro:url`](/runtime/docs/javascript/url/), [`oro:buffer`](/runtime/docs/javascript/buffer/), [`oro:stream`](/runtime/docs/javascript/stream/), [`oro:toml`](/runtime/docs/javascript/toml/) |
| Background work and automation | [`oro:worker`](/runtime/docs/javascript/worker/), [`oro:worker_threads`](/runtime/docs/javascript/worker_threads/), [`oro:service-worker`](/runtime/docs/javascript/service-worker/), [`oro:shared-worker`](/runtime/docs/javascript/shared-worker/), [`oro:mcp`](/runtime/docs/javascript/mcp/), [`oro:ai`](/runtime/docs/javascript/ai/) |

## API families

### Application shell and lifecycle

- [`oro:application`](/runtime/docs/javascript/application/) — app/window management, menus, runtime metadata, and update hooks.
- [`oro:window`](/runtime/docs/javascript/window/) — per-window operations and hotkeys.
- [`oro:hooks`](/runtime/docs/javascript/hooks/) — lifecycle, notification, online/offline, and deep-link subscriptions.
- [`oro:navigation`](/runtime/docs/javascript/navigation/) — runtime navigation state.
- [`oro:notification`](/runtime/docs/javascript/notification/) — notifications and permissions.

### Filesystem, process, and platform

- [`oro:fs`](/runtime/docs/javascript/fs/) — filesystem APIs, including `oro:fs/promises`.
- [`oro:path`](/runtime/docs/javascript/path/) — cross-platform path handling.
- [`oro:os`](/runtime/docs/javascript/os/) — platform, CPU, temporary-directory, and system metadata.
- [`oro:process`](/runtime/docs/javascript/process/) — runtime process state, env access, signals, and scheduling helpers.
- [`oro:child_process`](/runtime/docs/javascript/child_process/) — subprocesses.
- [`oro:clipboard`](/runtime/docs/javascript/clipboard/) — clipboard text operations.

### Network and transport

- [`oro:fetch`](/runtime/docs/javascript/fetch/) — fetch stack and request/response primitives.
- [`oro:http`](/runtime/docs/javascript/http/), [`oro:https`](/runtime/docs/javascript/https/) — Node-compatible HTTP client/server APIs.
- [`oro:net`](/runtime/docs/javascript/net/), [`oro:tcp`](/runtime/docs/javascript/tcp/), [`oro:dgram`](/runtime/docs/javascript/dgram/), [`oro:dns`](/runtime/docs/javascript/dns/), [`oro:tls`](/runtime/docs/javascript/tls/) — lower-level network APIs.
- [`oro:network`](/runtime/docs/javascript/network/), [`oro:latica`](/runtime/docs/javascript/latica/), [`oro:iroh`](/runtime/docs/javascript/iroh/), [`oro:ipfs`](/runtime/docs/javascript/ipfs/) — higher-level transport and peer-to-peer surfaces.

### Data, storage, and formats

- [`oro:sqlite`](/runtime/docs/javascript/sqlite/) — SQLite databases.
- [`oro:secure-storage`](/runtime/docs/javascript/secure-storage/) — origin-scoped secret storage.
- [`oro:buffer`](/runtime/docs/javascript/buffer/), [`oro:stream`](/runtime/docs/javascript/stream/), [`oro:string_decoder`](/runtime/docs/javascript/string_decoder/) — byte and stream primitives.
- [`oro:url`](/runtime/docs/javascript/url/), [`oro:querystring`](/runtime/docs/javascript/querystring/), [`oro:mime`](/runtime/docs/javascript/mime/), [`oro:toml`](/runtime/docs/javascript/toml/), [`oro:semver`](/runtime/docs/javascript/semver/), [`oro:tar`](/runtime/docs/javascript/tar/), [`oro:zlib`](/runtime/docs/javascript/zlib/) — data formats and encoding helpers.

### Security, identity, and diagnostics

- [`oro:crypto`](/runtime/docs/javascript/crypto/) — hashing, random bytes, and sodium-backed helpers.
- [`oro:cookies`](/runtime/docs/javascript/cookies/), [`oro:did`](/runtime/docs/javascript/did/) — identity and web state helpers.
- [`oro:assert`](/runtime/docs/javascript/assert/), [`oro:errors`](/runtime/docs/javascript/errors/), [`oro:errno`](/runtime/docs/javascript/errno/), [`oro:diagnostics`](/runtime/docs/javascript/diagnostics/), [`oro:console`](/runtime/docs/javascript/console/) — correctness and inspection surfaces.

### Device and host integration

- [`oro:usb`](/runtime/docs/javascript/usb/), [`oro:hci`](/runtime/docs/javascript/hci/), [`oro:dbus`](/runtime/docs/javascript/dbus/), [`oro:xpc`](/runtime/docs/javascript/xpc/) — platform and device integration.
- [`oro:extension`](/runtime/docs/javascript/extension/), [`oro:cdp`](/runtime/docs/javascript/cdp/), [`oro:protocol-handlers`](/runtime/docs/javascript/protocol-handlers/) — host extension, inspection, and routing surfaces.

### Workers, automation, and advanced runtime surfaces

- [`oro:worker`](/runtime/docs/javascript/worker/), [`oro:worker_threads`](/runtime/docs/javascript/worker_threads/), [`oro:service-worker`](/runtime/docs/javascript/service-worker/), [`oro:shared-worker`](/runtime/docs/javascript/shared-worker/), [`oro:background`](/runtime/docs/javascript/background/) — background execution.
- [`oro:mcp`](/runtime/docs/javascript/mcp/), [`oro:ai`](/runtime/docs/javascript/ai/), [`oro:test`](/runtime/docs/javascript/test/) — automation, local AI, and test harnesses.
- [`oro:commonjs`](/runtime/docs/javascript/commonjs/), [`oro:module`](/runtime/docs/javascript/module/), [`oro:npm/module`](/runtime/docs/javascript/npm/), [`oro:npm/service-worker`](/runtime/docs/javascript/npm/), [`oro:vm`](/runtime/docs/javascript/vm/) — loader and compatibility APIs.

## Complete public specifier reference

The full public set is grouped below for search and exact subpath lookup. Most apps should use the primary family pages
above instead of browsing this list line by line.

<details>
<summary>App shell and lifecycle</summary>

- [`oro:application`](/runtime/docs/javascript/application/), `oro:application/client`, `oro:application/menu`, `oro:application/update`
- [`oro:window`](/runtime/docs/javascript/window/), `oro:window/constants`, `oro:window/hotkey`
- [`oro:hooks`](/runtime/docs/javascript/hooks/)
- [`oro:navigation`](/runtime/docs/javascript/navigation/), `oro:navigation/navigation`
- [`oro:notification`](/runtime/docs/javascript/notification/)
- [`oro:background`](/runtime/docs/javascript/background/)
- [`oro:location`](/runtime/docs/javascript/location/)

</details>

<details>
<summary>Filesystem, process, and platform</summary>

- [`oro:fs`](/runtime/docs/javascript/fs/), `oro:fs/bookmarks`, `oro:fs/constants`, `oro:fs/dir`, `oro:fs/fds`, `oro:fs/flags`, `oro:fs/handle`, `oro:fs/index`, `oro:fs/promises`, `oro:fs/stats`, `oro:fs/stream`, `oro:fs/watcher`, `oro:fs/web`
- [`oro:path`](/runtime/docs/javascript/path/), `oro:path/index`, `oro:path/mounts`, `oro:path/path`, `oro:path/posix`, `oro:path/well-known`, `oro:path/win32`
- [`oro:os`](/runtime/docs/javascript/os/), `oro:os/constants`
- [`oro:process`](/runtime/docs/javascript/process/), `oro:process/signal`
- [`oro:child_process`](/runtime/docs/javascript/child_process/), `oro:child_process/worker`
- [`oro:clipboard`](/runtime/docs/javascript/clipboard/)
- [`oro:tty`](/runtime/docs/javascript/tty/)
- [`oro:signal`](/runtime/docs/javascript/signal/)
- [`oro:constants`](/runtime/docs/javascript/constants/)

</details>

<details>
<summary>Network and transport</summary>

- [`oro:fetch`](/runtime/docs/javascript/fetch/), `oro:fetch/fetch`, `oro:fetch/index`
- [`oro:http`](/runtime/docs/javascript/http/), `oro:http/adapters`
- [`oro:https`](/runtime/docs/javascript/https/)
- [`oro:net`](/runtime/docs/javascript/net/)
- [`oro:tcp`](/runtime/docs/javascript/tcp/)
- [`oro:dgram`](/runtime/docs/javascript/dgram/)
- [`oro:dns`](/runtime/docs/javascript/dns/), `oro:dns/constants`, `oro:dns/index`, `oro:dns/promises`, `oro:dns/utils`
- [`oro:tls`](/runtime/docs/javascript/tls/)
- [`oro:network`](/runtime/docs/javascript/network/)
- [`oro:ip`](/runtime/docs/javascript/ip/)
- [`oro:ipc`](/runtime/docs/javascript/ipc/)
- [`oro:ipfs`](/runtime/docs/javascript/ipfs/)
- [`oro:iroh`](/runtime/docs/javascript/iroh/)
- [`oro:latica`](/runtime/docs/javascript/latica/), `oro:latica/api`, `oro:latica/cache`, `oro:latica/encryption`, `oro:latica/index`, `oro:latica/nat`, `oro:latica/packets`, `oro:latica/proxy`, `oro:latica/worker`
- [`oro:conduit`](/runtime/docs/javascript/conduit/)

</details>

<details>
<summary>Data, storage, and formats</summary>

- [`oro:buffer`](/runtime/docs/javascript/buffer/)
- [`oro:stream`](/runtime/docs/javascript/stream/), `oro:stream/web`
- [`oro:string_decoder`](/runtime/docs/javascript/string_decoder/)
- [`oro:sqlite`](/runtime/docs/javascript/sqlite/)
- [`oro:url`](/runtime/docs/javascript/url/), `oro:url/index`, `oro:url/url/url`, `oro:url/urlpattern/urlpattern`
- [`oro:querystring`](/runtime/docs/javascript/querystring/)
- [`oro:mime`](/runtime/docs/javascript/mime/), `oro:mime/index`, `oro:mime/params`, `oro:mime/type`
- [`oro:toml`](/runtime/docs/javascript/toml/)
- [`oro:semver`](/runtime/docs/javascript/semver/)
- [`oro:tar`](/runtime/docs/javascript/tar/)
- [`oro:zlib`](/runtime/docs/javascript/zlib/)
- [`oro:asn1`](/runtime/docs/javascript/asn1/)
- [`oro:enumeration`](/runtime/docs/javascript/enumeration/)

</details>

<details>
<summary>Security, identity, diagnostics, and correctness</summary>

- [`oro:secure-storage`](/runtime/docs/javascript/secure-storage/)
- [`oro:crypto`](/runtime/docs/javascript/crypto/), `oro:crypto/sodium`
- [`oro:cookies`](/runtime/docs/javascript/cookies/)
- [`oro:did`](/runtime/docs/javascript/did/), `oro:did/index`
- [`oro:assert`](/runtime/docs/javascript/assert/)
- [`oro:errors`](/runtime/docs/javascript/errors/)
- [`oro:errno`](/runtime/docs/javascript/errno/)
- [`oro:events`](/runtime/docs/javascript/events/)
- [`oro:diagnostics`](/runtime/docs/javascript/diagnostics/), `oro:diagnostics/channels`, `oro:diagnostics/index`, `oro:diagnostics/metric`, `oro:diagnostics/runtime`, `oro:diagnostics/window`
- [`oro:console`](/runtime/docs/javascript/console/)
- [`oro:gc`](/runtime/docs/javascript/gc/)

</details>

<details>
<summary>Device and host integration</summary>

- [`oro:usb`](/runtime/docs/javascript/usb/)
- [`oro:hci`](/runtime/docs/javascript/hci/)
- [`oro:dbus`](/runtime/docs/javascript/dbus/)
- [`oro:xpc`](/runtime/docs/javascript/xpc/)
- [`oro:extension`](/runtime/docs/javascript/extension/)
- [`oro:cdp`](/runtime/docs/javascript/cdp/)
- [`oro:protocol-handlers`](/runtime/docs/javascript/protocol-handlers/)
- [`oro:language`](/runtime/docs/javascript/language/)
- [`oro:i18n`](/runtime/docs/javascript/i18n/)

</details>

<details>
<summary>Workers, automation, loaders, and advanced runtime surfaces</summary>

- [`oro:ai`](/runtime/docs/javascript/ai/), `oro:ai/ann`, `oro:ai/chat`, `oro:ai/llm`, `oro:ai/whisper`
- [`oro:mcp`](/runtime/docs/javascript/mcp/), `oro:mcp/index`
- [`oro:worker`](/runtime/docs/javascript/worker/)
- [`oro:worker_threads`](/runtime/docs/javascript/worker_threads/), `oro:worker_threads/init`
- [`oro:service-worker`](/runtime/docs/javascript/service-worker/), `oro:service-worker/clients`, `oro:service-worker/container`, `oro:service-worker/context`, `oro:service-worker/debug`, `oro:service-worker/env`, `oro:service-worker/events`, `oro:service-worker/global`, `oro:service-worker/init`, `oro:service-worker/instance`, `oro:service-worker/notification`, `oro:service-worker/registration`, `oro:service-worker/state`, `oro:service-worker/storage`, `oro:service-worker/worker`
- [`oro:shared-worker`](/runtime/docs/javascript/shared-worker/), `oro:shared-worker/debug`, `oro:shared-worker/global`, `oro:shared-worker/index`, `oro:shared-worker/init`, `oro:shared-worker/state`, `oro:shared-worker/worker`
- [`oro:test`](/runtime/docs/javascript/test/), `oro:test/context`, `oro:test/dom-helpers`, `oro:test/fast-deep-equal`, `oro:test/harness`, `oro:test/index`
- [`oro:timers`](/runtime/docs/javascript/timers/), `oro:timers/index`, `oro:timers/platform`, `oro:timers/promises`, `oro:timers/scheduler`, `oro:timers/timer`
- [`oro:async`](/runtime/docs/javascript/async/), `oro:async/context`, `oro:async/deferred`, `oro:async/hooks`, `oro:async/resource`, `oro:async/storage`, `oro:async/wrap`, [`oro:async_hooks`](/runtime/docs/javascript/async_hooks/)
- [`oro:commonjs`](/runtime/docs/javascript/commonjs/), `oro:commonjs/builtins`, `oro:commonjs/cache`, `oro:commonjs/loader`, `oro:commonjs/module`, `oro:commonjs/package`, `oro:commonjs/require`
- [`oro:module`](/runtime/docs/javascript/module/)
- `oro:npm/module`, `oro:npm/service-worker`
- [`oro:vm`](/runtime/docs/javascript/vm/), `oro:vm/init`, `oro:vm/world`
- [`oro:util`](/runtime/docs/javascript/util/), `oro:util/types`

</details>

## Notes

- The authoritative surface is the runtime’s published TypeScript declarations.
- This page excludes private implementation families and bundled third-party shims that are not part of the supported
  application-facing API.
- If you know the module name, use the docs search box or open the matching family page from the sidebar.
