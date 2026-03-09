# Module index

This is the stable built-in module surface for Sage plugins.

| Module | Purpose |
| --- | --- |
| [`sage:fs`](?p=javascript/fs) | Bounded filesystem access for open local tabs and plugin state |
| [`sage:path`](?p=javascript/path) | Minimal POSIX-style path helpers |
| [`sage:process`](?p=javascript/process) | Process metadata and bounded shell execution |
| [`sage:env`](?p=javascript/env) | Process environment helpers |
| [`sage:navigator`](?p=javascript/navigator) | Browser-like `navigator` object |
| [`sage:performance`](?p=javascript/performance) | `performance.now()` and `timeOrigin` |
| [`sage:crypto`](?p=javascript/crypto) | Random bytes and UUID v4 |
| [`sage:uuid`](?p=javascript/uuid) | UUID v4 and v7 helpers |
| [`sage:url`](?p=javascript/url) | WHATWG-style `URL` and `URLSearchParams` |
| [`sage:core/dom`](?p=javascript/dom) | `DOMException` and `structuredClone` |
| [`sage:core/web`](?p=javascript/web) | WHATWG-style web primitives |
| [`sage:fetch`](?p=javascript/fetch) | Host-backed WHATWG-style `fetch()` |

Internal implementation modules exist, but downstream code should not rely on them as stable API:

- `sage:core/global`
- `sage:internal/host`

See also: [All module specifiers](?p=javascript/all-modules)
