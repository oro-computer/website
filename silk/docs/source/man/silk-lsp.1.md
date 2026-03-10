# `silk-lsp` (1) — Language Server Protocol (LSP) Server

> NOTE: This is the Markdown source for the eventual man 1 page for `silk-lsp`. The roff-formatted manpage should be generated from this content.

## Name

`silk-lsp` — Language Server Protocol server for Silk.

## Synopsis

- `silk-lsp [--nostd] [--std-root <path>]`

## Description

`silk-lsp` speaks the Language Server Protocol over stdin/stdout for editor integrations.

The LSP behavior and supported requests are documented at [LSP and editor integration](?p=compiler/lsp-silk).

## Options

- `--nostd` — disable stdlib integration.
- `--std-root <path>` — override the stdlib root used for stdlib integration (also respects `SILK_STD_ROOT`).

## Environment

- `SILK_STD_ROOT` — default stdlib root (used when `--std-root` is not provided).

## Examples

Start the server with the default stdlib root:

```sh
silk-lsp
```

Start the server with an explicit stdlib root:

```sh
silk-lsp --std-root /opt/oro/silk/std
```

Minimal editor command configuration:

```json
{
  "command": ["silk-lsp"],
  "filetypes": ["silk"]
}
```

## See Also

- [`silk` (1)](?p=man/silk.1)
- [LSP and editor integration](?p=compiler/lsp-silk)
