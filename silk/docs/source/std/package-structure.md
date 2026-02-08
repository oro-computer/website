# `std::` Module Structure

Status: **Design + initial implementation**. This describes the intended organization and
build integration for `std::`. A first, minimal slice of the build integration
is implemented (auto-resolving `std::...` imports from a configurable stdlib
root), while most std APIs remain unimplemented.

This document defines how the standard library is organized and how it is made
available to user programs.

## Namespace Model

- `std::` is a **reserved namespace root**.
- The standard library is a **distribution of modules** whose module names begin
  with `std::...`:
  - `std::buffer` (currently implemented as a module; long-term `Buffer(T)` intrinsic; see `docs/std/buffer.md` and `docs/language/buffers.md`)
  - `std::strings`
  - `std::memory`
  - `std::arrays`
  - `std::bits`
  - `std::interfaces`
  - `std::map`
  - `std::set`
  - `std::graphics` (low-level graphics API bindings; see `docs/std/graphics.md`)
  - `std::graphics::opengl`
  - `std::graphics::opengles`
  - `std::graphics::vulkan`
  - `std::image` (image codecs + color utilities; see `docs/std/image.md`)
  - `std::image::color`
  - `std::image::png`
  - `std::image::jpeg`
  - `std::algorithms`
  - `std::temporal`
  - `std::semver`
  - `std::url`
  - `std::idl::web` (current Web IDL parser; see `docs/std/idl-web.md`)
  - `std::js::ecma` (current ECMAScript FFI surface; see `docs/std/js-ecma.md`)
  - `std::wasm` (WebAssembly runtime API; see `docs/std/wasm.md`)
  - `std::io`
  - `std::stream` (Web Streams-inspired byte streams; see `docs/std/stream.md`)
  - `std::env`
  - `std::process`
  - `std::path`
  - `std::fs`
  - `std::net`
  - `std::tls`
  - `std::http`
  - `std::https`
  - `std::websocket`
  - `std::runtime` (runtime interface layer used by OS-facing `std::...` modules; see `docs/std/runtime.md`)
- Each source file in the stdlib declares which module it defines using a
  `module` declaration:

  ```silk
  module std::strings;
  ```

The compiler treats module/package names (including `std::...`) as part of the
module set dependency graph, as specified in `docs/language/packages-imports-exports.md`.

## `std::runtime` (Runtime Interface Layer)

`std::runtime` is a dedicated namespace under `std::` that defines low-level,
platform/environment primitives in a **pluggable** way.

Design intent:

- Higher-level `std::...` modules (like `std::fs`, `std::task`, `std::sync`) are
  written against `std::runtime::...` interfaces.
- The shipped stdlib provides a default hosted POSIX backend under
  `std::runtime::posix::...` and the corresponding `std::runtime::...` modules
  delegate to it.
- Alternative stdlib roots can provide different runtime implementations (for
  example Windows or embedded) without changing the public `std::...` surface.

This layering is specified in `docs/std/runtime.md`.

## Linking by Default (Requirement)

`std::` must be **linked by default** for normal `silk build` workflows:

- The compiler provides a default stdlib *root* (an implementation-defined
  directory shipped with the compiler distribution).
- That root is automatically included in the compiler’s package/module search
  path during builds, so that:

  ```silk
  import std::strings;
  ```

  resolves without the user having to explicitly pass the stdlib source files
  on the command line.

Notes:

- This does **not** imply an implicit `import std::...;` prelude; importing is
  explicit. Linking-by-default means “`std::` is available to import”.
- The compiler should only compile/link the std modules that are reachable from
  the user’s imports (and any internal dependencies), rather than eagerly
  compiling all of `std::`.

## Swappability (Requirement)

The default stdlib must be replaceable by an alternate implementation:

- The build configuration may override the stdlib root used for resolving
  `std::...` imports.
- A replacement stdlib is expected to provide compatible packages and exported
  APIs under the same `std::...` names.
- The language and C ABI remain stable regardless of stdlib choice; `std::` is
  ordinary Silk code and does not change core semantics.

The concrete selection mechanism is a compiler/driver responsibility and must
be documented in the CLI (`docs/compiler/cli-silk.md`) and embedding ABI
(`docs/compiler/abi-libsilk.md`) once implemented.

Current toolchain behavior (first slice):

- Both the `silk` CLI and the `libsilk.a` embedding build path resolve
  `std::...` imports from a stdlib root selected by:
  - an explicit override (`--std-root` for `silk`, or `silk_compiler_set_std_root` for embedders), otherwise
  - `SILK_STD_ROOT` (environment variable) when set, otherwise
  - a `std/` directory in the current working directory (development default), otherwise
  - `../share/silk/std` relative to the current executable (installed default).
- Mapping is deterministic: `std::foo::bar` resolves to `<std_root>/foo/bar.slk`.

## Static Archive Distribution (Current Toolchain)

For distribution and incremental development, the stdlib can be built into a
static archive for a specific target ABI:

- `make stdlib` compiles each `std/**/*.slk` module (including `std/runtime/...`)
  to an ELF object via
  `silk build --kind object` and archives them into `zig-out/lib/libsilk_std.a`.
- This archive is target-specific (e.g. `linux/x86_64` ELF objects) and should
  be treated as one artifact per supported target triple/ABI, not as a
  universally portable library.

Current toolchain behavior (`linux/x86_64`):

- The compiler still loads stdlib Silk sources from the configured stdlib root
  for parsing/type-checking (so the language-level package graph is validated),
  but executable code generation treats *auto-loaded* `std::...` modules as
  **external** and resolves their exported functions from the prebuilt archive
  when one is available.
- Archive discovery (in order):
  - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) when provided, otherwise
  - `SILK_STD_LIB` (environment variable) when set,
  - `zig-out/lib/libsilk_std.a` when using the in-repo `std/` root (development),
  - `../lib/libsilk_std.a` relative to the installed `silk` executable,
  - common installed-layout heuristics derived from the selected stdlib root.

Archive member naming (scheme):

- to avoid basename collisions (for example `std/task.slk` and
  `std/runtime/posix/task.slk`), archive member names are based on the std-root
  relative path with `/` replaced by `_`, and `.slk` replaced by `.o`,
- for example: `std/runtime/posix/task.slk` → `runtime_posix_task.o`.
- When no suitable archive is found (or on unsupported targets), the compiler
  falls back to compiling the reachable std sources into the build as part of
  module-set code generation.
- `--nostd` disables stdlib auto-loading and therefore also avoids linking the
  default std archive; users may still explicitly provide their own `std::...`
  modules as ordinary inputs when desired.
- `--std-root <path>` (or `--std <path>` / `-std <path>` when `<path>` does **not** end in `.a`) selects an alternate stdlib root, and
  the corresponding archive is discovered via the same `--std-lib` / `SILK_STD_LIB` and
  installed-layout rules.

## Hosted vs Freestanding

The stdlib should be layered:

- A “core” subset that does not require OS services (collections, algorithms,
  string utilities, formatting, etc.).
- Hosted modules (`std::fs`, `std::net`, parts of `std::temporal` and
  `std::io`) that rely on POSIX syscalls or POSIX-like APIs.

This layering allows `std::` to be used in freestanding environments while
still offering a full POSIX-oriented API when available.

## Versioning and Compatibility

The standard library is shipped with the compiler and should be versioned:

- Public, exported APIs under `std::...` should follow semantic versioning.
- A compiler may require a minimum stdlib version, and should report a clear
  error when an incompatible stdlib root is selected.
