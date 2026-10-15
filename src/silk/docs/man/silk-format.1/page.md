---
layout: "docs"
description: "NOTE: This is the Markdown source for the eventual man 1 page for silk format. The roff-formatted manpage should be generated from this content."
docsCollection: "silk"
section: "man"
order: 293
sourcePath: "man/silk-format.1.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`silk-format(1)`](/silk/docs/man/silk-format.1/) — Format Silk Source Files

> NOTE: This is the Markdown source for the eventual man 1 page for `silk format`. The roff-formatted manpage should be generated from this content.

## Name

`silk-format` — format Silk source files.

## Synopsis

- `silk format [options] <path> [<path> ...]`
- `silk fmt [options] <path> [<path> ...]`
- `silk format [--config <silk.toml> | --no-config] [--set <key=value>]... --print-config <file>`

## Description

`silk format` rewrites Silk source files (`.slk` and `.silk`) to the canonical formatting style.

The formatter independently searches upward from each source file for the
nearest `silk.toml` and nearest `.silk/format.toml`. The manifest's `[format]`
table supplies shared package policy. Explicit fields in `.silk/format.toml`
form a partial developer/user overlay; omitted fields inherit from the
manifest or built-in defaults. The overlay may be project-local, live in a
higher user directory, and be ignored by version control without disabling
discovery. Use `--print-config <file>` to inspect the fully merged policy.

When you pass a directory, the recursive walk also honors `.gitignore` files in
that tree (including parent repository ignore files when you format a
subdirectory). Explicitly named file arguments still format even when they are
ignored, so you can target a specific generated or local file intentionally.

The formatter is readability-oriented:

- it normalizes indentation,
- it splits same-line statement runs so each statement or block body starts on its own line,
- it keeps semicolons nested inside paren/bracket groups inline instead of treating them as standalone statement breaks (for example `join(T; h)` and `for (...; ...; ...)` stay single-line unless the source already uses a multiline layout),
- it preserves multiline `if` / `else if` headers by keeping the opening `{`
 on its own line and indenting continued condition lines one level deeper
 than the control keyword, including when the first operand shares the `if`
 line and later logical operands continue on following lines,
- it puts a binary operator at the end of the preceding line when a
 whitespace-only expression continuation was written with the operator at
 the beginning of the next line, and rejoins a binary continuation when the
 resulting physical line fits `line_width`; an over-width inline expression
 breaks after a shallow, low-precedence binary operator and indents its
 operand as a continuation. When a flat same-precedence infix chain wraps,
 its first operand remains on the header line and every later top-level
 operand occupies a separate continuation line, with each operator trailing;
 higher-precedence subexpressions remain grouped. A short first right-hand
 fragment remains beside `=` after wrapping. A short RHS also remains
 attached when a long target makes the assignment over-width, because moving
 that value would not repair the target; a line ending at assignment is
 reserved for a substantial indivisible value that cannot fit there or a
 continuation whose existing comment boundary cannot be crossed safely,
- it treats operator roles separately: postfix field-access chains break
 before `.` or `?.`, namespace access and unary operators remain attached,
 casts and type tests keep `as` / `is` with the target type, and `->` / `=>`
 stay with the return type or match-arm body. Short comment-free
 continuations rejoin when they fit, and an operator is never left alone on a
 physical line,
- it keeps tight prefix operators/modifiers with their operand, including
 symbolic unary operators, prefix `++` / `--`, `await`, `yield`, `new`,
 `move`, and `mut`. Postfix `?` / `++` / `--`, variadic `...`, and postfix
 call/index openers remain attached to the expression or binder they modify;
 comment-bearing boundaries remain unchanged,
- it gives `in`, `from`, `extends`, and `:` trailing ownership when their
 construct wraps. These tokens rejoin when the full line fits and are used as
 late fallbacks after a clearer breakpoint inside the following expression,
- it keeps calls, arrays, and tuple-like parenthesized lists compact while the
 surrounding line fits `line_width`; when a list must expand, its top-level
 arguments or elements occupy separate indented lines and its closing
 delimiter aligns structurally. Expanding a right-hand-side list takes
 precedence over a generic break after assignment,
- it keeps multiline [`match`](/silk/wiki/language/flow-match/) branches one arm per line and breaks an
 over-width arm before `=>`, keeping the arrow attached to the arm body,
- it keeps a comment-free record-literal binding or update on one line when
 the complete assignment fits `line_width`; when it does not fit, the binding
 and record opener stay together, top-level record fields occupy separate
 indented lines, and a braced destructuring pattern is collapsed onto the
 header when that header fits. An already-multiline destructuring record
 binding retains a multiline layout, but relocates those breaks to the fields
 instead of isolating `=` or the binding pattern. Direct names and
 field-access update targets use the same field-aware layout,
- it applies that compact-or-field-per-line record choice in every value
 position, including returns, call arguments, match arms, and coalescing
 expressions; a sole record argument expands its fields before the
 surrounding call is split,
- it inserts a visual separator after standalone block-closing `}` boundaries
 when the next token starts a new statement or declaration, and after
 semicolon-terminated multiline brace expressions when the next token starts
 a keyword-led statement or expression,
- it keeps inline aggregate values such as `Config {}` compact instead of
 inserting a separator solely because their statement ends with `};`,
- it keeps `} else {` on one line,
- it preserves the file’s detected newline style (`\n` or `\r\n`) when it emits new layout,
- it preserves ordinary line/block comments instead of deleting or reflowing
 them away,
