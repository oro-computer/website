# [`silk-repl(1)`](?p=man/silk-repl.1) - Interactive Silk REPL

> NOTE: This is the Markdown source for the eventual man 1 page for `silk repl`. The roff-formatted manpage should be generated from this content.

## Name

`silk-repl` - start an interactive compile-and-run Silk session.

## Synopsis

- `silk repl`
- `silk repl --help`

## Description

`silk repl` starts the interactive Silk read-eval-print loop. It is the same
mode entered when `silk` is launched with no command and stdin is a TTY.

The REPL keeps session state by replaying committed state-building lines:

- imports are persisted after syntax and import-target validation,
- top-level declarations are persisted after compilation validation,
- runtime bindings and assignments are replayed for later runtime lines,
- simple committed value bindings may reuse cached rendered values until state
 changes,
- failed parse, check, compile, or execution attempts are not committed,
- one-off runtime calls such as `println("...");` execute once and are not
 replayed.

Runtime snippets may use top-level `await`; the REPL emits an async synthetic
entrypoint for snippets or replayed state lines that need one. Bare
auto-printed `async fn` calls are awaited before their values are rendered.

Interactive TTY input supports Silk syntax highlighting, dim inline completion
hints when colors are available, Tab completion, reverse incremental history
search with `Ctrl-R`, multiline input with continuation indentation, and paste
handling for chunks that contain multiple top-level entries.

## Built-In Commands

- `.help` - show REPL help.
- `.man <query>` - show inline docs for current-session symbols, imported
 symbols, and `std::...` modules or symbols.
- `.clear` - reset session state.
- `.cls` - clear the screen.
- `.undo` - undo the last committed line.
- `.exit` - exit the REPL.

The `.man` command is intentionally narrower than `silk man`: it is for inline
REPL browsing. Use `silk man --list`, `silk man --search <pattern>`, and
sectioned queries such as `silk man 7 silk` outside the REPL.

## Options

- `--help`, `-h` - show command help and exit.

## Environment

- `SILK_REPL_HISTORY` - history file path. When unset, the REPL uses
 `$SILK_WORK_DIR/repl_history`.
- `SILK_WORK_DIR` - work directory used for REPL history when
 `SILK_REPL_HISTORY` is unset. Default: `.silk` under the nearest package root
 or current directory.
- `NO_COLOR` / `TERM=dumb` - disable ANSI-colored interactive surfaces.

## Exit Status

- `0` on normal exit.
- non-zero on startup or command-line usage errors.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-man(1)`](?p=man/silk-man.1), [`silk-doc(1)`](?p=man/silk-doc.1)
- [cli silk](?p=compiler/cli-silk)
