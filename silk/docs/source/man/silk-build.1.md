# [`silk-build(1)`](?p=man/silk-build.1) — Build Silk Artifacts

> NOTE: This is the Markdown source for the eventual man 1 page for `silk build`. The roff-formatted manpage should be generated from this content.

## Name

`silk-build` — build an executable, object, static library, shared library, or package-owned manpage from Silk sources and link inputs (or a `silk.toml` package).

## Synopsis

- `silk build [options] <input> [<input> ...] -o <output>`
- `silk build [options] --package <dir|manifest> [--build-module] [--package-target <name> ...]`
- `silk build [options]` (when `./silk.toml` exists, behaves as if `--package .` was provided)
- `silk build install [options] --package <dir|manifest> [--build-module] [--package-target <name> ...]`
- `silk build uninstall [options] --package <dir|manifest> [--build-module]`

## Description

`silk build` compiles a module set and emits an output artifact. You can build:

- explicit inputs (`<input> ...`), or
- a package module set from a manifest (`silk.toml`) using `--package` / `--pkg`.

For package builds, outputs are selected by the manifest `[[target]]` entries.
Matching package and dependency `[[native]]` entries add platform-scoped native
source/link requirements to the selected output. See
[package manifests](?p=compiler/package-manifests).
Manifest `kind = "man"` targets build package-owned manpages from either static
man sources or source-doc queries. Source-doc queries are evaluated against the
root package’s own source modules, not dependency docs in the same manifest
graph.

When explicit input files are used (no `--package`), the `silk` CLI may load additional packages into the module set by resolving unquoted package imports (for example `import util;` or `import util from util;`) from the package search path (`SILK_PACKAGE_PATH`).

Input kinds (by extension):

- `.slk` — Silk source file (part of the module set being compiled).
- `.o` — relocatable object file linked into `--kind executable|shared` outputs (and included in `--kind static` archives).
- `.a` — static archive; its `.o` members are linked like object inputs (or included in a combined `--kind static` output).
- `.so` — shared library; treated as a dynamic dependency (equivalent to `--needed <soname>` using the library’s basename).
- `.c` — C source file; compiled to an object via the native compiler for the active target and then treated like a `.o` input.
- `.m` — Objective-C source file; compiled to an object for the supported Apple host-backed Mach-O targets and then treated like a `.o` input.
- `.h` — header build input:
 - if a sibling `.c` exists next to the header, `silk build` compiles that
 `.c` and links the resulting object,
 - otherwise, if a sibling `.m` exists next to the header, `silk build`
 compiles that Objective-C source and links the resulting object,
 - otherwise it compiles the header itself as a C translation unit and links
 the resulting object.

Package builds: when `--package` is provided, `.slk` inputs must be omitted, but non-`.slk` link inputs (`.c`, `.h`, `.m`, `.o`, `.a`, `.so`) may still be provided.

Package installation:

- `silk build install` builds the selected package target(s) and installs:
 - package-owned artifacts under the canonical package root
 `<prefix>/lib/silk/<package>/...`,
 - package-owned manpages under
 `<prefix>/lib/silk/<package>/share/man/man{1,3,7}/...` and mirrored to
 `<prefix>/share/man/man{1,3,7}/...`,
 - emitted C headers inside that package root and mirrored to
 `<prefix>/include/silk/<package>/`,
 - executables inside that package root and mirrored to `<prefix>/bin`,
 - and, when `[package].definitions` is set, installs those definition files
 plus an installed `silk.toml` under `<prefix>/lib/silk/<package>/` so the
 package is importable via the system package search root (`PREFIX/lib/silk`).
 - when local `[package].readme` / `[package].documentation` landing pages are
 present, the install copies them into
 `<prefix>/lib/silk/<package>/share/silk/docs/readme/...` or
 `<prefix>/lib/silk/<package>/share/silk/docs/documentation/...` and
 rewrites the installed manifest to those packaged paths,
 - when `[package].documentation` points at a static man target source, the
 installed manifest rewrites it to the installed `share/man/...` path so
 `silk man docs` continues to resolve.
 Library targets require `[package].definitions`; executable-only and
 manpage-only packages do not.
 It writes an uninstall receipt at
 `<prefix>/lib/silk/<package>/.silk_install_receipt`.
