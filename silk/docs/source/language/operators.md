# Operators

This document summarizes the operator set and precedence for Silk.

## Operator Set

The language includes the following operators and delimiters:

- Assignment and compound assignment: `=`, `+=`, `-=`, `*=`, `/=`.
- Increment/decrement: `++`, `--` (prefix and postfix).
- Arithmetic: `+`, `-`, `*`, `/`, `%`.
  - Currently:
    - integer operands support `+`, `-`, `*`, `/`, and `%`,
    - floating-point operands (`f32`/`f64`) support `+`, `-`, `*`, and `/`
      (no `%`).
    - unary `-x` is supported for both integer and floating-point operands.
    - time types support a small arithmetic subset:
      - `Duration + Duration`, `Duration - Duration`, and unary `-Duration`,
      - `Instant + Duration`, `Duration + Instant`, `Instant - Duration`,
      - and `Instant - Instant` (producing a `Duration`).
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`.
  - Currently, bitwise operators are defined for
    integer operands (`int` and the fixed-width integer types):
    - `&`, `|`, `^` perform bitwise AND/OR/XOR on two integer values of the
      same type and produce a result of that same type.
    - `~x` performs bitwise NOT on an integer value and produces a result of
      that same type.
    - `<<`, `>>` shift the left-hand integer operand by an integer shift
      amount of the same type; `>>` uses an arithmetic right shift for
      signed integers (`i*`/`int`) and a logical right shift for unsigned
      integers (`u*`).
- Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`.
  - Currently, comparisons are defined for both integer
    operands and floating-point operands of the same type.
  - In the current backend subset, `==` and `!=` are also defined for `bool`
    operands.
  - In the current backend subset, comparisons are also defined for `Duration`
    and `Instant` when both operands have the same time type.
  - In the current backend subset, `==` and `!=` are also defined for `string`
    operands, comparing the underlying UTF-8 byte sequences for equality
    (length check + bytewise compare).
  - In the current backend subset, ordered comparisons over `string`
    (`<`, `<=`, `>`, `>=`) are defined as bytewise lexicographic ordering over
    the underlying UTF-8 byte sequences (unsigned byte comparison, with
    shorter-prefix ordering when one string is a prefix of the other).
  - In the current backend subset, `==` and `!=` are also defined for supported
    optional values (`T?`, `string?`, optionals of the supported `struct`
    subset, and nested optionals `T??`):
    - `None == None` is true,
    - `Some(x) == Some(y)` compares the payload values for equality (recursively
      for nested optionals),
    - and `!=` is the logical negation of `==`.
    - Currently, `None` and `Some(...)` can appear in
      equality expressions when the other operand has an optional type (for
      example `opt == None` and `opt == Some(x)`), using that other operand’s
      type to infer the optional payload type.
  - In the current backend subset, `==` and `!=` are also defined for the
    supported `struct` subset (see `docs/language/structs-impls-layout.md`),
    performing slot-wise equality over the lowered scalar slots (including
    embedded strings, nested structs, and optionals); float slots use IEEE-754
    equality semantics. Ordered struct comparisons are not implemented.
  - Float comparisons follow IEEE-754 semantics: `NaN` compares unequal to
    everything (including itself), and ordered comparisons (`<`, `<=`, `>`,
    `>=`) are false when either operand is `NaN`.
- Logical: `!`, `&&`, `||`.
  - Currently:
    - `!` is supported for `bool` operands.
- Member and scope: `.`, `::`, `?.`.
- Currently:
  - `.` and `::` are supported,
  - and `?.` is supported for optional field access on the supported `struct`
    subset (`opt?.field` yields `FieldType?`; see `docs/language/optional.md`).
- Casts: `as` and `as raw` (postfix).
  - Syntax:
    - numeric/shape cast: `<expr> as <Type>`,
    - raw bit-cast: `<expr> as raw <Type>`.
  - `as` is an explicit, potentially lossy conversion operator intended for
    primitive numeric conversions (see “Casts (`as`)” below).
  - `as raw` is an explicit bit reinterpretation operator intended for
    generic storage/marshalling of scalar values (see “Raw casts (`as raw`)”
    below).
