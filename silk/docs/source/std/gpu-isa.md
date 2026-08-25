# `std::gpu::isa`

`std::gpu::isa` is the typed Silk spelling of the initial dependency-light
AMDGPU instruction subset. It exists for kernel bring-up while ordinary Silk
expressions are connected to the general GPU selector. Applications import this
module instead of declaring compiler intrinsics with `ext`.

These functions may be called only inside `attr(device=gpu)` bodies and every
argument must be an unsigned integer literal. Arguments name physical scalar or
vector registers and byte offsets. They are not ordinary host operations.

The module's internal `__silk_amdgpu_*` declarations are compiler-owned device
intrinsics only in this module. The same raw declarations remain available for
the documented standalone `--nostd --kind object --target amdgcn-...`
compatibility path; applications should prefer these typed wrappers whenever
the call is part of a mixed host/device Silk program.

## Common helpers

- `s_add_i32(dst, src0, src1)`
- `s_mov_b64(dst_pair_start, src_pair_start)`
- `s_waitcnt_vmcnt0_expcnt0_lgkmcnt0()`
- `v_add_f32(dst, src0, src1)`
- `v_mul_f32(dst, src0, src1)`
- `v_fma_f32(dst, src0, src1, src2)`
- `ds_write_b32(address, data, byte_offset)`
- `ds_read_b32(dst, address, byte_offset)`
- `global_load_dword(dst, address_pair_start)`
- `global_store_dword(address_pair_start, data)`

## Target-specific helpers

- `s_waitcnt_vscnt0()` is available on `gfx1100` and `gfx1151` and rejected on
 `gfx942`.
- `mfma_f32_16x16x16_f16(acc_dst_start, src_a_pair_start,
 src_b_pair_start, acc_src_start)` is available on `gfx942` and rejected on
 the current GFX11 targets.

The compiler accounts for every referenced register in kernel metadata and
enables LDS metadata when a DS helper is used. It inserts the processor-specific
program terminator when the source body does not end with `return;`.

This module is deliberately explicit about its low-level nature. New general
language behavior belongs in the Silk IR-to-AMDGPU selector, not in a growing
collection of opaque pseudo-builtins.
