# `std::fs`

`std::fs` provides a small hosted
filesystem API backed by `std::runtime::fs`. It exposes low-level `File`
handles, path/file metadata queries, whole-file helpers, directory iteration,
and byte-oriented I/O primitives.

The public `std::fs` surface does not expose POSIX `errno`. Runtime-specific
details live under `std::runtime`.

See also:

- [io](?p=std/io) (shared I/O error conventions and reader/writer traits)
- [path](?p=std/path) (path manipulation helpers)
- [runtime](?p=std/runtime) (runtime interface layer and pluggable runtimes)
- [conventions](?p=std/conventions)

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
- Metadata platform notes:
 - `stat(path)` follows symlinks before reporting metadata for the resolved
 target.
 - `lstat(path)` reports the symlink itself, so
 `Stats.is_symbolic_link()` / `Stats.isSymbolicLink()` are only true for
 `lstat(...)` results that actually describe a link.
 - `birthtime*` falls back to `ctime*` on targets where creation time is not
 available from the runtime metadata source (currently the hosted Linux
 baseline and the shipped `wasm32-wasi` preview1 backend).
 - On `wasm32-wasi`, `mode` carries file-type bits synthesized from the WASI
 file type, while fields not exposed by preview1 metadata (`uid`, `gid`,
 `rdev`, `blksize`, `blocks`) are reported as `0`.

## Exported API
A hosted POSIX baseline exists today in `std/fs.slk`. The low-level OS bindings
are provided via `std::runtime::fs` (which defaults to a POSIX implementation
in the shipped stdlib).

```silk
module std::fs;

export fn exists (path: string) -> bool;
export fn can_read (path: string) -> bool;
export fn can_write (path: string) -> bool;
export fn can_exec (path: string) -> bool;
export fn stat (path: string) -> FSStatsResult;
export fn lstat (path: string) -> FSStatsResult;
export fn path_kind (path: string) -> FSPathKindResult;
export fn is_regular_file (path: string) -> FSBoolResult;
export fn realpath (path: string) -> FSStringResult;

export enum FSErrorKind {
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

export struct FSFailed {
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
export type FSBoolResult = std::result::Result(bool, FSError);
export type FSBufferU8Result = std::result::Result(std::buffer::BufferU8, FSError);
export type FSStatsResult = std::result::Result(Stats, FSError);
export type FSStringResult = std::result::Result(std::strings::String, FSError);

export enum PathKind {
  RegularFile,
  Directory,
  Other,
}

export enum DirEntryType {
  Unknown,
  RegularFile,
  Directory,
  SymbolicLink,
  Other,
}

export type FSPathKindResult = std::result::Result(PathKind, FSError);

export struct Stats {
  dev: u64,
  ino: u64,
  mode: u64,
  nlink: u64,
  uid: u64,
  gid: u64,
  rdev: u64,
  size: i64,
  blksize: i64,
  blocks: i64,
  atime_ms: i64,
  mtime_ms: i64,
  ctime_ms: i64,
  birthtime_ms: i64,
  atime_ns: i64,
  mtime_ns: i64,
  ctime_ns: i64,
  birthtime_ns: i64,
  atime: std::temporal::DateTime,
  mtime: std::temporal::DateTime,
  ctime: std::temporal::DateTime,
  birthtime: std::temporal::DateTime,
}

impl Stats {
  public fn is_file (self: &Stats) -> bool;
  public fn is_directory (self: &Stats) -> bool;
  public fn is_block_device (self: &Stats) -> bool;
  public fn is_character_device (self: &Stats) -> bool;
  public fn is_symbolic_link (self: &Stats) -> bool;
  public fn is_fifo (self: &Stats) -> bool;
  public fn is_socket (self: &Stats) -> bool;

  // Node-compatible aliases on top of the snake_case Silk methods.
  public fn isFile (self: &Stats) -> bool;
  public fn isDirectory (self: &Stats) -> bool;
  public fn isBlockDevice (self: &Stats) -> bool;
  public fn isCharacterDevice (self: &Stats) -> bool;
  public fn isSymbolicLink (self: &Stats) -> bool;
  public fn isFIFO (self: &Stats) -> bool;
  public fn isSocket (self: &Stats) -> bool;
}

export struct OpenOptions {
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

export enum SeekWhence {
  Start,
  Current,
  End,
}

// A file descriptor wrapper.
export struct File {
  fd: int,
}

export type FileResult = std::result::Result(File, FSFailed);

// A read-only memory mapping (hosted baseline).
export struct MMap {
  ptr: u64,
  len: i64,
}

export type MMapResult = std::result::Result(MMap, FSFailed);

impl MMap {
  public fn empty () -> MMap;
  public fn as_slice (self: &MMap) -> std::arrays::ByteSlice;
}

impl MMap as std::interfaces::Len {
  public fn len (self: &MMap) -> i64;
}

impl MMap as std::interfaces::IsEmpty {
  public fn is_empty (self: &MMap) -> bool;
}

impl MMap as std::interfaces::Drop {
  public fn drop (mut self: &MMap) -> void;
}

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
  public fn metadata_size (self: &File) -> FSI64Result;
  public fn file_size (self: &File) -> FSI64Result;
  public fn stat (self: &File) -> FSStatsResult;
  public fn mmap_readonly (self: &File) -> MMapResult;
  public fn mmap_readonly_range (self: &File, offset: i64, len: i64) -> MMapResult;
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

export fn fstat (file: &File) -> FSStatsResult;
export fn metadata_size (file: &File) -> FSI64Result;
export fn file_size (file: &File) -> FSI64Result;

// Convenience helpers for common whole-file operations.
export fn read_file (path: string) -> FSBufferU8Result;
export fn read_file_string (path: string) -> FSStringResult;
export fn write_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FSIntResult;
export fn append_file (path: string, buf: std::arrays::ByteSlice, mode: int) -> FSIntResult;
export fn write_file_string (path: string, contents: string, mode: int) -> FSIntResult;
export fn append_file_string (path: string, contents: string, mode: int) -> FSIntResult;
export fn copy_file (src: string, dst: string, mode: int) -> FSErrorIntResult;

// Directory iteration.
export struct Dir {
  handle: u64,
  scratch_ptr: u64,
  scratch_len: i64,
  scratch_type: int,
}

export struct DirEntry { name: std::strings::String }

export struct DirEntryView {
  name: std::arrays::ByteSlice,
  kind: DirEntryType,
}

export type DirResult = std::result::Result(Dir, FSFailed);
export type DirEntryResult = std::result::Result(DirEntry, FSFailed);
export type DirEntryViewResult = std::result::Result(DirEntryView, FSFailed);

impl DirEntry {
  public fn name (self: &DirEntry) -> string;
}

impl Dir {
  public fn invalid () -> Dir;
  public fn open (path: string) -> DirResult;
  public fn is_valid (self: &Dir) -> bool;
  public fn close (mut self: &Dir) -> FSFailed?;
  public fn next_view (mut self: &Dir) -> DirEntryViewResult?;
}

impl Dir as std::interfaces::Iterator(DirEntryResult) {
  public fn next (mut self: &Dir) -> DirEntryResult?;
}

impl Dir as std::interfaces::Drop {
  public fn drop (mut self: &Dir) -> void;
}

export fn read_dir (path: string) -> DirResult;
export using readdir = read_dir;

// Path-based helpers (`None` on success).
export fn unlink (path: string) -> FSFailed?;
export fn rename (old_path: string, new_path: string) -> FSFailed?;
export fn mkdir (path: string, mode: int) -> FSFailed?;
export fn rmdir (path: string) -> FSFailed?;
export fn mkdir_all (path: string, mode: int) -> FSError?;
export using mkdirp = mkdir_all;
```

