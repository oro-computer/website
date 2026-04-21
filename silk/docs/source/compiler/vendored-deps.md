# Vendored Dependencies

Silk aims to be buildable with minimal reliance on system-installed
dependencies. For the hosted POSIX baseline, Silk vendors:

- a pinned Zig toolchain tarball for `linux/x86_64` (used by CI and optional for
 contributors):
 - `vendor/zig-x86_64-linux-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
- a pinned Zig toolchain tarball for `macos/aarch64` (used for local bootstrap
 on Apple Silicon hosts):
 - `vendor/zig-aarch64-macos-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
- libsodium (`jedisct1/libsodium`) at tag `1.0.20-RELEASE`
- mbedTLS (`Mbed-TLS/mbedtls`) at tag `mbedtls-4.0.0`
- libssh2 (`libssh2/libssh2`) at tag `libssh2-1.11.1`
- SQLite amalgamation at version `3510200` (downloaded from sqlite.org)
- ggml (`ggml-org/ggml`) at tag `v0.9.5`
- libpng (`pnggroup/libpng`) at tag `v1.6.54`
- libjpeg-turbo (`libjpeg-turbo/libjpeg-turbo`) at tag `3.1.3`
- libxml2 (`GNOME/libxml2`) at tag `v2.15.1`
- Z3 SMT solver at version `4.15.4.0` (shipped as a pinned static archive for `linux/x86_64`)

When fetching is enabled, these dependencies are fetched as shallow clones
(`--depth 1`) or downloaded archives and built as static libraries for the
supported native host layouts:

- `linux/x86_64` -> `vendor/lib/x64-linux/`
- `macos/aarch64` -> `vendor/lib/aarch64-macos/`

Note: the deps workflow builds libssh2 with the mbedTLS backend. This keeps the
hosted baseline self-contained (no system OpenSSL headers/libraries required),
and allows `silk build` to link `std::ssh` / `std::ssh2` without adding
`DT_NEEDED` entries for `libssh2.so.*`.

## Build

From the repo root:

```sh
make deps
```

On `linux/x86_64` and `macos/aarch64`, this runs the vendored hosted-dependency
build for the native host archive layout and enables dependency fetching for
missing vendored sources automatically. On a fresh checkout, `make deps`
therefore populates `vendor/deps/` and builds the host archives directly.
The mbedTLS generator-side Python dependency (`jinja2`) is also bootstrapped
under `vendor/build/pythondeps/` when the host Python environment does not
already provide it.

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
 - `libz3.a` (Z3 `4.15.4.0`; pinned in `vendor/lib/x64-linux/` and built natively into `vendor/lib/aarch64-macos/` for Formal Silk verification on supported hosts)

These directories and generated `.a` files are ignored by git, except for:

- the shipped pinned Z3 archive: `vendor/lib/x64-linux/libz3.a`
- the shipped pinned Z3 headers: `vendor/include/z3*.h` and `vendor/include/z3++.h`
- the shipped pinned Zig toolchain tarballs:
 - Linux x86_64: `vendor/zig-x86_64-linux-0.16.0-dev.1912+0cbaaa5eb.tar.xz`
 - macOS aarch64: `vendor/zig-aarch64-macos-0.16.0-dev.1912+0cbaaa5eb.tar.xz`

To build the full hosted toolchain from a clean checkout (including `std::xml`,
`std::image`, and other modules that depend on vendored C libraries), run:

```sh
make deps
zig build deps -Dfetch-deps=true
```

To remove the generated hosted-deps build outputs for the active supported host
without deleting the fetched source trees under `vendor/deps/`, run:

```sh
make deps-clean
```

## Staging and Installed Layout

For distribution and `make install`, the hosted toolchain expects vendored
archives and headers under the compiler prefix:

- staged (repo build prefix): `build/lib/silk/vendor/lib/<host-layout>/`
- staged headers: `build/include/silk/`
- installed: `<prefix>/lib/silk/vendor/lib/<host-layout>/`
- installed headers: `<prefix>/include/silk/` (typically
 `/usr/local/include/silk/`)

`zig build install --prefix <dir>` installs headers from `vendor/include/`
directly into `<dir>/include/silk/` whenever the vendored include tree is
present. `make build` also mirrors those headers into `build/include/silk/`
while continuing to stage `.a` files under `build/lib/silk/vendor/lib/<host-layout>/`.
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
- Vendored hosted C dependencies now build for the native supported host layouts
 `linux/x86_64` and `macos/aarch64`.
- The current `macos/aarch64` host build now succeeds for the compiler/tooling
 payload, and the staged runtime archives now compile from the real hosted
 async/task runtime sources on Apple Silicon.
- The hosted async/task surface still remains Linux-first in full behavior:
 `macos-aarch64` now supports the native const-main executable subset plus a
 temporary Apple Silicon host-assembled non-const scalar subset, but bundled
 runtime/archive integration for that Mach-O path is still the blocker for
 full hosted async/task parity on macOS targets.
- `std::crypto` and `std::tls` are wired to the vendored static archives
 produced by `zig build deps` for supported native-host `silk build` outputs,
 and the same vendored crypto/TLS archives are also auto-linked when native
 `.c` / `.h` / `.o` / `.a` inputs reference common libsodium / mbedTLS symbol
 families.
- `std::sqlite` and `std::ssh` / `std::ssh2` likewise auto-link their vendored
 archives when imported from Silk code or when native `.c` / `.h` / `.o` /
 `.a` inputs reference `sqlite3_*` or `libssh2_*` symbols on the supported
 native-host baseline.
- `mbedTLS` uses git submodules (`framework`, `tf-psa-crypto`); `zig build deps` initializes them automatically.
- `zig build deps` configures `mbedTLS` with `ENABLE_TESTING=OFF` and `ENABLE_PROGRAMS=OFF` (we only need the static libraries).
- The `deps` step requires `git`, `cmake`, `perl`, and a working C build toolchain (`make` + a C compiler).
- `zig build deps` builds libssh2 against the vendored mbedTLS archives (no
 OpenSSL requirement in the hosted baseline).
- libpng requires zlib at link/runtime (typically `libz.so.1`).
- libxml2 is configured without iconv/zlib/modules/threads in the default deps workflow; it still requires libm at link/runtime (typically `libm.so.6`).
- `mbedTLS`/TF-PSA-Crypto generation requires `python3` with `jinja2` available; `jsonschema` is optional (validation is skipped when it is missing).
