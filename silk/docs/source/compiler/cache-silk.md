# `silk` Cache Management

This document describes the managed cache model used by the `silk` toolchain
and the `silk cache` command surface for inspecting and maintaining that cache.

## Scope

`silk cache` is the user-facing management surface for the compiler-managed
cache root:

- default cache root: `<work_root>/cache`
- default work root: `.silk`
- work-root override: `SILK_WORK_DIR`

When the effective work root is relative and a package root is in scope,
`silk` resolves it relative to that package root. Otherwise it is resolved
relative to the current working directory.

Examples:

- default package-local cache root: `<package_root>/.silk/cache`
- explicit work-root override: `SILK_WORK_DIR=/tmp/silk-work` gives
 `/tmp/silk-work/cache`

The cache command manages only the recognized cache entries under that cache
root. It does not treat other work-root data such as `repl_history`, `man`
scratch files, `z3` debug dumps, or general temporary files outside the cache
root as cache entries.

## Managed Entry Types

Today the managed cache root primarily contains the `build/` subtree, which may
contain more than one entry format.

### CLI Build-Artifact Entries

The CLI build cache stores completed build outputs under:

- `<cache_root>/build/<sha256-key>/artifact`
- optional generated header:
 `<cache_root>/build/<sha256-key>/header`
- metadata:
 `<cache_root>/build/<sha256-key>/meta.txt`

These entries are created by `silk build` when the build inputs are fully
cacheable. The cache key covers the relevant build inputs and options, including
Silk sources, native inputs, linker-affecting settings, toolchain identity, and
selected stdlib overrides.

Managed build-cache updates are coordinated through an internal advisory lock
file under the cache root. Cache hits, cache repopulation, and explicit cache
maintenance commands all use that lock so `silk` does not delete or rewrite a
live managed entry in place while another `silk` process is reading or pruning
the same cache root.

### `std::build` Blob Entries

`std::build` uses a content-addressed generated-file cache for cached
`write_file(...)` steps under:

- `<cache_root>/build/<fnv1a64>.blob`

These blobs are managed cache entries too and are visible through
`silk cache list`, `silk cache inspect`, `silk cache prune`, and
`silk cache compact`.

### Unknown / Unmanaged Files

The cache root may also contain:

- files written by future toolchain versions,
- files written by humans/tools during debugging,
- or partially written data that does not match a recognized managed entry.

`silk cache` treats those paths conservatively:

- they are reported as unknown/unmanaged when relevant,
- they are not deleted by `clear`, `prune`, or `compact`,
- and they do not count as recognized cache entries for pruning policy.

This conservative rule is deliberate: the tool should help users clean the
managed cache safely without assuming ownership of arbitrary files under the
cache root.

## Entry Health Model

Recognized managed entries are classified as:

- `healthy`:
 - the entry shape matches the current contract and the required files are
 present.
- `healable`:
 - the entry is recognizable and usable, but metadata is missing or still in a
 legacy/minimal form that `silk` can repair automatically.
- `broken`:
 - the entry is recognizable as a managed cache entry, but required files are
 missing or the layout is incomplete.
- `unknown`:
 - the path is not recognized as a current managed cache entry and is preserved
 by maintenance commands.

`silk cache inspect` reports these states so users can decide whether to keep,
prune, or compact the cache.

## Automatic Maintenance

The toolchain includes built-in cache maintenance during normal `silk build`
use.

### Auto-Heal

Auto-heal is enabled by default.

It may:

- create the managed cache directories when needed,
- refresh per-entry metadata on cache hits,
- repair missing/minimal metadata for recognized build-cache entries,
- preserve observed entry recency when healing missing metadata instead of
 fabricating a fresh `last_used` timestamp for old entries,
- and clean up stale partial managed entries that no longer represent valid
 cache data.

Auto-heal never deletes unknown/unmanaged files.

Auto-heal and auto-prune try to acquire the managed cache lock without waiting.
If another `silk` process is already mutating or reading the managed cache, the
automatic maintenance pass is skipped for that build rather than blocking it or
guessing around concurrent cache state.

Environment:

- `SILK_CACHE_AUTO_HEAL`
 - default: enabled
 - set to `0`, `false`, `off`, or `no` to disable

### Auto-Prune

Auto-prune is enabled by default for recognized managed entries.

The default policy is:

- maximum cache size: `2 GiB`
- maximum cache age: `30d`
- minimum entries to preserve by recency: `64`

