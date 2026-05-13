# `std::ggml`

`std::ggml` exposes a small,
ABI-safe Silk wrapper over a pinned subset of upstream ggml. The current module
is intentionally narrow: it is meant to let Silk programs allocate ggml
contexts, build basic tensors and graphs, run simple CPU computations, and
inspect tensor metadata without dropping directly into raw C bindings.

Upstream:

- Repository: `ggml-org/ggml`
- Pinned version: `v0.9.5`

## What ships today

The currently exported `std::ggml` surface covers:

- context creation and destruction,
- 1-D and 2-D tensor allocation,
- elementwise `add`, `sub`, and `mul`,
- matrix multiply via `mul_mat`,
- graph creation, graph expansion, and CPU execution,
- tensor initialization and 1-D `f32` element reads,
- tensor metadata helpers (`nelements`, `nbytes`, `n_dims`,
 `is_scalar`, `is_contiguous`),
- structured wrapper errors and stable error-code constants.

This is not yet a full ggml binding layer. The module does not currently expose
the broad upstream tensor-op surface, backend-management APIs, or raw tensor
buffer accessors.

## Platform and linking

`std::ggml` is currently supported on the native hosted baselines:

- `linux/x86_64`
- `macos/aarch64` on Apple Silicon hosts

On those supported native hosts:

- `zig build deps` stages the required upstream archives and the Silk shim
 archive under `vendor/lib/<host-layout>/`,
- the deps workflow pins ggml to the current CPU-only bring-up configuration:
 `GGML_OPENMP=OFF`, `GGML_ACCELERATE=OFF`, `GGML_BLAS=OFF`, and
 `GGML_METAL=OFF`,
- `silk build` automatically links the staged ggml archives when
 `std::ggml` appears in the module set,
- `silk build` also auto-links ggml when linked `.o` / `.a` inputs reference
 `silk_ggml_init`, so downstream consumers do not need to import
 `std::ggml` just to satisfy runtime dependencies.

The current auto-linked archives are:

- `libggml.a`
- `libggml-base.a`
- `libggml-cpu.a`
- `libsilk_ggml_shims.a`

Because ggml is built as C++ on the hosted baseline, `silk build` also adds
the required host runtime link dependencies automatically:

- on `linux/x86_64`: `libstdc++.so.6`, `libgcc_s.so.1`, `libm.so.6`, and
 `libdl.so.2`,
- on `macos/aarch64`: `-lc++` for the native Mach-O host linker.

See also:

- [vendored deps](?p=compiler/vendored-deps)
- [cli silk](?p=compiler/cli-silk)
- [silk build.1](?p=man/silk-build.1)

## Quick Start Guide

On a supported native host, build the vendored ggml archives first, then build
and run the training example:

```sh
zig build deps
./zig-out/bin/silk build examples/std_ggml_train_linear.slk -o tmp/std_ggml_train_linear
./tmp/std_ggml_train_linear 25
```

Expected behavior:

- the program trains a one-neuron linear model over Celsius/Fahrenheit sample
 pairs,
- the forward pass is built and computed through `std::ggml`,
- analytical gradients are computed in Silk because the shipped wrapper does
 not expose ggml autograd yet,
- and the program prints both the rounded model prediction and the rounded
 reference value.

Useful guide queries:

```sh
silk guide "train ggml linear model"
silk guide "ggml celsius fahrenheit"
silk guide "std ggml platform linking"
```

## ABI and FFI notes

Two current compiler constraints shape this wrapper:

- Silk’s current hosted FFI surface does not expose ggml’s C `int` positions
 as C-width `int`, so `std::ggml` uses `i32` for ggml type codes, status
 codes, indices, and thread counts.
- ggml exposes some entrypoints that accept small structs by value, notably
 `ggml_init(struct ggml_init_params)`. The current Silk ABI subset cannot call
 those entrypoints directly in a layout-stable way.

To bridge that second gap, Silk ships `src/silk_ggml_shims.c`, which exposes a
small ABI-safe wrapper:

- `silk_ggml_init(mem_size, mem_buffer, no_alloc) -> u64`

`std::ggml::Context.init(...)` is therefore the supported way to enter ggml
from Silk code in the Supported forms.

## Ownership and lifetime

`std::ggml` uses lightweight handle wrappers:

- `Context` owns the upstream `ggml_context`.
- `Tensor` values are allocated from, and owned by, the `Context` that created
 them.
- `Graph` values are also allocated from, and owned by, the creating
 `Context`.

Implications:

- calling `Context.free()` (or `Context.drop()`) invalidates the context and
 all `Tensor` / `Graph` handles derived from it,
- `Tensor` and `Graph` do not implement `Drop`; their memory is reclaimed when
 the owning `Context` is freed,