- Typed error propagation: `?` (postfix).
  - Syntax: `<call_expr>?`.
  - This propagates typed errors from an error-producing call to the enclosing
    function; see `docs/language/typed-errors.md`.
- Ranges: `...`, `..=`, `..`.
- Other punctuation: `?`, `??`, `->`, `=>`, `,`, `;`, `(`, `)`, `{`, `}`, `[`, `]`, `_`, `:`.
  - Currently, `??` is supported for optionals in the
    current backend subset (including scalar, `string`, and the current
    `struct` subset, plus nested optionals in the supported payload subset;
    see `docs/language/optional.md`). The `?` token is used both in type
    annotations (`T?`) and as the postfix typed error propagation operator for
    error-producing calls (`call()?`; see `docs/language/typed-errors.md`).

The lexer and parser must recognize these tokens exactly as specified, and precedence/associativity must match the formal grammar.

## Assignment

Assignment updates an existing binding (an lvalue). Assignment is “statement-like”:
it is parsed as an expression but has type `void` and is intended to appear as an
expression statement.

### `=`

`x = expr` evaluates `expr` and stores the resulting value into `x`.

Rules:

- The left-hand side must be an assignable lvalue. In the current subset, it may be:
  - an identifier that refers to a local `let mut` binding, or
  - a struct field lvalue `name.field` where `name` is either:
    - a local `let mut` binding of a supported POD `struct`, or
    - a `mut` borrowed reference parameter (`mut name: &Struct`).
- Identifier lvalues must refer to `let mut` local bindings.
- The type of `expr` must match the binding’s type.
- The assignment expression has type `void`.

### Compound assignment (`+=`, `-=`, `*=`, `/=`)

Compound assignments are shorthand for “read-modify-write”:

- `x += y` is equivalent to `x = x + y` (and similarly for `-=`/`*=`/`/=`),
  with `y` evaluated exactly once.

Rules:

- The left-hand side must be an assignable lvalue (as described above for `=`).
- In the current subset, compound assignments are supported only for numeric
  scalar types (integers and `f32`/`f64`), including numeric struct fields.
- The compound assignment expression has type `void`.

## Increment and Decrement (`++` / `--`)

`++x`, `x++`, `--x`, and `x--` increment or decrement an existing binding by
`1`.

In Silk, increment/decrement expressions are “statement-like”: they have type
`void` and are intended to appear only as expression statements.

Rules:

- The operand must be an assignable lvalue (the same lvalue rules as `=`).
- The operand type must be an integer scalar type (`int`, `i8`, `u8`, `i16`,
  `u16`, `i32`, `u32`, `i64`, `u64`, `size`, `usize`). (`isize` is accepted as
  an alias for `size`.)
- Prefix and postfix forms are equivalent in Silk (both update the binding and
  produce `void`).
- Conceptual desugaring:
  - `x++` and `++x` are equivalent to `x += 1;`
  - `x--` and `--x` are equivalent to `x -= 1;`

## `sizeof`

`sizeof <operand>` produces the size of a type or value in bytes.

Result type:

- `sizeof` always returns `usize`.

Evaluation mode:

- When the operand is a **type name** (a primitive type, `struct`/`enum` name,
  type alias, or qualified type name), `sizeof` is a compile-time constant.
- When the operand is a **compile-time constant value** (literals and other
  const-evaluable expressions), `sizeof` is a compile-time constant.
- When the operand is a **runtime value**, `sizeof` is evaluated at runtime.

`Sized` integration:

- Implemented (partial): `sizeof <string value>` produces the string’s **byte
  length** (as `usize`). This is sugar over the current string ABI layout
  (`{ ptr: u64, len: i64 }`) and corresponds to `std::runtime::mem::string_len`
  (and the reserved intrinsic `__silk_string_len`).
- Planned (general): for other runtime values, if the operand type provides an
  instance method matching `std::interfaces::Sized`
  (`fn size(self: &Self) -> usize`), `sizeof value` will lower to a call of
  that method.
