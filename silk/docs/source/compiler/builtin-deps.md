# Built-In Dependencies

Silk aims to be buildable with minimal reliance on system-installed
dependencies. For the hosted POSIX baseline, Silk ships built-in dependency
sources and pinned archives:

- a pinned Zig toolchain tarball for `linux/x86_64` (used by CI and optional for
 contributors):
 - `vendor/zig-x86_64-linux-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
- a pinned Zig toolchain tarball for `macos/aarch64` (used by CI and for local
 bootstrap on Apple Silicon hosts):
 - `vendor/zig-aarch64-macos-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
- libsodium (`jedisct1/libsodium`) at tag `1.0.20-RELEASE`
- mbedTLS (`Mbed-TLS/mbedtls`) at tag `mbedtls-4.0.0`
- libssh2 (`libssh2/libssh2`) at tag `libssh2-1.11.1`
- SQLite amalgamation at version `3510200` (downloaded from sqlite.org for
 Linux guide tooling; Apple Silicon core builds can use the system SQLite
 library when the bundled source is absent)
- ggml (`ggml-org/ggml`) at tag `v0.9.5`
- libpng (`pnggroup/libpng`) at tag `v1.6.54`
- libjpeg-turbo (`libjpeg-turbo/libjpeg-turbo`) at tag `3.1.3`
- libxml2 (`GNOME/libxml2`) at tag `v2.15.1`
- Z3 SMT solver at version `4.15.4.0` (headers and the `linux/x86_64` static
 archive are shipped; the `macos/aarch64` static archive is optional and staged
 when present)

When fetching is enabled, these dependencies are fetched as shallow clones
(`--depth 1`) or downloaded archives and built as static libraries for the
supported native host layouts:

- `linux/x86_64` -> `vendor/lib/x64-linux/`
- `macos/aarch64` -> `vendor/lib/aarch64-macos/`

Fresh Apple Silicon checkouts do not require `vendor/lib/aarch64-macos/libz3.a`
for the core compiler or `libsilk.a` build. When that archive is absent, the
static Z3 verifier path is disabled and users can still enable verification with
`--z3-lib <path>` or `SILK_Z3_LIB=/path/to/libz3.dylib`. Missing optional Z3
does not suppress the Apple Silicon hosted dependency or stdlib archive staging
performed by `make build`.

Note: the deps workflow builds libssh2 with the mbedTLS backend. This keeps the
hosted baseline self-contained (no system OpenSSL headers/libraries required),
and allows `silk build` to link `std::ssh` / `std::ssh2` without adding
`DT_NEEDED` entries for `libssh2.so.*`.

Note: the deps workflow also configures ggml in the current CPU-only hosted
mode (`GGML_OPENMP=OFF`, `GGML_ACCELERATE=OFF`, `GGML_BLAS=OFF`,
`GGML_METAL=OFF`). This keeps the staged archive surface stable on both
supported native hosts: `libggml.a`, `libggml-base.a`, `libggml-cpu.a`, and
`libsilk_ggml_shims.a`.

## Build

From the repo root:

```sh
make deps
```

On `linux/x86_64` and `macos/aarch64`, this runs the built-in hosted-dependency
build for the native host archive layout and enables dependency fetching for
missing built-in sources automatically. On a fresh checkout, `make deps`
therefore populates `vendor/deps/` and builds the host archives directly.
The mbedTLS generator-side Python dependency (`jinja2`) is also bootstrapped
under `vendor/build/pythondeps/` when the host Python environment does not
already provide it. On Python installations that disallow direct package
installation into the managed interpreter, the deps workflow creates an
isolated helper environment under `vendor/build/pythondeps-venv/` and installs
the package into the repo-local target directory from there.

Fast CI test lanes may run:

```sh
make sqlite-deps-if-needed
```

This only populates the pinned SQLite amalgamation source required by the guide
database builder. It does not build the full hosted dependency archive stack.
If the network or Python certificate store cannot reach sqlite.org, place
`sqlite-amalgamation-3510200.zip` at
`vendor/build/sqlite-amalgamation-3510200.zip` or set
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
under `vendor/deps/`.

To allow `zig build deps` to fetch missing sources from the network, run:

```sh
zig build deps -Dfetch-deps=true
```

This populates:

