# Compiler Diagnostics

This document specifies the *human-readable* diagnostic format emitted by the Silk toolchain, including:

- the `silk` CLI (`silk check`, `silk build`),
- the embedding ABI (`libsilk.a` via `silk_compiler_last_error` / `silk_error_format`),
- and tooling that reuses the front-end (for example `silk-lsp`).

The goal is to provide diagnostics that are:

- precise (file + line + column + source span),
- stable (consistent wording and stable error codes for known error kinds),
- consumable by humans (caret snippets, notes/help where appropriate),
- easy to test (deterministic formatting; the canonical text contains no ANSI escapes).

## Diagnostic Policy

The compiler should diagnose the *actual class of failure*, not hide it behind
bring-up terminology.

User-facing diagnostics should distinguish at least these categories:

- **Spec/type-check failure**: the program violates the documented Silk
 language or standard-library contract.
- **Unimplemented language feature**: the program uses a language feature that
 is not yet implemented in the compiler and is not part of the shipped
 documented language contract.
- **Backend/target limitation**: the program parses and type-checks, but a
 target-specific lowering/codegen path cannot yet emit the requested output.
- **Stdlib/module availability gap**: the program refers to a standard-library
 or package surface that is absent or unavailable for the current build/host.
- **Internal compiler error**: the compiler lost required context or reached an
 unexpected internal failure.

The term **subset** should not be the primary explanation in new diagnostics.
It may still appear in historical notes or implementation-status prose, but
user-facing errors should say what is actually wrong: for example "unimplemented
language feature", "unsupported backend target path", or a specific contract
violation.

Rule for feature-vs-rejection wording:

- If a construct is part of the documented language/spec surface, a compiler
 rejection must be described as an implementation gap, not as a language-level
 rejection.
- In particular:
 - `u128` / `f128` are language features, so `E2114` / `E2115` describe
 missing implementation work in some compiler paths rather than forbidden
 types.
 - monomorphized generics are language features, so `E2016` is for generic
 forms the current compiler has not implemented yet, not for generic syntax
 that is outside the language.

## Terminology

- **Source span**: a byte range in the UTF‑8 source buffer (`offset`, `length`).
 - Displayed **line** and **column** numbers are **1-based**.
 - Columns are measured in **UTF‑8 bytes** (matching the lexer’s current `Token.column` behavior).
- **Primary label**: the main span where the error is reported (single span in the implementation).
- **Note / Help**: supplemental lines that explain context or suggest a fix.

## Text Format (CLI and ABI)

The standard human-readable diagnostic format is:

```
error[E<code>]: <message>
 --> <path>:<line>:<column>
  |
<line> | <source line text>
  | <caret underline>
  = note: <note text>        (optional, repeatable)
  = help: <help text>        (optional, repeatable)
```

Rules:

- The `error[...]` line always appears for known error kinds; `<code>` is stable for that error kind.
- For diagnostics with no usable location, the `--> ...` and snippet block may be omitted.
- The snippet block uses the 1-based line number and includes the full line text as it appears in the source.
- The caret underline is placed under the primary span:
 - for a zero-length span, print a single `^`,
 - otherwise print `^` repeated for the span length, clipped to the line end if needed.
- The canonical text format contains no ANSI color escapes.

## Manifest and Config Errors

The CLI uses the same caret diagnostic format for errors in tooling/config inputs,
including the package manifest `silk.toml` and build-module-generated manifests.
These diagnostics may not yet have stable error codes.

Example (missing `=` in `silk.toml`):

```
error: invalid TOML in package manifest
 --> silk.toml:2:6
  |
2 | name "app"
  |      ^ expected `=`
```

## ANSI Color (CLI)

The `silk` CLI may decorate the canonical diagnostic format with ANSI SGR escape codes
when writing to a terminal. The visible text (after stripping ANSI escapes) must still
match the canonical format.

Color is enabled only when:

- stderr is a TTY that supports ANSI escapes,
- `NO_COLOR` is not set,
- `TERM` is not `dumb`.

Color is never used for the embedding ABI (`silk_error_format` / `silk_compiler_last_error`),
and is not used when stderr is not a TTY (for example when piping diagnostics to a file).

## Suggestions and Help Text

Diagnostics may include one or more `= help:` lines that suggest concrete fixes.
These are heuristic and may be omitted when the compiler cannot compute a safe
suggestion.

Examples of help/suggestion content the compiler may emit:

