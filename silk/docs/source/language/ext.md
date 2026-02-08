# External Declarations (`ext`)

Silk’s external declaration feature lets Silk code call foreign functions and
access foreign variables.

- The core construct is the `ext` definition, which declares:
  - external C functions and their Silk function types, or
  - external C variables and their Silk types.
- The compiler and runtime perform marshalling between Silk’s internal representations and the C ABI, following a documented mapping.

## Declaring an External Binding

Example:

```silk
ext foo = fn (string) -> void;
ext bar = u32;
```

Here:

- `foo` is a C function named `foo` with the given Silk function type.
- `bar` is a C variable of type `u32`.

## Binding a Different External Symbol Name

Sometimes you want the Silk binding name to differ from the linked external
symbol name (for example, when writing wrapper modules that want to expose
stable public API names without colliding with imported libc names).

Syntax:

```silk
// The binding name is `c_malloc`, but the linked symbol is `malloc`.
ext c_malloc "malloc" = fn (i64) -> u64;
ext c_free "free" = fn (u64) -> void;
```

Rules:

- The identifier after `ext` is the **Silk binding name** (used for imports and
  calls from Silk code).
- The optional string literal is the **external symbol name** used for linking
  (native) or as the import name (wasm).
- If the string literal is omitted, the external symbol name is the same as the
  binding name.

## Avoiding Shadowing (Global `::...`)

If an `ext` binding is declared in the global namespace (a module with no
`package ...;` or header-form `module ...;` declaration) and a local declaration
shadows it (for example, a wrapper function named `malloc`), use the global-name
prefix to force lookup of the global binding:

```silk
return ::malloc(bytes);
```

The global-name prefix is not limited to `ext`: it also applies to type names
and enum variant paths in expression and type positions (for example, `::Foo`,
`::Foo{...}`, or `::E::Variant`), always forcing resolution in the global
(unnamed) package.

## Verification and `ext` (Silk rule)

External declarations have no body available to the verifier.

Therefore:

- It is a compile-time error to attempt to verify an `ext` declaration.
- It is a compile-time error for verified code (code whose compilation requires
  proofs) to call an `ext` function or read an `ext` variable.

This intentionally limits verification across the `ext` boundary.

## Implementation Status (Current Compiler)

Status: the current compiler subset implements this feature under the `ext`
keyword. The docs treat `ext` as canonical.

Currently supported:

- parsing `ext` external declarations and representing them in the AST,
- optional external symbol aliases (`ext local "extern" = ...;`),
- `ext` **functions** with fixed parameter lists (`ext name = fn (T0, T1) -> R;`)
  as callable symbols in Silk (C variadic `...` is not implemented yet),
- `ext` function parameters of **function type** (`fn(...) -> R`) as C-compatible
  function pointers:
  - at the ABI level, these are passed as a single `u64` code pointer (no closure
    environment),
  - arguments must be either:
    - a top-level function name, or
    - a non-capturing `fn (...) -> ...` expression,
  - capturing closures (and arbitrary function-typed locals) are rejected for
    `ext` function-pointer parameters in the current subset,
- `ext` **variables** of scalar type (`ext name = T;` where `T` is a supported
  scalar such as `int`, fixed-width ints, `bool`, `char`, or `f32`/`f64`) as
  readable values in Silk,
- `string` parameters in `ext` function calls are lowered as C-string pointers (`const char *`) in the current backend subset; the compiler-emitted backing bytes include a trailing NUL terminator, while the Silk `string` length excludes it.
- opaque handle types declared via `struct Name;` used behind a reference (`&Name`) in `ext` function parameters and results.
- lowering calls to `ext` functions when building:
  - `silk build --kind object`, and
  - `silk build --kind static`,
  - `silk build --kind shared`,
  - `silk build --kind executable`,
  producing relocations against undefined external symbols in the generated
  `.o` / `.a`, dynamic imports in the generated `.so`, or dynamic imports in
  the generated dynamically-linked executable (linux/x86_64).
  - for shared libraries and dynamically-linked executables, external calls are
    routed through a GOT slot that is filled by the dynamic loader.
  - `ext` variable reads are supported for the same outputs, producing
    relocations against undefined external data symbols (`.o` / `.a`) or dynamic
    imports (`.so` / dynamically-linked executable) routed through the GOT.
  - for wasm targets (`wasm32-unknown-unknown`, `wasm32-wasi`), `ext` declarations map to wasm imports:
    - `ext foo = fn (...) -> ...;` becomes an imported wasm function `env.foo`,
    - `ext bar = T;` becomes an imported wasm global `env.bar` (for scalar `T`),
    - parameter/result types follow the compiler’s current scalar lowering (for example `int` → wasm `i64`).

Not implemented yet (documented design, future work):

- writing to `ext` variables (they are read-only in the current subset),
- `ext` variables of non-scalar types (strings, structs, optionals, arrays),
- richer string and aggregate marshalling (for example: returning `string` from `ext` calls as an owned Silk value, passing/returning user-defined structs by value beyond the current ABI-safe POD subset, and array/slice bridging).
- calling back into Silk from foreign code with capturing closures or richer
  closure environments (only plain non-capturing function pointers are
  supported as `ext` parameters in the current subset).

