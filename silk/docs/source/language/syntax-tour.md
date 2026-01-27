# Silk Syntax Tour (Soup to Nuts)

This document is an example-driven tour of Silk’s **surface syntax**, from a
single-file “hello world” through modules/packages, declarations, statements,
expressions, and the Formal Silk verification directives.

This guide complements (not replaces):

- `docs/language/grammar.md` (the exact grammar the parser accepts),
- the concept documents under `docs/language/` (semantics and checker rules),
- `STATUS.md` (what works end-to-end today),
- and `docs/compiler/diagnostics.md` (error codes for unsupported forms).

## Implementation Status (Read This First)

Silk’s `docs/` are the canonical specification, and many documents describe both:

- the full language design, and
- the current compiler subset (what parses, type-checks, and code-generates today).

This tour follows the same approach:

- examples labeled “Works today” are intended to compile in the current subset,
- examples labeled “Design” illustrate planned syntax and are not necessarily implemented.

When in doubt, prefer:

- `docs/language/grammar.md` for syntax,
- `STATUS.md` for current end-to-end support,
- `tests/silk/pass_*.slk` for working example programs.

## 0. Minimal Executable Module

The smallest executable is a module with a `main` function:

```silk
fn main () -> int {
  return 0;
}
```

Notes:

- Most statements end with `;`.
- Blocks are `{ stmt* }`.
- The entrypoint for an executable build is `main` returning `int` (see
  `docs/compiler/cli-silk.md` for the CLI rules and supported targets).

## 1. Lexical Basics

### Whitespace and comments

Whitespace (spaces, tabs, newlines) is generally allowed between tokens.

Comments:

```silk
// Line comment
/* Block comment (non-nesting) */
```

Doc comments (tooling-only; see `docs/language/doc-comments.md`):

```silk
/// Line doc comment
/**
 * Block doc comment
 *
 * @example silk
 * fn main () -> int { return 0; }
 */
fn main () -> int {
  return 0;
}
```

### Identifiers and qualified names

Names are often qualified with `::`:

```silk
package my_app::core;

import std::strings;

fn main () -> int {
  let s: string = std::strings::trim(" hi ");
  return 0;
}
```

### Formal Silk directive tokens (`#...`)

Formal Silk directives like `#require` and `#invariant` are **not comments**.
They are real tokens and are parsed as part of the language (see
`docs/language/formal-verification.md`).

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

## 2. Source File Structure: `package`/`module`, `import`, then declarations

Top-level ordering is enforced (see `docs/language/packages-imports-exports.md`):

1. Optional `package ...;` **or** `module ...;`
2. Zero or more `import ...;` declarations as a contiguous block
3. All other top-level declarations (`fn`, `let`, `struct`, `enum`, `impl`, …)

### `package`

```silk
// app/main.slk
package app;

fn main () -> int {
  return 0;
}
```

### `module` (compile-time-only module values)

```silk
// crypto/sha256.slk
module crypto::sha256;
```

Modules can declare interface conformance (design surface is implemented):

```silk
// drivers/uart.slk
module drivers::uart as Device;
```

## 3. Imports and Exports

See `docs/language/packages-imports-exports.md` for the full import/export model.

### Package imports

```silk
package app;

import std::strings;

fn main () -> int {
  let s: string = trim(" hi "); // may be visible unqualified in the current subset
  let t: string = std::strings::trim(" hi ");
  return 0;
}
```

### File imports (`from "..."`)

Named import:

```silk
// main.slk
import { answer as the_answer } from "./util.slk";

fn main () -> int {
  return the_answer;
}
```

Default import (binds a default export if present, otherwise a namespace):

```silk
// module.slk
export default fn () -> int {
  return 3;
}
```

```silk
// main.slk
import foo from "./module.slk";

fn main () -> int {
  return foo();
}
```

### Named exports and re-exports

Export a declaration directly:

```silk
// util.slk
export let answer: int = 42;

export fn add1 (x: int) -> int {
  return x + 1;
}
```

Re-export an in-scope name:

```silk
// api.slk
import { answer } from "./util.slk";
export { answer as the_answer };
```

## 4. Top-Level Declarations (Overview + Examples)

This section shows the core top-level declaration forms:

- bindings: `const`, `let`, `var`
- functions: `fn` (plus `pure`/`async`/`task`)
- type aliases: `type`
- types: `struct`, `enum`, `interface`, `impl`, `error`
- external declarations: `ext`
- tests: `test`
- Formal Silk: `theory` (and `#...` directives)

