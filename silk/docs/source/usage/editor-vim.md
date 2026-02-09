# Vim Integration for Silk

This document describes the built-in Vim support for Silk shipped with the Silk compiler repository.

The goal of the Vim plugin is to provide a lightweight, spec-aligned editing experience that:

- recognizes Silk source files by extension,
- highlights the core language constructs described in `docs/language/`,
- respects the Silk repository’s indentation and comment style guidelines.

## Files and Layout

The Vim plugin lives under the top-level `vim/` directory:

- `vim/plugin/silk.vim` – plugin entrypoint (sources the ftdetect script even if `:filetype on` is not enabled).
- `vim/ftdetect/silk.vim` – filetype detection for Silk source files.
- `vim/syntax/silk.vim` – core syntax highlighting rules for Silk.
- `vim/ftplugin/silk.vim` – filetype-specific editor defaults for Silk buffers.
- `vim/indent/silk.vim` – indentation rules for Silk buffers.

These files follow Vim’s standard runtime layout and can be copied into a user’s `~/.vim` (or Neovim) configuration or
used directly from the Silk repository via the `runtimepath`.

## Filetype Detection

- Silk source files use the `.slk` extension (as shown in `docs/usage/cli-examples.md`).
- Build scripts use `build.silk` (see `docs/compiler/build-scripts.md`).
- The plugin defines `filetype=silk` for `*.slk` and `*.silk` buffers (including `build.silk`).

## Syntax Highlighting

The `vim/syntax/silk.vim` file is derived from:

- the lexical and grammar documentation in `docs/language/grammar.md`,
- the operator set in `docs/language/operators.md`,
- the literals, types, flow-control, optional/mutability, concurrency, FFI, and verification docs under `docs/language/`,
- the current token and keyword tables in `src/token.zig`.

It currently highlights:

- lexer keywords (as currently implemented by the keyword table in `src/token.zig`): `package`, `module`, `import`, `from`, `export`, `public`, `private`, `default`, `const`, `let`, `var`, `mut`, `fn`, `test`, `theory`, `struct`, `enum`, `type`, `error`, `interface`, `impl`, `as`, `raw`, `extends`, `if`, `else`, `loop`, `while`, `for`, `in`, `match`, `return`, `panic`, `break`, `continue`, `assert`, `await`, `yield`, `pure`, `async`, `task`, `region`, `with`, `new`, `sizeof`, `ext`, `None`/`none`/`null`, `Some`, `true`/`false`;
- spec-reserved / design-in-progress keywords used in `docs/language/` examples: `where`;
- testing and assertion keywords: `test`, `assert`;
- builtin types and type-like names: `bool`, integer and float types (`u8`, `i8`, …, `u64`, `i64`, `int`, `f32`, `f64`), `char`, `string`, `void`, `Instant`, `Duration`, `Task`, `Promise`, `map`, `Option`, `Buffer`, and other core names drawn from the spec;
- literal forms: boolean literals (`true`, `false`), `None`/`Some`, numeric literals (decimal integers and floats) and duration literals with unit suffixes (e.g. `10ns`, `250us`, `5ms`, `2s`, `5min`, `1h`, `7d`), character and string literals;
- compiler/runtime intrinsics: identifiers matching `__silk_*` (internal ABI surface);
- special method names: `constructor` and `drop` (both have language-defined meaning in the current compiler subset);
- well-known package prefixes such as `std::`, so that standard library imports and qualified names stand out from ordinary identifiers;
- operators and punctuation, including `++`, `--`, `?.`, `??`, `::`, `..`, `..=`, `...`, `->`, `=>` as described in `docs/language/operators.md`;
- Formal Silk annotations: `#const`, `#require`, `#assure`, `#assert`, `#invariant`, `#variant`, `#monovariant`, `#theory` (including whitespace forms like `#  require`) are treated as preprocessor-style constructs;
- doc comments: `///` and `/** ... */`, including common doc tags like `@param` / `@returns` / `@throws` / `@example` / `@since` / `@deprecated` / `@remarks` / `@see` (see `docs/language/doc-comments.md`);
- comments: both `//` line comments and `/* ... */` block comments (excluding doc-comment forms), consistent with the current lexer behavior in `src/lexer.zig`.

As the language evolves (new keywords, operators, or constructs), both this document and `vim/syntax/silk.vim` must be updated in lockstep with `docs/language/` and `src/token.zig`.

## Editor Defaults

The `vim/ftplugin/silk.vim` file configures:

- indentation defaults:
  - by default, Silk buffers inherit your Vim tab settings,
  - if Vim is using its built-in defaults (`tabstop=8`, `shiftwidth=8`, `softtabstop=0`, `noexpandtab`), Silk buffers will use the repository’s preferred indentation (2 spaces with `expandtab`),
  - override via `g:silk_indent_style` (`'auto'`, `'inherit'`, `'repo'`),
- a line comment style of `//` via `commentstring=// %s`,
- C-style block comment metadata via `'comments'` / `'formatoptions'` so that
  doc-style comments like:

  ```silk
  /**
   * This is a comment
   */
  ```

  are indented and continued automatically when you press `<CR>` on a comment
  line (mirroring typical C-style comment editing behavior in Vim).

The `vim/indent/silk.vim` file provides a simple, block-oriented indent
expression that:

