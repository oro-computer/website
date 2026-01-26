# coc.nvim Integration for Silk

This document describes the coc.nvim extension shipped in this repository under `coc/`.

The extension is a thin wrapper around `silk-lsp` and should stay aligned with the LSP capabilities documented in `docs/compiler/lsp-silk.md`.

## Location and Layout

- `coc/` contains the full coc.nvim extension.
- `coc/src/index.ts` wires `silk-lsp` into coc.nvim.
- `coc/src/snippets.json` provides a small set of Silk snippets.

## Requirements

- Neovim with `coc.nvim` (engine version `^0.0.80`).
- `silk-lsp` on your `PATH` or a configured absolute path.
- `filetype=silk` for `*.slk` and `*.silk` buffers (including `build.silk`; use the Vim plugin under `vim/` or your own filetype setup).

## Install (local, from this repo)

1. Build the language server:

   ```sh
   cd /path/to/silk/compiler
   zig build
   ```

2. Build the extension:

   ```sh
   cd /path/to/silk/compiler/coc
   npm install
   npm run build
   ```

3. Symlink into Coc’s extensions directory:

   ```sh
   mkdir -p ~/.config/coc/extensions/node_modules
   ln -s /path/to/silk/compiler/coc ~/.config/coc/extensions/node_modules/coc-silk
   ```

4. Restart Neovim.

## Configuration

Add settings to your `coc-settings.json`:

```json
{
  "silk.enabled": true,
  "silk.startUpMessage": true,
  "silk.path": "silk-lsp",
  "silk.args": [],
  "silk.env": {},
  "silk.stdRoot": "",
  "silk.noStd": false,
  "silk.filetypes": ["silk"],
  "silk.rootPatterns": [
    "build.silk",
    "silk.toml",
    "build.zig",
    "build.zig.zon",
    ".git"
  ],
  "silk.outputChannel": "Silk Language Server"
}
```

`silk.stdRoot` maps to `silk-lsp --std-root <path>` and `silk.noStd` maps to `silk-lsp --nostd`. You can also use `silk.args` or `silk.env.SILK_STD_ROOT` for custom setups.

## Commands

Use `:CocCommand` for server lifecycle management:

- `silk.start` — start the language server.
- `silk.stop` — stop the language server.
- `silk.restart` — restart the language server.

## Features

The extension exposes the capabilities currently implemented by `silk-lsp`:

- diagnostics from the Silk lexer, parser, and type checker,
- hover with approximate type hints for identifiers and struct fields,
- heuristic go-to-definition across the module set (functions, lets, structs, struct fields, and impl methods), including local `let` bindings and parameters,
- keyword/identifier completion with symbol-aware details and struct member suggestions,
- struct-literal field suggestions in `Type { ... }` expressions,
- signature help while typing function and method calls,
- top-level document symbols for `fn`, `let`, `struct`, `enum`, `error`, `interface`, `ext`, and `impl` declarations.

Reference: [LSP protocol and server](?p=compiler/lsp-silk).

## Notes and Troubleshooting

- If diagnostics are missing, check that `:set filetype?` reports `silk`.
- If `silk-lsp` cannot be found, set `silk.path` to the full path of your `silk-lsp` binary.
- Use `:CocList outputs` and open the `Silk Language Server` channel for logs.
