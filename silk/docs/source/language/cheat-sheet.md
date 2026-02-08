# Language Cheat Sheet

This document summarizes the key syntax and concepts from the Silk language in a condensed form. It is meant as a quick reference; detailed semantics live in the other `docs/language/` files.

## Implementation Status (Read This First)

This cheat sheet includes **both**:

- the full language design (where some features are still evolving), and
- the **currently implemented compiler subset**.

For the authoritative “what works today”, prefer:

- any “Implementation Status” sections inside the relevant concept documents.

In particular, features such as regions (beyond the current `with` + `new`
subset), concurrency runtime (scheduler/event loop), and
dependent types are **not** implemented end-to-end yet. Value constraints are
expressed via Formal Silk (`#require` / `#assure`, including `#require` on
`struct` declarations), not refinement types.

In the current compiler subset:

- Runtime `let`/`var` bindings and compile-time `const` bindings must have an initializer (`docs/compiler/diagnostics.md`, `E2015`).
- Destructuring `let` bindings from structs are supported:
  - positional: `let (id, name) = User{ ... };`
  - named + aliasing: `let { data as d, id as i } = Record{ ... };`
- Array destructuring is supported:
  - arrays/slices: `let [a, b] = xs;`
- Enum destructuring is supported:
  - variants: `let Ok(v) = expr;`, `let Pair(a, b) = expr;`, `let E::Variant(x) = expr;` (traps on non-matching variants)
- `const` initializers must be compile-time evaluable (`docs/compiler/diagnostics.md`, `E2041`); in the current subset this is restricted to scalar expressions and calls to `const fn` functions (still no `/` or `%`), plus string literals / `const` string aliases.
- Monomorphized generics are supported for `struct`/`interface`/`impl` and applied types (`Name(args...)`):
  - const parameters/arguments and generic functions are still rejected (`E2016`),
- A small concurrency subset is implemented (`Task(T)` / `Promise(T)` plus `yield`/`await`; see `docs/language/concurrency.md`).
- The builtin `map(K, V)` type form is removed; use `std::map::{HashMap, TreeMap}` instead (`E2017`).
- Function expressions are implemented as first-class function values:
  - non-capturing: inferred `pure` — `let add = fn (x: int, y: int) -> x + y;`
  - capturing closures: may capture immutable scalar locals/parameters by value;
    capturing closures are not `pure` in the current subset.

## Types (Surface Forms)