- for unknown imports, a `"did you mean ...?"` suggestion based on nearby names,
- for file imports, a note about the *resolved* import path,
- reminders about enabling or configuring the standard library (`--nostd`,
 `--std-root`, `SILK_STD_ROOT`) when importing `std::...`,
- guidance to include additional modules in the build/module set when an import
 refers to a package or file that is not present.

## Error Codes

The compiler assigns a stable code to each currently supported error kind.

### Parsing

| Code | Meaning | Notes |
| --- | --- | --- |
| `E0001` | unexpected token / invalid top-level ordering. |  |

### Import and Package Resolution

| Code | Meaning | Notes |
| --- | --- | --- |
| `E1001` | unknown imported package. |  |
| `E1002` | cyclic package imports. |  |
| `E1003` | unknown imported file. |  |
| `E1004` | cyclic file imports. |  |
| `E1005` | duplicate exported symbol within a package. |  |
| `E1006` | file imports require a module file path. |  |

### Type Checking

| Code | Meaning | Notes |
| --- | --- | --- |
| `E2001` | type mismatch. | • The primary message stays stable, but the diagnostic detail should explain the exact failed contract when available, for example:<br>• `in IntFlag.usage param fs: expected ..., found ...`,<br>• `while initializing binding count: expected ..., found ...`,<br>• `in assignment to queue.reader: expected ..., found ...`,<br>• `in return statement: expected ..., found ...`. |
| `E2002` | language feature is not implemented yet. | • The diagnostic detail should identify the exact rejected construct (statement / expression / declaration / type) and why it failed.<br>• The public wording should describe an unimplemented feature, not a vague "subset" category.<br>• Common examples of the required detail quality:<br>• field access on an optional value should explain that `opt.field` must be rewritten as `opt?.field` or preceded by an unwrap,<br>• `yield <task_handle>;` in statement position should explain that statement `yield` is the send form and that receiving from a task handle requires value position (`let x = yield h`) or `yield * h;` for drain/forward. |
| `E2003` | unknown imported name. |  |
| `E2004` | duplicate imported name. |  |
| `E2005` | invalid assignment. |  |
| `E2006` | invalid borrow. |  |
| `E2007` | invalid `break`. |  |
| `E2008` | invalid `continue`. |  |
| `E2009` | invalid `return`. |  |
| `E2010` | missing `return`. |  |
| `E2011` | opaque struct used by value. |  |
| `E2012` | cannot instantiate opaque struct. |  |
| `E2013` | cannot access fields on opaque struct. |  |
| `E2014` | formal Silk declaration used in runtime expression. |  |
| `E2015` | binding requires an initializer. |  |
| `E2016` | generic form is not implemented yet (for example const parameters / const type arguments / generic `impl` methods). |  |
| `E2017` | invalid map type syntax; use `std::map::{HashMap, TreeMap}` instead. |  |
| `E2018` | namespace import is not callable. |  |
| `E2019` | duplicate default export in a module. |  |
| `E2020` | invalid `panic` statement. |  |
| `E2021` | unknown error type. |  |
| `E2022` | error not declared in function signature. |  |
| `E2023` | error-producing call must be handled with `match` or `?`. |  |
| `E2024` | match scrutinee is not an error-producing call. |  |
| `E2025` | match is missing an arm. |  |
| `E2026` | typed error-handling match arm must end with a terminal statement. |  |
| `E2027` | heap allocation is disabled (`--noheap`) and heap-backed allocation is rejected (`new` outside `with`, libc allocator `ext`, concurrency keywords, capturing closures). |  |
| `E2028` | unknown name. |  |
| `E2029` | ambiguous implicit coercion. |  |
| `E2030` | `await` requires an `async` function. |  |
| `E2031` | `async { ... }` / `task { ... }` requires an `async` function. |  |
| `E2032` | ambiguous constructor call. |  |
| `E2033` | `await` requires a Promise operand. |  |
| `E2034` | cannot copy a Task/Promise handle. |  |
| `E2035` | Task/Promise handle used after `await`/`yield *`. |  |
| `E2036` | cannot consume an outer Task/Promise handle inside a loop. |  |
| `E2037` | `task fn` uses a non-task-safe type at a task boundary. |  |
| `E2038` | `?` requires an error contract (`-> T \| ErrorType...`). |  |
| `E2039` | `?` requires a fallible call operand. |  |
| `E2040` | propagated error is not declared in the function signature. |  |
| `E2041` | `const` initializer is not compile-time evaluable. |  |
| `E2042` | `pure fn` may not have a typed-error contract (`\|` in return type). |  |
| `E2043` | `pure fn` may not contain `panic` statements. |  |
| `E2044` | `pure fn` may not have `mut` parameters. |  |
| `E2045` | `pure fn` may not declare mutable locals (`var` or `let mut`). |  |
| `E2046` | `pure fn` may not perform mutation via assignment. |  |
| `E2047` | `pure fn` may not allocate (`new`). |  |
| `E2048` | `pure fn` may not call impure functions. |  |
| `E2049` | `pure fn` may not be combined with `task` or `async`. |  |
| `E2050` | theories are not callable as runtime functions (use `#theory Name(...);`). |  |
| `E2051` | module does not satisfy the declared interface (missing exported function). |  |
| `E2052` | module does not satisfy the declared interface (signature mismatch). |  |
| `E2053` | unknown re-export name. |  |
| `E2054` | duplicate exported name. |  |
| `E2055` | prototype implementation is missing required import of its prototype module. |  |
| `E2056` | function expression may not have non-scalar `&T` parameters. |  |
| `E2057` | duplicate type alias name. |  |
| `E2058` | type alias cycle. |  |
| `E2059` | type alias kind mismatch. |  |
| `E2060` | unknown `extends` base. |  |
| `E2061` | invalid `extends` base. |  |
| `E2062` | cyclic `extends` chain. |  |
| `E2063` | derived struct redeclares an inherited field name. |  |
| `E2064` | derived interface redeclares an inherited method name. |  |
| `E2065` | opaque structs may not use `extends`. |  |
| `E2066` | prototype and implementation signatures do not match. |  |
| `E2067` | capturing closure is not allowed in `pure` code. |  |
| `E2068` | capturing closure uses a capture type that is not implemented yet. |  |
| `E2069` | capturing closure may not capture a mutable binding yet. |  |
| `E2070` | `yield` requires a `task` context. |  |
| `E2071` | `yield` in value position requires a Task operand. |  |
| `E2072` | `yield *` requires a Task operand. |  |
| `E2073` | `yield` as a statement requires an enclosing task function. | • `yield <value>;` is the send form.<br>• Receiving from a `Task(T)` handle is a value-position form: `let x = yield h`. |
| `E2074` | `await *` requires a Promise-array operand. |  |
| `E2075` | duplicate type name. |  |
| `E2076` | generic type arguments must be fully specified at the use site (missing a required, non-default type argument). |  |
| `E2077` | invalid `region` declaration. |  |
| `E2078` | `with` requires a region binding. |  |
| `E2079` | invalid `with ... from` region slice. |  |
| `E2080` | reserved (previously: indexing a slice cast from `u64` required an explicit length). |  |
| `E2081` | cast-length suffix requires a `u64`/`usize` pointer operand and a slice/string target. |  |
| `E2082` | `const fn` may not be `task` or `async`. |  |
| `E2083` | `const fn` may not have a typed-error contract (`\|` in return type). |  |
| `E2084` | `const fn` parameter types must be compile-time value types. |  |
| `E2085` | `const fn` result type must be a compile-time value type. |  |
| `E2086` | `const fn` may not allocate (`new`). |  |
| `E2087` | `const fn` may not call a non-`const fn`. |  |
| `E2088` | `const fn` may not contain `panic` statements. |  |
| `E2089` | unsupported construct in a `const fn` body (outside the current const-eval subset). |  |
| `E2090` | `const fn` may be called only from compile-time contexts. |  |
| `E2091` | generic function call type arguments could not be inferred at the call site. |  |
| `E2092` | use of moved value. |  |
| `E2093` | `move` requires a local binding name. |  |
| `E2094` | slice borrow escapes its lexical scope. |  |
| `E2095` | reference borrow escapes its lexical scope. |  |
| `E2096` | unknown `using` target. |  |
| `E2097` | `using` alias conflicts with an existing name. |  |
| `E2098` | `using` target is ambiguous. |  |
| `E2099` | `using` cannot import `constructor` yet. |  |
| `E2100` | `using` cannot import methods that require mutable `Self` borrows yet. |  |
| `E2101` | `using` method reuse requires compatible struct layouts. |  |
| `E2102` | cannot move value while it is borrowed. |  |
| `E2103` | invalid regexp flags (unknown or duplicate). |  |
| `E2104` | invalid regexp literal (pattern compile failed). |  |
| `E2105` | method is private to its `impl` block (not visible from the call site). |  |
| `E2106` | interface-required methods may not be declared `private`. |  |
| `E2107` | destructuring requires a non-opaque struct value. |  |
| `E2108` | cannot destructure opaque struct. |  |
| `E2109` | destructuring pattern does not match the struct type (wrong arity, unknown field, or duplicate binder/field). |  |
| `E2110` | array destructuring requires an array/slice value. |  |
| `E2111` | array destructuring pattern does not match the array type (wrong arity for fixed arrays, or duplicate binder). |  |
| `E2112` | enum destructuring requires an enum value. |  |
| `E2113` | enum destructuring pattern does not match the enum type (unknown variant or wrong arity). |  |
| `E2114` | `u128` is not implemented yet in all compiler paths. |  |
| `E2115` | `f128` is not implemented yet in all compiler paths. |  |
| `E2116` | invalid inline assembly (inline asm failed to assemble, or uses unsupported features in the current implementation). |  |
| `E2117` | `let ... else { ... };` requires the `else` block to end with a terminal statement. |  |
| `E2118` | borrowed-view type may not appear in an `async fn` result. |  |
| `E2119` | borrowed-view type may not cross an `ext` / unnamed/global-package `export fn` boundary. |  |
| `E2120` | local borrow may not remain live across `await`. |  |
| `E2121` | cannot mutate local storage while it is borrowed. |  |
| `E2122` | borrowed control-flow expression is ambiguous. |  |
| `E2123` | local borrow may not escape through an async call. |  |
| `E2124` | type does not satisfy the declared interface (missing required method). |  |
| `E2125` | type does not satisfy the declared interface (signature mismatch). |  |
| `E2126` | interface method must omit an explicit receiver parameter; ordinary interface methods already have an implicit receiver and must not spell `self: &Self` in the interface declaration. |  |

