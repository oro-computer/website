# AMDGPU Backend

This document specifies the initial AMD GPU backend surface for Silk. The
backend is implemented in Zig and emits AMDHSA code-object bytes directly from
Silk-owned data structures. It must not depend on LLVM libraries, clang, HIP,
or another external compiler/runtime toolchain for normal artifact generation.

## Targets

The recognized AMDGPU target identities are:

- `amdgcn-amd-amdhsa-gfx942` - CDNA3 / Instinct MI300-family baseline.
- `amdgcn-amd-amdhsa-gfx1100` - RDNA3 / Radeon client baseline.
- `amdgcn-amd-amdhsa-gfx1151` - RDNA3.5 / Ryzen AI Max Radeon 8060S
 source-kernel baseline.

Common aliases accepted by the target parser may include `gfx942`, `gfx1100`,
`gfx1151`, `amdgcn-gfx942`, `amdgcn-gfx1100`, `amdgcn-gfx1151`,
`amdgcn-amd-amdhsa--gfx942`, `amdgcn-amd-amdhsa--gfx1100`, and
`amdgcn-amd-amdhsa--gfx1151`. These targets expose
`OS_PLATFORM == "amdhsa"`, `OS_ARCH == "amdgcn"`, and are not POSIX or UNIX
process targets.

Inside AMDHSA code-object metadata, the backend emits the canonical target
names `amdgcn-amd-amdhsa--gfx942`, `amdgcn-amd-amdhsa--gfx1100`, and
`amdgcn-amd-amdhsa--gfx1151`. The double hyphen is intentional: it represents
the empty target-triple environment field before the target ID.

The first public build path is intentionally narrow:

```sh
silk build --kind object --target amdgcn-amd-amdhsa-gfx942 kernel.slk -o kernel.hsaco
```

For this initial source-kernel path, the input must contain exactly one exported
root-package function. The function may declare up to 32 immutable `u64`
parameters without defaults or varargs; it must have no result value, error
result, or generics and must use normal function discipline. The body may be
empty, may contain only supported compiler-backed GPU call statements, and may
end with `return;`. The compiler emits an AMDHSA code object named after that
function with descriptor symbol `kernel_name.kd`; it appends or lowers
`s_endpgm` termination itself.

The pure-Silk application path is a mixed host/device executable:

```sh
silk build app.slk -o app \
  --target linux-x86_64 \
  --gpu-target amdgcn-amd-amdhsa-gfx1151
```

Launchable functions annotated with `attr(device=gpu)` are compiled as AMDHSA
kernels and omitted from the host machine code. An annotated non-entry function
may instead be a device-only helper reachable from a launchable kernel. The
root package may contain multiple entries; each becomes a separate code object
in the executable's versioned Silk GPU bundle. Ordinary functions, including
`main`, continue through the host backend. Explicitly pure functions may be
used by both host and device call graphs. The application launches an entry by
using the checked, target-neutral `gpu` launch form or by passing its
lexical function name through the manual `std::gpu::launch` API. The checked
form uses `std::gpu::launch_and_synchronize` and returns both phase statuses;
the manual API keeps launch and completion separate.

Bundle version 3 stores the HIP provider identity, selected processor tag, and
a counted sequence of name/explicit-kernarg-size/code-object entries. Every
code-object payload begins at an 8-byte-aligned offset, and a trailing length
plus `SLKGPEND` footer lets the runtime locate and bounds-check the bundle from
the end of the executable. The shared layout is specified in
[backend gpu](?p=compiler/backend-gpu) and also carries CUDA/PTX bundles.

The initial mixed path supports Linux x86_64 executable output and `void`
kernels with up to 32 immutable `u64` parameters. Each entry and its eligible
`pure fn` or `attr(device=gpu)` helper graph lower through the target-neutral
device IR specified in `backend-gpu.md`. Pure-Silk applications import semantic
operations from `std::gpu::device`. The lower-level `std::gpu::isa` surface
remains available to the standalone target-specific source-kernel path for
literal physical-register work. The compiler recognizes both typed stdlib
surfaces after ordinary resolver/checker validation.

`std::gpu` owns runtime discovery, buffers, launch, and synchronization. For an
AMDGPU bundle its provider adapter dynamically loads HIP and reads the embedded
code-object entries. Artifact generation remains Silk-owned and never invokes
`hipcc`, clang, or a C compiler.