### 4.1 Bindings: `const`, `let`, `let mut`, `var`

Works today (current subset requires initializers; see `E2015`):

```silk
fn main () -> int {
  const answer: int = 42;
  let x: int = answer;
  let mut y: int = 0;
  var z: int = 1; // `var` is an alias for `let mut` (current subset)

  y = y + 1;
  z += 2;
  return x + y + z;
}
```

Notes:

- `const` initializers must be compile-time evaluable in the current subset
  (see `E2041`).
- Only `let mut`/`var` bindings are assignable lvalues (see
  `docs/language/mutability.md` and `docs/language/operators.md`).
- Destructuring `let` bindings are supported for struct values:

  ```silk
  struct User { id: u64, name: string }
  let (id, name) = User{ id: 123, name: "alice" };

  struct Record { id: u64, data: string }
  let { data as d, id as i } = Record{ id: 456, data: "other" };
  ```

  Array destructuring is also supported:

  ```silk
  let records: Record[] = [{ id: 123, data: "a" }, { id: 456, data: "b" }];
  let [a, b] = records;
  ```

### 4.2 Functions: `fn` (plus `pure`, `async`, `task`)

Basic function declaration:

```silk
fn add (x: int, y: int) -> int {
  return x + y;
}
```

`pure fn` (restricted subset; see `docs/language/function-disciplines.md`):

```silk
pure fn inc (x: int) -> int {
  return x + 1;
}
```

`async fn` / `task fn` / `async task fn` (handles; see `docs/language/concurrency.md`):

```silk
task fn worker () -> int {
  return 7;
}

async fn main () -> int {
  task {
    let t = worker(); // Task(int)
    let value: int = yield t;
    return value;
  }
}
```

#### Parameters: `mut`, defaults, and varargs

Mutable reference parameters require `mut` both in the signature and at the
call site (see `docs/language/mutability.md`):

```silk
struct Pair { a: int, b: int }

fn bump_a (mut p: &Pair) -> void {
  p.a += 1;
}

fn main () -> int {
  let mut p: Pair = Pair{ a: 1, b: 2 };
  bump_a(mut p);
  return p.a;
}
```

Default arguments (current subset restricts default expressions to a constant/literal subset):

```silk
fn add2 (x: int, y: int = 2) -> int {
  return x + y;
}
```

Varargs (final parameter prefixed by `...`; see `docs/language/varargs.md`):

```silk
fn log (fmt: string, ...args: std::fmt::Arg) -> void {
  std::io::println(fmt, args);
}
```

#### Generic function parameter split (`;`) (Design, parsed but rejected)

Generic functions use `;` to separate compile-time parameters from value parameters:

```silk
// Design (currently rejected with `E2016`).
fn get_first(T, N: int; xs: &T[N]) -> T {
  return xs[0];
}
```

### 4.3 Function expressions (lambdas)

Works today (non-capturing expression body):

```silk
fn main () -> int {
  let add = fn (x: int, y: int) -> x + y;
  return add(1, 2);
}
```

Works today (block body with explicit return type):

```silk
fn main () -> int {
  let add = fn (x: int, y: int) -> int {
    return x + y;
  };
  return add(1, 2);
}
```

Capturing closures are supported as a restricted subset; see `docs/language/types.md`
and `docs/language/memory-model.md`.

### 4.4 Type aliases: `type`

Basic alias:

```silk
type I = int;
```

Optional kind tags (validated by the checker; see `docs/language/types.md`):

```silk
type struct UserId = int;
type fn IntAdder = fn(int, int) -> int;
type pure fn PureIntAdder = fn(int, int) -> int;
```

### 4.5 Structs: `struct` and `impl`

Struct declarations (fields use `name: Type`, optional default with `=`):

```silk
struct Point {
  x: int = 0,
  y: int = 0,
}
```

Struct literals:

```silk
fn main () -> int {
  let p1: Point = Point{ x: 1, y: 2 };
  let x = p1.x;

  // Shorthand field init (`x` means `x: x`):
  let y: int = 3;
  let p2: Point = Point{ x, y };

  return x + p2.y;
}
```

Inferred struct literals require an expected struct type context:

```silk
fn main () -> int {
  let p: Point = { x: 1, y: 2 };
  return p.x + p.y;
}
```

Heap allocation (`new`) produces a `&Struct` reference in the current subset:

```silk
struct Boxed { value: int }

fn main () -> int {
  let b: &Boxed = new Boxed{ value: 7 };
  return b.value;
}
```