- `--destdir <path>` stages install/uninstall paths under `<destdir><prefix>/...`
 for system packaging workflows.
- `silk build uninstall` removes files listed in the uninstall receipt (same
 prefix selection rules as install).

Notes:

- `.o`/`.a`/`.c`/`.h` link inputs are supported for `linux-x86_64` / `linux-x86_64-musl` outputs and for `macos-aarch64` / iOS device/simulator executable outputs on Apple Silicon macOS hosts.
- Objective-C `.m` inputs are supported only for `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, and `ios-simulator-x86_64` on Apple Silicon macOS hosts; supported executable outputs that include `.m` inputs link the Objective-C runtime automatically.
- Objective-C `.m` inputs that import Cocoa / AppKit or UIKit also add the
 corresponding Apple framework (`AppKit.framework` or `UIKit.framework`) to
 the host-backed Mach-O executable link; inputs that import Foundation add
 `Foundation.framework`.
- On `macos-aarch64`, reachable Silk `ext` calls whose symbol name starts with
 `silk_appkit_` opt the executable link into `AppKit.framework`; this supports
 native AppKit `.m` providers shipped beside Silk code.
- `.so` inputs only affect executable/shared outputs (static archives cannot record dynamic dependencies).
- on interactive TTY stderr, `silk build` shows a single animated progress line
 while it visits source files, import/package traversal, dependency artifact
 scans, dependency native requirements, vendored external dependency
 auto-linking, and later
 `resolve` / `check` / `codegen` / `link` phases.
- that progress line is transient and is cleared before diagnostics or other
 stderr output; non-interactive output stays concise.
- successful builds report final artifacts as `build: <kind> -> <path>`.
- script-style entrypoints: when building an executable, if the **first** `.slk` input contains top-level statements (after the normal `package`/`module` header and `import` block) and does not define an explicit `main`, `silk build` synthesizes an implicit `fn main() -> int` that executes those statements and then returns `0`.
- for `--kind executable`, `--std-lib` / `--std <path>.a` is currently rejected when linking additional `.c`/`.h`/`.m`/`.o`/`.a` inputs (std sources are compiled into the build instead).
- on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::crypto` / `std::tls` are present in the module set, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol families, `silk build` automatically links the target-matched vendored crypto/TLS archives produced by `zig build deps`.
- on `linux-x86_64` glibc or musl, when `std::sqlite` is present in the module set, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `sqlite3_*` symbols, `silk build` automatically links the target-matched vendored SQLite archive produced by `zig build deps`.
- on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ssh` / `std::ssh2` are present in the module set, or when linked native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference `libssh2_*` symbols, `silk build` automatically links the target-matched vendored libssh2 archive and its vendored crypto dependencies produced by `zig build deps`.
- on `linux-x86_64` glibc, when `std::runtime::z3` is present in the module set or linked native inputs reference `Z3_*` symbols, `silk build` automatically links the vendored glibc Z3 archive; on `linux-x86_64` musl, the same use is accepted only when the build explicitly supplies a musl-built `libz3.a` input or a `libz3` dynamic dependency such as `--needed libz3.so.0`.
- on `linux-x86_64`, when `std::dylib` is present in the module set, or when linked native `.o` / `.a` inputs reference bundled `silk_rt_dylib_*` runtime symbols, `silk build` automatically adds the libc component that provides `dlopen` (`libdl.so.2` on glibc, `libc.so` on musl).
- on supported hosted target layouts (`linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`), when `std::ggml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_ggml_init`), `silk build` automatically links the vendored ggml archives produced by `zig build deps`; on Linux it also adds `libstdc++.so.6`, `libgcc_s.so.1`, and the target libc math/dynamic-loader providers, while on Apple Silicon macOS hosts it adds `-lc++` to the native link (see [ggml](?p=std/ggml)).
- on `linux-x86_64` glibc or musl, when `std::image::png` / `std::image::jpeg` are present in the module set (or when linked `.o`/`.a` inputs reference the shim symbols), `silk build` automatically links the target-matched vendored image archives produced by `zig build deps` (see [image](?p=std/image)).
- on `linux-x86_64` glibc or musl, when `std::xml` is present in the module set (or when linked `.o`/`.a` inputs reference `silk_xml_node_name_ptr`), `silk build` automatically links the target-matched vendored libxml2 archives produced by `zig build deps` (see [xml](?p=std/xml)).
- on `linux-x86_64`, when `std::window` reaches the bundled runtime, `silk build` adds the dynamic-loader API provider used by the runtime-loaded GTK provider (`libdl.so.2` on glibc targets, `libc.so` on musl targets). GTK itself is loaded at runtime and is not recorded as a required `DT_NEEDED` entry.

## Options

`silk build -h` groups the live terminal help into:

- General
- Stdlib and verification
- Output and target selection
- Link inputs and dynamic linking
- Package builds
- Install and uninstall

### General

- `--help`, `-h` — show command help and exit.
- `--feature <spec>`, `-f <spec>` — enable a build feature for `attr(feature="...")` queries and declaration gating. Repeatable.
 - Spec forms: `NAME` or `NAME=VALUE` (see [attributes](?p=language/attributes)).
 - For package builds, you may target a specific package with `PKG/NAME` or
 `PKG/NAME=VALUE` (for example `ui/tui` or `ui/tui=false`).
- `--debug`, `-g` — enable debug build mode (also enables extra Formal Silk debug output when verification fails).
- `-O <0-3>` — set optimization level (default: `-O2`; when `--debug` is set and `-O` is omitted, defaults to `-O0`). `-O1`+ prunes unused extern symbols before code generation and prunes unreachable functions in executable builds (typically reducing output size).
- `--noheap` — reject heap allocation in the supported subset (see [memory model](?p=language/memory-model) and [cli silk](?p=compiler/cli-silk)).
- `--strip-unused` — force reachability-based pruning even at `-O0`.
 - For executable outputs, this enables the same unreachable-function pruning normally tied to `-O1`+.
 - For static/shared outputs, it prunes unreachable non-exported helper functions from the root exported surface before emission.
 - Object outputs already prune unreachable non-exported helpers; the flag is accepted for consistency.
 - When executable builds auto-load std modules, `--strip-unused` cannot be combined with `--std-lib` / `--std <path>.a`.

### Stdlib and verification

- `--nostd`, `-nostd` — disable stdlib auto-loading for `import std::...;`.
- `--std-root <path>` — override the stdlib root directory used to resolve `import std::...;`.
- `--std-lib <path>` — select a stdlib archive path for linking hosted builds.
- `--std <path>` — alias of `--std-root` when `<path>` does not end in `.a`.
- `--std <path>.a` — alias of `--std-lib`.
- `--z3-lib <path>` — override the Z3 dynamic library used for Formal Silk verification (also honors `SILK_Z3_LIB`).
- `-Wz <spec>`, `-Wz,<spec>` — pass a Z3 parameter spec to Formal Silk verification. Repeatable; order is preserved.
 - `NAME=VALUE` applies `Z3_set_param_value(config, NAME, VALUE)` to every verifier config before `Z3_mk_context_rc`.
 - `config:NAME=VALUE` is the explicit form of the default config scope.
 - `global:NAME=VALUE` applies `Z3_global_param_set(NAME, VALUE)` once before any verifier context is created.
 - `NAME` and `VALUE` must both be non-empty after surrounding whitespace is trimmed.
 - Silk does not whitelist Z3 parameter names. Any non-empty name/value pair accepted by Z3 for `Z3_set_param_value` or `Z3_global_param_set` may be provided; invalid names or values are reported by Z3 according to that library’s behavior.
 - Repeating the same parameter is allowed. The resulting behavior is the Z3 API behavior for repeated parameter writes in the order provided.

### Output and target selection

- `-o <path>`, `--out <path>` — output path. If parent directories do not exist, `silk` creates them.
- `--kind executable|object|static|shared` — output kind.
- `--emit bin|asm` — emission mode:
 - `bin` (default) emits the selected binary artifact at `-o` / `--out`,
 - `asm` writes an `objdump`-style disassembly (Intel syntax) of the selected output on `linux-x86_64` and writes it to `-o` / `--out`.
- `-S` — alias of `--emit asm` (defaults to `--kind object` when `--kind` is not set).
- `--list-targets` — list the recognized `--target` triples, current-host
 output kinds, current-host const-main-only notes, and Apple Silicon macOS
 host-backed notes for targets with that extra support, then exit.
- `--list-archs` — list the recognized `--arch` values and exit.
- `--arch <arch>` — shorthand target selector (mutually exclusive with `--target`). Accepted values:
 - `x86_64` / `amd64` → `linux-x86_64` (default)
 - `aarch64` / `arm64` → `linux-aarch64`
 - `wasm32` → `wasm32-unknown-unknown`
 - `wasm32-wasi` → `wasm32-wasi`
 - `--target <triple>` — target triple (mutually exclusive with `--arch`).
 - executable code generation backends exist for:
 - `linux-x86_64` (IR-backed subset + const-main fallback)
 - `linux-x86_64-musl` (same IR-backed subset with musl loader/libc defaults)
 - `linux-aarch64` and `linux-aarch64-musl` (const-main subset only)
 - `android-aarch64` (const-main subset only)
 - `macos-x86_64` (const-main subset only)
 - `macos-aarch64` (const-main subset everywhere; on Apple Silicon macOS
 hosts also supports a temporary non-const scalar IR subset
 via host `clang -c` / `ld`, including bundled runtime-backed
 executables linked from extracted `libsilk_rt*.a` object members, plus
 Mach-O relocatable object output for `--kind object`; that
 host-supported subset is reflected by the target metadata instead of
 being labeled const-main-only on those hosts; `--kind static` and
 `--kind shared` remain Linux x86_64-only today)
 - `ios-aarch64` (const-main subset everywhere; on Apple Silicon macOS
 hosts also supports the same temporary non-const pure-Silk scalar IR
 subset via host `clang -c` / `ld`, including reachable float-to-int
 lowering via target-correct helper objects compiled from
 `src/silk_rt_f128.c`, plus portable bundled runtime helper families
 compiled on demand for the requested iOS SDK target, plus mixed/native
 `.c` / `.h` / `.m` / `.o` / `.a` executable link-input support, plus hosted
 async / task runtime linkage via the embedded `silk_rt_async.c` path;
 when reachable code uses `std::window`, `silk build` also materializes
 an adjacent `<output>.app` bundle with `Info.plist`, `PkgInfo`, and the
 executable automatically)
 - `ios-simulator-aarch64` (same current support envelope as `ios-aarch64`)
 - `ios-simulator-x86_64` (same current support envelope as
 `ios-aarch64` on Apple Silicon macOS hosts; const-main subset
 elsewhere)
 - `windows-x86_64` (const-main subset only)
 - `windows-aarch64` (const-main subset only)
 - `wasm32-unknown-unknown` (IR-backed subset + const-main fallback)
 - `wasm32-wasi` (IR-backed subset + const-main fallback)
 - const-main stub outputs require `main` to reduce to a constant integer value (supports `fn main () -> int` and the standard `fn main(argc: int, argv: u64) -> int` form when arguments are unused).
 - target metadata and `attr(...)` gating are available for all recognized targets (including the const-main-only targets listed above).
- `--c-header <path>` — write a C header declaring exported symbols (valid only for `--kind object|static|shared`).

### Link inputs and dynamic linking

- `--cflag <arg>` — add a native compiler argument used when compiling `.c`, `.h`, and `.m` inputs (repeatable).
- `-I <path>`, `-I<path>` — add a native include search path for `.c`, `.h`, and `.m` compilation (repeatable). This is the preferred spelling for include paths over a generic `--cflag -I...` entry.
- `-isystem <path>`, `-isystem<path>` — add a native system include search path for `.c`, `.h`, and `.m` compilation (repeatable).
- `--ldflag <arg>` — add a backend linker argument (repeatable). Prefer the dedicated `-l` and `-Wl` flags for command-line builds. Recognized `--ldflag` arguments follow the same backend rules as those dedicated flags, including the internal ELF translations for `-Wl,-rpath`, `-Wl,-soname`, and `-Wl,--dynamic-linker`.
- `-L <path>`, `-L<path>` — add a library search path for supported link backends (repeatable).
 - On host-backed Apple Mach-O executable links, this is passed to the Apple linker.
 - On `linux-x86_64`, this is used to resolve `-l` / `-l:` names. A found `.so` is recorded as a `DT_NEEDED` dependency by basename; a found `.a` is linked as a static archive.
- `-l <name>`, `-lname` — link with a library name. Repeatable.
 - On host-backed Apple Mach-O executable links, this is passed to the Apple linker as `-l<name>`.
 - On `linux-x86_64`, `-L` paths are searched first. If no matching library is found, the internal ELF backend translates the name to a `DT_NEEDED` soname (`-lm` becomes `libm.so.6` on glibc targets and `libc.so` on musl targets).
- `-Wl <arg>`, `-Wl,<arg>` — add a backend linker argument. Repeatable.
 - On backends that invoke a platform linker, comma-separated payloads are split and passed directly in order.
 - On `linux/x86_64`, supported `-Wl` payloads are translated into owned ELF effects: `-rpath`, `-soname`, and `--dynamic-linker`.
 - Unsupported `-Wl` payloads are rejected on backends that cannot represent them directly.
- `--needed <soname>` — add a `DT_NEEDED` entry (repeatable).
- `--runpath <path>` — add a `DT_RUNPATH` entry (repeatable).
- `--rpath <path>` — alias of `--runpath`.
- `--soname <soname>` — set `DT_SONAME` (shared only).
- `--elf-interp <path>` — override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` executable outputs (overrides `SILK_ELF_INTERP`). Generic `linux-x86_64` probes the host loader and falls back to `/lib64/ld-linux-x86-64.so.2` when cross-compiling; `linux-x86_64-musl` defaults to `/lib/ld-musl-x86_64.so.1` and rejects glibc loader paths. Rejected for non-`linux/x86_64` targets.

