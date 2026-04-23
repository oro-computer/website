# [`silk-lsp(1)`](?p=man/silk-lsp.1) — Language Server Protocol (LSP) Server

> NOTE: This is the Markdown source for the eventual man 1 page for `silk-lsp`. The roff-formatted manpage should be generated from this content.

## Name

`silk-lsp` — Language Server Protocol server for Silk.

## Synopsis

- `silk-lsp [--nostd] [--std-root <path>|--std <path>] [-h|--help]`

## Description

`silk-lsp` speaks the Language Server Protocol over stdin/stdout for editor integrations.

The server indexes open documents together with the nearest-package
`silk.toml` graph, manifest definition files, stdlib modules (when enabled),
and manifest-owned native C sources/headers used by `ext` declarations.

The currently advertised capability surface includes:

- diagnostics via `textDocument/publishDiagnostics`,
- `textDocument/hover`,
- `textDocument/definition`,
- `textDocument/references`,
- `textDocument/rename`,
- `textDocument/completion`,
- `textDocument/signatureHelp`,
- `textDocument/documentSymbol`,
- `textDocument/semanticTokens/full`,
- and `textDocument/inlayHint`.

The LSP behavior and supported requests are documented at [lsp silk](?p=compiler/lsp-silk).

## Options

- `--nostd` — disable stdlib integration.
- `--std-root <path>` — override the stdlib root used for stdlib integration (also respects `SILK_STD_ROOT`).
- `--std <path>` — alias of `--std-root <path>`.
- `-h`, `--help` — print usage text.

## Environment

| Variable | Details |
| --- | --- |
| `SILK_STD_ROOT` | default stdlib root (used when `--std-root` is not provided). |

## See Also

- [`silk(1)`](?p=man/silk.1)
- [lsp silk](?p=compiler/lsp-silk)
