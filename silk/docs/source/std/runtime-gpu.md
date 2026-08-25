# `std::runtime::gpu`

`std::runtime::gpu` is the internal swappable runtime interface beneath
`std::gpu`. It forwards to bundled `silk_rt_gpu_*` functions on the hosted Linux
baseline and is not the preferred application import.

The module exposes exact low-level operations for runtime availability, the
last-error pointer, device enumeration/selection, device allocation/free,
bounded host/device copies, owning streams, one-dimensional default-stream or
explicit-stream kernel launch with a packed explicit-kernarg address and byte
length, and device/stream synchronization. All addresses, handles, and sizes
use `u64`; indexes and status values use `int`, with zero meaning success for
status-returning operations.

Owner-aware allocation and stream release operations are reserved for
`std::gpu` scope cleanup. They hold the runtime mutex while temporarily
selecting a resource's creation device, releasing it, and restoring the prior
selection. Explicit public `Buffer.close()` and `Stream.close()` continue to
reject cross-device use so mistakes remain observable.

The operations whose names end in `_on` require a nonzero tracked stream
handle. Zero is reserved for internal calls to the separate default-stream
operations; passing an invalid public `Stream` to an explicit-stream operation
returns an invalid-argument status and cannot silently submit default-stream
work.

The launch shim compares the packed byte length with the selected executable
bundle entry before calling HIP or CUDA through its packed launch convention.
A zero-argument kernel uses a null address and zero length. The public
`std::gpu::launch` wrapper creates and releases the temporary pack, so
application code does not handle this runtime contract directly.

Before provider entry, the shim requires a nonzero grid and workgroup, a
workgroup no larger than 1024, exact grid divisibility, at most `4294967295`
work items, and at most `2147483647` provider blocks. The common block ceiling
keeps accepted one-dimensional launch geometry portable across HIP and CUDA.

Runtime initialization, allocation tracking, kernel caching, and last-error
text are process-global. Allocations, streams, and kernel-cache entries retain
their owning provider device. The bundled runtime
serializes each public GPU operation with a process-wide mutex, so calls from
different task-worker threads cannot race those tables, provider operations, or the
error buffer. Launch and synchronize remain separate operations: calls from
multiple tasks may interleave between them, and device synchronization waits
for all prior work on the selected device. The borrowed last-error text remains
process-global and may be replaced by a later completed operation.

The hosted implementation accepts at most 64 reported devices and tracks at
most 256 live allocations, 128 live streams, and 128 cached kernel functions.
Capacity failures are ordinary nonzero statuses with a `last_error` diagnostic.

The bundled implementation is entered through `src/silk_rt_gpu.c`; the
provider-neutral implementation lives in `src/silk_rt_gpu_provider.c`. It
validates the Silk GPU bundle at the end of `/proc/self/exe` before selecting a
provider. HIP bundles dynamically load `libamdhip64.so` and load AMDHSA objects
with `hipModuleLoadData`; CUDA bundles dynamically load `libcuda.so.1` and load
Silk-emitted PTX with `cuModuleLoadData`. Only required provider symbols are
resolved. Neither compile time nor application runtime invokes `hipcc`,
`nvcc`, clang, or a system compiler.

Alternate standard-library packages may replace this module while retaining
the public `std::gpu` contract.
