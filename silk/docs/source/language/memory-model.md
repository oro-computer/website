# Memory Model (Stack, Heap, and Moves)

This document specifies Silk’s memory model: how values are allocated, passed,
and how heap-managed values interact with the type system.

The compiler implements a minimal heap model for `new` on `linux/x86_64` and a
small lexical move/cleanup model for droppable values:

- `new` is supported for allocating non-opaque `struct` values on the heap and
 producing an `&Struct` reference.
- These heap allocations are managed via reference counting (RC) inserted by the
 compiler during lowering.

See [Regions](?p=language/regions) and
[Borrow checking](?p=language/borrow-checker) for the ownership and
escape/lifetime rules that sit on top of this model.

## Stack vs Heap

### Stack allocation (default)

Rule: values created without `new` are stack values by default.

- Locals hold their data directly (for example an `int` or a small POD `struct`).
- Passing to functions is **by value**. For ownership-tracked values, this is a
 move (the source binding is consumed); for plain scalars it behaves like a
 copy.
- Lifetime is lexical (ends when the scope ends).

This aligns with the current compiler, which is value-oriented and does
not implement a general heap allocation model.

### Heap allocation (`new`) and boxed values

Rule: values created with `new` live on the heap and are represented as an
`&Struct` reference in user code.

- The reference value is passed by value (copying the reference representation).
- The underlying allocation’s lifetime is managed by compiler-inserted reference
 counting (RC) for values originating from `new`.

Important: this is currently an internal Silk-managed heap for Silk code, not an
FFI pointer model. The compiler does not permit `&Struct` for
non-opaque structs in `ext` signatures; only `&Opaque` handles may cross the
FFI boundary (see [Structs, impls, and layout](?p=language/structs-impls-layout)
and [External declarations (`ext`)](?p=language/ext)).

#### Implemented behavior

- `new` is supported only in function bodies (top-level `let` initializers
 cannot contain `new`).
- `new` is supported only when the checker can determine a concrete reference
 result type of the form `&Struct`. This happens
 in two ways:
 - from an expected type context `&Struct` (for example `let x: &Frame = new
 Frame{ ... };` or as a call argument where the parameter type is `&Struct`)
 - from the `new` operand itself when it names a struct type (for example
 `let x = new Frame{ ... };` or `let x = new Frame(...);`), which allows
 `let` bindings to infer `&Frame` without an explicit annotation
- Only non-opaque `struct` types are supported for `new`.
- Reference counting is applied only to `&Struct` values that originate from
 `new` (borrowed stack references are not treated as RC-managed values).
- The `silk build` CLI supports `--noheap` to disable heap allocation for the
 shipped subset:
 - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
 - `async`/`task`/`await`/`yield` and capturing closures are rejected with `E2027`,
 - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
 - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
 - region-backed `new` inside `with` is still permitted.

#### Region-backed allocation (`with` + `region`)

`new` may also allocate from a region when an active region context is
established with `with` (see [Regions](?p=language/regions)).

- Inside `with <region> { ... }`, `new` allocates from the region’s backing
 bytes instead of calling the heap allocator.
- On last-release, region-backed `new` allocations run `drop` (when defined),
 but do not free their backing storage (region memory is not reclaimed by RC).
- Anonymous-region forms (`with <bytes> { ... }` and `with <bytes> from ...`)
 have an important current limitation: escaped pointers / `&Struct` values are
 not fully rejected yet, so treat them as block-scoped even if the checker
 accepts an escape.

#### Reference counting rules

- `new` initializes the allocation’s RC cell to `1`.
- Copying an RC-managed `&Struct` binding (for example `let q: &T = p;`) emits an
 RC retain (increment).
- Assigning to an RC-managed `&Struct` binding (for example `p = q;` where `p` is
 a `var`) releases the previous value; when the RHS is an RC-managed binding, a
 retain is emitted before the release to keep self-assignment safe.
- Exiting a scope emits RC releases (decrement) for RC-managed bindings declared
 in that scope, including on fallthrough, `return`, `break`, and `continue`.
