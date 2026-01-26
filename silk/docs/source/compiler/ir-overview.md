# Intermediate Representation (IR) – Overview

This document introduces the initial intermediate representation (IR) used by
the Silk compiler. The IR is intentionally small and focused for now so that
we can start supporting more advanced programs while keeping the design
tractable.

The goals of the IR are:

- provide a target-independent representation of Silk programs,
- be simple enough to interpret or lower to multiple back-ends,
- make control flow and data flow explicit so optimizations are possible.

This document will evolve as the IR grows; it is not yet a complete spec.

## High-Level Shape

The IR is structured in three main layers:

- `IrProgram`
  - represents a collection of functions within a compilation unit,
  - owns an array of `IrFunction` values,
  - identifies a designated entry function by index.
- `IrFunction`
  - represents a single function,
  - owns a sequence of basic blocks,
  - has a designated entry block.
- `IrBlock`
  - represents a basic block:
    - a straight-line sequence of instructions,
    - terminated by a control-flow instruction (e.g. `Return` or branch).
- `IrInstr`
  - represents a single instruction:
    - scalar constants (integers and floats represented as raw bits),
    - integer and floating-point arithmetic and comparisons,
    - explicit control flow (branches and returns),
    - direct calls between functions in the same program,
    - calls to external functions declared in the program,
    - (later) memory operations, aggregates, etc.

Values are referenced by small integer IDs (`ValueId`). IR is not yet in full
SSA form, but the representation is compatible with an SSA-style design.

### Typed Values (Current Subset)

Although the earliest experiments treated all values as untyped 64-bit
integers, the IR now carries an explicit scalar type for each value so that
front-end lowering, the interpreter, and native back-ends can agree on how
values are represented and passed.

For now, the scalar type universe focuses on booleans, fixed-width integers,
and IEEE-754 floating-point values:

- `Bool`
  - logical `true` / `false` values.
  - Encoded as integers in the IR (`0` = false, `1` = true) so that existing
    arithmetic and comparison machinery can be reused.
- `I8` / `U8`, `I16` / `U16`, `I32` / `U32`, `I64` / `U64`
  - fixed-width integer types with explicit signedness and width.
  - the current lowering and ELF backend primarily exercise `I64`
    (corresponding to the language’s `int` on `linux/x86_64`) plus `Bool` for
    conditions and boolean locals.
- `F32` / `F64`
  - IEEE-754 single- and double-precision floats.
  - Represented in the IR as raw IEEE bits stored in the same 8-byte slot as
    integer scalars:
    - `F64` uses all 64 bits,
    - `F32` uses the low 32 bits (the high 32 bits are canonicalized to 0).

Each `ValueId` is associated with exactly one scalar type; instructions know
both the type of their operands and the type of the value they produce. This
typed representation is used by:

- the lowering passes in `src/lower_ir.zig` to ensure that arithmetic,
  comparisons, and boolean expressions are mapped to the correct instruction
  shapes,
- the IR interpreter in `src/ir_eval.zig` to maintain a consistent runtime
  encoding (everything is stored in 8-byte slots, with `Bool` encoded as
  `0`/`1` and floats stored as raw IEEE bits), and
- the ELF backend in `src/backend_ir_elf.zig` to choose the appropriate
  register/stack conventions and any sign/zero-extension rules when
  additional integer widths are introduced.

In the current implementation, this type information is carried on each
`IrFunction` as:

- a function signature (`param_types` and `result_types`), and
- a `value_types` table that maps each `ValueId` slot to a scalar type.

Future revisions of this document will extend the IR beyond the current scalar
set to cover pointer-like types, address computations, and aggregates
(structs/tuples) along with their layout rules.

The design above is intentionally minimal but is the foundation on which
full language type coverage will be added.

### Multi-Scalar Boundaries (Current Extension)

Most IR functions return exactly one scalar value, but the IR can represent
small aggregate-like results at *function boundaries* by returning multiple
scalars in a fixed order.

Concretely:

- `IrFunction.result_types` is a slice of scalar result types (not a single
  scalar type).
- `Return` returns a slice of `ValueId`s whose length and element types must
  match `result_types`.
- `Call` has `dests` as a slice of `ValueId`s whose length and element types
  must match the callee’s `result_types`.

