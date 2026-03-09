# `sage-plugin-api(3)`

`sage-plugin-api(3)` is the manual page for the JavaScript plugin runtime. This page mirrors the man page in website form and points into the fuller module documentation.

## What `sage-plugin-api(3)` defines

### Loading and import rules

The man page defines:

- plugin directory resolution
- lexicographic `*.js` loading
- interactive-TUI-only loading
- safe-mode disable paths
- ESM-only evaluation
- import confinement rules
- the top-level-`await` restriction

Read the fuller website breakdown in [JavaScript runtime](?p=javascript/runtime).

### Globals and events

The man page enumerates:

- runtime detection
- the event bus globals
- console methods and log thresholds
- timer functions
- command registration
- host events and payload shapes
- the browser-like `navigator`

Read the fuller website breakdown in [JavaScript runtime](?p=javascript/runtime).

### Built-in modules

`sage-plugin-api(3)` defines the public `sage:*` modules and their high-level contracts.

Read the fuller website breakdown in:

- [Module index](?p=javascript/module-index)
- [`sage:fs`](?p=javascript/fs)
- [`sage:path`](?p=javascript/path)
- [`sage:process`](?p=javascript/process)
- [`sage:env`](?p=javascript/env)
- [`sage:navigator`](?p=javascript/navigator)
- [`sage:performance`](?p=javascript/performance)
- [`sage:crypto`](?p=javascript/crypto)
- [`sage:uuid`](?p=javascript/uuid)
- [`sage:url`](?p=javascript/url)
- [`sage:core/dom`](?p=javascript/dom)
- [`sage:core/web`](?p=javascript/web)
- [`sage:fetch`](?p=javascript/fetch)

### Limits, environment, and files

The man page is also the authoritative short reference for:

- plugin load and event budgets
- memory and stack limits
- plugin-related environment variables
- plugin log paths
- plugin data directory locations

Read the fuller website breakdown in [JavaScript runtime](?p=javascript/runtime) and [Environment and files](?p=cli/environment-and-files).

## Best companion pages

- [JavaScript runtime](?p=javascript/runtime)
- [Module index](?p=javascript/module-index)
- [`sage:fs`](?p=javascript/fs)
- [`sage:process`](?p=javascript/process)
- [`sage:fetch`](?p=javascript/fetch)

## Upstream source

- [`man/sage-plugin-api.3`](https://github.com/oro-computer/sage/blob/master/man/sage-plugin-api.3)
