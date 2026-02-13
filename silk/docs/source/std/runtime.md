# `std::runtime`

Status: **Design + partial implementation**.

`std::runtime` defines a *runtime interface layer* that sits underneath the
rest of the standard library.

The goal is to make OS- and environment-specific primitives **pluggable** while
keeping the public `std::...` APIs stable. The default `std` shipped with the
compiler targets a hosted POSIX baseline, but other environments (Windows,
non-POSIX, embedded, sandboxed runtimes) should be able to provide their own
runtime implementation by supplying an alternate stdlib root with compatible
`std::runtime::...` modules.

## Motivation

- `std::fs`, `std::task`, `std::sync`, and other OS-facing std modules need
  low-level primitives (files, clocks, threads, syscalls).
- Those primitives differ significantly across platforms.
- Keeping these differences confined to `std::runtime::...` avoids scattering
  `ext` and platform `#if` style logic across the entire stdlib.

## Structure

The std runtime is organized as:

- `std::runtime::<area>` — a stable interface module used by the rest of std.
- `std::runtime::posix::<area>` — the default POSIX-backed implementation used
  by the compiler’s shipped stdlib on hosted targets.

Example:

- `std::runtime::fs` is the interface used by `std::fs`.
- `std::runtime::posix::fs` provides the POSIX implementation using `ext` calls
  like `open(2)`, `read(2)`, and `close(2)`.

In the shipped stdlib today:

- `std::runtime::mem` delegates to `std::runtime::posix::mem`,
- `std::runtime::fs` delegates to `std::runtime::posix::fs` (hosted baseline;
  on `wasm32-wasi` the compiler rewrites this to `std::runtime::wasi::fs`,
  which implements a filesystem subset using WASI Preview 1 preopened
  directories and resolves relative paths against a virtual cwd),
- `std::runtime::io` delegates to `std::runtime::posix::io` (hosted baseline;
  on `wasm32-wasi` the compiler rewrites this to `std::runtime::wasi::io`,
  which implements stdio primitives and maintains a POSIX-shaped `errno` cell
  for higher-level wrappers like `std::runtime::process`),
- `std::runtime::task` delegates to `std::runtime::posix::task`,
- `std::runtime::sync` delegates to `std::runtime::posix::sync`,
- `std::runtime::time` delegates to `std::runtime::posix::time`,
- `std::runtime::env` delegates to `std::runtime::posix::env`,
- `std::runtime::process` delegates to `std::runtime::posix::process` (hosted baseline;
  on `wasm32-wasi` the compiler rewrites this to `std::runtime::wasi::process`,
  which implements `_exit` via WASI `proc_exit` and `chdir`/`getcwd` via a
  virtual cwd layer),
- `std::runtime::net` delegates to `std::runtime::posix::net` (hosted sockets),
- `std::runtime::regex` is implemented via bundled runtime support (`libsilk_rt`) and is used by `std::regex`,
- `std::runtime::unicode` is implemented via bundled runtime support (`libsilk_rt`) and is used by `std::unicode`,
- `std::runtime::number` is implemented via bundled runtime support (`libsilk_rt`) and is used by `std::number`,
- `std::runtime::readline` is implemented via bundled runtime support (`libsilk_rt`) and is used by `std::readline`.

The long-term shape is still that `std::runtime::<area>` remains the stable
interface point, while platform backends (such as `std::runtime::posix::<area>`
and `std::runtime::windows::<area>`) can exist as separate modules in an
alternate stdlib root without changing higher-level `std::...` modules.

## Interface Design Rules

- The `std::runtime::...` surface is allowed to be low-level and `unsafe`:
  raw pointers, integer error codes, and OS-specific constants are acceptable.
- When an operation can fail, prefer returning the error code *as a value*
  (via `std::result::Result(T, int)` or an optional error `int?`) so callers do
  not need to pair a sentinel return with a separate `errno()` query.
- Higher-level, ergonomic, and allocation-aware APIs belong in `std::...`
  modules (for example `std::fs::File.read_to_end`).
- `std::runtime::...` modules should avoid exposing platform-specific struct
  layouts directly to Silk code when possible; prefer integer-like handles and
  pointer-plus-size patterns.
- The stable contract is the *Silk-level signature* in `std::runtime::...`,
  not the specific `ext` spellings used by the POSIX backend.
- Low-level primitives should be localized:
  - libc allocator `ext` bindings (`malloc`/`free`/`realloc`) and compiler-backed
    raw-memory/string intrinsics (`__silk_*`) live in `std::runtime::posix::mem`
    (and analogous backend `mem` modules),
  - other runtime backend modules should call those exported wrappers instead
    of declaring duplicate allocator/intrinsic `ext` sites.
    - for example, the shipped WASI backends (`std::runtime::wasi::io` and
      `std::runtime::wasi::time`) use `std::runtime::wasi::mem` for allocation
      and `__silk_*` intrinsics.