The first multi-scalar boundary use case is `string` at ABI boundaries,
represented as two scalars in order:

- `ptr: u64` (address of UTF-8 bytes)
- `len: i64` (byte length, excluding any trailing `\\0`)

Within the current back-end subset, this allows exported functions to accept
and return `string` values in a C-friendly `SilkString` layout without adding a
dedicated “string pointer” ABI.

## Minimal Instruction Set (Initial)

The initial IR supports only what is needed to model small scalar-returning
programs, with scalar values drawn from `Bool`, the fixed-width integer types,
and `F32`/`F64`.

In the current compiler, the surface `char` type is lowered into this IR as a
`U32` scalar holding the Unicode code point value.

## Multi-Scalar Values at ABI Boundaries (Initial)

While IR values are scalar, the compiler also supports a small set of
multi-scalar values at function ABI boundaries (parameters and results) by
lowering a single surface-language value into multiple scalar slots:

- `string` is lowered as `{ ptr: u64, len: i64 }` and returns via `rax`/`rdx` on
  `linux/x86_64` (see `docs/language/ext.md` and `docs/compiler/abi-libsilk.md`).
- For the initial `struct` subset (see `docs/language/structs-impls-layout.md`),
  a struct value is lowered as 1+ scalar slots in source field order. Each
  field may contribute one or more slots (for example, `string` contributes
  `(u64 ptr, i64 len)`), and nested structs are lowered by concatenating their
  slots. Calls assign each scalar slot to INTEGER/SSE argument slots as if
  passing independent scalars: integer-like slots consume GP argument slots,
  `f32`/`f64` slots consume XMM argument slots, and 1–2 slot results use
  `rax`/`rdx` for integer-like slots and `xmm0`/`xmm1` for float slots (mixed
  aggregates use both). For results with 3+ scalar slots, the native backend
  returns indirectly via a hidden sret pointer passed in `rdi`, storing each
  slot into the caller-provided buffer and returning that pointer in `rax`.

For optionals (`T?`) in the current backend subset, an optional value is
lowered at IR boundaries as a `Bool` tag followed by the payload scalars:
`(Bool tag, payload0, payload1, ...)` where `tag=0` represents `None` and
`tag=1` represents `Some(...)`. The payload scalar slots follow the lowering of
the underlying non-optional type:

- scalar payloads lower as `(Bool tag, payload)`,
- `string?` lowers as `(Bool tag, u64 ptr, i64 len)`,
- and `struct?` lowers as `(Bool tag, slot0, slot1, ...)` for the current POD
  struct subset.

Nested optionals (`T??`) are lowered in this subset by treating the payload
slots as the full inner optional representation. For example, `int??` lowers
as `(Bool tag0, Bool tag1, i64 payload)`.

This keeps the IR scalar-only while allowing the surface language to express
optionals; it maps cleanly to the System V AMD64 ABI as independent scalar
arguments/results, with 3+ scalar results returning via a hidden sret pointer
as described above.

Semantically, most integer-producing instructions are defined in terms of the
destination `ScalarType`: after executing the operation in a larger machine
register, results are canonicalized (masked/truncated and sign-extended for
signed integers) to the destination type.

- `ConstInt`
  - create a constant scalar value; the raw payload is canonicalized to the
    destination `ScalarType`.
  - For floats, the payload is the raw IEEE bit pattern (`F32` uses the low
    32 bits).
- `ConstDataAddr`
  - materialize the address of a read-only data symbol emitted alongside the
    IR program (for example, an embedded string-literal byte blob).
  - `dest` must have scalar type `U64`.
  - Back-ends typically lower this to RIP-relative addressing and either:
    - emit relocations (for relocatable objects), or
    - patch displacements directly once the final `.text`/rodata layout is known.
- `LoadU8`
  - load a single byte from memory at address `base + offset`, zero-extending
    the result into the destination scalar slot.
  - `dest` must have scalar type `U8`, `base` must have scalar type `U64`, and
    `offset` must have scalar type `I64`.
  - The current compiler uses this instruction for bytewise `string` equality
    and ordered comparisons in the `linux/x86_64` IR→ELF backend subset; the IR
    interpreter currently treats it as unsupported.
