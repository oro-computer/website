# `std::ggml`

## Description

`std::ggml` exposes the ggml tensor library to Silk programs. It provides a
small, ABI-safe wrapper over the hosted ggml baseline so Silk code can:

- create and own ggml contexts,
- allocate 1D and 2D tensors,
- build simple forward graphs,
- run CPU graph evaluation,
- inspect scalar and tensor metadata.

The website docs track the current exported Silk surface, not the entire ggml C
API. Upstream ggml is vendored from `ggml-org/ggml` at `v0.9.5`.

## Exported API

### Types

```silk
export type Type = i32;
```

ggml element type codes exported by the module:

- `TYPE_F32`
- `TYPE_F16`
- `TYPE_I32`
- `TYPE_I64`
- `TYPE_F64`
- `TYPE_BF16`

ggml execution status codes exported by the module:

- `STATUS_ALLOC_FAILED`
- `STATUS_FAILED`
- `STATUS_SUCCESS`
- `STATUS_ABORTED`

module error codes exported by the module:

- `ERR_INIT_FAILED`
- `ERR_INVALID_INPUT`
- `ERR_OUT_OF_MEMORY`
- `ERR_COMPUTE_FAILED`
- `ERR_ABORTED`

### Errors

```silk
export error GgmlFailed {
  code: i32,
}
```

`GgmlFailed.kind()` maps the raw `code` to the internal error kind family:

- `InitFailed`
- `InvalidInput`
- `OutOfMemory`
- `ComputeFailed`
- `Aborted`
- `Unknown`

### Result aliases

```silk
export type ContextResult = std::result::Result(Context, GgmlFailed);
export type TensorResult = std::result::Result(Tensor, GgmlFailed);
export type GraphResult = std::result::Result(Graph, GgmlFailed);
export type BoolResult = std::result::Result(bool, GgmlFailed);
export type F32Result = std::result::Result(f32, GgmlFailed);
export type IntResult = std::result::Result(i32, GgmlFailed);
export type I64Result = std::result::Result(i64, GgmlFailed);
export type U64Result = std::result::Result(u64, GgmlFailed);
```

### Structs

```silk
export struct Context { handle: u64 }
export struct Tensor { handle: u64 }
export struct Graph { ctx: u64, handle: u64 }
```

- `Context` owns the ggml allocation arena.
- `Tensor` is a non-owning handle tied to the context that created it.
- `Graph` is a non-owning compute graph handle tied to a context.

### Functions and methods

#### `Context`

```silk
public fn invalid () -> Context;
public fn is_valid (self: &Context) -> bool;
public fn init (mem_size: u64, mem_buffer: u64 = 0, no_alloc: bool = false) -> ContextResult;
public fn free (mut self: &Context) -> void;
public fn used_mem (self: &Context) -> U64Result;
public fn new_tensor_1d (self: &Context, ty: Type, ne0: i64) -> TensorResult;
public fn new_tensor_2d (self: &Context, ty: Type, ne0: i64, ne1: i64) -> TensorResult;
public fn add (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
public fn sub (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
public fn mul (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
public fn mul_mat (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
public fn new_graph (self: &Context) -> GraphResult;
```

- `invalid()` returns a zero-handle placeholder.
- `init(...)` creates a ggml context. `mem_size` must be non-zero.
- `free()` releases the ggml context and invalidates the handle.
- `used_mem()` reports ggml memory currently consumed inside the context.
- `new_tensor_1d(...)` and `new_tensor_2d(...)` allocate tensors inside the
  context.
- `add(...)`, `sub(...)`, `mul(...)`, and `mul_mat(...)` create derived tensor
  nodes in the same context.
- `new_graph()` allocates an empty graph associated with the context.

`Context` also implements `std::interfaces::Drop`, so `drop()` forwards to
`free()`.

#### `Tensor`

