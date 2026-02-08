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

## Platform notes

- Hosted baseline (`linux/x86_64`): `std::runtime::fs` delegates to
  `std::runtime::posix::fs` and uses POSIX syscalls.
- `wasm32-wasi`: `std::runtime::fs` is backed by `std::runtime::wasi::fs` and
  requires the embedder to provide at least one preopened directory. Paths are
  interpreted as relative to the first preopened directory found via
  `fd_prestat_get` (sandbox root):
  - absolute paths (`/foo/bar`) are interpreted relative to the sandbox root,
  - relative paths (`foo/bar`) are resolved against a virtual working directory
    managed by `std::process::chdir` / `std::process::getcwd`,
  - `.` and `..` segments are normalized; `..` cannot escape above the sandbox root.

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

enum FSErrorKind {
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

struct FSFailed {
  code: int,
  requested: i64,
}

impl FSFailed {
  public fn kind (self: &FSFailed) -> FSErrorKind;
}

export type FSError = FSFailed;

export type FSIntResult = std::result::Result(int, FSFailed);
export type FSI64Result = std::result::Result(i64, FSFailed);
export type FSErrorIntResult = std::result::Result(int, FSError);
export type FSBufferU8Result = std::result::Result(std::buffer::BufferU8, FSError);
export type FSStringResult = std::result::Result(std::strings::String, FSError);

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

export type FileResult = std::result::Result(File, FSFailed);

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
  public fn close (mut self: &File) -> FSFailed?;

  // Byte I/O (hosted baseline).
  public fn read (self: &File, buf: std::arrays::ByteSlice) -> FSIntResult;
  public fn read_exact (self: &File, buf: std::arrays::ByteSlice) -> FSFailed?;
  public fn write (self: &File, buf: std::arrays::ByteSlice) -> FSIntResult;
  public fn seek (self: &File, offset: i64, whence: SeekWhence) -> FSI64Result;
  public fn tell (self: &File) -> FSI64Result;
  public fn size (self: &File) -> FSI64Result;
  public fn sync (self: &File) -> FSFailed?;
  public fn truncate (self: &File, len: i64) -> FSFailed?;

  // Convenience helpers.
  public fn read_to_end (self: &File, mut out: &std::buffer::BufferU8) -> FSErrorIntResult;
  public fn write_all (self: &File, buf: std::arrays::ByteSlice) -> FSFailed?;
}

// Files are closed on scope exit and on overwrite.
impl File as std::interfaces::Drop {
  public fn drop (mut self: &File) -> void;
}

// Convenience helpers for common whole-file operations.
export fn read_file (path: string) -> FSBufferU8Result;
export fn read_file_string (path: string) -> FSStringResult;
export fn write_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FSIntResult;
export fn append_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FSIntResult;
export fn write_file_string (path: string, contents: string, mode: int) -> FSIntResult;
export fn append_file_string (path: string, contents: string, mode: int) -> FSIntResult;
export fn copy_file (src: string, dst: string, mode: int) -> FSErrorIntResult;

// Directory iteration.
struct Dir { handle: u64 }

struct DirEntry { name: std::strings::String }

export type DirResult = std::result::Result(Dir, FSFailed);
export type DirEntryResult = std::result::Result(DirEntry, FSFailed);

impl DirEntry {
  public fn name (self: &DirEntry) -> string;
}

impl Dir {
  public fn invalid () -> Dir;
  public fn open (path: string) -> DirResult;
  public fn is_valid (self: &Dir) -> bool;
  public fn close (mut self: &Dir) -> FSFailed?;
}

impl Dir as std::interfaces::Iterator(DirEntryResult) {
  public fn next (mut self: &Dir) -> DirEntryResult?;
}

impl Dir as std::interfaces::Drop {
  public fn drop (mut self: &Dir) -> void;
}

export fn read_dir (path: string) -> DirResult;

// Path-based helpers (`None` on success).
export fn unlink (path: string) -> FSFailed?;
export fn rename (old_path: string, new_path: string) -> FSFailed?;
export fn mkdir (path: string, mode: int) -> FSFailed?;
export fn rmdir (path: string) -> FSFailed?;
export fn mkdir_all (path: string, mode: int) -> FSError?;
```

Notes:

- These functions call POSIX/libc `access(2)` via `ext`. Executable outputs
  import external libc symbols. On `linux/x86_64` with the glibc dynamic loader
  (`ld-linux`), `silk` automatically adds `libc.so.6` as a `DT_NEEDED`
  dependency when external symbols are present, so `--needed libc.so.6` is not
  required for typical `std::fs` use.
  - This applies to other `std::fs` POSIX bindings as well (`open(2)`,
    `read(2)`, `close(2)`, etc.).
  - `std::fs` maps runtime failures into a portable `FSErrorKind` set; the raw
    platform error mechanism (for example POSIX `errno`) is not part of the
    public API. The mapping from the platform mechanism into stable
    `FSFailed.code` values is performed by `std::runtime::fs`.
  - `mkdir_all` is a convenience helper for `mkdir -p` behavior. In the current
    hosted subset it treats `EEXIST` as success and does not distinguish an
    existing directory from an existing non-directory at the same path.
  - `read_dir` returns a `Dir` handle for iteration. `Dir.next()` yields
    `Some(Ok(DirEntry))` for entries, `Some(Err(FSFailed))` on error, and
    `None` on end-of-directory. `std::fs` skips `"."` and `".."`.
  - `std::fs::stream` provides task-based adapters that connect `std::fs` with
    `std::stream` using producer/consumer loops
    (`std::fs::stream::pipe_file_to_stream` and
    `std::fs::stream::pipe_stream_to_file`). These are blocking OS-thread
    operations in the current runtime subset.

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