- `Context.invalid()`, `Tensor.invalid()`, and `Graph.invalid()` provide
 explicit zero-handle sentinels for fallback paths.

## Error model

All fallible wrapper methods return `Result(..., GgmlFailed)`.

Public error-code constants:

- `ERR_INIT_FAILED`
- `ERR_INVALID_INPUT`
- `ERR_OUT_OF_MEMORY`
- `ERR_COMPUTE_FAILED`
- `ERR_ABORTED`

`GgmlFailed.kind()` maps those codes into stable semantic categories:

- `GgmlErrorKind::InitFailed`
- `GgmlErrorKind::InvalidInput`
- `GgmlErrorKind::OutOfMemory`
- `GgmlErrorKind::ComputeFailed`
- `GgmlErrorKind::Aborted`
- `GgmlErrorKind::Unknown`

Wrapper-level invalid-input checks are intentionally eager for obvious local
contract violations such as:

- zero-sized context allocations,
- negative dimensions,
- negative 1-D element indices,
- invalid handles,
- and non-positive graph thread counts.

## Exported API
```silk
module std::ggml;
type Type = i32;

let TYPE_F32: i32;
let TYPE_F16: i32;
let TYPE_I32: i32;
let TYPE_I64: i32;
let TYPE_F64: i32;
let TYPE_BF16: i32;

let STATUS_ALLOC_FAILED: i32;
let STATUS_FAILED: i32;
let STATUS_SUCCESS: i32;
let STATUS_ABORTED: i32;

let ERR_INIT_FAILED: i32;
let ERR_INVALID_INPUT: i32;
let ERR_OUT_OF_MEMORY: i32;
let ERR_COMPUTE_FAILED: i32;
let ERR_ABORTED: i32;

enum GgmlErrorKind {
  InitFailed,
  InvalidInput,
  OutOfMemory,
  ComputeFailed,
  Aborted,
  Unknown,
}

error GgmlFailed {
  code: i32,
}

impl GgmlFailed {
  public fn kind (self: &GgmlFailed) -> GgmlErrorKind;
}

type ContextResult = Result(Context, GgmlFailed);
type TensorResult = Result(Tensor, GgmlFailed);
type GraphResult = Result(Graph, GgmlFailed);
type BoolResult = Result(bool, GgmlFailed);
type F32Result = Result(f32, GgmlFailed);
type IntResult = Result(i32, GgmlFailed);
type I64Result = Result(i64, GgmlFailed);
type U64Result = Result(u64, GgmlFailed);

struct Context {
  handle: u64,
}

impl Context {
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
}

impl Context as std::interfaces::Drop {
  public fn drop (mut self: &Context) -> void;
}

struct Tensor {
  handle: u64,
}

impl Tensor {
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
}

struct Graph {
  ctx: u64,
  handle: u64,
}

impl Graph {
  public fn invalid () -> Graph;
  public fn is_valid (self: &Graph) -> bool;
  public fn build_forward_expand (mut self: &Graph, t: &Tensor) -> BoolResult;
  public fn compute (self: &Graph, n_threads: i32) -> BoolResult;
}
```

## API notes

### Type and status constants

- `Type` is the ggml element-type ABI width used by the current wrapper.
- `TYPE_*` constants mirror a small stable subset of upstream ggml type codes.
- `STATUS_*` constants reflect the hosted CPU graph-execution status values
 returned by `ggml_graph_compute_with_ctx(...)`.

### `Context`

- `Context.init(mem_size, mem_buffer = 0, no_alloc = false)` creates a ggml
 context.
- `mem_size` must be non-zero.
- `mem_buffer = 0` asks ggml to manage its own backing buffer.
- `no_alloc = true` forwards ggml’s “metadata only / do not allocate tensor
 data” behavior.
- `used_mem()` reports current context memory usage.
- `new_tensor_1d(...)` and `new_tensor_2d(...)` allocate tensors owned by the
 context.
- `add`, `sub`, `mul`, and `mul_mat` construct graph nodes in that context and
 return the resulting tensor handles.
- `new_graph()` allocates an empty graph owned by the context.
- `free()` is idempotent and invalidates the handle.
- `drop()` is equivalent to `free()`.

### `Tensor`

- `set_f32(value)` fills the entire tensor with one `f32` value.
- `set_f32_1d(i, value)` writes one flattened `f32` element by index.
- `get_f32_1d(i)` reads one flattened `f32` element by index.
- `nelements()` returns the flattened element count.
- `nbytes()` returns the byte size of the tensor storage.
- `n_dims()` returns the current tensor rank.
- `is_scalar()` reports ggml’s scalar classification for the current tensor.
- `is_contiguous()` reports whether the tensor data layout is contiguous.

### `Graph`

- `build_forward_expand(t)` appends the forward dependencies needed to compute
 `t`.
