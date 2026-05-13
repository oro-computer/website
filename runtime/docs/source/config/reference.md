# Configuration reference

This page documents the most commonly used `oro.toml` sections and keys.

For the full set of keys the CLI knows how to list and describe, use:

```bash
oroc config --list
oroc config --describe build.copy_map
```

## High-traffic keys

| TOML key | Default | What it does |
| - | - | - |
| `meta.bundle_identifier` | (required) | Reverse-DNS identifier (used by platforms and for runtime origin). |
| `meta.title` | — | Human-readable app title used in OS metadata and window chrome. |
| `meta.version` | `1.0.0` | Semantic version string for the application bundle. |
| `meta.description` | — | Short description used in metadata and packaging. |
| `meta.lang` | `en-US` | Primary BCP-47 language tag. |
| `build.name` | (required) | Short name used for bundle names and packaging. |
| `build.output` | `build` | Output directory for build artifacts. |
| `build.copy` | — | Inline directory/file pattern copied into the build output. |
| `build.copy_map` | — | Copy-map file that defines bundle inputs. |
| `build.env` | — | Space-separated environment variable names forwarded into the runtime. |
| `build.script` | — | Script to run before the copy phase (common for web build steps). |
| `build.script_after` | — | Script to run after the build lifecycle completes. |
| `build.extensions.<name>` | — | Native extension source file or directory to build into the app bundle. |
| `build.extensions.<name>.source` | — | Directory-style extension source declaration for multi-file extensions. |
| `build.extensions_abi_strict` | `true` | Require native extensions to match the runtime extension ABI. |
| `build.headless` | `false` | Start the application in headless mode (no visible window). |
| `build.allow_exec` | `false` | Allow external command execution during builds (Gradle, NDK, scripts). |
| `webview.root` | — | Root path under the app origin used as the default navigation base. |
| `webview.default_index` | `/index.html` | Default index path for navigation. |
| `webview.allow_any_route` | `false` | SPA-style fallback: unmatched routes resolve to `default_index`. |
| `webview.url_protocols` | — | Space-separated protocol schemes treated as WebView-safe origins. |
| `webview.protocol-handlers` | — | Space-separated protocol handler schemes registered for URL and fetch routing. |
| `webview.protocol-handlers.<scheme>` | — | Service-worker script path to auto-register for a custom protocol handler scheme. |
| `webview.watch` | `false` | Watch files in development (emits change events). |
| `webview.watch_reload` | `true` | Reload the page when a file change event is emitted. |
| `window.width` | `80%` | Default window width (percentage or pixels). |
| `window.height` | `80%` | Default window height (percentage or pixels). |
| `window.resizable` | `true` | Whether the main window is resizable (desktop). |
| `filesystem.sandbox_enabled` | `true` | Enable the filesystem sandbox (non-Apple platforms). |
| `filesystem.no_follow_symlinks` | `true` | Disallow following symlinks for resource paths. |
| `extensions.allowed_roots` | — | Space-separated absolute directories allowed for native extension loading. |

## Sections you’ll commonly see

- `[meta]` — app identity and versioning
- `[build]` — bundling, packaging, toolchain options
- `[webview]` — navigation, routing, service worker mode, dev watch/reload
- `[window]` — default window sizing and appearance
- `[permissions]` — runtime permission gates
- `[mcp]` — defaults for `oroc mcp` (host/port/token)
- `[ai]` — defaults for embedded AI features (when enabled)

## Exhaustive inspection from the CLI

The runtime’s configuration registry is broader than this summary page. Use the CLI when you need the exact live key set:

```bash
oroc config --list
oroc config --describe webview.root
oroc config --describe build.env
```

This is the fastest way to confirm platform-specific keys, defaults, and any keys added by newer runtime builds.

## Permissions

The runtime’s permission gates live under `[permissions]`. Common examples:

- `permissions.allow_notifications` — system notifications
- `permissions.allow_geolocation` — location APIs
- `permissions.allow_clipboard` — clipboard read/write
- `permissions.allow_service_worker` — service worker APIs (set to `false` to disable)

Use `oroc config --list` to discover all available permission keys for your runtime build.
