# Silk Language Server (LSP)

This document specifies the Silk Language Server Protocol (LSP) server.

The goal of the language server is to provide editor and IDE integrations
(diagnostics, hover, completion, signature help, and definition lookup) while
remaining a thin wrapper around the existing compiler front-end.

## Overview

The Silk language server:

- is implemented in Zig and shipped as a separate executable (`silk-lsp`),
- speaks the Language Server Protocol over stdin/stdout using JSON-RPC 2.0 and `Content-Length` framing,
- reuses the existing lexer, parser, and type checker for semantics,
- builds a workspace cache from open documents, nearest-package
  `silk.toml` roots, dependency package graphs, manifest definition files, and
  standard library modules when enabled,
- maintains a lightweight native C symbol index for manifest-owned `.c` / `.h`
  sources so `ext` declarations can resolve to local native definitions when
  those sources are available,
- does not change the language surface or ABI; it is a tooling layer on top of the existing compiler.

No language features or CLI options are introduced by the LSP itself. Any
later additions that affect language semantics or user-facing flags must still
be documented in the relevant language docs or the
[CLI reference](?p=compiler/cli-silk) first.

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
  - Advertised capabilities:
    - `positionEncoding`: `"utf-16"` (the server uses UTF-16 positions for broad client compatibility).
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
    - The server does not advertise references/rename, semantic tokens, or
      other advanced features.
- The server uses `rootUri` (or `rootPath`) to help locate a stdlib root when no explicit `--std-root` or `SILK_STD_ROOT` is set.
- `initialized` (notification):
  - Accepted but does not trigger additional behavior.
- `shutdown` (request) and `exit` (notification) are honored as in the LSP spec.
- Requests received after `shutdown` (other than `exit`) are treated as invalid and answered with an error response.
- `$\/cancelRequest` notifications are accepted and ignored; the server does not
  track per-request cancellation state.

Any additional capabilities must be documented here before being implemented
and advertised.

## Hover

The server provides `textDocument/hover` for open documents using the cached
workspace module set.

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
  - imported names are resolved across the module set:
    - package imports (`import ns::pkg;`, `import ns::pkg as alias;`),
    - qualified symbol imports (`import ns::pkg::name;`, `import ns::pkg::name as alias;`, `import ::malloc;`),
    - JS-style imports (`import { name } from "ns/pkg";`, `import { name as alias } from "ns/pkg";`, `import alias from "ns/pkg";`),
    - and module-scope `using` aliases for imported or local names,
  - when an `ext` declaration resolves to a locally indexed native C symbol, hover includes the native C declaration/prototype in an additional `c` code block,
  - native C lookup is filtered by the `ext` shape (`fn` / `c_fn` externs prefer C functions; non-function externs prefer C variables), so common C tag/function collisions like `struct stat` vs `stat(...)` do not override the callable symbol.
- When the resolved declaration has a doc comment, hover renders it as Markdown:
  - the first block is a `silk` code block containing the signature/header,
  - followed by the rendered doc comment body.
- The hover `range` returned to the client corresponds to the token span (same token line/column/length used for diagnostics); when no suitable token is found at the requested position, the server returns `null` as the hover result.

The native C index is intentionally lexical and top-level only; it is not a
full C parser. It is used to surface nearby declarations/definitions in
manifest-owned C sources, not to typecheck arbitrary C. It tolerates leading
indentation before preprocessor directives so common headers with indented
`#include` / `#define` lines still index the following declarations correctly.

## Go To Definition

The server provides `textDocument/definition` for open documents.

- Definition requests are handled for the current contents of an open document.
- The server first consults the module-set symbol index (open docs + manifest
  package graphs + definition files + std modules when enabled) to resolve:
  - exported or package-local `fn`, `let`, `ext`, `struct`, `enum`, `interface`, and `error` declarations,
  - methods declared in `impl` blocks when invoked as `value.method(...)`,
  - qualified names such as `std::pkg::name` and namespace-qualified names like `alias::name` when `alias` is introduced by:
    - a package import,
    - a default/namespace import,
    - or a module-scope `using` alias.