### Apple SDK linking

These flags are shown in `silk build --help` only on Apple Silicon macOS compiler hosts. They are supported for host-backed `macos-aarch64`, `ios-aarch64`, `ios-simulator-aarch64`, and `ios-simulator-x86_64` executable targets.

- `--framework <name>` — link an Apple framework by name. Repeatable.
- `-F <path>`, `-F<path>` — add an Apple framework search path. Repeatable.

### Package builds

- `--package <dir|manifest>`, `--pkg <dir|manifest>` — load the module set from a `silk.toml` manifest instead of explicit input files.
- `--build-module` — compile and run the package build module and use the manifest it emits as the package manifest.
 - when a build module is executed and no explicit path override is provided, the compiler looks for `<package_root>/build.slk` (or uses `[build].build_module_path` from `silk.toml` when set).
 - the build module is invoked with `argv[1] = <package_root>` and `argv[2] = <action>` where `<action>` is `build`, `install`, or `uninstall`.
- build modules are opt-in by default; to run one for `silk build --package` without passing `--build-module`, set `[build].build_module = true` in `silk.toml`.
- `--build-module-path <path>` — override the build module path.
 - if `<path>` is relative, it is resolved relative to `<package_root>`.
- Legacy aliases (accepted for compatibility): `--build-script` and `--build-script-path`.
- `--package-target <name>` — select one or more manifest `[[target]]` entries by name (repeatable; `--pkg-target` is accepted as an alias).
 - when omitted, `silk build --package ...` builds every manifest `[[target]]` entry by default.
 - matching root-package and imported dependency `[[native]]` entries are
 merged into the selected target’s native inputs, compiler flags, linker
 flags, `needed`, and `runpath`.
 - when building multiple targets, per-output flags are rejected (`-o/--out`, `--kind`, `--emit`, `--arch`, `--target`, `--c-header`, `--cflag`, `-I`, `-isystem`, `--ldflag`, `-l`, `-L`, `--framework`, `-F`, `-Wl`, `--needed`, `--runpath`, `--soname`, `--elf-interp`).
 - build features may be enabled via `[build].features` in `silk.toml` (and may be overridden by `--feature` / `-f`).

