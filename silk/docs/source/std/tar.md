# `std::tar`

Status: **Design + initial implementation**. `std::tar` provides a portable,
streaming tar reader/writer for building and inspecting tar archives without
loading whole archives into memory.

Key goals:

- **Streaming**: iterate headers and stream entry data.
- **Multiple backends**: in-memory bytes, `std::fs::File`, and `std::stream`.
- **Portability**: tar format logic is pure Silk; the file/IO backends are
  implemented in terms of `std::fs`, `std::io`, and `std::stream`.
- **Large archives**: byte-slice inputs can be backed by an mmap mapping created
  by the embedding program (or a future stdlib mmap API).
- **Async-friendly**: fd-backed adapters are provided under `std::tar::async`
  (built on the hosted event loop and non-blocking `std::io`).

## Supported tar formats

Implemented subset (reader + writer):

- POSIX ustar headers (`ustar` magic).
- Pax extended headers (`x` and `g`) for:
  - long `path` / `linkpath`,
  - large numeric fields (`size`, `uid`, `gid`, `mtime`) when needed.
- GNU long name / long linkname entries (`L` and `K`) for compatibility with
  archives that use those extensions.
- Base-256 (binary) numeric field decoding/encoding for large values when pax
  is not used.

Entry kinds:

- regular files, directories, symlinks, hardlinks, FIFOs, and device nodes.

Unsupported/unknown entry kinds return `TarErrorKind::Unsupported`.

## API (Implemented)

```silk
module std::tar;

enum TarErrorKind {
  OutOfMemory,
  InvalidInput,
  InvalidHeader,
  ChecksumMismatch,
  UnexpectedEof,
  Unsupported,
  ReadFailed,
  WriteFailed,
  Closed,
  Unknown,
}

struct TarFailed { code: int, requested: i64 }

export type TarIntResult = std::result::Result(int, TarFailed);
export type EntryResult = std::result::Result(Entry, TarFailed);

export enum EntryKind {
  Regular,
  HardLink,
  SymLink,
  CharDevice,
  BlockDevice,
  Directory,
  Fifo,
  Contiguous,
}

// A borrowed header used when writing entries.
export struct Header {
  kind: EntryKind,
  name: string,
  link_name: string,
  size: i64,
  mode: i64,
  uid: i64,
  gid: i64,
  mtime: i64,
  uname: string,
  gname: string,
  devmajor: i64,
  devminor: i64,
}

// An owned header produced by the tar reader.
export struct Entry {
  kind: EntryKind,
  name: std::strings::String,
  link_name: std::strings::String,
  size: i64,
  mode: i64,
  uid: i64,
  gid: i64,
  mtime: i64,
  uname: std::strings::String,
  gname: std::strings::String,
  devmajor: i64,
  devminor: i64,
}

export struct Reader {
  // Construct from bytes, a file, or a byte stream.
  public fn from_bytes (bytes: std::arrays::ByteSlice) -> Reader;
  public fn from_file (f: std::fs::File) -> Reader;
  public fn from_stream (src: std::stream::ReadableStream) -> Reader;

  // Iterate headers. The reader automatically skips any unread bytes from the
  // previous entry when advancing.
  public fn next (mut self: &Reader) -> EntryResult?;

  // Stream entry data for the most recent header returned by `next()`.
  public fn read (mut self: &Reader, buf: std::arrays::ByteSlice) -> TarIntResult;
  public fn read_to_end (mut self: &Reader, mut out: &std::buffer::BufferU8) -> TarFailed?;
  public fn skip (mut self: &Reader) -> TarFailed?;
}

export struct Writer {
  // Construct a writer that emits to a buffer, file, or stream.
  public fn to_buffer () -> Writer;
  public fn to_file (f: std::fs::File) -> Writer;
  public fn to_stream (dst: std::stream::WritableStream) -> Writer;

  // Start an entry; then write exactly `header.size` bytes via `write`.
  public fn write_header (mut self: &Writer, header: Header) -> TarFailed?;
  public fn write (mut self: &Writer, bytes: std::arrays::ByteSlice) -> TarFailed?;
  public fn finish_entry (mut self: &Writer) -> TarFailed?;

  // Finish the archive (writes the two 512-byte zero blocks).
  public fn finish (mut self: &Writer) -> TarFailed?;

  // For `to_buffer()`: take ownership of the produced bytes.
  public fn take_buffer (mut self: &Writer) -> std::buffer::BufferU8;
}
```

## `std::tar::async` (fd adapters)

`std::tar::async` provides `async fn` adapters for fd-backed reading and writing
of tar archives. These are intended for event-loop-based programs:

- waits for fd readiness (`std::runtime::event_loop`),
- performs non-blocking reads/writes when possible,
- keeps tar parsing/encoding streaming (no whole-archive buffering).

API surface:

```silk
module std::tar::async;

export type Reader = std::tar::AsyncReader;
export type Writer = std::tar::AsyncWriter;
```

Note: the implementations live in `std/tar.slk`; `std/tar/async.slk` is a thin
re-export module so callers can `import std::tar::async;`.

## Example: in-memory roundtrip

```silk
import std::arrays;
import std::buffer;
import std::tar;

fn main () -> int {
  let payload: string = "hello";

  var w: std::tar::Writer = std::tar::Writer.to_buffer();
  let h: std::tar::Header = std::tar::Header{
    kind: std::tar::EntryKind::Regular,
    name: "greeting.txt",
    link_name: "",
    size: (sizeof(payload)) as i64,
    mode: 420,
    uid: 0,
    gid: 0,
    mtime: 0,
    uname: "",
    gname: "",
    devmajor: 0,
    devminor: 0,
  };

  if w.write_header(h) != None { return 1; }
  if w.write(std::arrays::ByteSlice{ ptr: payload as raw u64, len: (sizeof(payload)) as i64 }) != None { return 2; }
  if w.finish_entry() != None { return 3; }
  if w.finish() != None { return 4; }

  let mut tar_bytes: std::buffer::BufferU8 = w.take_buffer();

  var r: std::tar::Reader = std::tar::Reader.from_bytes(tar_bytes.as_bytes());
  let e_r_opt: std::tar::EntryResult? = r.next();
  if e_r_opt == None { tar_bytes.drop(); return 5; }
  let e_r: std::tar::EntryResult = match (e_r_opt) { Some(v) => v, None => std::tar::EntryResult.err(std::tar::TarFailed{ code: 0, requested: 0 }) };
  if e_r.is_err() { tar_bytes.drop(); return 6; }

  var out: std::buffer::BufferU8 = std::buffer::BufferU8.empty();
  if r.read_to_end(mut out) != None { out.drop(); tar_bytes.drop(); return 7; }

  tar_bytes.drop();
  out.drop();
  return 0;
}
```
