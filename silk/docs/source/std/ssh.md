# `std::ssh`

`std::ssh` is the
ergonomic stdlib entrypoint for Silk's hosted SSH client surface. It forwards
the current libssh2-backed implementation that lives in `std::ssh2`, so
downstream code can import `std::ssh` without depending on the implementation
module name directly.

## Relationship to `std::ssh2`

`std::ssh` is a compatibility facade over `std::ssh2`:

- it exposes the same top-level SSH2 constants and helper functions,
- it exports transparent type aliases for the current `std::ssh2` nominal
 types and result aliases,
- method calls continue to operate on the underlying `std::ssh2` types.

The compatibility constants intentionally mirror the stable `std::ssh2`
constant values directly instead of re-exporting them through top-level alias
bindings, because the current backend subset does not yet lower that alias
shape when `std::ssh` itself is compiled as an object during staged stdlib
builds.

In other words, these forms are intended to be interchangeable in the current
subset:

```silk
import std::ssh;
import std::ssh2;

let a: std::ssh::Session = std::ssh::Session.invalid();
let b: std::ssh2::Session = std::ssh2::Session.invalid();
```

The preferred downstream import path is `std::ssh`. `std::ssh2` remains the
concrete libssh2-backed implementation module and is still documented as the
source of the underlying behavior and linkage notes.

## Linkage and Toolchain Integration

On `linux/x86_64`, importing either `std::ssh` or `std::ssh2` causes
`silk build` to auto-link the built-in `libssh2.a` archive and its built-in
mbedTLS dependencies, matching the `std::ssh2` behavior described in
[ssh2](?p=std/ssh2).

## Exported API

The compatibility facade currently forwards:

- SSH2 constants such as `ERR_*`, `SFTP_FXF_*`, and `SFTP_RENAME_*`,
- top-level helpers such as `init()`, `exit()`, `version()`,
 `failed(...)`, and `failed_detail(...)`,
- transparent type aliases for the current `std::ssh2` public types, including:
 - `SSH2ErrorKind`,
 - `SSH2Failed`,
 - `Session`, `Channel`, `Sftp`, `SftpHandle`,
 - `HostKey`, `KnownHosts`, `KnownHostCheck`,
 - `Agent`, `AgentIdentity`,
 - and the corresponding `Result(...)` aliases.

For the detailed API contract and current method set, see [ssh2](?p=std/ssh2).
