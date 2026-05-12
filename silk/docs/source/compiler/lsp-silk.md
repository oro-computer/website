# Silk Language Server (LSP)

This document specifies the current Language Server Protocol (LSP)
implementation for Silk.

The goal of the language server is to provide editor and IDE integrations
(diagnostics, hover, go-to-definition, references, rename, completion,
signature help, semantic tokens, inlay hints, document symbols, and future
tooling extensions) while remaining a thin, spec-driven wrapper around the
existing compiler front-end.

## Overview

The Silk language server:

- is implemented in Zig and shipped as a separate executable (`silk-lsp`),
- speaks the Language Server Protocol over stdin/stdout using JSON-RPC 2.0 and `Content-Length` framing,
- reuses the existing lexer, parser, and type checker for semantics,
- builds a workspace cache from open documents, nearest-package
 `silk.toml` roots, dependency package graphs, manifest definition files, and
 standard library modules when enabled,
- maintains a lightweight native C symbol index for manifest-owned `.c` / `.h` / `.m`
 sources so `ext` declarations can resolve to local native definitions when
 those sources are available,
- does not change the language surface or ABI; it is a tooling layer on top of the existing compiler.

No language features or CLI options are introduced by the LSP itself. Any future extensions that affect language semantics or user-facing flags must still be documented in the appropriate `docs/language/` or [cli silk](?p=compiler/cli-silk) files first.

## Running the Server

The `silk-lsp` binary is built and installed alongside the `silk` CLI:

- `zig build install` (or the project’s preferred build wrapper) will install both `silk` and `silk-lsp` into the configured prefix.
- Editor and IDE integrations should launch `silk-lsp` as a stdio-based LSP server, without extra arguments, and then speak JSON-RPC 2.0 over its stdin/stdout.
- The server writes protocol messages to stdout and may emit diagnostic logs to stderr; LSP clients must not treat stderr as protocol traffic.
- Optional flags:
 - `--std-root <path>` overrides the stdlib root used for resolving
 `from "std/..."` imports and direct std ABI imports.
 - `--std <path>` is an accepted alias of `--std-root <path>`.
 - `--nostd` disables stdlib auto-loading entirely.
 - `-h` / `--help` prints the current usage text.

Typical client configurations (e.g., Vim/Neovim LSP, VS Code, or other LSP frontends) should:

- set the command to `["silk-lsp"]`,
- enable standard LSP text document synchronization,
- rely on the capabilities advertised in `initialize`; the current request/notification surface includes diagnostics, hover, definition, references, rename, completion, formatting, signature help, semantic tokens, inlay hints, document symbols, shutdown, and exit.

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
 - `positionEncoding`: `"utf-16"` (the server currently operates in UTF-16 positions for maximum client compatibility).
 - `textDocumentSync`:
 - `openClose: true`,
 - `change: 1` (Full document sync),
 - `save: { includeText: false }`.
 - `hoverProvider: true` (semantic hover on literals, declarations, imports, and native `ext` targets as described below).
 - `definitionProvider: true` (definition lookups backed by the module-set symbol index; see below).
 - `referencesProvider: true` (reference queries across the current cached module set; see below).
 - `renameProvider: true` (identifier renames across the current cached module set; see below).
 - `documentFormattingProvider: true` (whole-document formatting via the canonical `silk format` formatter; see below).
 - `documentSymbolProvider: true` (hierarchical document symbols for declarations and nested bodies as described below).
 - `semanticTokensProvider`:
 - legend-driven `full` semantic token responses,
 - token types include namespaces, types, enums, interfaces, structs, parameters, variables, properties, enum members, functions, methods, keywords, comments, strings, numbers, and operators.
 - `inlayHintProvider: true` (type inlay hints for currently supported local bindings; see below).
 - `completionProvider`:
 - does not support resolve,
 - advertises trigger characters `.`, `:`, `{`, `,`, `"`, `` ` ``, and `/`,
 - offers keyword, identifier, import-specifier, and symbol-aware suggestions as described below.
 - `signatureHelpProvider`:
 - trigger characters `(` and `,`,
 - provides function and method signatures for the current call.
- The server uses `rootUri` (or `rootPath`) to help locate a stdlib root when no explicit `--std-root` or `SILK_STD_ROOT` is set.
- `initialized` (notification):
 - Accepted but does not currently trigger additional behavior.
- `shutdown` (request) and `exit` (notification) are honored as in the LSP spec.
- Requests received after `shutdown` (other than `exit`) are treated as invalid and answered with an error response.
- `$\/cancelRequest` notifications are accepted and ignored; the initial server does not track per-request cancellation state.

Any additional capabilities beyond this documented set must be documented here before being implemented.

## Hover

The server provides `textDocument/hover` for open documents using the cached
workspace module set.

- Hover requests are handled for the current contents of an open document (as tracked in the server’s in-memory document table).
- The server computes hover information lexically, based on the token at the given position:
 - integer literals are reported as “int literal”,
 - floating-point literals as “float literal”,
 - boolean literals (`true`/`false`) as “bool literal”,
 - string and character literals as “string literal” and “char literal”,
 - the context-sensitive keyword forms `panic`, `await`, `await *`, `yield`,
 `yield *`, `sizeof`, and `as raw` as Markdown usage help, including
 hovering either token in the two-token `*` and `as raw` forms,
 - identifiers are reported as `identifier 'name'`.
- Hover now includes lightweight semantic hints:
 - function identifiers show their `fn name (...) -> result` signature when available,
 - `let` bindings show the declared (or literal-inferred) type when available,
 - struct / enum / interface / error identifiers report `struct Name` / `enum Name` / `interface Name` / `error Name`,
 - `ext` declarations report `ext name: <type>` when available,
 - field and method accesses (`value.field`, `value.method`) report the field type for known struct or error receivers, and report method signatures for known struct receivers,
 - chained field receivers (`box.value.field`) are resolved by walking the known struct/error field path, including applied generic structs where direct field type parameters can be substituted before rendering the hover type,
 - imported names are resolved across the module set:
 - module-specifier imports (`import { name } from "ns/pkg";`,
 `import { name as alias } from "ns/pkg";`, `import alias from "ns/pkg";`),
 - direct package imports (`import ns::pkg;`),
 - direct symbol imports (`import ns::pkg::name;`, `import ::malloc;`),
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
 - qualified names such as `std::pkg::name` and namespace-qualified names like `alias::name` or `alias::child::name` when `alias` is introduced by:
 - a package import,
 - a default/namespace import,
 - or a module-scope `using` alias.
- Package and import resolution covers:
 - module-specifier imports from dependency-rooted module specifiers and file specifiers,
 - direct package imports (`import ns::pkg;`),
 - direct symbol imports (`import ns::pkg::name;`, `import ::name;`),
 - and `using` aliases for both value names and namespace aliases.
- Local scopes are then consulted to resolve:
 - function parameters,
 - block-scoped `let` bindings,
 - destructuring `let` pattern binders,
 - `let ... else` binders after the statement succeeds,
 - `if let` and `while let` pattern binders, including chained `&& let`
 clauses within the active body,
 - C-style `for` initializer bindings within the loop,
 - `match`-statement binders within the selected arm body.
- Member access (`value.field` / `value.method`) uses the heuristic receiver-type resolver:
 - receiver expressions may be direct locals/types or chained field paths such as `box.value.field`,
 - applied generic struct receivers substitute direct type-parameter fields before resolving the next field in the path,
 - when a struct method is found, the definition points at the `impl` method declaration,
 - when a struct or error field is found, the definition points at that field declaration,
 - otherwise the definition falls back to the receiver struct or error declaration.
- Constructor calls (`new Type(...)`, including namespace/import-qualified `new pkg::Type(...)`) resolve to the public/exported `fn constructor` overload selected by the callsite argument count, using the same arity ranking as the compiler for exact matches, defaulted trailing parameters, and trailing varargs. Empty allocation literals (`new Type{}`) similarly resolve through the zero-argument constructor ranking. If the call shape is incomplete, unmatched, hidden by visibility, or still ambiguous, the server falls back to the `struct Type` declaration.
- When a resolved `ext` declaration has a matching native C symbol in a
 manifest-owned source/header file, go-to-definition prefers the C definition
 (or declaration if no definition is present locally) over the Silk `ext`
 declaration, using the same function-vs-variable matching rule as hover.
- If symbol resolution fails, the server falls back to a lexical scan of the current file for the first matching `let`/`fn`/`ext`/`struct`/`enum`/`interface`/`error` declaration.

Known limitations in this initial support:

- local block scopes and shadowing are modeled for statement-level binders, but
 match-expression binders and full control-flow refinement are not yet a
 complete semantic scope tree,
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
 tagged with LSP keyword kind,
 - guided keyword-help completions for `panic`, `await`, `await *`, `yield`,
 `yield *`, `sizeof`, `#embed`, and `as raw`, with compact detail strings
 and Markdown documentation for the typed-error, Promise, Task, byte-size,
 compile-time file embedding, and raw-cast usage contracts,
 - all distinct identifiers lexed from the current document (names that are not recognized as keywords),
 - symbol-aware suggestions from the current package and imported packages (functions, lets, ext, structs, enums, interfaces, errors),
 - imported names from:
 - package imports and qualified symbol imports,
 - JS-style named/default imports from file, std, or dependency module specifiers,
 - and module-scope `using` aliases,
 - unqualified local-package and named imported functions in
 statement-position buffers that are temporarily incomplete while typing
 (for example before `(` or `;` has been inserted),
 - import specifier path completion inside `from "..."` strings:
 - file specifiers (`"./..."`, `"../..."`, and absolute paths) suggest `.slk` files and subdirectories,
 - std-root module specifiers (`"std/..."`) suggest stdlib module paths (omitting the `.slk` extension),
 - `#embed("path", "...")` encoding completion in the optional second
 argument, offering exactly `"utf8"`, `"utf16"`, `"u8"`, `"u16"`, and
 `"u32"`; omitting the argument is equivalent to `"utf8"`,
 - namespace completions after `::` for known packages, package-import aliases, default/namespace imports, and `using`-introduced namespace aliases, including nested alias chains such as `rt::mem::`,
 - member completions for struct and error fields after `.` when the receiver type is known (including locals with type annotations, struct/error literals, casts, or `new Type(...)` initializers); struct receivers also include instance methods,
 - bare member-trigger completions such as `manager.` by parsing a transient completion probe in memory and returning member results instead of falling back to global lexical keywords,
 - static impl method completions after a type receiver such as `User.`, limited to `impl User` functions without an explicit `self` receiver while value receivers keep instance fields and methods,
 - receiver completions after local bindings initialized from static impl calls, such as `let user = User.create(options); user.`, by using the static impl function result type,
 - array element receiver completions such as `inputs[0].` when `inputs` has an array or slice type annotation,
 - `for item in items { item. }` completions when `items` has an array or slice type annotation,
 - `for item in manager.iter() { item. }` completions when the iterator-returning call result, local type aliases, package/file imports, and `next() -> T?` element type can be resolved through the cached symbol index or transient parse overlay,
 - local completion and receiver inference for statement-level language
 binders, including destructuring `let` patterns, `let ... else`, `if let`
 / `while let` and chained `&& let` clauses, `match` statement arms, and
 C-style `for` initializers,
 - field/method completions for safe pattern payloads when the scrutinee type
 is known, including optional `Some(value)` payloads, generic
 `Result(T, E)`-style `Ok(value)` / `Err(error)` payloads, struct
 destructuring fields, and array destructuring elements,
 - chained field completions such as `box.value.` by walking known
 struct/error receiver fields without invoking the full type checker,
 - applied generic receiver completions such as `b.value.` where
 `b: Box(Inner)` by substituting direct struct type parameters (`T`) into
 field types before resolving the next field,
 - struct- and error-literal field suggestions in `Type { ... }` expressions,
 including `panic Error { ... }` payloads, when the cursor is in a
 field-name position (before the `:`); this contextual completion remains
 limited to record fields while the entry is incomplete, returns field-kind
 items with `field: Type` detail/documentation, inserts the canonical
 `field: ` initializer prefix through `textEdit`, suppresses fields already
 initialized in the current literal, and supplies `filterText` so editors
 can keep showing field choices even when the partial token does not
 prefix-match a field label.
- Currently:
 - returns completion items with `label`, `kind`, and `detail` populated when symbol data is available,
 - attaches Markdown documentation for functions, methods, structs, and documented `let` bindings when doc comments are available, falling back to a compact signature/type preview,
 - filters results by the identifier prefix immediately preceding the cursor position,
 - uses a heuristic symbol index built from the module set (open docs + imports + std modules).
- When the current buffer is syntactically incomplete, ordinary identifier
 completion may parse a transient in-memory probe before falling back to
 lexical identifiers. If a lexical identifier is later resolved to a symbol,
 the server promotes that item with the resolved kind, detail, and
 documentation. If the symbol overlay still cannot represent the current
 file, lexical `fn name` declarations are still promoted to function
 completion items so local functions remain visible.
- Scope precision is still limited:
 - receiver type inference is heuristic (it is not a full typechecker),
 - match-expression binders and full control-flow refinements are not yet
 represented in completion,
 - cross-file results are limited to declarations present in the current module set (open docs + manifest/package import closure + std modules when enabled).

As richer front-end support becomes available, completion may be extended to:

- filter suggestions by lexical/semantic scope,
- distinguish between functions, types, variables, and other symbol kinds,
- surface standard library symbols by consulting the resolver.

## Signature Help

The server provides a minimal implementation of `textDocument/signatureHelp`:

- Signature help is computed for the innermost call expression at the cursor.
- The server supports:
 - direct calls to named functions (`foo(...)`),
 - qualified calls (`std::pkg::foo(...)` and `alias::foo(...)` for namespace imports),
 - method calls (`value.method(...)`) when the receiver resolves to a known struct type.
- constructor calls via heap allocation syntax (`new Type(...)`), which resolves to the `constructor` overload set defined in `impl Type { ... }`.
- calls via named imports and default-imported default exports (`import { f as g } from "..."; g(...)`, `import g from "./mod.slk"; g(...)`) when resolvable.
- When the current buffer is temporarily incomplete after typing `(` or `,`,
 signature help parses a transient in-memory call probe and overlays the
 current document's symbols on the workspace cache, so local, named-imported,
 default-imported, and namespace-qualified function signatures remain
 available while the user is still typing the argument list.
- Active parameter selection is based on delimiter-aware comma counting in the current call. Explicit generic-call arguments before `;` are excluded from the value-argument count, and commas inside nested calls, array literals, and aggregate literals are ignored for the outer call.
- Signature labels follow the Silk surface syntax (e.g. `fn foo (a: int, b: int) -> int`).
- When doc comments are available:
 - `SignatureInformation.documentation` is populated with rendered Markdown from the doc comment,
 - `SignatureParameter.documentation` is populated from `@param` entries when present.

For constructor overload sets, the server returns public/exported signatures and selects an active signature using delimiter-aware value-argument heuristics, with exact arity preferred over defaulted trailing parameters and varargs. The implicit receiver parameter (`mut self: &Type`) is not shown in the signature parameters for `new Type(...)`.

Signature help is heuristic and will become richer as the front-end’s symbol tables evolve. Some clients may request signature help even before `(` is typed; the server will attempt to resolve the identifier under the cursor as a callee in that case.

## Document Symbols

The server provides `textDocument/documentSymbol` for open documents.

- Document symbols are produced hierarchically from the parsed AST:
 - top-level `fn`, `let`, `struct`, `enum`, `error`, `interface`, `ext`, `impl`, `test`, `using`, and inline-module declarations are reported,
 - struct / enum / error / interface children include fields, variants, and methods where applicable,
 - `impl` declarations nest their methods,
 - functions, tests, loops, `match` arms, and similar nested bodies surface supported local declarations and binders beneath their containing symbol.
- Implementation details:
 - ranges are token- or body-based spans derived from the parsed declaration/block structure,
 - `selectionRange` tracks the declaration identifier token,
 - nested coverage is intentionally selective: supported locals and binders are surfaced, but this is not yet a perfect semantic scope tree for every binder form.
- Symbol kinds:
 - functions are reported using the LSP `Function` kind (numeric value `12`),
 - `let` bindings are reported using the `Variable` kind (numeric value `13`),
 - `struct` declarations use `Struct` (numeric value `23`),
 - `enum` declarations use `Enum` (numeric value `10`),
 - `error` declarations use `Struct` (numeric value `23`),
 - `interface` declarations use `Interface` (numeric value `11`),
 - `ext` declarations use `Function` (numeric value `12`),
 - `impl` declarations use `Namespace` (numeric value `3`).

## References and Rename

The server provides `textDocument/references` and `textDocument/rename` for
identifiers that resolve within the current cached module set.

- Reference lookups:
 - resolve the identifier under the cursor to its declaration using the same module-set-aware navigation used by go-to-definition,
 - scan the cached module set for matching identifier occurrences that resolve back to that same declaration,
 - optionally include the declaration itself when the client sets `context.includeDeclaration`.
- Rename:
 - uses the same declaration-resolution and reference collection path,
 - returns a `WorkspaceEdit.documentChanges` payload with per-document text edits,
 - rejects invalid Silk identifier spellings (`newName` must be a valid identifier).

Current boundaries:

- results are limited to the cached module set (open docs, manifest/package/file-import closure, and std modules when enabled),
- rename is identifier-based and does not yet attempt broader semantic refactors outside that cached symbol graph.

## Semantic Tokens

The server provides `textDocument/semanticTokens/full`.

- The current implementation combines:
 - lexical token classification for keywords, comments, strings, numbers, and operators,
 - AST-backed semantic marking for declaration and binder tokens such as namespaces, types, structs, enums, interfaces, functions, methods, parameters, variables, properties, and enum members.
- This gives editors a stronger semantic surface than plain TextMate tokenization while still reusing the existing parser/module cache.

Current limitations:

- token classification is still declaration/binder-oriented rather than a full resolver/type-driven classification for every identifier use,
- token modifiers are not yet emitted.

## Inlay Hints

The server provides `textDocument/inlayHint`.

- The current implementation emits type hints for:
 - unannotated `let` bindings when the initializer’s type is inferable from the current tooling subset,
 - `for` binders over inferable arrays, slices, and ranges,
 - unannotated C-style `for` initializer bindings with the same inferable-type rule.
- Hints are range-aware: the server only returns hints whose insertion positions fall inside the requested LSP range.

Current limitations:

- only a narrow type-hint subset is emitted today,
- parameter-name hints and broader expression/result hints are not yet implemented.

## Formatting

The server provides `textDocument/formatting` for open documents.

- Formatting uses the same canonical source formatter as `silk format`.
- The response is whole-document oriented:
 - if the open document is already formatted, the server returns an empty edit list,
 - otherwise it returns one full-range `TextEdit` that replaces the document text with the formatted text.
- Newline-based `if` / `else if` headers use the same canonical layout as the CLI formatter: chained condition lines are indented one level deeper than the control keyword, and the following standalone `{` aligns back to the control keyword.

Current limitations:

- LSP formatting currently uses the default formatter configuration; editor-specific `FormattingOptions` and `.silk/format.toml` discovery are not yet applied inside the server.
- Range formatting is not advertised.

## Text Document Lifetime and Diagnostics

The server maintains an in-memory table of open documents, keyed by URI:

- `textDocument/didOpen`:
 - stores the full text of the document,
 - rebuilds a lightweight workspace cache (module set + symbol index + export table) used for hover/definition/completion/signature help,
 - publishes diagnostics via `textDocument/publishDiagnostics` for the opened URI by parsing the opened document and type-checking it against the cached module set (imports + std modules).
- `textDocument/didChange` (full sync):
 - replaces the stored text with the new full contents,
 - increments only the changed document revision for already-open documents so hover/definition/completion/signature-help can continue using the existing workspace/import/std cache while typing,
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
- it applies the manifest package name as the default package namespace for
 source or definition files that omit an explicit
 `package ...;` / `module ...;` declaration,
- and it collects manifest-owned `.c` / `.h` / `.m` sources from target inputs
 and shipped C headers for the native symbol index.

This keeps position-time queries on precomputed module/package/native symbol
data rather than rescanning manifests or package graphs for each request.

File-backed URI handling note:

- open-document URIs and file-backed cache entries are normalized to the same
 `file://` form before lookup,
- normalization canonicalizes percent-encoding, `file://localhost/...` versus
 `file:///...`, Windows drive-letter URIs, and UNC host casing so path
 spelling differences do not fragment the cache.

### Standard Library Integration

By default, the language server will load standard library packages referenced
by `from "std/..."` imports and direct std ABI imports when a stdlib root is
available. The stdlib root is selected using the same rules as the compiler,
with an additional workspace-root fallback:

- `--std-root <path>` passed to `silk-lsp` (highest priority),
- `SILK_STD_ROOT` when set,
- `./std` when present (development default),
- an executable-relative fallback (`../share/silk/std`) when installed,
- walk upward from the `silk-lsp` executable’s directory to find `std/` (developer build fallback),
- if none of the above are available and the LSP client provides `rootUri`/`rootPath`, walk upward from that workspace root to find a `std/` directory.

You can disable stdlib integration entirely with `--nostd`, which is useful for sandboxed editor setups or custom stdlib forks.

### Diagnostics Source and Current Limits

Diagnostics are derived from the existing compiler front-end:

- Parsing uses `parser.Parser` and the existing grammar in [grammar](?p=language/grammar).
- Type checking uses `checker.checkModule` and the rules from [types](?p=language/types) and related concept docs.

For responsiveness while typing:

- `didChange` diagnostics are computed for the changed document by parsing it and type-checking it against the cached module set (imports + std modules). The cache is not rebuilt on every change.
- A full module-set parse + resolve + type-check (including imports) is performed on `didSave`, and diagnostics are published for all affected modules.

The current LSP diagnostic surface follows these rules:

- Parse errors:
 - reported at the location of the unexpected token using the token’s line/column and length,
 - message text describes the unexpected token and that parsing failed,
 - publish `E0001` and attach structured `data.helps` pointing at
 `silk error E0001` for clients that surface custom diagnostic data,
 - `#embed("path")` expressions use the document URI’s filesystem path for
 source-relative lookup, and unreadable or invalid embedded files are
 reported as parse diagnostics on the path literal.
- Resolve/type-check diagnostics:
 - use the compiler’s existing structured failure data (stable code, message, source span, and any available detail),
 - map that span/code directly onto the LSP diagnostic when the compiler reports one,
 - include exact expected/found type detail for supported incorrect `await`, `await *`, `yield`, and `yield *` task/async operand errors,
 - include a `silk error <code>` lookup hint for stable compiler codes so
 editor users can open the same diagnostic reference available from the CLI,
 - flatten available note/help guidance inline into the LSP `message` field and also attach structured `data.detail`, `data.notes`, and `data.helps` when the compiler provides them.
- Conditional compilation (`if attr(...)`):
 - the server evaluates `attr(...)` query conditions using the host target (`arch`, `os`, `target`) and the enabled feature set (empty in Silk currently),
 - when an `if` / `else if` condition is an attribute-query boolean expression that resolves to a constant `true`/`false`, the inactive branch body is published as a `Hint` diagnostic tagged `Unnecessary` so editors may render it faded (similar to inactive `#if` blocks in C/C++).

Current limits:

- parse and attribute-pass diagnostics are still built locally from the parser / attr pass because those subsystems do not yet surface the same reusable diagnostic struct as the later resolve/type-check stages,
- when an internal error path still lacks an exact span, the server falls back to the owning module with a coarse range rather than dropping the diagnostic entirely.

## Non-Goals

`silk-lsp` still intentionally does **not** provide:

- full semantic completions with perfect scope/type filtering across every binder/control-flow form,
- project-wide navigation or rename outside the current cached module set,
- fully semantic token classification for every identifier use,
- richer inlay-hint categories beyond the current local type hints,
- code actions.

These features are intended as future extensions and must be:

- designed and documented here (and in any relevant `docs/language/` or `docs/std/` docs),
- backed by the underlying compiler front-end and/or standard library,
- covered by tests (Zig and, where appropriate, C) before being advertised as supported capabilities.

## Relationship to Other Tooling

The language server is part of the broader tooling story described in:

- [architecture](?p=compiler/architecture) (compiler and tool layout),
- [cli silk](?p=compiler/cli-silk) (CLI behavior for `silk`),
- `docs/usage/` (editor integrations, including Vim and LSP-based workflows).

The `tmp/zls/` directory in the Silk compiler repository contains a vendored copy of the Zig Language Server (ZLS) for inspiration and experimentation only:

- it is **not** part of the supported Silk toolchain,
- it must not be treated as authoritative for Silk semantics,
- ideas from it may inform the design and implementation of `silk-lsp`, but Silk remains spec-driven from the `docs/` tree.
