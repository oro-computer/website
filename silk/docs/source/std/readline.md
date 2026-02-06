# `std::readline`

Status: **Initial implementation**.

`std::readline` provides a small, ergonomic readline-style API for reading a
single line of user input with interactive editing and history when stdin is
connected to a TTY.

The shipped implementation is based on the bundled `linenoise` sources under
`src/linenoise.{c,h}` and is exposed through the bundled runtime support
archive (`libsilk_rt`).

## Overview

Typical use:

```silk
import std::readline;

export fn main () -> int {
  let r = readline.read_line("> ");
  match (r) {
    Ok(line_opt) => match (line_opt) {
      Some(line) => {
        // ...
        (mut line).drop();
        return 0;
      },
      None => return 0, // EOF
    },
    Err(_) => {
      // Ctrl-C or other failures.
      return 1;
    },
  }
}
```

## API

### Reading

- `read_line(prompt: string = "", add_history: bool = true) -> Result(String?, ReadLineFailed)`
  - `Ok(Some(line))` on success,
  - `Ok(None)` on EOF,
  - `Err(ReadLineFailed)` on failure.

### Mode flags

- `set_multiline(enabled: bool) -> void` — enable multi-line editing.
- `set_mask_mode(enabled: bool) -> void` — enable password masking (`***`).
- `clear_screen() -> void` — clear the terminal screen.
- `print_key_codes() -> void` — print key codes for debugging.

### History

- `history_add(line: string) -> bool` — returns false when the line is not
  added (duplicates, history disabled, or internal allocation failure).
- `history_set_max_len(max_len: int) -> bool` — set the max retained entries.
- `history_load(path: string) -> Result(bool, ReadLineFailed)`
  - `Ok(true)` when loaded,
  - `Ok(false)` when the file does not exist,
  - `Err(ReadLineFailed)` on other failures.
- `history_save(path: string) -> ReadLineFailed?` — `None` on success.

### Errors

`ReadLineFailed` uses stable `std::io`-style error codes. Use
`ReadLineFailed.kind()` to classify common cases:

- `Interrupted` — returned for Ctrl-C.
- `OutOfMemory` — allocation failure (including `--noheap` builds with no
  installed runtime allocator).
- `InvalidInput` — invalid path/prompt lengths or internal overflow guards.
- `Unknown` — other failures.

## Semantics

- TTY vs. non-TTY:
  - when stdin is a TTY, input is edited interactively (arrow keys, history),
  - when stdin is not a TTY (piped input), the implementation reads a line from
    stdin without interactive editing; prompts are not displayed in this mode.
- EOF:
  - `Ok(None)` is returned on end-of-input (Ctrl-D on an empty line in TTY mode,
    or EOF on stdin in non-TTY mode).
- Ownership:
  - `read_line` returns an owned `std::strings::String`. Drop it when finished.

## Keybindings (TTY mode)

Keybindings are implemented by the bundled `linenoise` line editor. Exact
behavior depends on the terminal, but common bindings include:

- Left/Right arrows — move by one character (UTF-8 aware).
- Up/Down arrows — navigate history.
- Home/End — move to start/end of line.
- Backspace/Delete — delete characters.
- Ctrl+W — delete previous word (space-delimited).
- Ctrl+Left / Ctrl+Right — move by word (identifier/punctuation runs).
- Alt+Left / Alt+Right — move by word (when the terminal sends xterm-style CSI
  modifier sequences).
- Alt+B / Alt+F — move by word (Meta key sequences: `ESC b` / `ESC f`).

## Implementation Notes

- Internal `linenoise` heap usage is routed through the `silk_rt_malloc_bytes`
  allocator surface so embedders can override allocations via
  `silk_rt_set_allocator` (`include/silk_rt.h`).
- The returned line is copied into an owned allocation compatible with
  `std::runtime::mem::free` / `std::strings::String.drop()` (payload pointer
  includes the standard 8-byte header used by the hosted runtime).

## Current Limitations

- `linenoise` completion/hints callbacks are not exposed yet (they require a
  stable callback/FFI story for passing function pointers between Silk and C).
- The non-blocking `linenoiseEdit*` API is not exposed yet.
