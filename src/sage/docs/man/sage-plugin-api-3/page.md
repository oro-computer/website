---
layout: "docs"
title: "sage-plugin-api(3)"
description: "sage-plugin-api(3) is the manual page for the JavaScript plugin runtime. This page mirrors the man page in website form and points into the fuller module documentation."
docsCollection: "sage"
section: "man"
order: 30
sourcePath: "man/sage-plugin-api-3.md"
githubRepo: "oro-computer/sage"
githubRef: "master"
---

# [`sage-plugin-api(3)`](/sage/docs/man/sage-plugin-api-3/)

[`sage-plugin-api(3)`](/sage/docs/man/sage-plugin-api-3/) is the manual page for the JavaScript plugin runtime. This page mirrors the man page in website form and points into the fuller module documentation.

## What [`sage-plugin-api(3)`](/sage/docs/man/sage-plugin-api-3/) defines

### Loading and import rules

The man page defines:

- plugin directory resolution
- lexicographic `*.js` loading
- interactive-TUI-only loading
- safe-mode disable paths
- ESM-only evaluation
- import confinement rules
- the top-level-`await` restriction

Read the fuller website breakdown in [JavaScript runtime](/sage/docs/javascript/runtime/).

### Globals and events

The man page enumerates:

- runtime detection
- the event bus globals
- console methods and log thresholds
- timer functions
- command registration
- host events and payload shapes
- the browser-like `navigator`

Read the fuller website breakdown in [JavaScript runtime](/sage/docs/javascript/runtime/).

### Built-in modules

[`sage-plugin-api(3)`](/sage/docs/man/sage-plugin-api-3/) defines the public `sage:*` modules and their high-level contracts.

Read the fuller website breakdown in:

- [Module index](/sage/docs/javascript/module-index/)
- [`sage:fs`](/sage/docs/javascript/fs/)
- [`sage:path`](/sage/docs/javascript/path/)
- [`sage:process`](/sage/docs/javascript/process/)
- [`sage:env`](/sage/docs/javascript/env/)
- [`sage:navigator`](/sage/docs/javascript/navigator/)
- [`sage:performance`](/sage/docs/javascript/performance/)
- [`sage:crypto`](/sage/docs/javascript/crypto/)
- [`sage:uuid`](/sage/docs/javascript/uuid/)
- [`sage:url`](/sage/docs/javascript/url/)
- [`sage:core/dom`](/sage/docs/javascript/dom/)
- [`sage:core/web`](/sage/docs/javascript/web/)
- [`sage:fetch`](/sage/docs/javascript/fetch/)

### Limits, environment, and files

The man page is also the authoritative short reference for:

- plugin load and event budgets
- memory and stack limits
- plugin-related environment variables
- plugin log paths
- plugin data directory locations

Read the fuller website breakdown in [JavaScript runtime](/sage/docs/javascript/runtime/) and [Environment and files](/sage/docs/cli/environment-and-files/).

## Best companion pages

- [JavaScript runtime](/sage/docs/javascript/runtime/)
- [Module index](/sage/docs/javascript/module-index/)
- [`sage:fs`](/sage/docs/javascript/fs/)
- [`sage:process`](/sage/docs/javascript/process/)
- [`sage:fetch`](/sage/docs/javascript/fetch/)

## Upstream source

- [`man/sage-plugin-api.3`](https://github.com/oro-computer/sage/blob/master/man/sage-plugin-api.3)