- `StackAddr`
  - produce the address of the stack slot backing an existing `ValueId`.
  - `dest` must have scalar type `U64`.
  - This is a backend-facing operation used by the current compiler to lower
    borrowed references (`&T`) without requiring contiguous aggregate storage;
    the IR interpreter currently treats it as unsupported.
- `Load`
  - load an 8-byte scalar value from memory at address `ptr` into `dest`,
    canonicalizing the loaded raw bits according to the destination `ScalarType`.
  - `ptr` must have scalar type `U64`.
  - This is used by the current compiler for reading through borrowed references;
    the IR interpreter currently treats it as unsupported.
- `Store`
  - store an 8-byte scalar value from `src` to memory at address `ptr`.
  - `ptr` must have scalar type `U64`.
  - This is used by the current compiler for mutating through borrowed references;
    the IR interpreter currently treats it as unsupported.
- `Copy`
  - copy a scalar value from one `ValueId` to another (both IDs must have the
    same `ScalarType`); this is used by CFG-based boolean lowering to merge
    short-circuit `&&` / `||` paths into a single boolean value slot.
- `AddInt`, `SubInt`, `MulInt`, `DivInt`, `ModInt`
  - integer arithmetic operations on previously defined values of a single
    integer `ScalarType`; for `DivInt`/`ModInt`, signedness is determined by
    the operand type (`I*` vs `U*`), and results are canonicalized to the
    destination type.
- `BitAndInt`, `BitOrInt`, `BitXorInt`
  - bitwise AND/OR/XOR on previously defined integer values.
- `ShlInt`, `ShrInt`
  - shift-left and shift-right on previously defined integer values; `ShrInt`
    uses arithmetic shift-right for signed integer types (`I*`) and logical
    shift-right for unsigned integer types (`U*`).
- `CmpEqInt`, `CmpNeInt`, `CmpLtInt`, `CmpLeInt`, `CmpGtInt`, `CmpGeInt`
  - integer comparison operations on previously defined values, producing a
    result of type `Bool` that is encoded as `0` (false) or `1` (true) in the
    underlying integer storage; for ordered comparisons, signedness is
    determined by the operand type.
- `AddFloat`, `SubFloat`, `MulFloat`, `DivFloat`
  - floating-point arithmetic over `F32` or `F64` values, producing a result
    of the same float type (stored as raw IEEE bits in the destination slot).
- `CmpEqFloat`, `CmpNeFloat`, `CmpLtFloat`, `CmpLeFloat`, `CmpGtFloat`, `CmpGeFloat`
  - floating-point comparisons over `F32` or `F64` values, producing a `Bool`.
  - These follow IEEE-754 semantics: ordered comparisons (`<`, `<=`, `>`, `>=`)
    are false when either operand is `NaN`, and `NaN` compares unequal to
    everything (including itself).
- `Br`, `BrCond`
  - explicit intra-function control flow:
    - `Br` performs an unconditional branch to another basic block by index,
    - `BrCond` branches based on an integer condition value (`0` = false,
      non-zero = true) to either a "then" or "else" target block.
- `Return`
  - terminator that returns zero or more scalar values from the current
    function (matching the enclosing function’s `result_types`).

Additional instructions (memory operations and aggregates) will be added as we
lower richer subsets of the language. The `Call` instruction represents direct
calls between functions within the same `IrProgram`:

- `Call`
  - calls another IR function within the same `IrProgram`,
  - in the current subset, calls are:
    - direct (identified by function index, not by name or pointer),
    - between functions that return one or more scalar results (most commonly a
      single integer-like scalar, `Bool`, or `F32`/`F64`, with limited multi-scalar
      boundary support as described above),
    - parameterized over a sequence of scalar arguments whose types must match
      the callee’s `param_types`,
  - semantically, a call:
    - evaluates each argument expression to a scalar value in the caller,
    - transfers control to the callee’s entry block with a fresh frame in
      which parameter value slots `0..N-1` are initialized from those
      arguments,
    - on `Return`, writes the callee’s returned scalars into the caller’s
      destination `ValueId`s (in order) and continues execution in the caller.

The IR also supports calls to external (linker-provided) functions via an
explicit external-function table and call instruction:

- `IrProgram.extern_functions`
  - a list of external functions referenced by the program, each with:
    - a symbol name (as it should appear to the linker),
    - a scalar `param_types` slice,
    - and a scalar `result_types` slice.
- `CallExtern`
  - calls an external function identified by index in `extern_functions`,
  - argument and destination value IDs must match the referenced signature,
  - on `linux/x86_64`, the ELF back-end lowers this in different ways depending
    on the selected output kind:
    - for relocatable object and static library outputs, emits a `.rela.text`
      relocation against an undefined function symbol so downstream linkers can
      resolve it,
    - for shared library and dynamically-linked executable outputs, emits a
      dynamic import and routes the call through a GOT slot that is relocated
      by the platform dynamic loader.

The IR also supports reading external (linker-provided) data symbols via an
explicit extern-data table and load instruction:

- `IrProgram.extern_data`
  - a list of external data symbols referenced by the program, each with:
    - a symbol name (as it should appear to the linker),
    - and the scalar type of the value loaded from that symbol.
- `LoadExtern`
  - loads the current value of an external data symbol identified by index in
    `extern_data` into a destination `ValueId`,
  - the destination’s `ScalarType` must match the referenced extern-data
    entry’s scalar type,
  - on `linux/x86_64`, the ELF back-end lowers this in different ways depending
    on the selected output kind:
    - for relocatable object and static library outputs, emits a `.rela.text`
      relocation against an undefined object symbol so downstream linkers can
      resolve it,
    - for shared library and dynamically-linked executable outputs, emits a
      dynamic import and routes the load through a GOT slot that is relocated
      by the platform dynamic loader.

## Relationship to Front-End and Back-End

Short term (current implementation):

- The IR is now part of the primary executable build path on `linux/x86_64`:
  - the front-end (parser + checker) produces an `ast.Module`,
  - `src/lower_ir.zig` lowers supported programs into `ir.Function` /
    `ir.Program` graphs,
  - `src/backend_ir_elf.zig` lowers those IR graphs directly to a minimal
    native ELF64 executable (no C stub, no external compiler).
- A constant-expression fallback remains in place for programs that type-check
  but are not yet handled by IR code generation:
  - `src/backend_ir_const.zig` attempts IR lowering + interpretation for
    constant-style `fn main() -> int` programs using `src/ir_eval.zig`,
  - if that fails, callers fall back to the legacy AST-based constant
    evaluator in `src/backend_const.zig`,
  - `src/backend_const.zig` emits the tiny ELF64 stub executable for this
    constant-only path.

Medium term:

- The front-end will gain a richer lowering pass that translates general
  (non-constant) Silk functions into `IrFunction` graphs, including:
  - boolean values and comparisons,
  - structured control flow for `if`/`else` and loops expressed as
    multiple basic blocks connected by `Br`/`BrCond`.
- The existing IR interpreter will remain the reference semantics for IR
  programs and will be extended to cover any new instruction kinds.
- Back-ends for ELF/Mach-O/PE will lower from IR to target-specific machine
  code or object files. The current constant-expression ELF64 emitter is a
  minimal slice of this design, not a separate “non-IR” path.

The IR is designed so that importing and exporting package symbols can be
modeled cleanly at the function and module level. Symbol visibility and
package graphs are described in `docs/compiler/architecture.md`; the IR is
one of the layers that will carry that information down to the back-end.

## Lowering Structured Control Flow

Structured control flow in the surface language (`if` / `else` and `while`)
is lowered into explicit basic blocks and branches in IR. The design is:

- Conditions are lowered using a dedicated helper that produces an integer
  value interpreted as a boolean (`0` = false, non‑zero = true).
- `if` / `else` statements become:
  - an entry block that evaluates the condition and terminates in
    `BrCond(cond, then_block, else_block)`,
  - a `then` block containing the lowered then‑branch statements,
  - an `else` block (when present) containing the lowered else‑branch
    statements,
  - an optional join block that receives control when both branches fall
    through (that is, when neither branch unconditionally returns, breaks,
    or continues).
- `while` loops become:
  - a loop header block that evaluates the condition and terminates in
    `BrCond(cond, body_block, exit_block)`,
  - a body block that contains the lowered loop body and typically ends in
    a `Br` back to the header or a `Br` to the exit (for `break`),
  - an exit block that receives control when the loop condition is false.

