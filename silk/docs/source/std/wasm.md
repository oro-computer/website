# WebAssembly Runtime (`std::wasm`)

Status: **MVP (wasm32 interpreter)**.

`std::wasm` is the standard library surface for **executing WebAssembly (WASM)
modules** from Silk.

This module is about *running* wasm. It is not the Silk compiler’s wasm output
backend (see `docs/compiler/backend-wasm.md`).

## Goals

- Provide a portable API for:
  - loading/validating wasm bytes,
  - instantiating modules (including imports),
  - calling exported functions,
  - interacting with exported linear memory.
- Keep the module swappable, like the rest of `std::`: embedders may provide an
  alternate implementation (for example a wasm engine binding) while preserving
  the same public API.
- Record a clear path to a full native runtime and JIT in later phases (no
  dependency on external language toolchains).

## High-Level API

The public Silk surface is centered around:

- `Engine` — a runtime context and configuration (currently minimal).
- `Module` — a validated module (owned bytes + parsed metadata).
- `Instance` — an instantiated module (module + runtime state).
- `Func` — an exported function handle for calling.
- `Imports` — host-provided imports used during instantiation.
- linear memory access via `Instance.memory_bytes()` (returns `None` when the module has no memory; otherwise `Some(ByteSlice)`, possibly length 0).
- `Val` / `ValType` — a small tagged value representation for wasm values
  (currently used for results).

## Host Imports (MVP)

`Module.instantiate_with_imports(imports: Imports)` uses `Imports` to resolve
wasm imports (functions, globals, memory, table).

### Imported Functions

Imported functions are dispatched through a single host callback:

- `Imports.func_call: HostCall`

`HostCall` uses a scalar-only calling convention so it can be stored as a
first-class value and passed around in the current compiler subset:

```silk
type fn HostCall = fn (import_index: i64,
                    args_ptr: u64, args_len: i64,
                    mem_ptr: u64,  mem_len: i64,
                    out_bits_ptr: u64) -> int;
```

Semantics:

- `import_index` is 0-based in the order declared by the wasm module.
- `(args_ptr, args_len)` describes a `u64` slice of raw argument bits (i32 uses
  the low 32 bits; f32 also uses the low 32 bits).
- `(mem_ptr, mem_len)` describes the instance linear memory as a raw byte view
  (or `(0, 0)` when the module has no memory).
- When the imported function returns `i32`, `i64`, `f32`, or `f64`, the host
  writes the raw result bits to `out_bits_ptr` (at offset 0, as a `u64`).
  - `i32`/`f32` use the low 32 bits.
  - `i64`/`f64` use the full 64 bits.
- The return value is 0 on success; non-zero values are treated as
  `WASMError.code` (with `offset = -1`).

### Named Imported Functions

For embedders that want **named** host functions (instead of a single
index-based dispatcher), `std::wasm` also provides a helper that links imported
functions by `(module_name, import_name)` using `std::map`:

- `export struct ImportFuncName { module_name: string, name: string }`
- `export fn hash_import_func_name (k: ImportFuncName) -> u64;`
- `export fn eq_import_func_name (a: ImportFuncName, b: ImportFuncName) -> bool;`
- `Module.instantiate_with_named_func_imports(imports: Imports, func_imports: &std::map::HashMap(ImportFuncName, HostCall))`

Semantics:

- Every imported function in the module must have a corresponding entry in
  `func_imports`, otherwise instantiation fails with `LinkError`.
- Extra entries in `func_imports` are ignored.
- The linked callbacks are stored in a per-instance dispatch table so the map
  itself does not need to outlive instantiation.

Example:

```silk
import std::map;
import std::wasm;

type ImportMap = std::map::HashMap(std::wasm::ImportFuncName, std::wasm::HostCall);

fn main () -> int {
  let r = ImportMap.init(8, std::wasm::hash_import_func_name, std::wasm::eq_import_func_name);
  if r.is_err() { return 1; }
  let mut m: ImportMap = match (r) {
    Ok(v) => v,
    Err(_) => ImportMap.empty(std::wasm::hash_import_func_name, std::wasm::eq_import_func_name),
  };

  // Link the wasm import `(import "env" "add1" ...)` to a host callback.
  let _ = (mut m).put(std::wasm::ImportFuncName{ module_name: "env", name: "add1" }, host_call);

  let inst_r = (mut module).instantiate_with_named_func_imports(imports, &m);
  (mut m).drop();
  // ...
  return 0;
}
```

