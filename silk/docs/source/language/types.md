# Types

This document specifies the Silk type system used by the compiler front-end and type checker.

Implementation status (current compiler subset):

- Supported end-to-end: primitives, nominal `struct` types, optionals (`T?`),
  `&Struct` references (in function parameter types and as local values
  produced by `new` / calls that return `&Struct`), and array/slice types
  (`T[N]`, `T[]`) over element types that lower to a fixed scalar-slot sequence
  in the current backend subset (including array literals, indexing reads, and
  iterable `for` loops). Indexed assignment targets (`xs[i] = v`) are supported
  for these element types; compound index ops require numeric scalar element
  types in the current subset.
  - Parameterized nominal types (monomorphized): generic `struct` and
    `interface` declarations with **type parameters**, plus applied types in
    type positions (`Name(u8)`, `Name(string)`) for those declarations.
- Reserved intrinsics: the compiler currently exposes reserved, stdlib
  bring-up intrinsics for working with the `string` ABI (`__silk_string_ptr`,
  `__silk_string_len`, and `__silk_string_from_ptr_len`). User code should
  generally prefer the language sugar:
  - `s as raw u64` (extract the underlying byte pointer), and
  - `sizeof s` (string byte length as `usize`)
  over calling these helpers directly. The intrinsic names remain reserved and
  are not a stable user API.
- Special-case: the nominal optional form `Option(T)` is accepted and desugared
  to `T?` in type annotations (it is not a general generics feature).
- Parsed but rejected by the current checker: const parameters and integer
  literal type arguments (`Foo(N: int)`, `Foo(u8, 1024)`) (`docs/compiler/diagnostics.md`, `E2016`),
  and the removed builtin map type form (`map(K, V)`) (`E2017`; use
  `std::map::{HashMap, TreeMap}` instead).
- Implemented in the native backend subset: 128-bit scalar primitives
  (`i128`, `u128`, `f128`).
  - In the current scalar-slot model (`docs/language/structs-impls-layout.md`),
    these primitives lower to **two 8-byte slots** (`lo: u64`, `hi: u64`).
  - `f128` uses the IEEE‑754 binary128 bit pattern stored across those slots.
  - On `linux/x86_64` in the current backend implementation, `f128` arithmetic
    and some `as` casts lower to bundled runtime helper calls and rely on
    `libgcc_s.so.1` for `__float128` builtins.
- Typed errors (`error`, `panic`, and `T | ErrorType...`) are specified in
  `docs/language/typed-errors.md`. The current compiler models typed error
  contracts as an effect on function return types and expressions.
  - Separately, type unions (`T1 | T2 | ...`) are supported in type annotations
    as described in `docs/language/type-unions.md`. In function declaration
    return types, union returns must be parenthesized (`-> (A | B)`) because
    unparenthesized `|` after `->` is reserved for typed-error contracts.

## Quick Reference

The core categories are:

- Booleans: `bool`
  - Examples: `true`, `false`.
  - Notes: logical values.