Current implementation status:

- A narrow, constant‑oriented lowering in `src/lower_ir.zig` is wired into
  the compiler:
  - `lowerMainFunction` lowers constant‑style `fn main() -> int` functions
    into a single‑block `ir.Function` using integer literals, arithmetic,
    and a restricted control‑flow surface (constant `while` and terminating
    `if` with compile‑time boolean conditions).
  - `lowerBranchingMainFunction` lowers a specific branching
    `fn main() -> int` shape into a three‑block IR graph:
    - an entry block that evaluates a non‑constant boolean condition (using
      integer comparisons and boolean literals), followed by `BrCond`,
    - a then block that contains `let` bindings and a `Return`,
    - an else block that contains `let` bindings and a `Return`.
- More general lowering of `if`/`else` and `while` throughout function
  bodies will follow this block‑structured design:
  - nested control flow is expressed by nesting these patterns,
  - join blocks are introduced where multiple paths must converge before
    execution can continue,
  - the IR remains free of implicit control flow; all transfers are
    represented explicitly with `Br` / `BrCond` / `Return`.

## Multi-Function Programs and Calls

Multi-function programs are represented at the IR level using `IrProgram` and
the `Call` instruction:

- `IrProgram` groups a set of `IrFunction` values and identifies an entry
  function index that serves as the starting point when interpreting or
  executing the program.
- Functions within an `IrProgram` may call each other using `Call`:
  - the initial design targets simple scalar-returning helpers of the form
    `fn helper(x: int, y: u8, flag: bool, ...) -> u8` and `fn main() -> int`,
  - calls are direct: the instruction encodes the callee’s function index,
    and recursion is allowed at the IR level (subject to front-end limits),
  - each `IrFunction` records a `param_count` indicating how many parameters
    it expects; parameters are modeled as value IDs `0..N-1`
    that are initialized at function entry.
- The IR interpreter models calls using an explicit call stack:
  - each activation has its own value storage for the callee’s `ValueId`
    space,
  - `Return` instructions pop the current frame and resume the caller,
    writing the callee’s returned scalars into the caller’s destination
    `ValueId`s (in order).
- Native back-ends (starting with the existing ELF64 emitter) lower
  `Call` / `Return` to a concrete calling convention:
  - for `linux/x86_64`, the current implementation follows a simplified
    subset of the System V AMD64 ABI for scalar parameters:
    - integer-like scalars (`Bool` and integers) use the first six
      general-purpose registers (`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`),
    - floats (`F32`/`F64`) use up to 8 XMM registers (`xmm0`..`xmm7`),
    - any additional scalar arguments are spilled to the caller's stack in
      8-byte slots in source order,
    - the caller maintains 16-byte stack alignment before `call` (padding
      by one 8-byte slot below the stack arguments when an odd number of
      stack-passed arguments are present), and
    - results follow the same ABI-style shape as the IR signature:
      - `void` (0 results) returns no value in registers,
      - 1 scalar result returns in `rax` (integer-like) or `xmm0` (float),
      - 2 scalar results return in up to two registers per class (integer-like
        in `rax`/`rdx`, floats in `xmm0`/`xmm1`, assigned in order by class),
      - 3+ scalar results return indirectly via a hidden sret pointer passed
        in `rdi` (shifting integer-like argument registers by one); the caller
        allocates a return buffer and the callee stores returned 8-byte scalar
        slots sequentially into it, returning the same pointer in `rax`,
  - additional types and full ABI parity will be introduced as the language
    and ABI docs are extended.

These multi-function and call semantics are designed here so that IR,
interpreter, and back-ends can evolve in lockstep; the current codebase
still operates primarily on single-function programs, with calls introduced
incrementally in tests and then in the compiler’s lowering pipeline.

## Status