For multi-module builds, kernel discovery follows the same root-package rule as
other non-executable outputs: exactly one exported function in the root package
is used as the AMDGPU kernel. Exported functions in dependency packages do not
count as additional kernels and are not emitted as kernel descriptor symbols.

The low-level source intrinsics are declared as ordinary Silk `ext` functions so the
existing checker validates call arity and argument types before AMDGPU lowering.
There are two deliberately distinct checking contexts:

- declarations owned by `std::gpu::isa` are compiler-classified device
 intrinsics, so the exported typed wrappers can be called only from
 `attr(device=gpu)` bodies; and
- declarations written directly in a standalone `--nostd --kind object`
 source remain part of the compatibility source-kernel subset below. Their
 exported kernel does not require `attr(device=gpu)`, because the selected
 `amdgcn-...` object target already supplies the device compilation context.

The reserved name prefix alone does not turn an arbitrary application `ext`
declaration into a device-only checker binding. Module ownership and the
selected backend path establish which of these two contracts applies.
The common declarations are:

```silk
ext __silk_amdgpu_s_add_i32 = fn (int, int, int) -> void;
ext __silk_amdgpu_s_mov_b64 = fn (int, int) -> void;
ext __silk_amdgpu_s_waitcnt_vmcnt0_expcnt0_lgkmcnt0 = fn () -> void;
ext __silk_amdgpu_v_add_f32 = fn (int, int, int) -> void;
ext __silk_amdgpu_v_mul_f32 = fn (int, int, int) -> void;
ext __silk_amdgpu_v_fma_f32 = fn (int, int, int, int) -> void;
ext __silk_amdgpu_global_load_dword = fn (int, int) -> void;
ext __silk_amdgpu_global_store_dword = fn (int, int) -> void;
ext __silk_amdgpu_ds_write_b32 = fn (int, int, int) -> void;
ext __silk_amdgpu_ds_read_b32 = fn (int, int, int) -> void;
```

Add this declaration only for `gfx942` kernels that use the first CDNA3 MFMA
helper:

```silk
ext __silk_amdgpu_mfma_f32_16x16x16_f16 = fn (int, int, int, int) -> void;
```

Add this declaration only for `gfx1100` or `gfx1151` kernels that need the
GFX10+ VSCNT wait helper:

```silk
ext __silk_amdgpu_s_waitcnt_vscnt0 = fn () -> void;
```

A minimal `gfx942` kernel can then use the common declarations directly:

```silk
export fn kernel_name () {
  __silk_amdgpu_v_add_f32(0, 1, 2);
  __silk_amdgpu_s_waitcnt_vmcnt0_expcnt0_lgkmcnt0();
}
```

These `ext` declarations are compile-time AMDGPU source intrinsics in this path;
they do not become imported runtime calls in the emitted `.hsaco`. Intrinsic
arguments must be unsigned integer literals. General Silk expressions,
variables, loops, branches, and arbitrary calls are intentionally outside this
standalone compatibility path. Mixed CPU/GPU executables use the completed
target-neutral GPU-v1 lowering described in `backend-gpu.md` instead.

The intended workflow for this slice is:

1. Choose the processor target explicitly. Use `amdgcn-amd-amdhsa-gfx942` for
 CDNA3/MI300-family code objects, `amdgcn-amd-amdhsa-gfx1100` for the RDNA3
 baseline, and `amdgcn-amd-amdhsa-gfx1151` for the Ryzen AI Max Radeon 8060S
 source-kernel baseline.
2. Declare only the source intrinsics used by the kernel as `ext` functions.
 The common, `gfx942`, `gfx1100`, and `gfx1151` signatures above are the
 canonical declaration sets; shorter local declaration sets are encouraged
 for real kernels.
3. Build with `--nostd --kind object --target <amdgpu-target>` when the source
 is a standalone GPU kernel file:

   ```sh
   silk build --nostd --kind object --target amdgcn-amd-amdhsa-gfx942 kernel.slk -o kernel.hsaco
   ```

4. Inspect the generated code object with host tooling when available:

   ```sh
   readelf -h -S -n kernel.hsaco
   ```