- `compute(n_threads)` runs the graph with the hosted CPU backend using the
 owning context for temporary allocations.
- `n_threads` must be positive.

## Example: elementwise graph

```silk
import ggml from "std/ggml";

fn main () -> int {
  let ctx = match std::ggml::Context.init(16 * 1024 * 1024) {
    Ok(v) => v,
    Err(_) => std::ggml::Context.invalid(),
  };
  if !ctx.is_valid() {
    return 1;
  }

  let mut a = match ctx.new_tensor_1d(std::ggml::TYPE_F32, 1) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  let mut b = match ctx.new_tensor_1d(std::ggml::TYPE_F32, 1) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  if !a.is_valid() || !b.is_valid() {
    ctx.free();
    return 2;
  }

  if a.set_f32_1d(0 as i32, 3.0).is_err() || b.set_f32_1d(0 as i32, 4.0).is_err() {
    ctx.free();
    return 3;
  }

  let out = match ctx.add(a, b) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  let mut g = match ctx.new_graph() {
    Ok(v) => v,
    Err(_) => std::ggml::Graph.invalid(),
  };
  if !out.is_valid() || !g.is_valid() {
    ctx.free();
    return 4;
  }

  if g.build_forward_expand(&out).is_err() || g.compute(1 as i32).is_err() {
    ctx.free();
    return 5;
  }

  let value = match out.get_f32_1d(0 as i32) {
    Ok(v) => v,
    Err(_) => -1.0,
  };
  ctx.free();
  return if value == 7.0 { 0 } else { 6 };
}
```

## Example: uniform matrix multiply

Because `Tensor.set_f32(...)` fills an entire tensor with one value, it is easy
to build a smoke-test matrix multiply with a predictable result:

```silk
import ggml from "std/ggml";

fn main () -> int {
  let ctx = match std::ggml::Context.init(16 * 1024 * 1024) {
    Ok(v) => v,
    Err(_) => std::ggml::Context.invalid(),
  };
  if !ctx.is_valid() {
    return 1;
  }

  let mut a = match ctx.new_tensor_2d(std::ggml::TYPE_F32, 2, 4) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  let mut b = match ctx.new_tensor_2d(std::ggml::TYPE_F32, 2, 3) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  if !a.is_valid() || !b.is_valid() {
    ctx.free();
    return 2;
  }

  if a.set_f32(2.0).is_err() || b.set_f32(3.0).is_err() {
    ctx.free();
    return 3;
  }

  let out = match ctx.mul_mat(a, b) {
    Ok(v) => v,
    Err(_) => std::ggml::Tensor.invalid(),
  };
  let mut g = match ctx.new_graph() {
    Ok(v) => v,
    Err(_) => std::ggml::Graph.invalid(),
  };
  if !out.is_valid() || !g.is_valid() {
    ctx.free();
    return 4;
  }

  if g.build_forward_expand(&out).is_err() || g.compute(1 as i32).is_err() {
    ctx.free();
    return 5;
  }

  let value = match out.get_f32_1d(0 as i32) {
    Ok(v) => v,
    Err(_) => -1.0,
  };
  ctx.free();
  return if value == 12.0 { 0 } else { 6 };
}
```

## Example: train and use a one-neuron model

The shipped wrapper still does not expose ggml autograd, so the canonical
training example uses ggml for the forward pass and computes gradients
analytically in Silk. See:

- `examples/std_ggml_train_linear.slk`

That example:

- trains a one-neuron model over recognizable Celsius/Fahrenheit sample pairs
 (`-40`, `0`, `10`, `21`, `37`, and `100` degrees Celsius),
- keeps ggml in the forward pass while computing gradients analytically in
 Silk,
- uses `std::args`, `std::flag`, and `std::io` for command-line parsing,
 help/usage output, and formatted stdout/stderr,
- accepts an optional integer Celsius positional argument from the command line
 (rejecting values outside the current `int` range as usage errors through
 `std::flag`),
- and prints a rounded Fahrenheit prediction plus the rounded reference value
 after training completes.

Build and run it with:

```sh
zig build deps
./zig-out/bin/silk build examples/std_ggml_train_linear.slk -o tmp/std_ggml_train_linear
./tmp/std_ggml_train_linear 25
```

The optional positional argument must be an integer Celsius value. `--help`
prints usage. Invalid inputs return usage status `64`; runtime/training
failures return status `1`.

## Verification status

The Silk compiler repository currently verifies `std::ggml` through:

- compile-only object builds,
- runnable CPU graph fixtures,
- a runnable training/inference example build,
- and object/archive downstream link tests that rely on ggml auto-linking.

See `src/tests.zig`, `tests/silk/pass_std_ggml*.slk`, and
`examples/std_ggml_train_linear.slk`.
