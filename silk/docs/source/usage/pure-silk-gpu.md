# Pure-Silk CPU/GPU program

The following workflow keeps application code entirely in Silk. `main` and
ordinary functions compile for the host CPU; `attr(device=gpu)` functions are
compiled into target GPU artifacts embedded in the same executable.

```silk
import { Buffer, DispatchResult, is_supported } from "std/gpu";
import { store_u32_at_global_x } from "std/gpu/device";
import { BufferU8 } from "std/buffer";

attr(device=gpu)
fn fill_u32 (output: u64, value: u64) {
  store_u32_at_global_x(output, value);
}

fn main () -> int {
  if !is_supported() {
    let gpu_unavailable: int = 77;
    return gpu_unavailable;
  }

  let element_count: u64 = 8;
  let byte_count: u64 = element_count * 4;
  var output: Buffer = Buffer.alloc(byte_count);
  if !output.is_valid() {
    return 1;
  }

  var host_bytes: BufferU8 = BufferU8.empty();
  var byte_index: int = 0;
  while byte_index < byte_count as int {
    if host_bytes.push(0) != None {
      return 1;
    }
    byte_index = byte_index + 1;
  }

  let expected: u64 = 305419896;
  let dispatch: DispatchResult = gpu (grid=element_count, workspace=4) {
    fill_u32(output.address, expected);
  };
  if dispatch.launch_failed() || dispatch.synchronize_failed() {
    return 1;
  }
  if output.download(host_bytes.as_bytes().ptr, byte_count) != 0 {
    return 1;
  }

  var element_index: int = 0;
  while element_index < element_count as int {
    let offset: i64 = (element_index as i64) * 4;
    if host_bytes.get(offset) != 120 ||
      host_bytes.get(offset + 1) != 86 ||
      host_bytes.get(offset + 2) != 52 ||
      host_bytes.get(offset + 3) != 18 {
      return 1;
    }
    element_index = element_index + 1;
  }

  return 0;
}
```

Build it for the host and an advertised GPU target. For example, AMD `gfx1151`:

```text
silk build example.slk -o example \
  --target linux-x86_64 \
  --gpu-target amdgcn-amd-amdhsa-gfx1151
```

Run `./example`. Exit status `0` means the embedded kernel accepted two packed
arguments, filled eight `u32` elements, and the CPU verified all downloaded
bytes. Status `77` means the selected provider or GPU device is not available.
Other nonzero statuses are application failures; inspect
`std::gpu::last_error()` when a runtime diagnostic is wanted.

The `gpu` expression resolves `fill_u32` and checks its arguments at compile
time, then calls the replaceable `std::gpu::launch_and_synchronize`
implementation. Its `DispatchResult` preserves launch and synchronization
statuses independently, so this example handles either failure without a
kernel-name string. A bare statement remains valid and discards the result. Use
the separate manual launch and synchronization APIs when GPU work should
overlap with host work or diagnostic text must be read between phases;
`examples/pure_silk_gpu_ml.slk` intentionally retains that convention so both
forms remain demonstrated and tested.

From a compiler checkout, the equivalent maintained workflow is:

```text
make pure-silk-gpu-check \
  PURE_SILK_GPU_TARGET=amdgcn-amd-amdhsa-gfx1151
```

The target always verifies compilation and bundle creation. It treats status
`77` as a hardware/runtime skip and otherwise requires the data round trip and
CPU verification to succeed.

Default repository tests also run `make pure-silk-gpu-fake-check` on Linux
x86_64. That path loads a test-only HIP provider beneath the real bundled
runtime, so executable-bundle parsing, packed argument validation, launch,
copy-back, and CPU verification remain covered on CI hosts without GPU
hardware.

The same source builds for NVIDIA `sm80` with
`--gpu-target nvptx64-nvidia-cuda-sm80`. The deterministic
`make pure-silk-gpu-nvidia-fake-check` target validates the CUDA Driver API
adapter without requiring GPU hardware. `silk build --list-gpu-targets` prints
all canonical mixed-executable GPU targets and their providers.

On installed NVIDIA `sm80` hardware, the maintained hardware check is the same
command with the NVIDIA target selected:

```text
make pure-silk-gpu-check \
  PURE_SILK_GPU_TARGET=nvptx64-nvidia-cuda-sm80
```

For AMD, use the target reported by `rocminfo` or the corresponding supported
target from `silk build --list-gpu-targets`. Current AMD processors are
`gfx942`, `gfx1100`, and `gfx1151`.

The current useful portable device-body surface provides global-X indexing,
packed indexed `u32` load/store, boolean-to-`u64` conversion, immutable scalar
locals, comparisons, and direct calls to eligible pure/device helpers. The
older `std::gpu::device::store_u32_at_global_x` remains a concise compatibility
operation. GPU entries may declare up to 32 immutable `u64` parameters, and
`std::gpu::launch` automatically packs the same number of trailing values. The
compiler and embedded bundle own the provider layout; application code does not
declare HIP/CUDA functions or pack argument bytes.

General parameter types, mutable device locals, named constants,
address-space-aware device pointer types, structured device control flow,
floating point, aggregates, and general arithmetic remain outside portable GPU
v1. Low-level AMD instruction work remains available separately through the
standalone `std::gpu::isa` source-kernel path.
