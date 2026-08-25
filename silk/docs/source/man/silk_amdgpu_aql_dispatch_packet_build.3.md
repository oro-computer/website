# [`silk_amdgpu_aql_dispatch_packet_build(3)`](?p=man/silk_amdgpu_aql_dispatch_packet_build.3) — Serialize AMDGPU AQL Dispatch Packets

> NOTE: This is the Markdown source for the eventual man 3 page for the AMDGPU AQL packet helper. The roff-formatted manpage should be generated from this content.

## Name

`silk_amdgpu_aql_dispatch_packet_build` — serialize a validated HSA AQL kernel-dispatch packet.

## Synopsis

```c
#include <silk/silk.h>

#define SILK_AMDGPU_AQL_DISPATCH_PACKET_SIZE 64

typedef enum SilkAmdGpuAqlFenceScope {
  SILK_AMDGPU_AQL_FENCE_SCOPE_NONE = 0,
  SILK_AMDGPU_AQL_FENCE_SCOPE_AGENT = 1,
  SILK_AMDGPU_AQL_FENCE_SCOPE_SYSTEM = 2,
} SilkAmdGpuAqlFenceScope;

typedef struct SilkAmdGpuAqlDispatchPacketConfig {
  uint16_t dimensions;
  uint16_t workgroup_size_x;
  uint16_t workgroup_size_y;
  uint16_t workgroup_size_z;
  uint32_t grid_size_x;
  uint32_t grid_size_y;
  uint32_t grid_size_z;
  uint32_t private_segment_size;
  uint32_t group_segment_size;
  uint32_t max_flat_workgroup_size;
  uint64_t kernel_object;
  uint64_t kernarg_address;
  uint64_t completion_signal;
  uint8_t  barrier;
  int32_t  acquire_fence_scope;
  int32_t  release_fence_scope;
} SilkAmdGpuAqlDispatchPacketConfig;

bool silk_amdgpu_aql_dispatch_packet_build(
  const SilkAmdGpuAqlDispatchPacketConfig *config,
  uint8_t                                *out_packet);
```

## Description

`silk_amdgpu_aql_dispatch_packet_build` writes exactly 64 bytes to
`out_packet`, using the HSA AQL kernel-dispatch packet offsets used by the
Silk AMDGPU backend.

The input config uses ordinary host-endian integer fields. The output packet is
little-endian and ready for a caller-owned ROCR/HSA queue path after the caller
has loaded the code object, resolved the kernel object, prepared kernargs, and
allocated a completion signal.

## Validation

The function returns `false` when:

- `config` or `out_packet` is null,
- `dimensions` is not 1, 2, or 3,
- any workgroup or grid dimension is zero,
- a grid dimension is smaller than the matching workgroup dimension,
- unused dimensions are not set to 1,
- the flat work-group size is larger than `max_flat_workgroup_size`,
- or either fence scope is not `NONE`, `AGENT`, or `SYSTEM`.

Set `max_flat_workgroup_size` to zero to select the conservative default of
1024 work-items. Fence scopes are stored in fixed-width `int32_t` fields whose
values must be one of the `SilkAmdGpuAqlFenceScope` constants.

When `out_packet` is non-null, the function zeroes all 64 bytes before
validation. A failed call therefore does not leave stale packet bytes behind.
The helper is independent of `SilkCompiler` and does not update compiler
last-error state.

## See Also

- [`libsilk(7)`](?p=man/libsilk.7)
- [`silk_compiler(3)`](?p=man/silk_compiler.3)
- [backend amdgpu](?p=compiler/backend-amdgpu)
- [abi libsilk](?p=compiler/abi-libsilk)