## Current Scope

Implemented runtime areas in the shipped stdlib:

- `std::runtime::mem` — low-level allocation and compiler-backed intrinsics used by
  higher-level std modules (`alloc`/`realloc`/`free`, raw `load`/`store`, and
  string view helpers), plus basic environment queries used by higher-level
  wrappers (for example `page_size()` for `mmap` alignment).
  - when an active region context is established with `with` (`docs/language/regions.md`),
    allocations are routed to that region for the dynamic extent of the `with`
    block (including calls into stdlib code):
    - `std::runtime::mem::alloc` allocates from the active region instead of the heap,
    - `std::runtime::mem::realloc` reallocates region pointers by allocating a
      new region block and copying bytes (it never calls libc `realloc` on a
      region-backed pointer),
    - `std::runtime::mem::free` is a no-op for region-backed pointers.
  - pointers returned by `std::runtime::mem::alloc` are owned by Silk; they must
    be released with `std::runtime::mem::free` and are not valid to pass to libc
    `free()` directly.
- `std::runtime::build` — build metadata provided by the compiler:
  - `is_debug() -> bool` returns `true` when the current artifact was compiled with `silk ... --debug` (or `-g`).
  - `kind() -> string` returns the current build kind (`"executable"`, `"object"`, `"static"`, or `"shared"`).
  - `mode() -> string` returns the current build mode (`"debug"`, `"release"`, or `"test"`).
  - `version() -> string` returns the current package version when building a package, otherwise `"0.0.0"`.
- `std::runtime::fs` — filesystem primitives used by `std::fs` (hosted baseline;
  on `wasm32-wasi` the shipped backend supports a small subset using the first
  preopened directory as a sandbox root, and resolves relative paths against a
  virtual cwd (`std::runtime::wasi::cwd`)).
  - includes read-only mapping helpers (`mmap_readonly` / `munmap`); on
    `wasm32-wasi` mapping is currently unsupported and reports `InvalidInput`.
- `std::runtime::io` — low-level stdio primitives used by `std::io` (on
  `wasm32-wasi`, rewritten to `std::runtime::wasi::io`, which maintains a
  POSIX-shaped `errno` cell for wrappers that still query `errno()`).
- `std::runtime::task` — hosted task/runtime primitives used by `std::task`
  (sleep/yield_now/available parallelism; currently blocking OS-thread operations;
  delegates to `std::runtime::posix::task` in the shipped stdlib).
- `std::runtime::sync` — hosted synchronization primitives used by `std::sync`
  (mutexes/condvars and allocation helpers; delegates to
  `std::runtime::posix::sync` in the shipped stdlib).
- `std::runtime::time` — hosted time primitives used by `std::temporal` and
  other std modules:
  - monotonic clock reads (`monotonic_now_ns`),
  - Unix wall-clock timestamp reads (`unix_now_ns` / `unix_now_ms`),
  - delegates to `std::runtime::posix::time` in the shipped stdlib.
- `std::runtime::env` — hosted environment primitives used by `std::env`
  (process environment variables; delegates to `std::runtime::posix::env` in the
  shipped stdlib on hosted targets. On `wasm32-wasi` the compiler rewrites the
  backend to `std::runtime::wasi::env`, which implements `getenv` via
  `environ_sizes_get` / `environ_get` (caching the environment snapshot for the
  process lifetime) and leaves `setenv` unsupported).
- `std::runtime::process` — hosted process primitives used by `std::process`
  (current working directory plus child-process primitives for `std::process::child`;
  delegates to `std::runtime::posix::process` in the shipped stdlib on hosted
  targets. On `wasm32-wasi`, `_exit` is implemented via `proc_exit`, while
  `chdir`/`getcwd` are implemented via a virtual cwd layer
  (`std::runtime::wasi::cwd`); hosted child-process operations remain
  unsupported).
