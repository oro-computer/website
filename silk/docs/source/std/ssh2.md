# `std::ssh2`

`std::ssh2` provides the current
libssh2-backed SSH2 implementation for the hosted POSIX baseline. On supported
hosted target layouts, `silk build` auto-links the built-in `libssh2.a` so
outputs do not depend on a system `libssh2` shared object at runtime.

Downstream code that wants a stable stdlib-facing import path should prefer
`std::ssh`, which forwards this same surface through a compatibility facade.
Use `std::ssh2` when you specifically want to refer to the concrete
implementation module.

The initial goals are:

- a small but usable SSH2 client session API (`Session`, `Channel`),
- an SFTP client API (`Sftp`, `SftpHandle`) suitable for remote filesystem access,
- a non-leaking, portable error model that does not expose raw libssh2 error
 codes as the primary API surface,
- pervasive use of Formal Silk theories to document and verify byte-buffer
 invariants for FFI operations.

## Linkage and Toolchain Integration

When a program imports `std::ssh2` (or the compatibility facade `std::ssh`),
`silk build` automatically links the target-matched built-in `libssh2.a`
archive from:

- repo builds: `vendor/lib/<target-layout>/libssh2.a`
- staged toolchains: `build/lib/silk/vendor/lib/<target-layout>/libssh2.a`
- installed toolchains: `<prefix>/lib/silk/vendor/lib/<target-layout>/libssh2.a`

The current target layouts are `x64-linux` for glibc Linux x86_64,
`x64-linux-musl` for musl Linux x86_64, and `aarch64-macos` for Apple Silicon
macOS.

The hosted deps workflow builds libssh2 against the built-in mbedTLS archives,
so `std::ssh2` does not require system OpenSSL headers/libraries or a system
`libssh2.so.*` at runtime.

To link dynamically (system libssh2), pass `--needed libssh2.so.1` (or set
`[[target]].needed = ["libssh2.so.1"]` in `silk.toml`) and ensure the SONAME is
resolvable by the dynamic loader on the target system.

In staged/installed toolchains, the built-in archive is expected under the
compiler prefix:

- `build/lib/silk/vendor/lib/<target-layout>/` (repo build prefix)
- `<prefix>/lib/silk/vendor/lib/<target-layout>/` (installed)

## Error Model

The `std::ssh2` API uses `std::result::Result(T, E)` and a stable `SSH2Failed`
error value. The underlying libssh2 error code is retained as structured detail
(`SSH2Failed.detail`) for debugging and telemetry.

Non-blocking I/O is surfaced via `SSH2ErrorKind::WouldBlock` (mapped from
`LIBSSH2_ERROR_EAGAIN`).

Public error/value types in the Supported forms:

```silk
module std::ssh2;

import std::result;

enum SSH2ErrorKind {
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

export error SSH2Failed {
  code: int,
  detail: int,
}

export type SSH2IntResult = std::result::Result(int, SSH2Failed);
export type SSH2I64Result = std::result::Result(i64, SSH2Failed);

export type SessionResult = std::result::Result(Session, SSH2Failed);
export type ChannelResult = std::result::Result(Channel, SSH2Failed);
export type SftpResult = std::result::Result(Sftp, SSH2Failed);
export type SftpHandleResult = std::result::Result(SftpHandle, SSH2Failed);

enum KnownHostCheck {
  Match,
  Mismatch,
  NotFound,
}

export type KnownHostCheckResult = std::result::Result(KnownHostCheck, SSH2Failed);

// Agent iteration uses `Ok(Some(identity))` and `Ok(None)` for end-of-list.
export type AgentNextIdentityResult = std::result::Result(AgentIdentity?, SSH2Failed);
```

## Byte Buffers and Formal Silk

`std::ssh2` expresses byte-oriented inputs and outputs using the standard packed
byte types:

- `std::arrays::ByteSlice` — non-owning `{ ptr, len }` byte view.
- `std::buffer::BufferU8` — owning `{ ptr, cap, len }` packed byte buffer.

FFI entrypoints that accept or fill byte buffers use Formal Silk theories such
as `slice_well_formed(ptr, len)` to document shape invariants (`len >= 0` and
non-null when non-empty).

## Exported API

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