- Integers (fixed width): `u8`, `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `u128`, `i128`
  - Examples: `let n: i32 = 42;`.
  - Notes: signed/unsigned bit-widths.
- Integer (platform): `int`
  - Examples: `let n: int = 1;`.
  - Notes: implementation/default integer.
- Pointer-width integers: `usize`, `size`
  - Examples: `let n: usize = 1;`, `let n: size = -1;`.
  - Notes: unsigned/signed integer types whose width matches the target
    architecture pointer width (for example 64-bit on `linux/x86_64`).
  - Compatibility: `isize` is accepted as an alias for `size`.
- Floats: `f32`, `f64`, `f128`
  - Examples: `let x: f64 = 3.14;`.
  - Notes: IEEE‑754.
- Char: `char`
  - Examples: `'A'`.
  - Notes: Unicode scalar.
- String: `string`
  - Examples: `"hello"`.
  - Notes: immutable text; multi‑line strings supported.
- Regexp: `regexp`
  - Examples: `/hello/i`.
  - Notes: compiled regular expression bytecode; a non-owning `{ ptr, len }`
    view analogous to `string`. Regex literals compile at compile time; runtime
    compilation and matching helpers live in `std::regex` (see `docs/std/regex.md`).
- Region handle: `Region`
  - Examples: `fn f (r: Region) -> int { with r { ... } }`.
  - Notes: a first-class region allocation context handle; see `docs/language/regions.md`.
- Void / Unit: `void`
  - Examples: `fn foo () -> void {}`.
  - Notes: functions that return nothing.
- Time Types: `Instant`, `Duration`
  - Examples: `let i: Instant = std::now();`.
  - Notes: specialized `i64`-based types for time measurement.
- Optional: `T?`
  - Examples: `User?`, `i32?`.
  - Notes: `None` / `none` is the canonical empty value; `null` may also be
    used when an optional type is expected and coerces to `None`. Use `match`,
    `?.`, `??`.
- None (value):
  - Examples: `None` / `none` (represented as `None` in code samples).
  - Notes: the distinguished empty value; typed as `T?`. The `null` literal is
    a distinct literal that can coerce to `None` when an optional type is
    expected (see `docs/language/optional.md`).
- Reference (borrow): `&T`
  - Examples: `&User`.
  - Notes: reference type; in the current subset, `&Struct` may appear in
    parameter types and as local values when produced by `new` or by calls that
    return `&Struct`. Mutability follows the `mut` borrow contract and per-call
    aliasing rules described in `docs/language/mutability.md`.
- Arrays / Slices: `T[]`, `T[N]`
  - Examples: `i32[]`, `byte[32]`.
  - Notes: dynamic slice vs fixed length (compile‑time `N`). In the current
    compiler/backend subset, arrays/slices are supported only when the element
    type lowers to a fixed scalar slot sequence in the current scalar-slot
    memory model (for example primitive scalars, `string`, and supported
    `regexp`, supported non-opaque structs, and enums). See `docs/language/structs-impls-layout.md` for the
    current scalar-slot memory model. In the current subset, fixed array
    lengths are limited to `N <= 4096`. Indexing `xs[i]` traps when `i` is out
    of bounds in the current subset.
- Function Types: `fn(params) -> R`
  - Examples: `fn(i32) -> i32`.
  - Notes: function types are part of the type grammar and function-typed
    values are supported as function values (including capturing closures) in
    the current compiler subset.
    Concurrency disciplines (`task` / `async`) are implemented on function
    *declarations* (see `docs/language/concurrency.md`); function types in type
    positions do not currently include discipline modifiers.
- Capturing Closures:
  - Notes: capturing closures are supported as function values with an
    environment; see “Function Types and Closures” below for current subset
    restrictions.
- Structs (nominal):
  - Surface: `struct Name { ... }` then `Name(...)`.
  - Examples: `Point`, `Option(T)`.
  - Notes: user‑defined records; may be parameterized.
- Enums (sum types):
  - Surface: `enum Name { ... }`.
  - Notes: nominal tagged unions as described in the spec.
- Type unions:
  - Surface: `T1 | T2 | ...` (type annotations).
  - Notes: a tagged “one-of-these-types” type for a small, explicitly defined
    subset; see `docs/language/type-unions.md`.

The compiler must represent these types faithfully in its internal type system and in the C99 ABI mappings, and it must follow the exact surface syntaxes indicated above when parsing and printing types.

## Type Aliases (`type`)

Silk supports compile-time-only type aliases via `type` declarations.

Syntax examples:

```silk
type Int32 = i32;
type struct Bar = Foo;
type fn IntAdder = fn(int, int) -> int;
type pure fn PureIntAdder = fn(int, int) -> int;
export type struct PublicBar = Foo;
```

Semantics (current compiler subset):

- A type alias introduces a new name for an existing type; it does **not**
  introduce a distinct nominal type.
- The type checker MUST treat uses of the alias name as equivalent to the alias
  target type (the alias is transparent).
- Type aliases may be used anywhere a type is expected (parameter/result types,
  local annotations, struct fields, `as` casts, etc.).
- Cycles in type aliases are rejected (`E2058`).

Kind tags:

- A `type` declaration may optionally specify a kind tag, for example
  `type struct Name = Foo;` or `type pure fn Name = fn(...) -> ...;`.
- When present, the compiler MUST validate that the resolved alias target
  matches the declared kind (`E2059`).

Import/export:

- `type` aliases may be exported (`export type ...;`) and imported as type names
  via named file imports (see `docs/language/packages-imports-exports.md`).

## Implicit Call-Argument Coercions (Current Subset)

In the current compiler subset, Silk supports a small, **opt-in** implicit
coercion mechanism for function call arguments. This exists to keep the
current standard library ergonomic while generics and richer overload
systems are still evolving.

There are two related mechanisms:

1. **Coercion to a nominal `struct` value** `T` (by-value parameters and
   varargs elements) via exported static ctor-like methods.
2. **Coercion to a borrowed reference** `&T` (read-only `&T` parameters) via a
   `constructor` method that initializes a compiler-generated stack temporary.

### 1) Coercion to `T` via exported static ctor-like methods

Rule (informal):

- When a function call argument type does not match a parameter type, and the
  parameter is a nominal `struct` type `T`, the compiler may rewrite the
  argument to a call of an exported, static ctor-like method on `T`.
- This also applies to varargs elements (`...args: T`).

Supported ctor-like method names (destination type opts in by defining these):

- `T.int(value: int) -> T`
- `T.i128(value: i128) -> T`
- `T.u64(value: u64) -> T`
- `T.u128(value: u128) -> T`
- `T.f64(value: f64) -> T`
- `T.f128(value: f128) -> T`
- `T.bool(value: bool) -> T`
- `T.char(value: char) -> T`
- `T.string(value: string) -> T`
- `T.regexp(value: regexp) -> T`
- `T.Region(value: Region) -> T`

Selection (source type → constructor):

- Signed integer primitives (`i8/i16/i32/i64/int/size/isize/Instant/Duration`) → `int`
- Signed wide integer primitive (`i128`) → `i128`
- Unsigned integer primitives (`u8/u16/u32/u64/usize`) → `u64`
- Unsigned wide integer primitive (`u128`) → `u128`
- Float primitives (`f32/f64`) → `f64`
- Wide float primitive (`f128`) → `f128`
- `bool` → `bool`
- `char` → `char`
- `string` → `string`
- `regexp` → `regexp`
- `Region` → `Region`

Integer width:

- When the source argument is a fixed-width integer, the compiler inserts an
  implicit integer cast to match the ctor parameter type before calling the
  ctor.
- When the source argument is `f32` and the selected ctor parameter type is
  `f64`, the compiler inserts an implicit float cast (`f32 -> f64`) before
  calling the ctor.

Example:

```silk
struct Counter {
  value: int,
}