### Imported Globals

Imported globals are provided as raw bits:

- `Imports.global_bits: Slice(u64)`

Semantics:

- The slice length must equal the number of imported globals in the module.
- Globals are ordered by the wasm module’s import order (0-based).
- For imported `i32` globals, only the low 32 bits are used.
- For imported `i64` globals, the full 64 bits are used.
- For imported `f32` globals, only the low 32 bits are used (raw IEEE bits).
- For imported `f64` globals, the full 64 bits are used (raw IEEE bits).

### Imported Memory/Table

`Imports` can configure the initial sizes of imported memory/table:

- `Imports.memory_pages: i64` (for imported memory)
- `Imports.table_size: i64` (for imported table)

Semantics:

- `-1` means “use the module minimum”.
- Any other value must satisfy the module’s declared limits.

## Error Model

`std::wasm` uses a single typed error:

- `WASMError { code, offset, requested, trap }`

Where:

- `code` is a stable kind code.
- `offset` is a byte offset into the wasm input when known (otherwise `-1`).
- `requested` is used for allocation failures (otherwise `0`).
- `trap` is a stable trap-kind code when `code == Trap` (otherwise `0`).

`WASMError.kind()` and `WASMError.message()` provide a semantic view over the
stable integer codes.

## Supported Features (MVP)

The implementation is a **pure Silk interpreter** intended to be:

- self-contained (no external dependencies),
- correct for the WebAssembly 1.0 MVP semantics it supports,
- explicit about unsupported extensions (returns `Unsupported`).

### Targets

- Only **wasm32** modules are supported.
- The module must be a valid wasm binary module (magic + version 1).

### Sections

Supported:

- custom sections are ignored,
- core sections: `type`, `import`, `function`, `table`, `memory`, `global`,
  `export`, `start`, `element`, `code`, `data`.

Notes / current constraints (MVP):

- At most one table and one memory are supported (MVP constraint).
- `start` is executed automatically during `Module.instantiate` after
  instantiation initialization.
  - the start function must have signature `[] -> []` (no parameters, no results).
- `data_count` and all non-MVP extensions are rejected as `Unsupported`.

### Values and Function Calls

- Supported `ValType`: `I32`, `I64`, `F32`, `F64`.
- Supported function signatures: any number of `i32`/`i64`/`f32`/`f64`
  parameters and 0–1 `i32`/`i64`/`f32`/`f64` results.
- Calls pass arguments as raw bits (`std::arrays::Slice(u64)`):
  - for `i32`/`f32` parameters, only the low 32 bits are used,
  - for `i64`/`f64` parameters, the full 64 bits are used.
- Calls return 0–1 results as `Val?`.

### Instructions

The interpreter supports a practical wasm32 subset sufficient for “real” wasm
code (including `f32`/`f64`):

- control/parametric/variable: `unreachable`, `nop`, `block`, `loop`, `if`,
  `else`, `end`, `br`, `br_if`, `br_table`, `return`, `call`, `call_indirect`,
  `drop`, `select` (with block results for `i32`/`i64`/`f32`/`f64`)
- memory: all MVP loads/stores (including sign/zero-ext forms), `memory.size`,
  `memory.grow`
- numerics: `i32`/`i64`/`f32`/`f64` operators and conversions (including
  float↔int conversions and bit reinterpret ops).
  - Float→int truncation traps on `NaN` and out-of-range inputs
    (`WASMTrapKind::InvalidConversionToInteger`).

Unsupported opcodes/extensions are rejected as `Unsupported` with an `offset`
pointing at the opcode.

## Ownership Rules