5. Load and dispatch the object through a ROCR/HSA runtime path. The compiler
 currently emits `.hsaco` bytes and provides the tested AQL packet serializer;
 it does not yet create HSA queues or ring doorbells from the CLI. On a host
 with an accessible ROCR runtime and compatible GPU agent, use the opt-in
 load check:

   ```sh
   AMDGPU_TARGET=amdgcn-amd-amdhsa-gfx1151 make amdgpu-rocr-check
   ```

The generated AMDHSA metadata uses the exported Silk function name as the kernel
name and emits `<kernel>.kd` as the descriptor symbol. The backend appends the
processor-specific `s_endpgm`; user source should not declare or call an
end-program intrinsic. For source-intrinsic kernels, `.sgpr_count` and
`.vgpr_count` are derived from the highest SGPR/VGPR referenced by the emitted
intrinsics instead of from conservative encoder defaults. The effective
SGPR metadata count is raised to at least 40 on `gfx942` and at least 34 on
`gfx1100` / `gfx1151` to match the processor-specific Code Object V6 hidden
dispatch SGPR setup emitted by ROCm 7.2.4. Source kernels that do not emit LDS
instructions report `.group_segment_fixed_size: 0`; the current
source-intrinsic LDS helpers reserve the documented 16 KiB LDS budget.

Common authoring failures are reported with specific diagnostics:

- `AMDGPU source kernel parameters must be immutable u64 values`: change the
 initial subset's parameters to plain `name: u64` declarations and pass one
 trailing `u64` value per parameter to `std::gpu::launch`.
- `AMDGPU source kernels must return void`: use `export fn name () { ... }` or
 `export fn name () -> void { ... }`.
- In the standalone `--kind object --target amdgcn-...` source-intrinsic path,
 the diagnostic that says AMDGPU source kernels currently support only
 compiler-backed GPU calls and optional `return;`: keep that source body to
 `std::gpu::isa`, `std::gpu::device::store_u32_at_global_x`,
 `std::gpu::device::classify_u32_at_global_x`, and `return;` for now; `let`,
 `if`, `while`, arbitrary calls, and assignments are not part of this path.
 Mixed host/device applications instead lower the portable subset and eligible
 helper call graph through `src/lower_gpu_ir.zig`.
- `AMDGPU source intrinsic operands must be unsigned integer literals`: replace
 variables or expressions with direct integer literals such as `0`, `1`, or
 `16`.
- `AMDGPU source intrinsic integer literal operand is out of range`: keep SGPR
 and VGPR operands in the current 8-bit register-number range and LDS offsets
 in the current 16-bit byte-offset range.
- `AMDGPU source intrinsic is not supported on this AMDGPU processor`: select
 the processor that owns the intrinsic, for example `gfx942` for the first MFMA
 helper or `gfx1100` / `gfx1151` for `s_waitcnt_vscnt0`.

## Code Object Format

The code object format is ELF64 little-endian AMDGPU:

- `e_ident[EI_CLASS] == ELFCLASS64`
- `e_ident[EI_DATA] == ELFDATA2LSB`
- `e_ident[EI_OSABI] == ELFOSABI_AMDGPU_HSA`
- `e_ident[EI_ABIVERSION] == ELFABIVERSION_AMDGPU_HSA_V6`
- `e_type == ET_DYN` for the current shared code-object writer
- `e_machine == EM_AMDGPU`
- `PT_PHDR` covers the program-header table
- one read-only `PT_LOAD` covers metadata, dynamic symbol data, and `.rodata`
- one executable `PT_LOAD` covers `.text`
- one writable `PT_LOAD` covers `.dynamic` and its RELRO padding
- one writable no-file-data `PT_LOAD` reserves a one-byte `.bss` allocation
 outside the RELRO range
- `PT_DYNAMIC` points at dynamic symbol-table metadata
- `PT_GNU_RELRO` covers `.dynamic` and its zero-file-size RELRO padding
- `PT_GNU_STACK` records a non-executable process stack contract for ELF tools
- `PT_NOTE` points at the AMDGPU metadata note

The emitted sections are:

- `.note` - AMDGPU metadata note payload.
- `.dynsym` - dynamic symbol table containing the kernel entry and descriptor
 symbols.
