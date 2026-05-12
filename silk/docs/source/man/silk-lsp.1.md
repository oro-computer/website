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

Hover and completion include guided Markdown help for context-sensitive forms
such as `panic`, `await`, `yield`, `sizeof`, `#embed`, and `as raw`, including
the canonical string FFI pointer/byte-length pattern and compile-time file
embedding. Completion also suggests the valid `#embed` encoding strings
(`"utf8"`, `"utf16"`, `"u8"`, `"u16"`, and `"u32"`) in the optional second
argument; omitted encodings default to `"utf8"`.

Diagnostics carry stable compiler error codes when available. Parse diagnostics
publish `E0001`, and structured resolve/type-check diagnostics include
`silk error <code>` follow-up help in the diagnostic message/data so users can
open the same reference exposed by the CLI.

The LSP behavior and supported requests are documented at [lsp silk](?p=compiler/lsp-silk).

## Options

- `--nostd` — disable stdlib integration.
- `--std-root <path>` — override the stdlib root used for stdlib integration (also respects `SILK_STD_ROOT`).
- `--std <path>` — alias of `--std-root <path>`.
- `-h`, `--help` — print usage text.

## Environment

- `SILK_STD_ROOT` — default stdlib root (used when `--std-root` is not provided).

## See Also

- [`silk(1)`](?p=man/silk.1)
- [lsp silk](?p=compiler/lsp-silk)