impl Counter {
  public fn int (value: int) -> Counter {
    return Counter{ value: value };
  }
}

fn takes (c: Counter) -> int {
  return c.value;
}

fn main () -> int {
  let x: i32 = 7;
  return takes(x); // coerces via `Counter.int`
}
```

Notes:

- Coercions are only attempted when the destination type provides the matching
  exported static ctor method.
- Today this primarily exists to support `std::fmt::Arg` and ergonomic
  `std::io::print/println` calls without requiring explicit `Arg.*`
  wrappers everywhere.

### 2) Coercion to `&T` via `constructor` (stack temporary)

Rule (informal):

- When a call argument does not match a parameter type, and the parameter is a
  **read-only borrowed reference** `&T` to a nominal `struct` type `T`, the
  compiler may create an implicit stack temporary `tmp: T`, initialize it by
  invoking `tmp.constructor(...)`, and pass `&tmp` to the callee.

This is intentionally a *stack* construction mechanism:

- it does **not** allocate on the heap,
- it is compatible with `silk build --noheap`,
- and the temporary’s lifetime is the duration of the call (similar to how C++
  binds temporaries to `const&` parameters).

Eligibility requirements (current subset):

- The parameter must be `&T` (not `mut &T`).
- The destination type `T` must provide a visible `constructor` overload with:
  - receiver `mut self: &T`,
  - exactly **one** non-receiver parameter (`value: U`),
  - return type `void`.
- The call argument type must match the selected overload’s `U` parameter type.
- If multiple overloads are viable for a given argument, the coercion is
  ambiguous and rejected (the call must be written with an explicit
  construction).

Example:

```silk
struct User {
  name: string,
}

impl User {
  fn constructor (mut self: &Self, name: string) -> void {
    self.name = name;
  }
}

fn print_user (user: &User) -> void {
  std::io::println("user.name = {}", user.name);
}