- `src/ir.zig` defines the initial IR data structures and minimal operations
  for:
  - value IDs and their associated scalar types (`Bool`, fixed-width
    integers, and floats; the current lowering primarily uses `I64`, `Bool`,
    `U32` for surface `char`, and `F64`/`F32` where float literals or
    annotations are present),
  - instructions for scalar constants (`ConstInt` as raw bits), integer and
    float arithmetic (`Add*`/`Sub*`/`Mul*`/`Div*` and `ModInt`), bitwise ops,
    and integer/float comparisons (choosing signed/unsigned semantics for
    ordered integer operations based on the operand type),
  - basic blocks and functions with explicit `Br` / `BrCond` / `Return`
    control-flow terminators,
  - a `Call` instruction for direct calls between scalar-returning
    functions with scalar parameters (currently exercised in tests and
    CLI/ABI paths with helpers taking up to ten `int` parameters), and an
    `ir.Program` type that groups multiple functions with a designated
    entry index.
- `src/ir_eval.zig` provides IR execution helpers that:
  - evaluate call-free scalar `ir.Function` graphs (including multiple basic
    blocks and branches) via `evalSingleBlockScalarFunction` (with the
    convenience wrapper `evalSingleBlockIntFunction` for `I64`), and
  - evaluate scalar `ir.Program` graphs that use direct `Call` instructions
    via `evalProgramScalar` (with the convenience wrapper `evalProgramInt`
    for `I64` entrypoints), maintaining an explicit call stack and returning
    the value produced by the program’s entry function,
  - canonicalizing each scalar result to its `ScalarType` using
    `ir.canonicalize` so that signed/unsigned semantics and fixed-width
    truncation behavior match the native backend.
- Tests in `src/tests.zig` construct:
  - an IR function equivalent to:

    ```silk
    fn main() -> int {
      return 1 + 2 * 3;
    }
    ```

    and assert both its instruction layout and that `ir_eval` produces `7`,
  - small multi-block IR functions that use `BrCond` to select between two
    return blocks and to implement a simple loop, asserting that branching
    behaves as expected, and
  - a two-function IR program equivalent to:

    ```silk
    fn helper() -> int { return 5; }
    fn main() -> int { return helper() + 2; }
    ```

    wrapped in an `ir.Program` with `main` as the entry and evaluated using
    `evalProgramInt`, asserting that the result is `7`,
  - IR programs where helpers take many scalar parameters and `Call`
    instructions exercise register and stack parameter passing on
    `linux/x86_64` (including both integer-like and `f32`/`f64` arguments),
  - multi-function programs lowered from surface syntax in which
    scalar-returning helper functions are called from `main`.
