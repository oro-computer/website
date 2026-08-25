# Target-neutral GPU compilation

This document defines the shared compiler contract between Silk source and
processor-specific GPU backends. AMDGPU is the first consumer; the GPU-v1
closure adds an NVIDIA PTX consumer. Both consume the same device IR and must
not introduce separate source-language dialects.

## Pipeline

GPU compilation has four layers:

1. The front end parses and checks ordinary Silk functions, execution
 placement, purity, types, and calls.
2. `src/lower_gpu_ir.zig` discovers the call graph reachable from each
 launchable kernel and lowers it to the existing target-neutral `ir.Program`
 representation.
3. A target selector consumes `ir.Program` and chooses processor instructions.
 `src/backend_amdgpu.zig` selects native AMDGCN instructions and
 `src/backend_nvidia.zig` selects NVIDIA PTX.
4. A target artifact writer and runtime adapter package and launch the
 resulting kernel. AMD uses AMDHSA code objects and HIP; NVIDIA uses PTX and
 the CUDA Driver API. Neither changes Silk device source or device-IR
 eligibility rules.

## GPU v1 closure contract

GPU v1 is the finite portable language and runtime surface that works on every
advertised GPU provider. It includes:

- one-dimensional grids and workgroups;
- `void` kernel entries with zero to 32 immutable `u64` ABI slots;
- `bool`, `u32`, and `u64` helper parameters, immutable locals, and scalar
 helper results;
- integer and boolean literals, integer casts, and unsigned comparisons used
 in the executable graphs below;
- direct acyclic calls to eligible `pure fn` and `attr(device=gpu)` helpers;
- compiler-owned global-X indexing, packed `u32` loads/stores, and boolean to
 `u64` conversion;
- no-op entries, one or more stores at `global_id_x()` whose base and stored
 value originate from entry parameters, and one or more unsigned `>=`
 threshold-classification stores whose input, output, and threshold originate
 from entry parameters; and
- blocking checked dispatch plus manual device, stream, launch, transfer, and
 synchronization operations.

Helper calls may carry these executable graphs across function boundaries.
Both AMD and NVIDIA selectors accept this complete portable set. A selector
may implement additional target-specific scalar IR, but that extension does
not expand the portable source contract.

Mutable device locals, named constants, general arithmetic and control flow,
aggregates, recursion, indirect/dynamic calls, floating point, vendor-specific
matrix instructions, shared-memory allocation, barriers, and arbitrary
address-space pointer arithmetic are not portable GPU-v1 constructs. The
target-specific `std::gpu::isa` escape hatch may expose selected operations
without expanding the portable contract. Unsupported programs report the exact
lowering or selector limitation and do not produce an invalid GPU artifact.

AST nodes must not flow directly into a production GPU instruction encoder once
an operation is supported by device IR. Target-specific instruction helpers in
`std::gpu::isa` remain an explicitly low-level escape hatch and are outside the
portable device-IR subset.

## Kernels and device helpers

A launchable kernel is an `attr(device=gpu)` function satisfying the current
entry ABI: normal discipline, `void` result, and at most 32 immutable `u64`
parameters without defaults, varargs, or typed errors. Its name is available to
`std::gpu::launch`.

The host-side `gpu (grid=..., workspace=...) { kernel(args...); }` form
resolves that entry declaration during checking and desugars through the same
replaceable `std::gpu::launch_and_synchronize` implementation with a
compiler-derived lexical name. That operation launches, synchronizes exactly
once, and returns both phase statuses in `std::gpu::DispatchResult`; statement
position discards it. This front-end desugaring and its eligibility rules are
shared by every GPU backend; an AMD or NVIDIA selector must not define a
target-specific launch syntax. The separate manual launch and synchronization
APIs remain part of the public runtime surface. A backend runtime used from task
functions must protect its process-global loader, allocation, kernel-cache, and
error state against concurrent host threads; the shipped provider adapter
serializes each public operation with a process-wide mutex.

A kernel may directly call:

- another `attr(device=gpu)` function whose signature and body fit the current
 device-IR subset; or
- an explicitly declared `pure fn` whose signature and reachable body fit the
 same subset.

