# Aggregate Literals

Aggregate literals cover arrays and structs.

## Array Literals

Array literals construct fixed-size array values from a list of elements.

### Surface Syntax

An array literal is written using square brackets:

```silk
let xs = [1, 2, 3];
let ys = [1, 2, 3,]; // trailing comma allowed
```

Empty array literals are permitted only when an expected array type is
available from context (so the compiler knows the element type and, for
fixed-size arrays, the required length):

```silk
let empty: i32[0] = [];
let empty_slice: i32[] = [];
```

### Typing

- A non-empty array literal has type `T[N]` where `N` is the number of
  elements and `T` is inferred from the elements (or from an expected type
  when present).
- When an expected type is present and it is `T[N]`, the literal must contain
  exactly `N` elements.
- When an expected type is present and it is `T[]`, the literal’s elements are
  type-checked against `T` and the resulting value has type `T[]`.
  - In the current compiler subset, this slice form is lowered as a non-owning
    view over a compiler-generated backing array.
  - Lifetime rules are not yet enforced for such
    slices; do not allow a slice derived from a stack-backed array literal to
    outlive the scope where it was created.

Compiler requirements:

- Infer element type when possible, or require explicit annotation where
  ambiguity exists.
- Validate that all elements are convertible to the target element type.
- Enforce current-subset restrictions on which element types are supported for
  array lowering/codegen (see `docs/language/types.md` and
  `docs/language/structs-impls-layout.md`).

## Struct Literals

Struct literals construct values of `struct` types by specifying field names and values.

### Surface Syntax

A struct literal may be written in two forms:

- An **explicit** struct literal begins with a struct type name followed by a
  brace-enclosed field initializer list.
- A **contextual (inferred)** struct literal omits the type name and consists
  only of the brace-enclosed field initializer list. This form is only valid
  when an expected struct type is available from context (for example a
  function argument position or an explicit type annotation).

An explicit struct literal looks like:

```silk
struct Pair {
  a: int,
  b: int,
}

fn make () -> Pair {
  return Pair { a: 1, b: 2 };
}
```

An inferred struct literal looks like:

```silk
struct User {
  name: string,
}

fn print_user (user: User) -> void {
  std::println("user.name = {}", user.name);
}

fn main () -> int {
  // Equivalent to: `print_user(User{ name: "user name" });`
  print_user({ name: "user name" });
  return 0;
}
```

Initializers are written as either:

- `field_name: <expr>` (explicit initializer), or
- `field_name` (shorthand initializer, equivalent to `field_name: field_name`).

Initializers are separated by commas and an optional trailing comma is
permitted.

Example (shorthand):

```silk
struct User {
  name: string,
}

fn main () -> int {
  let name: string = "alice";
  let user = User{ name }; // equivalent to `User{ name: name }`
  if (user.name != "alice") { return 1; }
  return 0;
}
```

### Field defaults (struct declarations)

A `struct` field declaration may include a default value expression:

```silk
struct Beep {
  value: string = "boop",
}
```

When a struct literal omits a field, the compiler uses the field default
expression when present; otherwise it falls back to zero-initialization in the
current backend subset. This means the empty literal form is useful when all
fields have defaults:

```silk
let b = Beep {};
```

Important notes:

- Inferred struct literals are a **value** construction mechanism. They do not
  imply heap allocation. The compiler will not infer `&T` from `{ ... }`; use
  `new` for heap allocation explicitly.
- The parser only treats `{ ... }` as an inferred struct literal when it
  contains a struct-style initializer list (or is `{}`); blocks (`{ Stmt* }`)
  remain statement syntax (there is no general “block expression” in the current
  subset).

Compiler requirements:

- Enforce that field names are valid and that each field is initialized at most once.
- Define the behavior for omitted fields (in the current subset, omitted fields
  are default-initialized).
- Respect struct lowering/layout rules from `structs-impls-layout.md`.

### Implemented Subset

The current compiler implementation supports struct literals only for the
limited struct subset described in `structs-impls-layout.md`:

- structs with 0+ fields of supported value types (scalar primitives, `string`,
  nested structs, and supported optionals),
- literals may omit fields:
  - omitted fields that have a field default (`field: T = <expr>`) use that
    default expression,
  - otherwise, omitted fields are **zero-initialized** in the current backend
    subset,
- no duplicate field initializers are permitted,
- field order is not semantically significant.
