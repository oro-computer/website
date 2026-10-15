---
layout: "docs"
description: "std::gpu::device is the semantic operation surface available inside attr(device=gpu) function bodies. Unlike std::gpu::isa, its API is expressed in terms of kernel parameters and work-item behavior ra"
docsCollection: "silk"
section: "std"
order: 133
sourcePath: "std/gpu-device.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::gpu::device`](/silk/docs/std/gpu-device/)

[`std::gpu::device`](/silk/docs/std/gpu-device/) is the semantic operation surface available inside
`attr(device=gpu)` function bodies. Unlike [`std::gpu::isa`](/silk/docs/std/gpu-isa/), its API is expressed
in terms of kernel parameters and work-item behavior rather than physical AMD
register numbers.

The module is compiler-backed. Its declarations make ordinary Silk checking,
imports, arity, and types apply, but calls are consumed during target-neutral
GPU device-IR lowering and do not become runtime imports.
Named-import aliases, package aliases, and local `using` aliases preserve that
compiler-owned identity. A root-package helper with the same unqualified name
does not acquire device-operation semantics merely from its spelling.

## Exported API
- `global_id_x() -> u64` returns the current one-dimensional global work-item
 index.
- `load_u32(base_address: u64, index: u64) -> u64` reads the packed element at
 `base_address + index * 4` and zero-extends it to `u64`.
- `store_u32(base_address: u64, index: u64, value: u64) -> void` writes the low
 32 bits of `value` to the packed element at
 `base_address + index * 4`.
- `bool_to_u64(value: bool) -> u64` converts `false` to `0` and `true` to `1`
 inside portable device code.
- `local_id_x()`, `local_size_x()`, and `group_id_x()` expose the current
 work-item, workgroup width, and workgroup index on the X dimension.
- `barrier()` synchronizes the workgroup and publishes prior shared-memory
 writes to its members. Every live work item in the workgroup must reach the
 same barrier.
- `load_u64`/`store_u64`, `load_f32`/`store_f32`, and
 `load_f64`/`store_f64` provide typed indexed global-memory access alongside
 the existing packed `u32` functions.
- `shared_load_u32`/`shared_store_u32`, `shared_load_u64`/`shared_store_u64`,
 `shared_load_f32`/`shared_store_f32`, and
 `shared_load_f64`/`shared_store_f64` address the NVIDIA backend's 16 KiB
 per-workgroup shared arena by typed element index. Every type shares the same
 byte arena: byte offset is `index * sizeof(element)`, and callers must use
 disjoint resulting byte ranges when several typed arrays coexist.
- `nvidia_mma_f32_m16n8k8_f16_d0` through `_d3` expose the four f32 output
 registers of the sm80-or-newer m16n8k8 packed-f16 tensor-MMA fragment.
- `store_u32_at_global_x(base_address: u64, value: u64) -> void` stores the low
 32 bits of `value` in little-endian order at
 `base_address + global_id_x * 4`.
- `classify_u32_at_global_x(input_address: u64, output_address: u64,
 threshold: u64) -> void` loads one packed input `u32`, compares it with the
 low 32 bits of `threshold`, and stores a packed prediction: `1` when
 `input >= threshold`, otherwise `0`. All three arguments must be direct names
 of `u64` parameters declared by the containing GPU function in the
 standalone AMD source-intrinsic object path.

The global-X, packed-u32, and boolean conversion operations are the portable
GPU-v1 composition surface. Typed global/shared operations, barriers, and
tensor-MMA helpers are selected by the NVIDIA general device backend. The
`store_u32_at_global_x` and `classify_u32_at_global_x` compatibility operations
are retained for source compatibility with the initial AMDGPU vertical slice;
new portable algorithms should be written from the portable primitives and
ordinary Silk helpers.

Mixed GPU-v1 device IR accepts supported scalar expressions as arguments to
the two compatibility operations. The standalone AMD source-intrinsic object
path requires their arguments to be direct names of immutable `u64` entry
parameters because that path does not lower general Silk expressions.

`global_id_x` is the one-dimensional global work-item index derived from the
selected provider's work-group/block id, the dispatched work-group size, and
the work-item/thread id. A launch with `grid_size == N` therefore writes exactly
`N` consecutive `u32` elements when either helper is executed once by every
work item. The classifier also reads exactly `N` consecutive packed input
elements.

The caller owns the bounds contract. For the store helper, `base_address` must
identify at least `grid_size * 4` writable device bytes. For the classifier,
`input_address` must identify that many readable bytes and `output_address`
must identify that many writable bytes. A [`std::gpu::Buffer.address`](/silk/docs/std/gpu/) supplies
the base of a runtime-tracked allocation, but launch arguments are opaque `u64`
values and the runtime does not infer or bounds-check device accesses from
them. Arbitrary device pointer arithmetic and address-space-aware Silk types
are not yet part of this subset.

Calling a device operation from a host function is a compile-time error. In the
standalone AMD source-intrinsic object path, using a literal, local variable,
expression, or non-`u64` parameter where a compatibility operation requires an
entry parameter is also a compile-time error with the rejected operand
highlighted.

The indexed primitives accept supported local expressions produced by device
IR, not only direct kernel parameter names. They are compiler-owned semantic
operations and do not create external ABI symbols.

## Example

```silk
import { store_u32_at_global_x } from "std/gpu/device";

attr(device=gpu)
fn fill (output: u64, value: u64) {
  store_u32_at_global_x(output, value);
}
```

```silk
import { classify_u32_at_global_x } from "std/gpu/device";

attr(device=gpu)
fn classify (input: u64, output: u64, threshold: u64) {
  classify_u32_at_global_x(input, output, threshold);
}
```

Portable composition:

```silk
import { bool_to_u64, global_id_x, load_u32, store_u32 } from "std/gpu/device";

pure fn class_one (value: u64, threshold: u64) -> bool {
  return value >= threshold;
}

attr(device=gpu)
fn classify (input: u64, output: u64, threshold: u64) {
  let index: u64 = global_id_x();
  let value: u64 = load_u32(input, index);
  let prediction: u64 = bool_to_u64(class_one(value, threshold));
  store_u32(output, index, prediction);
}
```

See [gpu execution](/silk/docs/language/gpu-execution/) for placement and signature rules and
[gpu](/silk/docs/std/gpu/) for allocation, launch, transfer, and synchronization.
