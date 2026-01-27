# Silkdoc (Documentation Comments)

This document specifies **Silkdoc**, Silk’s documentation-comment format.
Silkdoc comments are intended for tools (documentation generators, editors,
and the language server). They **do not** affect program semantics.

The goal is a familiar JSdoc feel with Silk/TypeScript-style type annotations.

## Comment Forms

Two doc-comment forms are recognized:

- **Block doc comments**: `/** ... */`
- **Line doc comments**: one or more consecutive lines starting with `///`

In both forms, doc comments attach to the *next* declaration when they appear
immediately before it with only whitespace/comments between them.

Initial implementation scope:

- Doc comments attach to **top-level declarations** (`package`, `module`,
  `import`, `fn`, `theory`, `let`, `struct`, `ext`, `interface`, `impl`).
- Doc comments also attach to:
  - methods inside `impl Type { ... }` blocks, and
  - method signatures inside `interface Name { ... }` blocks.
- For function declarations, doc comments attach even when one or more formal
  verification annotations (`#require` / `#assure`) appear between the doc
  comment and the `fn` keyword.
- Doc comments inside function bodies are treated as ordinary comments (not
  attached to anything).
- Attaching doc comments to struct fields, parameters, and locals is future
  work.

## Content Model

A doc comment contains:

- free-form text (Markdown-friendly) describing the declaration, and
- optional **tags** starting with `@`.

The free-form text is everything before the first tag line.

Any non-tag lines that appear after the first tag line are ignored unless they
are part of a multi-line tag body (for example `@example` or `@remarks`).

### Leading `*` convention

For block doc comments, the conventional leading `*` is ignored:

```silk
/**
 * Hello
 * world
 */
```

Tools strip the leading `*` (and one following space when present) before
parsing.

## Tags

Tags begin at the start of the logical line after stripping comment prefixes.

### `@param`

Declare a parameter description.

Syntax:

```text
@param <name>: <Type> <description...>
@param <name> <description...>
```

The `<Type>` uses Silk type syntax as defined in `docs/language/types.md`.

Example:

```silk
/**
 * Appends one byte to the vector, growing as needed.
 *
 * @param self: &std::vector::Vector(u8) The receiver.
 * @param value: u8 The byte to append.
 */
```

### `@returns`

Describe the return value.

Syntax:

```text
@returns <Type> <description...>
@returns <description...>
```

### `@throws`

Describe an error/exception-like condition.

Syntax:

```text
@throws <Type> <description...>
@throws <description...>
```

Note: the language does not yet have a stable error type; `@throws` is
documentation-only until `Result(T, E)` and error conventions are fully
implemented.

### `@external`

Indicate that a declaration is an **external FFI binding** (its implementation
is provided outside Silk).

This tag is typically used to document `ext` function declarations.

Syntax:

```text
@external
```

### `@example`

Provide an example snippet. The tag may optionally declare a language for
Markdown fenced code blocks.

Syntax:

```text
@example
<one or more lines of example text>

@example silk
<one or more lines of code>
```

The example body continues until the next tag line or the end of the doc
comment.

### Other tags

The initial toolchain may also recognize:

- `@since <text...>`
- `@deprecated <text...>`
- `@remarks <text...>` (may span multiple lines like `@example`)
- `@see <text...>` (repeatable)

Additional tags must be documented here before they are relied on by tooling.

### Formal Silkdoc tags

Silkdoc can document Formal Silk constructs without affecting verification.
These tags are documentation-only (they do not prove anything and do not
introduce Formal Silk obligations).

#### `@requires`

Document one precondition for a declaration (typically mirroring `#require` on a
function or a theory).

Syntax:

```text
@requires <Expr...>
```

This tag is repeatable.

#### `@assures`

Document one postcondition for a declaration (typically mirroring `#assure` on
a function or a theory).

Syntax:

```text
@assures <Expr...>
```

This tag is repeatable.

#### `@asserts`

Document one internal proof obligation (typically mirroring a `#assert` inside a
function or theory body).

Syntax:

```text
@asserts <Expr...>
```

This tag is repeatable.

#### `@theory`

Document one theory attachment or use (typically mirroring `#theory Name(args...);`).

Syntax:

```text
@theory <Name(args...)...>
```

This tag is repeatable.

### Manpage-oriented tags

The toolchain uses a small set of optional doc tags to generate `man(7)` pages
from source comments (`silk doc --man` and `silk man`).

These tags are documentation-only and do not affect program semantics.

#### `@misc`

Declare a conceptual documentation block intended for man section 7.

Syntax:

```text
@misc <label> <summary...>
@misc <label>
```

Notes:

- The `<label>` is an opaque identifier used by tooling for discovery (for
  example `silk man <label>`). It should be stable and globally unique within a
  package (recommendation: use a `pkg::topic` label).
- The optional `<summary...>` provides a one-line description for the manpage
  `NAME` section. When omitted, tools may derive a summary from the first line
  of the free-form description text.

#### `@cli`

Declare that a doc comment describes a command-line interface, intended for man
section 1.

Syntax:

```text
@cli <name>
@cli
```

When `<name>` is omitted, tools derive the command name from context (for
example the module name or executable name provided by the build system).

#### `@synopsis`

Provide one or more synopsis lines for a CLI manpage.

Syntax:

```text
@synopsis
<one or more lines of synopsis text>
```

The synopsis body continues until the next tag line or the end of the doc
comment.

#### `@option`

Declare a command-line option for a CLI manpage. This tag is repeatable.

Syntax:

```text
@option <prototype...>
@option `<prototype...>` <description...>
```

Examples:

```text
@option `-h, --help` Show help and exit.
@option `--out <path>` Write output to <path>.
```

#### `@command`

Declare a subcommand for a CLI manpage. This tag is repeatable.

Syntax:

```text
@command <name> <description...>
```

## Markdown Rendering

The documentation generator renders doc comments to Markdown using:

- the free-form text as the leading description (paragraphs preserved),
- `@param` entries as a “Parameters” list,
- `@returns` as a “Returns” section,
- `@throws` as a “Throws” section,
- `@requires`, `@assures`, `@asserts`, and `@theory` as dedicated sections (one
  bullet per tag instance),
- `@example` blocks as fenced code blocks.

The generator must keep formatting stable (deterministic output) so that
documentation diffs are meaningful.