- it normalizes the outer margin of standalone multiline Silkdoc blocks so
 `/**` follows the surrounding structural indentation and leading `*` body
 lines plus `*/` align one space deeper, without reflowing comment text,
- and it reflows large named-import lists into one imported symbol per line.

When the leading package/module/import header contains only declarations and whitespace, `silk format` also canonicalizes imports into three sections:

- `std::...` and std-root imports first,
- then non-relative package/module imports,
- then relative file imports,

with alphabetical sorting inside each section.

This header reordering pass is intentionally conservative. If the leading header region contains ordinary comments or other non-whitespace trivia between declarations, the formatter keeps that region in source order instead of rewriting it. It still normalizes the blank-line boundary between that preserved header region and the first non-header declaration.

## Options

- `--json` — emit newline-terminated, schema-versioned changed-file results
 on stdout.
- `--check` — do not write files; run configured format, line-width,
 trailing-whitespace, and final-newline checks.
- `--config <silk.toml>` — use one explicit manifest for every input instead of
 per-file discovery.
- `--no-config` — skip manifest and local-overlay discovery and use built-in
 defaults.
- `--set <key=value>` — override one `[format]` scalar for this invocation.
 Repeatable; enum strings may be unquoted, for example
 `--set indent_width=4 --set line_ending=lf`.
- `--print-config <file>` — print the effective `[format]` table for `file` and
 exit without formatting or checking it.
- `--help`, `-h` — show command usage and exit.
- `--` — end of options (treat following args as paths, even if they begin with `-`).

## JSON Output

`--json` schema version 2 emits `schemaVersion`, `command`, `ok`, `check`,
`status`, `changedCount`, `changedFiles`, `warningCount`, `errorCount`, and
`diagnostics`. Each diagnostic contains `severity`, `rule`, `path`, `line`,
`column`, and `message`.

In `--check --json` mode, `ok` and the exit code follow configured severity,
warning-denial, and warning-budget policy. A file may therefore appear in
`changedFiles` while `format_check = "warn"` still exits successfully.

## Configuration and local overlay

The canonical configuration is the `[format]` table in `silk.toml`:

```toml
[format]
style = "silk"                    # silk | compact
enabled = true
indent_style = "space"
indent_width = 2
line_width = 100
line_ending = "preserve"          # preserve | lf | crlf
final_newline = "always"          # always | preserve | never
trim_trailing_whitespace = true

organize_imports = true
sort_import_names = true
named_import_multiline_threshold = 3
split_statements = true
multiline_condition_brace = "next-line" # next-line | same-line | preserve
blank_line_after_block = true
blank_line_after_multiline_expression = true
align_silkdoc = true

format_check = "error"            # off | warn | error
line_width_check = "off"
trailing_whitespace_check = "off"
final_newline_check = "off"
deny_warnings = false
max_warnings = 0                   # zero disables the warning ceiling
```

`style` establishes defaults before explicit fields are applied. `compact`
defaults the two post-brace blank-line controls to `false` and the named-import
threshold to `6`; every field can still be overridden. `line_width` is a check
ceiling, not permission to reflow arbitrary expressions or comment prose.

A personal or development-only `.silk/format.toml` should list only the values
that differ from package policy, for example:

```toml
[format]
indent_width = 4
line_width_check = "warn"
```

The nearest such file overlays the nearest manifest even when the two live at
different ancestor levels. It may be ignored by version control. The `[format]`
header may be omitted for compatibility with older standalone formatter files.
An explicit `--config` disables this discovery; repeated `--set` values remain
the highest-precedence layer.

The four check settings use ESLint-style severities. `off` disables the check,
`warn` reports without failing by itself, and `error` fails. `deny_warnings`
makes every warning fail; a positive `max_warnings` fails when the number of
warnings exceeds it.

Unknown keys and invalid values are errors. Full ranges, exact behavior,
presets, overlay rules, and precedence are specified in the
[package-manifest documentation](/silk/docs/compiler/package-manifests/).

## Notes

- Multi-line string literals (including raw backtick strings) are preserved
 verbatim, including their internal line endings.
- Ordinary line/block comments are preserved; multiline ordinary block-comment
 bodies keep their source text. Standalone multiline Silkdoc blocks preserve
 their text while normalizing the `/**`, leading `*`, and `*/` outer margin.
- Formatter-emitted layout preserves the file’s detected newline convention instead of mixing LF into CRLF files.
- The formatter preserves comment-bearing header regions instead of reordering them.
- Recursive directory walks honor `.gitignore`; explicitly named file paths still format.
- The formatter does not type-check inputs; use `silk check` to validate code.

## Examples

```sh
silk fmt src
silk format --check .
silk format --check --json .
silk format --print-config src/main.slk
silk format --set style=compact --set line_width=120 src
```

```silk
import util from pkg::util;
import { Delta, Alpha, Beta, Gamma } from "./local.slk";
import "./a.slk";
import std::io;
import { Zebra, Beta, Alpha, Gamma } from pkg::names;
import std::fs;

fn main () -> int { let x: int = 1; if x == 1 { return 0; } return 1; }
```

becomes:

```silk
import std::fs;
import std::io;

import {
  Alpha,
  Beta,
  Gamma,
  Zebra,
} from pkg::names;
import util from pkg::util;

import "./a.slk";
import {
  Alpha,
  Beta,
  Delta,
  Gamma,
} from "./local.slk";

fn main () -> int {
  let x: int = 1;
  if x == 1 {
    return 0;
  }

  return 1;
}
```

## See Also

- [`silk(1)`](/silk/docs/man/silk.1/)
- [`silk-check(1)`](/silk/docs/man/silk-check.1/)
