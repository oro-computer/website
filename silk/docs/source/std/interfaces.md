# `std::interfaces`

Status: **Implemented subset**. This module defines small,
non-generic standard-library interfaces (“protocols”) that can be used today to
express common capabilities across `std::` types.

Dynamic interface dispatch (trait objects / vtables) is part of the language
design, but is not implemented yet. In the current compiler/backend subset,
interfaces are used for:

- declaring interface contracts, and
- compile-time conformance checking via `impl Type as Interface { ... }`.
- one compiler-backed convention: `std::interfaces::Drop` is used for automatic
  cleanup of values at well-defined points (see “Drop semantics” below).

When the standard library is enabled (the default), all interfaces in
`std::interfaces` are available without explicit imports via the std prelude
module `std::runtime::globals`, so you can write `impl T as Drop { ... }`.

## Exported API

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

interface TrySerialize(E, S = std::strings::String) {
  fn try_serialize () -> std::result::Result(S, E);
}

interface Parse(E, S = string) {
  fn parse (value: S) -> std::result::Result(Self, E);
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
  usable within the current subset. `Serialize`, `TrySerialize`, `Parse`, and
  `Deserialize` are generic, but default their representation type parameter to
  the common textual case so most callers do not need explicit type arguments.
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
- `Parse(E, S)` is also a static protocol:
  - `impl T as Parse(E, S)` provides `fn parse(value: S) -> Result(Self, E)`
    with no `self` receiver,
  - calls use `T.parse(value)`,
  - unlike `Deserialize`, `Parse` is **not** used by `as` casts.
- Implemented (partial): `sizeof <string value>` yields the string byte length
  (see `docs/language/operators.md`).
- Planned (general): `Sized` will be used by the `sizeof` operator for other
  value operands: when a concrete type provides `fn size(self: &T) -> usize`,
  `sizeof value` will lower to that method call.
- `Serialize` is also recognized by the `as` cast operator:
  - when a type provides `serialize(self: &T) -> S`, an explicit cast
    `value as S` lowers to `value.serialize()` (see `docs/language/operators.md`).
- Current stdlib adopters of `Serialize(string)` include:
  - `std::strings::String`
  - `std::path::PathBuf`
  - `std::url::URLSearchParams`
  - `std::ffi::c_owned::OwnedCStr`
  These types already own stable byte storage and can return an allocation-free
  borrowed `string` view.
- `TrySerialize(E, S)` is the fallible output-side companion to `Serialize`:
  - `impl T as TrySerialize(E, S)` provides
    `fn try_serialize(self: &T) -> Result(S, E)`,
  - calls use `value.try_serialize()`,
  - unlike `Serialize`, `TrySerialize` is not used by `as` casts.
- Current stdlib adopters of `TrySerialize(std::memory::OutOfMemory)` include:
  - `std::strings::String`
  - `std::path::PathBuf`
  - `std::url::URL`
  - `std::url::URLSearchParams`
  - `std::semver::Version`
  - `std::uuid::UUID`
  - `std::ffi::c_owned::OwnedCStr`
  These types expose a canonical owned textual rendering, but that rendering
  may allocate and therefore must remain recoverably fallible.
- `Deserialize` is also recognized by the `as` cast operator:
  - when a type provides `deserialize(value: S) -> Self`, an explicit cast
    `value as T` lowers to `T.deserialize(value)` (see `docs/language/operators.md`).
  - `Deserialize` must remain infallible. Fallible parsing or allocation-backed
    constructors should use `Parse(E, S)` or explicit `Result(...)`-returning
    APIs rather than forcing a trap-heavy `Deserialize` impl.
- Current stdlib adopters of `Parse` include:
  - `std::strings::String`
  - `std::path::PathBuf`
  - `std::url::URL`
  - `std::url::URLSearchParams`
  - `std::semver::Version`
  - `std::uuid::UUID`
  These types can now expose a consistent receiverless parse surface without
  overloading the cast operator.
- Stdlib conversion convention:
  - `Serialize(string)` is reserved for infallible textual views of the
    current value. In practice that means stable, allocation-free borrows such
    as `String`, `PathBuf`, `URLSearchParams`, and `OwnedCStr`.
  - `TrySerialize(E, std::strings::String)` is the canonical fallible owned-text
    rendering path for values whose string form may allocate.
  - `Parse(E, string)` is reserved for self-contained values that can be
    constructed from a single textual representation without extra ownership or
    mode choices.
  - Structured text formats that need explicit parse modes or format-specific
    emission stay on explicit APIs instead of forcing those semantics into the
    builtin interfaces. Current examples are `std::json::Document` and
    `std::toml::Document`, which use `parse(...)` / `parse_owned(...)` and
    JSON-specific `stringify(...)` APIs rather than `Serialize(string)` or a
    blanket `Parse(...)` impl.
- `Builder` is the standard interface for `build.slk` build modules used by the
  `silk` CLI (see `docs/compiler/build-scripts.md`). It is a module-level
  interface (used via `module ... as ...`) and defines a single `run` entrypoint
  that may be implemented as `async` and `await`ed by the driver wrapper.
  - Recommended build-module header style:
    - `module my_pkg::build as Builder;` (preferred; `Builder` is in the std prelude)
    - or `module my_pkg::build as std::interfaces::Builder;` (fully qualified)

## Examples

### Conformance

```silk
struct Counter {
  value: i64,
}

impl Counter as Len {
  public fn len (self: &Counter) -> i64 {
    return self.value;
  }
}
```

### `Serialize(string)` in the stdlib

```silk
import c_owned from "std/ffi/c_owned";
import std::path;
import std::strings;
import std::url;
import std::runtime::mem;

fn main () -> int {
  let owned_r = std::strings::String.from_string("hello");
  let mut owned = match (owned_r) {
    Ok(v) => v,
    Err(_) => std::strings::String.empty(),
  };
  let s0: string = owned as string;

  let pb_r = std::path::PathBuf.from_string("/tmp/demo");
  let mut pb = match (pb_r) {
    Ok(v) => v,
    Err(_) => std::path::PathBuf{ ptr: 0, cap: 0, len: 0 },
  };
  let s1: string = pb as string;

  let params_r = std::url::URLSearchParams.from_string("?a=b%20c");
  let mut params = match (params_r) {
    Ok(v) => v,
    Err(_) => std::url::URLSearchParams.empty(),
  };
  let s2: string = params as string; // "a=b+c"

  let p: u64 = std::runtime::mem::alloc(3);
  if p == 0 {
    owned.drop();
    pb.drop();
    params.drop();
    return 4;
  }
  std::runtime::mem::store_u8(p, 0, 104);
  std::runtime::mem::store_u8(p, 1, 105);
  std::runtime::mem::store_u8(p, 2, 0);
  let free_fn: c_owned::CFreeFn = fn (ptr: u64) {
    std::runtime::mem::free(ptr);
  };
  let mut c_str = c_owned::OwnedCStr.from_ptr(p, free_fn);
  let s3: string = c_str as string;

  if s0 != "hello" { return 1; }
  if s1 != "/tmp/demo" { return 2; }
  if s2 != "a=b+c" { return 3; }
  if s3 != "hi" { return 4; }

  owned.drop();
  pb.drop();
  params.drop();
  c_str.drop();
  return 0;
}
```

### `TrySerialize` for owned text output

```silk
import std::semver;
import std::uuid;

fn main () -> int {
  match (std::semver::Version.parse("1.2.3-alpha+build.5")) {
    Ok(v) => {
      match (v.try_serialize()) {
        Ok(mut s) => {
          if (s as string) != "1.2.3-alpha+build.5" {
            s.drop();
            return 1;
          }
          s.drop();
        },
        Err(_) => { return 2; },
      }
    },
    Err(_) => { return 3; },
  }

  match (std::uuid::UUID.parse("550e8400-e29b-41d4-a716-446655440000")) {
    Ok(id) => {
      match (id.try_serialize()) {
        Ok(mut s) => {
          if (s as string) != "550e8400-e29b-41d4-a716-446655440000" {
            s.drop();
            return 4;
          }
          s.drop();
          return 0;
        },
        Err(_) => { return 5; },
      }
    },
    Err(_) => { return 6; },
  }
}
```

### `Parse` in the stdlib

```silk
import std::path;
import std::semver;
import std::url;
import std::uuid;

fn main () -> int {
  match (std::semver::Version.parse("1.2.3")) {
    Ok(v) => {
      if v.major != 1 { return 1; }
    },
    Err(_) => { return 2; },
  }

  match (std::path::PathBuf.parse("/tmp/demo")) {
    Ok(mut pb) => {
      let s: string = pb as string;
      if s != "/tmp/demo" {
        pb.drop();
        return 3;
      }
      pb.drop();
    },
    Err(_) => { return 4; },
  }

  match (std::url::URL.parse("https://example.com?a=b")) {
    Ok(mut u) => {
      u.drop();
    },
    Err(_) => { return 5; },
  }

  match (std::uuid::UUID.parse("550e8400-e29b-41d4-a716-446655440000")) {
    Ok(_) => { return 0; },
    Err(_) => { return 6; },
  }
}
```

## Considerations

### Interface model

- Dynamic interface dispatch (trait objects / vtables) remains part of the
  broader language design; the shipped stdlib surface today is centered on
  concrete-type conformance and compile-time checking.
- `std::interfaces::Drop` is the compiler-recognized protocol for deterministic
  cleanup of owned values.

### Drop semantics

`std::interfaces::Drop` is recognized by the compiler as the standard way for a
type to release resources it owns (file descriptors, heap allocations, OS
handles, etc.). A type is considered “droppable” when it provides a method with
this surface signature:

```silk
impl T as Drop {
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

Notes:

- `drop` is resolved statically (no dynamic dispatch).
- `drop` should invalidate the value so calling it multiple times is safe.
- The language does not yet implement a general move/ownership model; **do not
  rely on copying `Drop` types** to be safe until move/copy semantics are
  specified and enforced.

## See also

- [Interfaces](?p=language/interfaces)
- [Structs, impls, and layout](?p=language/structs-impls-layout)
- [Memory model](?p=language/memory-model)
