# Silk Language Server (LSP)

This document specifies the initial Language Server Protocol (LSP) implementation for Silk.

The goal of the language server is to provide editor and IDE integrations (diagnostics, and eventually features like completion and hover) while remaining a thin, spec-driven wrapper around the existing compiler front-end.

## Overview

The Silk language server:

- is implemented in Zig and shipped as a separate executable (`silk-lsp`),
- speaks the Language Server Protocol over stdin/stdout using JSON-RPC 2.0 and `Content-Length` framing,
- reuses the existing lexer, parser, and type checker for semantics,
- does not change the language surface or ABI; it is a tooling layer on top of the existing compiler.

No language features or CLI options are introduced by the LSP itself. Any future extensions that affect language semantics or user-facing flags must still be documented in the appropriate `docs/language/` or `docs/compiler/cli-silk.md` files first.

## Running the Server

The `silk-lsp` binary is built and installed alongside the `silk` CLI:

- `zig build install` (or the project’s preferred build wrapper) will install both `silk` and `silk-lsp` into the configured prefix.
- Editor and IDE integrations should launch `silk-lsp` as a stdio-based LSP server, without extra arguments, and then speak JSON-RPC 2.0 over its stdin/stdout.
- The server writes protocol messages to stdout and may emit diagnostic logs to stderr; LSP clients must not treat stderr as protocol traffic.
- Optional flags:
  - `--std-root <path>` overrides the stdlib root used for resolving `import std::...;`.
  - `--nostd` disables stdlib auto-loading entirely.

Typical client configurations (e.g., Vim/Neovim LSP, VS Code, or other LSP frontends) should:

- set the command to `["silk-lsp"]`,
- enable standard LSP text document synchronization,
- refrain from sending requests beyond the capabilities advertised in `initialize` (hover, diagnostics, shutdown/exit).

## Transport and Protocol

The language server:

- reads requests from standard input using the LSP message framing (`Content-Length: <n>\r\n\r\n<json>`),
- writes responses and server-initiated notifications to standard output using the same framing,
- implements JSON-RPC 2.0 semantics (`jsonrpc: "2.0"`, `id`, `method`, `params`, `result` / `error`).

The server does not depend on any external networking libraries; it uses Zig standard library I/O and JSON support.

Position handling note:

- The lexer tracks byte offsets and byte-based columns.
- The LSP layer maps between byte columns and LSP `utf-16` character positions.
- Clients should treat returned `line`/`character` values as LSP positions in UTF-16.
- If a request uses a character position beyond the end of a line, the server clamps it to the line end when locating tokens.

## Initialization

The server supports the standard LSP initialization sequence:

- `initialize` (request):
  - Advertised capabilities (initial version):
    - `positionEncoding`: `"utf-16"` (the server currently operates in UTF-16 positions for maximum client compatibility).
    - `textDocumentSync`:
      - `openClose: true`,
      - `change: 1` (Full document sync),
      - `save: { includeText: false }`.
    - `hoverProvider: true` (minimal lexical hover on literals and identifiers as described below).
    - `definitionProvider: true` (definition lookups backed by the module-set symbol index; see below).
    - `documentSymbolProvider: true` (top-level `fn`/`let`/`struct`/`enum`/`error`/`interface`/`ext`/`impl` symbols as described below).
    - `completionProvider`: a minimal completion provider that:
      - does not support resolve,
      - advertises trigger characters `.`, `:`, `{`, `,`, `"`, `` ` ``, and `/`,
      - offers keyword, identifier, and symbol-aware suggestions as described below.
    - `signatureHelpProvider`:
      - trigger characters `(` and `,`,
      - provides function and method signatures for the current call.
    - No references/rename, semantic tokens, or other advanced features are claimed in the initial implementation.
- The server uses `rootUri` (or `rootPath`) to help locate a stdlib root when no explicit `--std-root` or `SILK_STD_ROOT` is set.
- `initialized` (notification):
  - Accepted but does not currently trigger additional behavior.
- `shutdown` (request) and `exit` (notification) are honored as in the LSP spec.
- Requests received after `shutdown` (other than `exit`) are treated as invalid and answered with an error response.
- `$\/cancelRequest` notifications are accepted and ignored; the initial server does not track per-request cancellation state.

Any future capabilities (completion, hover, goto definition, etc.) must be documented here before being implemented.

## Hover (Initial Support)

The server provides a minimal implementation of `textDocument/hover`:

- Hover requests are handled for the current contents of an open document (as tracked in the server’s in-memory document table).
- The server computes hover information lexically, based on the token at the given position:
  - integer literals are reported as “int literal”,
  - floating-point literals as “float literal”,
  - boolean literals (`true`/`false`) as “bool literal”,
  - string and character literals as “string literal” and “char literal”,
  - identifiers are reported as `identifier 'name'`.
- Hover now includes lightweight semantic hints:
  - function identifiers show their `fn name (...) -> result` signature when available,
  - `let` bindings show the declared (or literal-inferred) type when available,
  - struct / enum / interface / error identifiers report `struct Name` / `enum Name` / `interface Name` / `error Name`,
  - `ext` declarations report `ext name: <type>` when available,
  - field and method accesses (`value.field`, `value.method`) report the field type or method signature when the receiver is a known struct,
  - imported names are resolved across the module set (package imports and `from "..."` imports, including named imports and namespace/default imports).
- When the resolved declaration has a doc comment, hover renders it as Markdown:
  - the first block is a `silk` code block containing the signature/header,
  - followed by the rendered doc comment body.
- The hover `range` returned to the client corresponds to the token span (same token line/column/length used for diagnostics); when no suitable token is found at the requested position, the server returns `null` as the hover result.

As the front-end grows richer (e.g. with symbol tables and more detailed type information), hover semantics may be extended to include resolved types and declaration summaries; such changes must be reflected here before being implemented.

## Go to Definition (Initial Support)

The server provides an initial implementation of `textDocument/definition`:

- Definition requests are handled for the current contents of an open document.
- The server first consults the module-set symbol index (open docs + resolved imports + std modules) to resolve:
  - exported or package-local `fn`, `let`, `ext`, `struct`, `enum`, `interface`, and `error` declarations,
  - methods declared in `impl` blocks when invoked as `value.method(...)`,
  - qualified names such as `std::pkg::name` and namespace-qualified names like `alias::name` when `alias` is a namespace import.
- Local scopes are then consulted to resolve:
  - function parameters,
  - block-scoped `let` bindings,
  - `match`-statement binders within the selected arm body.
- Member access (`value.field` / `value.method`) uses the heuristic receiver-type resolver:
  - when a method is found, the definition points at the `impl` method declaration,
  - when a struct field is found, the definition points at that field declaration,
  - otherwise the definition falls back to the receiver struct declaration.
- Constructor calls (`new Type(...)`) resolve to the `fn constructor` declaration when the constructor overload set is unambiguous; otherwise the server falls back to the `struct Type` declaration.
- If symbol resolution fails, the server falls back to a lexical scan of the current file for the first matching `let`/`fn`/`ext`/`struct`/`enum`/`interface`/`error` declaration.

Known limitations in this initial support:

- local block scopes and shadowing are only modeled for `let`-style bindings (not for match-expression binders),
- ambiguous names across multiple imports are not disambiguated; the first match wins,
- cross-file results are limited to declarations present in the current module set.

## Completion (Initial Support)

The server provides a minimal implementation of `textDocument/completion`:

- Completion items are offered for:
  - all language keywords defined in `src/token.zig` (via `keywordTable()`),
  - all distinct identifiers lexed from the current document (names that are not recognized as keywords),
  - symbol-aware suggestions from the current package and imported packages (functions, lets, ext, structs, enums, interfaces, errors),
  - imported names from module-specifier imports (`import { ... } from "...";` and `import alias from "...";`) when resolvable,
  - import specifier path completion inside `from "..."` strings:
    - file specifiers (`"./..."`, `"../..."`, and absolute paths) suggest `.slk` files and subdirectories,
    - std-root file specifiers (`"std/..."`) suggest stdlib paths (omitting the `.slk` extension),
  - namespace completions after `::` for known packages and namespace imports,
  - member completions for struct fields and methods after `.` when the receiver type is known (including locals with type annotations or struct-literal/cast inference),
  - struct-literal field suggestions in `Type { ... }` expressions when the cursor is in a field-name position (before the `:`).
- The current implementation:
  - returns completion items with `label`, `kind`, and `detail` populated when symbol data is available,
  - attaches a plaintext signature preview for functions and methods in completion documentation,
  - filters results by the identifier prefix immediately preceding the cursor position,
  - uses a heuristic symbol index built from the module set (open docs + imports + std modules).
- Scope precision is still limited:
  - receiver type inference is heuristic (it is not a full typechecker),
  - local scopes are only partially modeled for completion (not all binder forms and control-flow refinements are represented),
  - cross-file results are limited to declarations present in the current module set (open docs + the import closure).

As richer front-end support becomes available, completion may be extended to:

- filter suggestions by lexical/semantic scope,
- distinguish between functions, types, variables, and other symbol kinds,
- surface standard library symbols by consulting the resolver.

## Signature Help (Initial Support)

The server provides a minimal implementation of `textDocument/signatureHelp`:

- Signature help is computed for the innermost call expression at the cursor.
- The server supports:
  - direct calls to named functions (`foo(...)`),
  - qualified calls (`std::pkg::foo(...)` and `alias::foo(...)` for namespace imports),
  - method calls (`value.method(...)`) when the receiver resolves to a known struct type.
- constructor calls via heap allocation syntax (`new Type(...)`), which resolves to the `constructor` overload set defined in `impl Type { ... }`.
- calls via named imports and default-imported default exports (`import { f as g } from "..."; g(...)`, `import g from "./mod.slk"; g(...)`) when resolvable.
- Active parameter selection is based on comma counting in the current call.
- Signature labels follow the Silk surface syntax (e.g. `fn foo (a: int, b: int) -> int`).
- When doc comments are available:
  - `SignatureInformation.documentation` is populated with rendered Markdown from the doc comment,
  - `SignatureParameter.documentation` is populated from `@param` entries when present.

For constructor overload sets, the server returns multiple signatures and selects an active signature using argument-count heuristics. The implicit receiver parameter (`mut self: &Type`) is not shown in the signature parameters for `new Type(...)`.

Signature help is heuristic and will become richer as the front-end’s symbol tables evolve. Some clients may request signature help even before `(` is typed; the server will attempt to resolve the identifier under the cursor as a callee in that case.

## Document Symbols (Initial Support)

The server provides a minimal implementation of `textDocument/documentSymbol`:

- Document symbols are derived lexically from the source text:
  - top-level `fn` declarations are reported as function symbols,
  - top-level `let` bindings are reported as variable symbols.
  - top-level `struct`, `enum`, `error`, `interface`, `ext`, and `impl` declarations are also reported.
- Implementation details:
  - symbols are inferred from `fn name`, `let name`, `struct Name`, `enum Name`, `error Name`, `interface Name`, `ext name`, and `impl Name` patterns in the token stream,
  - the implementation tracks `{ ... }` brace depth and only reports declarations at brace depth 0,
  - the symbol `range` and `selectionRange` both correspond to the identifier token span,
  - nested or block-local declarations are not yet surfaced.
- Symbol kinds:
  - functions are reported using the LSP `Function` kind (numeric value `12`),
  - `let` bindings are reported using the `Variable` kind (numeric value `13`),
  - `struct` declarations use `Struct` (numeric value `23`),
  - `enum` declarations use `Enum` (numeric value `10`),
  - `error` declarations use `Struct` (numeric value `23`),
  - `interface` declarations use `Interface` (numeric value `11`),
  - `ext` declarations use `Function` (numeric value `12`),
  - `impl` declarations use `Namespace` (numeric value `3`).

Future extensions may:

- organize symbols hierarchically (for example nesting methods under an `impl`),
- add additional declaration kinds (imports and interface members).

## Text Document Lifetime and Diagnostics

The server maintains an in-memory table of open documents, keyed by URI:

- `textDocument/didOpen`:
  - stores the full text of the document,
  - rebuilds a lightweight workspace cache (module set + symbol index + export table) used for hover/definition/completion/signature help,
  - publishes diagnostics via `textDocument/publishDiagnostics` for the opened URI by parsing the opened document and type-checking it against the cached module set (imports + std modules).
- `textDocument/didChange` (full sync):
  - replaces the stored text with the new full contents,
  - parses the changed document and type-checks it against the cached module set (imports + std modules),
  - publishes updated diagnostics for the changed URI.
- `textDocument/didSave`:
  - rebuilds the module set from all open documents,
  - resolves imports across the module set (packages + file imports) and loads standard library modules when configured,
  - type-checks the module set,
  - publishes diagnostics via `textDocument/publishDiagnostics` for any affected module URI (including imports).
- `textDocument/didClose`:
  - removes the document entry,
  - publishes an empty diagnostics list for the closed URI,
  - rebuilds the workspace cache for the remaining open documents.

For responsiveness, the server caches parsed modules (AST + lightweight module info) per open document revision and reuses them across hover/definition/completion/signatureHelp requests until the document changes.

### Standard Library Integration

By default, the language server will load standard library packages referenced by `import std::...` when a stdlib root is available. The stdlib root is selected using the same rules as the compiler, with an additional workspace-root fallback:

- `--std-root <path>` passed to `silk-lsp` (highest priority),
- `SILK_STD_ROOT` when set,
- `./std` when present (development default),
- an executable-relative fallback (`../share/silk/std`) when installed,
- walk upward from the `silk-lsp` executable’s directory to find `std/` (developer build fallback),
- if none of the above are available and the LSP client provides `rootUri`/`rootPath`, walk upward from that workspace root to find a `std/` directory.

You can disable stdlib integration entirely with `--nostd`, which is useful for sandboxed editor setups or custom stdlib forks.

### Diagnostics Source and Limitations (Initial)

Diagnostics are derived from the existing compiler front-end:

- Parsing uses `parser.Parser` and the existing grammar in `docs/language/grammar.md`.
- Type checking uses `checker.checkModule` and the rules from `docs/language/types.md` and related concept docs.

For responsiveness while typing:

- `didChange` diagnostics are computed for the changed document by parsing it and type-checking it against the cached module set (imports + std modules). The cache is not rebuilt on every change.
- A full module-set parse + resolve + type-check (including imports) is performed on `didSave`, and diagnostics are published for all affected modules.

The current front-end exposes errors as simple error codes (e.g. `UnexpectedToken`, `TypeMismatch`) without rich spans. The initial LSP implementation therefore follows these rules:

- Parse errors:
  - reported at the location of the unexpected token using the token’s line/column and length,
  - message text describes the unexpected token and that parsing failed.
- Type-checking errors:
  - reported at an approximate source location associated with the expression or statement that triggered the error (for example, the initializer expression for a mismatched `let` binding or the `break` / `continue` / `return` keyword),
  - message text distinguishes between known error kinds (e.g. `TypeMismatch`, `InvalidReturn`) and carries the span reported by the type checker when available; if no span is available, diagnostics fall back to a coarse location.

As the compiler evolves to carry richer diagnostic information (spans, notes, labels), this document and the LSP implementation must be updated so that:

- diagnostics map directly to the front-end’s structured error data,
- positions and ranges reflect the exact source spans of the underlying errors.

## Non-Goals (Initial Version)

The initial `silk-lsp` implementation explicitly does **not** provide:

- full semantic completions with scope-precise filtering and type inference (beyond the current heuristic symbol index),
- cross-file go-to-definition / references,
- semantic tokens or inlay hints,
- code actions or formatting.

These features are intended as future extensions and must be:

- designed and documented here (and in any relevant `docs/language/` or `docs/std/` docs),
- backed by the underlying compiler front-end and/or standard library,
- covered by tests (Zig and, where appropriate, C) before being advertised as supported capabilities.

## Relationship to Other Tooling

The language server is part of the broader tooling story described in:

- `docs/compiler/architecture.md` (compiler and tool layout),
- `docs/compiler/cli-silk.md` (CLI behavior for `silk`),
- `docs/usage/` (editor integrations, including Vim and LSP-based workflows).

The `tmp/zls/` directory in this repository contains a vendored copy of the Zig Language Server (ZLS) for inspiration and experimentation only:

- it is **not** part of the supported Silk toolchain,
- it must not be treated as authoritative for Silk semantics,
- ideas from it may inform the design and implementation of `silk-lsp`, but Silk remains spec-driven from the `docs/` tree.
