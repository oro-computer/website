# NVIDIA GPU backend

This document specifies Silk's NVIDIA provider for the target-neutral GPU-v1
contract in `backend-gpu.md`.

## Target and artifact

The initial target identity is:

- `nvptx64-nvidia-cuda-sm80` (aliases `nvptx64-sm80`, `cuda-sm80`, and
 `sm80`).

It selects the portable PTX ISA 7.0 / `sm_80` baseline. A CUDA driver may JIT
that PTX for a compatible Ampere or newer device. Additional NVIDIA processor
targets may be added without changing Silk source or device IR.

Silk emits null-terminated PTX text directly from `ir.Program`. Normal builds
do not invoke `nvcc`, clang, `ptxas`, or another compiler/assembler. The hosted
runtime passes the embedded PTX to `cuModuleLoadData`, resolves kernels with
`cuModuleGetFunction`, and launches them with `cuLaunchKernel`.

The PTX selector emits:

- `.visible .entry` definitions for launchable kernels;
- internal `.func` definitions for reachable helpers;
- `.param .u64` kernel ABI slots in declaration order;
- typed predicate, 32-bit, and 64-bit registers for GPU-v1 scalar values;
- labels and branches for target-neutral basic blocks;
- PTX integer arithmetic, logic, shifts, comparisons, casts, and calls; and
- compiler-owned global-id and indexed global-memory operations.

Provider/runtime errors remain ordinary `std::gpu` statuses. Application code
does not import CUDA declarations and checked `gpu` blocks do not expose PTX or
CUDA names.

## Embedded bundle identity

GPU bundle version 3 records a provider and target tag in addition to the
kernel entries. NVIDIA PTX entries use provider `cuda` and target tag `80`.
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
`std::gpu` therefore creates no link-time CUDA dependency.

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

The CUDA Driver API documents that `cuModuleLoadData` accepts PTX text and JITs
it for the current context. The PTX ISA specification is the normative source
for emitted instruction and function-call syntax.
