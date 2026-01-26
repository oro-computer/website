# `silk-lsp` (1) — Language Server Protocol (LSP) Server

> NOTE: This is the Markdown source for the eventual man 1 page for `silk-lsp`. The roff-formatted manpage should be generated from this content.

## Name

`silk-lsp` — Language Server Protocol server for Silk.

## Synopsis

- `silk-lsp [--nostd] [--std-root <path>]`

## Description

`silk-lsp` speaks the Language Server Protocol over stdin/stdout for editor integrations.

The LSP behavior and supported requests are documented in `docs/compiler/lsp-silk.md`.

## Options

- `--nostd` — disable stdlib integration.
- `--std-root <path>` — override the stdlib root used for stdlib integration (also respects `SILK_STD_ROOT`).

## Environment

- `SILK_STD_ROOT` — default stdlib root (used when `--std-root` is not provided).

## See Also

- `silk` (1)
- `docs/compiler/lsp-silk.md`
