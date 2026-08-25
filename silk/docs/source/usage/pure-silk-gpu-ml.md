# Pure-Silk learned-threshold GPU classifier

`examples/pure_silk_gpu_ml.slk` is a small but real supervised-learning
workflow. It uses a one-dimensional nearest-centroid model:

1. Class `0` training samples are `1, 2, 3, 4`; their integer centroid is `2`.
2. Class `1` training samples are `10, 11, 12, 13`; their integer centroid is
 `11`.
3. CPU training places the decision threshold midway between the centroids,
 rounded upward: `(2 + 11 + 1) / 2 == 7`.
4. GPU inference labels an input as class `1` when it is at least `7`, otherwise
 class `0`.

This is a learned model because the decision parameter is derived from labeled
training data rather than written as the classifier's answer. It is deliberately
small: the purpose is to expose the full host-training/device-inference data
flow without hiding it behind a framework.

The implementation stores each class's labeled samples in a public
`std::buffer::BufferU8`. Its CPU `centroid` routine loops over the supplied
buffer, so the fitting code consumes training collections rather than a
precomputed sum or a hard-coded threshold.

The CPU packs eight unseen `u32` inputs (`0, 5, 6, 7, 8, 9, 14, 20`) into a
host byte buffer, uploads them to a device buffer, and launches:

```silk
pure fn at_or_above_threshold (value: u64, threshold: u64) -> bool {
  return value >= threshold;
}

attr(device=gpu)
fn prediction_label (value: u64, threshold: u64) -> u64 {
  return bool_to_u64(at_or_above_threshold(value, threshold));
}

attr(device=gpu)
fn classify_batch (input: u64, output: u64, threshold: u64) {
  let index: u64 = global_id_x();
  let value: u64 = load_u32(input, index);
  let prediction: u64 = prediction_label(value, threshold);
  store_u32(output, index, prediction);
}
```

`std::gpu::launch` packs the two device addresses and learned threshold as
three `u64` arguments. Eight global work items load one packed input each,
compare it with the threshold, and store one packed `u32` prediction. After
synchronization, the CPU downloads and checks the expected labels.

This source intentionally uses ordinary Silk composition instead of the
compatibility `classify_u32_at_global_x` helper. `at_or_above_threshold` is a
target-neutral `pure fn`, so it is usable by host code and by a device call
graph. `prediction_label` is explicitly device-only and is not launchable
because it returns a value; `bool_to_u64` provides the portable device
conversion from its pure helper's boolean decision to label `0` or `1`.
`classify_batch` is the launchable `void`/`u64` entry. The compiler preserves
both calls in target-neutral device IR, represents global index/load/store and
the boolean conversion as semantic IR operations, and lets the selected AMD or
NVIDIA backend choose its verified threshold instruction sequence.

The source uses the public `std::buffer::BufferU8` surface and four byte pushes
to make the device helper's little-endian packed-`u32` contract visible. The
current byte-buffer API does not expose a general little-endian `u32` append
operation; importing the protobuf-specific fixed32 writer would obscure the
fact that this is a GPU data-layout boundary rather than a protobuf message.

Build and run on installed AMD hardware:

```text
make pure-silk-gpu-ml-check \
  PURE_SILK_GPU_TARGET=amdgcn-amd-amdhsa-gfx1151
```

Exit status `0` means training, inference, transfer, and verification passed.
Status `77` means the selected provider is unavailable or reports no device.
Status `1` means one of the training, allocation, transfer, launch,
synchronization, or verification steps failed, including a selected target
artifact that the device cannot load.

Run the same executable/runtime/bundle path without GPU hardware:

```text
make pure-silk-gpu-ml-fake-check
```

The test-only HIP provider simulates only device allocation, launch execution,
and copies. CPU training, Silk argument packing, executable-bundle parsing,
runtime arity validation, download, and prediction verification remain the real
paths.

`make pure-silk-gpu-ml-nvidia-fake-check` builds the identical source for
`nvptx64-nvidia-cuda-sm80` and validates PTX loading, stream-ordered transfers,
launch, synchronization, and predictions through the fake CUDA provider.
The opt-in installed-hardware equivalent is:

```text
make pure-silk-gpu-ml-check \
  PURE_SILK_GPU_TARGET=nvptx64-nvidia-cuda-sm80
```

The example is inference-oriented and does not claim general GPU training.
Floating-point models, gradient computation, reductions, general device
control flow, and non-`u64` kernel parameters remain part of the broader
Silk-IR-to-GPU work.
