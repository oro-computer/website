# `std::ssh2`

Status: **Initial implementation + design**. `std::ssh2` provides SSH2 client primitives
for the hosted POSIX baseline using the system `libssh2` shared library.

The initial goals are:

- a small but usable SSH2 client session API (`Session`, `Channel`),
- an SFTP client API (`Sftp`, `SftpHandle`) suitable for remote filesystem access,
- a non-leaking, portable error model that does not expose raw libssh2 error
  codes as the primary API surface,
- pervasive use of Formal Silk theories to document and verify byte-buffer
  invariants for FFI operations.

## Linkage and Toolchain Integration

On `linux/x86_64` with the glibc dynamic loader (`ld-linux`), `silk build`
automatically adds `libssh2.so.1` as a `DT_NEEDED` dependency when a program
imports `libssh2_*` extern symbols (for example via `import std::ssh2;`).

This mirrors existing behavior for `libc.so.6`, `libsodium.so.23`, and
`libmbedtls.so.14` so downstream users do not have to pass
`--needed libssh2.so.1` for normal hosted builds.

To build the vendored static library artifact used for embedding and future
bundling, run `zig build deps`. This stages `vendor/lib/x64-linux/libssh2.a`
from `vendor/deps/libssh2` (tag `libssh2-1.11.1`). The current deps workflow
builds libssh2 using the OpenSSL backend.

## Error Model

The `std::ssh2` API uses `std::result::Result(T, E)` and a stable `Ssh2Failed`
error value. The underlying libssh2 error code is retained as structured detail
(`Ssh2Failed.detail`) for debugging and telemetry.

Non-blocking I/O is surfaced via `Ssh2ErrorKind::WouldBlock` (mapped from
`LIBSSH2_ERROR_EAGAIN`).

Public error/value types in the current subset:

```silk
module std::ssh2;

import std::result;

enum Ssh2ErrorKind {
  OutOfMemory,
  InvalidInput,
  WouldBlock,
  InitFailed,
  SessionFailed,
  HandshakeFailed,
  AuthFailed,
  ChannelFailed,
  SftpFailed,
  KnownHostsFailed,
  AgentFailed,
  Unknown,
}

export error Ssh2Failed {
  code: int,
  detail: int,
}

export type Ssh2IntResult = std::result::Result(int, Ssh2Failed);
export type Ssh2I64Result = std::result::Result(i64, Ssh2Failed);

export type SessionResult = std::result::Result(Session, Ssh2Failed);
export type ChannelResult = std::result::Result(Channel, Ssh2Failed);
export type SftpResult = std::result::Result(Sftp, Ssh2Failed);
export type SftpHandleResult = std::result::Result(SftpHandle, Ssh2Failed);

enum KnownHostCheck {
  Match,
  Mismatch,
  NotFound,
}

export type KnownHostCheckResult = std::result::Result(KnownHostCheck, Ssh2Failed);

// Agent iteration uses `Ok(Some(identity))` and `Ok(None)` for end-of-list.
export type AgentNextIdentityResult = std::result::Result(AgentIdentity?, Ssh2Failed);
```

## Byte Buffers and Formal Silk

`std::ssh2` expresses byte-oriented inputs and outputs using the standard packed
byte types:

- `std::arrays::ByteSlice` — non-owning `{ ptr, len }` byte view.
- `std::buffer::BufferU8` — owning `{ ptr, cap, len }` packed byte buffer.

FFI entrypoints that accept or fill byte buffers use Formal Silk theories such
as `slice_well_formed(ptr, len)` to document shape invariants (`len >= 0` and
non-null when non-empty).

## Current API (Initial)

The current `std::ssh2` surface currently lives in a single module
`std/ssh2.slk` (`module std::ssh2;`) and provides:

- `Session` — init/free, blocking mode, timeouts, handshake, disconnect, and
  common authentication helpers,
- `Channel` — open session channels, exec/shell/subsystem, read/write/close,
  and exit status,
- `Sftp` / `SftpHandle` — basic SFTP operations and directory iteration,
- `KnownHosts` — OpenSSH known_hosts read/check/write helpers (`check*` returns `KnownHostCheckResult`),
- `Agent` — ssh-agent integration for publickey auth (`next_identity` returns `AgentNextIdentityResult`).

This module may be split into submodules as the stdlib grows to keep the code
base navigable and to support additional optional dependency backends.