- For type operands, if the operand type provides a static, pure method
  `pure fn size() -> usize`, the compiler may fold `sizeof Type` to that value
  when the method body is const-evaluable; otherwise it falls back to the
  compiler’s built-in size model.

Built-in size model (current backend subset):

- Sizes reflect the current scalar-slot lowering model (`docs/language/structs-impls-layout.md`):
  each lowered scalar occupies one 8-byte slot.
- A `string` value occupies two slots (`(u64 ptr, i64 len)`), so `sizeof string`
  is `16` in the current subset.
- A `T[]` slice value occupies two slots (`(u64 ptr, i64 len)`), so `sizeof T[]`
  is `16` in the current subset.
- A `T[N]` fixed array occupies `N * sizeof(T)` bytes in the current subset,
  using the element’s scalar-slot size.

Notes:

- `sizeof string` (type operand) is the **representation** size (currently 16
  bytes in the scalar-slot model), while `sizeof <string value>` is the
  **content** size (byte length).

Parsing note:

- Because `Name[expr]` is also indexing syntax, fixed array **type** operands
  should be parenthesized: `sizeof (u8[4])`. Without parentheses, `sizeof u8[4]`
  is parsed as an index expression.
- Because `as` binds at postfix precedence, `sizeof x as T` parses as
  `sizeof (x as T)`. To cast the result of `sizeof`, write `(sizeof x) as T`.

## `alignof`

`alignof <operand>` produces the alignment of a type or value in bytes.

Result type:

- `alignof` always returns `usize`.

Evaluation mode:

- When the operand is a **type name** (a primitive type, `struct`/`enum` name,
  type alias, or qualified type name), `alignof` is a compile-time constant.
- When the operand is a **compile-time constant value** (literals and other
  const-evaluable expressions), `alignof` is a compile-time constant.
- When the operand is a **runtime value**, `alignof` is evaluated at runtime.

Built-in alignment model (current backend subset):

- Alignments reflect the current scalar-slot lowering model
  (`docs/language/structs-impls-layout.md`): values are stored as 8-byte slots.
- All non-`void` types currently have alignment `8`.
- `alignof void` is `1`.

Parsing notes:

- As with `sizeof`, fixed array **type** operands should be parenthesized:
  `alignof (u8[4])`. Without parentheses, `alignof u8[4]` is parsed as an index
  expression.
- Because `as` binds at postfix precedence, `alignof x as T` parses as
  `alignof (x as T)`. To cast the result of `alignof`, write `(alignof x) as T`.

## `offsetof`

`offsetof(Type, field_path)` produces the byte offset of a struct-like field
within `Type` in the current memory layout model.

Result type:

- `offsetof` always returns `usize`.

Evaluation mode:

- `offsetof` is always a compile-time constant.

Operands:

- `Type` must name a `struct` or `error` type (including nested structs).
- `field_path` is one or more field identifiers separated by `.` (for example
  `b` or `inner.header.len`).

Built-in offset model (current backend subset):

- Offsets reflect the current scalar-slot lowering model
  (`docs/language/structs-impls-layout.md`): each lowered slot is stored in an
  8-byte cell, and composite fields (nested structs, optionals, strings, etc.)
  are expanded into their slot sequences in source order.
- `offsetof(Type, field)` returns the offset of the **first slot** of that
  field’s lowered representation, in bytes.
- When `field_path` traverses an optional `T?` field, it refers to the payload
  layout (the path implicitly skips the tag slot).

## `typename`

`typename <expr>` and `typename(<expr>)` produce a `string` naming the static
type of `<expr>`.

Result type:

- `typename` always returns `string`.

Evaluation mode:

- `typename` is always a compile-time constant string.

Operand notes (current subset):

- When the operand is a bare name that does **not** resolve to an in-scope
  runtime binding (for example `int`, `User`, or `std::wasm::Module`), the
  compiler interprets it as a type name and returns that type’s name.
- Formatting uses the compiler’s normal type formatting (for example `T[]`,
  `&T`, and `fn (...) -> ...`).