Attach methods with `impl` (see `docs/language/structs-impls-layout.md`):

```silk
impl Point {
  public fn sum (self: &Point) -> int {
    return self.x + self.y;
  }
}

fn main () -> int {
  let p: Point = Point{ x: 1, y: 2 };
  return p.sum();
}
```

Single inheritance (current surface is implemented; see `docs/language/structs-impls-layout.md`):

```silk
// Design shape (field/layout rules and current subset limits are documented).
struct Base { x: int = 0 }
struct Derived extends Base { y: int = 0 }
```

### 4.6 Enums: `enum` + `match` expression

```silk
enum Color {
  Red,
  Rgb(u8, u8, u8),
}

fn to_int (c: Color) -> int {
  return match c {
    Color::Red => 0,
    Color::Rgb(r, g, b) => (r as int) + (g as int) + (b as int),
  };
}
```

See `docs/language/enums.md` and `docs/language/flow-match.md`.

### 4.7 Interfaces and `impl ... as ...`

```silk
interface Counter {
  fn inc() -> void;
  fn get() -> int;
}

struct Cell { value: int = 0 }

impl Cell as Counter {
  fn inc (mut self: &Cell) -> void {
    self.value += 1;
  }

  fn get (self: &Cell) -> int {
    return self.value;
  }
}
```

See `docs/language/interfaces.md`.

### 4.8 Typed errors: `error`, `panic`, `T | ErrorType...`, `match` statement, `?`

Error type declaration:

```silk
error OutOfBounds {
  index: int,
  len: int
}
```

Error-producing signatures use `|`:

```silk
fn get_at (xs: &u8[], index: int) -> u8 | OutOfBounds {
  if index < 0 || index >= std::length(xs) {
    panic OutOfBounds { index: index, len: std::length(xs) };
  }
  return xs[index];
}
```

Handling typed errors uses the `match` **statement** form:

```silk
fn main () -> int {
  match (get_at([1, 2, 3], 10)) {
    value => {
      return value as int;
    },
    err: OutOfBounds => {
      std::abort();
    }
  }
}
```

Propagating errors from calls uses postfix `?`:

```silk
// Works today when `main` declares a compatible error set.
fn main () -> int | OutOfBounds {
  let x: u8 = get_at([1, 2, 3], 0)?;
  return x as int;
}
```

See `docs/language/typed-errors.md`.

### 4.9 External declarations: `ext`

External function binding (symbol name optional; see `docs/language/ext.md`):

```silk
export ext puts = fn(string) -> int;
export ext c_abort "abort" = fn() -> void;
export ext errno "errno" = int;
```

Note: C variadics (`printf`-style `...`) via `ext` are not implemented yet; see
`docs/language/varargs.md` and `docs/language/ext.md`.

See also: `docs/compiler/abi-libsilk.md` (C ABI) and `include/silk.h`.

### 4.10 Tests: `test`

```silk
test "addition works" {
  if (1 + 2) != 3 {
    std::abort();
  }
}
```

See `docs/language/testing.md` and run with `silk test`.

### 4.11 Formal Silk theories: `theory`

Top-level theory (exportable/importable):

```silk
export theory nonzero (x: int) {
  #require x != 0;
}
```

Apply a theory inside a function:

```silk
import { nonzero } from "./theories.slk";

fn main () -> int {
  let x: int = 1;
  #theory nonzero(x);
  return 0;
}
```

Inline (block-local) theories use the same `#theory` token and are
disambiguated from theory use by `{ ... }` (inline declaration) vs `;` (use):

```silk
fn main (x: int, y: int) -> int {
  #theory local_sum_nonzero (x: int, y: int) {
    #const z = x + y;
    #assure z != 0;
  }

  #theory local_sum_nonzero(x, y);
  return 0;
}
```

See `docs/language/formal-verification.md`.

## 5. Types (Surface Forms)

See `docs/language/types.md` for full details and implementation limits.

### Primitive types

```text
bool, i8/u8, i16/u16, i32/u32, i64/u64, int, f32/f64, char, string, void, Instant, Duration
```

### Optional types

```silk
fn main () -> int {
  let a: int? = None;
  let b: int? = Some(7);
  let c: int = b ?? 0;
  return c;
}
```

Nested optionals use `??` in type position (`T??` means “optional of optional”):

```silk
fn main () -> int {
  let x: int?? = Some(Some(1));
  let y: int? = x ?? None;
  return (y ?? 0);
}
```

