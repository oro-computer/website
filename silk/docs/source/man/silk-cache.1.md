# [`silk-cache(1)`](?p=man/silk-cache.1) — Inspect and Maintain the Managed Silk Cache

> NOTE: This is the Markdown source for the eventual man 1 page for `silk cache`. The roff-formatted manpage should be generated from this content.

## Name

`silk-cache` — inspect, prune, compact, and clear the managed `silk` cache.

## Synopsis

- `silk cache [--json] [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache path [--json] [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache list [--json] [--package <dir|manifest>] [--cache-dir <path>]`
- `silk cache inspect [--json] [--package <dir|manifest>] [--cache-dir <path>] [<entry>]`
- `silk cache prune [--json] [--package <dir|manifest>] [--cache-dir <path>] [--max-age <age>] [--max-size <bytes>] [--keep-recent <n>] [--dry-run]`
- `silk cache compact [--json] [--package <dir|manifest>] [--cache-dir <path>] [--max-age <age>] [--max-size <bytes>] [--keep-recent <n>] [--dry-run]`
- `silk cache clear [--json] [--package <dir|manifest>] [--cache-dir <path>] [--dry-run]`

## Description

`silk cache` is the user-facing maintenance surface for the compiler-managed
cache root.

The effective managed cache root is:

- `<work_root>/cache`
- with `<work_root>` defaulting to `.silk`
- and `SILK_WORK_DIR` overriding the work root when set

When the work root is relative and a package root is in scope, it is resolved
relative to that package root.

The command understands the current managed cache-entry types under the cache
root:

- CLI build-cache artifact entries under `build/<sha256-key>/`
- `std::build` generated-file blobs under `build/<fnv1a64>.blob`

Unknown/unmanaged files under the cache root are preserved by maintenance
commands.

## Commands

- `silk cache`
 - print a root summary (same as `silk cache inspect`)
- `silk cache path`
 - print the effective cache root path
- `silk cache list`
 - list recognized managed cache entries with type, size, recency, and health
- `silk cache inspect [<entry>]`
 - without `<entry>`, print cache-root summary and the active maintenance
 policy
 - with `<entry>`, print entry-specific detail
- `silk cache prune`
 - prune recognized managed cache entries using the active/default age and
 size policy
- `silk cache compact`
 - auto-heal recognized managed entries, remove stale broken managed residue,
 drop now-empty managed directories such as `build/`, and then apply
 pruning policy
- `silk cache clear`
 - remove recognized managed cache entries while preserving unknown/unmanaged
 files

## Options

- `--help`, `-h` — show command help and exit.
- `--json` — emit newline-terminated, schema-versioned cache data on stdout.
- `--package <dir|manifest>`, `--pkg <dir|manifest>` — resolve the cache root
 relative to the selected package root.
- `--cache-dir <path>` — operate on an explicit cache root path.
- `--dry-run` — print what would be removed without deleting anything.
- `--max-age <age>` — override the active/default prune age limit for
 `prune` or `compact`.
- `--max-size <bytes>` — override the active/default prune size cap for
 `prune` or `compact`.
- `--keep-recent <n>` — preserve at least `<n>` most-recently-used recognized
 managed cache entries during pruning.

## Safety Model

`silk cache` cleanup commands are intentionally conservative.

- `clear`, `prune`, and `compact` remove only recognized managed cache entries
 and stale broken managed residue.
- Unknown/unmanaged files under the cache root are preserved.
- `--dry-run` is available to preview cleanup decisions before removal.
- explicit mutation commands coordinate through an internal managed-cache lock,
 so they wait for in-flight `silk` cache operations instead of racing them.
- the internal lock file is hidden from normal cache listings and does not
 count as an unknown user-owned cache entry.

This allows cache maintenance without assuming the command owns every file under
the cache root.

## JSON Output

All cache JSON packets include `schemaVersion`, `command`, `mode`, and
`cacheRoot`.

- `path` adds `path`.
- `list` adds `present`, `buildRootPresent`, `summary`, and sorted `entries`.
- `inspect` adds root `summary` and `policy`, or one `entry` and `policy`.
- `prune`, `compact`, and `clear` add `dryRun`, `healedEntries`,
 `removedEntries`, and `reclaimedBytes`.

## Automatic Maintenance

Normal `silk build` use includes built-in managed cache maintenance.

Default policy:

- auto-heal enabled
- auto-prune enabled
- maximum size `2 GiB`
- maximum age `30d`
- preserve at least `64` recent recognized managed entries

Automatic maintenance uses the same managed-cache lock but only attempts to
take it non-blockingly. If another `silk` process is already using the managed
cache, the automatic maintenance pass is skipped for that build.

Environment overrides:

- `SILK_CACHE_AUTO_HEAL`
- `SILK_CACHE_AUTO_PRUNE`
- `SILK_CACHE_MAX_BYTES`
- `SILK_CACHE_MAX_AGE`
- `SILK_CACHE_KEEP_RECENT`

`SILK_CACHE_MAX_BYTES` accepts raw bytes or `K` / `M` / `G` / `T` suffixes.
`SILK_CACHE_MAX_AGE` accepts `s`, `m`, `h`, `d`, or `w`. Setting either value
to `0` disables that pruning dimension.

## Examples

```sh
# Show the effective cache root and current summary.
silk cache

# Print only the resolved cache path.
silk cache path

# List recognized managed cache entries.
silk cache list

# List recognized entries as JSON.
silk cache list --json

# Inspect one build-cache entry or one std::build blob.
silk cache inspect build/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
silk cache inspect build/0123456789abcdef.blob

# Preview policy-based pruning.
silk cache prune --dry-run

# Keep only recent entries under a tighter temporary cap.
silk cache prune --max-size 512M --keep-recent 16

# Heal metadata / reclaim stale managed space without touching unknown files.
silk cache compact --dry-run

# Clear recognized managed cache entries for the nearest package.
silk cache clear
```

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-build(1)`](?p=man/silk-build.1)
- [`silk-env(1)`](?p=man/silk-env.1)
- [`silk(7)`](?p=man/silk.7)
