# Oro Website

This directory contains the static website for Oro Computer, including landing pages and documentation for:

- **Oro Runtime** (`website/runtime/`)
- **Silk** (`website/silk/`)
- **slg** (`website/slg/`)

## Runtime docs

Runtime docs use the same docs viewer UX as Silk docs (sidebar, search, prev/next, deep links).

- Viewer: `website/runtime/docs/index.html`
- Markdown sources: `website/runtime/docs/source/`
- Generated indexes:
  - `website/runtime/docs/index.json`
  - `website/runtime/docs/search.json`
- LLM pack: `website/runtime/llms.txt`

Rebuild generated files after changing sources:

```bash
python3 website/runtime/tools/build-indexes.py
python3 website/runtime/tools/build-llms-txt.py
```

## Silk docs

- Docs viewer: `website/silk/docs/index.html`
- Wiki viewer: `website/silk/wiki/index.html`
- Generators live in `website/silk/tools/`.

Rebuild generated files:

```bash
python3 website/silk/tools/build-indexes.py
python3 website/silk/tools/build-llms-txt.py
```

To refresh the website copy from the sibling Silk compiler checkout:

```bash
python3 website/silk/tools/sync-from-silk-docs.py
```

## slg docs

- Docs viewer: `website/slg/docs/index.html`
- Markdown sources: `website/slg/docs/source/`

Rebuild generated files:

```bash
python3 website/slg/tools/build-indexes.py
python3 website/slg/tools/build-llms-txt.py
```

## Shared docs viewer

Runtime, Silk, and slg use the shared docs viewer:

- `website/assets/docs-viewer.js`