## Opaque Struct Handles

Opaque structs are intended for representing foreign pointers/handles safely.
They strengthen type safety at the language boundary by preventing accidental
mixups between different handle types and by disallowing invalid operations in
Silk.

Declare an opaque handle type with a fieldless `struct` declaration:

```silk
// runtime.slk
struct StringBuilder;

ext sb_new = fn () -> &StringBuilder;
ext sb_append = fn (&StringBuilder, string) -> void;
ext sb_destroy = fn (&StringBuilder) -> void;
```

Use the handle by importing the type name and the `ext` functions:

```silk
import { StringBuilder, sb_new, sb_append, sb_destroy } from "./runtime.slk";

fn main () -> int {
  let sb: &StringBuilder = sb_new();
  sb_append(sb, "hello");
  sb_destroy(sb);

  // Using `sb` after destroy is UNDEFINED BEHAVIOR (dangling foreign pointer).
  return 0;
}
```

Rules (implemented):

- The handle type must be used behind `&` (`&StringBuilder`), not by value.
- Opaque structs cannot be instantiated and do not support member access.

Safety:

- You are responsible for managing the lifetime of foreign handles. Most C APIs
  provide explicit create/destroy functions; always call the destruction
  function when you are done.
- Using a handle after destruction is undefined behavior; the compiler does not
  currently enforce this at compile time.

Notes on executable `ext` calls (current linux/x86_64 implementation):

- When an executable uses `ext` calls or `ext` variable reads, the compiler
  emits a **dynamically-linked** ELF64 executable (PIE-style `ET_DYN` with
  `PT_INTERP`, `.dynamic`, `.rela.dyn`, and a `.got`).
- External symbols are resolved by the platform dynamic loader. Dependencies
  can be declared via the CLI (`silk build --needed <soname> ...`) or via the
  C99 embedding API (`silk_compiler_add_needed_library`), and runtime search
  paths can be declared via `--runpath` / `silk_compiler_add_runpath`.

## ABI Contract (Overview)

The language defines two closely related views of the ABI:

- A “fat pointer” internal representation for `string` and `regexp`:
  - conceptually: `struct string { ptr: ptr, len: i64 }` where `ptr` is a UTF‑8 pointer.
  - conceptually: `struct regexp { ptr: ptr, len: i64 }` where `ptr` is an engine-owned bytecode pointer.
- A C ABI contract (e.g. via `silk.h`) using an explicit struct:

  ```c
  typedef struct {
      char   *ptr;
      int64_t len;
  } SilkString;
  ```

- A mapping to an LLVM type used internally by the compiler:

  ```llvm
  %silk.string = type { i8*, i64 }
  ```

When calling conventional C APIs, the compiler may pass a `const char *` derived from this structure, with the guarantee that the underlying data is null‑terminated. This distinction is important:

- Internal/runtime ABI: operates on `{ ptr, len }` structs (`SilkString`).
- Compatibility calls to typical C libraries: may expose `const char *` for parameters declared as `string` in Silk `ext` declarations, with the compiler extracting the `ptr`.

Our embedding ABI for `libsilk.a` will treat `SilkString` as the canonical C representation; details are further specified in `docs/compiler/abi-libsilk.md`.

## Primitive Type Mapping

The spec includes a table mapping Silk primitive types to C types, for example:

- `i8`, `u8` → `int8_t`, `uint8_t`
- `i16`, `u16` → `int16_t`, `uint16_t`
- `i32`, `u32` → `int32_t`, `uint32_t`
- `i64`, `u64` → `int64_t`, `uint64_t`
- `i128` → `SilkI128` (see `docs/compiler/abi-libsilk.md`; `{ lo, hi }` lanes)
- `u128` → `SilkU128` (see `docs/compiler/abi-libsilk.md`; `{ lo, hi }` lanes)
- `int` → `int64_t` (current `linux/x86_64` baseline; do not assume C `int`)
- `f32` → `float`
- `f64` → `double`
- `f128` → `SilkF128` (see `docs/compiler/abi-libsilk.md`; IEEE binary128 bits in `{ lo, hi }`)
- `bool` → `bool` (or `_Bool`)
- `char` → `uint32_t` (UTF‑32)
- `string` → `SilkString` (`{ char *ptr; int64_t len; }`)
- `regexp` → `SilkString` (`{ char *ptr; int64_t len; }`, opaque bytecode view)
- `void` → `void`

Notes:

- For FFI with APIs that use a C `int` (for example many POSIX syscalls),
  prefer `i32`/`u32` in your `ext` declarations rather than `int`.
- The stable C99 ABI does **not** use compiler-specific `__int128` or
  `__float128` types for these primitives; it uses explicit `{ lo, hi }`
  structs so the ABI is portable and can be expressed in strict C99.

These mappings must be reflected exactly in the C99 ABI.

## Strings and Passing Convention

For strings, the spec makes the following points:

- Silk’s `string` is represented internally as a `{ ptr, len }` pair.
- For `ext` calls to typical C APIs:
  - the compiler can extract `ptr` and pass it as a `const char *`,
  - the data is guaranteed to be null‑terminated so standard C string functions are safe.

For regex bytecode values (`regexp`):

- Silk’s `regexp` is represented internally as a `{ ptr, len }` pair with the
  same slot layout as `string`, but the bytes are *not text* and are not
  required to be null‑terminated.
- At ABI boundaries, `regexp` uses the same C shape as `SilkString`, but C code
  must treat it as an opaque `(ptr, len)` byte span (not a C string).

For the embedding ABI (`libsilk.a`):

- We treat `SilkString` (`{ char *ptr; int64_t len; }`) as the primary C representation of Silk `string` values.
- Functions exported by `libsilk.a` will use `SilkString` in their signatures wherever strings cross the boundary.

This layered design allows:

- idiomatic FFI to existing C libraries using `const char *`,
- a precise, length‑carrying ABI (`SilkString`) for embedding the compiler/runtime.

## Safety & Ownership

The external interface rules must ensure:

- No C code can violate Silk’s invariants about ownership and lifetimes.
- Any shared data representation (strings, structs, arrays, closures) is documented and stable.

## Typed Errors and the `ext` boundary

Typed errors (`error`, `panic`, and `T | ErrorType...`) must not cross the `ext`
boundary.

Rules:

- `ext` function types must not use `|` in their return types.
- Silk-to-C ABI surfaces must not expose `|` in exported function signatures.
  Shims should convert typed errors into explicit error codes, optionals, or
  domain-specific error types, or terminate in a platform-appropriate way.

Implementation status:

- The current compiler rejects `ext` declarations that include `|`, and rejects
  exporting error-producing functions to C ABI outputs.

The spec also includes a “Structs, Arrays, and Closures (Complex Types)” subsection for FFI. As the implementation proceeds, this document must be extended to:

- describe how user‑defined structs map to C structs (respecting the layout rules in `structs-impls-layout.md`),
- define how arrays and slices are represented across the boundary,
- document any stable closure representation, if exposed in the C ABI.

## Structs (Initial ABI Subset)

The full language design includes rich user-defined structs and nested
aggregates. The current compiler implementation supports only a small subset of
structs in code generation:

- structs with 0+ fields of supported value types (scalar primitives, `string`,
  nested structs, and supported optionals) in function bodies and internal helper calls,
- on `linux/x86_64`, passing and returning these structs by value at ABI boundaries
  using a scalar-slot lowering model:
  - a struct value lowers to N scalar “eightbyte” slots in field order, and
    each slot is classified as INTEGER (integer-like scalars such as `int`,
    fixed-width integers, `bool`, `char`, `Instant`, `Duration`) or SSE (`f32`/`f64`),
  - exported function *parameters* accept these slots as separate parameters;
    for 1–2 slot structs this is ABI-compatible with a by-value C struct
    parameter for the 8-byte-field subset, while for packed structs with
    smaller fields ABI compatibility with an equivalent C struct layout is not
    yet implemented/validated; for 3+ slot structs downstream C callers should
    declare separate parameters for the slots,
  - exported function *returns* support 1+ slot structs; 1–2 slot results
    return in `rax`/`rdx` and/or `xmm0`/`xmm1` accordingly, while 3+ slot
    results return indirectly via a hidden sret pointer.

This subset is intended as a stepping stone toward fully general struct layout
and SysV ABI classification (including packed layout for smaller fields such
as `f32` and small integers, nested structs, and larger aggregates returned via
hidden sret pointers).

## Optionals (Initial ABI Subset)

The full language design includes rich optional patterns (`?.`, `match`, nested
optionals, etc.). The current compiler implementation supports only a limited
optional subset in code generation:

- optionals whose payload type is a supported scalar, `string`, or a supported
  ABI-safe `struct` (i.e. after slot-flattening, all scalar slots are `i64`/`u64`/`f64`),
- construction via `None` and `Some(value)`,
- unwrapping via `??` with short-circuit fallback evaluation,
- and nested optionals (`T??`) for the same supported payload subset, including
  unwrapping `T??` to `T?` via `??`.

At ABI boundaries in the current `linux/x86_64` subset, optionals are lowered
as a `Bool` tag followed by the payload scalar slots in order:

- `(tag, payload)` for scalar payload optionals,
- `(tag, ptr, len)` for `string?`,
- `(tag, slot0, slot1, ...)` for `struct?` where the payload lowers to N scalar slots.

For nested optionals (`T??`) in this subset, the payload slots are the full
inner optional representation (for example `int??` lowers as
`(tag0, tag1, i64 payload)`).

For exported functions, these slots consume the normal scalar argument and
result locations (registers then stack), and 3+ scalar results return via a
hidden sret pointer.

Compiler requirements:

- Implement `ext` declarations as specified.
- Map Silk types to C types per the ABI document.
- Enforce the documented passing conventions and ownership rules for external-call strings and other bridged types.
- Keep this document and `docs/compiler/abi-libsilk.md` in sync with the actual codegen strategy.
