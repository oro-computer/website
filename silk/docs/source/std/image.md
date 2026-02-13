# `std::image` — Image Codecs + Color

Status: **design + initial implementation**. `std::image` provides:

- `std::image::color` — color value types and conversion helpers (pure Silk),
- `std::image::png` — PNG decode/encode backed by libpng,
- `std::image::jpeg` — JPEG decode/encode backed by libjpeg-turbo.

The codec modules focus on simple, ABI-safe entrypoints (currently RGBA8) that
work with the current `ext` / C ABI subset.

## Module Layout

- `std::image` — shared image types.
- `std::image::color` — Go-inspired color model helpers and common color value
  types.
- `std::image::png` — PNG decode/encode (`RGBA8`) via libpng.
- `std::image::jpeg` — JPEG decode/encode (`RGBA8`) via libjpeg-turbo.

## Vendored Dependencies + Linking

On the hosted `linux/x86_64` baseline, the codec modules rely on vendored C
libraries that are built via the Silk compiler repository’s vendored dependency workflow:

- libpng `v1.6.54`
- libjpeg-turbo `3.1.3`

Run:

```sh
zig build deps
```

When the vendored archives are present, `silk build` auto-links them when
`std::image::png` / `std::image::jpeg` are present in the module set, and also
when linking `.o`/`.a` inputs that reference the shim symbols.

Why shims: libpng and libjpeg-turbo expose callback-heavy APIs and/or by-value
struct arguments. The current Silk ABI subset is intentionally small, so the
toolchain builds shim archives that provide scalar-ABI-friendly functions.

Notes:

- The PNG path requires zlib and libm at link/runtime (typically `libz.so.1`
  and `libm.so.6`).
- The JPEG path requires libm at link/runtime (typically `libm.so.6`).

## Ownership + Safety

- Decoders return owned pixel buffers; callers must `drop` them when finished.
- Inputs are treated as borrowed byte slices; they must remain valid for the
  duration of a call.
- These modules do not provide sandboxing: decoding untrusted data can be
  expensive and should be bounded by caller policy (size limits, timeouts,
  etc.).