- A `Module` owns the wasm bytes and parsed metadata.
- An `Instance` owns its own runtime state and takes ownership of the module’s
  owned allocations during instantiation.
  - `Module.instantiate(mut self: &Module)` consumes the module by moving its
    owned allocations into the returned `Instance`.
  - after a successful call, the original `Module` is left in an empty, inert
    state.
  - if instantiation fails (including start traps), no instance is produced and
    the original `Module` remains intact.
- `Func` is a lightweight view into an `Instance`, and memory is accessed by
  calling `Instance.memory_bytes()` when present.

## Example

```silk
import std::wasm;
import std::arrays;
import std::buffer;

using Engine = std::wasm::Engine;
using EngineResult = std::wasm::EngineResult;
using Module = std::wasm::Module;
using ModuleResult = std::wasm::ModuleResult;
using Instance = std::wasm::Instance;
using InstanceResult = std::wasm::InstanceResult;
using Func = std::wasm::Func;
using Val = std::wasm::Val;
using CallResult = std::wasm::CallResult;
using ByteSlice = std::arrays::ByteSlice;
using BufferU8 = std::buffer::BufferU8;
using U64Slice = std::arrays::Slice(u64);

fn main () -> int {

  let r: EngineResult = Engine.init_default();
  if r.is_err() { return 1; }
  let engine: Engine = match (r) {
    Ok(v) => v,
    Err(_) => Engine{ max_stack: 0, max_call_depth: 0, max_memory_pages: 0 },
  };

  // Minimal wasm module:
  // (module
  //   (func (export "answer") (result i32)
  //     i32.const 7))
  // Note: `u8[N]` arrays use the scalar-slot memory model (not packed bytes).
  // Build a packed `ByteSlice` via `BufferU8` when supplying raw wasm bytes.
  let wasm_bytes: u8[39] = [
    0, 97, 115, 109, 1, 0, 0, 0,
    1, 5, 1, 96, 0, 1, 127,
    3, 2, 1, 0,
    7, 10, 1, 6, 97, 110, 115, 119, 101, 114, 0, 0,
    10, 6, 1, 4, 0, 65, 7, 11
  ];

  let buf_r = BufferU8.init(39);
  if buf_r.is_err() { return 2; }
  let mut buf: BufferU8 = match (buf_r) {
    Ok(v) => v,
    Err(_) => BufferU8.empty(),
  };
  var i: i64 = 0;
  while i < 39 {
    let push_err = (mut buf).push(wasm_bytes[i]);
    if push_err != None {
      (mut buf).drop();
      return 2;
    }
    i = i + 1;
  }
  let bytes: ByteSlice = buf.as_bytes();

  let m_r: ModuleResult = engine.compile(bytes);
  (mut buf).drop();
  if m_r.is_err() { return 2; }
  let mut m: Module = match (m_r) {
    Ok(v) => v,
    Err(_) => Module.empty(),
  };

  let inst_r: InstanceResult = (mut m).instantiate();
  if inst_r.is_err() { return 3; }
  let mut inst: Instance = match (inst_r) {
    Ok(v) => v,
    Err(_) => Instance.empty(),
  };

  let f_opt: Func? = inst.export_func("answer");
  if f_opt == None { return 4; }
  let f: Func = f_opt ?? Func{ index: 0 };

  let args: U64Slice = { ptr: 0, len: 0 };
  let call_r: CallResult = (mut inst).call(f, args);
  if call_r.is_err() { return 5; }

  let out_opt: Val? = match (call_r) {
    Ok(v) => v,
    Err(_) => None,
  };
  if out_opt == None { return 6; }
  let out: Val = out_opt ?? Val.i32(0);

  let got_opt: i32? = out.as_i32();
  if got_opt == None { return 7; }
  if (got_opt ?? 0) != 7 { return 8; }

  return 0;
}
```

## Future Work

- A stable, ergonomic host import resolver API (beyond the MVP `Imports` list).
- WASI bindings and host library shims.
- Post-MVP proposals: bulk memory, reference types, SIMD (`v128`), threads, multi-value.
- A native runtime/JIT implementation for performance.
