---
layout: "docs"
description: "std::runtime defines a runtime interface layer that sits underneath the rest of the standard library."
docsCollection: "silk"
section: "std"
order: 115
sourcePath: "std/runtime.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::runtime`](/silk/docs/std/runtime/)

[`std::runtime`](/silk/docs/std/runtime/) defines a *runtime interface layer* that sits underneath the
rest of the standard library.

The goal is to make OS- and environment-specific primitives **pluggable** while
keeping the public `std::...` APIs stable. The default [`std`](https://github.com/oro-computer/silk/tree/master/std) shipped with the
compiler targets a hosted POSIX baseline, but other environments (Windows,
non-POSIX, embedded, sandboxed runtimes) should be able to provide their own
runtime implementation by supplying an alternate stdlib root with compatible
[`std::runtime::...`](/silk/docs/std/runtime/) modules.

## Motivation

- [`std::fs`](/silk/docs/std/fs/), [`std::task`](/silk/docs/std/task/), [`std::sync`](/silk/docs/std/sync/), and other OS-facing std modules need
 low-level primitives (files, clocks, threads, syscalls).
- Those primitives differ significantly across platforms.
- Keeping these differences confined to [`std::runtime::...`](/silk/docs/std/runtime/) avoids scattering
 `ext` and platform `#if` style logic across the entire stdlib.

## Structure

The std runtime is organized as:

- [`std::runtime::<area>`](/silk/docs/std/runtime/) — a stable interface module used by the rest of std.
- [`std::runtime::posix::<area>`](/silk/docs/std/runtime/) — the default POSIX-backed implementation used
 by the compiler’s shipped stdlib on hosted targets.

Example:

- [`std::runtime::fs`](/silk/docs/std/runtime-fs/) is the interface used by [`std::fs`](/silk/docs/std/fs/).
- [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/) provides the POSIX implementation using `ext` calls
 like `open(2)`, `read(2)`, and `close(2)`.

In the shipped stdlib today:

- [`std::runtime::mem`](/silk/docs/std/runtime-mem/) delegates to [`std::runtime::posix::mem`](/silk/docs/std/runtime-posix-mem/),
- [`std::runtime::fs`](/silk/docs/std/runtime-fs/) delegates to [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/) (hosted baseline;
 on `wasm32-wasi` the compiler rewrites this to [`std::runtime::wasi::fs`](/silk/docs/std/runtime-wasi-fs/),
 which implements a filesystem subset using WASI Preview 1 preopened
 directories and resolves relative paths against a virtual cwd),
- [`std::runtime::io`](/silk/docs/std/runtime-io/) delegates to [`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/) (hosted baseline;
 on `wasm32-wasi` the compiler rewrites this to [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/),
 which implements stdio primitives and maintains a POSIX-shaped `errno` cell
 for higher-level wrappers like [`std::runtime::process`](/silk/docs/std/runtime-process/)),
- [`std::runtime::task`](/silk/docs/std/runtime-task/) delegates to [`std::runtime::posix::task`](/silk/docs/std/runtime-posix-task/),
- [`std::runtime::sync`](/silk/docs/std/runtime-sync/) delegates to [`std::runtime::posix::sync`](/silk/docs/std/runtime-posix-sync/),
- [`std::runtime::time`](/silk/docs/std/runtime-time/) delegates to [`std::runtime::posix::time`](/silk/docs/std/runtime-posix-time/)
 (hosted baseline; on `wasm32-wasi` the compiler rewrites this to
 [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/), which implements the same
 `monotonic_now_ns` / `unix_now_ns` / `unix_now_ms` contract with WASI
 Preview 1 clocks),
- [`std::runtime::env`](/silk/docs/std/runtime-env/) delegates to [`std::runtime::posix::env`](/silk/docs/std/runtime-posix-env/),
- [`std::runtime::process`](/silk/docs/std/runtime-process/) delegates to [`std::runtime::posix::process`](/silk/docs/std/runtime-posix-process/) (hosted baseline;
 on `wasm32-wasi` the compiler rewrites this to [`std::runtime::wasi::process`](/silk/docs/std/runtime-wasi-process/),
 which implements `_exit` via WASI `proc_exit` and `chdir`/`getcwd` via a
 virtual cwd layer),
- [`std::runtime::net`](/silk/docs/std/runtime-net/) delegates to [`std::runtime::posix::net`](/silk/docs/std/runtime-posix-net/) (hosted sockets),
- [`std::runtime::regex`](/silk/docs/std/runtime-regex/) is implemented via bundled runtime support (`libsilk_rt`) and is used by [`std::regex`](/silk/docs/std/regex/),
- [`std::runtime::unicode`](/silk/docs/std/runtime-unicode/) is implemented via bundled runtime support (`libsilk_rt`) and is used by [`std::unicode`](/silk/docs/std/unicode/),
- [`std::runtime::number`](/silk/docs/std/runtime-number/) is implemented via bundled runtime support (`libsilk_rt`) and is used by [`std::number`](/silk/docs/std/number/),
- [`std::runtime::readline`](/silk/docs/std/runtime-readline/) is implemented via bundled runtime support (`libsilk_rt`) and is used by [`std::readline`](/silk/docs/std/readline/),
- [`std::runtime::gpu`](/silk/docs/std/runtime-gpu/) is implemented via bundled runtime support (`libsilk_rt`),
 dynamically discovers HIP on Linux, and is used by [`std::gpu`](/silk/docs/std/gpu/),
- [`std::runtime::window`](/silk/docs/std/runtime-window/) uses bundled runtime support (`libsilk_rt`) on
 macOS/iOS and local unsupported-provider stubs on targets without a current
 window provider; it is used only by the opt-in [`std::window`](/silk/docs/std/window/) facade.

The long-term shape is still that [`std::runtime::<area>`](/silk/docs/std/runtime/) remains the stable
interface point, while platform backends (such as [`std::runtime::posix::<area>`](/silk/docs/std/runtime/)
and [`std::runtime::windows::<area>`](/silk/docs/std/runtime/)) can exist as separate modules in an
alternate stdlib root without changing higher-level `std::...` modules.

## Interface Design Rules

- The [`std::runtime::...`](/silk/docs/std/runtime/) surface is allowed to be low-level and `unsafe`:
 raw pointers, integer error codes, and OS-specific constants are acceptable.
- When an operation can fail, prefer returning the error code *as a value*
 (via [`std::result::Result(T, int)`](/silk/docs/std/result/) or an optional error `int?`) so callers do
 not need to pair a sentinel return with a separate `errno()` query.
- Higher-level, ergonomic, and allocation-aware APIs belong in `std::...`
 modules (for example [`std::fs::File.read_to_end`](/silk/docs/std/fs/)).
- [`std::runtime::...`](/silk/docs/std/runtime/) modules should avoid exposing platform-specific struct
 layouts directly to Silk code when possible; prefer integer-like handles and
 pointer-plus-size patterns.
- The stable contract is the *Silk-level signature* in [`std::runtime::...`](/silk/docs/std/runtime/),
 not the specific `ext` spellings used by the POSIX backend.
- Low-level primitives should be localized:
 - libc allocator `ext` bindings (`malloc`/`free`/`realloc`) and compiler-backed
 raw-memory/string intrinsics (`__silk_*`) live in [`std::runtime::posix::mem`](/silk/docs/std/runtime-posix-mem/)
 (and analogous backend `mem` modules),
 - other runtime backend modules should call those exported wrappers instead
 of declaring duplicate allocator/intrinsic `ext` sites.
 - for example, the shipped WASI backends ([`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/) and
 [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/)) use [`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/) for allocation
 and `__silk_*` intrinsics.

## Considerations
Runtime areas in the shipped stdlib:

- [`std::runtime::mem`](/silk/docs/std/runtime-mem/) — low-level allocation and compiler-backed intrinsics used by
 higher-level std modules (`alloc`/`realloc`/`free`, raw `load`/`store`, and
 string view helpers), plus basic environment queries used by higher-level
 wrappers (for example `page_size()` for `mmap` alignment).
 - when an active region context is established with `with` ([regions](/silk/docs/language/regions/)),
 allocations are routed to that region for the dynamic extent of the `with`
 block (including calls into stdlib code):
 - [`std::runtime::mem::alloc`](/silk/docs/std/runtime-mem/) allocates from the active region instead of the heap,
 - [`std::runtime::mem::realloc`](/silk/docs/std/runtime-mem/) reallocates region pointers by allocating a
 new region block and copying bytes (it never calls libc `realloc` on a
 region-backed pointer),
 - [`std::runtime::mem::free`](/silk/docs/std/runtime-mem/) is a no-op for region-backed pointers.
 - pointers returned by [`std::runtime::mem::alloc`](/silk/docs/std/runtime-mem/) are owned by Silk; they must
 be released with [`std::runtime::mem::free`](/silk/docs/std/runtime-mem/) and are not valid to pass to libc
 `free()` directly.
- [`std::runtime::build`](/silk/docs/std/runtime-build/) — build metadata provided by the compiler:
 - `is_debug() -> bool` returns `true` when the current artifact was compiled with `silk ... --debug` (or `-g`).
 - `kind() -> string` returns the current build kind (`"executable"`, `"object"`, `"static"`, or `"shared"`).
 - `mode() -> string` returns the current build mode (`"debug"`, `"release"`, or `"test"`).
 - `version() -> string` returns the current package version when building a package, otherwise `"0.0.0"`.
 - the module also exports Formal Silk build-gating theories:
 - `build_kind_is(...)`
 - `build_mode_is(...)`
 - `requires_debug_mode()`
 - `requires_release_mode()`
 - `requires_executable_kind()`
 - `requires_object_kind()`
 - `requires_static_kind()`
 - `requires_shared_kind()`
 - `build_version_at_least(...)`
- [`std::runtime::gpu`](/silk/docs/std/runtime-gpu/) — Linux host-side GPU discovery, tracked device memory,
 bounded copies, packed explicit-kernarg kernel launch, synchronization, and
 last-error access used by [`std::gpu`](/silk/docs/std/gpu/); see [runtime gpu](/silk/docs/std/runtime-gpu/).
- [`std::runtime::fs`](/silk/docs/std/runtime-fs/) — filesystem primitives used by [`std::fs`](/silk/docs/std/fs/) (hosted baseline;
 on `wasm32-wasi` the shipped backend supports a small subset using the first
 preopened directory as a sandbox root, and resolves relative paths against a
 virtual cwd ([`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/))).
 - includes read-only mapping helpers (`mmap_readonly` / `munmap`); on
 `wasm32-wasi` mapping is currently unsupported and reports `InvalidInput`.
 - includes `mkstemp(template_ptr)` for creating unique temporary files from a
 writable NUL-terminated template ending in `XXXXXX` (hosted POSIX
 baseline). On `wasm32-wasi` this operation is currently unsupported and
 reports `InvalidInput`.
 - includes raw stat metadata queries (`stat`, `lstat`, `fstat`) plus path
 classification (`path_kind`) and owned canonical path resolution
 (`realpath`) for higher-level wrappers such as
 [`std::fs::{stat,lstat,fstat,path_kind,is_regular_file,realpath}`](/silk/docs/std/fs/).
 - on the hosted POSIX baseline, `stat` / `path_kind` follow symlinks,
 `lstat` reports the link itself, and `realpath` resolves symlinks via the
 underlying OS,
 - on `wasm32-wasi`, `stat` / `lstat` / `fstat` are implemented from WASI
 preview1 filestat syscalls with a reduced metadata set, `path_kind` is
 supported, and `realpath` is currently unsupported and reports
 `InvalidInput`.