- `vendor/deps/` — git checkouts of the pinned tags
- `vendor/build/` — build directories (`libsodium` via autotools; `mbedTLS` via CMake)
- `vendor/lib/<host-layout>/` — built static archives for the active supported host:
 - `libsodium.a`
 - `libmbedtls.a`
 - `libmbedx509.a`
 - `libmbedcrypto.a`
 - `libssh2.a`
 - `libsqlite3.a`
 - `libggml.a`
 - `libggml-base.a`
 - `libggml-cpu.a`
 - `libsilk_ggml_shims.a` (ABI-safe Silk wrappers for by-value ggml APIs)
 - `libpng16.a`
 - `libsilk_png_shims.a` (ABI-safe Silk wrappers for libpng)
 - `libturbojpeg.a`
 - `libjpeg.a`
 - `libsilk_jpeg_shims.a` (ABI-safe Silk wrappers for libjpeg-turbo)
 - `libxml2.a`
 - `libsilk_xml_shims.a` (ABI-safe Silk wrappers for libxml2 struct access)
 - `libz3.a` (Z3 `4.15.4.0`; pinned in `vendor/lib/x64-linux/`; optional in
 `vendor/lib/aarch64-macos/` until the native archive workflow is tracked)

These directories and generated `.a` files are ignored by git, except for:

- the shipped pinned Z3 archive: `vendor/lib/x64-linux/libz3.a`
- the shipped pinned Z3 headers: `vendor/include/z3*.h` and `vendor/include/z3++.h`
- the shipped pinned Zig toolchain tarballs:
 - Linux x86_64: `vendor/zig-x86_64-linux-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
 - macOS aarch64: `vendor/zig-aarch64-macos-0.16.0-dev.1912+0cbaaa5eb.tar.xz`

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
without deleting the fetched source trees under `vendor/deps/`, run:

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

`zig build install --prefix <dir>` installs headers from `vendor/include/`
directly into `<dir>/include/silk/` whenever the built-in include tree is
present. `make build` also mirrors those headers into `build/include/silk/`
while staging `.a` files under `build/lib/silk/vendor/lib/<host-layout>/`. On
`linux/x86_64` and `macos/aarch64`, `make build` runs `make deps` first when
required dependency outputs are missing.
`make install` copies the staged prefix into `<prefix>/`.

Raw built-in headers keep their upstream include spelling under the canonical
Silk namespace. For example:

- `vendor/include/mbedtls/error.h` stages as `build/include/silk/mbedtls/error.h`
- `vendor/include/psa/crypto.h` stages as `build/include/silk/psa/crypto.h`

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

Silk distinguishes the public `std::crypto` / `std::tls` API from the provider
used to satisfy it at link time:

- `builtin` uses the toolchain-built static archives from this document
 (`libsodium.a`, the mbedTLS archives, and `libssh2.a`).
- `platform` is available on Apple targets and strictly uses Apple platform
 frameworks for the primitives currently wired through the standard library.
- `auto` selects platform-backed APIs first on Apple targets and falls back to
 built-in archives for std APIs that do not yet have an Apple platform mapping;
 it selects `builtin` elsewhere.

`silk build`, `silk check`, and `silk test` accept
`--security-provider <auto|platform|builtin>`. When the flag is omitted,
`SILK_SECURITY_PROVIDER` wins over `[build] security_provider` in `silk.toml`;
if neither is present, `auto` is used.

On Apple targets, `auto` and `platform` currently route `std::crypto`
initialization, hardened memory operations, constant-time equality, and
`std::crypto::random` through the Apple Security-backed bundled runtime helper
and link `Security.framework`. `std::net` provider builds link
`Network.framework` while the Network-backed TCP/UDP implementation is being
completed. In `auto` mode, `std::tls`, `std::ssh` / `std::ssh2`, native inputs
that reference libsodium or mbedTLS symbols, and advanced `std::crypto::*`
modules beyond `std::crypto::random` fall back to the built-in archives.
Explicit `platform` builds reject those fallback-only APIs until platform
mappings are implemented.

## Notes

- The pinned Zig bootstrap is available for `linux/x86_64` and `macos/aarch64`.
- Built-in hosted C dependencies now build for the native supported host layouts
 `linux/x86_64` and `macos/aarch64`.
- The current `macos/aarch64` host build now succeeds for the compiler/tooling
 payload, staged hosted dependency archives, prebuilt stdlib archive, and real
 hosted async/task runtime archives on Apple Silicon.
- The hosted async/task surface still remains Linux-first in full behavior:
 `macos-aarch64` now supports the native const-main executable subset, a
 temporary Apple Silicon host-assembled non-const scalar subset, and
 host-backed Mach-O object/static/shared library outputs. The longer-term
 macOS backend gap is replacing the temporary host assembler/linker path with
 fully Silk-owned non-const Mach-O code generation.
- `std::crypto`, `std::tls`, and `std::ssh` / `std::ssh2` use the built-in
 static archives produced by `zig build deps` when the active security
 provider is `builtin`, and those archives are also auto-linked when native
 `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium, mbedTLS,
 or libssh2 symbol families.
- `std::sqlite` likewise auto-links its built-in archive when imported from
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