### Formal Silk Verification

| Code | Meaning | Notes |
| --- | --- | --- |
| `E3001` | loop invariant may not hold. |  |
| `E3002` | loop variant may be negative. |  |
| `E3003` | loop variant may not decrease. |  |
| `E3004` | postcondition may not hold. |  |
| `E3005` | Formal Silk verification failed to initialize or encountered an unsupported construct. |  |
| `E3006` | assertion may not hold (`#assert` and theory assertions). |  |
| `E3007` | call precondition may not hold. |  |
| `E3008` | loop monovariant may not be monotonic. |  |
Notes:

- When `silk build --debug` or `silk test --debug` is used, failed Formal Silk
 checks emit additional Z3 debug output and write an SMT-LIB2 reproduction
 script under `.silk/z3/` in the current working directory (or `$SILK_WORK_DIR/z3`).

### Code Generation / Backend Lowering

| Code | Meaning | Notes |
| --- | --- | --- |
| `E4001` | backend/target limitation prevented code generation for the requested program/output. |  |
| `E4002` | code generation failed in the backend (unexpected backend error). |  |
Notes:

- This error is reported when a program successfully parses and type-checks, but
 IR lowering or native code generation cannot yet handle a construct.
- The detail should identify the actual backend-stage blocker:
 - rejected statement/expression/function shape,
 - missing target/output support,
 - or a specific collector/layout/codegen stage failure.
