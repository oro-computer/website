# `silk guide`

`silk guide` is the curated example discovery surface for common Silk tasks.

The seeded corpus is maintained at a floor of `1000` guide entries. It combines runnable examples with documentation-backed reference guides that cover every canonical language and standard-library page.
Fixture-backed guide entries are promoted to build-verified status when they
compile cleanly; any remaining backend-limited exceptions are tracked
explicitly in the catalog and test suite.

It is intended to answer questions such as:

- how do I read a file?
- how do I wait on a task?
- how do I use `std::task`?
- which example explains a specific diagnostic?
- where is a public std symbol documented?

## Installed corpus

`silk guide` reads the bundled SQLite guide database shipped with the toolchain. Use `--db <path>` or `SILK_GUIDE_DB` when you need to point at an alternate database during staging, testing, or packaging.

Each guide entry carries:

- a stable guide id
- title and summary
- the example or reference source body
- aliases
- tags
- platforms
- std module references
- environment/runtime requirements
- linked documentation references
- related guide ids
- optional diagnostic-code links
- generated public std symbol lookup terms
- verification flags (`verified_build` / `verified_run`)

## Query Forms

Free-text search:

```sh
silk guide monotonic sleep
silk guide channel send receive
silk guide http request
```

Exact metadata filters:

```sh
silk guide tags:concurrency
silk guide module:std::task
silk guide tags:reference-guide
silk guide language types
silk guide std io overview
silk guide std::http::request
silk guide ByteSlice.find_bytes
silk guide GL_TEXTURE_2D
silk guide diag:E2034
silk guide E2034
```

Exact alias matches are preferred before free-text FTS search:

```sh
silk guide read file
silk guide tcp server
```

Exact guide id:

```sh
silk guide fs/file-roundtrip
silk guide --show fs/file-roundtrip
```

List seeded guides:

```sh
silk guide --list
```

Machine-readable output:

```sh
silk guide --json read file
silk guide --json --show fs/file-roundtrip
```

## Overrides

Use an explicit database path when testing or staging:

```sh
silk guide --db /tmp/guide.db read file
```

Or set:

```sh
SILK_GUIDE_DB=/tmp/guide.db
```

## Behavior

- exact tag/module/diagnostic queries use normalized SQLite metadata tables
- exact public std symbol queries use generated metadata from shipped `std/**/*.slk` modules
- exact alias matches are resolved before free-text FTS search
- natural-language guide queries now go through a deterministic intent-routing
 pass before FTS search, so task phrasing like `how to read a file`,
 `how can i open a file and read it`, or `how do i make a http request`
 resolves to curated task guides, while `read from stdin` resolves to the
 stdin echo guide
- free-text search uses a bundled SQLite FTS5 index over guide titles,
 summaries, source bodies, aliases, keywords, tags, modules, requirements,
 docs, and linked diagnostics
- text search results print an explicit `matched:` reason
- non-empty searches that do not match report an error instead of printing the
 alphabetical `--list` results
- exact guide ids render the full guide entry and example or reference source
- guide text output does not print `Run:`, `Source:`, or `Verified:` summary fields
- guide `Docs:` references are rendered as canonical docs URLs such as
 [types](?p=language/types)
- guide source is printed through the configured printer path (or direct source
 fallback), not wrapped in fenced code blocks
- `--json` emits structured search/show payloads for tools and agents:
 - list-valued metadata is emitted as JSON arrays, not comma-joined strings
- guide catalog verification is test-backed:
 - every distinct guide source path is checked,
 - fixture-backed seeded entries stay promoted to `verified_build`,
 - `verified_build` entries are built,
 - `verified_run` entries are run under a bounded verifier timeout,
 - every canonical language and standard-library page is covered by at least one guide entry,
 - every shipped std `export` declaration and public method (`public fn` or `public async fn`) has generated symbol lookup metadata
- high-traffic diagnostics may point directly at guide queries such as:
 - `silk guide E2030`
 - `silk guide E2034`