- `.gnu.hash` - GNU ELF dynamic-symbol hash table.
- `.hash` - SysV ELF dynamic-symbol hash table.
- `.dynstr` - dynamic symbol string table.
- `.rodata` - optional read-only payload bytes plus the 64-byte aligned kernel
 descriptor symbol.
- `.text` - raw AMDGPU machine instruction bytes.
- `.dynamic` - dynamic entries for `.dynsym`, `.dynstr`, `.gnu.hash`, and
 `.hash`.
- `.relro_padding` - no-file-data allocation padding that extends the dynamic
 load segment to the page boundary for `PT_GNU_RELRO`.
- `.bss` - one byte of non-RELRO no-file-data allocation matching the
 loader-visible segment shape emitted by ROCm-linked code objects. The dynamic
 and static symbol tables include a deterministic `__hip_cuid_*` one-byte
 global object symbol in this section so ELF hash and symbol-table consumers
 see the allocation.
- `.AMDGPU.gpr_maximums` - empty non-alloc section matching the ROCm-linked
 code-object symbol metadata inventory.
- `.comment` - deterministic non-alloc merge/string producer note matching the
 ROCm-linked section ordering.
- `.symtab` - ELF symbol table.
- `.shstrtab` - section-name string table.
- `.strtab` - symbol string table.

The kernel descriptor follows the AMDHSA code-object V3+ 64-byte descriptor
layout. The writer records the fixed group, private, and kernarg segment sizes
at bytes `0..12`, the `KERNEL_CODE_ENTRY_BYTE_OFFSET` field at bytes `16..24`,
`COMPUTE_PGM_RSRC3` at bytes `44..48`, `COMPUTE_PGM_RSRC1` at bytes `48..52`,
`COMPUTE_PGM_RSRC2` at bytes `52..56`, 16-bit kernel-code properties at bytes
`56..58`, and the 16-bit kernarg preload field at bytes `58..60`. The
descriptor symbol is emitted as `<kernel>.kd` in `.rodata`, matching the
AMDHSA V3+ symbol contract. The entry offset is resolved directly against the
final linked `ET_DYN` virtual addresses, and no descriptor relocation section
is emitted.

Descriptor resource bits are derived from `KernelConfig`:

- `COMPUTE_PGM_RSRC1` includes the AMDHSA assembler default execution modes:
 FP32 and FP16/FP64 denorm mode `3`, DX10 clamp enabled, and IEEE mode
 enabled,
- nonzero `.kernarg_segment_size` enables the kernarg segment pointer user
 SGPR in kernel-code properties and sets `USER_SGPR_COUNT` in
 `COMPUTE_PGM_RSRC2` to cover the two SGPRs used by that pointer,
- `COMPUTE_PGM_RSRC2` enables work-group-id X setup by default, matching the
 AMDHSA kernel directive default,
- nonzero `.private_segment_fixed_size` or `.uses_dynamic_stack` enables the
 private segment in `COMPUTE_PGM_RSRC2`,
- `.uses_dynamic_stack` sets the dynamic-callstack kernel-code property bit,
- `gfx1100` and `gfx1151` wavefront size 32 set the wavefront32 property bit,
- `gfx1100` and `gfx1151` always set the GFX10+ `MEM_ORDERED` and
 `FWD_PROGRESS`
 `COMPUTE_PGM_RSRC1` bits,
- `gfx1100` and `gfx1151` use WGP mode by default and set the WGP-mode
 `COMPUTE_PGM_RSRC1` bit, and
- All supported processors use the Code Object V6 implicit kernarg convention:
 the descriptor kernarg segment size is at least 256 bytes, kernel-code
 properties enable dispatch pointer, queue pointer, kernarg pointer, and
 dispatch-id SGPRs, and `COMPUTE_PGM_RSRC2` enables work-group-id X/Y/Z,
 work-item-id X/Y/Z VGPR setup, and eight user SGPRs. The effective metadata
 SGPR minimum is 40 on `gfx942` and 34 on `gfx1100` / `gfx1151`.
- `gfx1100` and `gfx1151` set the GFX11 `COMPUTE_PGM_RSRC3.INST_PREF_SIZE`
 default observed in ROCm-generated code objects.