- For monomorphized generic instantiations, the string is the human-readable
  display name (not an internal `__silk_mono__...` symbol).

## `is`

`<expr> is <Type>` checks whether the **static type** of `<expr>` conforms to
`<Type>`.

Result type:

- `is` always returns `bool`.

Evaluation mode:

- `is` is always a compile-time constant boolean.

Rules (current subset):

- The right-hand side must be a type (primitive, nominal `struct`/`enum`/`error`,
  `interface`, a function type, or a type alias for one of those).
- If `<Type>` is a nominal `struct` type, `expr is Type` is true when the
  expression’s static type is exactly `Type` **or** a `struct` that `extends`
  `Type`.
- If `<Type>` is an `interface`, `expr is Interface` is true when the expression’s
  static type declares conformance (`impl T as Interface`) or when the operand is
  a module declared `module Name as Interface`.
- For primitive types, enum/error types, reference types (`&T`), slice/array types
  (`T[]`, `T[N]`), optionals (`T?`), and function types, `is` currently checks
  **exact type equality** (after resolving type aliases).

Notes:

- `is` does not perform runtime tagging or value inspection. For runtime
  discrimination of union/optional values, use `match` and the relevant pattern
  forms.

Examples:

```silk
type Adder = fn (x: int, y: int) -> int;
fn my_adder (x: int, y: int) -> int { return x + y; }
if my_adder is Adder { /* ... */ }

struct User { id: u64 = 0 }
struct Beep extends User { boop: string = "" }
let beep = Beep{ boop: "boop" };
if beep is User { /* ... */ }

let n = 123;
if n is int { /* ... */ }

interface Logger { fn log (value: string) -> void; }
module my_logger as Logger {
  export log (value: string) { /* ... */ }
}
if my_logger is Logger { /* ... */ }
```

## Wrapping and Overflow

The spec notes “Arithmetic Wraps” for certain operators. The checker and code generator must:

- Implement deterministic wrapping behavior for integer arithmetic where required.
- Clearly separate wrapping operations from checked or saturating variants (if exposed in the standard library).

## Casts (`as`)

`as` is a postfix operator that performs an explicit conversion to a target
type.

### Precedence

`as` binds at postfix precedence (like calls, field access, and `?`). For example:

- `a + b as int` parses as `a + (b as int)`.
- To cast the result of `new`, use parentheses so the cast applies to the heap
  reference: `(new Type{ ... }) as &Other`. Without parentheses,
  `new Type{ ... } as &Other` parses as `new (Type{ ... } as &Other)`.

### Supported conversions (current subset)

In the current compiler/backend subset, `as` is supported for primitive scalar
conversions:

- Integer → Integer (including `Instant`, `Duration`, and `char`):
  - The conversion is deterministic and may be lossy. It is performed by
    canonicalizing the underlying bits to the destination integer type
    (width truncation + sign/zero extension as appropriate). For scalar widths
    up to 64 bits this matches the behavior of `ir.CastInt` in the current IR;
    `i128`/`u128` follow the analogous rule over their `{ lo, hi }` lane layout.
- Float → Float:
  - `f32`/`f64`/`f128` conversions using standard IEEE-754 conversion and rounding.
- Integer → Float:
  - Converts the integer value to the destination float type (IEEE-754),
    with rounding when the integer cannot be represented exactly.
- Float → Integer:
  - Converts by truncating toward zero.
  - If the source value is `NaN`, the result is `0`.
  - If the source value is outside the destination integer’s representable
    range, the result saturates to the nearest bound (min/max for signed,
    `0`/max for unsigned).

- Struct → Struct (safe “shape cast”):
  - A cast from `S` to `T` is permitted when both `S` and `T` name **non-opaque**
    struct types and their fields match **positionally**:
    - same field count, and
    - for each index `i`, the field type of `S` at `i` is exactly the same type
      as the field type of `T` at `i` (field names may differ).
  - This is intended for “newtype-like” wrappers and schema evolution where two
    structs have the same shape but different field names.
  - Semantics: the cast produces a **value copy** of the underlying struct
    slots, retyped as `T`. The operation does not reorder fields.
