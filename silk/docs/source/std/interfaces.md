# `std::interfaces`

Status: **Partially implemented**. This module defines small,
non-generic standard-library interfaces (“protocols”) that can be used today to
express common capabilities across `std::` types.

Dynamic interface dispatch (trait objects / vtables) is part of the language
design, but is not implemented yet. In the current compiler/backend subset,
interfaces are used for:

- declaring interface contracts, and
- compile-time conformance checking via `impl Type as Interface { ... }`.
- one compiler-backed convention: `std::interfaces::Drop` is used for automatic
  cleanup of values at well-defined points (see “Drop semantics” below).

See also:

- `docs/language/interfaces.md` (syntax, conformance, dispatch status)
- `docs/language/structs-impls-layout.md` (method + `export` rules)

## Implemented API

`std/interfaces.slk` currently defines the following interfaces:

```silk
module std::interfaces;

interface Drop {
  fn drop () -> void;
}

interface Len {
  fn len () -> i64;
}

interface Capacity {
  fn capacity () -> i64;
}

interface IsEmpty {
  fn is_empty () -> bool;
}

interface Sized {
  fn size () -> usize;
}

interface Clear {
  fn clear () -> void;
}

interface ReserveAdditional {
  fn reserve_additional (additional: i64) -> std::memory::OutOfMemory?;
}

interface WriteU8 {
  fn write_u8 (value: u8) -> std::memory::OutOfMemory?;
}

interface ReadU8 {
  fn read_u8 () -> u8?;
}

interface Iterator(T) {
  fn next () -> T?;
}

interface Serialize(S = string) {
  fn serialize () -> S;
}

interface Deserialize(S = string) {
  fn deserialize (value: S) -> Self;
}

interface Builder {
  fn run (package_root: string, action: string) -> Promise(int);
}
```

Notes:

- Most of these interfaces intentionally avoid generics; they are meant to be
  usable within the current subset. `Serialize` and `Deserialize`
  are generic, but default their representation type parameter to `string` so
  the common case does not require explicit type arguments.
- `ReserveAdditional` and `WriteU8` return `std::memory::OutOfMemory?` so
  allocation-backed types can report allocation failure as a recoverable value
  instead of trapping.
- `Iterator(T)` is modeled after Rust’s `Iterator` and represents a sequential
  producer of values. Implementations typically use a receiver of the form
  `public fn next (mut self: &Type) -> T?`, so calling `next` requires an
  explicit mutable borrow at the call site: `it.next()`.
  - `for x in it { ... }` can also be used when `it.next() -> T?`; the loop
    evaluates the iterator expression once and calls `next()` repeatedly until
    `None` (see `docs/language/flow-for.md`).
- Most interfaces use an implicit receiver: the interface method signature
  omits `self`, and the corresponding `impl` method includes `self` as its
  first parameter (see `docs/language/interfaces.md`).
- Exception: `Deserialize(S)` is a static protocol used by `as` casts; its
  `impl` method does **not** take a `self` receiver and is called as
  `Type.deserialize(value)`.
- Implemented (partial): `sizeof <string value>` yields the string byte length
  (see `docs/language/operators.md`).
- Planned (general): `Sized` will be used by the `sizeof` operator for other
  value operands: when a concrete type provides `fn size(self: &T) -> usize`,
  `sizeof value` will lower to that method call.
- `Serialize` is also recognized by the `as` cast operator:
  - when a type provides `serialize(self: &T) -> S`, an explicit cast
    `value as S` lowers to `value.serialize()` (see `docs/language/operators.md`).
- `Deserialize` is also recognized by the `as` cast operator:
  - when a type provides `deserialize(value: S) -> Self`, an explicit cast
    `value as T` lowers to `T.deserialize(value)` (see `docs/language/operators.md`).
- `Builder` is the standard interface for `build.slk` build modules used by the
  `silk` CLI (see `docs/compiler/build-scripts.md`). It is a module-level
  interface (used via `module ... as ...`) and defines a single `run` entrypoint
  that may be implemented as `async` and `await`ed by the driver wrapper.
  - Recommended build-module header style:
    - `module my_pkg::build as Builder;` + `import { Builder } from "std/interfaces";`
    - or `module my_pkg::build as std::interfaces::Builder;` (fully qualified)

## Drop semantics (Implemented subset)

`std::interfaces::Drop` is recognized by the compiler as the standard way for a
type to release resources it owns (file descriptors, heap allocations, OS
handles, etc.). A type is considered “droppable” when it provides a method with
this surface signature:

```silk
impl T as std::interfaces::Drop {
  public fn drop (mut self: &T) -> void { ... }
}
```

Automatic invocation (current compiler):

- **Scope exit:** when a `struct` *value* binding goes out of scope (including
  via fallthrough, `break`, and `continue`), the compiler calls `drop` before
  the storage is discarded.
- **Return:** on `return`, the compiler drops all in-scope droppable bindings
  except any value moved into the return result (for example `return value;`
  and `return Some(value);` treat `value` as moved in the current subset).
- **Overwrite:** when a `struct` *value* binding is overwritten via assignment,
  the compiler calls `drop` on the old value before copying in the new value.
- **Heap last-release:** for compiler-managed `new` allocations (`&T` with RC),
  the compiler calls `drop` before freeing the backing allocation when the
  refcount reaches zero.

Notes and limitations (current subset):

- `drop` is resolved statically (no dynamic dispatch).
- `drop` should invalidate the value so calling it multiple times is safe.
- The language does not yet implement a general move/ownership model; **do not
  rely on copying `Drop` types** to be safe until move/copy semantics are
  specified and enforced.
- See `docs/language/memory-model.md` for the current `new` + RC rules and how
  cleanup is performed.

## Example (Conformance)

```silk
import std::interfaces;

struct Counter {
  value: i64,
}

impl Counter as std::interfaces::Len {
  public fn len (self: &Counter) -> i64 {
    return self.value;
  }
}
```