For `gfx1100` and `gfx1151`, the executable `.text` section is padded to at
least 512 bytes with `s_code_end` words. These targets also receive the
ROCm-observed scalar prologue word before source-intrinsic instruction bytes.
The function symbol size remains the actual generated instruction byte count
including that prologue, while the load segment carries the padded executable
section expected by ROCm Code Object V6 loader paths.

The metadata payload is MessagePack. The root map includes:

- `amdhsa.version`
- `amdhsa.target`
- `amdhsa.kernels`

Each kernel metadata map records:

- `.args` on every supported processor, containing zero to 32 explicit
 eight-byte by-value entries followed by the shifted 256-byte hidden kernarg
 layout expected by the ROCR Code Object V6 loader
- `.name`
- `.symbol`
- `.kernarg_segment_size`
- `.kernarg_segment_align`
- `.sgpr_count`
- `.sgpr_spill_count`
- `.vgpr_count`
- `.vgpr_spill_count`
- `.wavefront_size`
- `.group_segment_fixed_size`
- `.private_segment_fixed_size`
- `.max_flat_workgroup_size`
- `.uses_dynamic_stack`
- `.uniform_work_group_size`
- `.workgroup_processor_mode`

For all supported processors, explicit `u64` entries begin at offsets `0`, `8`,
and so on in declaration order. The hidden layout begins at the next 8-byte
boundary and describes block count X/Y/Z, group size X/Y/Z, remainder X/Y/Z,
global offset X/Y/Z, grid dimensions, hostcall buffer, multigrid sync argument,
heap, default queue, completion action, and queue pointer. The backend emits
`.sgpr_spill_count` and `.vgpr_spill_count` as zero for this first slice.
`.uniform_work_group_size` and `.workgroup_processor_mode` are integer
metadata fields. Uniform work groups are enabled on all supported processors;
workgroup-processor mode is `1` for the current `gfx1100` / `gfx1151` defaults
and `0` for `gfx942`.

The initial defaults are intentionally conservative:

- `gfx942`: wavefront size 64, Code Object V6 hidden kernargs, and FP16 inputs
 with FP32 accumulation as the first MFMA lowering target.
- `gfx1100` / `gfx1151`: wavefront size 32 by default, with wavefront 64
 accepted only when selected explicitly by the caller; WGP mode is enabled by
 default.
- LDS / group segment fixed size defaults to 16 KiB for tiled kernels.
- Private segment fixed size defaults to 0.
- Kernarg segment alignment defaults to 8 bytes.
- Maximum flat work-group size defaults to 1024 work-items.

## Instruction Encoding Scope

The backend owns its instruction bytes. It may use published AMDGPU ISA and ABI
references as implementation input, but generated artifacts must be produced by
local byte packing rather than by invoking an external assembler in normal
operation.

The current encoder provides:

- fixed-width little-endian instruction-word emission,
- processor-aware scalar `s_add_i32` and aligned-pair `s_mov_b64` helpers,
- processor-aware `v_add_f32`, `v_mul_f32`, and `v_fma_f32` helpers for
 register-only operands,
- processor-aware `global_load_dword` / `global_store_dword` helpers for
 vector-addressed `off` VMEM forms,
- compiler-generated explicit-kernarg loads and global-X address calculation
 for `std::gpu::device::store_u32_at_global_x`, including the processor-aware
 SALU, VALU, and scalar-base VMEM encodings used by that semantic operation,
- compiler-generated packed input load, unsigned threshold comparison, and
 packed prediction store selected either from the portable
 `global_id_x`/`load_u32`/comparison/`store_u32` IR graph or the compatibility
 `std::gpu::device::classify_u32_at_global_x` operation,
- processor-aware `ds_read_b32` / `ds_write_b32` helpers with explicit byte
 offsets,
- a CDNA3 `gfx942` `v_mfma_f32_16x16x16_f16` helper for aligned VGPR source
 pairs and accumulator quads,
- processor-aware `s_endpgm` termination emission for `gfx942`, `gfx1100`, and
 `gfx1151`,
- processor-aware conservative `s_waitcnt 0` emission for the VM/EXP/LGKM
 `s_waitcnt vmcnt(0) expcnt(0) lgkmcnt(0)` synchronization helper,
