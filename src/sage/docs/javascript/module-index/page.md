---
layout: "docs"
title: "Module index"
description: "This is the stable built-in module surface for Sage plugins."
docsCollection: "sage"
section: "javascript"
order: 14
sourcePath: "javascript/module-index.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# Module index

This is the stable built-in module surface for Sage plugins.

| Module | Purpose |
| --- | --- |
| [`sage:fs`](/sage/docs/javascript/fs/) | Bounded filesystem access for open local tabs and plugin state |
| [`sage:path`](/sage/docs/javascript/path/) | Minimal POSIX-style path helpers |
| [`sage:process`](/sage/docs/javascript/process/) | Process metadata and bounded shell execution |
| [`sage:env`](/sage/docs/javascript/env/) | Process environment helpers |
| [`sage:navigator`](/sage/docs/javascript/navigator/) | Browser-like `navigator` object |
| [`sage:performance`](/sage/docs/javascript/performance/) | `performance.now()` and `timeOrigin` |
| [`sage:crypto`](/sage/docs/javascript/crypto/) | Random bytes and UUID v4 |
| [`sage:uuid`](/sage/docs/javascript/uuid/) | UUID v4 and v7 helpers |
| [`sage:url`](/sage/docs/javascript/url/) | WHATWG-style `URL` and `URLSearchParams` |
| [`sage:core/dom`](/sage/docs/javascript/dom/) | `DOMException` and `structuredClone` |
| [`sage:core/web`](/sage/docs/javascript/web/) | WHATWG-style web primitives |
| [`sage:fetch`](/sage/docs/javascript/fetch/) | Host-backed WHATWG-style `fetch()` |

Internal implementation modules exist, but downstream code should not rely on them as stable API:

- `sage:core/global`
- `sage:internal/host`

See also: [All module specifiers](/sage/docs/javascript/all-modules/)