- `src/lower_ir.zig` implements lowering passes from checked AST to IR:
  - `findExecutableMain` locates a top-level `fn main() -> int` matching
    the executable entrypoint rule,
  - `lowerMainFunction` lowers a small subset of such functions into a
    single-block `ir.Function` using integer literals, arithmetic
    (`+`, `-`, `*`, `/`, `%`), and a restricted control-flow surface:
    - top-level and block-local `let` bindings with constant integer
      initializers whose names can be referenced later,
    - `while` loops whose conditions are compile-time boolean literals
      (`true`/`false`) and whose bodies, in the `while true` case, consist
      only of constant `let` bindings followed by a `break;` (loops that do
      not meet this shape are rejected by the lowering),
    - a final `return` statement or an `if` with a compile-time boolean
      condition whose selected branch ends in a `return`.
  - `lowerBranchingMainFunction` lowers a specific branching
    `fn main() -> int` shape into a three-block IR graph:
    - an entry block that evaluates a non-constant boolean condition (using
      integer comparisons and boolean literals), followed by `BrCond`,
    - a then block that contains `let` bindings and a `Return`, and
    - an else block that contains `let` bindings and a `Return`.
  - `lowerIntProgramFromModule` performs program-level lowering for small
    collections of scalar-returning helper functions (including `main`):
    - despite the historical `Int` naming, participating helpers have typed
      scalar parameters (defaulting to `int` when unannotated) and return a
      supported scalar (`int`, `bool`, `char`, `f32`/`f64`, or fixed-width
      integers); `main` remains `fn main() -> int` with no parameters,
    - each helper body either:
      - consists of zero or more integer `let` bindings followed by a
        single `return` expression, or
      - ends in a simple `if` / `else` of the form:

        ```silk
        if <cond> {
          [let ...;]
          return <expr>;
        } else {
          [let ...;]
          return <expr>;
        }
        ```

        where `<cond>` is a boolean expression supported by
        `lowerBoolExprWithCalls` (comparisons over integer and float
        expressions, boolean literals, boolean locals, and calls to
        `bool`-returning helpers), both branches end in `return`, and any
        preceding statements are lowered via `lowerNonTerminatingStmt`,
      - or, in the growing loop subset, contains one or more `while` loops
        before the final `return` where:
        - the loop condition is a boolean expression supported by
          `lowerBoolExpr` (for example, `n > 0`), and
        - each loop body consists only of scalar `let` bindings (unannotated
          locals are currently restricted to integers) and optional `break;`
          or `continue;` statements (no nested `if` / `while` or `return` in
          the loop body), which are lowered into explicit loop-header, body,
          and exit blocks using `Br` and `BrCond` (with `break;` branching to
          the loop’s exit block and `continue;` branching back to the loop
          header),
    - expressions in `let` initializers and return values are drawn from
      the same scalar arithmetic/comparison subset as `lowerMainFunction`
      (plus floats when annotated) but may also include direct calls between
      helpers via `Call`.
  - `lowerIntProgramCfgFromModule` extends program-level lowering to a more
    general CFG-based subset for scalar-returning helpers:
    - helpers have typed scalar parameters (defaulting to `int` when
      unannotated) and return a supported scalar (including `bool`, `char`,
      and floats on `linux/x86_64`),
    - bodies may contain scalar `let` bindings, nested `if` / `else`
      statements, `while` loops with boolean conditions, `break` /
      `continue` inside loops, and `return` statements with scalar
      expressions,
    - call expressions may also appear as standalone statements (the return
      value is discarded),
    - expressions are drawn from the same integer arithmetic subset as the
      other integer lowerings but may include direct calls between helpers
      via `Call` and boolean expressions that use short-circuit logical
      operators `&&` and `||`:
      - in condition position, these are lowered into explicit control flow
        using additional basic blocks and `Br` / `BrCond`,
      - in value position (for example `let flag: bool = a && b;` or
        `return a || b;` in a `bool`-returning helper), these are lowered into
        explicit control flow that preserves short-circuit evaluation while
        producing a merged boolean result using the `Copy` instruction,
    - each helper is lowered into a multi-block `ir.Function` whose basic
      blocks are connected via `Br` / `BrCond` and terminated by `Return`,
      and
    - this path is used by both the IR interpreter and the native backend
      for helper-heavy programs that fall outside the narrower shapes
      supported by `lowerIntProgramFromModule`.
  - `lowerExecutableProgramCfgFromModule` and `lowerExecutableProgramCfgFromModuleSet`
    build on the same CFG-based helper lowering but also:
    - allow a limited `string` subset at function boundaries (`SilkString { ptr, len }` as `u64`/`i64` scalars),
    - support a small `string` expression subset in function bodies (string literals, `let` bindings, `return`, and calls to `string`-returning helpers), and
    - collect anonymous rodata byte blobs referenced by function bodies so the ELF backend can emit them and patch `.text`→rodata references.
  - an additional CFG-oriented lowering helper `lowerIntFunctionCfg` lowers
    general integer-returning, parameterless functions into multi-block
    `ir.Function` values suitable for both `ir_eval` and the native backend:
    - bodies may contain integer `let` bindings, nested `if` / `else`
      statements, `while` loops with boolean conditions, `break` /
      `continue` inside loops, and `return` statements with integer
      expressions,
    - nested control-flow is expressed entirely in terms of basic blocks
      connected by `Br` / `BrCond` and `Return` terminators, and
    - this helper is exercised in tests and, for `fn main() -> int`, is now
      the first lowering attempted by the IR→ELF backend on
      `linux/x86_64` for executable builds.
- `src/backend_ir_const.zig` integrates this lowering and the IR interpreter
  into the executable build paths:
  - the CLI (`src/driver.zig`) and the C ABI (`src/abi.zig`) first attempt
    to evaluate `fn main() -> int` via IR lowering + interpretation,
  - if that fails, they fall back to the legacy constant-expression evaluator
    in `src/backend_const.zig`,
  - in both cases, `src/backend_const.zig` is still responsible for emitting
    the minimal ELF64 executable used by the current implementation.