- `gfx1100` / `gfx1151` `s_waitcnt_vscnt null, 0` emission for the VSCNT side of
 store-like hazard sequencing,
- validation that caller-provided instruction streams are 32-bit word aligned,
- typed placeholders for the remaining SALU, VALU, VMEM, LDS, synchronization,
 and CDNA3 MFMA forms so call sites can be added without changing the object
 writer shape.

The public source-intrinsic names currently accepted inside AMDGPU object-output
kernels are:

- `__silk_amdgpu_s_add_i32(dst, src0, src1)`
- `__silk_amdgpu_s_mov_b64(dst_pair_start, src_pair_start)`
- `__silk_amdgpu_s_waitcnt_vmcnt0_expcnt0_lgkmcnt0()`
- `__silk_amdgpu_s_waitcnt_vmcnt0_lgkmcnt0()` compatibility alias for the
 VM/EXP/LGKM wait helper
- `__silk_amdgpu_s_waitcnt_vscnt0()` (`gfx1100` / `gfx1151` only)
- `__silk_amdgpu_v_add_f32(dst, src0, src1)`
- `__silk_amdgpu_v_mul_f32(dst, src0, src1)`
- `__silk_amdgpu_v_fma_f32(dst, src0, src1, src2)`
- `__silk_amdgpu_global_load_dword(dst, address_pair_start)`
- `__silk_amdgpu_global_store_dword(address_pair_start, data)`
- `__silk_amdgpu_ds_write_b32(address, data, byte_offset)`
- `__silk_amdgpu_ds_read_b32(dst, address, byte_offset)`
- `__silk_amdgpu_mfma_f32_16x16x16_f16(acc_dst_start, src_a_pair_start, src_b_pair_start, acc_src_start)` (`gfx942` only)

The target-neutral selector currently recognizes the portable packed-`u32`
fill and threshold-classification graphs, including direct pure/device helper
calls. Broader Silk IR selection still requires lowering and verified hazard
coverage for:

- SGPR/VGPR allocation and operand selection across the frontend IR,
- immediate, literal, scalar-source, and modifier variants for the current
 SALU and VALU helpers,
- additional CDNA3 MFMA layouts, including larger FP16 and BF16 forms,
- VMEM offset, scalar-resource, bounds, and cache-policy variants,
- LDS indexed and multi-dword variants,
- synchronization: explicit `s_waitcnt vmcnt(0) expcnt(0) lgkmcnt(0)`
 insertion before dependent reads and explicit GFX10+ VSCNT insertion before
 global stores or store-like atomics that require `vscnt(0)`

## AQL Dispatch Packets

The backend serializes HSA AQL kernel-dispatch packets as exactly 64 bytes.
The packet fields are written at the HSA-defined byte offsets:

- `0..2`: `header`
- `2..4`: `setup`
- `4..6`: `workgroup_size_x`
- `6..8`: `workgroup_size_y`
- `8..10`: `workgroup_size_z`
- `10..12`: reserved, zero
- `12..16`: `grid_size_x`
- `16..20`: `grid_size_y`
- `20..24`: `grid_size_z`
- `24..28`: `private_segment_size`
- `28..32`: `group_segment_size`
- `32..40`: `kernel_object`
- `40..48`: `kernarg_address`
- `48..56`: reserved, zero
- `56..64`: `completion_signal`

The serializer validates:

- dimensions are 1, 2, or 3,
- unused dimensions have workgroup and grid size 1,
- grid dimensions are nonzero and not smaller than the matching workgroup
 dimensions,
- workgroup dimensions are nonzero,
- and the flat work-group size (`x * y * z`) is not larger than
 `max_flat_workgroup_size`, which defaults to 1024.

Queue creation, memory-region allocation, executable loading, and doorbell
submission through raw ROCR are outside this standalone AQL serializer API.
Mixed CPU/GPU executables use the shipped provider-neutral runtime and its HIP
adapter instead. Any separate raw-ROCR adapter must use the same packet
serializer so the byte layout remains covered by unit tests.
For C embedders, `libsilk.a` exposes this serializer as
`silk_amdgpu_aql_dispatch_packet_build`, which writes exactly
`SILK_AMDGPU_AQL_DISPATCH_PACKET_SIZE` bytes and applies the validation rules
above before any runtime queue code sees the packet. The C config field
`max_flat_workgroup_size` uses the conservative 1024 default when set to zero.

