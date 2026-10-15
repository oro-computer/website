---
layout: "docs"
description: "std::ggml exposes an ABI-safe, context-owned Silk wrapper over the pinned upstream ggml build. It covers the tensor operations needed by bounded encoder/JEPA inference and adapter training while keepi"
docsCollection: "silk"
section: "std"
order: 150
sourcePath: "std/ggml.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::ggml`](/silk/docs/std/ggml/)

[`std::ggml`](/silk/docs/std/ggml/) exposes
an ABI-safe, context-owned Silk wrapper over the pinned upstream ggml build. It
covers the tensor operations needed by bounded encoder/JEPA inference and
adapter training while keeping invalid shapes, ownership violations, missing
devices, and execution failures recoverable.

Upstream:

- Repository: `ggml-org/ggml`
- Pinned version: `v0.9.5`

## What ships today

The currently exported [`std::ggml`](/silk/docs/std/ggml/) surface covers:

- context creation and destruction with bounded context storage,
- 1-D through 4-D tensor allocation,
- elementwise `add`, `sub`, and `mul`,
- matrix multiply, scale, square, and sum graph nodes,
- row-wise LayerNorm with an explicit epsilon and exact-erf GELU,
- stable row-wise softmax, causal masking, and checked 2-D causal attention,
- checked reshape, bounded view, transpose, permute, and contiguous-copy nodes,
- forward and gradient graph construction, parameter/loss marking, gradient
 lookup, and reset,
- explicit AdamW moment/state construction and graph updates,
- deterministic single-thread CPU execution and explicit registered-device
 selection,
- tensor initialization and 1-D `f32` element reads,
- tensor metadata helpers (`element_type`, `dim`, `nelements`, `nbytes`, `n_dims`,
 `is_scalar`, `is_contiguous`),
- structured wrapper errors and stable error-code constants.

This is a maintained high-level subset, not a raw binding for every upstream
operator. Operations outside this documented surface still require a separate,
reviewed binding rather than an untyped FFI escape hatch.

## Platform and linking

[`std::ggml`](/silk/docs/std/ggml/) is currently supported on these hosted target layouts:

- `linux/x86_64` with glibc
- `linux/x86_64` with musl
- `linux/aarch64` with glibc
- `linux/aarch64` with musl
- `macos/aarch64` on Apple Silicon hosts

On those supported target layouts:

- `zig build deps` stages the required upstream archives and the Silk shim
 archive under [`vendor/lib/<target-layout>/`](https://github.com/oro-computer/silk/tree/master/vendor/lib/<target-layout>/),
- dependency archives target the portable CPU baseline, with host-native CPU
 tuning and optional x86 instruction extensions disabled. Shared CI caches
 and release archives must run on other machines of the same target layout,
- the deps workflow always builds the deterministic CPU backend and accepts
 `-Dggml-gpu=auto|cpu|metal|cuda|hip|vulkan`; `auto` selects Metal on native
 Apple Silicon or the first installed CUDA, HIP, or Vulkan toolchain on native
 glibc Linux x86_64, selects CUDA when its toolkit is installed on native
 glibc Linux AArch64, and otherwise retains CPU,
- CUDA/HIP builders may pass `-Dggml-gpu-architectures=<cmake-list>` when the
 build environment cannot discover the deployment GPU architecture,
- an explicit GPU mode fails on an incompatible target or missing build/runtime
 prerequisite; it never silently produces CPU-only archives,
- `silk build` automatically links the staged ggml archives when
 [`std::ggml`](/silk/docs/std/ggml/) appears in the module set,
- `silk build` also auto-links ggml when linked `.o` / `.a` inputs reference
 `silk_ggml_init`, so downstream consumers do not need to import
 [`std::ggml`](/silk/docs/std/ggml/) just to satisfy runtime dependencies.

The staged `ggml-backend.manifest` is the authoritative record of the selected
backend and its final-link requirements. The compiler validates it and adds the
backend archive plus Metal frameworks or Linux provider libraries/search paths
to every final native link. A CPU manifest registers no accelerator. Metal,
CUDA, HIP, and Vulkan manifests register the corresponding upstream backend;
the actual device count can still be zero when no compatible or accessible
hardware is present, in which case selection returns
`GgmlErrorKind::DeviceUnavailable`.

Legacy manifest-free staging is valid only for the core/base/CPU/shim archive
set. A staged accelerator archive without the manifest is an incomplete
toolchain installation and is rejected at link planning; it is never silently
treated as CPU-only.

The always auto-linked archives are:

- `libggml.a`
- `libggml-base.a`
- `libggml-cpu.a`
- `libsilk_ggml_shims.a`

An accelerator build also auto-links exactly one of:

- `libggml-metal.a`
- `libggml-cuda.a`
- `libggml-hip.a`
- `libggml-vulkan.a`

Because ggml is built as C++ on the hosted baseline, `silk build` also adds
the required host runtime link dependencies automatically:

- on `linux/x86_64` glibc: `libstdc++.so.6`, `libgcc_s.so.1`,
 `libm.so.6`, `libdl.so.2`, and the toolchain's `libc_nonshared.a` when a
 selected static backend references a glibc nonshared wrapper such as
 `atexit`,
- on `linux/aarch64` glibc: the target-matched forms of the same C++, GCC,
 math, dynamic-loader, and `libc_nonshared.a` providers, plus static
 `libgcc.a` for GCC's outlined AArch64 atomic helpers,
- on Linux x86_64 or AArch64 with musl: `libstdc++.so.6`, `libgcc_s.so.1`,
 and musl's unified `libc.so` for math and dynamic-loader APIs,
- on `macos/aarch64`: `-lc++` for the native Mach-O host linker, plus `-lobjc`
 when the configured Metal archive contributes Objective-C objects.

CUDA/HIP/Vulkan configurations additionally link the provider libraries and
runtime search directories recorded during dependency configuration. Metal
adds `Foundation`, `Metal`, `MetalKit`, and the Objective-C runtime. GPU modes
are not supported for the musl layout because the supported provider SDKs
target glibc.

GPU backend archives may contain allocatable sections whose names are specific
to their compiler or runtime, including HIP fatbins and registration records.
Silk's ELF linker classifies loadable data from the ELF section type and flags,
not from a fixed section-name allowlist, while continuing to reject executable
or thread-local sections from the data layout. On Linux AArch64, selected ELF
preinit/init-array entries execute before the Silk process entry point so CUDA
fatbin and C++ static registration complete before [`std::ggml`](/silk/docs/std/ggml/) enumerates
backends.

For NVIDIA GB10, configure the CUDA backend and its exact architecture, then
run the required physical-device acceptance gate:

```sh
zig build deps -Dggml-gpu=cuda -Dggml-gpu-architectures=121
make build
SILK_GGML_NVIDIA_REQUIRE=1 make std-ggml-nvidia-check
```

The gate requires a staged CUDA manifest and at least one accessible ggml
accelerator. It executes the maintained JEPA/LoRA accelerator graph, restores
and resumes its checkpoint and AdamW state, and compares the complete result
with deterministic CPU execution. Exit status `77` means the CUDA backend or
physical device is unavailable; required mode reports that as a failure rather
than accepting the fixture's portable CPU fallback.

See also:

- [builtin deps](/silk/docs/compiler/builtin-deps/)
- [cli silk](/silk/docs/compiler/cli-silk/)
- [silk build.1](/silk/docs/man/silk-build.1/)

## Quick Start Guide

On a supported native target layout, build the built-in ggml archives first,
then build and run the training example:

```sh
zig build deps
./zig-out/bin/silk build examples/std_ggml_train_linear.slk -o tmp/std_ggml_train_linear
./tmp/std_ggml_train_linear 25
```

Expected behavior:

- the program trains a one-neuron linear model over Celsius/Fahrenheit sample
 pairs,
- the forward pass is built and computed through [`std::ggml`](/silk/docs/std/ggml/),
- the introductory example continues to compute its one-neuron analytical
 gradients in Silk for readability; maintained graph autograd and AdamW state
 are covered by the JEPA/LoRA regression described below,
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
 as C-width `int`, so [`std::ggml`](/silk/docs/std/ggml/) uses `i32` for ggml type codes, status
 codes, indices, and thread counts.
- ggml exposes some entrypoints that accept small structs by value, notably
 `ggml_init(struct ggml_init_params)`. The current Silk ABI subset cannot call
 those entrypoints directly in a layout-stable way.

To bridge that second gap and prevent upstream assertions from becoming the
public error model, Silk ships [`src/silk_ggml_shims.c`](https://github.com/oro-computer/silk/blob/master/src/silk_ggml_shims.c). The shim owns the raw
context, associates its host storage with ggml's backend-copy interface,
validates shape-sensitive operations, and adapts by-value or backend APIs to
integer handles.

- `silk_ggml_init(mem_size, mem_buffer, no_alloc) -> u64`

[`std::ggml::Context.init(...)`](/silk/docs/std/ggml/) is therefore the supported way to enter ggml
from Silk code in the Supported forms.

## Ownership and lifetime

[`std::ggml`](/silk/docs/std/ggml/) uses lightweight handle wrappers:

- `Context` owns the upstream context and its host-backend mapping.
- `Tensor` records the creating context handle. Every context operation rejects
 a tensor from another context before calling ggml.
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

All fallible wrapper methods return [`std::result::Result(..., GgmlFailed)`](/silk/docs/std/result/).

Public error-code constants:

- `ERR_INIT_FAILED`
- `ERR_INVALID_INPUT`
- `ERR_OUT_OF_MEMORY`
- `ERR_COMPUTE_FAILED`
- `ERR_ABORTED`
- `ERR_UNSUPPORTED`
- `ERR_DEVICE_UNAVAILABLE`

`GgmlFailed.kind()` maps those codes into stable semantic categories:

- `GgmlErrorKind::InitFailed`
- `GgmlErrorKind::InvalidInput`
- `GgmlErrorKind::OutOfMemory`
- `GgmlErrorKind::ComputeFailed`
- `GgmlErrorKind::Aborted`
- `GgmlErrorKind::Unsupported`
- `GgmlErrorKind::DeviceUnavailable`
- `GgmlErrorKind::Unknown`

Wrapper-level invalid-input checks are intentionally eager for obvious local
contract violations such as:

- zero-sized context allocations,
- non-positive dimensions and out-of-range flattened element indices,
- reshape element-count mismatches, non-contiguous reshape inputs, view ranges
 outside the source storage, or repeated/out-of-range permutation axes,
- non-`f32` inputs to the maintained numerical/training subset,
- non-positive or non-finite normalization and optimizer epsilon values,
- cross-context tensor/graph composition,
- invalid handles,
- and non-positive graph thread counts.

## Numerical, shape, and ownership policy

- `layer_norm(input, epsilon)` normalizes each `ne0` row with upstream
 `ggml_norm`. `epsilon` must be finite and greater than zero; the documented
 default is `1e-5`.
- `gelu(input)` uses the upstream exact-erf GELU operation. `softmax(input)` is
 the stable row-wise upstream softmax implementation.
- `causal_attention(query, key, value, scale, n_past)` is the checked 2-D
 composition `softmax(causal_mask(scale * key^T * query))`, followed by the
 value projection. Query/key layout is `[head_width, tokens]`; value layout is
 `[key_tokens, value_width]`; the result is `[value_width, query_tokens]`.
- Reshape requires a contiguous input and an identical positive element count.
 Views are aliases owned by the same context. `view_1d` and `view_2d` accept a
 byte offset aligned to `f32`, preserve the source 2-D row stride, reject
 overlapping 2-D rows, and reject any addressed byte outside the source
 allocation. `contiguous` materializes a distinct contiguous graph result.
 For `permute(input, a0, a1, a2, a3)`, each `aN` names the destination axis
 for input axis `N`; all four destinations must be unique values in `0..3`.
- The maintained numerical, autograd, and AdamW subset requires `TYPE_F32`.
 Basic allocation and metadata inspection retain the other documented type
 tags.
- Row-wise elementwise, reduction, normalization, activation, and softmax
 operations require storage whose `ne0` elements are contiguous. `scale` and
 causal masking require fully contiguous storage, and matrix multiplication
 rejects a transposed left operand as required by the pinned backend. These
 layout violations are recoverable invalid-input errors; call `contiguous`
 after a view, transpose, or permutation when materialization is required.
- Context storage is the hard allocation bound. Graph construction returns an
 allocation error when the bounded context cannot hold another object; callers
 choose the bound through `Context.init(mem_size, ...)`.

## Autograd and resumable AdamW state

Training graphs are explicit:

1. Mark each trainable `TYPE_F32` tensor with `mark_parameter()`.
2. Construct a scalar loss and mark it with `mark_loss()`.
3. Create `new_training_graph()`, expand the loss, then call
 `build_backward_expand()`.
4. Retrieve parameter gradients with `gradient(parameter)` and execute the
 graph.

The pinned ggml backward engine supports this maintained differentiable subset:
`add`, `sub`, `mul`, `mul_mat`, `scale`, `square`, `sum`, `contiguous`, reshape,
view, permute, transpose, causal masking, and softmax. A training graph that
requires a derivative for another operator returns
`GgmlErrorKind::Unsupported` during backward expansion. Unsupported operators
may still appear in a frozen feature branch that does not depend on a marked
parameter. Encoder LayerNorm and exact-erf GELU are therefore frozen feature
operations for the current PEFT contract; trainable LoRA parameters compose
through the supported matrix/arithmetic subset. This avoids claiming
gradients that pinned ggml does not implement.

`AdamWState` owns two context tensors (`first_moment` and `second_moment`) plus
the last committed integer step. `Context.new_adamw_state(parameter)` requires
a tensor already marked by `mark_parameter()` and allocates zeroed moment
tensors with its exact shape. `state.update(...)` constructs an AdamW graph
node using `state.step + 1`; after the graph computes successfully, call
`state.commit()` exactly once. A failed compute must not be committed. This
split lets multiple adapter parameters add their update nodes to one graph and
commit together after successful execution.

The complete resumable state is therefore the public `step` plus the flattened
`f32` contents of both moment tensors. `get_f32_1d` and `set_f32_1d` are the
snapshot/restore primitives. Restoring those values into a same-shaped state
and restoring `step` reproduces the next update without process-global state.
AdamW uses decoupled weight decay and caller-supplied finite `learning_rate`,
`beta1`, `beta2`, `epsilon`, and `weight_decay`; both beta values must be in
`[0, 1)`, epsilon must be positive, and step must not overflow.

## Execution devices and determinism

`Graph.compute_deterministic()` is the normative reproducibility path and runs
the CPU graph with exactly one worker thread. `Graph.compute(n_threads)` keeps
the explicitly parallel CPU path. `device_count(kind)` reports registered
devices, and `Graph.compute_on(DeviceSelection, n_threads)` selects one by its
zero-based index within that kind. `AnyAccelerator` includes GPU, integrated GPU,
and accelerator device classes but never CPU. The thread count controls CPU
execution; selected non-CPU backends own their internal scheduling, although
the argument must remain positive for a uniform checked call contract.

Selected-device execution copies the bounded host graph to the chosen backend,
checks every node for backend support, computes it, synchronizes, and copies
results and mutable optimizer state back before returning. Missing devices and
unsupported operations are recoverable errors. Accelerator floating-point
results may differ by normal backend rounding; callers requiring parity must
compare against frozen deterministic-CPU fixtures using an application-chosen
tolerance.

The maintained closure regression applies that policy to both inference and
training. When an accelerator is registered, it executes the same bounded LoRA
autograd plus AdamW graph as the one-thread CPU path, snapshots the first-step
parameters, moments, and step counters, restores them into independent state,
and executes the second step on both continued and restored graphs. Both
accelerator results must agree with each other and with deterministic CPU for
all adapter parameters and both moment tensors. Optimizer steps are committed
only after each device compute succeeds. A CPU-only or hardware-inaccessible
build instead verifies the recoverable unavailable-device result; it is not
counted as hardware parity execution.

## Exported API
```silk
module std::ggml;

import std::result;

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
let ERR_UNSUPPORTED: i32;
let ERR_DEVICE_UNAVAILABLE: i32;

enum GgmlErrorKind {
  InitFailed,
  InvalidInput,
  OutOfMemory,
  ComputeFailed,
  Aborted,
  Unsupported,
  DeviceUnavailable,
  Unknown,
}

enum DeviceKind {
  CPU,
  GPU,
  IntegratedGPU,
  Accelerator,
  AnyAccelerator,
}

struct DeviceSelection {
  kind: DeviceKind,
  index: i64,
}

impl DeviceSelection {
  public fn cpu () -> DeviceSelection;
  public fn accelerator (index: i64 = 0) -> DeviceSelection;
}

struct AdamWConfig {
  learning_rate: f32,
  beta1: f32,
  beta2: f32,
  epsilon: f32,
  weight_decay: f32,
}

impl AdamWConfig {
  public fn defaults () -> AdamWConfig;
}

error GgmlFailed {
  code: i32,
}

impl GgmlFailed {
  public fn kind (self: &GgmlFailed) -> GgmlErrorKind;
}

type ContextResult = std::result::Result(Context, GgmlFailed);
type TensorResult = std::result::Result(Tensor, GgmlFailed);
type GraphResult = std::result::Result(Graph, GgmlFailed);
type AdamWStateResult = std::result::Result(AdamWState, GgmlFailed);
type BoolResult = std::result::Result(bool, GgmlFailed);
type F32Result = std::result::Result(f32, GgmlFailed);
type IntResult = std::result::Result(i32, GgmlFailed);
type I64Result = std::result::Result(i64, GgmlFailed);
type U64Result = std::result::Result(u64, GgmlFailed);

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
  public fn new_tensor_3d (self: &Context, ty: Type, ne0: i64, ne1: i64, ne2: i64) -> TensorResult;
  public fn new_tensor_4d (self: &Context, ty: Type, ne0: i64, ne1: i64, ne2: i64, ne3: i64) -> TensorResult;
  public fn add (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
  public fn sub (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
  public fn mul (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
  public fn mul_mat (self: &Context, a: Tensor, b: Tensor) -> TensorResult;
  public fn scale (self: &Context, input: Tensor, factor: f32) -> TensorResult;
  public fn square (self: &Context, input: Tensor) -> TensorResult;
  public fn sum (self: &Context, input: Tensor) -> TensorResult;
  public fn layer_norm (self: &Context, input: Tensor, epsilon: f32 = 0.00001) -> TensorResult;
  public fn gelu (self: &Context, input: Tensor) -> TensorResult;
  public fn softmax (self: &Context, input: Tensor) -> TensorResult;
  public fn causal_mask (self: &Context, input: Tensor, n_past: i32 = 0) -> TensorResult;
  public fn causal_attention (self: &Context, query: Tensor, key: Tensor, value: Tensor, scale: f32, n_past: i32 = 0) -> TensorResult;
  public fn reshape_1d (self: &Context, input: Tensor, ne0: i64) -> TensorResult;
  public fn reshape_2d (self: &Context, input: Tensor, ne0: i64, ne1: i64) -> TensorResult;
  public fn reshape_3d (self: &Context, input: Tensor, ne0: i64, ne1: i64, ne2: i64) -> TensorResult;
  public fn reshape_4d (self: &Context, input: Tensor, ne0: i64, ne1: i64, ne2: i64, ne3: i64) -> TensorResult;
  public fn view_1d (self: &Context, input: Tensor, ne0: i64, offset_bytes: u64 = 0) -> TensorResult;
  public fn view_2d (self: &Context, input: Tensor, ne0: i64, ne1: i64, offset_bytes: u64 = 0) -> TensorResult;
  public fn transpose (self: &Context, input: Tensor) -> TensorResult;
  public fn permute (self: &Context, input: Tensor, axis0: i32, axis1: i32, axis2: i32, axis3: i32) -> TensorResult;
  public fn contiguous (self: &Context, input: Tensor) -> TensorResult;
  public fn new_graph (self: &Context) -> GraphResult;
  public fn new_training_graph (self: &Context) -> GraphResult;
  public fn new_adamw_state (self: &Context, parameter: Tensor) -> AdamWStateResult;
}

impl Context as std::interfaces::Drop {
  public fn drop (mut self: &Context) -> void;
}

struct Tensor {
  ctx: u64,
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
  public fn dim (self: &Tensor, axis: i32) -> I64Result;
  public fn element_type (self: &Tensor) -> IntResult;
  public fn is_scalar (self: &Tensor) -> BoolResult;
  public fn is_contiguous (self: &Tensor) -> BoolResult;
  public fn mark_parameter (mut self: &Tensor) -> BoolResult;
  public fn mark_loss (mut self: &Tensor) -> BoolResult;
}

struct Graph {
  ctx: u64,
  handle: u64,
  training: bool,
  backward_built: bool,
}

impl Graph {
  public fn invalid () -> Graph;
  public fn is_valid (self: &Graph) -> bool;
  public fn build_forward_expand (mut self: &Graph, t: &Tensor) -> BoolResult;
  public fn build_backward_expand (mut self: &Graph) -> BoolResult;
  public fn gradient (self: &Graph, parameter: &Tensor) -> TensorResult;
  public fn reset_gradients (mut self: &Graph) -> BoolResult;
  public fn compute (self: &Graph, n_threads: i32) -> BoolResult;
  public fn compute_deterministic (self: &Graph) -> BoolResult;
  public fn compute_on (self: &Graph, device: DeviceSelection, n_threads: i32 = 1) -> BoolResult;
}

struct AdamWState {
  first_moment: Tensor,
  second_moment: Tensor,
  step: i64,
}

impl AdamWState {
  public fn update (self: &AdamWState, context: &Context, parameter: Tensor, gradient: Tensor, config: AdamWConfig) -> TensorResult;
  public fn commit (mut self: &AdamWState) -> BoolResult;
}

fn device_count (kind: DeviceKind) -> I64Result;
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
- `new_tensor_1d(...)` through `new_tensor_4d(...)` allocate positive-sized
 tensors owned by the context.
- Every graph constructor validates context ownership. Shape-sensitive
 constructors additionally validate the rules in the numerical policy above.
- `new_graph()` allocates a forward graph; `new_training_graph()` allocates the
 gradient tables required by `build_backward_expand()`.
- `new_adamw_state(parameter)` allocates zeroed, same-shaped first and second
 moment tensors for a marked parameter.
- `free()` is idempotent and invalidates the handle.
- `drop()` is equivalent to `free()`.

### `Tensor`

- `set_f32(value)` fills the entire tensor with one `f32` value.
- `set_f32_1d(i, value)` writes one flattened `f32` element by index.
- `get_f32_1d(i)` reads one flattened `f32` element by index.
- `nelements()` returns the flattened element count.
- `nbytes()` returns the byte size of the tensor storage.
- `n_dims()` returns the current tensor rank.
- `dim(axis)` returns one of the four logical dimensions; axes outside `0..3`
 are invalid.
- `element_type()` returns the tensor's `TYPE_*` tag.
- `is_scalar()` reports ggml’s scalar classification for the current tensor.
- `is_contiguous()` reports whether the tensor data layout is contiguous.
- `mark_parameter()` accepts only contiguous `TYPE_F32` tensors.
- `mark_loss()` accepts only scalar `TYPE_F32` tensors.

### `Graph`

- `build_forward_expand(t)` appends the forward dependencies needed to compute
 `t`.
- `build_backward_expand()` requires a training graph containing at least one
 marked parameter and one marked loss. `gradient(parameter)` becomes valid
 after that expansion.
- `reset_gradients()` zeros ordinary gradients and any optimizer momenta already
 present in that graph, then resets each marked loss gradient to one. Call it
 after backward expansion and before adding explicit `AdamWState` update nodes
 when moment state must be preserved.
- `compute(n_threads)` runs the graph with the hosted CPU backend using the
 owning context for temporary allocations.
- `compute_deterministic()` is equivalent to the normative one-thread CPU
 execution. `compute_on(...)` follows the device contract above.
- Thread counts must be positive.

## Example: elementwise graph

```silk
import std::ggml;

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
import std::ggml;

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

The introductory training example uses ggml for the forward pass and computes
the one-neuron derivative analytically in Silk so its arithmetic stays visible.
The maintained autograd and AdamW surfaces are exercised by the bounded JEPA
regression. See:

- [`examples/std_ggml_train_linear.slk`](https://github.com/oro-computer/silk/blob/master/examples/std_ggml_train_linear.slk)

That example:

- trains a one-neuron model over recognizable Celsius/Fahrenheit sample pairs
 (`-40`, `0`, `10`, `21`, `37`, and `100` degrees Celsius),
- keeps ggml in the forward pass while computing gradients analytically in
 Silk,
- uses [`std::args`](/silk/docs/std/args/), [`std::flag`](/silk/docs/std/flag/), and [`std::io`](/silk/docs/std/io/) for command-line parsing,
 help/usage output, and formatted stdout/stderr,
- accepts an optional integer Celsius positional argument from the command line
 (rejecting values outside the current `int` range as usage errors through
 [`std::flag`](/silk/docs/std/flag/)),
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

The Silk compiler repository currently verifies [`std::ggml`](/silk/docs/std/ggml/) through:

- compile-only object builds,
- runnable CPU graph fixtures,
- a bounded JEPA encoder fixture covering LayerNorm, causal attention, residual
 and GELU feed-forward paths, reshape/view/transpose/permute, frozen CPU
 values, autograd, resumable AdamW state, and second-step accelerator parity
 for all LoRA parameters and first/second moments,
- registered-device selection, including recoverable absence in a CPU or
 hardware-inaccessible build and CPU/GPU parity execution when a configured
 backend exposes an accessible device,
- strict CPU/Metal/CUDA/HIP/Vulkan backend-manifest regressions, including
 backend/archive/provider/framework mismatches and GPU-toolchain ELF fatbin
 and registration-section classification,
- a runnable training/inference example build,
- and executable, shared-library, `silk test`, object, and downstream static
 archive link tests that rely on ggml auto-linking.

See [`src/tests.zig`](https://github.com/oro-computer/silk/blob/master/src/tests.zig), [`tests/silk/pass_std_ggml*.slk`](https://github.com/oro-computer/silk/blob/master/tests/silk/pass_std_ggml*.slk), and
[`examples/std_ggml_train_linear.slk`](https://github.com/oro-computer/silk/blob/master/examples/std_ggml_train_linear.slk).
