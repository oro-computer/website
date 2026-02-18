# Configuration reference

This page documents the most commonly used `oro.toml` sections and keys.

For the full set of keys the CLI knows how to list and describe, use:

```bash
oroc config --list
oroc config --describe build.copy_map
```

## Common keys

| TOML key | Default | What it does |
| - | - | - |
| `meta.bundle_identifier` | (required) | Reverse-DNS identifier (used by platforms and for runtime origin). |
| `meta.title` | — | Human-readable app title used in OS metadata and window chrome. |
| `meta.version` | `1.0.0` | Semantic version string for the application bundle. |
| `meta.description` | — | Short description used in metadata and packaging. |
| `meta.lang` | `en-US` | Primary BCP-47 language tag. |
| `build.name` | (required) | Short name used for bundle names and packaging. |
| `build.output` | `build` | Output directory for build artifacts. |
| `build.copy_map` | — | Copy-map file that defines bundle inputs. |
| `build.script` | — | Script to run before the copy phase (common for web build steps). |
| `build.headless` | `false` | Start the application in headless mode (no visible window). |
| `build.allow_exec` | `false` | Allow external command execution during builds (Gradle, NDK, scripts). |
| `webview.default_index` | `/index.html` | Default index path for navigation. |
| `webview.allow_any_route` | `false` | SPA-style fallback: unmatched routes resolve to `default_index`. |
| `webview.watch` | `false` | Watch files in development (emits change events). |
| `webview.watch_reload` | `true` | Reload the page when a file change event is emitted. |
| `window.width` | `80%` | Default window width (percentage or pixels). |
| `window.height` | `80%` | Default window height (percentage or pixels). |
| `window.resizable` | `true` | Whether the main window is resizable (desktop). |
| `filesystem.sandbox_enabled` | `true` | Enable the filesystem sandbox (non-Apple platforms). |
| `filesystem.no_follow_symlinks` | `true` | Disallow following symlinks for resource paths. |

## Sections you’ll commonly see

- `[meta]` — app identity and versioning
- `[build]` — bundling, packaging, toolchain options
- `[webview]` — navigation, routing, service worker mode, dev watch/reload
- `[window]` — default window sizing and appearance
- `[permissions]` — runtime permission gates
- `[mcp]` — defaults for `oroc mcp` (host/port/token)
- `[ai]` — defaults for embedded AI features (when enabled)

## Permissions

The runtime’s permission gates live under `[permissions]`. Common examples:

- `permissions.allow_notifications` — system notifications
- `permissions.allow_geolocation` — location APIs
- `permissions.allow_clipboard` — clipboard read/write
- `permissions.allow_service_worker` — service worker APIs (set to `false` to disable)

Use `oroc config --list` to discover all available permission keys for your runtime build.