Optional `match` expressions are the explicit form of optional consumption:

```silk
fn main () -> int {
  let x: int? = Some(7);
  let y: int = match x {
    None => 0,
    Some(v) => v,
  };
  return y;
}
```

### References

```silk
fn sum (p: &Point) -> int {
  return p.x + p.y;
}
```

### Arrays and slices

```silk
fn main () -> int {
  let xs: int[] = [1, 2, 3];
  return xs[0];
}
```

Fixed-length arrays use `T[N]`:

```silk
fn main () -> int {
  let xs: int[3] = [1, 2, 3];
  return xs[2];
}
```

### Function types

```silk
type IntBinOp = fn(int, int) -> int;

fn main () -> int {
  let add: IntBinOp = fn (x: int, y: int) -> x + y;
  return add(1, 2);
}
```

### Applied types and generics

Generic parameter lists on `struct`/`interface`/`impl` are implemented:

```silk
struct Box(T) { value: T }

fn main () -> int {
  let b: Box(int) = { value: 1 };
  return b.value;
}
```

See `docs/language/generics.md` for current subset limits (notably `E2016` for
const parameters/arguments and generic functions).

## 6. Statements (Inside Blocks)

The statement grammar is summarized in `docs/language/grammar.md` and detailed
in `docs/language/flow-*.md`.

### `if` / `else`

```silk
fn main () -> int {
  let x: int = 1;
  if x == 0 {
    return 0;
  } else {
    return 1;
  }
}
```

### `loop`, `while`, `for`

```silk
fn main () -> int {
  let mut i: int = 0;
  while i < 3 {
    i += 1;
  }
  return i;
}
```

`for` over a range form (special-cased surface; see `docs/language/flow-for.md`):

```silk
fn main () -> int {
  let mut sum: int = 0;
  for i in 0 .. 5 {
    sum += i;
  }
  return sum;
}
```

C-style `for` header:

```silk
fn main () -> int {
  let mut sum: int = 0;
  for (let mut i: int = 0; i < 5; i += 1) {
    sum += i;
  }
  return sum;
}
```

### `break`, `continue`, `return`

```silk
fn main () -> int {
  let mut i: int = 0;
  loop {
    i += 1;
    if i < 3 {
      continue;
    }
    break;
  }
  return i;
}
```

### `assert` and `panic`

```silk
fn main () -> int {
  assert 1 + 2 == 3;
  assert(2 + 2 == 4, "math is broken");
  return 0;
}
```

`panic` is used for typed errors (see `docs/language/typed-errors.md`):

```silk
panic OutOfBounds { index: 1, len: 0 };
```

### `match` statement (typed errors)

See `docs/language/typed-errors.md` for the Terminal Arm Rule and the supported
pattern forms.

### `async { ... }` and `task { ... }`

Structured blocks (implemented as lexical blocks in the current subset; see
`docs/language/concurrency.md`):

```silk
async fn main () -> int {
  async {
    // async region
  }
  task {
    // task region
  }
  return 0;
}
```

### Concurrency operators: `await`, `await *`, `yield`, `yield *`

`await` unwraps `Promise(T)` values inside `async fn`:

```silk
async fn add2 (x: int) -> int {
  return x + 2;
}

async fn main () -> int {
  let p = add2(1); // Promise(int)
  let v: int = await p;
  return v;
}
```

`await *` awaits a collection of promises and yields a collected `T[]`:

```silk
async fn add1 (x: int) -> int {
  return x + 1;
}

async fn main () -> int {
  let values: int[] = await * [add1(1), add1(2), add1(3)];
  return values[0] + values[1] + values[2];
}
```

`yield` / `yield *` interact with `Task(T)` values (used inside `task` regions in
the current subset):

```silk
task fn producer (n: int) -> int {
  var i: int = 0;
  while i < n {
    yield i;
    i += 1;
  }
  return n;
}

async fn main () -> int {
  task {
    let t = producer(2); // Task(int)
    let values: int[] = yield * t;
    return values[0] + values[1] + values[2];
  }
}
```

## 7. Expressions (Precedence + Demonstrations)

Silk expressions follow a conventional precedence hierarchy. For the exact
productions, see `docs/language/grammar.md`.

### Literals and other primary expressions

See the `docs/language/literals-*.md` concept documents for precise rules.

