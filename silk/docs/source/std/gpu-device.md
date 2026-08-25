# `std::gpu::device`

`std::gpu::device` is the semantic operation surface available inside
`attr(device=gpu)` function bodies. Unlike `std::gpu::isa`, its API is expressed
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
- `store_u32_at_global_x(base_address: u64, value: u64) -> void` stores the low
 32 bits of `value` in little-endian order at
 `base_address + global_id_x * 4`.
- `classify_u32_at_global_x(input_address: u64, output_address: u64,
 threshold: u64) -> void` loads one packed input `u32`, compares it with the
 low 32 bits of `threshold`, and stores a packed prediction: `1` when
 `input >= threshold`, otherwise `0`. All three arguments must be direct names
 of `u64` parameters declared by the containing GPU function in the
 standalone AMD source-intrinsic object path.

The first four operations are the portable composition surface. The latter
two are retained for source compatibility with the initial AMDGPU vertical
slice; new algorithms should be written from the portable primitives and
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
must identify that many writable bytes. A `std::gpu::Buffer.address` supplies
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

See [gpu execution](?p=language/gpu-execution) for placement and signature rules and
[gpu](?p=std/gpu) for allocation, launch, transfer, and synchronization.