- [`std::runtime::io`](/silk/docs/std/runtime-io/) — low-level stdio primitives used by [`std::io`](/silk/docs/std/io/) (on
 `wasm32-wasi`, rewritten to [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/), which maintains a
 POSIX-shaped `errno` cell for wrappers that still query `errno()`). This
 surface also includes `async fn` wrappers (`read_async` / `write_async`)
 backed by the hosted async runtime on `linux/*`; on other targets they
 complete immediately by issuing the blocking `read`/`write` operation.
 It also includes PTY helpers used by [`std::process::child::Command.spawn_pty`](/silk/docs/std/process-child/)
 on the hosted POSIX baseline (`pty_open`, `pty_prepare_child`).
- [`std::runtime::task`](/silk/docs/std/runtime-task/) — hosted task/runtime primitives used by [`std::task`](/silk/docs/std/task/)
 (sleep/yield_now/available parallelism; currently blocking OS-thread operations;
 delegates to [`std::runtime::posix::task`](/silk/docs/std/runtime-posix-task/) in the shipped stdlib).
- [`std::runtime::sync`](/silk/docs/std/runtime-sync/) — hosted synchronization primitives used by [`std::sync`](/silk/docs/std/sync/)
 (mutexes/condvars and allocation helpers; delegates to
 [`std::runtime::posix::sync`](/silk/docs/std/runtime-posix-sync/) in the shipped stdlib. On `wasm32-wasi` the
 compiler rewrites this to [`std::runtime::wasi::sync`](/silk/docs/std/runtime-wasi-sync/), which is a single-thread
 stub backend.)