- indents by `&shiftwidth` across Silk buffers,
- indents lines that follow opening `{`, `(`, or `[` characters,
- outdents lines that begin with closing `}`, `)`, or `]`.

These settings mirror the mandatory style documented in `AGENTS.md` for code
indentation and align the editor experience with the language’s comment
syntax.

Additional Silk-specific editor behaviors (such as formatting commands or motion/textobject helpers) can be layered on in future iterations once the language and CLI stabilize further.

## Snippets (Tab Expansion)

The Vim plugin includes a tiny built-in snippet expander (no external snippet
plugin required). In Silk buffers, pressing `<Tab>` will expand a small set of
common constructs **only** when the trigger word is the only non-whitespace
text on the line.

Supported triggers include:

- `fn` → function skeleton
- `export fn` → exported function skeleton
- `async fn` / `task fn` / `async task fn` → concurrency-flavored function skeletons
- `let` / `export let` → binding skeletons
- `import` / `package` → statement skeletons
- `import from` → file import skeleton (`import { ... } from "file.slk";`)
- `ext` / `export ext` → external declaration skeletons
- `while` / `for` / `if` / `ife` → block skeletons (`ife` includes an `else`)
- `match` → match skeleton with `Some`/`None` cases
- `struct` / `enum` → type skeletons
- `interface` / `impl` → declaration skeletons
- `/**` → doc comment block skeleton

## Installation Examples

### Option A: Install This Repo as a Vim Plugin (Recommended)

If you install the repository root as a Vim plugin (common with plugin managers), `plugin/silk.vim` will automatically add `vim/` to `'runtimepath'`, so Vim can discover the Silk runtime files without extra configuration.

### Option B: Install Only the `vim/` Subdirectory

If you want to distribute or install the `vim/` directory as a standalone Vim plugin, keep the `vim/` directory structure intact (it is a valid plugin root), including `vim/plugin/silk.vim`.

### Option C: Add `vim/` to `runtimepath` Manually

You can use the plugin directly from the Silk repository by adding `vim/` to Vim’s `runtimepath`, for example:

```vim
set runtimepath^=/path/to/silk/vim
```

If you prefer to copy the files into your own configuration:

- copy `vim/ftdetect/silk.vim` into `~/.vim/ftdetect/`,
- copy `vim/syntax/silk.vim` into `~/.vim/syntax/`,
- copy `vim/ftplugin/silk.vim` into `~/.vim/ftplugin/`,
- copy `vim/indent/silk.vim` into `~/.vim/indent/`,
- copy `vim/autoload/silk/snippets.vim` into `~/.vim/autoload/silk/snippets.vim` (if you want the built-in snippets),
- copy `vim/plugin/silk.vim` into `~/.vim/plugin/` (only needed if you want `.slk` filetype detection without enabling `:filetype on`).

For Neovim, use the equivalent `~/.config/nvim/` directories or a plugin manager that can add this repository as a plugin source.

## LSP Integration (Silk Language Server)

For a richer editing experience (on top of syntax highlighting), you can pair the Vim/Neovim plugin with the `silk-lsp` language server:

- If you are using coc.nvim, see `docs/usage/editor-coc-nvim.md` for a dedicated configuration guide.
- `silk-lsp` implements the Language Server Protocol over stdin/stdout.
- It currently supports:
  - full-document text synchronization,
  - diagnostics driven by the parser and type checker,
  - hover with approximate type hints for identifiers and struct fields,
  - heuristic go-to-definition across the module set (functions, lets, structs, struct fields, and impl methods), including local `let` bindings and parameters,
  - keyword/identifier completion with symbol-aware details and struct member suggestions,
  - struct-literal field suggestions in `Type { ... }` expressions,
  - signature help while typing function and method calls,
  - top-level document symbols for `fn`, `let`, `struct`, `enum`, `error`, `interface`, `ext`, and `impl`.
- It does **not yet** provide semantic tokens, code actions, or full scope-aware navigation for match-expression binders or references; these will be added later as the compiler and LSP spec evolve.

### Example: Neovim Built-in LSP

With Neovim’s built-in LSP client (and `nvim-lspconfig` or a custom setup), a minimal configuration might look like:

```lua
-- In your Neovim config (e.g., init.lua)
local lspconfig = require('lspconfig')

lspconfig.silk_ls = {
  cmd = { 'silk-lsp' },
  filetypes = { 'silk' },
  root_dir = lspconfig.util.root_pattern('.git', '.'),
}
```

To override the stdlib root for the language server, add `--std-root <path>` to the `cmd` list (or set `SILK_STD_ROOT`). Use `--nostd` to disable stdlib integration entirely.

This assumes:

- `silk-lsp` is on your `PATH` (for example, after running `zig build install` or equivalent),
- the Vim filetype detection is in place so that `*.slk` buffers have `filetype=silk`.

### Example: Generic LSP Client Configuration

For other editors or LSP frontends, the configuration is conceptually similar:

- **command**: `["silk-lsp"]`
- **transport**: stdio
- **filetypes / selectors**: Silk source files (typically `*.slk`)
- **capabilities**: no need to advertise advanced features; the server’s `initialize` response drives what is supported.

Refer to `docs/compiler/lsp-silk.md` for the authoritative description of the server’s capabilities and any future extensions. As the language server grows (completion, goto-definition, semantic hover, etc.), this document and example configurations should be updated to match.
