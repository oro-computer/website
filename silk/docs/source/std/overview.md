# Standard Library Overview (`std::`)

The `docs/std/` directory specifies the
intended API and structure. A minimal in-tree stdlib source tree also
exists under `std/` (used by the toolchain to satisfy `import std::...;`).

As of the current compiler/backend subset, the in-tree stdlib includes a
small but functional set of utilities implemented purely in Silk (including
monomorphized, type-parameter generics for core collection types),
plus a tiny hosted POSIX baseline for OS-facing modules (`std::fs`, `std::task`,
`std::sync`, `std::io`) implemented via the `std::runtime` interface layer
(the shipped POSIX runtime backend uses `ext` and therefore requires linking
libc for executable outputs).

The Silk standard library, `std::`, provides foundational functionality built
on top of the language core (regions, buffers, concurrency, etc.). It is intended
to be:

- **Linked by default** for normal builds driven by `silk`.
- **Swappable**: an alternative `std::` implementation can be selected at build
 time, without changing the language or the C ABI.
- **POSIX-first** for OS interactions (initial hosted baseline), while still
 supporting freestanding/embedded builds via a smaller “core” subset.

See also:

- [package structure](?p=std/package-structure) (namespace + linkage + swappability)
- [conventions](?p=std/conventions) (API conventions: errors, allocation, ownership)
- [result](?p=std/result) (the standard `Result(T, E)` error return type)
- [module catalog](?p=std/module-catalog) (audit-oriented coverage map for the shipped
 `std/**` tree)

Exact canonical docs exist for every shipped `std/**` module. Nested modules
flatten `/` to `-` in `docs/std/`, for example:

- `std/fs/stream.slk` -> [fs stream](?p=std/fs-stream)
- `std/runtime/posix/io.slk` -> [runtime posix io](?p=std/runtime-posix-io)

## Core Areas

These are the minimum required areas for the initial standard library
distribution:

- `std::bytes` — borrowed byte-slice search, comparison, copy, and ASCII
 helpers for zero-copy CLI/search/build hot paths (see [bytes](?p=std/bytes)).
- `std::buffer` — typed, width-oriented buffer utilities built on top of
 `std::vector` for common scalar element types (see [buffer](?p=std/buffer)).
- `std::strings` — UTF-8 text utilities and owned string building.
- `std::regex` — regular expression literals and helpers (see [regex](?p=std/regex)).
- `std::unicode` — Unicode scalar classification helpers (see [unicode](?p=std/unicode)).
- `std::number` — number parsing/formatting helpers (see [number](?p=std/number)).
- `std::boolean` — boxed bool wrapper for method/interface-oriented APIs (see [boolean](?p=std/boolean)).
- `std::optional` — companion free-function surface for built-in `Optional(T)` combinators (see [optional](?p=std/optional)).
- `std::range` — boxed `range` helper surface (see [range](?p=std/range)).
- `std::function` — boxed function-value holders (see [function](?p=std/function)).
- `std::math` — linear algebra utilities (vectors/matrices) for graphics and
 general computation (see [math](?p=std/math)).
- `std::graphics` — low-level graphics API bindings and focused platform
 facades (OpenGL, OpenGL ES, Vulkan, macOS Metal handle/window-context API,
 and provider-neutral window clear facade; see [graphics](?p=std/graphics)).
- `std::dylib` — opt-in dynamic-library loading and symbol lookup with explicit
 `c_fn` function-pointer conversion from symbol addresses (see
 [dylib](?p=std/dylib)).
- `std::window` — opt-in high-level window application facade with
 `run(...)`, `run_loop(...)`, `next_event(...)`, native window creation
 options, title/visibility/focus/size/position/window-state controls, macOS
 AppKit support, iOS UIKit app-bundle/lifecycle support, a GTK provider
 placeholder, and explicit macOS/iOS/GTK provider submodules (see
 [window](?p=std/window)).
- `std::image` — image codecs + color utilities (PNG via libpng, JPEG via
 libjpeg-turbo; see [image](?p=std/image)).
- `std::limits` — numeric min/max limits for primitive types (see [limits](?p=std/limits)).
- `std::crypto` — cryptography primitives (hosted baseline via libsodium; see
 [crypto](?p=std/crypto)).
- `std::ggml` — ggml tensor library bindings (early bring-up; see [ggml](?p=std/ggml)).
- `std::uuid` — UUID primitives (v1/v3/v4/v5/v6/v7/v8) with parsing/formatting
 (see [uuid](?p=std/uuid)).
- `std::semver` — Semantic Versioning (SemVer 2.0.0) parsing and precedence
 comparison (see [semver](?p=std/semver)).
- `std::json` — JSON parsing, DOM construction, and stringifying (borrowed and
 owned DOM parsing plus explicit builder helpers; see [json](?p=std/json)).
- `std::protobuf` — dependency-free Protocol Buffers binary wire helpers used
 by `silk proto` generated modules (see [protobuf](?p=std/protobuf)).
- `std::toml` — TOML parsing, DOM construction, and deterministic emission
 (borrowed and owned DOM parsing plus explicit builder helpers;
 see [toml](?p=std/toml)).