```silk
fn main () -> int {
  // Booleans.
  let b: bool = true;

  // Integers and floats.
  let i: int = 42;
  let u: u8 = 0xFF;
  let f: f64 = 3.14;

  // Characters and strings.
  let ch: char = 'A';
  let s1: string = "hello";
  let s2: string = `raw \n no escapes`;

  // Durations.
  let d: Duration = 10ms;

  // Optionals.
  let opt: int? = Some(i);
  let x: int = opt ?? 0;

  // Arrays.
  let xs: int[] = [1, 2, 3];

  assert b;
  assert x == 42;
  assert xs[0] == 1;
  assert u == 0xFF;
  assert s1 == "hello";
  assert s2 == `raw \n no escapes`;
  assert ch == 'A';
  assert (f as int) == 3;
  assert (d as int) == (d as int);

  // `d` exists to demonstrate duration literal syntax. See `docs/language/literals-duration.md`.
  return 0;
}
```

### Postfix forms: calls, fields, indexing, casts, `?`, `++/--`

```silk
struct Point { x: int, y: int }

fn main () -> int {
  let xs: int[] = [10, 20, 30];
  let a: int = xs[0];
  let b: int = (a + 1) as int;
  let c: int = Point{ x: 1, y: 2 }.x;
  return b + c;
}
```

### `as` and `as raw`

`as` performs explicit numeric/shape casts and `as raw` performs raw bit casts
for scalar types (see `docs/language/operators.md`).

```silk
fn main () -> int {
  let bits: u64 = (1.0 as f32) as raw u64;
  let f: f32 = bits as raw f32;
  return f as int;
}
```

### Unary forms: `!`, `~`, `-`, `new`, `await`, `yield`, `mut`, `++/--`

```silk
fn main () -> int {
  let mut x: int = 0;
  ++x;
  x++;
  if !(x == 2) {
    return 1;
  }
  return 0;
}
```

`mut <expr>` is permitted only where a mutable borrow is required (most
commonly, in call arguments and method receivers):

```silk
struct Pair { a: int, b: int }

fn bump (mut p: &Pair) -> void {
  p.a += 1;
}

fn main () -> int {
  let mut p: Pair = Pair{ a: 0, b: 0 };
  bump(mut p);
  return p.a;
}
```

### Arithmetic, bitwise, comparisons, and boolean operators

```silk
fn main () -> int {
  let a: int = 1 + 2 * 3;
  let b: int = (a << 1) | 1;
  if (b >= 0) && (b != 0) {
    return b;
  }
  return 0;
}
```

### Optional operators: `?.` and `??`

```silk
struct User { email: string }

fn main () -> int {
  let user: User? = Some(User{ email: "a@b.c" });
  let email: string = user?.email ?? "unknown";
  if email == "a@b.c" {
    return 0;
  }
  return 1;
}
```

### Typed error propagation: postfix `?` on calls

```silk
fn main () -> int | OutOfBounds {
  let x: u8 = get_at([1, 2, 3], 0)?;
  return x as int;
}
```

## 8. Formal Silk (Verification) Syntax (Implemented Subset)

Formal Silk is Silk’s compile-time verification surface (Z3-backed). It uses
directive tokens that attach to functions and loops:

- function contracts: `#require`, `#assure`, `#theory`
- loop contracts: `#invariant`, `#variant`, `#monovariant`
- formal Silk declarations: `#const`
- block-local proof obligations: `#assert`
- reusable proof bundles: `theory` / `#theory`

See `docs/language/formal-verification.md` for the exact verifier model and
current restrictions.

### Contracts on functions

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}
```

### Loop invariants, variants, and monovariants

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  #monovariant i;
  while i < limit {
    i += 1;
  }
  return 0;
}
```

### Theories (`theory` / `#theory`)

```silk
export theory add_commutes (x: int, y: int) {
  #assure (x + y) == (y + x);
}

#theory add_commutes(x, y);
fn add (x: int, y: int) -> int {
  return x + y;
}
```

## 9. Next References

If you want more detail on a specific construct, jump to:

- Syntax: `docs/language/grammar.md`
- Types: `docs/language/types.md`, `docs/language/generics.md`
- Operators: `docs/language/operators.md`
- Flow control: `docs/language/flow-overview.md` and `docs/language/flow-*.md`
- Modules/imports/exports: `docs/language/packages-imports-exports.md`
- Optionals: `docs/language/optional.md`
- Typed errors: `docs/language/typed-errors.md`
- Concurrency: `docs/language/concurrency.md`
- Formal verification: `docs/language/formal-verification.md`
