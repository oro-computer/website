# Syntax and cache

`sage` can apply syntax highlighting to local paths and URL-backed content.

## Source and cache directories

By default:

- syntax sources live in `XDG_CONFIG_HOME/sage/syntax` (usually `~/.config/sage/syntax`)
- compiled syntax caches live in `XDG_CACHE_HOME/sage/syntax` (usually `~/.cache/sage/syntax`)

You can override cache lookup with:

```bash
SAGE_SYNTAX_CACHE_DIR=/path/to/cache sage README.md
```

## Build the cache

Compile user syntax sources:

```bash
sage --compile-cache
```

List compiled syntax keys:

```bash
sage --list-syntax
```

Verbose mode adds key-to-cache mappings on `stderr`:

```bash
sage --verbose --list-syntax
```

## Supported source formats

The syntax compiler accepts a subset of:

- `.sublime-syntax`
- `.tmLanguage`
- `.tmLanguage.json`
- `.cson`

## Syntax selection order

When syntax highlighting is enabled, `sage` chooses a syntax key in this order:

1. per-tab `:set syntax=...`
2. `.sagerc` `syntax_map`
3. compiled syntax index matches for the path, including first-line rules from syntax sources
4. a URL syntax hint, such as HTTP `Content-Type`

## URL-aware syntax selection

For URLs:

- query strings are ignored for syntax selection
- fragments are ignored for syntax selection
- if the path is not informative, `sage` may use `Content-Type`

The built-in `Content-Type` mapping covers:

| Content type family | Syntax key |
| --- | --- |
| `application/json`, `text/json`, `*+json` | `json` |
| `text/html`, `application/xhtml+xml` | `html` |
| `text/css` | `css` |
| JavaScript media types | `js` |
| TypeScript media types | `ts` |
| `application/xml`, `text/xml`, `*+xml` | `xml` |
| Markdown types | `md` |
| YAML types | `yaml` |
| `text/csv` | `csv` |

## Bundled caches

`sage` also supports bundled syntax caches in distributable layouts:

- build layout: `<root>/bin/sage` with `<root>/syntax/`
- installed layout: `<prefix>/bin/sage` with `<prefix>/share/sage/syntax/`

## Per-tab overrides

Force syntax:

```text
:set syntax=diff
:set syntax=json
```

Return to automatic selection:

```text
:set syntax=
:set syntax=auto
```

This is especially useful for stdin, because piped content does not receive automatic syntax highlighting.

