# `std::ggml`

Status: **Early bring-up (design + initial scaffolding)**.

`std::ggml` exposes the ggml tensor library to Silk programs. The long-term
goal is to make ggml the standard tensor backend for Silk’s ML-oriented
standard library surface.

Upstream:

- Repository: `ggml-org/ggml`
- Pinned version: `v0.9.5`

## Goals

- Provide a safe, Silk-native wrapper layer over the ggml C API.
- Keep raw access available for power users (with explicit unsafe/pointer APIs).
- Make building/linking predictable by treating ggml as a core vendored
  dependency (similar to libsodium/mbedTLS/libssh2/sqlite in the hosted
  baseline).

## ABI / FFI Notes (Current Compiler Subset)

The current Silk backend subset uses a scalar-slot memory model for structs
(`docs/language/structs-impls-layout.md`). At ABI boundaries (`export fn` and
`ext`), passing C structs by value is only ABI-safe when the struct’s flattened
slots are all `i64`/`u64`/`f64`.

For FFI with upstream C APIs, note that Silk’s `int` currently maps to `i64` on
`linux/x86_64`. The `std::ggml` bindings therefore use `i32` for ggml’s C
`int`/`enum` values (type codes, status values, indices, and thread counts) to
match the upstream ABI.

ggml includes several C entrypoints that accept small structs by value (notably
`ggml_init(struct ggml_init_params)`), where the C layout includes `bool` and
`size_t`. This is not ABI-safe to call directly from Silk in the current subset.

Therefore, `std::ggml` uses a tiny C shim layer (built as part of the toolchain)
to expose ABI-safe wrapper functions for the few by-value-struct APIs.

## Build + Dependency Workflow

`zig build deps` is responsible for fetching/building ggml and staging:

- headers into `vendor/include/` (for shim compilation),
- static archives into `vendor/lib/x64-linux/` (for linking),

alongside existing vendored deps. See `docs/compiler/vendored-deps.md`.

On `linux/x86_64`, `silk build` automatically links the staged ggml archives
when `std::ggml` is included in the module set. If the archives are missing,
the build fails with an actionable error pointing to `zig build deps`.

When linking `.o` / `.a` inputs, `silk build` also auto-links ggml if any input
references `silk_ggml_init` (for example, when a prebuilt static library was
produced from Silk code that uses `std::ggml`). This keeps downstream consumers
from needing to import `std::ggml` purely to satisfy link/runtime dependencies.

The current auto-linked archives are:
`libggml.a`, `libggml-base.a`, `libggml-cpu.a`, and `libsilk_ggml_shims.a`.

Because ggml is built as C++ on the hosted baseline, the produced executables
and shared libraries also depend on the system C++ runtime (`libstdc++`) and
math library (`libm`); `silk build` adds these as `DT_NEEDED` entries when it
auto-links ggml.

## Intended Surface (Initial)

The initial surface is intentionally small:

- create/free a ggml context,
- create basic tensors,
- compute a graph,
- basic tensor inspection helpers.

The module is expected to grow incrementally as we map more of the upstream API
into a stable Silk wrapper layer.
