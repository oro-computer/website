# Memory Model (Stack, Heap, and Moves)

This document specifies Silk’s intended memory model: how values are allocated,
passed, and how (future) heap-managed values interact with the type system.

Silk currently implements a
minimal heap model for `new` on `linux/x86_64` and a small lexical
move/cleanup model for droppable values:

- `new` is supported for allocating non-opaque `struct` values on the heap and
 producing an `&Struct` reference.
- These heap allocations are managed via reference counting (RC) inserted by the
 compiler during lowering.

Regions and a richer move/borrow model remain design-in-progress. See
[regions](?p=language/regions), [borrow checker](?p=language/borrow-checker), and [implementation status](?p=compiler/implementation-status)
for current scope.

## Semantics

- Make allocation behavior explicit and predictable.
- Prefer stack allocation for most local data.
- Prevent unsafe implicit lifetime extension (for example implicitly “moving”
 stack data into a longer-lived heap allocation).
- Keep borrow safety a compile-time property (no runtime borrow errors in the
 safe subset).

## Stack vs Heap

### Stack allocation (default)

Rule: values created without `new` are stack values by default.

- Locals hold their data directly (for example an `int` or a small POD `struct`).
- Passing to functions is **by value**. For ownership-tracked values, this is a
 move (the source binding is consumed); for plain scalars it behaves like a
 copy.
- Initializing a new binding from a name (for example `let y = x;`) and
 assignment from a name (for example `y = x;`) also consume `x` when the value
 type requires ownership tracking (for example `Drop` types and task/promise
 handles). After the move, using `x` is rejected by the checker.
- Assigning such a value to an aggregate field consumes the source under the
 same rule. The previous field owner is dropped once before replacement; the
 new value is thereafter owned by the aggregate, including when mutation is
 performed through a `mut &Struct` parameter.
- `let move` / `var move` are the binding-level ownership-transfer spellings.
 For a simple binding, `let move y = x;` and `var move y = x;` consume `x`
 under the same ownership-tracking rules as `let y = move x;`. `mut` may be
 combined with `move` in either order: `let mut move y = x;`,
 `let move mut y = x;`, `var mut move y = x;`, and `var move mut y = x;`.
 The explicit `mut` after `var` is redundant because `var` is already mutable,
 but it is accepted for consistency. Copyable existing sources remain
 independent copies. For destructuring, `let move (a, b) = pair;`,
 `let move Some(value) = maybe;`,
 `let move Some(value) = maybe else { ... };`, `if let move ...`,
 `else if let move ...`, chained `&& let move ...`, and `while let move ...`
 request consuming pattern binding.
- Lifetime is lexical (ends when the scope ends).

This aligns with Silk currently, which is value-oriented and does
not implement a general heap allocation model.

### Heap allocation (`new`) and boxed values

Rule (implemented, Supported forms): values created with `new` live on the
heap and are represented as an `&Struct` reference in user code.

- The reference value is passed by value (copying the reference representation).
- The underlying allocation’s lifetime is managed by compiler-inserted reference
 counting (RC) for values originating from `new`.

Important: this is currently an internal Silk-managed heap for Silk code, not an
FFI pointer model. The compiler does not permit `&Struct` for
non-opaque structs in `ext` signatures; only `&Opaque` handles may cross the
FFI boundary (see [structs impls layout](?p=language/structs-impls-layout) and
[ext](?p=language/ext)).

#### Thread safety and `task` boundaries

`new` produces an `&Struct` reference whose lifetime is managed by
compiler-inserted reference counting (RC). In the Supported forms, RC retain and
release operations are not atomic, so sharing such references across OS threads
is unsafe.

Because `task` concurrency runs on OS threads, the checker rejects non-opaque
reference types (`&T`) at `task fn` / `async task fn` boundaries (`E2037`). This
includes `&Struct` values produced by `new` (and any other non-opaque
references).

For `async fn` results, the checker also rejects borrowed-view types that could
outlive the caller across suspension:

- non-opaque references (`&T`),
- and slices (`T[]`).

Opaque handle references (`&Handle` where `Handle` is declared as `struct Name;`)
remain permitted because they are treated as external handles rather than as
borrowed views into ordinary Silk-managed storage.

To share state across tasks, transfer ownership by value, share explicit
atomic/synchronized handles (`std::sync` or `std::atomic`), pass non-owning
`*Borrow` handle views across tasks, or use `std::sync::Arc(T)` when task-safe
shared ownership is required.

Atomic operations do not change the `new` reference model. `std::atomic`
provides atomic cells for their own storage; it does not make ordinary
compiler-managed references or their RC operations atomic.

`std::sync::Arc(T)` is a separate shared-ownership tool. Its retain/release
operations are atomic and its final release owns payload destruction, but it
does not upgrade ordinary compiler-managed `new` RC to atomic RC.

#### Notes

- `new` is supported only in function bodies (top-level `let` initializers
 cannot contain `new` in the Supported forms).
- `new` is supported only when the checker can determine a concrete reference
 result type of the form `&Struct`. In the Supported forms, this happens
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
 Supported forms:
 - heap-backed `new` (outside a `with` region) is rejected with `E2027`,
 - `async`/`task`/`await`/`yield` and capturing closures are rejected with `E2027`,
 - `ext` bindings to libc heap primitives (`malloc`/`calloc`/`realloc`/`free`/etc) are rejected with `E2027` in non-stdlib modules,
 - `std::runtime::mem::{alloc,realloc,free}` traps when called without an active `with` region (no implicit heap fallback),
 - region-backed `new` inside `with` is still permitted.

#### Region-backed allocation (`with` + `region`)

In the Supported forms, `new` may also allocate from a region when an active
region context is established with `with` (see [regions](?p=language/regions)).

- Inside `with <region> { ... }`, `new` allocates from the region’s backing
 bytes instead of calling the heap allocator.
- On last-release, region-backed `new` allocations run `drop` (when defined),
 but do not free their backing storage (region memory is not reclaimed by RC).

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

## Destructors (`Drop`)

In Silk currently, Silk supports deterministic cleanup for
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
 and `return Some(value);` treat `value` as moved in the Supported forms).
- **Overwrite:** assigning to an existing value drops the old value before the
 new value is copied in.
- **Field take and reinitialization:** moving an ownership-tracked direct field
 into another owner marks the source field uninitialized. Installing a
 replacement in that field does not drop the transferred value; it restores
 the field to initialized state. A subsequent overwrite drops the installed
 value normally. A partially moved aggregate may not leave its current
 block/function or be otherwise used before reinitialization.
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
 [borrow checker](?p=language/borrow-checker)).

## No Implicit Heap Promotion

Planned rule: stack values cannot be implicitly promoted to heap-managed
storage. Any promotion must be explicit and must perform a copy.

This avoids accidental lifetime extension and makes performance characteristics
obvious.

The precise syntax for “heap-copy this value” is still under design; any
proposed surface form must be written down in [grammar](?p=language/grammar) before
it is implemented.

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

Environment allocation and lifetime (Supported forms):

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
- See [mutability](?p=language/mutability) for the current implemented borrow rules
 (call-scoped aliasing checks for `&T` parameters in the Supported forms).
- See [borrow checker](?p=language/borrow-checker) for the broader planned borrow checker.