- [`std::runtime::time`](/silk/docs/std/runtime-time/) — hosted time primitives used by [`std::temporal`](/silk/docs/std/temporal/) and
 other std modules:
 - monotonic clock reads (`monotonic_now_ns`),
 - Unix wall-clock timestamp reads (`unix_now_ns` / `unix_now_ms`),
 - delegates to [`std::runtime::posix::time`](/silk/docs/std/runtime-posix-time/) in the shipped stdlib,
 - the POSIX implementation reads into a calling-thread stack `timespec`
 through the bundled runtime, so clock reads are allocation-free,
 reentrant across task workers, and supported by `--noheap` builds.
- [`std::runtime::env`](/silk/docs/std/runtime-env/) — hosted environment primitives used by [`std::env`](/silk/docs/std/env/)
 (process environment variables; delegates to [`std::runtime::posix::env`](/silk/docs/std/runtime-posix-env/) in the
 shipped stdlib on hosted targets. On `wasm32-wasi` the compiler rewrites the
 backend to [`std::runtime::wasi::env`](/silk/docs/std/runtime-wasi-env/), which implements `getenv` via
 `environ_sizes_get` / `environ_get` (caching the environment snapshot for the
 process lifetime) and leaves `setenv` unsupported).
- [`std::runtime::process`](/silk/docs/std/runtime-process/) — hosted process primitives used by [`std::process`](/silk/docs/std/process/)
 (current working directory plus child-process primitives for [`std::process::child`](/silk/docs/std/process-child/);
 delegates to [`std::runtime::posix::process`](/silk/docs/std/runtime-posix-process/) in the shipped stdlib on hosted
 targets. On `wasm32-wasi`, `_exit` is implemented via `proc_exit`, while
 `chdir`/`getcwd` are implemented via a virtual cwd layer
 ([`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/)); hosted child-process operations remain
 unsupported).
- [`std::runtime::net`](/silk/docs/std/runtime-net/) — hosted networking primitives used by [`std::net`](/silk/docs/std/networking/)
 (IPv4/IPv6 TCP + UDP sockets plus hostname resolution used by
 [`std::net::resolve_host`](/silk/docs/std/networking/); delegates to [`std::runtime::posix::net`](/silk/docs/std/runtime-posix-net/) in the shipped stdlib).
- Apple Security runtime helpers — bundled `silk_rt_apple_crypto_*` symbols
 used by the Apple `platform` security provider for [`std::crypto`](/silk/docs/std/crypto/) core/random
 operations. These helpers are statically linked when referenced and require
 `Security.framework` on Apple targets.
- [`std::runtime::z3`](/silk/docs/std/runtime-z3/) — low-level `ext` bindings for the Z3 C API (built-in on
 the glibc hosted layout; musl targets require an explicit downstream Z3
 library).
- [`std::runtime::regex`](/silk/docs/std/runtime-regex/) / [`std::runtime::unicode`](/silk/docs/std/runtime-unicode/) / [`std::runtime::number`](/silk/docs/std/runtime-number/) / [`std::runtime::readline`](/silk/docs/std/runtime-readline/) —
 non-OS-specific runtime helpers used by `std::{regex,unicode,number,readline}`. These
 are implemented via `ext` bindings to a small bundled runtime support library
 (`libsilk_rt`) that ships alongside the compiler.
 - [`std::runtime::readline`](/silk/docs/std/runtime-readline/) now also includes process-global completion-list
 management used by the public [`std::readline::{clear_completions,add_completion}`](/silk/docs/std/readline/)
 surface.
 - the compiler statically links this bundled runtime support into executable
 and shared-library outputs (no runtime `DT_NEEDED` dependency on
 `libsilk_rt*`).
 - embedders can override internal allocation used by `libsilk_rt` (for
 example regex runtime compilation) by calling `silk_rt_set_allocator` (see
 [`include/silk/rt.h`](https://github.com/oro-computer/silk/blob/master/include/silk/rt.h)) before invoking any `silk_rt_*` entrypoints. This hook
 affects allocations routed through `silk_rt_malloc_bytes` /
 `silk_rt_realloc_bytes` / `silk_rt_free_bytes`; it does not change the
 allocator used by [`std::runtime::mem`](/silk/docs/std/runtime-mem/) for heap-backed pointers.
 - allocator changes affect future bundled-runtime allocations. Any pointer
 returned by `silk_rt_malloc_bytes(...)` remembers the realloc/free hooks
 that created it, so later `silk_rt_realloc_bytes(...)` /
 `silk_rt_free_bytes(...)` calls keep allocator identity stable across later
 allocator changes. Runtime-owned regex bytecode uses that same lifetime
 rule.
 - the allocator override is process-global, but bundled-runtime helper calls
 and `silk_rt_set_allocator` are internally synchronized while reading or
 updating the current hook set. Concurrent allocator changes can still
 affect which hook future bundled-runtime allocations use.
 - `silk_rt_realloc_bytes(...)` and `silk_rt_free_bytes(...)` only accept
 pointers that correspond to a currently live allocation previously
 returned by `silk_rt_malloc_bytes(...)` or
 `silk_rt_realloc_bytes(...)`. Foreign pointers, forged helper headers,
 stale pre-`realloc` pointers, and already-freed helper pointers are all
 treated as non-live inputs and ignored safely (`realloc` returns `NULL`,
 `free` is a no-op).
 - when building with `--noheap`, the compiler links `libsilk_rt_noheap.a`
 instead of `libsilk_rt.a`. In that configuration, `libsilk_rt` performs no
 default heap allocation unless an embedder installs an allocator via
 `silk_rt_set_allocator`.
- [`std::runtime::window`](/silk/docs/std/runtime-window/) — low-level target/provider detection, opaque
 provider handles, nonblocking provider event polling, high-level provider
 `run(...)` / `run_ex(...)` boundaries, and native window-control hooks used
 by [`std::window`](/silk/docs/std/window/). The shipped runtime currently opens AppKit windows with
 stdlib creation options, pumps one AppKit event at a time, exposes AppKit
 title/visibility/focus/size/position/minimize/maximize/always-on-top/
 background controls, enters `UIApplicationMain` and creates a visible
 `UIWindow` on iOS when launched from the generated app bundle, and rejects
 GTK/unsupported targets through local stubs that do not declare window
 provider externs.
- [`std::runtime::graphics::metal`](/silk/docs/std/runtime-graphics-metal/) — low-level macOS Metal runtime boundary used
 by [`std::graphics::metal`](/silk/docs/std/graphics-metal/) and [`std::graphics::window`](/silk/docs/std/graphics-window/). It declares the
 `silk_rt_metal_*` device, queue, layer, drawable, render-pass, encoder,
 buffer, library, pipeline, draw, and compatibility clear-window ABI only for
 macOS. Unsupported-target behavior stays in the public graphics facades so
 non-Metal targets do not lower Metal provider externs.

Follow-ups are expected to introduce additional runtime areas:

- Async event loop / executor integration ([`std::runtime::event_loop`](/silk/docs/std/runtime-event_loop/)) for hosted `async`/`await`:
 - the compiler already ships a bundled bring-up executor in `libsilk_rt`
 ([`src/silk_rt_async.c`](https://github.com/oro-computer/silk/blob/master/src/silk_rt_async.c)) and lowers `async`/`await` to it on the hosted
 `linux/x86_64` target,
 - the [`std::runtime::event_loop`](/silk/docs/std/runtime-event_loop/) module now exposes low-level awaitable
 building blocks (timers + fd readiness, including `fd_wait_readable2` and `fd_wait_readable_any`) and an explicit `Handle`/`poll`
 surface for manually driving the hosted executor/event loop. Higher-level
 async adapters are still follow-up work
 (see [async runtime](/silk/docs/compiler/async-runtime/)).
 - the hosted executor is thread-affine: `Handle.poll()` / `Handle.deinit()`
 must be called from the same OS thread that created the handle; cross-thread
 wake is supported via `Handle.wake()`.
 - abort-aware wrappers exist for cooperative cancellation ([`std::abort_controller`](/silk/docs/std/abort_controller/)):
 - `sleep_ms_abortable(ms, sig) -> bool`
 - `fd_wait_readable_abortable(fd, sig) -> bool`
 - `fd_wait_writable_abortable(fd, sig) -> bool`
 In the Supported forms, aborts are generally observed only before/after the
 awaited operation. For `fd_wait_readable_abortable`, when the runtime can
 provide a pollable abort fd (`AbortSignalBorrow.wait_fd()`), aborts can
 interrupt an in-flight wait by awaiting `fd_wait_readable2(fd, abort_fd)`.
 When no pollable abort fd is available, it falls back to the before/after
 checks.
- WASI networking (via WASI sockets or similar proposals) when supported by the toolchain targets.

## Providing a Custom Runtime

To provide your own runtime implementation underneath the standard library,
ship an alternate stdlib root that includes compatible [`std::runtime::...`](/silk/docs/std/runtime/)
modules.

For a CLI-focused walkthrough of selecting a std root and archive, see
[howto custom stdlib root](/silk/docs/usage/howto-custom-stdlib-root/).

At a minimum, your stdlib root should provide the runtime areas used by the
higher-level std modules you want to reuse. For example, to reuse the shipped
[`std::task`](/silk/docs/std/task/) and [`std::sync`](/silk/docs/std/sync/), provide:

- [`std/runtime/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/task.slk) implementing the [`std::runtime::task`](/silk/docs/std/runtime-task/) interface
 (`available_parallelism`, `yield_now`, `sleep_us`),
- [`std/runtime/sync.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/sync.slk) implementing the [`std::runtime::sync`](/silk/docs/std/runtime-sync/) interface
 (`alloc_zeroed`, `heap_free`, mutex/condvar ops),

and similarly for [`std::fs`](/silk/docs/std/fs/) ([`std/runtime/fs.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/fs.slk)) if you reuse [`std::fs`](/silk/docs/std/fs/).

To reuse [`std::io`](/silk/docs/std/io/), provide [`std/runtime/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/io.slk) implementing the
[`std::runtime::io`](/silk/docs/std/runtime-io/) interface (`STDIN_FD`, `STDOUT_FD`, `STDERR_FD`, `read`,
`write`, `dup`, `read_async`, `write_async`, `puts`, and hosted fd helpers used
by [`std::process::child`](/silk/docs/std/process-child/) such as `dup2`, `pipe`, `poll`, and `set_cloexec`).

Fallible operations should return errors directly:

- value-returning operations use [`std::result::Result(T, int)`](/silk/docs/std/result/) where `Err(int)`
 is a stable, area-specific error code consumed by higher-level `std::...`
 wrappers (for example [`std::io::IOFailed.code`](/silk/docs/std/io/)),
- status operations use optional errors (`int?`), returning `None` on success
 and `Some(code)` on failure.

On hosted POSIX, runtime wrappers typically map `errno` into these stable codes
inside [`std::runtime::<area>`](/silk/docs/std/runtime/) so callers do not need to pair sentinel returns
with a separate `errno()` query.

To reuse hosted time helpers in [`std::temporal`](/silk/docs/std/temporal/), provide [`std/runtime/time.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/time.slk)
implementing the [`std::runtime::time`](/silk/docs/std/runtime-time/) interface (`monotonic_now_ns`,
`unix_now_ns`, and `unix_now_ms`).

### Selecting the Runtime (Toolchain)

Because [`std::runtime`](/silk/docs/std/runtime/) is part of the stdlib source tree, selecting a custom
runtime is done by selecting a custom stdlib root:

- CLI: pass `--std-root <path>` (and optionally `--std-lib <path>` to provide a
 prebuilt std archive), or set `SILK_STD_ROOT` / `SILK_STD_LIB`.
- Embedding ABI: set `silk_compiler_set_std_root` (and optionally set
 `SILK_STD_LIB` to point at a prebuilt std archive).

When no suitable std archive is provided, the compiler can fall back to
compiling the reachable std sources as part of the build on supported targets.

### Building a Custom Std Archive

For supported native hosted archive targets in the current toolchain
(`linux/x86_64` and `macos/aarch64`), a prebuilt stdlib archive
(`libsilk_std.a`) contains one object per std module.

Archive member naming requirement (current scheme):

- the archive member name is the module path relative to the std root with `/`
 replaced by `_`, and `.slk` replaced by `.o`,
- for example: [`std/runtime/posix/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/task.slk) → `runtime_posix_task.o`.

The in-repo `make stdlib` target produces archives with this naming scheme.