### Install and uninstall

- `-p <path>`, `--prefix <path>` — install/uninstall prefix (default: `$PREFIX` when set, otherwise `/usr/local`).
- `--destdir <path>` — stage install/uninstall paths under `<destdir><prefix>/...`.

Argument parsing:

- `--` — end of options; treat following args as file paths (even if they begin with `-`).

## Examples

```sh
# Build an executable from a single file.
silk build src/main.slk -o build/app

# Build an object file (and emit a C header for exported symbols).
silk build src/lib.slk --kind object -o build/lib.o --c-header build/lib.h

# Emit an assembly listing (objdump-style disassembly) for an object build.
silk build src/main.slk -S -O2 -o build/main.s

# Link an extra C object into a Silk executable.
cc -std=c99 -c -o build/extra.o src/extra.c
silk build src/main.slk build/extra.o -o build/app

# Enable build features used by attr(feature="...") gates.
silk build src/main.slk -f debug-ui --feature telemetry=false -o build/app

# Link a dynamic library by name and provide an ELF runpath.
silk build src/main.slk -l sqlite3 -Wl,-rpath,'$ORIGIN/lib' -o build/app

# Compile a native helper with explicit include paths, then link a local
# dynamic library found via -L.
silk build src/main.slk native/helper.c \
  -I include \
  -isystem vendor/include \
  -L build/lib \
  -l helper \
  -Wl,-rpath,'$ORIGIN/lib' \
  -o build/app

# Build a macOS AppKit executable from Silk plus an Objective-C provider.
silk build src/app.slk src/appkit_provider.m \
  --target macos-aarch64 \
  --framework AppKit \
  -F /System/Library/Frameworks \
  -o build/MacApp

# Build a macOS Metal executable with explicit framework and linker flags.
silk build examples/std_macos_metal_window.slk \
  --target macos-aarch64 \
  --framework Metal \
  --framework QuartzCore \
  -Wl,-rpath,@executable_path/Frameworks \
  -o build/metal-window

# Link against a Homebrew or SDK library on the host-backed Apple linker.
silk build src/main.slk native.o \
  --target macos-aarch64 \
  -L /opt/homebrew/lib \
  -l sqlite3 \
  -o build/app

# Tune Formal Silk verification with Z3 config and global parameters.
silk build verified/main.slk \
  -Wz timeout=5000 \
  -Wz config:model=true \
  -Wz global:smt.random_seed=7 \
  -o build/verified-app

# Build the current directory as a package (when ./silk.toml exists).
silk build

# Build a specific target from a manifest.
silk build --package . --package-target app

# Install the current package to /usr/local.
silk build install

# Install to a custom prefix.
silk build install -p /tmp/silk-prefix

# Uninstall from a custom prefix.
silk build uninstall -p /tmp/silk-prefix
```