When the cache exceeds the configured size cap, `silk` prunes the oldest
recognized managed entries first, while still preserving the configured
`keep_recent` window. When age pruning is enabled, entries older than the age
limit are eligible for removal even when the cache is not over the size cap.

Environment:

- `SILK_CACHE_AUTO_PRUNE`
 - default: enabled
 - set to `0`, `false`, `off`, or `no` to disable
- `SILK_CACHE_MAX_BYTES`
 - default: `2147483648` (`2 GiB`)
 - accepts raw bytes or `K` / `M` / `G` / `T` suffixes
 - `0` disables size-based pruning
- `SILK_CACHE_MAX_AGE`
 - default: `30d`
 - accepts `s`, `m`, `h`, `d`, or `w` suffixes
 - `0` disables age-based pruning
- `SILK_CACHE_KEEP_RECENT`
 - default: `64`
 - preserves at least this many most-recently-used recognized managed entries
 during pruning

## `silk cache` Command Model

`silk cache` is the primary CLI entrypoint for inspection and maintenance.

### Root Selection

The command resolves one cache root in this order:

1. `--cache-dir <path>` when provided
2. otherwise the effective `<work_root>/cache` computed from:
 - `--package <dir|manifest>` when provided,
 - otherwise the nearest package root from the current directory when one is
 available,
 - otherwise the current directory

### Commands

- `silk cache`
 - print a root-level summary (same as `silk cache inspect`)
- `silk cache path`
 - print the effective cache root path
- `silk cache list`
 - list recognized managed cache entries with type, size, recency, and health
- `silk cache inspect [<entry>]`
 - without `<entry>`, print cache-root summary and active policy
 - with `<entry>`, print entry-specific details
- `silk cache prune`
 - prune recognized managed entries according to the active/default policy
 - accepts explicit `--max-age`, `--max-size`, and `--keep-recent` overrides
- `silk cache compact`
 - auto-heal recognized entries, remove stale broken managed data, drop
 now-empty managed directories such as `build/`, and then apply pruning
 policy
 - accepts the same `--max-age`, `--max-size`, and `--keep-recent` overrides
 as `prune`
- `silk cache clear`
 - remove recognized managed cache entries under the selected cache root
 - unknown/unmanaged files are preserved

### Common Options

- `--package <dir|manifest>`, `--pkg <dir|manifest>`
 - resolve the cache root relative to the selected package root
- `--json`
 - emit newline-terminated, schema-versioned cache data for
 `path`, `list`, `inspect`, `prune`, `compact`, or `clear`
- `--cache-dir <path>`
 - operate on an explicit cache root path
- `--dry-run`
 - show what would be removed without deleting anything
- `--max-age <age>`
 - override the active/default age limit for `prune` or `compact`
- `--max-size <bytes>`
 - override the active/default size limit for `prune` or `compact`
- `--keep-recent <n>`
 - preserve at least `<n>` most-recently-used recognized managed entries

## Safety Model

The cache-management commands are intentionally conservative.

- `clear`, `prune`, and `compact` only remove recognized managed cache entries
 or stale broken managed residue.
- Unknown/unmanaged files are preserved.
- `--dry-run` is available for previewing cleanup decisions before removal.
- explicit mutation commands coordinate through the same managed cache lock used
 by normal builds, so `silk cache prune`, `silk cache compact`, and
 `silk cache clear` wait until an in-flight managed cache operation finishes
 instead of racing it.
- the internal lock file is intentionally hidden from `silk cache list` /
 `inspect` output and does not count as an unknown user-owned file.

This means users can clean the compiler-managed cache without the command
assuming it owns every file under the cache root.

## Operator Guidance

Recommended workflow:

1. run `silk cache` to see the current root, size, health, and policy,
2. run `silk cache list` when you need entry-level detail,
3. run `silk cache prune --dry-run` to preview policy-based cleanup,
4. run `silk cache compact --dry-run` when the cache looks unhealthy,
5. run `silk cache clear` only when you want to discard all recognized managed
 cache entries and rebuild from scratch.

Use `path` when you need to inspect the cache manually in a shell or attach the
path to a bug report.

Use `--json` when a script, editor, CI job, or agent needs structured cache
facts. Mutation commands keep the same side effects and exit codes; JSON reports
the result with `dryRun`, `healedEntries`, `removedEntries`, and
`reclaimedBytes`.