- The diagnostic detail names the rejected construct kind (statement /
 expression / function / declaration) and its surface form tag when
 available.
- Executable entrypoint shape failures should name the rejected form directly
 (for example ``unsupported executable entrypoint form: `async task fn main``` )
 and say which executable entrypoint forms are currently supported.
- When executable lowering fails during runtime-support setup before ordinary
 function-body lowering begins, `E4001` should name the blocked runtime stage
 directly (for example
 ``unsupported executable runtime support: `debug panic runtime support``` )
 instead of falling back to a misleading `unsupported function: main`.
- When lowering cannot isolate a narrower statement / expression site, `E4001`
 falls back to the offending function or declaration collector stage and names
 that function / declaration directly.
- For declaration-stage layout collection failures, the note should carry the
 collector context and, when available, the rejected field or payload type
 shape so users do not have to infer it from a generic carrier such as
 `Result`.

## Tooling Integration Notes

- `silk-lsp` should map the compiler’s primary source span to the LSP diagnostic range directly.
- `silk-lsp` should preserve structured compiler guidance in the published LSP payload:
 - keep the primary `message` short and stable,
 - surface compiler `detail`, `notes`, and `helps` as structured diagnostic metadata,
 - and avoid collapsing all follow-up guidance into one opaque message blob when
 the protocol surface can carry structured fields.
- When the compiler grows multi-span diagnostics (labels and secondary spans), the LSP implementation must be updated to surface them.