- `std::tar` — tar archive reading and writing (ustar + pax; see [tar](?p=std/tar)).
- `std::xml` — XML parsing and traversal (via libxml2; see [xml](?p=std/xml)).
- `std::idl::web` — Web IDL parsing and query API (see [idl web](?p=std/idl-web)).
- `std::js::ecma` — ECMAScript FFI surface for JS/WASM interop (see [js ecma](?p=std/js-ecma)).
- `std::wasm` — WebAssembly runtime API (baseline wasm32 interpreter; see [wasm](?p=std/wasm)).
- `std::memory` — allocation interfaces and low-level memory utilities.
- `std::arrays` — slice/view types and helpers for fixed arrays.
- `std::bits` — bit manipulation helpers (byte swaps, rotates, bit counts; see
 [bits](?p=std/bits)).
- `std::vector` — typed growable vectors (`Vector(T)`), used broadly across
 `std::` (see [vector](?p=std/vector)).
- `std::map` — associative containers (hash maps and ordered maps; see
 [map](?p=std/map)).
- `std::set` — set containers (hash sets and ordered sets; see
 [set](?p=std/set)).
- `std::algorithms` — common algorithms over slices/collections.
- `std::temporal` — `Instant`/`Duration` utilities and calendar/time helpers.
- `std::time` — small monotonic-clock and duration facade over
 `std::temporal` for systems tools (see [time](?p=std/time)).
- `std::url` — WHATWG URL parsing/serialization and `URLSearchParams` (`application/x-www-form-urlencoded`; see [url](?p=std/url)).
- `std::task` — task/runtime helpers, including reusable `Task(T)` join helpers
 for async code (hosted baseline; see [task](?p=std/task)).
- `std::sync` — synchronization primitives (hosted baseline; see [sync](?p=std/sync)).
- `std::abort_controller` — WHATWG-style abort signals for cancellation (see
 [abort controller](?p=std/abort_controller); detailed semantics in
 [abort controller](?p=std/abort-controller)).
- `std::signal` — pollable signal waiting for TUI programs (Linux `signalfd(2)`
 backend; see [signal](?p=std/signal)).
- `std::stream` — Web Streams-inspired byte streams and piping (see [stream](?p=std/stream)).
- `std::args` — executable argument helpers for native `main(argc, argv)` and
 `wasm32-wasi` parameterless `main()` entrypoints (Supported forms; see
 [args](?p=std/args)).
- `std::readline` — interactive line editor for CLI programs (TTY mode) built on
 the bundled `linenoise` sources (see [readline](?p=std/readline)).
- `std::flag` — command line flag + positional parsing, including interspersed
 known flags before `--` (Supported forms; see [flag](?p=std/flag)).
- `std::test` — test helpers for `silk test` (Supported forms; see [test](?p=std/test)).
- `std::build` — build module helpers for generating `silk.toml` manifests (see [build](?p=std/build)).
- `std::env` — environment variable access (hosted baseline; see [env](?p=std/env)).
- `std::process` — process primitives, including high-level child-process and
 PTY-backed spawn support on the hosted baseline (see [process](?p=std/process)).
- `std::os` — target OS/arch metadata and small OS helpers (see [os](?p=std/os)).
- `std::path` — path manipulation utilities (Supported forms; see [path](?p=std/path)).
- `std::io` — basic I/O (unbuffered fd reads/writes, formatting, stdout/stderr;
 see [io](?p=std/io)). Stream adapters live under `std::io::stream`.
- `std::fmt` — shared formatting layer used by `std::io` and string builders.
- `std::fs` — filesystem access (POSIX baseline; canonical module doc:
 [fs](?p=std/fs); detailed hosted API notes in [filesystem](?p=std/filesystem);
 stream adapters under `std::fs::stream`).
- `std::net` — networking primitives (POSIX baseline; canonical module doc:
 [net](?p=std/net); detailed hosted API notes in [networking](?p=std/networking);
 stream adapters under `std::net::stream`).
- `std::http` — HTTP/1.1 parsing + blocking client/server on top of `std::net`,
 plus async-friendly one-shot request wrappers (see [http](?p=std/http)).
- `std::https` — HTTPS (HTTP over TLS) on top of `std::tls` + `std::net`,
 plus async-friendly one-shot request wrappers (see [https](?p=std/https)).
- `std::websocket` — RFC 6455 WebSocket (handshake + framing) on top of `std::net`
 (see [websocket](?p=std/websocket)).
- `std::tls` — TLS client/server primitives (POSIX baseline via mbedTLS; see
 [tls](?p=std/tls)).
- `std::ssh` — ergonomic SSH client entrypoint (compatibility facade over the
 current libssh2-backed implementation; see [ssh](?p=std/ssh)).
- `std::ssh2` — concrete libssh2-backed SSH2 implementation module (see
 [ssh2](?p=std/ssh2)).
- `std::sqlite` — SQLite database primitives (POSIX baseline via SQLite),
 including async-friendly open/exec helpers (see [sqlite](?p=std/sqlite)).
- `std::runtime` — runtime interface layer used by OS-facing std modules (see [runtime](?p=std/runtime)).
- `std::ffi::c` — C FFI helpers (C strings and interop utilities; see [ffi c](?p=std/ffi-c)).
- `std::interfaces` — shared std interface contracts (“protocols”) such as
 `Drop`, `Len`, `Capacity`, etc. (see [interfaces](?p=std/interfaces)).
- `std::formal` — foundational Formal Silk theories for generic arithmetic and
 storage reasoning; module-specific theories live with their owning std
 modules (see [formal](?p=std/formal)).

Each area has a dedicated design document under `docs/std/` (for intrinsic
surfaces like `std::buffer`, the design lives in both `docs/std/` and the
corresponding language doc). The exact shapes of types and functions will
evolve as the language and backend grow; these docs are the source of truth for
the intended `std::` surface.
