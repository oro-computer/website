# Structs, Impl Blocks, and Memory Layout

Structs and impl blocks are separated:

- `struct` declarations define pure data layout.
- `impl` blocks attach behavior to types without changing their layout.

## `struct` Declarations

Structs define a composite data type made of named fields:

```silk
struct Packet {
  sequence: u32,
  size: u16,
  flag: u8,
}
```

Key rules:

- Structs contain only data members.
- Memory layout and padding are well-defined so that FFI and ABI rules can rely on them.
- Stack vs heap allocation is specified in `docs/language/memory-model.md`.

### Generic structs

Structs may declare type parameters:

```silk
struct Data(T) {
  value: T,
}
```

Rules:

- A generic `struct Name(T, ...)` introduces a **type constructor** `Name`.
- Outside a generic context, uses of the type must be fully applied (for
  example `Data(u8)`), not bare `Data`.
- A declaration name may not be reused across different generic arities (for
  example `struct Foo { ... }` and `struct Foo(T) { ... }` cannot both exist in
  the same namespace).

### Field Default Initializers

Struct fields may include an optional default initializer expression:

```silk
struct Point {
  x: int = 0,
  y: int = 0,
}
```

When a struct literal omits a field, the compiler initializes the field from its
default expression.

In the current compiler subset, default field expressions use the same
restriction as default function arguments:

- no name references, and
- no `new`.

Example:

```silk
struct Point {
  x: int = 0,
  y: int = 0,
}

fn main () -> int {
  let p = Point{ x: 5 };
  return p.y; // defaults to 0
}
```

### Single Inheritance (`extends`)

Silk supports **single inheritance** for `struct` declarations via `extends`.

Surface syntax:

```silk
struct Base {
  x: int,
  y: int = 0,
}

struct Derived extends Base {
  z: int,
}
```

Semantics (implemented subset):

- A derived struct inherits all fields of its base struct.
- The derived struct’s field sequence is:
  1) all base fields (in declaration order), then
  2) all derived fields (in declaration order).
- Field access on the derived struct can refer to inherited base fields
  directly (`d.x`, `d.y`).
- Default field initializers are inherited:
  - a `Derived{ ... }` literal may omit inherited fields that have defaults in
    the base struct.

Type checking rules (implemented subset):

- `extends` is permitted only on non-opaque `struct` declarations.
- The base name must resolve to a `struct` type in the compiled module set.
- Cycles in `extends` chains are rejected.
- A derived struct may not declare a field whose name conflicts with an
  inherited field name.

Notes:

- `extends` does not imply implicit subtyping in the current compiler subset:
  there is no implicit coercion from `Derived` to `Base` (or `&Derived` to
  `&Base`) yet.

### Opaque Structs (FFI Handles)

Opaque structs are a special form of `struct` declaration intended for safely
representing foreign pointers/handles from C APIs.

Syntax:

```silk
// Declares an opaque handle type.
struct MyFFIHandle;
```

An opaque struct has **no fields** and **no Silk-defined layout**. It exists
only as a nominal handle type that can be passed around safely.

Rules (implemented):

- Opaque structs **cannot be instantiated** (no struct literals).
- Opaque structs **do not support field/member access** (`.` / `?.`).
- Opaque structs **must not be used by value** in type positions (locals,
  parameters, results). Only the reference form `&MyFFIHandle` is allowed.

These rules increase safety at the language boundary:

- **Eliminates type confusion**: distinct handle types such as `&DatabaseHandle`
  and `&FileHandle` are not interchangeable.
- **Prevents invalid operations in Silk**: Silk code cannot read/write fields or
  assume a size/layout for the foreign type.

#### Safety and Undefined Behavior (UB)

Opaque handles do not carry lifetime information. You are responsible for
calling the corresponding destruction/free function provided by the foreign
library.

Using an opaque handle after it has been destroyed is **undefined behavior**.
The compiler does not currently enforce this at compile time.

#### ABI and Lowering (Current Subset)

In the current backend subset, an `&Opaque` value is lowered as a single pointer
scalar (`u64` on the current `linux/x86_64` target), rather than as a
struct-of-pointers like `&struct` borrows.

### Memory Layout (Intended Contract)

The long-term Silk design is for `struct` layout to match conventional C layout
rules for the corresponding field types on the target:

- **Sequential layout**: fields appear in memory in the exact order they are
  declared in the `struct` definition.
- **Alignment and padding**: each field is placed at an offset that is a
  multiple of the field type’s required alignment. The compiler inserts padding
  bytes where necessary.
- **Final padding**: the overall struct size is padded to a multiple of the
  struct’s alignment (typically the maximum alignment of its fields), so arrays
  of the struct keep each element correctly aligned.

Example (typical C layout on `linux/x86_64`):