- Booleans: `bool` — `true`, `false`.
- Integers: `u8`, `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `u128`, `i128`, `int`.
- Floats: `f32`, `f64`, `f128`.
- Char: `char`.
- String: `string`.
- Time: `Instant`, `Duration`.
- Optional: `T?` (sugar for `Option(T)`).
- References: `&T`.
- Arrays / slices: `T[]`, `T[N]`.
- Maps / dictionaries: `std::map::{HashMap, TreeMap}` (standard library).
- Function types: `fn(params) -> R` (discipline modifiers apply to function
  declarations; function types are unmodified in the current subset).
- Function expressions (non-capturing, inferred `pure`):
  - expression body: `fn (x: int, y: int) -> x + y`
  - block body: `fn (x: int, y: int) -> int { return x + y; }`
  - capturing closures are supported as a subset; see `docs/language/types.md`.
- Structs / enums / interfaces:
  - `struct Name { ... }`, `struct Name extends Base { ... }`
  - `enum Name { ... }`
  - `interface Name { ... }`, `interface Name extends Base { ... }`

## Literals

- Integers: `0`, `42`, with base/suffixes as per the spec.
- Floats: `3.14`, `1.0e-9`.
- Booleans: `true`, `false`.
- Chars: `'A'`, escape sequences.
- Strings:
  - single-line: `"hello"`,
  - multi-line: multi-line quoted forms.
- Durations: numeric + unit, e.g. `10ms`, `2s`, `5min`.
- Aggregates:
  - arrays: `[1, 2, 3]`,
  - structs: `Point { x: 1, y: 2 }`.

## Operators (Selected)

- Arithmetic: `+`, `-`, `*`, `/`, `%`.
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`.
- Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`.
- Logical: `!`, `&&`, `||`.
- Assignment: `=`, `+=`, `-=`, `*=`, `/=`.
- Increment/decrement: `++`, `--` (statement-like `void`).
- Optional / nullability:
  - optional chaining: `?.`,
  - coalescing: `??`.
- Member/scope: `.`, `::`.
- Ranges: `..`, `..=`, `...`.
- Other punctuation: `,`, `;`, `:`, `->`, `=>`.

Operator precedence and associativity follow the rules in `docs/language/operators.md`.

## Flow Control

- `if cond { ... } else { ... }` (statement form)
- `let v = if cond { a } else { b };` (`if` expression)
- `loop { ... }` (infinite loop; exits via `break`/`return`).
- `while (cond) { ... }`
- `for pattern in iterable { ... }` (ranges, builtin arrays/slices).
- `for (init; cond; step) { ... }` (C-style loop header).
- `async loop { ... }` / `task loop { ... }` (loop forms in async context).
- `match value { ... }` — pattern matching.
- `return expr;`
- `assert expr;` or `assert(expr, "message");`
- `break;`
- `continue;`
- Blocks: `{ stmt* }`.
- Expression statements: `expr;` (where allowed).

See `docs/language/flow-*.md` for details.

Executable entrypoint (initial rule):

- A minimal executable module defines exactly one top-level function:

  ```silk
  fn main() -> int {
    return 0;
  }
  ```

- This `main` function takes no parameters and returns `int`. The front-end
  enforces this shape for executable builds before code generation.

## Optionals & Mutability

- Declare optionals: `let x: T? = None;` or `let x: Option(T) = None;`.
- Create values: `None`, `Some(value)`.
- Use:
  - `user.profile?.email` — optional chaining.
  - `email ?? "default@example.com"` — coalescing.

Mutability:

- Parameters and references are immutable by default.
- Grant mutation via `mut`:
  - in function definition: `fn reset(mut r: &Runner) { ... }`,
  - at call site (syntax per spec).

## Structs, Impl Blocks, Interfaces

- Structs: `struct Frame { seq: u32, size: u16, flag: u8 }`
  - pure data, well-defined layout.
- Impl blocks: `impl Frame { fn size_bits(self: &Frame) -> u32 { ... } }`
- Interfaces:

  ```silk
  interface Element {
    fn onclick(event: &Event) -> void;
  }

  impl Button as Element {
    fn onclick(self: &Button, event: &Event) -> void { ... }
  }
  ```

See `structs-impls-layout.md` and `interfaces.md` for details.

## Regions & Buffers

- Regions (fixed-size allocation context):
  - declare: `const region arena: u8[1024];`
  - use: `with arena { let p: &Frame = new Frame{ ... }; }`
  - anonymous: `with 1024 { let p: &Frame = new Frame{ ... }; }`
- Buffers:
  - intrinsic `Buffer(T)` with `(ptr, capacity)`,
  - unsafe primitive underpinning higher-level collections.
- Allocation:
  - `new` uses the active region inside `with` (see `regions.md`).

## Concurrency

- Function modifiers:
  - `fn` — normal.
  - `async fn` — `await`-able; calling yields `Promise(T)`.
  - `task fn` — runs in parallel on a worker thread; calling yields `Task(T)`.
  - `async task fn` — `async` + `task`; calling yields `Promise(Task(T))`.
- Structured block:

	  ```silk
	  async fn get_dashboard_data() -> Dashboard {
	    // Note: the scheduler-backed `async { ... }` semantics are still design work,
	    // but the compiler implements `Task(T)`/`Promise(T)` handles, `yield`, and `await`.
	    let mut user: User;
	    let mut orders: Order[];

	    async {
	      let user_promise = fetch_user_profile(123);
	      let orders_promise = fetch_recent_orders(123);
	      user = await user_promise;
	      orders = await orders_promise;
	    }

	    return Dashboard(user, orders);
	  }
	  ```

  To receive task values, use `yield` inside a task context (`task { ... }` or `task fn`):

  ```silk
  task fn worker () -> int { return 42; }

  async fn main () -> int {
    let h = worker();
    task {
      let value: int = yield h;
      return value;
    }
  }
  ```

See `concurrency.md` for deeper semantics.

## Formal Silk

- `#const` — formal Silk declarations used inside specifications (not available at runtime).
- `#require` — preconditions.
- `#assure` — postconditions.
- `#assert` — block-local proof obligations.
- `#invariant` — invariants.
- `#variant` — termination measures.
- `#monovariant` — monotonic measures.
- `theory` / `#theory` — reusable proof obligations.

`#require` / `#assure` appear before functions; `#invariant` / `#variant` / `#monovariant` appear before loops; `#const` and `#assert` appear inside blocks. See `formal-verification.md`.

## External Declarations & ABI (Quick View)

- Declare external bindings:

  ```silk
  ext foo = fn (string) -> void;
  ext bar = u32;
  ```

- Strings:
  - Silk `string` is internally `{ ptr, len }`,
  - C side uses `SilkString { char *ptr; int64_t len; }` for embedding,
  - `ext` calls to typical C APIs may pass `const char *` derived from `string` where appropriate.

See `ext.md` and `docs/compiler/abi-libsilk.md` for full details.
