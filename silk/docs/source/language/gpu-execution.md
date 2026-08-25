# GPU execution placement

Silk functions run on the program's host CPU unless their declaration carries
the GPU placement attribute:

```silk
attr(device=gpu)
fn clear_tile () {
  return;
}
```

`device` is execution-placement metadata, not a conditional-compilation key.
`attr(device=gpu)` therefore keeps the declaration in the semantic program and
marks it for device compilation. This is distinct from `attr(target=...)`,
which enables or removes a declaration according to the current compilation
target.

## Host/device boundary

An `attr(device=gpu)` function is device code. A function satisfying the
launchable entry signature is a kernel entrypoint; other reachable GPU
functions are device helpers. Neither form is an ordinary host-callable
function:

- a host function launches it by name through `std::gpu::launch`,
- or a host function uses a checked `gpu (grid=..., workspace=...)` launch
 block and lets the compiler supply that lexical name,
- the launch supplies grid and work-group sizes,
- trailing launch arguments are packed as the kernel's explicit `u64`
 parameters in declaration order,
- a checked launch automatically calls `std::gpu::synchronize` before leaving
 the form and may return both launch/completion statuses as
 `std::gpu::DispatchResult`; manual launch calls require an explicit
 completion boundary,
- the compiler emits the kernel for the selected GPU target and omits it from
 host machine code,
- an ordinary Silk call from host code to a GPU function is invalid,
- a GPU function may directly call another suitable GPU function or an
 explicitly declared suitable `pure fn`.

An ordinary `pure fn` remains target-neutral and host-callable. When it is
reachable from a GPU kernel and fits the device subset, the compiler includes
its IR in the device call graph as well. An `attr(device=gpu)` helper remains
device-only. Runtime GPU code may not call `const fn`: const functions retain
their compile-time-only semantics, including for `const pure fn`. Device code
may use supported literals directly or receive a host-computed value as a
kernel parameter. Named scalar `const` materialization in device IR is outside
GPU v1; the compiler does not emit a runtime call to a `const fn`.

The portable GPU-v1 subset requires a launchable GPU entry to:

- be in the executable's root package,
- have a lexical name no longer than 255 UTF-8 bytes,
- be non-generic and use normal (not `async` or `task`) discipline,
- declare at most 32 immutable `u64` parameters, with no varargs or defaults,
 and declare no error results,
- return `void`.

The portable GPU-v1 device body supports immutable `bool`, `u32`, and `u64`
values, literals, casts and unsigned comparisons used in the supported
packed-`u32` graphs, scalar returns in helpers, direct calls, and the
target-neutral `std::gpu::device` global-index/load/store and boolean-to-`u64`
primitives. Executable graphs are no-op entries, one or more parameter-backed
stores at the global X index, and one or more parameter-backed unsigned `>=`
threshold classifications. A direct call through a module-scope function
`using` alias resolves to the target's lexical declaration before device IR is
emitted. Direct helper calls must resolve uniquely within the root package.
Reachable helpers must be explicitly `pure fn` or carry `attr(device=gpu)`, use
supported scalar signatures, and form an acyclic call graph. Low-level
`std::gpu::isa` calls remain available through the older target-specific source
path.

Device-operation selection follows ordinary binding resolution. Renaming a
named `std::gpu::device` import or qualifying it through a package alias does
not change its semantic operation. Conversely, a visible root-package helper
whose lexical name happens to be `global_id_x`, `load_u32`, `store_u32`, or
another device-operation spelling remains an ordinary helper call; its text
alone cannot turn it into a compiler intrinsic.

Every low-level `std::gpu::isa` instruction-helper operand is an unsigned
integer literal. In the standalone AMD source-intrinsic object path, the
compatibility `store_u32_at_global_x(base_address, value)` helper instead
requires two direct names of `u64` entry parameters. Mixed GPU-v1 device IR
accepts supported scalar expressions at the same compatibility call. For each
dispatched work item it writes the low 32 bits of `value` at
`base_address + global_id_x * 4`. The application must ensure that the buffer
contains at least `grid_size * 4` writable bytes. Processor support, operand
ranges, parameter use, and launch arity are checked by the compiler or runtime.
These restrictions produce a diagnostic at the rejected declaration,
statement, or launch. The compiler never falls back to emitting the function
for the CPU.