## Verification

The first structural tests must validate:

- target parsing and metadata strings,
- ELF magic, class, OS ABI, ABI version, machine, and section table,
- `ET_DYN`, `PT_PHDR`, `PT_LOAD`, `PT_DYNAMIC`, and `PT_NOTE` structure,
- `PT_GNU_RELRO`, `PT_GNU_STACK`, `.relro_padding`, and `.bss` structure,
- presence and offsets of `.text`, `.rodata`, `.note`, `.dynstr`, `.dynsym`,
 `.gnu.hash`, `.hash`, `.dynamic`, `.relro_padding`, `.bss`, `.strtab`,
 `.symtab`, and `.shstrtab`,
- kernel entry and descriptor symbol placement in `.symtab` and `.dynsym`,
- descriptor offsets for `KERNEL_CODE_ENTRY_BYTE_OFFSET`,
 `COMPUTE_PGM_RSRC1`, `COMPUTE_PGM_RSRC2`, kernarg pointer enablement,
 private-segment enablement, dynamic-stack properties, AMDHSA default FP
 execution-mode bits, GFX10+ memory-ordering bits, WGP mode, and RDNA3
 wavefront-size properties,
- structurally decoded MessagePack metadata keys and configured
 register/wave/LDS/kernarg/work-group properties,
- encoded processor-specific `s_endpgm`, VM/EXP/LGKM wait, and VSCNT wait
 helper bytes,
- encoded first-slice SALU, VALU, VMEM, LDS, and CDNA3 MFMA helper bytes,
- CLI and C ABI source-kernel object output for `.hsaco` generation,
- AQL packet field offsets and validation failures.

Host tests may optionally run `readelf -h -S -n` when available, but the core
unit tests must not require an AMD GPU, ROCR installation, LLVM, clang, or HIP.

`make amdgpu-rocr-check` is the opt-in hardware acceptance check for ROCR
executable loading. It builds a temporary source-intrinsic Silk kernel, compiles
`scripts/check-amdgpu-rocr-load.c` against the installed HSA headers and
`libhsa-runtime64`, reads the generated `.hsaco` into HSA AMD runtime-allocated
CPU memory, grants the GPU agent access to that allocation, then calls
`hsa_code_object_reader_create_from_memory`,
`hsa_executable_load_agent_code_object`, `hsa_executable_freeze`, and
`hsa_executable_validate`. The loader checks reported GPU kernel-dispatch agents
until one accepts the code object. It creates the executable with the reported
agent profile and zero
default-float-rounding mode by default. Set
`SILK_AMDGPU_ROCR_PROFILE=base`, `full`, or `agent` to override that executable
profile choice, and set `SILK_AMDGPU_ROCR_ROUNDING=zero` or `near` to override
the default float rounding mode. The default load mode is
`hsa_executable_load_agent_code_object`; set `SILK_AMDGPU_ROCR_LOAD=program` to
try `hsa_executable_load_program_code_object` as an explicit diagnostic. Program
load mode is not the canonical path for AMDHSA agent code objects, so a program
load failure is useful for isolating the HSA API path but is not by itself an
object-layout finding. Set
`SILK_AMDGPU_ROCR_READER=file` to use
`hsa_code_object_reader_create_from_file`, or `SILK_AMDGPU_ROCR_READER=memory`
to use a plain process memory buffer, when testing those reader paths
explicitly. Set
`SILK_AMDGPU_ROCR_HSACO=/path/to/file.hsaco` to skip Silk code-object generation
and load that caller-provided code object through the same ROCR loader; this is
useful when comparing a ROCm-generated reference object against Silk output on
the same host. Set `SILK_AMDGPU_ROCR_HSACO=rocm-installed` to ask the wrapper to
load a gfx-matching `.hsaco` from the installed ROCm `rocblas` or `hipblaslt`
library tree. This installed-reference mode is a host-runtime diagnostic only;
it does not add an LLVM, clang, or HIP dependency to Silk code generation. The
ROCR wrapper can also run the HIP readiness gates before raw HSA loading: set
`SILK_AMDGPU_ROCR_HIP_PREFLIGHT=1` to require `memset` and `launch-only` HIP
checks to pass first, and set
`SILK_AMDGPU_ROCR_HIP_PREFLIGHT_TIMEOUT_SECONDS=30` to adjust that preflight
timeout. Leave the preflight unset when deliberately forcing the raw ROCR
diagnostic despite a known HIP command-submission failure. The
target defaults to
`amdgcn-amd-amdhsa-gfx942`
when `rocminfo` cannot report a known `gfx942`, `gfx1100`, or `gfx1151` agent;
set `AMDGPU_TARGET=amdgcn-amd-amdhsa-gfx1100` or
`AMDGPU_TARGET=amdgcn-amd-amdhsa-gfx1151` for an explicit target override. When
`rocminfo` reports another `gfx*` architecture, the check skips by default and
prints the detected names instead of building a misleading `gfx942` artifact.
Set `ROCR_INCLUDE_DIR` and `ROCR_LIB_DIR` when ROCm is installed outside the
standard probe paths, and set
`SILK_AMDGPU_ROCR_SYMBOL=smoke.kd` to additionally require kernel-symbol lookup
after the executable is frozen.

