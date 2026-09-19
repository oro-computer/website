---
layout: "docs"
description: "This describes the intended organization and build integration for std::. A first, minimal slice of the build integration is implemented (auto-resolving std::... imports from a configurable stdlib roo"
docsCollection: "silk"
section: "std"
order: 72
sourcePath: "std/package-structure.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `std::` Module Structure

This describes the intended organization and
build integration for `std::`. A first, minimal slice of the build integration
is implemented (auto-resolving `std::...` imports from a configurable stdlib
root), while most std APIs remain unimplemented.

This document defines how the standard library is organized and how it is made
available to user programs.

## Namespace Model

- `std::` is a **reserved namespace root**.
- The standard library is a **distribution of modules** whose module names begin
 with `std::...`:
 - [`std::buffer`](/silk/docs/std/buffer/) (currently implemented as a module; long-term `Buffer(T)` intrinsic; see [buffer](/silk/docs/std/buffer/) and [buffers](/silk/docs/language/buffers/))
 - [`std::strings`](/silk/docs/std/strings/)
 - [`std::memory`](/silk/docs/std/memory/)
 - [`std::arrays`](/silk/docs/std/arrays/)
 - [`std::bits`](/silk/docs/std/bits/)
 - [`std::interfaces`](/silk/docs/std/interfaces/)
 - [`std::queue`](/silk/docs/std/queue/)
 - [`std::stack`](/silk/docs/std/stack/)
 - [`std::list`](/silk/docs/std/list/)
 - [`std::map`](/silk/wiki/std/map/)
 - [`std::set`](/silk/wiki/std/set/)
 - `std::graphics` (low-level graphics API bindings; see [graphics](/silk/docs/std/graphics/))
 - [`std::graphics::opengl`](/silk/docs/std/graphics-opengl/)
 - [`std::graphics::opengles`](/silk/docs/std/graphics-opengles/)
 - [`std::graphics::metal`](/silk/docs/std/graphics-metal/)
 - [`std::graphics::window`](/silk/docs/std/graphics-window/)
 - [`std::graphics::vulkan`](/silk/docs/std/graphics-vulkan/)
 - [`std::window`](/silk/docs/std/window/) (opt-in high-level window application facade; see [window](/silk/docs/std/window/))
 - [`std::window::macos`](/silk/docs/std/window-macos/)
 - [`std::window::ios`](/silk/docs/std/window-ios/)
 - [`std::window::gtk`](/silk/docs/std/window-gtk/)
 - `std::image` (image codecs + color utilities; see [image](/silk/docs/std/image/))
 - [`std::image::color`](/silk/docs/std/image-color/)
 - [`std::image::png`](/silk/docs/std/image-png/)
 - [`std::image::jpeg`](/silk/docs/std/image-jpeg/)
 - [`std::algorithms`](/silk/docs/std/algorithms/)
 - [`std::temporal`](/silk/docs/std/temporal/)
 - [`std::boolean`](/silk/docs/std/boolean/)
 - [`std::optional`](/silk/docs/std/optional/)
 - [`std::range`](/silk/docs/std/range/)
 - [`std::function`](/silk/docs/std/function/)
 - [`std::gpu`](/silk/docs/std/gpu/) (pure-Silk host GPU facade)
 - [`std::gpu::device`](/silk/docs/std/gpu-device/) (register-independent GPU device operations)
 - [`std::gpu::isa`](/silk/docs/std/gpu-isa/) (low-level AMDGPU device instruction surface)
 - [`std::dylib`](/silk/docs/std/dylib/)
 - [`std::semver`](/silk/docs/std/semver/)
 - [`std::protobuf`](/silk/docs/std/protobuf/) (Protocol Buffers wire helpers and `silk proto` runtime
 support; see [protobuf](/silk/docs/std/protobuf/))
 - [`std::url`](/silk/docs/std/url/)
 - [`std::tar`](/silk/docs/std/tar/) (tar archives; see [tar](/silk/docs/std/tar/))
 - `std::xml` (XML parsing; see [xml](/silk/docs/std/xml/))
 - `std::idl::web` (current Web IDL parser; see [idl web](/silk/docs/std/idl-web/))
 - `std::js::ecma` (current ECMAScript FFI surface; see [js ecma](/silk/docs/std/js-ecma/))
 - `std::wasm` (WebAssembly runtime API; see [wasm](/silk/docs/std/wasm/))
 - [`std::io`](/silk/docs/std/io/)
 - [`std::stream`](/silk/docs/std/stream/) (Web Streams-inspired byte streams; see [stream](/silk/docs/std/stream/))
 - [`std::env`](/silk/docs/std/env/)
 - [`std::process`](/silk/docs/std/process/)
 - [`std::os`](/silk/docs/std/os/)
 - [`std::path`](/silk/docs/std/path/)
 - [`std::fs`](/silk/docs/std/fs/)
 - [`std::net`](/silk/docs/std/networking/)
 - [`std::tls`](/silk/docs/std/tls/)
 - [`std::http`](/silk/docs/std/http/)
 - [`std::https`](/silk/docs/std/https/)
 - [`std::websocket`](/silk/docs/std/websocket/)
 - [`std::runtime`](/silk/docs/std/runtime/) (runtime interface layer used by OS-facing `std::...` modules; see [runtime](/silk/docs/std/runtime/))
