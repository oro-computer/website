---
layout: "silk-docs"
title: "TextMate Grammar (tmLanguage)"
description: "The Silk compiler repository ships a TextMate grammar for Silk under textmate/silk.tmLanguage.json. It provides syntax highlighting for editors that consume tmLanguage grammars (TextMate, VS Code, Sub"
docsCollection: "silk"
section: "usage"
order: 252
sourcePath: "usage/editor-textmate.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# TextMate Grammar (tmLanguage)

The Silk compiler repository ships a TextMate grammar for Silk under `textmate/silk.tmLanguage.json`. It provides syntax
highlighting for editors that consume tmLanguage grammars (TextMate, VS Code, Sublime Text, Nova, and others).

## Scope and File Extension

- Scope: `source.silk`
- File extensions: `.slk` and `.silk` (including build modules like `build.slk`)

## TextMate (macOS)

1. Copy `textmate/silk.tmLanguage.json` to:
 - `~/Library/Application Support/TextMate/Bundles/Silk.tmbundle/Syntaxes/silk.tmLanguage.json`
2. Restart TextMate.
3. Open an `.slk` (or `.silk`) file and confirm it is recognized as `Silk`.

Example setup:

```sh
mkdir -p ~/Library/Application\ Support/TextMate/Bundles/Silk.tmbundle/Syntaxes
cp textmate/silk.tmLanguage.json \
  ~/Library/Application\ Support/TextMate/Bundles/Silk.tmbundle/Syntaxes/silk.tmLanguage.json
```

## VS Code

A grammar-only VS Code extension is included under `textmate/vscode/`. To try it, open that directory in VS Code and press `F5` to launch an Extension Development Host.

Minimal local workflow:

```sh
cd textmate/vscode
code .
```

For LSP-backed features (diagnostics, hover, go-to-definition), use the `silk-lsp` language server with an appropriate
client (see [LSP protocol and server](/silk/docs/compiler/lsp-silk/) and [Vim integration](/silk/docs/usage/editor-vim/)).