```silk
public fn invalid () -> Tensor;
public fn is_valid (self: &Tensor) -> bool;
public fn set_f32 (mut self: &Tensor, value: f32) -> BoolResult;
public fn set_f32_1d (mut self: &Tensor, i: i32, value: f32) -> BoolResult;
public fn get_f32_1d (self: &Tensor, i: i32) -> F32Result;
public fn nelements (self: &Tensor) -> I64Result;
public fn nbytes (self: &Tensor) -> U64Result;
public fn n_dims (self: &Tensor) -> IntResult;
public fn is_scalar (self: &Tensor) -> BoolResult;
public fn is_contiguous (self: &Tensor) -> BoolResult;
```

- `set_f32(...)` fills the tensor with one scalar value.
- `set_f32_1d(...)` writes one scalar element at index `i`.
- `get_f32_1d(...)` reads one scalar element at index `i`.
- `nelements()`, `nbytes()`, and `n_dims()` inspect tensor layout.
- `is_scalar()` and `is_contiguous()` expose ggml tensor predicates.

#### `Graph`

```silk
public fn invalid () -> Graph;
public fn is_valid (self: &Graph) -> bool;
public fn build_forward_expand (mut self: &Graph, t: &Tensor) -> BoolResult;
public fn compute (self: &Graph, n_threads: i32) -> BoolResult;
```

- `build_forward_expand(...)` adds the tensor computation rooted at `t` into the
  graph.
- `compute(...)` runs the graph on the CPU backend using `n_threads`.

## Examples

### Add two scalar tensors

```silk
import std::ggml;

fn main () -> int {
  let ctx = match std::ggml::Context.init(1024 * 1024) {
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

  _ = a.set_f32_1d(0, 2.0);
  _ = b.set_f32_1d(0, 3.0);

  let sum = match ctx.add(a, b) {
    Ok(v) => v,
    Err(_) => return 4,
  };

  let mut graph = match ctx.new_graph() {
    Ok(v) => v,
    Err(_) => return 5,
  };

  _ = graph.build_forward_expand(&sum);
  _ = graph.compute(1);

  let out = match sum.get_f32_1d(0) {
    Ok(v) => v,
    Err(_) => return 6,
  };

  return if out == 5.0 { 0 } else { 7 };
}
```

### Inspect a 2D tensor

```silk
import std::ggml;

fn main () -> int {
  let ctx = match std::ggml::Context.init(1024 * 1024) {
    Ok(v) => v,
    Err(_) => return 1,
  };

  let tensor = match ctx.new_tensor_2d(std::ggml::TYPE_F32, 4, 8) {
    Ok(v) => v,
    Err(_) => return 2,
  };

  let dims = match tensor.n_dims() {
    Ok(v) => v,
    Err(_) => return 3,
  };
  let elems = match tensor.nelements() {
    Ok(v) => v,
    Err(_) => return 4,
  };

  return if dims == 2 && elems == 32 { 0 } else { 5 };
}
```

## Considerations

- `std::ggml` is a hosted `linux/x86_64` surface in the current toolchain.
- Silk uses a scalar-slot ABI for structs. Small C structs passed by value are
  not always ABI-safe to call directly from Silk, so `std::ggml` relies on
  shim functions such as `silk_ggml_init`.
- ggml C APIs use C `int` / enum widths. The Silk wrapper therefore uses `i32`
  for ggml type codes, status codes, thread counts, and similar values.
- `Context` owns the backing ggml arena. `Tensor` and `Graph` handles become
  invalid once the owning context is freed or dropped.
- On the hosted baseline, `silk build` auto-links ggml when `std::ggml` is in
  the module set, or when linked `.o` / `.a` inputs reference `silk_ggml_init`.
- The toolchain expects vendored archives such as `libggml.a`,
  `libggml-base.a`, `libggml-cpu.a`, and `libsilk_ggml_shims.a` to be staged by
  `zig build deps`.

## See also

- `docs/compiler/vendored-deps.md`
- `docs/compiler/cli-silk.md`
- `docs/language/structs-impls-layout.md`
- `docs/std/interfaces.md`

## Design goals

- Provide a Silk-native wrapper over the hosted ggml baseline.
- Keep the public API small and predictable while preserving the core tensor and
  graph workflow.
- Hide ABI-unsafe C entrypoints behind stable shim functions where required.
