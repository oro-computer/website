# Interfaces

Interfaces allow types to declare that they implement a particular contract.
They are the foundation for standard-library “protocols” such as readers,
writers, iterators, and allocators.

Key components:

- The `interface` declaration.
- The `struct` that implements the interface.
- The `impl ... as ...` declaration that ties them together.
- A `module ... as ...` declaration for module-level conformance.

## Interface declarations

An interface declares a set of required method *signatures*.

Syntax:

```silk
interface Logger {
  fn log(msg: string) -> void;
}
```

Rules:

- Interface members are method declarations introduced with `fn`.
- Interface methods have **no body** and end with `;`.
- Parameter types in interface methods should be explicitly annotated (the
  compiler should not rely on type inference for interface contracts).
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

Semantics (implemented subset):

- An interface that `extends` another interface inherits all of the base
  interface’s method signatures.
- A conformance declaration (`impl T as I` or `module ... as I`) must satisfy
  the full inherited interface surface.

Rules (implemented subset):

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
interface Logger {
  fn log(msg: string) -> void;
}

struct StdoutLogger {}

impl StdoutLogger as Logger {
  fn constructor(...) -> StdoutLogger { ... }
  fn log(self: &StdoutLogger, msg: string) -> void { ... }
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

Conformance rules (initial implementation):

- For an `interface I { fn m(p0: T0, ...) -> R; }`, the corresponding impl must
  provide a method `m` whose signature matches after accounting for the
  receiver:
  - the impl method’s first parameter is the receiver `self: &Type` (or
    `mut self: &Type`), and
    - the remaining parameters and result type must match the interface method.
- Exception (static protocol, implemented subset):
  - `std::interfaces::Deserialize(S)` is a static conversion protocol used by
    `as` casts. Its conformance does **not** use a receiver parameter:
    - `impl T as std::interfaces::Deserialize(S)` provides
      `fn deserialize(value: S) -> Self` (no `self` parameter),
    - calls use `T.deserialize(value)`.

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

Conformance rules:

- For an `interface I { fn m(p0: T0, ...) -> R; }`, the corresponding module must
  provide a function `m` whose signature matches exactly:
  - there is no receiver parameter for module conformance, and
  - the parameter and result types must match the interface method.
- In the current compiler subset, module conformance is checked against the
  module’s **exported** functions (written as `export fn ...`), since those are
  the module members that are visible across module boundaries.

Generic module conformance:

- A module may declare conformance to an applied generic interface type
  (for example `module my_app::bytes as Read(u8);`).
- All interface type arguments must be fully specified (modules do not bind
  their own type parameters).

## Dispatch model (status)

Status: **Syntax + conformance checking**. Dynamic interface dispatch (trait
objects / vtables) is part of the language design, but is not implemented yet.

For the initial compiler/backend subset, interface use is limited to:

- declaring interfaces and impl blocks, and
- calling methods directly on concrete types (no interface-typed values at
  runtime).
- special-case compiler hooks for specific interfaces (currently
  `std::interfaces::Drop` for deterministic cleanup).
