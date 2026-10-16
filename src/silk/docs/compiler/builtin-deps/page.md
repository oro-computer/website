---
layout: "docs"
description: "Silk aims to be buildable with minimal reliance on system-installed dependencies. Zig itself is an external host build prerequisite: a compatible zig executable must be available on PATH, and no Zig t"
docsCollection: "silk"
section: "compiler"
order: 262
sourcePath: "compiler/builtin-deps.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Built-In Dependencies

Silk aims to be buildable with minimal reliance on system-installed
dependencies. Zig itself is an external host build prerequisite: a compatible
`zig` executable must be available on `PATH`, and no Zig toolchain binary or
archive is distributed in the Silk source tree. For the hosted POSIX baseline,
Silk ships built-in dependency sources and pinned archives for the libraries it
links into generated artifacts:

- libsodium (`jedisct1/libsodium`) at tag `1.0.20-RELEASE`
- mbedTLS (`Mbed-TLS/mbedtls`) at tag `mbedtls-4.0.0`
- libssh2 (`libssh2/libssh2`) at tag `libssh2-1.11.1`
- SQLite amalgamation at version `3510200` (downloaded from sqlite.org for
 Linux guide tooling; Apple Silicon core builds can use the system SQLite
 library when the bundled source is absent)
- ggml (`ggml-org/ggml`) at tag `v0.9.5`
- libpng (`pnggroup/libpng`) at tag `v1.6.54`
- libjpeg-turbo (`libjpeg-turbo/libjpeg-turbo`) at tag `3.1.3`
- libxml2 (`GNOME/libxml2`) at `v2.15.1`, dependency revision `2.15.1+silk.2`
- Z3 SMT solver at version `4.15.4.0` (headers and the `linux/x86_64` static
 archive are shipped; Linux AArch64 uses a native dynamic provider unless a
 target-matched static archive is supplied)

When fetching is enabled, these dependencies are fetched as shallow clones
(`--depth 1`) or downloaded archives and built as static libraries for the
supported native host layouts:

- `linux/x86_64` -> [`vendor/lib/x64-linux/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/x64-linux/)
- `linux/aarch64` -> [`vendor/lib/aarch64-linux/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/aarch64-linux/)
- `macos/aarch64` -> [`vendor/lib/aarch64-macos/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/aarch64-macos/)

Linux AArch64 uses the released system Zig 0.16.0 toolchain and supports the
complete native compiler, C99 ABI archive, bundled runtime archives, prebuilt
stdlib archive, hosted executable workflows, and the same built-in hosted C
dependency stack as Linux x86_64. `make deps` builds those archives natively
under [`vendor/lib/aarch64-linux/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/aarch64-linux/); `DEPS_TARGET=linux-aarch64-musl` uses
[`vendor/lib/aarch64-linux-musl/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/aarch64-linux-musl/). Formal Silk builds can use a native dynamic Z3
provider through `--z3-lib <path>` or `SILK_Z3_LIB=/path/to/libz3.so`; when a
target-matched `libz3.a` is supplied in the built-in layout, it is staged and
linked like the x86_64 archive.

Fresh Apple Silicon checkouts do not require [`vendor/lib/aarch64-macos/libz3.a`](https://github.com/oro-computer/silk/blob/master/vendor/lib/aarch64-macos/libz3.a)
for the core compiler or `libsilk.a` build. When that archive is absent, the
static Z3 verifier path is disabled and users can still enable verification with
`--z3-lib <path>` or `SILK_Z3_LIB=/path/to/libz3.dylib`. Full Apple Silicon
staging through `make build` and `make dist` compiles stdlib sources with
contract verification, so it requires a working dynamic Z3 provider when no
native static archive is linked. Install Z3 with Homebrew
and export `SILK_Z3_LIB="$(brew --prefix z3)/lib/libz3.dylib"`; Linux AArch64
can use the native distribution `libz3-dev` package.

Note: the deps workflow builds libssh2 with the mbedTLS backend. This keeps the
hosted baseline self-contained (no system OpenSSL headers/libraries required),
and allows `silk build` to link [`std::ssh`](/silk/docs/std/ssh/) / [`std::ssh2`](/silk/docs/std/ssh2/) without adding
`DT_NEEDED` entries for `libssh2.so.*`.

The deps workflow builds ggml's CPU backend on every supported hosted target
and accepts `-Dggml-gpu=auto|cpu|metal|cuda|hip|vulkan`. The default is `auto`:

- native `macos/aarch64` selects Metal,
- native glibc `linux/x86_64` selects the first installed CUDA, HIP, or Vulkan
 build toolchain in that order,
- native glibc `linux/aarch64` selects CUDA when the CUDA toolkit and its SBSA
 provider libraries are installed,
- musl, cross-target, or toolchain-free builds retain the CPU baseline.

The CPU archive disables `GGML_NATIVE` and optional x86 instruction extensions
including SSE4.2, AVX, AVX2, AVX512, FMA, F16C, and BMI2. It must remain usable
after restoring a dependency cache or installing a release on a different CPU
of the same target architecture. This favors portability over host-specific
CPU vectorization; accelerator selection remains independent. Rebuild older
host-tuned archives through the dependency workflow when adopting this policy.
CI dependency cache keys include [`build.zig`](https://github.com/oro-computer/silk/blob/master/build.zig) and therefore invalidate those
older outputs automatically.

`cpu` disables accelerator compilation explicitly. An explicit GPU backend is
strict: an incompatible target or missing compiler, SDK, headers, shader
compiler, or provider library fails `zig build deps` with a prerequisite
diagnostic instead of silently staging a CPU-only build. CUDA requires the CUDA
toolkit and `nvcc`; HIP requires ROCm/HIP 6.1 or newer; Vulkan requires its SDK,
loader development files, and `glslc`; Metal requires an Apple Silicon macOS
host and the Xcode command-line SDK.

Exactly one configured GPU backend is built alongside `libggml-cpu.a`. The
workflow writes `ggml-backend.manifest` in the target archive directory. That
manifest identifies the active backend archive and its provider libraries,
runtime search directories, or Apple frameworks/runtime. `silk build` consumes the
manifest whenever it auto-links ggml, so executables and shared libraries get
the same registered backend as dependency/package graphs and downstream
native inputs. Static-library output retains its ggml shim references; a later
Silk final link detects those references, consumes the manifest, and supplies
the ggml/backend archives and recorded platform runtime. On Linux AArch64, the
final link also supplies the target `libgcc.a` for GCC's outlined atomic
helpers. On glibc, it supplies `libc_nonshared.a` when the static backend needs
wrappers such as `atexit` that glibc does not export from `libc.so.6`. The
Silk-owned AArch64 linker provides the per-image `__dso_handle` address used by
C++ constructor/destructor registration and executes the selected constructor
arrays before Silk's process entry point. Missing or inaccessible hardware
remains a recoverable `DeviceUnavailable` result at runtime.

A manifest-free archive directory is accepted only as the historical CPU-only
layout containing the core, base, CPU, and shim archives. If any supported
accelerator archive (`libggml-metal.a`, `libggml-cuda.a`, `libggml-hip.a`, or
`libggml-vulkan.a`) is present, `ggml-backend.manifest` is mandatory. The
compiler rejects that incomplete staging instead of omitting the accelerator
and its provider requirements. Regenerate the dependency staging with the
intended `-Dggml-gpu=...` mode to repair it.

## Build

From the repo root:

```sh
make deps
```

The equivalent explicit ggml configurations are:

```sh
zig build deps -Dggml-gpu=auto
zig build deps -Dggml-gpu=cpu
zig build deps -Dggml-gpu=metal
zig build deps -Dggml-gpu=cuda
zig build deps -Dggml-gpu=hip
zig build deps -Dggml-gpu=vulkan
```

Use an explicit mode for release/CI environments that must prove a particular
backend was compiled. `auto` is intended for native contributor builds and
prints the selected backend or the reason it retained CPU.
`-Dggml-gpu-architectures=<cmake-list>` optionally forwards an explicit
`CMAKE_CUDA_ARCHITECTURES` or `CMAKE_HIP_ARCHITECTURES` list for reproducible
toolkit/container builds that cannot query the deployment GPU.

CUDA discovery is target-aware. Linux x86_64 accepts the toolkit's
`targets/x86_64-linux/lib` provider layout, while Linux AArch64 accepts
`targets/sbsa-linux/lib` and `targets/aarch64-linux/lib`; both retain the
toolkit `lib64` fallback and target system-library fallback. NVIDIA GB10 builds
should select the exact architecture and prove the physical runtime after
staging:

```sh
zig build deps -Dggml-gpu=cuda -Dggml-gpu-architectures=121
make build
SILK_GGML_NVIDIA_REQUIRE=1 make std-ggml-nvidia-check
```

The required gate rejects CPU-only or incomplete staging and treats status
`77` as an inaccessible CUDA backend/device rather than a successful portable
fallback. The maintained JEPA/LoRA fixture then verifies accelerator compute,
checkpoint/resume, AdamW state, and complete CPU parity.

HIP discovery accepts ROCm packages and provider libraries installed under
either `<ROCM_PATH>/lib` or `<ROCM_PATH>/lib64`. The generated backend manifest
records the exact directory containing `libamdhip64`, `libhipblas`, and
`librocblas`; that same absolute directory becomes the final artifact's
RUNPATH. A split or incomplete provider layout is rejected during dependency
configuration instead of producing an artifact that cannot register its
backend at runtime.

On `linux/x86_64`, `linux/aarch64`, and `macos/aarch64`, this runs the built-in
hosted-dependency build for the native host archive layout and enables
dependency fetching for missing built-in sources automatically. On a fresh
checkout, `make deps`
therefore populates [`vendor/deps/`](https://github.com/oro-computer/silk/tree/master/vendor/deps/) and builds the host archives directly.
The mbedTLS generator-side Python dependency (`jinja2`) is also bootstrapped
under [`vendor/build/pythondeps/`](https://github.com/oro-computer/silk/tree/master/vendor/build/pythondeps/) when the host Python environment does not
already provide it. On Python installations that disallow direct package
installation into the managed interpreter, the deps workflow creates an
isolated helper environment under [`vendor/build/pythondeps-venv/`](https://github.com/oro-computer/silk/tree/master/vendor/build/pythondeps-venv/) and installs
the package into the repo-local target directory from there.

Fast CI test lanes may run:

```sh
make sqlite-deps-if-needed
```

This only populates the pinned SQLite amalgamation source required by the guide
database builder. It does not build the full hosted dependency archive stack.
If the network or Python certificate store cannot reach sqlite.org, place
`sqlite-amalgamation-3510200.zip` at
[`vendor/build/sqlite-amalgamation-3510200.zip`](https://github.com/oro-computer/silk/blob/master/vendor/build/sqlite-amalgamation-3510200.zip) or set
`SILK_SQLITE_AMALGAMATION_ZIP=/path/to/sqlite-amalgamation-3510200.zip`.

Fast macOS compiler-only installs can still link the system `sqlite3` library
when the amalgamation is absent. The full `make build` staged-prefix path now
populates the hosted dependency outputs on supported native hosts when they are
missing.

Or directly:

```sh
zig build deps
```

By default, `zig build deps` does **not** use the network (no `git fetch`,
no `git clone`, no downloads). It assumes the dependency sources already exist
under [`vendor/deps/`](https://github.com/oro-computer/silk/tree/master/vendor/deps/).

To allow `zig build deps` to fetch missing sources from the network, run:

```sh
zig build deps -Dfetch-deps=true
```

This populates:

- [`vendor/deps/`](https://github.com/oro-computer/silk/tree/master/vendor/deps/) — git checkouts of the pinned tags
- [`vendor/build/`](https://github.com/oro-computer/silk/tree/master/vendor/build/) — build directories (`libsodium` via autotools; `mbedTLS` via CMake)
- [`vendor/lib/<host-layout>/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/<host-layout>/) — built static archives for the active supported host:
 - `libsodium.a`
 - `libmbedtls.a`
 - `libmbedx509.a`
 - `libmbedcrypto.a`
 - `libssh2.a`
 - `libsqlite3.a`
 - `libggml.a`
 - `libggml-base.a`
 - `libggml-cpu.a`
 - one of `libggml-metal.a`, `libggml-cuda.a`, `libggml-hip.a`, or
 `libggml-vulkan.a` when selected
 - `ggml-backend.manifest` (active backend and final-link requirements)
 - `libsilk_ggml_shims.a` (ABI-safe Silk wrappers for context ownership,
 checked tensor operations, by-value ggml APIs, and device execution)
 - `libpng16.a`
 - `libsilk_png_shims.a` (ABI-safe Silk wrappers for libpng)
 - `libturbojpeg.a`
 - `libjpeg.a`
 - `libsilk_jpeg_shims.a` (ABI-safe Silk wrappers for libjpeg-turbo)
 - `libxml2.a`
 - `libsilk_xml_shims.a` (ABI-safe Silk wrappers for libxml2 struct access)
 - `libz3.a` (Z3 `4.15.4.0`; pinned in [`vendor/lib/x64-linux/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/x64-linux/); optional in
 [`vendor/lib/aarch64-macos/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/aarch64-macos/) until the native archive workflow is tracked)