- Each source file in the stdlib declares which module it defines using a
 `module` declaration:

  ```silk
  module std::strings;
  ```

The compiler treats module/package names (including `std::...`) as part of the
module set dependency graph, as specified in [packages imports exports](/silk/docs/language/packages-imports-exports/).

## [`std::runtime`](/silk/docs/std/runtime/) (Runtime Interface Layer)

[`std::runtime`](/silk/docs/std/runtime/) is a dedicated namespace under `std::` that defines low-level,
platform/environment primitives in a **pluggable** way.

Design intent:

- Higher-level `std::...` modules (like [`std::fs`](/silk/docs/std/fs/), [`std::task`](/silk/docs/std/task/), [`std::sync`](/silk/docs/std/sync/)) are
 written against [`std::runtime::...`](/silk/docs/std/runtime/) interfaces.
- The shipped stdlib provides a default hosted POSIX backend under
 [`std::runtime::posix::...`](/silk/docs/std/runtime/) and the corresponding [`std::runtime::...`](/silk/docs/std/runtime/) modules
 delegate to it.
- Alternative stdlib roots can provide different runtime implementations (for
 example Windows or embedded) without changing the public `std::...` surface.

This layering is specified in [runtime](/silk/docs/std/runtime/).

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

- This does **not** imply an implicit `import std::...;` of all std modules;
 importing remains explicit. Linking-by-default means “`std::` is available to
 import”.
- When the standard library is enabled (the default), the compiler provides a
 small implicit std prelude of selected symbols (for example `Result` and the
 [`std::interfaces`](/silk/docs/std/interfaces/) interface names) as specified by [`std::runtime::globals`](/silk/docs/std/runtime-globals/).
 Use `--nostd` to disable this behavior.
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
be documented in the CLI ([cli silk](/silk/docs/compiler/cli-silk/)) and embedding ABI
([abi libsilk](/silk/docs/compiler/abi-libsilk/)) once implemented.

Current toolchain behavior (first slice):

- Both the `silk` CLI and the `libsilk.a` embedding build path resolve
 `std::...` imports from a stdlib root selected by:
 - an explicit override (`--std-root` for `silk`, or `silk_compiler_set_std_root` for embedders), otherwise
 - `SILK_STD_ROOT` (environment variable) when set, otherwise
 - a [`std/`](https://github.com/oro-computer/silk/tree/master/std/) directory in the current working directory (development default), otherwise
 - `../share/silk/std` relative to the current executable (installed default).
- Mapping is deterministic: `std::foo::bar` resolves to `<std_root>/foo/bar.slk`.

## Static Archive Distribution

For distribution and incremental development, the stdlib can be built into a
static archive for a specific target ABI:

- `make stdlib` compiles each [`std/**/*.slk`](https://github.com/oro-computer/silk/blob/master/std/**/*.slk) module (including `std/runtime/...`)
 to a target object via `silk build --kind object` and archives the objects
 with defined external symbols into `build/lib/silk/std/libsilk_std.a`.
 Type-only, documentation-only, or inactive platform shim modules may still
 produce valid symbol-empty object files; those files are kept under
 `build/lib/silk/std/obj/` for object-generation coverage but are omitted from
 the archive because they cannot satisfy link-time references.
- This archive is target-specific (for example ELF objects on `linux/x86_64`
 or Mach-O objects on `macos/aarch64`) and should be treated as one artifact
 per supported target triple/ABI, not as a universally portable library.

Current toolchain behavior (`linux/x86_64`):

- The compiler still loads stdlib Silk sources from the configured stdlib root
 for parsing/type-checking (so the language-level package graph is validated),
 but executable code generation treats *auto-loaded* `std::...` modules as
 **external** and resolves their exported functions from the prebuilt archive
 when one is available.
- Archive discovery (in order):
 - `--std-lib <path>` (or `--std <path>.a` / `-std <path>.a`) when provided, otherwise
 - `SILK_STD_LIB` (environment variable) when set,
 - `build/lib/silk/std/libsilk_std.a` when using the in-repo [`std/`](https://github.com/oro-computer/silk/tree/master/std/) root (development),
 - `../lib/silk/std/libsilk_std.a` relative to the installed `silk` executable,
 - `../lib/libsilk_std.a` relative to the installed `silk` executable (legacy installed layout),
 - common installed-layout heuristics derived from the selected stdlib root.

Archive member naming (scheme):

- to avoid basename collisions (for example [`std/task.slk`](https://github.com/oro-computer/silk/blob/master/std/task.slk) and
 [`std/runtime/posix/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/task.slk)), archive member names are based on the std-root
 relative path with `/` replaced by `_`, and `.slk` replaced by `.o`,
- for example: [`std/runtime/posix/task.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/task.slk) → `runtime_posix_task.o`.
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
- Hosted modules ([`std::fs`](/silk/docs/std/fs/), [`std::net`](/silk/docs/std/networking/), parts of [`std::temporal`](/silk/docs/std/temporal/) and
 [`std::io`](/silk/docs/std/io/)) that rely on POSIX syscalls or POSIX-like APIs.

This layering allows `std::` to be used in freestanding environments while
still offering a full POSIX-oriented API when available.

## Versioning and Compatibility

The standard library is shipped with the compiler and should be versioned:

- Public, exported APIs under `std::...` should follow semantic versioning.
- A compiler may require a minimum stdlib version, and should report a clear
 error when an incompatible stdlib root is selected.
