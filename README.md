# Oro Website

This directory contains the static website for Oro Computer, including landing pages and documentation for:

- **Oro Runtime** (`website/runtime/`)
- **Silk** (`website/silk/`)

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

## Shared docs viewer

Both Runtime and Silk use the shared docs viewer:

- `website/assets/docs-viewer.js`