Repository builds also stage these target-matched archives under
`build/lib/silk/vendor/lib/<host-layout>/`. When the compiler is invoked through
its Zig or C API from a source checkout, built-in dependency discovery checks
the canonical [`vendor/lib/<host-layout>/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/<host-layout>/) tree first and this generated staging
tree second. This keeps in-process compiler use aligned with `build/bin/silk`,
whose executable-relative lookup reaches the same staged archives.

These directories and generated `.a` files are ignored by git, except for:

- the shipped pinned Z3 archive: [`vendor/lib/x64-linux/libz3.a`](https://github.com/oro-computer/silk/blob/master/vendor/lib/x64-linux/libz3.a)
- the shipped pinned Z3 headers: [`vendor/include/z3*.h`](https://github.com/oro-computer/silk/blob/master/vendor/include/z3*.h) and [`vendor/include/z3++.h`](https://github.com/oro-computer/silk/blob/master/vendor/include/z3++.h)

Linux AArch64 follows the same external-toolchain contract as every supported
host: Zig 0.16.0 is installed separately and resolved from `PATH`.

To populate and stage the hosted C dependency stack from a clean checkout
(including archives used by `std::xml`, `std::image`, and other modules that
depend on built-in C libraries), run:

```sh
make build
```

`make build` invokes `make deps` when required hosted dependency outputs are
missing. Run `make deps` directly when you want to refresh those generated
archives without rebuilding the staged compiler prefix.

To remove the generated hosted-deps build outputs for the active supported host
without deleting the fetched source trees under [`vendor/deps/`](https://github.com/oro-computer/silk/tree/master/vendor/deps/), run:

```sh
make deps-clean
```

## Staging and Installed Layout

For distribution and `make install`, the hosted toolchain expects built-in
archives and headers under the compiler prefix:

- staged (repo build prefix): `build/lib/silk/vendor/lib/<host-layout>/`
- staged headers: `build/include/silk/`
- installed: `<prefix>/lib/silk/vendor/lib/<host-layout>/`
- installed headers: `<prefix>/include/silk/` (typically
 `/usr/local/include/silk/`)

`zig build install --prefix <dir>` installs headers from [`vendor/include/`](https://github.com/oro-computer/silk/tree/master/vendor/include/)
directly into `<dir>/include/silk/` whenever the built-in include tree is
present. `make build` also mirrors those headers into `build/include/silk/`
while staging `.a` files under `build/lib/silk/vendor/lib/<host-layout>/`. On
`linux/x86_64`, `linux/aarch64`, and `macos/aarch64`, `make build` runs
`make deps` first when required dependency outputs are missing.
`make install` copies the staged prefix into `<prefix>/`.

Raw built-in headers keep their upstream include spelling under the canonical
Silk namespace. For example:

- [`vendor/include/mbedtls/error.h`](https://github.com/oro-computer/silk/blob/master/vendor/include/mbedtls/error.h) stages as `build/include/silk/mbedtls/error.h`
- [`vendor/include/psa/crypto.h`](https://github.com/oro-computer/silk/blob/master/vendor/include/psa/crypto.h) stages as `build/include/silk/psa/crypto.h`

Downstream code that includes headers such as `<mbedtls/error.h>` therefore
needs the canonical built-in header root on the search path:

```sh
-I<prefix>/include/silk
```

## Bundling Into `libsilk.a`

When the built-in archives are present, the Zig build can bundle them into
`libsilk.a` so C embedders do not have to link libsodium/mbedTLS separately.

To require that the built-in archives are present (and fail the build if they
are missing), pass:

```sh
zig build -Drequire-builtin-crypto=true
```

## Security Providers

Silk distinguishes the public [`std::crypto`](/silk/docs/std/crypto/) / [`std::tls`](/silk/docs/std/tls/) API from the provider
used to satisfy it at link time:

- `builtin` uses the toolchain-built static archives from this document
 (`libsodium.a`, the mbedTLS archives, and `libssh2.a`).
- `platform` is available on Apple targets and strictly uses Apple platform
 frameworks for the primitives wired through the standard library.
- `auto` selects platform-backed APIs first on Apple targets and falls back to
 built-in archives for std APIs that do not yet have an Apple platform mapping;
 it selects `builtin` elsewhere.

`silk build`, `silk check`, and `silk test` accept
`--security-provider <auto|platform|builtin>`. When the flag is omitted,
`SILK_SECURITY_PROVIDER` wins over `[build] security_provider` in `silk.toml`;
if neither is present, `auto` is used.

On Apple targets, `auto` and `platform` route [`std::crypto`](/silk/docs/std/crypto/)
initialization, hardened memory operations, constant-time equality, and
[`std::crypto::random`](/silk/docs/std/crypto-random/) through the Apple Security-backed bundled runtime helper
and link `Security.framework`. [`std::net`](/silk/docs/std/net/) provider builds link
`Network.framework` while the Network-backed TCP/UDP implementation is being
completed. In `auto` mode, [`std::tls`](/silk/docs/std/tls/), [`std::ssh`](/silk/docs/std/ssh/) / [`std::ssh2`](/silk/docs/std/ssh2/), native inputs
that reference libsodium or mbedTLS symbols, and advanced [`std::crypto::*`](/silk/docs/std/crypto/)
modules beyond [`std::crypto::random`](/silk/docs/std/crypto-random/) fall back to the built-in archives.
Explicit `platform` builds reject those fallback-only APIs until platform
mappings are implemented.

## Notes

- Zig 0.16.0 or newer must be installed on the build host and available through
 `PATH`; the Silk compiler repository does not provide a Zig bootstrap archive.
- Built-in hosted C dependencies build for the native supported host layouts
 `linux/x86_64`, `linux/aarch64`, and `macos/aarch64`; Linux musl cross-builds
 use the matching architecture-specific `*-linux-musl` layout.
- Linux AArch64 stages the compiler, C99 ABI archive, bundled runtimes,
 precompiled stdlib, and target-native built-in C dependency archives. Native
 CI inspects every staged archive member and rejects empty or non-AArch64
 archives.
- The current `macos/aarch64` host build now succeeds for the compiler/tooling
 payload, staged hosted dependency archives, prebuilt stdlib archive, and real
 hosted async/task runtime archives on Apple Silicon.
- The hosted async/task surface still remains Linux-first in full behavior:
 `macos-aarch64` now supports the native const-main executable subset, a
 temporary Apple Silicon host-assembled non-const scalar subset, and
 host-backed Mach-O object/static/shared library outputs. The longer-term
 macOS backend gap is replacing the temporary host assembler/linker path with
 fully Silk-owned non-const Mach-O code generation.
- [`std::crypto`](/silk/docs/std/crypto/), [`std::tls`](/silk/docs/std/tls/), and [`std::ssh`](/silk/docs/std/ssh/) / [`std::ssh2`](/silk/docs/std/ssh2/) use the built-in
 static archives produced by `zig build deps` when the active security
 provider is `builtin`, and those archives are also auto-linked when native
 `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium, mbedTLS,
 or libssh2 symbol families.
- [`std::sqlite`](/silk/docs/std/sqlite/) likewise auto-links its built-in archive when imported from
 Silk code or when native `.c` / `.h` / `.m` / `.o` / `.a` inputs reference
 `sqlite3_*` symbols on the supported native-host baseline.
- `mbedTLS` uses git submodules (`framework`, `tf-psa-crypto`); `zig build deps` initializes them automatically.
- `zig build deps` configures `mbedTLS` with `ENABLE_TESTING=OFF` and `ENABLE_PROGRAMS=OFF` (we only need the static libraries).
- The `deps` step requires `git`, `cmake`, `perl`, and a working C build toolchain (`make` + a C compiler).
- `zig build deps` builds libssh2 against the built-in mbedTLS archives (no
 OpenSSL requirement in the hosted baseline).
- libpng requires zlib at link/runtime (typically `libz.so.1`).
- libxml2 is configured without iconv/zlib/modules/threads in the default deps workflow; it still requires libm at link/runtime (typically `libm.so.6`).
- `mbedTLS`/TF-PSA-Crypto generation requires `python3` with `jinja2` available; `jsonschema` is optional (validation is skipped when it is missing).

## Corrected libxml2 dependency (SG-32)

Revision `2.15.1+silk.2` pins upstream commit
`b7fa62cbe8ef0df5869e000d5b690bdedd07f33e` and propagates the resource
loader and caller context into nested schema parser contexts. Upstream 2.15.4
and master still lack this correction at the September 13 review.
`scripts/build-libxml2.py` exports that immutable tree from the read-only
checkout (or fetches it into a separate bare cache with `-Dfetch-deps=true`).
It applies the versioned correction only to a generated source snapshot.
No vendored checkout, archive, or header is modified.

`zig build deps-xml` builds only this dependency. Normal `zig build` also
prepares it when source is available; full `zig build deps` includes it.
The build compiles the C nested-loader regression and runs it for a native
host build before publishing the corrected archives; cross builds compile it
without attempting target execution. Generated sources, CMake state, headers,
archives, and provenance live in
`build/deps/libxml2-2.15.1-silk.2/<target-layout>/`. The build serializes writers
and uses a new source directory after an interrupted export. A provenance
manifest is published after successful archive creation.

Repository XML linking and `@builtin/libxml2.a` use this corrected directory;
installed builds use its archives and manifest staged in the normal built-in
library directory. Missing correction artifacts produce a `deps-xml` diagnostic
instead of falling back to the old vendored XML archive. Explicit user-supplied
archives remain the caller's dependency choice. Make staging copies the
corrected XML archives after the other built-ins. The C ABI is unchanged.

`std::xml::Schema.parse` still accepts standalone schemas and rejects external
loads; `Schema.parse_bundle` supplies the bounded inventory API documented in
[std::xml](/silk/docs/std/xml/). Retire the downstream correction only after pinning an
upstream fix and passing the nested-loader acceptance/denial regressions.

Revision `2.15.1+silk.2` additionally sets `XML_PARSE_NO_SYS_CATALOG` on
schema document parsers when a custom resource loader is installed. This
prevents catalog lookup before the explicit loader; parsers without a custom
loader retain upstream catalog behavior. The native gate installs a misleading
catalog mapping as well as an ambient file and verifies both are bypassed.
