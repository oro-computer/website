---
layout: "docs"
description: "This document specifies Silk's NVIDIA provider for the target-neutral GPU-v1 contract in backend-gpu.md."
docsCollection: "silk"
section: "compiler"
order: 266
sourcePath: "compiler/backend-nvidia.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# NVIDIA GPU backend

This document specifies Silk's NVIDIA provider for the target-neutral GPU-v1
contract in [`backend-gpu.md`](/silk/docs/compiler/backend-gpu/).

## Target and artifact

The supported NVIDIA target identities are:

- `nvptx64-nvidia-cuda-sm80` (aliases `nvptx64-sm80`, `cuda-sm80`, and
 `sm80`), emitted as PTX ISA 7.0 / `sm_80`;
- `nvptx64-nvidia-cuda-sm90` (and matching short aliases), emitted as PTX ISA
 8.0 / `sm_90`;
- `nvptx64-nvidia-cuda-sm100`, emitted as PTX ISA 8.7 / `sm_100`;
- `nvptx64-nvidia-cuda-sm120`, emitted as PTX ISA 8.7 / `sm_120`; and
- `nvptx64-nvidia-cuda-sm121`, emitted as PTX ISA 8.8 / `sm_121`, the native
 target for NVIDIA GB10.

The `sm80` target remains the portable default used by the maintained hardware
gate. Higher targets allow explicit architecture selection without changing
Silk source or device IR.

Silk emits null-terminated PTX text directly from `ir.Program`. Normal builds
do not invoke `nvcc`, clang, `ptxas`, or another compiler/assembler. The hosted
runtime passes the embedded PTX to `cuModuleLoadData`, resolves kernels with
`cuModuleGetFunction`, and launches them with `cuLaunchKernel`.

The PTX selector emits:

- `.visible .entry` definitions for launchable kernels;
- internal `.func` definitions for reachable helpers;
- `.param .u64` kernel ABI slots in declaration order;
- typed predicate, integer, and floating-point registers for GPU-v1 scalar
 values;
- labels and branches for target-neutral basic blocks;
- PTX integer and floating-point arithmetic, numeric casts, logic, shifts,
 comparisons, and calls; and
- compiler-owned work-item/workgroup indexing, typed global/shared memory,
 workgroup barriers, and tensor-MMA fragment operations.

Every maintained NVIDIA target accepts mutable scalar locals, named scalar
constants, `f32`/`f64`, structured `if`/[`while`](/silk/wiki/language/flow-while/)/[`loop`](/silk/wiki/language/flow-loop/) control flow,
`break`/`continue`, and assertions. Device memory operations cover
`u32`/`u64`/`f32`/`f64`. Each module declares a 16 KiB statically allocated,
8-byte-aligned shared arena per workgroup; typed shared indices are element
indices into that one arena and must remain within it. The typed operations do
not create independent per-type address spaces: callers that use several
element widths must choose index ranges whose resulting byte ranges do not
overlap.

The typed `nvidia_mma_f32_m16n8k8_f16_d0` through `_d3` operations select
`mma.sync.aligned.m16n8k8.row.col.f32.f16.f16.f32`. Their three `u32` inputs
carry the lane's packed f16 A/B fragments, their four `f32` inputs carry the C
fragment, and each function returns the named D register. The selector requires
sm80 or newer and rejects the operation before artifact emission on an
ineligible processor.

Provider/runtime errors remain ordinary [`std::gpu`](/silk/docs/std/gpu/) statuses. Application code
does not import CUDA declarations and checked `gpu` blocks do not expose PTX or
CUDA names.

## Embedded bundle identity

GPU bundle version 3 records a provider and target tag in addition to the
kernel entries. NVIDIA PTX entries use provider `cuda` and target tags `80`,
`90`, `100`, `120`, or `121`.
AMDGPU entries use provider `hip` and retain their numeric GFX target tag. The
entry layout, lexical kernel name, explicit argument byte count, alignment,
length validation, and footer rules are shared.

The runtime reads the bundle identity before loading a provider library. A
CUDA bundle must never be offered to HIP and an AMDHSA object must never be
offered to CUDA.

## Runtime adapter

On Linux, the adapter dynamically opens `libcuda.so.1` (then `libcuda.so`),
initializes the driver, enumerates devices, retains a primary context for each
selected device, and resolves only the Driver API symbols it uses. Importing
[`std::gpu`](/silk/docs/std/gpu/) therefore creates no link-time CUDA dependency.

Allocations, streams, and cached modules/functions retain their owning device.
Operations validate handles and restore the selected device/context before
calling the driver. Public operations remain serialized by the GPU runtime
mutex, matching the HIP adapter's task-worker safety contract.

## Verification

The maintained verification includes:

- target parsing/listing and exact PTX text tests;
- bundle version/provider/target validation tests;
- a deterministic fake `libcuda` provider that executes the maintained vector,
 ML, multi-store, device-selection, stream, and status programs;
- bundle layout/provider/target byte checks plus invalid-device, cross-device
 handle, launch, stream, and synchronization failure tests; and
- compiler tests that inspect arithmetic, bitwise, shift, comparison, call,
 branch, memory, and return PTX selection without invoking an external tool.

Physical CUDA acceptance is exposed through
`make pure-silk-gpu-nvidia-check`, `make pure-silk-gpu-ml-nvidia-check`, and
`make pure-silk-gpu-nvidia-general-check`. The first two cover the portable
vector/ML paths. The third executes workgroup ids, mutable control flow, typed
global/shared `u64`/`f32`/`f64` memory, a barrier, floating-point arithmetic,
and tensor MMA in one complete 32-thread workgroup and verifies downloaded
bytes. Its `u64`, `f32`, and `f64` shared arrays occupy disjoint byte ranges in
the common shared arena. Failures use stable statuses: `10` allocation, `11`
launch, `12` synchronization, `13` host-result preparation, `14` download,
`20` integer bytes, `21` `f32` bytes, `22` tensor-MMA bytes, and `23` `f64`
bytes; the Make target translates each into an exact diagnostic. The gates
default to Silk-emitted `sm_80` PTX; setting
`SILK_NVIDIA_GPU_TARGET` selects another maintained architecture.

An unavailable provider or device reports status `77` and is a skip by
default; set `SILK_NVIDIA_REQUIRE=1` to make status `77` fail the target on a
designated NVIDIA runner. Required mode also requires an accessible NVIDIA
character-device pair (or the WSL `/dev/dxg` device), resolves the loaded driver
to a canonical filesystem path, and rejects the Silk compiler repository fake-provider root
even when it appears in `LD_LIBRARY_PATH`. Successful required-mode execution
is therefore the physical PTX JIT, launch, transfer, synchronization, and result
boundary; the fake-CUDA gates remain the deterministic regression contract and
verify that forced physical mode rejects their provider.

On GB10 systems, `nvptx64-nvidia-cuda-sm121` is the exact architecture target.
Set `SILK_NVIDIA_GPU_TARGET=nvptx64-nvidia-cuda-sm121` on all three physical
gates to validate exact-target PTX JIT and execution; the default `sm80` gate
remains the cross-generation baseline.

The CUDA Driver API documents that `cuModuleLoadData` accepts PTX text and JITs
it for the current context. The PTX ISA specification is the normative source
for emitted instruction and function-call syntax.
