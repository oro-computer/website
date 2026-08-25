# `std::gpu`

`std::gpu` is the public host-side API for pure-Silk GPU discovery, device
memory, streams, kernel launch, and synchronization. GPU-v1 mixed Linux x86_64
executables use the provider recorded in their bundle: AMDHSA through HIP or
NVIDIA PTX through the CUDA Driver API. Importing the module adds no link-time
HIP or CUDA dependency.

## Exported API
- `is_supported() -> bool` returns whether the bundled provider runtime can be
 opened and reports at least one device. It does not pre-load every embedded
 target artifact; target/device compatibility is verified when a named kernel
 is loaded for launch.
- `device_count() -> int` returns the number of provider devices, or `0` when
 the provider is unavailable.
- `current_device() -> int` returns the selected zero-based device index, or
 `-1` when no device is selected.
- `select_device(index: int) -> int` selects one enumerated device for new
 allocations, default-stream launches, and device-wide synchronization.
- `last_error() -> string` returns the runtime's borrowed diagnostic text for
 the most recent failed operation on the current process. A later GPU
 operation may overwrite the borrowed text.
- `launch(kernel_name: string, grid_size: u64, workgroup_size: u64,
 ...args: u64) -> int` packs zero to 32 explicit `u64` kernel arguments,
 loads the named embedded kernel, validates the argument byte count recorded
 in the executable bundle, and enqueues a one-dimensional dispatch.
 `grid_size` is the total number of work items;
 `grid_size / workgroup_size` provider blocks are used. Both values must be nonzero,
 `grid_size` must be divisible by `workgroup_size`, and `workgroup_size` must
 not exceed 1024. `grid_size` must not exceed `4294967295`, and the resulting
 block count must not exceed `2147483647`. The divisibility contract prevents
 unrequested trailing work items from escaping the requested buffer bounds;
 the work-item and block limits give every advertised provider the same exact
 one-dimensional geometry range.
- `synchronize() -> int` waits for all previously submitted work on the
 selected device.
- `DispatchResult { launch_status: int, synchronize_status: int }` records the
 two independent statuses from one automatically completed dispatch.
 - `is_ok() -> bool` is true only when both statuses are zero.
 - `launch_failed() -> bool` is true when `launch_status` is nonzero.
 - `synchronize_failed() -> bool` is true when `synchronize_status` is
 nonzero.
- `launch_and_synchronize(kernel_name: string, grid_size: u64,
 workgroup_size: u64, ...args: u64) -> DispatchResult` calls `launch`, then
 calls `synchronize` exactly once even if launch failed, and returns both
 statuses. It is the public replaceable-stdlib operation behind checked `gpu`
 forms.
- `Buffer { address: u64, byte_len: u64, device_index: int }` owns a provider
 device allocation and records its creation device.
 - `Buffer.alloc(byte_len) -> Buffer` returns an invalid zero-address buffer on
 failure.
 - `is_valid() -> bool` reports whether the allocation succeeded.
 - `upload(host_address, byte_count) -> int` copies host memory to the start of
 the device allocation.
 - `download(host_address, byte_count) -> int` copies from the allocation to
 host memory.
 - `close() -> int` releases the allocation and invalidates the handle.
 - `drop()` atomically releases a still-live allocation on its creation device
 during scope cleanup without changing the caller's selected device.
- `Stream { handle: u64, device_index: int }` owns one provider stream on the
 device selected when it was created.
 - `Stream.create() -> Stream` returns an invalid stream on failure.
 - `is_valid() -> bool` reports whether the stream owns a runtime handle.
 - `synchronize() -> int` waits only for work in that stream.
 - `close() -> int` releases the stream and invalidates it.
 - `drop()` atomically releases a still-live stream on its creation device
 during scope cleanup without changing the caller's selected device.
- `launch_on(stream, kernel_name, grid_size, workgroup_size, ...args) -> int`
 enqueues through an owning stream without changing the packed kernel ABI.

