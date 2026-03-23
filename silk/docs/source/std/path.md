# `std::path`

`std::path` provides path manipulation utilities.

Design goals (modeled after Rust `std::path` and Node.js `path`):

- **Borrowed vs owned**: `string` values are non-owning views; `std::path::PathBuf`
  is an owned, growable path buffer for building paths incrementally.
- **POSIX-first**: the initial shipped implementation uses `/` as the separator
  and does not implement Windows drive/UNC path rules yet.
- **Allocation-aware**: functions that produce new paths return owned
  `std::strings::String` values (callers must drop them).

## API (Implemented Subset)

```silk
module std::path;

import std::strings;

export let SEP: string = "/";
export let DELIMITER: string = ":";

// Owned path buffer (like Rust `PathBuf`).
struct PathBuf {
  ptr: u64,
  cap: i64,
  len: i64,
}

impl PathBuf {
  public fn empty () -> std::result::Result(PathBuf, std::memory::OutOfMemory);
  public fn from_string (s: string) -> std::result::Result(PathBuf, std::memory::OutOfMemory);
  public fn as_string (self: &PathBuf) -> string;
  public fn clear (mut self: &PathBuf) -> void;
  public fn push (mut self: &PathBuf, part: string) -> std::memory::OutOfMemory?;
  public fn pop (mut self: &PathBuf) -> bool;
  public fn truncate_len (mut self: &PathBuf, new_len: i64) -> bool;
}

impl PathBuf as std::interfaces::ReserveAdditional {
  public fn reserve_additional (mut self: &PathBuf, additional: i64) -> std::memory::OutOfMemory?;
}

impl PathBuf as std::interfaces::Serialize(string) {
  public fn serialize (self: &PathBuf) -> string;
}

impl PathBuf as std::interfaces::TrySerialize(std::memory::OutOfMemory) {
  public fn try_serialize (self: &PathBuf) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
}

impl PathBuf as std::interfaces::Parse(std::memory::OutOfMemory) {
  public fn parse (value: string) -> std::result::Result(PathBuf, std::memory::OutOfMemory);
}

// Inspection.
export fn is_absolute (path: string) -> bool;

// Building and normalization.
export fn join (a: string, b: string) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);
export fn normalize (path: string) -> std::result::Result(std::strings::String, std::memory::OutOfMemory);

// Inspection helpers (views into the input string).
export fn dirname (path: string) -> string;
export fn basename (path: string) -> string;
export fn extname (path: string) -> string;
export fn stem (path: string) -> string;
```

Notes:

- On POSIX, the root path `"/"` has no basename, so `basename("/") == ""`.
- `PathBuf` uses the same zero-capacity-empty / trailing-NUL invariant as
  `std::strings::String`, captured by
  `std::strings::string_storage_well_formed`.
- `PathBuf` implements `std::interfaces::{Len,Capacity,IsEmpty,ReserveAdditional,Serialize(string),TrySerialize(std::memory::OutOfMemory),Drop}` for ergonomic use in generic code.
- `PathBuf.parse(s)` is the standardized receiverless parse surface and
  forwards to `PathBuf.from_string(s)`.
- `let s: string = pb as string;` is the allocation-free way to borrow the
  current path contents.
- `pb.try_serialize()` is the canonical fallible owned-string rendering path
  when the caller needs an independent `std::strings::String` copy.

## Separator and delimiter

- `SEP` is the path component separator. On POSIX it is `"/"`.
- `DELIMITER` is the environment-variable path list delimiter. On POSIX it is
  `":"` (for example `PATH=/bin:/usr/bin`).

## Ownership and allocation

Functions that return `std::strings::String` allocate an owned buffer.

Callers must drop returned owned strings when finished:

```silk
import std::path;
import std::strings;

fn main () -> int {
  match std::path::join("/tmp", "file.txt") {
    mut p => {
      // ...
      p.drop();
      return 0;
    },
    err: std::memory::OutOfMemory => { return 1; }
  }
}
```

Borrowing a `PathBuf` as `string` is allocation-free:

```silk
import std::path;

fn main () -> int {
  let pb_r = std::path::PathBuf.from_string("/tmp/demo");
  let mut pb = match (pb_r) {
    Ok(v) => v,
    Err(_) => std::path::PathBuf{ ptr: 0, cap: 0, len: 0 },
  };

  let view: string = pb as string;
  if view != "/tmp/demo" {
    pb.drop();
    return 1;
  }

  match (std::path::PathBuf.parse("/var/log")) {
    Ok(mut parsed) => {
      if (parsed as string) != "/var/log" {
        parsed.drop();
        pb.drop();
        return 2;
      }
      parsed.drop();
    },
    Err(_) => {
      pb.drop();
      return 3;
    },
  }

  pb.drop();
  return 0;
}
```

## `normalize`

`std::path::normalize(path)` rewrites a path into a canonical form for the
hosted POSIX subset:

- collapses repeated `/` separators,
- removes `.` components,
- resolves `..` components when possible,
- removes trailing `/` separators (except for the root path),
- preserves a leading `/` for absolute paths,
- returns `"."` for empty relative results and `"/"` for empty absolute results.

Notes:

- This is a lexical normalization. It does not access the filesystem and does
  not resolve symlinks.

## Platform notes

- **POSIX (default shipped stdlib)**: `/` separator and `:` delimiter.
- **Windows**: not implemented yet (drive letters, UNC paths, `\` separators).

## `join` note

`std::path::join(a, b)` follows Rust `Path::join` semantics:

- when `b` is absolute, the result is `normalize(b)` (the base `a` is discarded).