fn main () -> int {
  // Implicitly constructs a temporary `User` from a `string` for this call.
  print_user("alice");
  return 0;
}
```

Notes:

- This is an opt-in mechanism: types must provide the matching `constructor`.
- If the coercion is ambiguous (multiple viable conversion paths), the compiler
  rejects the call and requires an explicit construction.
- Because this coercion participates in ordinary call argument checking, it can
  make additional overloads applicable (for example a copy-constructor
  `constructor(mut self: &Self, other: &Self)` can accept a `string` argument by
  first constructing a temporary `Self` from `string`). Overload resolution
  prefers overloads that match without requiring such coercions.

## Explicit Casts (`as`)

Silk supports explicit casts using the postfix `as` operator:

```silk
let x: f64 = 3.14;
let n: int = x as int;
```

This operator is intended for explicit, potentially lossy primitive numeric
conversions. In the current subset it also supports explicit conversions via
`std::interfaces::Serialize(T)` by lowering `expr as T` to `expr.serialize()`
when the operand type provides a matching `serialize` method.
For structured conversions, it also supports `std::interfaces::Deserialize(S)`
by lowering `expr as T` to `T.deserialize(expr)` when the target type provides
a matching static `deserialize` method.

The supported conversions and semantics for the current compiler subset are
specified in `docs/language/operators.md` (“Casts (`as`)”).

Notes:

- `as` is explicit. It does not introduce new implicit coercions.
- For call-argument ergonomics, see the separate opt-in coercion mechanism
  described above (“Implicit Call-Argument Coercions”).

## Nominal & Parameterized Types

Nominal types are introduced by declarations (e.g. `struct`, `enum`, `interface`) and are equal only to themselves. Parameterized types are constructed by applying a type constructor to type arguments.

The compiler must:

- Treat nominal types as distinct even if their field layout is identical.
- In the full language design, support parameterized types in all contexts
  where the spec permits them. In the current compiler subset, **type-parameter**
  generics are supported for nominal declarations (`struct` / `interface`) and
  for applied types in type positions (`Name(u8)`).
  - Const parameters and integer-literal type arguments (`Name(N: int)`,
    `Name(u8, 1024)`) remain tracked work and are rejected (`E2016`).
  - The `Option(T)` optional sugar described above remains supported for
    the current subset.

### Parameterized type syntax (initial surface form)

The initial surface syntax for applying type arguments is:

- `TypeApply ::= TypeName '(' TypeArgListOpt ')'`
- `TypeName ::= Identifier ('::' Identifier)*`
- `TypeArgListOpt ::= TypeArgList | ε`
- `TypeArgList ::= TypeArg (',' TypeArg)* ','?`
- `TypeArg ::= Type | IntLiteral`

Examples:

```silk
Foo(int, 1024)
Mutex(Account)
Result(int, string)
```

Notes:

- A `TypeArg` may be a type (e.g. `int`, `&Foo`, `Option(string)`) or a
  compile-time integer literal for const-parameter-style arguments.
- The full semantics (declaring generic parameters, constraint checking, and
  monomorphization) are still evolving; the key requirement is that the
  compiler preserves the argument structure in the AST/type system so later
  stages can enforce and lower it.

## Reference Types

Reference types describe access to values rather than owning them (e.g. references, borrowed views, or other non-owning handles as specified in this document and related language docs).

Key requirements:

- Distinguish owning vs. non-owning types in the type system.
- Preserve aliasing and lifetime constraints so that regions, buffers, and FFI safety rules can be enforced.

Current implementation notes:

- `&Struct` is supported in function parameter types and as local values when
  produced by heap allocation (`new`) or by calls that return `&Struct`.
- Borrowed `&Struct` references may also be created from stack values:
  - via the borrow operator `&expr` on borrowable lvalues, and
  - via implicit borrow coercions in contexts that expect `&T`
    (for example `let r: &Pair = pair;`).
  These borrows are checked with conservative lexical lifetime rules (they may
  not escape the scope of the borrowed stack storage).
- Mutable reference parameters use the two-part `mut` contract and conservative
  per-call aliasing rules; see `docs/language/mutability.md`.

## Function Types and Closures (Implementation Status)

The current compiler subset:

- Parses function types in type positions (most notably for `ext` declarations).
- Implements function expressions (lambdas) in expression positions:
  - expression body form: `fn (x: int, y: int) -> x + y`
  - block body form: `fn (x: int, y: int) -> int { return x + y; }`
- Function expressions may not declare `&T` parameters in the current subset.
- Function expressions are inferred as `pure` when they are **non-capturing**:
  - they may call only `pure` functions,
  - they may not mutate (`let mut`/`var`, assignment),
  - they may not allocate (`new`),
  - they may not use typed error contracts or `panic`.
- The checker also supports purity inference (“auto-pure”) for ordinary function
  declarations and `impl` methods. When inferred, these functions/methods are
  treated as `pure` for call checking and are callable from `pure` code.
- Capturing closures are implemented as a subset of function values:
  - a function expression body may reference **immutable** locals/parameters
    from an enclosing scope; those values are captured by value into a heap
    environment,
  - in the current subset, only **scalar** captures are supported (`int`, fixed
    width ints, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`),
  - capturing closures are not `pure` (they have an environment) and are
    rejected in `pure` code in the current subset.
- Function values are supported end-to-end for this subset (non-capturing and
  capturing):
  - they may be passed as arguments, returned from functions, stored in
    structs/arrays, and called indirectly.
  - the runtime representation is a pair `{ func_ptr, env_ptr }` as specified
    in `docs/language/memory-model.md`.
- Discipline modifiers for function declarations (`pure` / `task` / `async`) are
  implemented. Function types in type positions do not currently include
  discipline modifiers.
