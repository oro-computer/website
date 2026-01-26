# `std::fs`

Status: **Implemented subset**. `std::fs` provides a small hosted
filesystem API backed by `std::runtime::fs`. It exposes a low-level `File`
handle and byte-oriented I/O primitives, staying within the current compiler’s
feature set.

The public `std::fs` surface does not expose POSIX `errno`. Runtime-specific
details live under `std::runtime`.

See also:

- `docs/std/io.md` (shared I/O error conventions and reader/writer traits)
- `docs/std/path.md` (path manipulation helpers)
- `docs/std/runtime.md` (runtime interface layer and pluggable runtimes)
- `docs/std/conventions.md`

## Implemented API

A hosted POSIX baseline exists today in `std/fs.slk`. The low-level OS bindings
are provided via `std::runtime::fs` (which defaults to a POSIX implementation
in the shipped stdlib).

```silk
module std::fs;

export fn exists (path: string) -> bool;
export fn can_read (path: string) -> bool;
export fn can_write (path: string) -> bool;
export fn can_exec (path: string) -> bool;

enum FsErrorKind {
  OutOfMemory,
  NotFound,
  PermissionDenied,
  AlreadyExists,
  NotADirectory,
  IsADirectory,
  InvalidInput,
  UnexpectedEof,
  Unknown,
}

struct FsFailed {
  code: int,
  requested: i64,
}

impl FsFailed {
  public fn kind (self: &FsFailed) -> FsErrorKind;
}

export type FsError = FsFailed;

export type FsIntResult = std::result::Result(int, FsFailed);
export type FsI64Result = std::result::Result(i64, FsFailed);
export type FsErrorIntResult = std::result::Result(int, FsError);
export type FsBufferU8Result = std::result::Result(std::buffer::BufferU8, FsError);
export type FsStringResult = std::result::Result(std::strings::String, FsError);

struct OpenOptions {
  read: bool,
  write: bool,
  create: bool,
  truncate: bool,
  append: bool,
  mode: int,
}

impl OpenOptions {
  public fn read_only () -> OpenOptions;
  public fn write_only () -> OpenOptions;
  public fn read_write () -> OpenOptions;
  public fn create_truncate (mode: int) -> OpenOptions;
  public fn create_append (mode: int) -> OpenOptions;
}

enum SeekWhence {
  Start,
  Current,
  End,
}

// A file descriptor wrapper.
struct File {
  fd: int,
}

export type FileResult = std::result::Result(File, FsFailed);

impl File {
  // Construct an invalid/closed file handle (`fd = -1`).
  public fn invalid () -> File;

  // Open a file (portable options, hosted baseline implementation).
  public fn open (path: string, opts: OpenOptions) -> FileResult;
  public fn open_read (path: string) -> FileResult;
  public fn open_write (path: string) -> FileResult;
  public fn create (path: string, mode: int) -> FileResult;
  public fn append (path: string, mode: int) -> FileResult;
  public fn is_valid (self: &File) -> bool;
  public fn close (mut self: &File) -> FsFailed?;

  // Byte I/O (hosted baseline).
  public fn read (self: &File, buf: std::arrays::ByteSlice) -> FsIntResult;
  public fn read_exact (self: &File, buf: std::arrays::ByteSlice) -> FsFailed?;
  public fn write (self: &File, buf: std::arrays::ByteSlice) -> FsIntResult;
  public fn seek (self: &File, offset: i64, whence: SeekWhence) -> FsI64Result;
  public fn tell (self: &File) -> FsI64Result;
  public fn size (self: &File) -> FsI64Result;
  public fn sync (self: &File) -> FsFailed?;
  public fn truncate (self: &File, len: i64) -> FsFailed?;

  // Convenience helpers.
  public fn read_to_end (self: &File, mut out: &std::buffer::BufferU8) -> FsErrorIntResult;
  public fn write_all (self: &File, buf: std::arrays::ByteSlice) -> FsFailed?;
}

// Files are closed on scope exit and on overwrite.
impl File as std::interfaces::Drop {
  public fn drop (mut self: &File) -> void;
}

// Convenience helpers for common whole-file operations.
export fn read_file (path: string) -> FsBufferU8Result;
export fn read_file_string (path: string) -> FsStringResult;
export fn write_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FsIntResult;
export fn append_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FsIntResult;
export fn write_file_string (path: string, contents: string, mode: int) -> FsIntResult;
export fn append_file_string (path: string, contents: string, mode: int) -> FsIntResult;
export fn copy_file (src: string, dst: string, mode: int) -> FsErrorIntResult;

// Path-based helpers (`None` on success).
export fn unlink (path: string) -> FsFailed?;
export fn rename (old_path: string, new_path: string) -> FsFailed?;
export fn mkdir (path: string, mode: int) -> FsFailed?;
export fn rmdir (path: string) -> FsFailed?;
export fn mkdir_all (path: string, mode: int) -> FsError?;
```

Notes:

- These functions call POSIX/libc `access(2)` via `ext`. Executable outputs
  import external libc symbols. On `linux/x86_64` with the glibc dynamic loader
  (`ld-linux`), `silk` automatically adds `libc.so.6` as a `DT_NEEDED`
  dependency when external symbols are present, so `--needed libc.so.6` is not
  required for typical `std::fs` use.
  - This applies to other `std::fs` POSIX bindings as well (`open(2)`,
    `read(2)`, `close(2)`, etc.).
  - `std::fs` maps runtime failures into a portable `FsErrorKind` set; the raw
    platform error mechanism (for example POSIX `errno`) is not part of the
    public API. The mapping from the platform mechanism into stable
    `FsFailed.code` values is performed by `std::runtime::fs`.
  - `mkdir_all` is a convenience helper for `mkdir -p` behavior. In the current
    hosted subset it treats `EEXIST` as success and does not distinguish an
    existing directory from an existing non-directory at the same path.

## Scope

`std::fs` is responsible for:

- File and directory creation, deletion, and enumeration.
- Basic metadata operations.

Path manipulation is provided by `std::path` (see `docs/std/path.md`). In the
current subset, `std::fs` APIs still accept raw `string` paths.

Hosted baseline:

- POSIX paths are treated as opaque byte sequences (not necessarily UTF-8).
- APIs that accept `string` paths must specify encoding behavior. The initial
  baseline assumes UTF-8 on POSIX but does not require it for all operations.

## Core Types (Initial Design)

- `Path` / `PathBuf` for path manipulation (borrowed vs owned).
- `File` for open file handles.
- `Dir` / directory iteration.
- `Metadata` for stat-like information.

Illustrative sketch:

```silk
module std::fs;

export enum FsError {
  NotFound,
  PermissionDenied,
  AlreadyExists,
  NotADirectory,
  IsADirectory,
  InvalidPath,
  Unknown,
}

export struct OpenOptions {
  read: bool,
  write: bool,
  create: bool,
  truncate: bool,
}

export fn open (path: string, opts: OpenOptions) -> Result(File, FsError);
export fn read_to_string (alloc: std::memory::Allocator, path: string) -> Result(std::strings::String, FsError);
```

## Future Work

- Symlink support and canonicalization.
- File watching (platform-dependent).