- Package and import resolution covers:
  - package imports (`import ns::pkg;`, `import ns::pkg as alias;`),
  - qualified symbol imports (`import ns::pkg::name;`, `import ns::pkg::name as alias;`, `import ::name;`),
  - JS-style imports from package specifiers and file specifiers,
  - and `using` aliases for both value names and namespace aliases.
- Local scopes are then consulted to resolve:
  - function parameters,
  - block-scoped `let` bindings,
  - `match`-statement binders within the selected arm body.
- Member access (`value.field` / `value.method`) uses the heuristic receiver-type resolver:
  - when a method is found, the definition points at the `impl` method declaration,
  - when a struct field is found, the definition points at that field declaration,
  - otherwise the definition falls back to the receiver struct declaration.
- Constructor calls (`new Type(...)`) resolve to the `fn constructor` declaration when the constructor overload set is unambiguous; otherwise the server falls back to the `struct Type` declaration.
- When a resolved `ext` declaration has a matching native C symbol in a
  manifest-owned source/header file, go-to-definition prefers the C definition
  (or declaration if no definition is present locally) over the Silk `ext`
  declaration, using the same function-vs-variable matching rule as hover.
- If symbol resolution fails, the server falls back to a lexical scan of the current file for the first matching `let`/`fn`/`ext`/`struct`/`enum`/`interface`/`error` declaration.

Current resolution limits:

- local block scopes and shadowing are only modeled for `let`-style bindings (not for match-expression binders),
- ambiguous names across multiple imports are not disambiguated; the first match wins,
- cross-file results are limited to declarations present in the current module
  set (open docs, manifest-discovered package files, and std modules when
  enabled).

Manifest-aware cache rebuild note:

- When a nearest-package graph cannot be loaded (for example because a
  dependency is missing or a manifest hash/version check fails), `silk-lsp`
  emits a concise stderr warning describing the failed package root and the
  manifest diagnostic it received, rather than silently dropping package
  indexing.

## Completion

The server provides `textDocument/completion` using the same cached workspace
module set.

- Completion items are offered for:
  - all language keywords defined in `src/token.zig` (via `keywordTable()`),
  - all distinct identifiers lexed from the current document (names that are not recognized as keywords),
  - symbol-aware suggestions from the current package and imported packages (functions, lets, ext, structs, enums, interfaces, errors),
  - imported names from:
    - package imports and qualified symbol imports,
    - JS-style named/default imports from file or package specifiers,
    - and module-scope `using` aliases,
  - import specifier path completion inside `from "..."` strings:
    - file specifiers (`"./..."`, `"../..."`, and absolute paths) suggest `.slk` files and subdirectories,
    - std-root file specifiers (`"std/..."`) suggest stdlib paths (omitting the `.slk` extension),
  - namespace completions after `::` for known packages, package-import aliases, default/namespace imports, and `using`-introduced namespace aliases,
  - member completions for struct fields and methods after `.` when the receiver type is known (including locals with type annotations or struct-literal/cast inference),
  - struct-literal field suggestions in `Type { ... }` expressions when the cursor is in a field-name position (before the `:`).
- The server:
  - returns completion items with `label`, `kind`, and `detail` populated when symbol data is available,
  - attaches a plaintext signature preview for functions and methods in completion documentation,
  - filters results by the identifier prefix immediately preceding the cursor position,
  - uses a heuristic symbol index built from the module set (open docs + imports + std modules).
- Scope precision is still limited:
  - receiver type inference is heuristic (it is not a full typechecker),
  - local scopes are only partially modeled for completion (not all binder forms and control-flow refinements are represented),
  - cross-file results are limited to declarations present in the current module set (open docs + manifest/package import closure + std modules when enabled).

As richer front-end support becomes available, completion may be extended to:

- filter suggestions by lexical/semantic scope,
- distinguish between functions, types, variables, and other symbol kinds,
- surface standard library symbols by consulting the resolver.

## Signature Help

The server provides `textDocument/signatureHelp`:

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

Signature help is heuristic. Some clients request signature help even before
`(` is typed; the server attempts to resolve the identifier under the cursor as
a callee in that case.

## Document Symbols

The server provides `textDocument/documentSymbol`:

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

