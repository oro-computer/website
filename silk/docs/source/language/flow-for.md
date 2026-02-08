# `for` Loop

The `for` loop iterates over a range or iterable and executes a block once per
element.

Status: **Implemented subset**: integer range iteration (`start..end` and
`start..=end`), array/slice iteration (`for x in xs { ... }` for `T[N]` and
`T[]`), iterator iteration (`for x in it { ... }` when `it.next() -> T?`), and
C-style `for (init; condition; step) { ... }` loops.

## Goals

- Provide a readable, structured loop construct for iteration.
- Avoid “off-by-one” patterns by making range boundaries explicit.
- Integrate with `break` / `continue`.
- Integrate with future iteration protocols (interfaces/generics) without
  introducing hidden allocation.

## Surface Syntax (Current Subset)

Supported surface forms:

```silk
for <pattern> in <iterable> {
  ...
}
```

```silk
for (<init>; <condition>; <step>) {
  ...
}
```

Notes:

- `<pattern>` is intended to be a pattern binder. In early implementations it
  is restricted to a single identifier (and `_`). It will be expanded alongside
  pattern matching.
- `<iterable>` is an expression.
- `<init>` is a local binding (`let` / `var` / `const`) with an initializer.
- `<condition>` is a boolean expression.
- `<step>` is a statement-like expression (the same restricted subset as
  expression statements; see `docs/language/flow-expression-statements.md`).

## Semantics (Planned)

General rules:

- The iterable expression is evaluated once to produce an iteration source.
- The loop body executes once per produced element.
- `break` exits the loop; `continue` advances to the next element.

### Range iteration (Planned)

When the iterable is a range expression (for example `start..end` or
`start..=end`), the loop iterates over integer values.

Design intent:

- `start..end` iterates `start, start+1, ..., end-1` (end-exclusive).
- `start..=end` iterates `start, start+1, ..., end` (end-inclusive).

Implemented subset notes:

- The range bounds are evaluated once, left-to-right (`start` then `end`).
- If the start bound is greater than or equal to the end bound (`start >= end`)
  for an end-exclusive range, the loop executes zero times.
- If the start bound is greater than the end bound (`start > end`) for an
  end-inclusive range, the loop executes zero times.
- `continue` advances to the next element (it performs the increment step, then
  re-checks the range condition).
- The loop binder is in scope only inside the loop body block.
- The binder is immutable in the current subset (it behaves like a `let`
  binding that is updated by the loop machinery; user code cannot assign to it).

Type checking (implemented subset):

- Both range bounds must have integer type (`int`, `i8`/`u8`, `i16`/`u16`,
  `i32`/`u32`, `i64`/`u64`).
- The two bound types must match, except that an integer literal bound may be
  coerced to the other bound’s integer type (for example `for i in 0..n_u32`).
- The loop binder (when not `_`) has the bound’s integer type.

Example:

```silk
fn main () -> int {
  let mut sum: int = 0;

  for i in 0..3 {
    // i takes values 0, 1, 2
    sum += i;
  }

  // 0 + 1 + 2 = 3
  return sum;
}
```

### Array and slice iteration (Implemented subset)

In the current compiler subset, `for` also supports iterating over builtin
array and slice types:

- fixed arrays `T[N]`,
- slices `T[]`.

Semantics (implemented subset):

- The iterable expression is evaluated once.
- The loop executes in increasing index order, starting at index `0`.
- The loop binder (when not `_`) is bound to the element value (a copy) for the
  current iteration.
- The binder is in scope only inside the loop body block.
- `break` exits the loop; `continue` advances to the next element.

Current limitations:

- Element types are limited to the currently-supported array/slice element
  subset (types that lower to a fixed scalar slot sequence in the current
  back-end, such as primitive scalars, `string`, and supported non-opaque
  structs).
- Iteration is by value; to mutate an element, use indexing (`xs[i] = ...`).

Example:

```silk
fn main () -> int {
  let xs: int[3] = [1, 2, 3];
  let mut sum: int = 0;
  for x in xs {
    sum += x;
  }
  return sum;
}
```

### Iterator protocol (Implemented subset)

In addition to builtin arrays and slices, `for` supports iterating over a
stateful iterator value.

An expression `it` is treated as an iterator when it has a `next() -> T?`
instance method (typically by implementing `std::interfaces::Iterator(T)`).

Semantics (implemented subset):

- The iterable expression is evaluated once to produce the iterator value.
- The loop repeatedly calls `it.next()`.
  - When the result is `None`, the loop exits.
  - When the result is `Some(value)`, the binder (when not `_`) is bound to
    `value` (a copy) for that iteration and the body executes.
- `continue` advances by calling `next()` again; `break` exits the loop.

## C-style `for` loops (Implemented subset)

Silk also supports the traditional “C-style” `for` loop:

```silk
fn main () -> int {
  let len: int = 10;
  let mut sum: int = 0;

  for (let i = 0; i < len; ++i) {
    sum += i;
  }

  return sum;
}
```

Semantics (implemented subset):

- `<init>` executes exactly once before the first condition check.
- `<condition>` is checked before each iteration; if it is `false`, the loop
  exits.
- The loop body executes once per iteration when `<condition>` is `true`.
- After the body executes normally, `<step>` executes, then the loop re-checks
  `<condition>`.
- `continue;` skips the remainder of the loop body and jumps to `<step>` (then
  re-checks `<condition>`).
- `break;` exits the loop immediately without executing `<step>` for that
  iteration.
- The init binding’s name is in scope within the entire loop (condition, step,
  and body) but is not visible after the loop.

Init binding mutability (implemented subset):

- For ergonomics, `for (let i = 0; ...; ++i)` is accepted and the init binding
  is treated as mutable (equivalent to `var`) within the loop.
  - `const` init bindings remain immutable.

## Guidance (Current Compiler Subset)

In the current compiler subset, `for` supports integer ranges and builtin
array/slice iteration. To write other loops today, use `while`:

```silk
fn main () -> int {
  let mut i: int = 0;
  while i < 3 {
    std::io::println("i = {}", i);
    i += 1;
  }
  return 0;
}
```

## Compiler Requirements

- Recognize `for` loop syntax.
- Resolve iteration targets (ranges, collections) according to the language’s
  iteration model.
- Lower `for` into explicit control flow, with correct semantics for `break`
  and `continue`.

Compiler requirements:

- Recognize `for` loop syntax.
- Resolve iteration targets (ranges, collections) according to the language’s iteration model.
