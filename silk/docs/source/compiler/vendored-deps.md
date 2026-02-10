# Vendored Dependencies

Silk aims to be buildable with minimal reliance on system-installed
dependencies. For the hosted POSIX baseline, Silk vendors:

- libsodium (`jedisct1/libsodium`) at tag `1.0.20-RELEASE`
- mbedTLS (`Mbed-TLS/mbedtls`) at tag `mbedtls-4.0.0`
- libssh2 (`libssh2/libssh2`) at tag `libssh2-1.11.1`
- SQLite amalgamation at version `3510200` (downloaded from sqlite.org)
- ggml (`ggml-org/ggml`) at tag `v0.9.5`
- libpng (`pnggroup/libpng`) at tag `v1.6.54`
- libjpeg-turbo (`libjpeg-turbo/libjpeg-turbo`) at tag `3.1.3`
- libxml2 (`GNOME/libxml2`) at tag `v2.15.1`

These dependencies are fetched as shallow clones (`--depth 1`) and built as
static libraries for `linux/x86_64`.

Note: the current deps workflow builds libssh2 with the OpenSSL
backend, so building libssh2 requires system OpenSSL headers and libraries
(`libssl`/`libcrypto`).

## Fetch + Build

From the Silk compiler repository root:

```sh
make deps
```

Or directly:

```sh
zig build deps
```

This populates:

- `vendor/deps/` — git checkouts of the pinned tags
- `vendor/build/` — build directories (`libsodium` via autotools; `mbedTLS` via CMake)
- `vendor/lib/x64-linux/` — built static archives:
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

These directories and generated `.a` files are ignored by git.

## Staging and Installed Layout

For distribution and `make install`, the hosted toolchain expects vendored
archives under the compiler prefix:

- staged (repo build prefix): `build/lib/silk/vendor/lib/x64-linux/`
- installed: `<prefix>/lib/silk/vendor/lib/x64-linux/` (typically
  `/usr/local/lib/silk/vendor/lib/x64-linux/`)

`make build` copies `.a` files from `vendor/lib/x64-linux/` into the staged
prefix under `build/lib/silk/vendor/lib/x64-linux/`, and `make install` copies
the staged prefix into `<prefix>/`.

## Bundling Into `libsilk.a`

When the vendored archives are present, the Zig build can bundle them into
`libsilk.a` so C embedders do not have to link libsodium/mbedTLS separately.

To require that the vendored archives are present (and fail the build if they
are missing), pass:

```sh
zig build -Drequire-vendored-crypto=true
```

## Notes

- Vendoring is currently wired up only for `linux/x86_64`.
- Some std modules are currently wired to system shared libraries
  during the hosted `linux/x86_64` phase (for example `std::tls` and
  `std::ssh2`); the vendored static archives produced by `zig build deps` are
  used for embedding and future bundling into `libsilk.a`.
- `mbedTLS` uses git submodules (`framework`, `tf-psa-crypto`); `zig build deps` initializes them automatically.
- `zig build deps` configures `mbedTLS` with `ENABLE_TESTING=OFF` and `ENABLE_PROGRAMS=OFF` (we only need the static libraries).
- The `deps` step requires `git`, `cmake`, `perl`, and a working C build toolchain (`make` + a C compiler).
- Building libssh2 currently requires system OpenSSL development files (headers + libraries) due to the OpenSSL backend configuration.
- libpng requires zlib at link/runtime (typically `libz.so.1`).
- libxml2 is configured without iconv/zlib/modules/threads in the default deps workflow; it still requires libm at link/runtime (typically `libm.so.6`).
- `mbedTLS`/TF-PSA-Crypto generation requires `python3` with `jinja2` available; `jsonschema` is optional (validation is skipped when it is missing).