- `src/backend_ir_elf.zig` provides an IR→ELF64 backend for `linux/x86_64`
  that emits native executables directly from typed scalar IR graphs:
  - it exposes a convenience helper `emitIrFunctionExecutable` for
    single-entrypoint programs, which internally wraps an `ir.Function`
    into a one-function `ir.Program`, and a program-level
    `emitProgramExecutable` that operates on `ir.Program` values with
    multiple scalar-returning functions,
  - each function body may contain multiple basic blocks connected by
    `Br` / `BrCond`, using:
    - `ConstInt`, integer arithmetic/bitwise (`*Int`) and float arithmetic
      (`*Float`),
    - integer and float comparisons (`Cmp*Int`/`Cmp*Float`) that produce
      `0`/`1` values,
    - explicit branches (`Br`, `BrCond`), and
    - `Return` of a scalar value, which is returned in `rax` from the
      function (or in `xmm0` for floats); a small entry stub calls the
      program’s entry function and
      then performs `sys_exit(result)` so that the overall process exit
      status matches the returned integer value (entrypoints that return
      floats are rejected),
    as long as every block is terminated by a `Return`, `Br`, or `BrCond`
    and all branch targets refer to valid blocks, and
  - at the IR level, direct calls between functions are represented via the
    `Call` instruction; `emitProgramExecutable` lowers these to direct
    `call rel32` instructions between the generated function bodies for the
    current scalar calling convention, which follows a subset of the
    System V AMD64 ABI: integer-like scalars use `rdi`..`r9`, floats use
    `xmm0`..`xmm7`, and remaining arguments spill to the stack with 16-byte
    stack alignment preserved, returning results in `rax` or `xmm0`,
  - CLI and C ABI build paths feed this backend via
    `backend_ir_elf.emitConstMainExecutableFromModuleIR`, which:
    - first attempts CFG-oriented lowering of `fn main() -> int` using
      `lowerIntFunctionCfg` so that nested `if` / `else` and `while`
      (with `break` / `continue`) in the entrypoint are handled by the
      native backend,
    - then prefers the narrow three-block branching `main` produced by
      `lowerBranchingMainFunction` when the entrypoint has an `if` / `else`
      shape with a non-constant comparison condition but does not fit the
      more general CFG subset,
    - next attempts program-level helper lowering via
      `lowerIntProgramFromModule` for modules containing one or more
      scalar-returning helper functions whose bodies consist of `let`
      bindings, simple trailing `if` / `else` forms, and a final `return`
      expression that may include direct calls between those helpers,
    - then attempts a broader CFG-based helper lowering performed by
      `lowerExecutableProgramCfgFromModule` for modules whose helpers use the
      general structured control flow described above (and which may also
      materialize rodata addresses, for example for string literals), and
    - finally falls back to the original single-block `main` lowered by
      `lowerMainFunction` or to the constant-expression stub when IR
      lowering or code generation are not yet implemented for a given
      program or target,
  - the CLI (`silk build`) and the C ABI (`silk_compiler_build` for
    `SILK_OUTPUT_EXECUTABLE`) therefore exercise the IR→ELF backend for
    constant-style programs, helper-call programs, and a growing subset of
    general structured-control-flow programs on `linux/x86_64`.

The next IR-focused steps for the back-end are:

- extend front-end lowering beyond the current scalar subset so that
  pointer-like types and aggregates are emitted explicitly in IR and
  correctly mapped to target calling conventions and layout rules,
- document and implement IR support for the language’s richer expression
  forms (for example, general expression statements beyond call statements,
  more complex boolean
  combinations, and eventually higher-level constructs such as `match`),
- extend the current IR→ELF backend beyond `linux/x86_64` and the current
  scalar subset:
  - non-executable outputs (ELF relocatable objects, static libraries, and
    shared libraries) are implemented for `linux/x86_64` for the same scalar
    subset as executables, including emitting exported constants (`export let`)
    as data symbols (scalars, plus exported `string` constants as `SilkString`
    `{ ptr, len }` data backed by `.rodata` bytes), and embedding anonymous
    rodata byte blobs referenced from function bodies (for example string
    literals) with the required `.text`→rodata fixups for each output kind,
  - next steps include relocations for true external linking (e.g. calling
    external symbols and referencing external data), additional
    object formats/targets (Mach-O/PE), and aggregate/pointer-like IR
    lowering, while continuing to avoid any C-based transpilation step.
