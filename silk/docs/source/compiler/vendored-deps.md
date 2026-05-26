# Vendored Dependencies

Silk aims to be buildable with minimal reliance on system-installed
dependencies. For the hosted POSIX baseline, Silk vendors:

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
- Z3 SMT solver at version `4.15.4.0` (headers and the `linux/x86_64` glibc
 static archive are shipped; no vendored musl Z3 archive is supplied)

When fetching is enabled, these dependencies are fetched as shallow clones
(`--depth 1`) or downloaded archives and built as static libraries for the
supported target layouts:

- `linux/x86_64` with glibc -> `vendor/lib/x64-linux/`
- `linux/x86_64` with musl -> `vendor/lib/x64-linux-musl/`
- `macos/aarch64` -> `vendor/lib/aarch64-macos/`

Fresh Apple Silicon and musl-targeted checkouts do not require a matching
`libz3.a` for the core compiler or `libsilk.a` build. Vendored
`std::runtime::z3` auto-linking is glibc-only, so the driver never uses the
shipped glibc `vendor/lib/x64-linux/libz3.a` to satisfy a musl build. Advanced
downstream musl builds can still import `std::runtime::z3` when they explicitly
provide a musl-built Z3 library, either as a `libz3.a` build input or as a
`libz3` dynamic dependency (`--needed libz3.so...` or manifest `needed`).
Formal Silk verification on toolchains without a compiled-in static Z3 build
remains available with `--z3-lib <path>` or `SILK_Z3_LIB=<path>`.

Note: the deps workflow builds libssh2 with the mbedTLS backend. This keeps the
hosted baseline self-contained (no system OpenSSL headers/libraries required),
and allows `silk build` to link `std::ssh` / `std::ssh2` without adding
`DT_NEEDED` entries for `libssh2.so.*`.

Note: the deps workflow also configures ggml in the current CPU-only hosted
mode (`GGML_OPENMP=OFF`, `GGML_ACCELERATE=OFF`, `GGML_BLAS=OFF`,
`GGML_METAL=OFF`). This keeps the staged archive surface stable across the
supported target layouts: `libggml.a`, `libggml-base.a`, `libggml-cpu.a`, and
`libsilk_ggml_shims.a`.

## Build

From the repo root:

```sh
make deps
```

On `linux/x86_64` and `macos/aarch64`, this runs the vendored hosted-dependency
build for the native target layout and enables dependency fetching for missing
vendored sources automatically. On a fresh checkout, `make deps` therefore
populates `vendor/deps/` and builds the native archives directly.
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

On `macos/aarch64`, `make build` does not run this bootstrap when the
amalgamation is absent; the guide database builder links the system `sqlite3`
library instead so the staged compiler can build from a fresh checkout without a
SQLite network fetch.

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

To build the musl dependency layout from a supported deps host, select the Zig
target explicitly:

```sh
zig build deps -Dtarget=x86_64-linux-musl -Dfetch-deps=true
```

The Makefile exposes the same selection as:

```sh
make deps DEPS_TARGET=linux-x86_64-musl
```

This populates:

- `vendor/deps/` — git checkouts of the pinned tags
- `vendor/build/<target-layout>/` — target-specific build directories
 (`libsodium` via autotools; most others via CMake)
- `vendor/include/<target-layout>/` — generated target-specific dependency
 headers
- `vendor/lib/<target-layout>/` — built static archives for the selected
 target layout:
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
 - `libz3.a` for the supported glibc Z3 layout when staged

These directories and generated `.a` files are ignored by git, except for:

- the shipped pinned Z3 archive: `vendor/lib/x64-linux/libz3.a`
- the shipped pinned Z3 headers: `vendor/include/z3*.h` and `vendor/include/z3++.h`
- the shipped pinned Zig toolchain tarballs:
 - Linux x86_64: `vendor/zig-x86_64-linux-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
 - macOS aarch64: `vendor/zig-aarch64-macos-0.16.0-dev.1912+0cbaaa5eb.tar.xz`

To populate and stage the hosted C dependency stack from a clean checkout
(including archives used by `std::xml`, `std::image`, and other modules that
depend on vendored C libraries), run:

```sh
make deps
make build
```

To remove the generated hosted-deps build outputs for the selected dependency
target without deleting the fetched source trees under `vendor/deps/`, run:

```sh
make deps-clean
```

For the musl dependency layout, pass the same target selector:

```sh
make deps-clean DEPS_TARGET=linux-x86_64-musl
```

## Staging and Installed Layout

For distribution and `make install`, the hosted toolchain expects vendored
archives and headers under the compiler prefix:

- staged (repo build prefix): `build/lib/silk/vendor/lib/<target-layout>/`
- staged headers: `build/include/silk/` with generated target headers under
 `build/include/silk/<target-layout>/`
- installed: `<prefix>/lib/silk/vendor/lib/<target-layout>/`
- installed headers: `<prefix>/include/silk/` (typically
 `/usr/local/include/silk/`) with generated target headers under
 `<prefix>/include/silk/<target-layout>/`

`zig build install --prefix <dir>` installs headers from `vendor/include/`
directly into `<dir>/include/silk/` whenever the vendored include tree is
present. `make build` also mirrors those headers into `build/include/silk/`
while staging already-present `.a` files under
`build/lib/silk/vendor/lib/<target-layout>/`. On `linux/x86_64`, `make build`
runs `make deps` first when required dependency outputs are missing. On
`macos/aarch64`, `make build` does not fetch hosted dependencies; run
`make deps` explicitly when the full hosted C archive stack is needed.
`make install` copies the staged prefix into `<prefix>/`.

Raw vendored headers keep their upstream include spelling under the canonical
Silk namespace. For example:

- `vendor/include/mbedtls/error.h` stages as `build/include/silk/mbedtls/error.h`
- `vendor/include/psa/crypto.h` stages as `build/include/silk/psa/crypto.h`

Downstream code that includes headers such as `<mbedtls/error.h>` therefore
needs the canonical vendored-header root on the search path:

```sh
-I<prefix>/include/silk
```

## Bundling Into `libsilk.a`

When the vendored archives are present, the Zig build can bundle them into
`libsilk.a` so C embedders do not have to link libsodium/mbedTLS separately.

To require that the vendored archives are present (and fail the build if they
are missing), pass:

```sh
zig build -Drequire-vendored-crypto=true
```

## Notes

- The pinned Zig bootstrap is available for `linux/x86_64` and `macos/aarch64`.
- Vendored hosted C dependencies now build for the supported target layouts:
 `linux/x86_64` glibc, `linux/x86_64` musl, and `macos/aarch64`.
- The current `macos/aarch64` host build now succeeds for the compiler/tooling
 payload, and the staged runtime archives now compile from the real hosted
 async/task runtime sources on Apple Silicon.
- The hosted async/task surface still remains Linux-first in full behavior:
 `macos-aarch64` now supports the native const-main executable subset plus a
 temporary Apple Silicon host-assembled non-const scalar subset, but bundled
 runtime/archive integration for that Mach-O path is still the blocker for
 full hosted async/task parity on macOS targets.
- `std::crypto` and `std::tls` are wired to the vendored static archives
 produced by `zig build deps` for supported target-layout `silk build` outputs,
 and the same vendored crypto/TLS archives are also auto-linked when native
 `.c` / `.h` / `.m` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol
 families.
- `std::sqlite` and `std::ssh` / `std::ssh2` likewise auto-link their vendored
 archives when imported from Silk code or when native `.c` / `.h` / `.m` /
 `.o` / `.a` inputs reference `sqlite3_*` or `libssh2_*` symbols on supported
 target layouts.
- `mbedTLS` uses git submodules (`framework`, `tf-psa-crypto`); `zig build deps` initializes them automatically.
- `zig build deps` configures `mbedTLS` with `ENABLE_TESTING=OFF` and `ENABLE_PROGRAMS=OFF` (we only need the static libraries).
- The `deps` step requires `git`, `cmake`, `perl`, and a working C build toolchain (`make` + a C compiler).
- `zig build deps` builds libssh2 against the vendored mbedTLS archives (no
 OpenSSL requirement in the hosted baseline).
- libpng auto-linking is currently for `linux/x86_64` glibc/musl and requires
 zlib at link/runtime (typically `libz.so.1`).
- libxml2 auto-linking is currently for `linux/x86_64` glibc/musl; it is
 configured without iconv/zlib/modules/threads in the default deps workflow
 and still requires the target libc math provider (`libm.so.6` on glibc,
 `libc.so` on musl).
- `mbedTLS`/TF-PSA-Crypto generation requires `python3` with `jinja2` available; `jsonschema` is optional (validation is skipped when it is missing).
