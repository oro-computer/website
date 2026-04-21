# Interfaces

Interfaces allow types to declare that they implement a particular contract.
They are the foundation for standard-library “protocols” such as readers,
writers, iterators, and allocators.

When the standard library is enabled (the default), the compiler provides a
small implicit std prelude (see [packages imports exports](?p=language/packages-imports-exports)).
In particular, the interface names from `std::interfaces` are available without
an explicit `import std::interfaces;`. This prelude is specified by the stdlib
module `std::runtime::globals`.

Key components:

- The `interface` declaration.
- The `struct` that implements the interface.
- The `impl ... as ...` declaration that ties them together.
- A `module ... as ...` declaration for module-level conformance.

## Interface declarations

An interface declares a set of required method *signatures*.

Syntax:

```silk
interface Element {
  fn onclick(event: &Event) -> void;
}
```

Rules:

- Interface members are method declarations introduced with `fn`.
- Interface methods have **no body** and end with `;`.
- Parameter types in interface methods should be explicitly annotated (the
 compiler should not rely on type inference for interface contracts).
- Interface method parameter lists use the same trailing-varargs marker as
 ordinary functions, so a required method may end with `...args: T`.
- Interface methods are part of a **public contract**:
 - interfaces do not have private members, and
 - interface method declarations do not accept visibility modifiers.

## Generic interfaces

Interfaces may declare type parameters:

```silk
interface Channel(T) {
  fn send(value: T) -> bool;
  fn recv() -> T?;
}
```

Rules:

- Generic parameter lists use the same syntax as structs (`(T, ...)`).
- Type parameters may provide default type arguments (`T = Type`). When defaults
 are present, use sites may omit trailing arguments that have defaults.
- The interface name is a **type constructor** and must be applied with the
 correct number of type arguments where a concrete interface type is required
 (for example in `impl ... as ...` declarations).

## `Self` in interface signatures

Within an interface method signature, the special type name `Self` refers to
the concrete implementing type when checking `impl Type as Interface { ... }`
conformance.

## Interface inheritance (`extends`)

Interfaces may use `extends` for **single inheritance**:

```silk
interface BaseLogger {
  fn log(msg: string) -> void;
}

interface FancyLogger extends BaseLogger {
  fn warn(msg: string) -> void;
}
```

Semantics (Supported forms):

- An interface that `extends` another interface inherits all of the base
 interface’s method signatures.
- A conformance declaration (`impl T as I` or `module ... as I`) must satisfy
 the full inherited interface surface.

Rules (Supported forms):

- `extends` is permitted only on `interface` declarations.
- Only single inheritance is permitted (at most one `extends` base).
- Cycles in `extends` chains are rejected.
- A derived interface may not redeclare a method with the same name as an
 inherited base method.

## Implementations (`impl ... as ...`)

An implementation block declares that a concrete type implements an interface
and provides method bodies.

Example:

```silk
interface Element {
  fn onclick(event: &Event) -> void;
}

struct Button {
  handle: i64;
}

impl Button as Element {
  fn constructor(...) -> Button { ... }
  fn onclick(self: &Button, event: &Event) -> void { ... }
}
```

Applied interface types:

```silk
interface Read(T) {
  fn read() -> T;
}

struct ByteSource { /* ... */ }

impl ByteSource as Read(u8) {
  fn read(self: &ByteSource) -> u8 { /* ... */ }
}
```

Compiler requirements:

- Represent interface types and `impl ... as ...` relationships.
- Enforce that all required interface methods are implemented with compatible
 signatures.
- Treat required interface methods as **public by definition**:
 - impl methods that satisfy an interface requirement may omit `public`, but
 - they may not be explicitly marked `private`.

Conformance rules (implementation):

- For an `interface I { fn m(p0: T0, ...) -> R; }`, the corresponding impl must
 provide a method `m` whose signature matches after accounting for the
 receiver:
 - the interface method signature itself must omit any explicit `self`
 parameter; ordinary interface methods always use an implicit receiver,
 - the impl method’s first parameter is the receiver `self: &Type` (or
 `mut self: &Type`), and
 - the remaining parameters, including whether the final parameter is
 varargs, and the result type must match the interface method.
- Exception (static protocol, Supported forms):
 - `std::interfaces::Deserialize(S)` and `std::interfaces::Parse(E, S)` are
 receiverless static protocols. Their conformance does **not** use a
 receiver parameter:
 - `impl T as std::interfaces::Deserialize(S)` provides
 `fn deserialize(value: S) -> Self` (no `self` parameter),
 - `impl T as std::interfaces::Parse(E, S)` provides
 `fn parse(value: S) -> std::result::Result(Self, E)` (no `self`
 parameter),
 - calls use `T.deserialize(value)`.
 - and `Parse` calls use `T.parse(value)`.
 - Only `Deserialize` participates in `as` casts today. `Parse` remains an
 explicit method call so fallible construction stays visible in source.
 - The implemented conformance check substitutes `Self` recursively through
 nested generic result shapes, so interfaces such as
 `Parse(E) { fn parse(value: string) -> Result(Self, E); }` can be
 satisfied by impl methods whose concrete result type is a monomorphized
 specialization of that generic result.

Invalid ordinary interface declaration example:

```silk
interface Object {
  fn as_string(self: &Self) -> string; // invalid
}
```

Correct form:

```silk
interface Object {
  fn as_string() -> string;
}
```

Generic interface conformance rule:

- When the `as` clause names an applied generic interface type (for example
 `Read(u8)`), all type arguments must be fully known at the conformance site,
 unless the conformance itself is generic and binds those type parameters (for
 example `impl Data(T) as DataInterface(T)`).

## Module conformance (`module ... as ...`)

A module declaration may declare conformance to an interface:

```silk
interface Logger {
  fn log(msg: string) -> void;
}

module my_app::logger as Logger;

export fn log (msg: string) -> void {
  // ...
}
```

Name resolution:

- The interface name in `module ... as Interface;` is resolved after the module’s
 import block is processed, so it may refer to an interface imported later in
 the file’s import section.
 - This allows an unqualified, ergonomic module header form like:

    ```silk
    module hello::build as Builder;

    // Optional: only needed with `--nostd` or when the active stdlib prelude
    // does not include `Builder`.
    import { Builder } from "std/interfaces";
    ```

Conformance rules:

- For an `interface I { fn m(p0: T0, ...) -> R; }`, the corresponding module must
 provide a function `m` whose signature matches exactly:
 - there is no receiver parameter for module conformance, and
 - the parameter list, including whether the final parameter is varargs, and
 the result type must match the interface method.
- Conformance compares the **call result type** of the exported function:
 - `export async fn m (...) -> R` is treated as `m(...) -> Promise(R)`,
 - `export task fn m (...) -> R` is treated as `m(...) -> Task(R)`,
 - `export async task fn m (...) -> R` is treated as `m(...) -> Promise(Task(R))`.
 This allows module interfaces to express async/task entrypoints by writing the
 appropriate handle type in the interface method result.
- In Silk currently, module conformance is checked against the
 module’s **exported** functions (written as `export fn ...`), since those are
 the module members that are visible across module boundaries.

Generic module conformance:

- A module may declare conformance to an applied generic interface type
 (for example `module my_app::bytes as Read(u8);`).
- All interface type arguments must be fully specified (modules do not bind
 their own type parameters).

## Dispatch model (status)



The current compiler now supports interface-typed runtime values without a
separate boxed/vtable runtime. Instead, the native compiler resolves an
interface value type to a closed-world union of all known concrete conformers
in the current compilation set.

Example:

```silk
interface Object {
  fn as_string () -> string;
}

let xs: Object[] = [
  Foo {},
  Bar {},
];
```

In the current implementation, `Object[]` is lowered as an array whose element
type is the union of the known `Object` conformers (`Foo | Bar` in this
example). A method call like `value.as_string()` on an interface-typed runtime
value is rewritten by the checker into an ordinary `match` dispatch over that
union.

This means the current runtime interface subset supports:

- interface-typed local bindings, function parameters, borrowed function
 parameters (`&Interface`), and array elements,
- interfaces with empty method sets (`interface I {}`) in those same runtime
 positions when the conformer set is known,
- heterogeneous arrays/slices whose declared element type is an interface and
 whose values come from known conforming concrete types,
- method calls on those interface-typed values when the selected method is part
 of the shared conforming surface,
- special-case compiler hooks for specific interfaces (currently
 `std::interfaces::Drop` for deterministic cleanup; see
 [interfaces](?p=std/interfaces) and [memory model](?p=language/memory-model)).

Current limits:

- This is a closed-world compilation strategy, not an open-world trait-object
 ABI. The conformer set is computed from the known program/package being
 compiled.
- The runtime representation of an interface-typed value therefore depends on
 that conformer set. If the set of known conformers changes, the lowered
 runtime shape can change too.
- The current implementation does not introduce a general boxed interface
 object or vtable layout.
- There is no language-level guarantee today that an ordinary interface type
 such as `Object` has one stable binary layout that can be passed unchanged
 across separately compiled libraries, plugin boundaries, or the C embedding
 surface.
- In practical terms, a separately compiled artifact cannot add a new
 conformer to an already-built interface-typed runtime boundary without
 recompiling the consumer too, because the consumer’s lowered union shape was
 chosen from the closed world it already knew about.
- Runtime interface values currently depend on the existing union-value backend,
 so they are supported where the resulting conformer union is representable by
 Silk currently.

### Closed-world compilation versus open-world ABI

The current compiler strategy is:

- source-level interface declarations and `impl ... as ...` conformance,
- compile-time discovery of the conformers that are present in the current
 build,
- lowering runtime interface values to a concrete union over those conformers,
- and lowering interface method calls to ordinary `match` dispatch over that
 union.

The current compiler does **not** promise:

- a heap-boxed trait object,
- a stable `(data pointer, vtable pointer)` object model,
- a public binary layout for arbitrary interface values,
- or open-world dynamic dispatch where unknown future conformers can be linked
 in later without recompiling code that stores or passes `Interface` values.

This distinction matters at package and ABI boundaries:

- Within one closed-world native build, interface-typed locals, parameters,
 borrows, and arrays can work because the compiler can see the conformers.
- Across separately compiled binary boundaries, you must not assume that
 `Interface` itself is a stable interchange type.
- For C ABI boundaries, exported library interfaces, plugins, or other
 open-world extension points, use an explicit concrete ABI:
 - an enum/union chosen by the API author,
 - a concrete struct carrying tagged data,
 - or an explicit function-table struct if you need manually designed dynamic
 dispatch.

Treat ordinary Silk interfaces today as a language-level conformance and
closed-world compilation feature, not as a general-purpose open-world trait
object ABI.
