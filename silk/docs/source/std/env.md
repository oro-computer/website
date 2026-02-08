# `std::env`

Status: **Implemented subset**.

`std::env` provides access to process environment variables.

This module targets a hosted POSIX baseline (Linux/glibc) and is
implemented on top of the pluggable `std::runtime::env` interface. WASI support
is partially implemented: `get` works, while `set` remains unsupported (see
“Platform notes”).

## API

```silk
module std::env;

import std::process;
import std::strings;

enum SetVarErrorKind { InvalidKey, OutOfMemory, Unknown }

error SetVarFailed { code: int }

export fn get (key: string) -> string?;
export fn set (key: string, value: string) -> SetVarFailed?;

export fn cwd () -> string?;
export fn home_dir () -> string?;
export fn temp_dir () -> string;

// Working-directory helpers that query the OS (not the environment).
export fn get_current_dir () -> std::process::GetCwdResult;
export fn set_current_dir (path: string) -> std::process::ChdirFailed?;
```

### `get`

`std::env::get(key)` returns:

- `Some(value)` when the variable exists, otherwise
- `None`.

The returned `string` is a **view** into the underlying runtime environment
storage. It does not copy. On POSIX, `get` does not allocate. On WASI, `get`
may allocate once on first use to cache an environment snapshot (WASI requires
caller-provided buffers for `environ_get`).

Callers should treat the view as valid only until the environment is mutated
(for example by calling `std::env::set`). On WASI Preview 1, environment
mutation is not supported by the runtime, so values returned by `get` remain
valid for the process lifetime.

Example:

```silk
import std::env;
import { println } from "std/io";

fn main () -> int {
  let v_opt = std::env::get("FOO");
  match (v_opt) {
    Some(v) => println("FOO = {}", v),
    None => println("FOO does not exist"),
  };
  return 0;
}
```

### `set`

`std::env::set(key, value)` updates the current process environment.

Errors are reported as an optional error value (`SetVarFailed?`).

`SetVarFailed` does not expose platform `errno` values. Use
`SetVarFailed.kind()` to classify failures into `SetVarErrorKind` values.

Example:

```silk
import std::env;
import { println } from "std/io";

fn main () -> int {
  if std::env::set("FOO", "BAR") != None {
    println("failed to set FOO");
    return 1;
  }
  return 0;
}
```

## Platform notes

- **POSIX (default shipped stdlib)**: implemented via `getenv(3)` and
  `setenv(3)`.
- **WASI**:
  - `get` is implemented via WASI Preview 1 `environ_sizes_get` /
    `environ_get` and caches the returned environment buffer for the process
    lifetime,
  - `set` is not supported on WASI Preview 1 and always fails (returns
    `Some(SetVarFailed{ code: ... })` with `kind() == Unknown`).
  - `get_current_dir` / `set_current_dir` are implemented via the virtual cwd
    layer backing `std::process::getcwd` / `std::process::chdir` (they do not
    mutate `$PWD`).

## Directory helpers

`std::env` also provides a tiny subset for common directory
queries.

### `cwd`

`std::env::cwd()` returns the current working directory as a `string?`.

Current implementation:

- returns `std::env::get("PWD")`.

This is a pure environment-variable view and may be missing or stale if the
process environment is not kept in sync with the real working directory.

On `wasm32-wasi`, `$PWD` is often unset and does not track the virtual cwd used
by `std::process::chdir`; prefer `get_current_dir` when you need the runtime
working directory.

### `get_current_dir`

`std::env::get_current_dir()` returns the current working directory as an owned
`std::strings::String`.

This is an alias for `std::process::getcwd()` and queries the OS, not the
process environment.

Ownership:

- Callers must drop the returned `String` when finished.

### `set_current_dir`

`std::env::set_current_dir(path)` changes the current working directory.

This is an alias for `std::process::chdir(path)`.

### `home_dir`

`std::env::home_dir()` returns the user’s home directory as a `string?`.

Current implementation:

- returns `std::env::get("HOME")`.

### `temp_dir`

`std::env::temp_dir()` returns a temporary-directory path as a `string`.

Current implementation:

1. uses `TMPDIR` when set,
2. otherwise uses `TMP` or `TEMP` when set,
3. otherwise returns `"/tmp"`.