```silk
struct Packet {
  sequence: u32, // 4 bytes
  size: u16,     // 2 bytes
  flag: u8,      // 1 byte
}
```

Conceptually, this layout would be:

- `sequence` at offset `0` (4 bytes)
- `size` at offset `4` (2 bytes)
- `flag` at offset `6` (1 byte)
- 1 byte of tail padding at offset `7` to make the total size a multiple of 4

Total size: 8 bytes (alignment 4).

### Memory Layout (Current Implementation)

The current compiler/backend subset does **not** implement packed C-like struct
layout yet. Instead, it uses a *scalar slot* model:

- A `struct` value is lowered into a sequence of scalar “slots” in source order,
  after recursively expanding certain composite field types:
  - `string` contributes two slots: `(u64 ptr, i64 len)`.
  - nested non-opaque structs contribute their slot sequence.
  - optionals contribute `(bool tag, payload slots...)`, where payload slots
    follow the lowering of the underlying non-optional type.
- When a `struct` is stored in memory (stack locals and heap boxes), each slot
  is stored in a separate **8-byte cell**.
  - This means sub-64-bit fields (`bool`, `i8`/`u8`, `i32`/`u32`, `f32`, `char`,
    etc.) are not packed yet.
  - Values are still *typed* as their declared scalar kinds (the checker and IR
    track widths/sign), but the physical in-memory representation is widened to
    one 8-byte slot per scalar.

This design keeps lowering/codegen simple and lets the compiler support nested
aggregates without committing to a final packed layout. The trade-off is that
the in-memory representation is not ABI-compatible with a C struct unless the
struct is restricted to ABI-safe 64-bit slots.

Example (current implementation): the `Packet` above is lowered as 3 scalar
slots and occupies 24 bytes when stored in memory (3 × 8-byte cells), even
though the intended C-like packed layout would be 8 bytes.

### ABI and Code Generation (Implemented Subset)

The Silk language design includes full support for user-defined structs, nested
aggregates, and FFI-safe ABI mapping. The current compiler/backend
implementation supports only a narrow, explicitly documented subset:

- Only "plain" structs with **1+ fields** are supported by codegen.
- Fields may be:
  - scalar primitive types (`bool`, fixed-width integers, `int`, `char`,
    `f32`/`f64`, `Instant`, `Duration`),
  - `string` (lowered as `{ ptr: u64, len: i64 }`),
  - nested (non-opaque) structs,
  - and optionals (`T?`) of supported payload types.
- At ABI boundaries (exported functions and `ext` declarations), structs must be
  ABI-safe: after slot-flattening, all slots must be `i64`/`u64`/`f64` (for
  example `string` fields are ABI-safe because they lower to `(u64, i64)`, but
  `bool`, `char`, and `f32` fields are not).
- Such structs are passed and returned by value by lowering them to their
  scalar slots in order and following the System V AMD64 ABI rules for
  those scalar slots:
  - integer-like slots consume general-purpose argument slots (`rdi`, `rsi`,
    `rdx`, `rcx`, `r8`, `r9`, then the stack),
  - `f32`/`f64` slots consume XMM argument slots (`xmm0`..`xmm7`, then the stack),
  - 1–2 slot results use `rax`/`rdx` for integer-like slots and `xmm0`/`xmm1`
    for float slots, with mixed aggregates using both,
  - 3+ slot results return indirectly via a hidden sret pointer passed in `rdi`
    (caller-allocated return buffer), with the callee storing each scalar slot
    sequentially and returning the pointer in `rax`.

Note: at the C ABI surface, exported functions accept ABI-safe structs by
flattening parameters to their scalar slots in order. For 1–2 slot structs this
is ABI-compatible with passing an equivalent by-value C struct parameter, while
for 3+ slot structs downstream C callers should declare separate scalar
parameters for the slots. Struct returns with 3+ slots use sret and are
ABI-compatible with returning an equivalent C struct by value.

This subset is intentionally small so that we can validate the end-to-end type
pipeline (parsing → checking → lowering → IR→ELF codegen) while keeping ABI
behavior consistent with C for the supported cases.

## `impl` Blocks

`impl` blocks attach functions and methods to existing types without affecting
memory layout.

The intent is to provide “high-level” APIs without baking behavior into `struct`
layout. In the initial implementation, `impl` blocks are *syntax and
type-checking structure*; code generation treats methods as ordinary functions
that follow the same calling conventions as other Silk functions.

### Generic impl blocks

If a type is declared with type parameters (struct or enum), its impl blocks
must also declare those type parameters:

```silk
struct Data(T) { value: T }

// OK:
impl Data(T) {
  fn get(self: &Self) -> T { return self.value; }
}

// Error:
// impl Data { ... }
```

This rule makes monomorphization explicit and ensures method receivers are not
ambiguous when the type is specialized.

### Syntax