## `std::interfaces` surface

The filesystem subset already participates in the shared stdlib protocol story:

- `File` implements `std::interfaces::Drop`.
- `MMap` implements `std::interfaces::Len`, `std::interfaces::IsEmpty`, and
 `std::interfaces::Drop`.
- `Dir` implements `std::interfaces::Iterator(DirEntryResult)` and
 `std::interfaces::Drop`.

These protocol impls are the standard way to think about the ownership model of
filesystem handles and mappings in Silk: files/directories/mappings own hosted
resources and clean them up via `Drop`, while `MMap` also behaves like a
view-like byte source with a logical length.

Notes:

- These functions call POSIX/libc `access(2)` via `ext`. Executable outputs
 import external libc symbols. On `linux/x86_64`, `silk` automatically adds
 the selected libc as a `DT_NEEDED` dependency when external symbols are
 present (`libc.so.6` for glibc, `libc.so` for musl), so a manual libc
 `--needed` entry is not required for typical `std::fs` use.
 - This applies to other `std::fs` POSIX bindings as well (`open(2)`,
 `read(2)`, `close(2)`, etc.).
 - `std::fs` maps runtime failures into a portable `FSErrorKind` set; the raw
 platform error mechanism (for example POSIX `errno`) is not part of the
 public API. The mapping from the platform mechanism into stable
 `FSFailed.code` values is performed by `std::runtime::fs`.
 - `MMap` is a hosted baseline feature backed by `mmap(2)` / `munmap(2)` via
 `std::runtime::fs`. On WASI, mapping returns `InvalidInput` (unsupported).
 - `File.mmap_readonly_range(offset, len)` does not require `offset` to be
 page-aligned; it aligns internally (note: `MMap.ptr` may not be
 page-aligned for range mappings).
 - `File.mmap_readonly_range(offset, len)` does not validate the range against
 the file size. Mapping beyond EOF may trap on access (for example SIGBUS).
 - `mkdir_all` is a convenience helper for `mkdir -p` behavior. In the current
 hosted subset it treats `EEXIST` as success and does not distinguish an
 existing directory from an existing non-directory at the same path.
 - `mkdirp` is an exported compatibility alias for `mkdir_all`.
 - `read_dir` returns a `Dir` handle for iteration. `Dir.next()` yields
 `Some(Ok(DirEntry))` for entries, `Some(Err(FSFailed))` on error, and
 `None` on end-of-directory. `std::fs` skips `"."` and `".."`.
 - `Dir.next_view()` yields borrowed zero-copy `DirEntryView` entries with a
 decoded `DirEntryType` when the runtime reports one. The entry name slice
 is valid only until the next directory read on that handle or until the
 directory is closed. The current implementation keeps the small runtime
 output record inside the `Dir` owner, so `next_view()` itself does not
 allocate per entry.
 - `readdir` is an exported compatibility alias for `read_dir`.
 - `path_kind(path)` classifies the resolved filesystem object as
 `RegularFile`, `Directory`, or `Other`.
 - on the hosted POSIX baseline this follows symlinks before classifying the
 final target.
 - `Stats` is the stat-like metadata object modeled after Node.js `fs.Stats`.
 - the numeric fields are `dev`, `ino`, `mode`, `nlink`, `uid`, `gid`,
 `rdev`, `size`, `blksize`, `blocks`, and the timestamp families
 `atime_ms`, `mtime_ms`, `ctime_ms`, `birthtime_ms`,
 `atime_ns`, `mtime_ns`, `ctime_ns`, `birthtime_ns`,
 - `atime`, `mtime`, `ctime`, and `birthtime` are materialized
 `std::temporal::DateTime` views of the same timestamps,
 - Silk exposes snake_case predicate methods and exact Node-style aliases:
 `is_file` / `isFile`, `is_directory` / `isDirectory`,
 `is_block_device` / `isBlockDevice`,
 `is_character_device` / `isCharacterDevice`,
 `is_symbolic_link` / `isSymbolicLink`,
 `is_fifo` / `isFIFO`, and `is_socket` / `isSocket`.
 - `stat(path)` returns `Stats` for the resolved filesystem object.
 - on the hosted POSIX baseline and on the current WASI backend this follows
 symlinks.
 - `lstat(path)` returns `Stats` for the path itself.
 - this is the call to use when you want `is_symbolic_link()` to observe the
 symlink rather than its target.
 - `fstat(file)` / `File.stat()` report metadata for the currently open file
 descriptor without changing the seek position.
 - `metadata_size(file)` / `File.metadata_size()` and
 `file_size(file)` / `File.file_size()` return `fstat(2).st_size` without
 allocating and without changing the descriptor offset. Prefer these over
 `File.size()` in hot paths or when the seek position must be preserved
 exactly.
 - `File.size()` uses `lseek` to save, seek to end, and restore the offset; it
 only works on seekable descriptors.
 - `is_regular_file(path)` is the ergonomic probe for config/input validation.
 - it returns `Ok(false)` for existing non-regular paths, and
 `Err(FSFailed)` for lookup or permission failures.
 - `realpath(path)` is the filesystem-backed canonicalization helper.
 - unlike lexical `std::path::normalize(path)`, this consults the filesystem
 and resolves symlinks on the hosted POSIX backend,
 - on `wasm32-wasi` this helper is currently unsupported and reports
 `InvalidInput`.
 - `std::fs::stream` provides task-based adapters that connect `std::fs` with
 `std::stream` using producer/consumer loops
 (`std::fs::stream::pipe_file_to_stream` and
 `std::fs::stream::pipe_stream_to_file`). These are blocking OS-thread
 operations in the current runtime subset.
 - The runtime filesystem layer (`std::runtime::fs`) also exposes
 `mkstemp(template_ptr)` as a low-level primitive for creating unique
 temporary files from writable NUL-terminated templates (hosted POSIX
 baseline). `std::fs` does not yet wrap this in a higher-level temp-file
 API.

## Scope

`std::fs` is responsible for:

- File and directory creation, deletion, and enumeration.
- Basic metadata operations.

Path manipulation is provided by `std::path` (see [path](?p=std/path)). In the
Supported forms, `std::fs` APIs still accept raw `string` paths.

Hosted baseline:

- POSIX paths are treated as opaque byte sequences (not necessarily UTF-8).
- APIs that accept `string` paths must specify encoding behavior. The initial
 baseline assumes UTF-8 on POSIX but does not require it for all operations.

## Core Types
- `Path` / `PathBuf` for path manipulation (borrowed vs owned).
- `File` for open file handles.
- `Dir` / directory iteration.
- `Stats` / metadata values for stat-like information.

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

## Considerations
- Symlink creation / `readlink` helpers.
- File watching (platform-dependent).
