# `using` (Aliases and Method Reuse)

`using` introduces a local alias to an existing symbol, and (in `interface` /
`impl` bodies) can import method signatures/implementations under a new name.

This feature is intended to make large module trees ergonomic (short local
names) and to enable explicit, audited method reuse across types.

## Syntax

At any supported scope, `using` has two surface forms:

```silk
using Alias = QualifiedName;
using QualifiedName;
using QualifiedName as Alias;
```

Where `QualifiedName` uses the normal `::`-separated name syntax (including the
global-prefix form `::name`).

## Module / Package Scope

At module scope, `using` introduces a local alias for an in-scope symbol:

- types (`struct` / `enum` / `error` / `interface` / `type` aliases),
- functions (`fn` and `ext` function bindings),
- Formal Silk theories (`theory`).

The alias is transparent: using `Alias` is equivalent to using the target
symbol directly.

Name conflicts are errors, except when the alias already refers to the same
symbol as the target (a redundant alias). In that case the `using` declaration
is accepted as a no-op.

## `interface` Scope

Inside an `interface { ... }` body, `using` may import method **signatures**
from another interface:

```silk
interface Read {
  fn read() -> u8;
}

interface ReadAndPeek {
  using Read::read;
  fn peek() -> u8;
}
```

- `using Other::name;` is equivalent to copying the corresponding `fn name(...);`
  signature from `Other`.
- `using Other::name as alias;` imports it under the new name `alias`.
- Name conflicts (including conflicts with inherited `extends` members) are
  errors.

Note: interface method signatures omit the receiver parameter. The receiver is
introduced only in `impl` method declarations (see `docs/language/interfaces.md`).

## `impl` Scope

Inside an `impl Type { ... }` body, `using` may import a method implementation
from another impl:

```silk
impl Foo {
  fn id(self: &Foo) -> int { return 1; }
}

impl Bar {
  using Foo::id;
}
```

This makes the imported method available as if it were declared in the target
impl, including as a candidate for interface conformance checking.

### Visibility

Imported methods inherit the source method’s visibility:

- importing a `public fn` method produces a `public` method in the target impl,
- importing a private method produces a private method in the target impl.

Since `using` does not accept visibility modifiers in the current subset, this
inheritance rule is the only way to control whether an imported method is
callable outside the target `impl { ... }` block.

### `Self` and Layout Compatibility

When the imported method’s signature depends on `Self` (for example
`self: &Self`, parameters of type `Self`, or returning `Self`), importing it
across distinct struct types requires that the underlying layouts are
compatible.

In the current compiler subset, a pair of non-opaque, non-`error` structs are
considered compatible when they have the same number of fields and the same
field types in the same order (field names do not matter).

If the source and target struct layouts are not compatible, the `using`
declaration is rejected.

## Current Subset Limitations

- `using` does not accept `public` / `private` modifiers yet (imported methods
  inherit the source method’s visibility).
- Imported methods whose `Self`-dependent parameters require a mutable borrow
  (`mut` `&Self`) are rejected in the current subset.
- Constructor reuse (`constructor`) via `using` is not supported yet.