## Environment

- `PREFIX` — installation prefix used by `silk build install` / `silk build uninstall` when `-p/--prefix` is not provided (default: `/usr/local`).
- `SILK_PACKAGE_PATH` — PATH-like list of package root directories used to resolve bare-specifier package imports and pathless manifest dependencies (entries separated by `:` on POSIX). During package graph work, relative entries are resolved from the importing package root and then upward to the graph root. The compiler appends a system library root at `PREFIX/lib/silk` as the last search path entry when it exists; dotted dependency keys such as `my.dep.b` map to slash directories such as `my/dep/b`.
- `SILK_ELF_INTERP` — override the ELF `PT_INTERP` dynamic loader path used for `linux-x86_64` outputs when emitting dynamically-linked executables/shared libraries. The explicit `linux-x86_64-musl` target still requires a musl loader path.
- `SILK_Z3_LIB` — path to a dynamic Z3 library used by the Formal Silk verifier.
- `SILK_VERIFY_JOBS` — override the number of worker threads used for Formal Silk verification (default: auto; capped at 8).
- `SILK_CC` — host C compiler used by `silk cc` and by host C fallback compilation for `.c`/`.h` inputs passed to `silk build`; Apple `.m` inputs use the target SDK clang path.

## Exit status

- `0` on success.
- non-zero on error.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-check(1)`](?p=man/silk-check.1), [`silk-test(1)`](?p=man/silk-test.1)
- [cli silk](?p=compiler/cli-silk)
- [package manifests](?p=compiler/package-manifests)