An `attr(device=gpu)` callee is device-only and remains invalid in host code. A
`pure fn` is target-neutral: it may still be called on the CPU, and a separate
copy of its reachable IR participates in the GPU program. The initial lowering
requires direct, uniquely resolvable root-package functions. Module-scope
function `using` aliases are canonicalized to their lexical target before the
IR call edge is emitted. Indirect calls, ambiguous names, dependency-package
helper bodies, and recursion are rejected with a diagnostic at the call edge.
Imported `std::gpu::device` operations carry their resolved semantic identity
through named-import aliases, package aliases, and local `using` aliases.
Operation selection never reserves the corresponding bare identifier: a
visible root-package function with the same spelling lowers as an ordinary
call.

`const fn` retains its language-wide compile-time-only meaning. Device code may
use a value produced by a successfully evaluated const expression, but a
runtime call to a `const fn` is invalid on the GPU for the same reason it is
invalid on the CPU. `const pure fn` does not mean “runtime device function”;
use `pure fn` or `attr(device=gpu)` for that purpose.

The GPU-v1 device lowerer accepts literals and runtime scalar parameters. Named
scalar `const` bindings, including values initialized by a `const fn` call, are
outside this versioned subset. Write the folded literal in the device body or
pass the value as a kernel parameter, as the learned-threshold example does.

## Portable device operations

The initial semantic operations are:

- `std::gpu::device::global_id_x() -> u64`
- `std::gpu::device::load_u32(base_address: u64, index: u64) -> u64`
- `std::gpu::device::store_u32(base_address: u64, index: u64,
 value: u64) -> void`
- `std::gpu::device::bool_to_u64(value: bool) -> u64`

They lower to compiler-owned semantic extern entries in `ir.Program`. These
entries are never linker imports. A GPU selector must consume them or reject
the program; it must not leave an unresolved runtime symbol.

`load_u32` and `store_u32` address packed elements at
`base_address + index * 4`. Loads zero-extend the packed value to `u64`; stores
write the low 32 bits. Bounds are a caller/kernel contract until typed device
slices are implemented.

`bool_to_u64` maps `false` to `0` and `true` to `1`. It is a portable device
operation rather than an algorithm-specific operation. It keeps this initial
device subset explicit while general Silk numeric casts continue to exclude
`bool`.

The first straight-line device-IR subset also accepts:

- scalar `bool`, `u32`, and `u64` parameters, results, and immutable locals;
- integer and boolean literals;
- integer casts and unsigned comparisons;
- direct calls within the validated device call graph; and
- `return` plus expression statements for semantic stores.

## Target independence and NVIDIA

The following are shared and must remain outside any AMD- or NVIDIA-specific
module:

- function eligibility and call-graph validation;
- recursion detection;
- source-to-`ir.Program` lowering;
- scalar/device-operation semantics;
- diagnostics for unsupported source constructs; and
- tests that inspect target-neutral IR.

The following belong to a target backend:

- instruction selection and register allocation;
- processor feature validation;
- kernel ABI metadata and hidden dispatch inputs;
- code-object/container emission; and
- runtime loading and launch integration.

NVIDIA support consists of a target identity, an IR-to-PTX selector, a
provider-tagged bundle entry, and a CUDA Driver API adapter. It must not require
rewriting an ordinary portable GPU kernel or adding classifier-specific
compiler helpers. The CUDA driver accepts null-terminated PTX through
`cuModuleLoadData`; Silk therefore emits PTX itself and never invokes `nvcc`,
clang, or an external assembler.

## Provider selector boundaries

The AMDGPU consumer selects the complete portable executable graph set. It can
emit multiple recognized stores in one kernel and follows direct helper calls
while building each graph. The NVIDIA PTX consumer selects that same set and a
straight-line scalar superset from device IR, including integer arithmetic,
bitwise operations, shifts, comparisons, branches, and calls. Programs that
use that superset are NVIDIA-target-specific until AMD instruction selection
implements the same IR.

General mutable locals, structured source control flow, named scalar constants,
floating point, aggregates, typed address spaces/slices, barriers, recursion,
dynamic dispatch, and indirect calls remain outside portable GPU v1.
