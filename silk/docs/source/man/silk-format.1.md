# [`silk-format(1)`](?p=man/silk-format.1) — Format Silk Source Files

> NOTE: This is the Markdown source for the eventual man 1 page for `silk format`. The roff-formatted manpage should be generated from this content.

## Name

`silk-format` — format Silk source files.

## Synopsis

- `silk format [options] <path> [<path> ...]`
- `silk fmt [options] <path> [<path> ...]`

## Description

`silk format` rewrites Silk source files (`.slk` and `.silk`) to the canonical formatting style.

The formatter discovers project configuration by searching for `.silk/format.toml`, starting from each formatted file’s directory and walking upward to the filesystem root. The first config file found applies to that file.

When you pass a directory, the recursive walk also honors `.gitignore` files in
that tree (including parent repository ignore files when you format a
subdirectory). Explicitly named file arguments still format even when they are
ignored, so you can target a specific generated or local file intentionally.

The formatter is readability-oriented:

- it normalizes indentation,
- it splits same-line statement runs so each statement or block body starts on its own line,
- it keeps semicolons nested inside paren/bracket groups inline instead of treating them as standalone statement breaks (for example `join(T; h)` and `for (...; ...; ...)` stay single-line unless the source already uses a multiline layout),
- it preserves newline-based `if` / `else if` headers by keeping the opening
 `{` on its own line and indenting chained condition lines one level deeper
 than the control keyword,
- it inserts a visual separator after standalone block-closing `}` boundaries when the next token starts a new statement or declaration,
- it keeps `} else {` on one line,
- it preserves the file’s detected newline style (`\n` or `\r\n`) when it emits new layout,
- it preserves ordinary line/block comments instead of deleting or reflowing them away,
- and it reflows large named-import lists into one imported symbol per line.

When the leading package/module/import header contains only declarations and whitespace, `silk format` also canonicalizes imports into three sections:

- `std::...` and std-root imports first,
- then non-relative package/module imports,
- then relative file imports,

with alphabetical sorting inside each section.

This header reordering pass is intentionally conservative. If the leading header region contains ordinary comments or other non-whitespace trivia between declarations, the formatter keeps that region in source order instead of rewriting it. It still normalizes the blank-line boundary between that preserved header region and the first non-header declaration.

## Options

- `--check` — do not write any files; exit non-zero if any file would change.
- `--help`, `-h` — show command usage and exit.
- `--` — end of options (treat following args as paths, even if they begin with `-`).

## Configuration (`.silk/format.toml`)

The formatter reads configuration from a TOML file at `.silk/format.toml`.

Supported keys (under the `[format]` table):

- `indent_style = "space" | "tab"` (default: `"space"`)
- `indent_width = <int>` (default: `2`; used only when `indent_style = "space"`)

Example:

```toml
[format]
indent_style = "space"
indent_width = 2
```

## Notes

- Multi-line string literals (including raw backtick strings) are preserved verbatim.
- Ordinary line/block comments are preserved; multiline block-comment bodies keep their source text.
- Formatter-emitted layout preserves the file’s detected newline convention instead of mixing LF into CRLF files.
- The formatter preserves comment-bearing header regions instead of reordering them.
- Recursive directory walks honor `.gitignore`; explicitly named file paths still format.
- The formatter does not type-check inputs; use `silk check` to validate code.

## Examples

```sh
silk fmt src
silk format --check .
```

```silk
import util from "pkg::util";
import { Delta, Alpha, Beta, Gamma } from "./local.slk";
import "./a.slk";
import io from "std/io";
import { Zebra, Beta, Alpha, Gamma } from "pkg::names";
import fs from "std/fs";

fn main () -> int { let x: int = 1; if x == 1 { return 0; } return 1; }
```

becomes:

```silk
import fs from "std/fs";
import io from "std/io";

import {
  Alpha,
  Beta,
  Gamma,
  Zebra,
} from "pkg::names";
import util from "pkg::util";

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

- [`silk(1)`](?p=man/silk.1)
- [`silk-check(1)`](?p=man/silk-check.1)