The make target is intentionally outside `make test` and treats environment
unavailability as a skip. Set `SILK_AMDGPU_ROCR_REQUIRE=1` to make a missing
header/library, failed `hsa_init`, missing GPU kernel-dispatch agent, or other
skip condition fail the command. A successful skip-free run requires `/dev/kfd`,
`/dev/dri`, and membership in the host DRM access group such as `video` or
`render`. The Codex sandbox used for repository edits may not project the host
DRM device nodes or group list, so a sandbox skip at `hsa_init` is distinct
from a host-shell failure after `hsa_executable_load_agent_code_object` or
`hsa_executable_freeze`. When the checker process exits through SIGABRT or
SIGSEGV, the shell wrapper prints the active reader/load modes plus concrete
retry hints. If both a Silk-generated object and a ROCm-generated reference
object fail in the same ROCR path, continue diagnosis in the host ROCR/KFD stack
before changing Silk object layout. `make amdgpu-hip-runtime-check` is the
optional high-level host control for that case: it uses the installed `hipcc` to
compile and launch a tiny HIP kernel for the detected or requested gfx
architecture. The generated HIP program prints phase markers before each runtime
call, mirrors output into `hip-runtime-check.log` in the generated work
directory, and is run with a watchdog timeout; set
`SILK_AMDGPU_HIP_TIMEOUT_SECONDS=60` to adjust the timeout. Timeout diagnostics
report the last printed phase and add a host-runtime hint for launch, device
memory, copy, or synchronization hangs, including the `journalctl -k -b` filter
used to inspect amdgpu/KFD queue faults. If the kernel log reports an amdgpu
gfxhub page fault from CPF followed by queue eviction while this HIP control is
running, treat that as host ROCm/KFD command-processing evidence before changing
Silk code-object layout. When comparing against another working setup on the
same GPU/OS lane, set `SILK_AMDGPU_HIP_CLEAN_ENV=1` to run only the generated
HIP binary with inherited HIP/HSA/ROCR/AMD runtime variables cleared while
preserving the ROCm library path, and set `SILK_AMDGPU_HIP_PRINT_ENV=1` to print
the focused runtime environment being tested. Set
`SILK_AMDGPU_HIP_MODE=alloc`, `launch-only`, `device-fill`, `memset`,
`vector-add`, or `pinned-vector-add` to isolate allocation-only behavior, kernel
submission before synchronization, device-only kernel execution with a
device-to-host result copy, device-memory command submission, pageable
host-to-device copies, or pinned-host copies. This target is intentionally a
hardware/runtime diagnostic only; Silk code generation still does not depend on
HIP, clang, or LLVM.

`make amdgpu-host-env` is a read-only comparison snapshot for local ROCm/KFD
diagnosis. It does not compile or submit GPU work. It prints the OS and kernel
command line, user/group and device-node access, ROCm tool paths and package
versions, relevant HIP/HSA/ROCR/AMD environment variables, loaded amdgpu module
parameters, PCI GPU binding, matching AMDGPU firmware files, and recent
amdgpu/KFD kernel logs. Use it to compare a failing host against a known-good
host on the same GPU and OS lane before changing Silk backend code.