- Passing `new` directly as a call argument to a `&Struct` parameter allocates a
 temporary and releases it after the call completes.
- When an RC release decrements the count to `0`, the allocation is freed.

Example:

```silk
struct Node {
  value: int,
}

fn read (n: &Node) -> int {
  return n.value;
}

fn main () -> int {
  let a = new Node{ value: 1 };
  let b: &Node = a; // aliases the same allocation and retains it
  return read(b);
}
```

## Destructors (`Drop`)

Silk supports deterministic cleanup for
resource-owning `struct` values via `std::interfaces::Drop`.

A `struct` type is considered “droppable” when it provides a method with this
surface signature (usually via an interface impl):

```silk
import std::interfaces;

impl T as std::interfaces::Drop {
  public fn drop (mut self: &T) -> void { ... }
}
```

Automatic invocation (current compiler):

- **Scope exit:** values are dropped when they go out of scope (including via
 fallthrough, `break`, and `continue`).
- **Return:** on `return`, the compiler drops all in-scope droppable bindings
 except any value moved into the return result (for example `return value;`
 and `return Some(value);` treat `value` as moved in the shipped subset).
- **Overwrite:** assigning to an existing value drops the old value before the
 new value is copied in.
- **Heap last-release:** for `new` allocations managed by compiler-inserted RC,
 `drop` is called before freeing the backing allocation when the refcount
 reaches zero.

Notes and limitations:

- `drop` is resolved statically (no dynamic dispatch).
- Values that require deterministic cleanup should be treated as
 ownership-tracked:
 - consuming a binding moves it and suppresses scope-exit cleanup for that
 binding,
 - using a moved binding is rejected by the checker,
 - explicit ownership transfer may be written as `move <name>` (see
 [Borrow checking](?p=language/borrow-checker)).

## No Implicit Heap Promotion

Stack values are not implicitly promoted to heap-managed storage. Any promotion
must be explicit and must perform a copy.

This avoids accidental lifetime extension and makes performance characteristics
obvious.

The precise syntax for “heap-copy this value” is still under design; any
proposed surface form must be written down in [Grammar](?p=language/grammar)
before it is implemented.

## Closure Captures

Silk supports capturing closures as a subset of function values.

Representation:

- A function-typed value is a small pair: `{ func_ptr, env_ptr }`.
- `func_ptr` is a pointer to the closure code.
- `env_ptr` is either `0` (non-capturing) or a pointer to a heap-allocated
 environment box that stores captured values.

Calling convention:

- When `env_ptr == 0`, an indirect call behaves like a normal function-pointer
 call: `func_ptr(user_args...)`.
- When `env_ptr != 0`, the backend passes `env_ptr` as a hidden first argument
 to the closure function: `func_ptr(env_ptr, user_args...)`.

Environment allocation and lifetime:

- Captures are by-value copies of **scalar** locals/parameters (`int`, fixed
 width ints, `bool`, `char`, `f32`, `f64`, `Instant`, `Duration`).
- The environment box begins with a `u64` refcount header, followed by the
 captured scalar fields in a stable order.
- Copying a closure value retains the environment (increments refcount) when
 `env_ptr != 0`.
- Dropping a closure value releases the environment (decrements refcount) when
 `env_ptr != 0`; when the refcount reaches zero the environment box is freed.

Limitations:

- Capturing non-scalar values (including `string`, structs, arrays/slices,
 optionals, and `Drop` types) is rejected in the Supported forms.
- Captures are immutable snapshots; the Supported forms does not support
 capturing by reference or mutating captured state.

## Relationship to Borrowing and Mutability

- Borrow checking is intended to be a compile-time property in the safe subset:
 invalid borrows should be rejected statically.
- See [Mutability](?p=language/mutability) for the implemented borrow rules
 (call-scoped aliasing checks for `&T` parameters in the shipped subset).
- See [Borrow checking](?p=language/borrow-checker) for the broader borrow and
 lifetime model.
