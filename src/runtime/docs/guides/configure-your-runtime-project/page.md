---
layout: "docs"
description: "Keep shared build settings in oro.toml and local overrides in .ororc."
docsCollection: "runtime"
section: "guides"
order: 4
sourcePath: "guides/configure-your-runtime-project.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Configure your runtime project

Keep shared settings in `oro.toml` and local preferences in `.ororc`. For Field Notes, everyone builds the same files; your machine can write artifacts to a different directory.

## Choose the shared files

In `oro.toml`, use a [copy map](/runtime/docs/config/copy-map/) to select the bundle contents:

```toml
[build]
name = "field-notes"
copy_map = "copy-map.toml"
output = "build"
```

Keep the existing `[meta]` and other sections. [Project layout](/runtime/learn/project-layout/) creates the two-file map used here.

## Override the local output

Create `.ororc` beside `oro.toml`:

```ini
[settings.build]
output = "build-local"
```

Ignore `.ororc` and `build-local/` in version control. The `settings.` prefix selects project settings to override.

```bash
oroc print-build-dir .
```

Expect a path under `build-local`. Removing the override should restore `build`. [Formatted config dumps can omit RC overrides](/runtime/docs/cli/config/#notes), so check the command that uses the setting.

## Change another setting

Use the [configuration reference](/runtime/docs/config/reference/) for window defaults, permissions, and environment forwarding. [Configuration precedence](/runtime/docs/config/overview/) explains the full lookup order; [build and package](/runtime/docs/guides/build-and-package/) covers target-specific flags.