```silk
impl List {
  // Ordinary static method (no receiver).
  fn init (cap: i64) -> List { ... }

  // Heap constructor used by `new List(...)` (special name, receiver + `void`).
  fn constructor (mut self: &Self, cap: i64) -> void { ... }

  // Instance method (receiver as first parameter).
  public fn len (self: &List) -> i64 { ... }

  // Mutating instance method (mutable receiver).
  public fn push (mut self: &List, value: u8) -> void { ... }
}
```

Rules:

- An `impl` block attaches methods to exactly one nominal type name (a `struct`
  or an `enum`).
- Multiple `impl` blocks may exist for the same type name; the compiler merges
  their methods (subject to duplicate-name rules).
- Methods inside an `impl` block are `fn` declarations (with bodies).
- The receiver, when present, is the first parameter and must be a borrowed
  reference to the `impl` type (`self: &Type` or `mut self: &Type`).
- Within an `impl` block, the special type name `Self` may be used anywhere a
  type name is accepted, and is treated as an alias for the `impl` type.
  For example, `self: &Self` is equivalent to `self: &Type`, and `-> Self` is
  equivalent to `-> Type`.
- Static methods omit the receiver parameter.
- Method visibility:
  - Methods are **private by default**: a method declared without an explicit
    visibility modifier is callable only within the **defining `impl { ... }`
    block**.
  - `public fn` marks a method as callable from outside the defining `impl`
    block.
  - `private fn` is permitted to make intent explicit.
  - `export` is reserved for static members (no `self` receiver) and is not
    permitted on instance methods; use `public fn` instead.
  - When an `impl` block declares conformance to an interface (`impl T as I`),
    the interface’s required methods are **public by definition**:
    - the corresponding impl methods may omit `public`, but
    - they may not be explicitly marked `private`.
    See `docs/language/interfaces.md`.
- The method named `constructor` is treated specially:
  - it is only meaningful for `struct` types (it backs `new Type(...)`); enums
    do not support `constructor` methods in the current subset,
  - it is `public` by default,
    - when explicitly marked `private`, it is callable only within the defining
      `impl { ... }` block,
  - it may be declared multiple times in a single `impl` block (an overload set),
  - its overload set includes `constructor` declarations across all merged
    `impl` blocks for the type,
  - it is invoked by heap allocation (`new Type(...)`) and by certain
    call-argument coercions (see `docs/language/types.md`),
  - `new Type(args...)` invokes the unique overload whose receiver is
    `mut self: &Type`, whose return type is `void`, and whose non-receiver
    parameter list matches `args...` after applying the normal call-argument
    type-checking rules,
  - if multiple overloads are applicable, the compiler prefers overloads that do
    **not** rely on implicit call-argument coercions (notably the `U -> &T`
    constructor coercion for `&T` parameters); if multiple overloads remain tied,
    the call is rejected as ambiguous.

### Call syntax

The surface call syntax uses field-access + call:

- Instance method call: `value.method(arg0, arg1, ...)`
- Static method call: `Type.method(arg0, arg1, ...)`

Semantically, method calls behave like ordinary function calls where the
receiver is passed as an explicit first argument.

Static-method receiver sugar (current subset):

- If `value.method(...)` does not resolve to an instance method (a method whose
  first parameter is a receiver `self: &Type` / `mut self: &Type`), the
  compiler may resolve it as a call to a visible static method of the receiver
  type by inserting the receiver as the first argument: `Type.method(value, ...)`.
- This supports fluent chaining for value-consuming helper APIs like
  `std::result::Result.unwrap_or`:

  ```silk
  let r: R = /* ... */;
  let x: int = r.unwrap_or(0); // sugar for `R.unwrap_or(r, 0)`
  ```

Mutability rule (current subset):

- If the method receiver is `self: &Type`, the call site passes a read-only
  borrow of the receiver (for example `value.method(...)`).
- If the method receiver is `mut self: &Type`, the call site must pass a
  mutable borrow of the receiver.
  - When the receiver is a **name binding** that is mutable (`let mut value = ...`)
    or a mutable reference binding (for example a `mut self: &Type` receiver),
    the compiler treats `value.method(...)` as a mutable receiver call (no
    `(mut value)` wrapper required).
  - The explicit `(mut value).method(...)` form is permitted but is no longer
    required for name receivers.

Current subset limitations:

- Mutable receiver calls must use a name receiver; mutable borrows from
  non-name receiver expressions (for example `make().push(1)`) are rejected.
- Non-`mut` receivers may be arbitrary expressions (including calls), so
  chaining like `url.href().as_string()` is permitted.

Compiler requirements:

- Keep data layout and behavior separate in the IR.
- Preserve struct layout exactly for ABI and FFI.
- Enforce rules for opaque structs and UB as described in this document and the ABI spec.
