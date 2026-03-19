# `std::ggml`

Status: **Implemented core wrapper**. `std::ggml` exposes a focused, usable
subset of ggml for creating tensors, building graphs, and computing them on the
hosted baseline.

Upstream:

- Repository: `ggml-org/ggml`
- Pinned version: `v0.9.5`

## Exported API

### Types and constants

- `Type = i32`
- tensor element type constants:
  - `TYPE_F32`
  - `TYPE_F16`
  - `TYPE_I32`
  - `TYPE_I64`
  - `TYPE_F64`
  - `TYPE_BF16`

Status constants:

- `STATUS_ALLOC_FAILED`
- `STATUS_FAILED`
- `STATUS_SUCCESS`
- `STATUS_ABORTED`

Error constants:

- `ERR_INIT_FAILED`
- `ERR_INVALID_INPUT`
- `ERR_OUT_OF_MEMORY`
- `ERR_COMPUTE_FAILED`
- `ERR_ABORTED`

### Errors and result aliases

- `GgmlFailed`
  - `err.kind() -> GgmlErrorKind`
- `ContextResult = std::result::Result(Context, GgmlFailed)`
- `TensorResult = std::result::Result(Tensor, GgmlFailed)`
- `GraphResult = std::result::Result(Graph, GgmlFailed)`
- `BoolResult = std::result::Result(bool, GgmlFailed)`
- `F32Result = std::result::Result(f32, GgmlFailed)`
- `IntResult = std::result::Result(i32, GgmlFailed)`
- `I64Result = std::result::Result(i64, GgmlFailed)`
- `U64Result = std::result::Result(u64, GgmlFailed)`

### `Context`

`Context` owns the ggml arena and therefore also owns every tensor and graph
created from it.

Methods:

- `Context.invalid() -> Context`
- `ctx.is_valid() -> bool`
- `Context.init(mem_size: u64, mem_buffer: u64 = 0, no_alloc: bool = false) -> ContextResult`
- `ctx.free() -> void`
- `ctx.drop() -> void`
- `ctx.used_mem() -> U64Result`
- `ctx.new_tensor_1d(ty: Type, ne0: i64) -> TensorResult`
- `ctx.new_tensor_2d(ty: Type, ne0: i64, ne1: i64) -> TensorResult`
- `ctx.add(a: Tensor, b: Tensor) -> TensorResult`
- `ctx.sub(a: Tensor, b: Tensor) -> TensorResult`
- `ctx.mul(a: Tensor, b: Tensor) -> TensorResult`
- `ctx.mul_mat(a: Tensor, b: Tensor) -> TensorResult`
- `ctx.new_graph() -> GraphResult`

### `Tensor`

`Tensor` is a lightweight handle into storage owned by a `Context`.

Methods:

- `Tensor.invalid() -> Tensor`
- `tensor.is_valid() -> bool`
- `tensor.set_f32(value: f32) -> BoolResult`
- `tensor.set_f32_1d(i: i32, value: f32) -> BoolResult`
- `tensor.get_f32_1d(i: i32) -> F32Result`
- `tensor.nelements() -> I64Result`
- `tensor.nbytes() -> U64Result`
- `tensor.n_dims() -> IntResult`
- `tensor.is_scalar() -> BoolResult`
- `tensor.is_contiguous() -> BoolResult`

### `Graph`

`Graph` is a compute graph handle associated with the context that created it.

Methods:

- `Graph.invalid() -> Graph`
- `graph.is_valid() -> bool`
- `graph.build_forward_expand(t: &Tensor) -> BoolResult`
- `graph.compute(n_threads: i32) -> BoolResult`

## Examples

### Add two scalar tensors

```silk
import std::ggml;

export fn main () -> int {
  let ctx = match std::ggml::Context.init(16 * 1024 * 1024) {
    Ok(v) => v,
    Err(_) => return 1,
  };

  let mut a = match ctx.new_tensor_1d(std::ggml::TYPE_F32, 1) {
    Ok(v) => v,
    Err(_) => return 2,
  };
  let mut b = match ctx.new_tensor_1d(std::ggml::TYPE_F32, 1) {
    Ok(v) => v,
    Err(_) => return 3,
  };

  if a.set_f32_1d(0 as i32, 3.0).is_err() {
    return 4;
  }
  if b.set_f32_1d(0 as i32, 4.0).is_err() {
    return 5;
  }

  let c = match ctx.add(a, b) {
    Ok(v) => v,
    Err(_) => return 6,
  };

  let mut graph = match ctx.new_graph() {
    Ok(v) => v,
    Err(_) => return 7,
  };
  if graph.build_forward_expand(&c).is_err() {
    return 8;
  }
  if graph.compute(1 as i32).is_err() {
    return 9;
  }

  let value = match c.get_f32_1d(0 as i32) {
    Ok(v) => v,
    Err(_) => return 10,
  };
  if value != 7.0 {
    return 11;
  }

  return 0;
}
```

### Inspect tensor shape and storage

```silk
import std::ggml;

fn main () -> int {
  let ctx = match std::ggml::Context.init(4 * 1024 * 1024) {
    Ok(v) => v,
    Err(_) => return 1,
  };
  let t = match ctx.new_tensor_2d(std::ggml::TYPE_F32, 4, 8) {
    Ok(v) => v,
    Err(_) => return 2,
  };

  if t.n_dims() != Ok(2 as i32) {
    return 3;
  }
  if t.is_contiguous() != Ok(true) {
    return 4;
  }

  return 0;
}
```

## Considerations

- `Context` is the owner. Tensors and graphs become invalid when the context is
  freed or dropped.
- The wrapper intentionally exposes a focused subset. It is suitable for small
  hosted computations and embedding scenarios without re-exporting the whole
  upstream C API.
- The current FFI boundary uses a small shim layer for by-value ggml structs
  such as `ggml_init_params`, because the current Silk ABI subset does not call
  those C entry points directly.
- On the hosted `linux/x86_64` baseline, `silk build` auto-links ggml after
  `zig build deps` has staged the vendored archives.

## Design goals

- Keep the public surface small and predictable.
- Preserve ggml’s core execution model: context-owned tensors plus explicit
  graph construction.
- Expose enough tensor inspection and arithmetic to build real inference or
  numeric pipelines without forcing every caller down to raw FFI.

## See also

- [`std::runtime::mem`](?p=std/runtime)
- [`Vendored dependencies`](?p=compiler/vendored-deps)
- [`CLI build reference`](?p=compiler/cli-silk)