- `&Struct` → `&Struct` (safe “shape cast” for references):
  - A cast from `&S` to `&T` is permitted when `S` and `T` are compatible under
    the same Struct → Struct “shape cast” rules above.
  - Semantics: the cast produces a **retyped view** of the same referenced
    storage. It does **not** allocate and does **not** copy the underlying
    struct slots.
  - For refcounted heap references created by `new`, the cast is still a view
    only: it must **not** change which `drop` implementation runs when the
    refcount reaches zero. The allocation’s concrete type (tracked through the
    value, not the view type) determines Drop behavior at the last release.
  - This means the two references alias: reading fields through the cast view
    observes updates made through the original reference (and vice versa).
  - Because the two references alias, the compiler’s per-call mutable-borrow
    restrictions treat aliases as the same storage: a single call expression
    may not take multiple mutable borrows (or both mutable and immutable
    borrows) of the same underlying reference, even if the aliases are held
    under different local names. See `docs/language/mutability.md`.
  - This cast is intentionally conservative: it is permitted only when the
    compiler can prove the two referenced struct layouts are identical at the
    type level (same field types in the same order). It does **not** permit
    arbitrary “reinterpret pointer” casts.

- `u64`/`usize` ↔ `T[]` / `T[N]` (unsafe pointer/slice view cast):
  - Silk’s current subset represents raw addresses as `u64` and permits
    pointer-width unsigned `usize` values to be used as raw addresses in these
    casts. For low-level byte-copy routines and runtime interop, `as` supports
    explicit conversions between raw addresses and array/slice views:
    - `ptr as T[]` constructs a `T[]` slice view where the pointer component is
      `ptr` and the length component is a dedicated **unknown-length** sentinel
      (currently, `i64.min`). The compiler does not validate
      the pointer value.
      - Indexing and assignment through an unknown-length slice are permitted
        but **unchecked**: the runtime performs no `index < len` bounds check.
      - Operations that require a known length (iteration, slicing, etc.) trap
        unless an explicit length is provided.
    - `ptr as T[](len)` constructs a `T[]` slice view where the pointer
      component is `ptr` and the length component is `len` (element count).
    - `slice as u64` / `slice as usize` extracts the pointer component of a
      `T[]` slice.
    - `arr as u64` / `arr as usize` extracts the address of element `0` of a
      fixed array `T[N]` (for `N == 0`, the result is `0`).
  - These casts remain **unsafe**:
    - the compiler does not validate pointer provenance (whether the address is
      valid for the claimed element type).
    - in the current scalar-slot subset, `T[]` / `T[N]` indexing assumes the
      pointed-to memory is laid out in Silk’s scalar-slot representation. This
      is not a packed-byte view. For packed byte access (for example string
      storage), use `std::runtime::mem::{load_u8,store_u8}` or
      `std::arrays::ByteSlice`.
  - In the current scalar-slot backend subset, indexed accesses through
    arrays/slices trap when:
    - the pointer is `0`,
    - the pointer is not 8-byte aligned,
    - the explicit length is negative (when provided),
    - the index is out of bounds (`index < len`) when the slice/array has a
      known (non-unknown) length.

- `Serialize(T)`-backed casts (explicit conversion via `serialize()`):
  - When the operand type provides a unique instance method named `serialize`
    matching the `std::interfaces::Serialize(T)` surface (`fn serialize(self: &Type) -> T`),
    `expr as T` is permitted and lowers to a call of that method.
  - The conversion is explicit (it does not introduce implicit coercions).
  - The `serialize` method must be infallible (no typed errors).
  - Purity rules apply: inside `pure fn`, the `serialize` method must be `pure`.
  - Current subset limitation: the compiler must be able to resolve the
    receiver’s nominal type at the cast site so it can lower the implicit
    `serialize()` call. This includes name expressions, field accesses, calls,
    and array/slice indexing (`arr[i] as T`) in the current subset.