All status-returning operations use `0` for success and a nonzero failure
status. Call `last_error()` for diagnostic text; programs must not parse that
text for control flow.

The language-level
`gpu (grid=..., workspace=...) { kernel(args...); }` form resolves and checks
`kernel` at compile time, then dispatches through this module's
`launch_and_synchronize` implementation. Statement position discards its
`DispatchResult`; value position returns that result so launch and completion
failure can independently affect control flow without repeating a kernel-name
string. Separate manual `launch` and `synchronize` calls remain supported for
overlap and phase-local `last_error()` access. The checked form does not replace
buffer ownership, discovery, or `last_error`.

`Buffer.upload_on(stream, host_address, byte_count)` and
`Buffer.download_on(stream, host_address, byte_count)` enqueue asynchronous
copies on a stream owned by the same device. The caller synchronizes that
stream before reusing host storage or observing downloaded bytes. Every
explicit-stream operation requires a live nonzero `Stream`; an invalid stream
returns a nonzero status and never falls back to the default stream.

`host_address` is an explicit raw address. A caller may obtain it with the
normal Silk raw conversion for an array, slice, or struct whose lifetime covers
the copy. A device buffer's `address` may be passed as a `u64` kernel argument.
The standard library packs arguments in declaration order, so applications do
not construct provider launch-argument memory or depend on a HIP/CUDA ABI.

## Launch lifecycle

1. Build the executable with `--gpu-target`.
2. Optionally call `is_supported()` to handle machines without the bundled
 provider runtime or any reported device. A target mismatch remains an
 observable launch failure rather than an availability skip.
3. Allocate/copy any device buffers.
4. Use a checked `gpu` value or call `launch_and_synchronize` when automatic
 completion and both statuses are wanted. For explicit overlap, call
 `launch` with the lexical kernel name and one trailing `u64` value per
 parameter.
5. After a manual launch, call `synchronize` before observing results or
 releasing resources used by the dispatch.

The runtime caches loaded modules/functions for the process lifetime. Buffer
ownership remains explicit and independent of that cache.

`DispatchResult` values are ordinary per-call values and remain stable when
other tasks use the GPU API. The initial bundled runtime state and
`last_error()` storage are process-global.
The shipped runtime serializes each public GPU operation with a process-wide
mutex, so launch blocks and manual calls may execute from multiple task-worker
threads without racing runtime initialization, allocation tracking, kernel
caching, or provider calls. Because launch and synchronization are distinct
operations, another task may submit work between them; synchronization waits
for all prior work on the selected device. The borrowed `last_error()` text may
still be overwritten after an operation returns, so programs must read it
before another task performs a GPU operation. Because automatic synchronization
is the later phase, `last_error()` after a checked block is not a durable copy
of an earlier launch diagnostic. Use `launch_status` for control flow; use the
separate manual calls when diagnostic text must be read between phases.

The shipped runtime accepts up to 64 reported provider devices and tracks up to
256 simultaneous live `Buffer` allocations, 128 streams, and 128 cached kernel
functions. Exceeding a bound returns a nonzero failure status and records a
diagnostic in `last_error()`.

## Errors and portability

The shipped runtime rejects non-Linux hosts, a missing or incomplete selected
HIP/CUDA provider library, no reported provider device, an executable without
a valid Silk GPU bundle, an unknown kernel name, a target artifact that the
selected device cannot load, invalid grid/work-group sizes,
copies larger than the owning buffer, cross-device resource use, a launch
argument byte count that does not match the kernel declaration, and errors
returned by provider operations.

An alternative `std::` package may implement this API using another runtime
without changing application imports. The compiler-owned bundle format and
`attr(device=gpu)` semantics remain the same.

See [gpu execution](?p=language/gpu-execution) for placement rules and
[gpu device](?p=std/gpu-device) for the semantic device-operation surface.
