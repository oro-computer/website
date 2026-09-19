---
layout: "docs"
description: "std::env provides access to process environment variables."
docsCollection: "silk"
section: "std"
order: 91
sourcePath: "std/env.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::env`](/silk/docs/std/env/)

[`std::env`](/silk/docs/std/env/) provides access to process environment variables.

This module targets a hosted POSIX baseline (Linux with glibc or musl) and is
implemented on top of the pluggable [`std::runtime::env`](/silk/docs/std/runtime-env/) interface. WASI support
is Implemented: `get` works, while `set` remains unsupported (see
“Platform notes”).

## Exported API

```silk
module std::env;

import std::process;
import std::strings;
import std::args;

enum SetVarErrorKind { InvalidKey, OutOfMemory, Unknown }

error SetVarFailed { code: int }

export type Args = std::args::Args;
export type ExecutablePathResult = std::process::ExecutablePathResult;

export fn get (key: string) -> string?;
export fn set (key: string, value: string) -> SetVarFailed?;

export fn cwd () -> string?;
export fn home_dir () -> string?;
export fn temp_dir () -> string;

// Working-directory helpers that query the OS (not the environment).
export fn get_current_dir () -> std::process::GetCwdResult;
export fn set_current_dir (path: string) -> std::process::ChdirFailed?;

// Process argument and executable-path helpers.
export fn args (argc: int, argv: u64) -> Args;
export fn executable_path_from_args (argc: int, argv: u64) -> string?;
export fn executable_path () -> ExecutablePathResult;
```

### `get`

[`std::env::get(key)`](/silk/docs/std/env/) returns:

- `Some(value)` when the variable exists, otherwise
- `None`.

The returned `string` is a **view** into the underlying runtime environment
storage. It does not copy. On POSIX, `get` does not allocate. On WASI, `get`
may allocate once on first use to cache an environment snapshot (WASI requires
caller-provided buffers for `environ_get`).

Callers should treat the view as valid only until the environment is mutated
(for example by calling [`std::env::set`](/silk/docs/std/env/)). On WASI Preview 1, environment
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

[`std::env::set(key, value)`](/silk/docs/std/env/) updates the current process environment.

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
 layer backing [`std::process::getcwd`](/silk/docs/std/process/) / [`std::process::chdir`](/silk/docs/std/process/) (they do not
 mutate `$PWD`).

## Directory helpers

[`std::env`](/silk/docs/std/env/) also provides a tiny subset for common directory
queries.

### `cwd`

[`std::env::cwd()`](/silk/docs/std/env/) returns the current working directory as a `string?`.

Current implementation:

- returns [`std::env::get("PWD")`](/silk/docs/std/env/).

This is a pure environment-variable view and may be missing or stale if the
process environment is not kept in sync with the real working directory.

On `wasm32-wasi`, `$PWD` is often unset and does not track the virtual cwd used
by [`std::process::chdir`](/silk/docs/std/process/); prefer `get_current_dir` when you need the runtime
working directory.

### `get_current_dir`

[`std::env::get_current_dir()`](/silk/docs/std/env/) returns the current working directory as an owned
[`std::strings::String`](/silk/docs/std/strings/).

This is an alias for [`std::process::getcwd()`](/silk/docs/std/process/) and queries the OS, not the
process environment.

Ownership:

- Callers must drop the returned `String` when finished.

### `set_current_dir`

[`std::env::set_current_dir(path)`](/silk/docs/std/env/) changes the current working directory.

This is an alias for [`std::process::chdir(path)`](/silk/docs/std/process/).

## Arguments And Executable Paths

[`std::env`](/silk/docs/std/env/) exposes small wrappers around [`std::args`](/silk/docs/std/args/) and [`std::process`](/silk/docs/std/process/) so CLI
tools can keep environment, argv, cwd, and executable-path access in one
module.

### `args`

[`std::env::args(argc, argv)`](/silk/docs/std/env/) constructs a zero-copy [`std::args::Args`](/silk/docs/std/args/) view from
the hosted `main(argc, argv)` entrypoint values. The returned argument strings
borrow the original argv memory.

### `executable_path_from_args`

[`std::env::executable_path_from_args(argc, argv)`](/silk/docs/std/env/) returns `argv[0]` as a
borrowed `string?`. It does not allocate and is suitable when the executable
name supplied by the launcher is enough.

### `executable_path`

[`std::env::executable_path()`](/silk/docs/std/env/) returns an owned, OS-queried executable path via
[`std::process::executable_path()`](/silk/docs/std/process/). The returned `String` must be dropped by the
caller.

### `home_dir`

[`std::env::home_dir()`](/silk/docs/std/env/) returns the user’s home directory as a `string?`.

Current implementation:

- returns [`std::env::get("HOME")`](/silk/docs/std/env/).

### `temp_dir`

[`std::env::temp_dir()`](/silk/docs/std/env/) returns a temporary-directory path as a `string`.

Current implementation:

1. uses `TMPDIR` when set,
2. otherwise uses `TMP` or `TEMP` when set,
3. otherwise returns `"/tmp"`.