- `std::runtime::net` — hosted networking primitives used by `std::net`
  (IPv4/IPv6 TCP + UDP sockets; delegates to `std::runtime::posix::net` in the shipped stdlib).
  - `std::runtime::regex` / `std::runtime::unicode` / `std::runtime::number` / `std::runtime::readline` —
  non-OS-specific runtime helpers used by `std::{regex,unicode,number,readline}`. These
  are implemented via `ext` bindings to a small bundled runtime support library
  (`libsilk_rt`) that ships alongside the compiler.
  - the compiler statically links this bundled runtime support into executable
    and shared-library outputs (no runtime `DT_NEEDED` dependency on
    `libsilk_rt*`).
  - embedders can override internal allocation used by `libsilk_rt` (for
    example regex runtime compilation) by calling `silk_rt_set_allocator` (see
    `include/silk_rt.h`) before invoking any `silk_rt_*` entrypoints. This hook
    affects allocations routed through `silk_rt_malloc_bytes` /
    `silk_rt_realloc_bytes` / `silk_rt_free_bytes`; it does not change the
    allocator used by `std::runtime::mem` for heap-backed pointers.
  - when building with `--noheap`, the compiler links `libsilk_rt_noheap.a`
    instead of `libsilk_rt.a`. In that configuration, `libsilk_rt` performs no
    default heap allocation unless an embedder installs an allocator via
    `silk_rt_set_allocator`.

Follow-ups are expected to introduce additional runtime areas:

- Async event loop / executor integration (`std::runtime::event_loop`) for hosted `async`/`await`:
  - the compiler already ships a bundled bring-up executor in `libsilk_rt`
    (`src/silk_rt_async.c`) and lowers `async`/`await` to it on the hosted
    `linux/x86_64` target,
  - the `std::runtime::event_loop` module now exposes low-level awaitable
    building blocks (timers + fd readiness), but the explicit `Handle`/`poll`
    surface and higher-level async adapters are still follow-up work
    (see `docs/compiler/async-runtime.md`).
- WASI networking (via WASI sockets or similar proposals) when supported by the toolchain targets.

## Providing a Custom Runtime

To provide your own runtime implementation underneath the standard library,
ship an alternate stdlib root that includes compatible `std::runtime::...`
modules.

For a CLI-focused walkthrough of selecting a std root and archive, see
`docs/usage/howto-custom-stdlib-root.md`.

At a minimum, your stdlib root should provide the runtime areas used by the
higher-level std modules you want to reuse. For example, to reuse the shipped
`std::task` and `std::sync`, provide:

- `std/runtime/task.slk` implementing the `std::runtime::task` interface
  (`available_parallelism`, `yield_now`, `sleep_us`),
- `std/runtime/sync.slk` implementing the `std::runtime::sync` interface
  (`alloc_zeroed`, `heap_free`, mutex/condvar ops),

and similarly for `std::fs` (`std/runtime/fs.slk`) if you reuse `std::fs`.

To reuse `std::io`, provide `std/runtime/io.slk` implementing the
`std::runtime::io` interface (`STDIN_FD`, `STDOUT_FD`, `STDERR_FD`, `read`,
`write`, `puts`, and hosted fd helpers used by `std::process::child` such as
`dup2`, `pipe`, `poll`, and `set_cloexec`).

Fallible operations should return errors directly:

- value-returning operations use `std::result::Result(T, int)` where `Err(int)`
  is a stable, area-specific error code consumed by higher-level `std::...`
  wrappers (for example `std::io::IOFailed.code`),
- status operations use optional errors (`int?`), returning `None` on success
  and `Some(code)` on failure.

On hosted POSIX, runtime wrappers typically map `errno` into these stable codes
inside `std::runtime::<area>` so callers do not need to pair sentinel returns
with a separate `errno()` query.

To reuse hosted time helpers in `std::temporal`, provide `std/runtime/time.slk`
implementing the `std::runtime::time` interface (`monotonic_now_ns`,
`unix_now_ns`, and `unix_now_ms`).

### Selecting the Runtime (Toolchain)

Because `std::runtime` is part of the stdlib source tree, selecting a custom
runtime is done by selecting a custom stdlib root:

- CLI: pass `--std-root <path>` (and optionally `--std-lib <path>` to provide a
  prebuilt std archive), or set `SILK_STD_ROOT` / `SILK_STD_LIB`.
- Embedding ABI: set `silk_compiler_set_std_root` (and optionally set
  `SILK_STD_LIB` to point at a prebuilt std archive).

When no suitable std archive is provided, the compiler can fall back to
compiling the reachable std sources as part of the build on supported targets.

### Building a Custom Std Archive (linux/x86_64)

For `linux/x86_64` in the current toolchain, a prebuilt stdlib archive
(`libsilk_std.a`) contains one ELF object per std module.

Archive member naming requirement (current scheme):

- the archive member name is the module path relative to the std root with `/`
  replaced by `_`, and `.slk` replaced by `.o`,
- for example: `std/runtime/posix/task.slk` → `runtime_posix_task.o`.

The in-repo `make stdlib` target produces archives with this naming scheme.