- `Deserialize(S)`-backed casts (explicit conversion via `deserialize(...)`):
  - When the target type provides a unique **static** method named `deserialize`
    matching the `std::interfaces::Deserialize(S)` surface (`fn deserialize(value: S) -> Self`),
    `expr as Self` is permitted and lowers to `Self.deserialize(expr)`.
  - This rule is checked before struct shape casts: when both a `deserialize`
    conversion and a shape cast could apply, the `deserialize` conversion is
    used.
  - The conversion is explicit (it does not introduce implicit coercions).
  - The `deserialize` method must be infallible (no typed errors).
  - Purity rules apply: inside `pure fn`, the `deserialize` method must be `pure`.

Examples (implemented subset):

```silk
struct Data {
  value: string,
}

struct User {
  name: string,
}

fn main () -> int {
  let data = Data{ value: "hello" };
  let user = data as User;
  assert data.value == user.name;
  return 0;
}
```

```silk
struct A {
  value: string,
}

struct B {
  value: string,
}

fn set_value (mut b: &B, value: string) -> void {
  b.value = value;
}

fn main () -> int {
  let a: &A = new A{ value: "hello" };
  var b = a as &B;
  set_value(mut b, "world");
  assert a.value == "world";
  assert b.value == "world";
  return 0;
}
```

Notes:

- `as` does not participate in the implicit call-argument coercion mechanism
  described in `docs/language/types.md` (that mechanism is opt-in per
  destination struct and is used primarily for stdlib ergonomics).

## Raw casts (`as raw`)

`as raw` is a postfix operator that reinterprets the **raw bits** of a scalar
value as another scalar type. It is intended for use in generic collections
and low-level marshalling where numeric conversion would be incorrect (notably
when storing `f32`/`f64` values in integer-backed storage).

Syntax:

- `<expr> as raw <Type>`

Rules (current subset):

- Both the operand and the target type must be numeric primitive types
  supported by the current backend subset:
  - 64-bit-slot scalars: `i8`/`u8`/`i16`/`u16`/`i32`/`u32`/`i64`/`u64`/`int`,
    `f32`/`f64`, plus int-like primitives lowered to those scalars such as
    `Duration`/`Instant` and `char`.
  - 128-bit wide primitives: `i128`/`u128`/`f128` (two 8-byte lanes; `f128`
    stores the raw IEEE-754 binary128 bit pattern).
- `as raw` is not permitted for `void`, `&T`, optionals, arrays, maps, function
  types, or structs/enums.
- Special-case: `string as raw u64` (and `string as raw usize`) is permitted
  and extracts the string’s underlying **byte pointer**. This is sugar over
  `std::runtime::mem::string_ptr` (and the reserved intrinsic
  `__silk_string_ptr`).
- Special-case: `&T as raw u64` (and `&T as raw usize`) is permitted and
  extracts the reference’s underlying **address** as an integer. This is
  intended for low-level interop (for example passing `&Struct` pointers to C
  APIs that use `void *` / `T *` handles).
  - This does not make integer→reference casts legal: `u64 as raw &T` remains
    rejected in the current subset.
- Semantics:
  - The operand’s current canonical scalar bits are reinterpreted as the target
    type’s canonical scalar bits (bit-level truncation/masking for narrower
    target widths such as `u8`/`u16`/`u32` and `f32`).
    - For 128-bit primitives, this is lane-wise:
      - the low lane is copied as `u64` bits,
      - the high lane is reinterpreted across `u64`/`i64` as needed,
      - when casting a 128-bit value to a <=64-bit target, the low lane is used,
      - when casting a <=64-bit *integer* value to `i128`/`u128`, the high lane
        is sign-extended (`i128`) or zero-extended (`u128`) in the current
        subset.
  - No numeric conversion is performed. For example, `1.0 as u64` yields
    `1`, while `1.0 as raw u64` yields the IEEE-754 bit pattern.

Examples:

```silk
let bits: u64 = (1.0 as f32) as raw u64;
let f: f32 = bits as raw f32;
```

```silk
// Pointer + length extraction for low-level interop.
let s: string = "hello";
let ptr: u64 = s as raw u64;
let len: usize = sizeof s;
```