Likely extensions here are:

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

### Workspace Cache and Package Discovery

The workspace cache is manifest-aware:

- for each open document with a filesystem path, the server walks upward to the
  nearest owning `silk.toml`,
- it loads the full package graph rooted there, including dependency packages,
- it adds manifest-declared definition files to the indexed module set,
- it applies the manifest package name as the default package for source or
  definition files that omit an explicit `package ...;` / `module ...;`
  declaration,
- and it collects manifest-owned `.c` / `.h` sources from target inputs and
  shipped C headers for the native symbol index.

This keeps position-time queries on precomputed module/package/native symbol
data rather than rescanning manifests or package graphs for each request.

### Standard Library Integration

By default, the language server will load standard library packages referenced by `import std::...` when a stdlib root is available. The stdlib root is selected using the same rules as the compiler, with an additional workspace-root fallback:

- `--std-root <path>` passed to `silk-lsp` (highest priority),
- `SILK_STD_ROOT` when set,
- `./std` when present (development default),
- an executable-relative fallback (`../share/silk/std`) when installed,
- walk upward from the `silk-lsp` executable’s directory to find `std/` (developer build fallback),
- if none of the above are available and the LSP client provides `rootUri`/`rootPath`, walk upward from that workspace root to find a `std/` directory.

You can disable stdlib integration entirely with `--nostd`, which is useful for sandboxed editor setups or custom stdlib forks.

### Diagnostics Source and Current Limits

Diagnostics are derived from the existing compiler front-end:

- Parsing uses `parser.Parser` and the existing rules from
  [Grammar](?p=language/grammar).
- Type checking uses `checker.checkModule` and the rules from
  [Grammar](?p=language/grammar), [Types](?p=language/types), and related
  language docs.

For responsiveness while typing:

- `didChange` diagnostics are computed for the changed document by parsing it and type-checking it against the cached module set (imports + std modules). The cache is not rebuilt on every change.
- A full module-set parse + resolve + type-check (including imports) is performed on `didSave`, and diagnostics are published for all affected modules.

The current front-end exposes errors as simple error codes (e.g.
`UnexpectedToken`, `TypeMismatch`) without rich spans. The LSP therefore
follows these rules:

- Parse errors:
  - reported at the location of the unexpected token using the token’s line/column and length,
  - message text describes the unexpected token and that parsing failed.
- Type-checking errors:
  - reported at an approximate source location associated with the expression or statement that triggered the error (for example, the initializer expression for a mismatched `let` binding or the `break` / `continue` / `return` keyword),
  - message text distinguishes between known error kinds (e.g. `TypeMismatch`, `InvalidReturn`) and carries the span reported by the type checker when available; if no span is available, diagnostics fall back to a coarse location.
- Conditional compilation (`if attr(...)`):
  - the server evaluates `attr(...)` query conditions using the host target (`arch`, `os`, `target`) and the enabled feature set (currently empty),
  - when an `if` / `else if` condition is an attribute-query boolean expression that resolves to a constant `true`/`false`, the inactive branch body is published as a `Hint` diagnostic tagged `Unnecessary` so editors may render it faded (similar to inactive `#if` blocks in C/C++).

As the compiler evolves to carry richer diagnostic information (spans, notes,
labels), this document and the LSP implementation must be updated so that:

- diagnostics map directly to the front-end’s structured error data,
- positions and ranges reflect the exact source spans of the underlying errors.

## Current scope boundaries

`silk-lsp` does **not** provide:

- full semantic completions with scope-precise filtering and type inference (beyond the current heuristic symbol index),
- cross-file go-to-definition / references,
- semantic tokens or inlay hints,
- code actions or formatting.

These features must be:

- designed and documented here (and in any relevant language or std docs),
- backed by the underlying compiler front-end and/or standard library,
- covered by tests (Zig and, where appropriate, C) before being advertised as supported capabilities.

## Relationship to Other Tooling

The language server is part of the broader tooling story described in:

- [Compiler architecture](?p=compiler/architecture),
- [CLI reference](?p=compiler/cli-silk),
- [Usage guides](?p=usage/getting-started).