The older
`classify_u32_at_global_x(input_address, output_address, threshold)` helper
remains a compatibility operation. New code should compose `global_id_x`,
`load_u32`, ordinary Silk comparison/helper calls, and `store_u32` so the
algorithm is visible to target-neutral IR rather than named in a backend.

The implementation owns provider artifact metadata and launch packing:
application code passes ordinary `u64` values to `std::gpu::launch` and does not
construct a provider argument array or declare an ABI function. General
parameter types, address-space-aware pointer types, aggregates, floating point,
barriers, and other operations outside GPU v1 remain excluded. A runtime
`const fn` call remains invalid.

## Building a mixed executable

Mixed CPU/GPU output is selected independently for each side:

```text
silk build app.slk -o app \
  --target linux-x86_64 \
  --gpu-target amdgcn-amd-amdhsa-gfx1151
```

`--target` remains the host target. `--gpu-target` must name a supported AMDHSA
or NVIDIA PTX target. The GPU-v1 mixed path is supported for Linux x86_64
executables. Supplying `--gpu-target` for another host target or output kind is
an error. A source file containing `attr(device=gpu)` functions also requires a
GPU target when built as an executable.

The compiler emits one provider artifact per launchable GPU entry and appends
all artifacts to the host executable in a versioned Silk GPU bundle. AMD
artifacts are AMDHSA code objects; NVIDIA artifacts are null-terminated PTX.
Reachable helper functions participate in that entry's target-neutral device
IR and are not separately launchable merely because they are called. The native
loader ignores this non-loadable trailer. `std::gpu` validates and reads it from
the running executable, then asks the bundle's HIP or CUDA provider to load the
selected kernel. A malformed bundle, missing kernel, unavailable provider,
failed launch, or failed transfer is reported through an ordinary status code
and `std::gpu::last_error()`.

Application source remains pure Silk. The bundled standard-library runtime owns
the platform ABI boundary with HIP or the CUDA Driver API; application modules
do not declare `ext` symbols and the compiler does not invoke a C/C++ compiler,
HIP compiler, or CUDA compiler while lowering Silk kernels.

The `gpu` launch form is target-neutral syntax and does not expose that runtime
ABI. It checks the kernel declaration and arguments statically, then uses the
replaceable `std::gpu::launch_and_synchronize` implementation. Statement
position discards the returned `std::gpu::DispatchResult`; value position lets
the caller inspect `launch_status` and `synchronize_status` independently. It
returns only after synchronization and is valid in ordinary, async, and task
host functions; synchronization remains a blocking call in the executing host
context. The shipped runtime mutex protects process-global state and provider
calls when task-worker threads enter the API concurrently. Use separate manual
calls when GPU work should overlap with host work or diagnostic text must be
read between phases. See `gpu-launch-blocks.md` for the exact single-call
grammar and `--nostd` behavior.

## Data-producing program

```silk
import { Buffer, is_supported } from "std/gpu";
import { store_u32_at_global_x } from "std/gpu/device";

attr(device=gpu)
fn fill (output: u64, value: u64) {
  store_u32_at_global_x(output, value);
}

fn main () -> int {
  if !is_supported() {
    let gpu_unavailable: int = 77;
    return gpu_unavailable;
  }

  var output: Buffer = Buffer.alloc(16);
  if !output.is_valid() {
    return 1;
  }

  let dispatch = gpu (grid=4, workspace=4) {
    fill(output.address, 42);
  };
  if dispatch.launch_failed() || dispatch.synchronize_failed() {
    return 1;
  }

  return 0;
}
```

The maintained vector-fill example additionally downloads and verifies all
eight values. `examples/pure_silk_gpu_ml.slk` trains a one-dimensional
nearest-centroid threshold on the CPU, then uses portable index/load/store
primitives and ordinary Silk helper calls for batched GPU inference.
See [gpu](?p=std/gpu), [gpu device](?p=std/gpu-device), [gpu isa](?p=std/gpu-isa), and
[backend gpu](?p=compiler/backend-gpu) for the runtime API and implemented
device-operation/call-graph subset.
