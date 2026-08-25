# [`silk-guide(1)`](?p=man/silk-guide.1) — Search Curated Silk Example Guides

> NOTE: This is the Markdown source for the eventual man 1 page for `silk guide`. The roff-formatted manpage should be generated from this content.

## Name

`silk-guide` — search curated example guides and show runnable Silk patterns.

## Synopsis

- `silk guide [options] <query>`
- `silk guide --show <id>`
- `silk guide --show <id-or-prefix>`
- `silk guide --list`

## Description

`silk guide` queries an installed SQLite guide database generated from the
curated catalog at `examples/guide/catalog.json`. The seeded corpus is kept
at a floor of `1000` entries and combines runnable examples with
documentation-backed reference guides for every canonical language and
standard-library page.

Each guide entry contains:

- a stable guide id,
- a title and short summary,
- the stored Silk example or reference source,
- aliases,
- tags,
- platforms,
- std module references,
- environment/runtime requirements,
- linked documentation references,
- optional diagnostic-code links,
- generated public std symbol lookup terms,
- related guide ids,
- and verification flags.

## Query Modes

- Free text:
 - `silk guide read file`
 - `silk guide tcp loopback`
 - `silk guide http request`
 - `silk guide mime content type`
 - `silk guide atomic counter`
 - `silk guide protobuf schema roundtrip`
- Exact tag filter:
 - `silk guide tags:concurrency`
- Exact std-module filter:
 - `silk guide module:std::task`
 - `silk guide std::task`
 - `silk guide module:std::mime`
- Exact public std symbol lookup:
 - `silk guide std::http::request`
 - `silk guide std::mime::content_type_with`
 - `silk guide std::atomic::AtomicU64.fetch_add`
 - `silk guide std::dylib::open_self`
 - `silk guide ByteSlice.find_bytes`
 - `silk guide std::protobuf::Reader.read_key`
 - `silk guide GL_TEXTURE_2D`
- Documentation-backed references:
 - `silk guide tags:reference-guide`
 - `silk guide language types`
 - `silk guide language atomics`
 - `silk guide std io overview`
- Exact diagnostic-code filter:
 - `silk guide diag:E2034`
 - `silk guide E2034`
- Exact guide id:
 - `silk guide fs/file-roundtrip`
 - `silk guide --show fs/file-roundtrip`
- Guide-id prefix expansion for show:
 - `silk guide --show fs`
 - `silk guide --show task`
- Exact alias match:
 - `silk guide read file`
 - `silk guide tcp server`

## Options

- `--help`, `-h` — show command help and exit.
- `--list` — list seeded guide ids and titles.
- `--show <id>` — print one full guide entry including stored source.
- `--printer <cmd>` — override the source printer used by `--show` (flag first, then `SILK_GUIDE_PRINTER`, then `bat`, then `cat`).
- `--json` — emit structured JSON for search or show output.
- `--limit <n>` — limit list/search results (default: `8`).
- `--db <path>` — override the guide database path.

## Database Resolution

By default, `silk guide` looks for:

- `SILK_GUIDE_DB` when set,
- `SILK_GUIDE_PRINTER` when set and `--printer` is not provided for `--show`,
- otherwise `../share/silk/guide.db` relative to the `silk` executable,
- otherwise the staged development path under `build/share/silk/guide.db` when available.

## Notes

- Exact tag/module/diagnostic/alias lookups use normalized SQLite metadata tables.
- Exact public std symbol lookups use generated metadata from shipped `std/**/*.slk` modules and route to the matching API guide.
- `--show` accepts exact ids and id-prefixes; a prefix like `fs` may render
 multiple `fs/...` guides. Prefix output collapses generated variants that
 share the same source body and prefers the canonical overview entry.
- Free-text queries use a bundled SQLite FTS5 index over guide titles,
 summaries, stored Silk source, aliases, keywords, tags, modules,
 requirements, docs, and diagnostics.
- Common filler words are ignored and an intent-routing pass runs before
 FTS search, so natural queries like `how to read a file`,
 `how can i open a file and read it`, `read from stdin`, or
 `how do i make a http request` still resolve.
- Non-empty searches that still miss after alias/FTS routing report no matches
 instead of printing the alphabetical `--list` output.
- Text search results print an explicit `matched:` reason so users can see why
 an example was returned.
- Text search results do not print a `source:` metadata line.
- `--json` emits structured arrays for aliases/tags/platforms/modules/
 requirements/docs/diagnostics/keywords instead of flattening them into
 presentation strings.
- Guide show text does not include `Run:`, `Source:`, or `Verified:` summary
 fields.
- Guide `Docs:` references are rendered as canonical docs URLs.
- Guide source is printed via the configured printer path (or direct source
 fallback) rather than fenced code blocks.
- `--show` prints action-first metadata in this order:
 `What`, `Why`, `Docs`, and the remaining environment/search details, followed
 by the stored Silk source.
- Seeded guide sources are verification-backed by the repo test suite:
 every distinct source path is checked, fixture-backed entries remain
 promoted to `verified_build`, entries are built when
 `verified_build = true`, and they run under a bounded timeout when
 `verified_run = true`.
- The repo test suite also verifies that every canonical language and
 standard-library documentation page is referenced by at least one guide entry, and that
 every shipped std `export` declaration and public method (`public fn` or
 `public async fn`) has generated symbol lookup metadata.
- High-traffic diagnostics may point directly at guide lookups such as
 `silk guide E2030` or `silk guide E2034`.

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-error(1)`](?p=man/silk-error.1)
- [`silk-man(1)`](?p=man/silk-man.1)
- [`silk-doc(1)`](?p=man/silk-doc.1)
