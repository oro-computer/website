---
layout: "docs"
title: "Standard Library Overview (std::)"
description: "The docs/std/ directory specifies the intended API and structure. A minimal in-tree stdlib source tree also exists under std/ (used by the toolchain to satisfy import std::...;)."
docsCollection: "silk"
section: "std"
order: 70
sourcePath: "std/overview.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Standard Library Overview (`std::`)

The `docs/std/` directory specifies the
intended API and structure. A minimal in-tree stdlib source tree also
exists under [`std/`](https://github.com/oro-computer/silk/tree/master/std/) (used by the toolchain to satisfy `import std::...;`).

As of the compiler, the in-tree stdlib includes a
small but functional set of utilities implemented purely in Silk (including
monomorphized, type-parameter generics for core collection types),
plus a tiny hosted POSIX baseline for OS-facing modules ([`std::fs`](/silk/docs/std/fs/), [`std::task`](/silk/docs/std/task/),
[`std::sync`](/silk/docs/std/sync/), [`std::io`](/silk/docs/std/io/)) implemented via the [`std::runtime`](/silk/docs/std/runtime/) interface layer
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

- [package structure](/silk/docs/std/package-structure/) (namespace + linkage + swappability)
- [conventions](/silk/docs/std/conventions/) (API conventions: errors, allocation, ownership)
- [result](/silk/docs/std/result/) (the standard `Result(T, E)` error return type)
- [module catalog](/silk/docs/std/module-catalog/) (audit-oriented coverage map for the shipped
 [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree)

Exact canonical docs exist for every shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) module. Nested modules
flatten `/` to `-` in `docs/std/`, for example:

- [`std/fs/stream.slk`](https://github.com/oro-computer/silk/blob/master/std/fs/stream.slk) -> [fs stream](/silk/docs/std/fs-stream/)
- [`std/runtime/posix/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/io.slk) -> [runtime posix io](/silk/docs/std/runtime-posix-io/)

## Core Areas

These are the minimum required areas for the initial standard library
distribution:

- [`std::bytes`](/silk/docs/std/bytes/) — borrowed byte-slice search, comparison, copy, and ASCII
 helpers for zero-copy CLI/search/build hot paths (see [bytes](/silk/docs/std/bytes/)).
- [`std::buffer`](/silk/docs/std/buffer/) — typed, width-oriented buffer utilities built on top of
 [`std::vector`](/silk/docs/std/vector/) for common scalar element types (see [buffer](/silk/docs/std/buffer/)).
- [`std::strings`](/silk/docs/std/strings/) — UTF-8 text utilities and owned string building.
- [`std::regex`](/silk/docs/std/regex/) — regular expression literals and helpers (see [regex](/silk/docs/std/regex/)).
- [`std::unicode`](/silk/docs/std/unicode/) — Unicode scalar classification helpers (see [unicode](/silk/docs/std/unicode/)).
- [`std::number`](/silk/docs/std/number/) — number parsing/formatting helpers (see [number](/silk/docs/std/number/)).
- [`std::boolean`](/silk/docs/std/boolean/) — boxed bool wrapper for method/interface-oriented APIs (see [boolean](/silk/docs/std/boolean/)).
- [`std::optional`](/silk/docs/std/optional/) — companion free-function surface for built-in `Optional(T)` combinators (see [optional](/silk/docs/std/optional/)).
- [`std::range`](/silk/docs/std/range/) — boxed `range` helper surface (see [range](/silk/docs/std/range/)).
- [`std::function`](/silk/docs/std/function/) — boxed function-value holders (see [function](/silk/docs/std/function/)).
- [`std::math`](/silk/docs/std/math/) — linear algebra utilities (vectors/matrices) for graphics and
 general computation (see [math](/silk/docs/std/math/)).
- `std::graphics` — low-level graphics API bindings and focused platform
 facades (OpenGL, OpenGL ES, Vulkan, macOS Metal handle/window-context API,
 and provider-neutral window clear facade; see [graphics](/silk/docs/std/graphics/)).
- [`std::gpu`](/silk/docs/std/gpu/) — pure-Silk GPU discovery, device buffers, embedded-kernel launch,
 and synchronization, with register-independent device operations in
 [`std::gpu::device`](/silk/docs/std/gpu-device/) and the low-level AMDGPU instruction surface in
 [`std::gpu::isa`](/silk/docs/std/gpu-isa/) (see [gpu](/silk/docs/std/gpu/), [gpu device](/silk/docs/std/gpu-device/), and
 [gpu isa](/silk/docs/std/gpu-isa/)).
- [`std::dylib`](/silk/docs/std/dylib/) — opt-in dynamic-library loading and symbol lookup with explicit
 `c_fn` function-pointer conversion from symbol addresses (see
 [dylib](/silk/docs/std/dylib/)).
- [`std::window`](/silk/docs/std/window/) — opt-in high-level window application facade with
 `run(...)`, `run_loop(...)`, `next_event(...)`, native window creation
 options, title/visibility/focus/size/position/window-state controls, macOS
 AppKit support, iOS UIKit app-bundle/lifecycle support, a GTK provider
 placeholder, and explicit macOS/iOS/GTK provider submodules (see
 [window](/silk/docs/std/window/)).
- `std::image` — image codecs + color utilities (PNG via libpng, JPEG via
 libjpeg-turbo; see [image](/silk/docs/std/image/)).
- [`std::limits`](/silk/docs/std/limits/) — numeric min/max limits for primitive types (see [limits](/silk/docs/std/limits/)).
- [`std::crypto`](/silk/docs/std/crypto/) — cryptography primitives (hosted baseline via libsodium; see
 [crypto](/silk/docs/std/crypto/)).
- [`std::ggml`](/silk/docs/std/ggml/) — ggml tensor library bindings (early bring-up; see [ggml](/silk/docs/std/ggml/)).
- [`std::uuid`](/silk/docs/std/uuid/) — UUID primitives (v1/v3/v4/v5/v6/v7/v8) with parsing/formatting
 (see [uuid](/silk/docs/std/uuid/)).
- [`std::semver`](/silk/docs/std/semver/) — Semantic Versioning (SemVer 2.0.0) parsing and precedence
 comparison (see [semver](/silk/docs/std/semver/)).
- [`std::json`](/silk/docs/std/json/) — JSON parsing, DOM construction, and stringifying (borrowed and
 owned DOM parsing plus explicit builder helpers; see [json](/silk/docs/std/json/)).
- [`std::protobuf`](/silk/docs/std/protobuf/) — dependency-free Protocol Buffers binary wire helpers used
 by `silk proto` generated modules (see [protobuf](/silk/docs/std/protobuf/)).
- [`std::toml`](/silk/docs/std/toml/) — TOML parsing, DOM construction, and deterministic emission
 (borrowed and owned DOM parsing plus explicit builder helpers;
 see [toml](/silk/docs/std/toml/)).
- [`std::tar`](/silk/docs/std/tar/) — tar archive reading and writing (ustar + pax; see [tar](/silk/docs/std/tar/)).
- `std::xml` — XML parsing and traversal (via libxml2; see [xml](/silk/docs/std/xml/)).
- `std::idl::web` — Web IDL parsing and query API (see [idl web](/silk/docs/std/idl-web/)).
- `std::js::ecma` — ECMAScript FFI surface for JS/WASM interop (see [js ecma](/silk/docs/std/js-ecma/)).
- `std::wasm` — WebAssembly runtime API (baseline wasm32 interpreter; see [wasm](/silk/docs/std/wasm/)).
- [`std::memory`](/silk/docs/std/memory/) — allocation interfaces and low-level memory utilities.
- [`std::arrays`](/silk/docs/std/arrays/) — slice/view types and helpers for fixed arrays.
- [`std::bits`](/silk/docs/std/bits/) — bit manipulation helpers (byte swaps, rotates, bit counts; see
 [bits](/silk/docs/std/bits/)).
- [`std::vector`](/silk/docs/std/vector/) — typed growable vectors (`Vector(T)`), used broadly across
 `std::` (see [vector](/silk/docs/std/vector/)).
- [`std::map`](/silk/wiki/std/map/) — associative containers (hash maps and ordered maps; see
 [map](/silk/docs/std/map/)).
- [`std::set`](/silk/wiki/std/set/) — set containers (hash sets and ordered sets; see
 [set](/silk/docs/std/set/)).
- [`std::algorithms`](/silk/docs/std/algorithms/) — common algorithms over slices/collections.
- [`std::temporal`](/silk/docs/std/temporal/) — `Instant`/`Duration` utilities and calendar/time helpers.
- [`std::time`](/silk/docs/std/time/) — small monotonic-clock and duration facade over
 [`std::temporal`](/silk/docs/std/temporal/) for systems tools (see [time](/silk/docs/std/time/)).
- [`std::url`](/silk/docs/std/url/) — WHATWG URL parsing/serialization and `URLSearchParams` (`application/x-www-form-urlencoded`; see [url](/silk/docs/std/url/)).
- [`std::task`](/silk/docs/std/task/) — task/runtime helpers, including reusable `Task(T)` join helpers
 for async code (hosted baseline; see [task](/silk/docs/std/task/)).
- [`std::sync`](/silk/docs/std/sync/) — synchronization primitives (hosted baseline; see [sync](/silk/docs/std/sync/)).
- [`std::abort_controller`](/silk/docs/std/abort_controller/) — WHATWG-style abort signals for cancellation (see
 [abort controller](/silk/docs/std/abort_controller/); detailed semantics in
 [abort controller](/silk/docs/std/abort-controller/)).
- [`std::signal`](/silk/docs/std/signal/) — pollable signal waiting for TUI programs (Linux `signalfd(2)`
 backend; see [signal](/silk/docs/std/signal/)).
- [`std::stream`](/silk/docs/std/stream/) — Web Streams-inspired byte streams and piping (see [stream](/silk/docs/std/stream/)).
- [`std::args`](/silk/docs/std/args/) — executable argument helpers for native `main(argc, argv)` and
 `wasm32-wasi` parameterless `main()` entrypoints (Supported forms; see
 [args](/silk/docs/std/args/)).
- [`std::readline`](/silk/docs/std/readline/) — interactive line editor for CLI programs (TTY mode) built on
 the bundled `linenoise` sources (see [readline](/silk/docs/std/readline/)).
- [`std::flag`](/silk/docs/std/flag/) — command line flag + positional parsing, including interspersed
 known flags before `--` (Supported forms; see [flag](/silk/docs/std/flag/)).
- [`std::test`](/silk/docs/std/test/) — test helpers for `silk test` (Supported forms; see [test](/silk/docs/std/test/)).
- [`std::build`](/silk/docs/std/build/) — build module helpers for generating `silk.toml` manifests (see [build](/silk/docs/std/build/)).
- [`std::env`](/silk/docs/std/env/) — environment variable access (hosted baseline; see [env](/silk/docs/std/env/)).
- [`std::process`](/silk/docs/std/process/) — process primitives, including high-level child-process and
 PTY-backed spawn support on the hosted baseline (see [process](/silk/docs/std/process/)).
- [`std::os`](/silk/docs/std/os/) — target OS/arch metadata and small OS helpers (see [os](/silk/docs/std/os/)).
- [`std::path`](/silk/docs/std/path/) — path manipulation utilities (Supported forms; see [path](/silk/docs/std/path/)).
- [`std::io`](/silk/docs/std/io/) — basic I/O (unbuffered fd reads/writes, formatting, stdout/stderr;
 see [io](/silk/docs/std/io/)). Stream adapters live under [`std::io::stream`](/silk/docs/std/io-stream/).
- [`std::fmt`](/silk/docs/std/fmt/) — shared formatting layer used by [`std::io`](/silk/docs/std/io/) and string builders.
- [`std::fs`](/silk/docs/std/fs/) — filesystem access (POSIX baseline; canonical module doc:
 [fs](/silk/docs/std/fs/); detailed hosted API notes in [filesystem](/silk/docs/std/filesystem/);
 stream adapters under [`std::fs::stream`](/silk/docs/std/fs-stream/)).
- [`std::net`](/silk/docs/std/networking/) — networking primitives (POSIX baseline; canonical module doc:
 [net](/silk/docs/std/net/); detailed hosted API notes in [networking](/silk/docs/std/networking/);
 stream adapters under [`std::net::stream`](/silk/docs/std/net-stream/)).
- [`std::http`](/silk/docs/std/http/) — HTTP/1.1 parsing + blocking client/server on top of [`std::net`](/silk/docs/std/networking/),
 plus async-friendly one-shot request wrappers (see [http](/silk/docs/std/http/)).
- [`std::https`](/silk/docs/std/https/) — HTTPS (HTTP over TLS) on top of [`std::tls`](/silk/docs/std/tls/) + [`std::net`](/silk/docs/std/networking/),
 plus async-friendly one-shot request wrappers (see [https](/silk/docs/std/https/)).
- [`std::websocket`](/silk/docs/std/websocket/) — RFC 6455 WebSocket (handshake + framing) on top of [`std::net`](/silk/docs/std/networking/)
 (see [websocket](/silk/docs/std/websocket/)).
- [`std::tls`](/silk/docs/std/tls/) — TLS client/server primitives (POSIX baseline via mbedTLS; see
 [tls](/silk/docs/std/tls/)).
- [`std::ssh`](/silk/docs/std/ssh/) — ergonomic SSH client entrypoint (compatibility facade over the
 current libssh2-backed implementation; see [ssh](/silk/docs/std/ssh/)).
- [`std::ssh2`](/silk/docs/std/ssh2/) — concrete libssh2-backed SSH2 implementation module (see
 [ssh2](/silk/docs/std/ssh2/)).
- [`std::sqlite`](/silk/docs/std/sqlite/) — SQLite database primitives (POSIX baseline via SQLite),
 including async-friendly open/exec helpers (see [sqlite](/silk/docs/std/sqlite/)).
- [`std::runtime`](/silk/docs/std/runtime/) — runtime interface layer used by OS-facing std modules (see [runtime](/silk/docs/std/runtime/)).
- `std::ffi::c` — C FFI helpers (C strings and interop utilities; see [ffi c](/silk/docs/std/ffi-c/)).
- [`std::interfaces`](/silk/docs/std/interfaces/) — shared std interface contracts (“protocols”) such as
 `Drop`, `Len`, `Capacity`, etc. (see [interfaces](/silk/docs/std/interfaces/)).
- [`std::formal`](/silk/docs/std/formal/) — foundational Formal Silk theories for generic arithmetic and
 storage reasoning; module-specific theories live with their owning std
 modules (see [formal](/silk/docs/std/formal/)).

Each area has a dedicated design document under `docs/std/` (for intrinsic
surfaces like [`std::buffer`](/silk/docs/std/buffer/), the design lives in both `docs/std/` and the
corresponding language doc). The exact shapes of types and functions will
evolve as the language and backend grow; these docs are the source of truth for
the intended `std::` surface.
