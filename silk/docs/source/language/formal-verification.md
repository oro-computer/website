# Formal Silk

Formal Silk is Silk’s compile-time formal verification language. It is written
using syntax that does not exist at runtime and is discharged at compile time
using the Z3 SMT solver.

Status: **implemented subset (Z3-backed)**.

When Formal Silk syntax is present, compilation generates verification
conditions (VCs), proves them with Z3, and fails the build if any VC cannot be
proven. This behavior applies to:

- the `silk` CLI (`silk check`, `silk test`, `silk build`), and
- the C ABI build entrypoints (`silk_compiler_build`, `silk_compiler_build_to_bytes`).

## Proof requirements are opt-in by syntax

Silk requires proofs only when verification syntax is present in the compiled
module set:

- any use of `#...` directives (`#require`, `#assure`, `#assert`, `#invariant`,
  `#variant`, `#monovariant`, `#const`), and/or
- any use of `where` predicates (for example refinement-type binders).

Note: `where` predicates are not implemented yet. When they land, they will
also be treated as verification syntax.

When verification syntax is present, compilation MUST:

1. generate VCs,
2. prove them using Z3, and
3. fail compilation with clear diagnostics if any VC cannot be proven.

When verification syntax is not present, compilation does not require proofs.

## Z3 linkage and overrides

On `linux/x86_64`, Silk always links the vendored Z3 static library
(`vendor/lib/x64-linux/libz3.a`) and its headers (`vendor/include`).

To override the Z3 library at runtime (for example to test against a different
Z3 build), provide a dynamic library path:

- CLI: pass `--z3-lib <path>`, or
- CLI/ABI: set `SILK_Z3_LIB` in the environment.

When `--z3-lib` is provided, it overrides `SILK_Z3_LIB`.

## Debugging proofs with Z3 (`--debug`)

When a verification condition fails, the compiler reports a normal diagnostic
at the failing annotation site.

When `--debug` is passed to `silk build` or `silk test`, the verifier also emits
additional Z3 debugging output to stderr and writes an SMT-LIB2 reproduction
script under `.silk/z3/` in the current working directory (or `$SILK_WORK_DIR/z3`):

- `.silk/z3/silk_z3_m<module>_<n>.smt2`

You can replay the query with an external Z3 binary:

```sh
z3 -smt2 .silk/z3/silk_z3_m0_0.smt2
```

## Z3 model (current subset)

The current Formal Silk verifier maps Silk constructs directly to Z3:

- `bool` → Z3 Bool.
- `string` → Z3 String (current subset: literals and equality/inequality comparisons).
- integer primitives → fixed-width Z3 bitvectors:
  - `i8`/`u8` → BV8
  - `i16`/`u16` → BV16
  - `i32`/`u32` → BV32
  - `i64`/`u64`/`int` → BV64

  Arithmetic is modular 2^N (wraparound). Ordered comparisons and `>>` use
  signed semantics for signed integers (`i*`/`int`) and unsigned semantics for
  unsigned integers (`u*`).

Supported operators in specification expressions (current subset):

- boolean: `!`, `&&`, `||`, `==`, `!=`
- string: `==`, `!=`
- integer:
  - unary: `-`, `~`
  - arithmetic: `+`, `-`, `*`, `/`, `%`
  - bitwise: `&`, `|`, `^`, `<<`, `>>`
  - comparisons: `<`, `<=`, `>`, `>=`, `==`, `!=`
- size/layout queries: `sizeof`, `alignof`, `offsetof` (type operands and other statically-sized operands in the current subset)

Other operators and expression forms are currently rejected in verified code
(see “Implementation Status” below).

## The `ext` boundary

External declarations (`ext`) have no body available to the verifier.

Therefore:

- The verifier cannot generate VCs about the behavior of `ext` bodies.
- In the current verifier subset, calls are supported only to functions that
  have Formal Silk contracts (see “Calls in verified code” below). `ext`
  declarations do not have Formal Silk contracts yet, so verified code cannot
  call `ext` functions.

See `docs/language/ext.md` for the external-declaration rules.

The main constructs are:

- `#const` — formal Silk declarations used inside specifications.
- `#require` — precondition.
- `#assure` — postcondition.
- `#assert` — block-local proof obligation.
- `#invariant` — loop or state invariant.
- `#variant` — well-founded termination measure (ranking function).
- `#monovariant` — monotonic measure (non-decreasing or non-increasing).
- `theory` / `#theory` — reusable, parameterized proof obligations.

Key properties:

- These annotations appear before the function or loop they describe.
- They are used by the verifier only and incur no runtime cost.

### Formal Silk declarations (`#const`)

Formal Silk declarations let you name intermediate values for use in specifications.

Syntax (implemented):

```silk
#const name = <Expr>;
```

Rules:

- `#const` is a statement that may appear inside function bodies (inside blocks).
- The binding is **compile-time-only** and is not lowered into runtime code.
- A `#const` binding is visible only inside specification expressions:
  - function specs (`#require`, `#assure`),
  - loop specs (`#invariant`, `#variant`, `#monovariant`).
- Using a `#const` name in a runtime expression (e.g. in `while` conditions or normal
  `let` initializers) is a compile-time error. Use a normal `let` binding for
  runtime values, and (optionally) introduce a `#const` alias for specifications.

Example:

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  while i < limit {
    i = i + 1;
  }
  return 0;
}
```

### Function annotations (initial syntax)

For functions, the initial surface syntax is:

```silk
#require <Expr>;
#require <Expr2>;
#assure <Expr3>;
#theory TheoryName(args...);
fn name (params) -> ResultType {
  ...
}
```

- One or more `#require`, `#assure`, and contract-theory attachments
  (`#theory Name(args...);`) may appear, in any order, immediately before the
  `fn` declaration (and before any `export` modifier).
- Each annotation is terminated by a semicolon.
- The compiler front-end:
  - lexes these annotations as dedicated tokens,
  - parses the annotation expressions using the normal expression grammar,
  - type-checks each annotation expression as `bool` so obvious mistakes are
    rejected early (specifications are still compile-time-only metadata),
  - attaches them to the corresponding function in the AST as lists of
    preconditions, postconditions, and contract theories.

Loop specifications (`#invariant`, `#variant`, `#monovariant`) follow a similar
pattern for loops.

### Loop annotations (initial syntax)

For `while` loops, the initial surface syntax is:

```silk
#invariant <Expr>;
#variant <Expr2>;
#monovariant <Expr3>;
while condition {
  ...
}
```

Rules:

- One or more `#invariant` annotations, zero or more `#monovariant` annotations,
  and at most one `#variant` annotation may appear immediately before the
  `while` keyword.
- Each annotation is terminated by a semicolon.
- The compiler front-end:
  - lexes these annotations as directive tokens,
  - parses the annotation expressions using the normal expression grammar,
  - attaches them to the corresponding loop in the AST as invariants,
    monovariants, and a (single) variant expression.

The verifier will interpret:

- `#invariant` expressions (type `bool` in the current subset) as properties that must hold:
  - before entering the loop,
  - after each iteration (assuming the body and condition do not diverge),
  - and at `break` exits (so proofs after the loop may rely on the invariant).
- `#variant` expressions as a well-founded measure that must decrease on each
  iteration (and be non-negative at the loop head), used for termination proofs.
- `#monovariant` expressions as measures that must be monotonic on each
  iteration (either non-decreasing or non-increasing, proved consistently across
  all continuation paths).

Compiler requirements:

- Parse and represent these annotations in the AST.
- Integrate with the verifier to check specifications.
- Ensure that, if verification fails, compilation fails with clear diagnostics.

### Block assertions (`#assert`)

Formal Silk also supports block-local proof obligations:

```silk
#assert <Expr>;
```

Rules:

- `#assert` is a statement that may appear inside function/test bodies (inside
  blocks).
- It is compile-time-only metadata and is not lowered into runtime code.
- The verifier must prove the assertion holds in the current symbolic state at
  the `#assert` site. If it cannot be proven, compilation fails.
- After a `#assert` succeeds, the asserted expression is assumed to hold for
  the remainder of the block (so later proofs may rely on it).

## Implementation Status (Current Compiler Subset)

Implemented end-to-end (Z3-backed, current subset):

- The verifier runs only when Formal Silk syntax is present.
- `#require` / `#assure`:
  - generate VCs and prove them for verified `fn` declarations and verified
    `impl` methods.
  - `#assure` may reference `result` (the return value) as a built-in formal declaration.
  - build metadata constants are available in Formal Silk expressions:
    - `BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION` as built-in compile-time `string` values,
    - and `BUILD_VERSION_MAJOR` / `BUILD_VERSION_MINOR` / `BUILD_VERSION_PATCH` as built-in compile-time `u64` values.
- `#assert`:
  - proves the asserted expression holds at the `#assert` site,
  - and then assumes it for the remainder of the block.
- `#invariant` / `#variant` / `#monovariant` on `while` loops:
  - prove invariants at entry and preservation across one iteration,
  - prove variants are non-negative and decrease across one iteration.
  - prove monovariants are monotonic across one iteration (either non-decreasing
    or non-increasing, consistent across all continuation paths).
- Formal Silk declarations via `#const`:
  - may be referenced only by specification expressions,
  - are rejected in runtime expressions (`E2014`).
- `theory` (reusable assertions, initial subset):
  - `theory Name(params) { ... }` defines a reusable set of proof obligations
    (exportable/importable at top level),
  - `#theory Name(args);` applies it in a function body as compile-time-only
    assertions,
  - `#theory Name(params) { ... }` may also declare an inline (non-exportable)
    local theory inside a block.
- Calls in verified code (contracted-call subset):
  - direct calls of the form `Name(args...)` are supported in verified code when
    `Name` resolves to a function with a Formal Silk contract,
  - at the call site, the verifier proves the callee’s preconditions (explicit
    `#require` and any attached-theory `#require`) under the caller’s current
    path condition; errors report `E3007`,
  - after the call, the verifier assumes the callee’s postconditions (explicit
    `#assure` plus attached-theory `#assure`/`#invariant`) into the caller’s
    symbolic state so subsequent proofs can use them,
  - if the callee has a source-visible body, the current subset requires that
    body to be a single return expression (no runtime statements); the verifier
    inlines that return expression in the caller’s symbolic state,
  - if the callee has **no body** (a declaration-only prototype, typically used
    when linking against a precompiled implementation), the verifier treats the
    call as **opaque**:
    - it proves the preconditions at the call site,
    - introduces an uninterpreted symbolic value for the return,
    - and assumes postconditions about that return value,
  - recursion is not supported yet.
- Stdlib is currently skipped:
  - Formal Silk verification does not run on `std::...` modules yet (they are
    treated as trusted) until the verifier covers the full std surface.

Not implemented yet (selected gaps):

- Counterexample models (the verifier reports errors, but does not yet print
  a model).
- Verification of the full expression language and full statement language
  (`if`, `match`, nested loops, indirect calls/method calls, and many operators
  are not supported yet in verified code).
- `where` predicates / refinement types.

## Theories (`theory` / `#theory`)

A **theory** is a reusable, parameterized block of Formal Silk directives that
can be applied at points inside a function body to assert properties about the
current symbolic state.

### Syntax (implemented subset)

Declaration form (top-level):

```silk
export theory a_custom_theory (x: int, y: int) {
  #const z = x + y;
  #invariant x != 0 && y != 0;
  #invariant z > 1;
}
```

An inline theory declaration may also appear as a statement inside a
function/test block:

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

Use form (statement inside a function body, or inside another theory body):

```silk
fn main (x: int, y: int) -> int {
  #theory a_custom_theory(x, y);
  return 0;
}
```

Theories may apply other theories:

```silk
export theory nonzero (x: int) {
  #require x != 0;
}

export theory nonzero_sum (x: int, y: int) {
  #theory nonzero(x);
  #theory nonzero(y);
  #assure (x + y) != 0;
}
```

Notes:

- Top-level theory declarations use the `theory` keyword.
- Inline (block) theory declarations and theory use sites share the `#theory`
  token; the parser disambiguates by the token that follows the
  argument/parameter list:
  - `{ ... }` starts an inline theory declaration,
  - `;` terminates a theory use.
- A top-level theory declaration may be exported (`export theory ...`). Exported
  theories may be imported from other modules and reused.
- Inline theory declarations inside a block are not exportable/importable; they
  exist only in the containing block and may be applied via `#theory Name(...);`
  after they are declared.
- A theory body may contain `#theory Name(args);` statements. These are
  compile-time-only theory applications; they are checked by the verifier in the
  current symbolic state at the point they appear in the theory body.
- Theory recursion is rejected (direct or indirect cycles).
- Theories are not runtime functions. They can only be applied via `#theory` use
  statements; calling a theory with normal call syntax (`Name(...)`) is a
  compile-time error.

### Prefix `#require` / `#assure` on theories (implemented subset)

For ergonomics, a `theory` declaration may be preceded by `#require` and/or
`#assure` directives:

```silk
#require x >= 0;
export theory ensure_nonnegative_x (x: int) {
  #assure x >= 0;
}
```

These prefix directives are treated as if they were written at the beginning of
the theory body.

### Theories as function contracts (implemented subset)

A function may attach one or more theories as part of its Formal Silk contract
surface by placing `#theory Name(args...);` directives in the function-spec
prelude:

```silk
import { bounded_nonneg_add } from "./theories.slk";

#theory bounded_nonneg_add(x, y);
export fn add (x: int, y: int) -> int {
  return x + y;
}
```

Contract-theory attachments:

- are compile-time-only metadata (not runtime statements),
- contribute additional preconditions/postconditions to the function contract:
  - `#require` become additional function preconditions,
  - `#assure` and `#invariant` become additional function postconditions,
- are used by the verifier to enable contracted calls in verified code (see
  “Calls in verified code” above),
- are not permitted before a top-level `theory` declaration (only `#require` /
  `#assure` may prefix a theory declaration).

### Importing theories (implemented subset)

Exported theories may be imported via JS-style named imports and then applied
via `#theory` use statements.

Example:

```silk
// theories.slk
export theory ensure_positive_x (x: int) {
  #assure x > 0;
}
```

```silk
// main.slk
import { ensure_positive_x as pos_x } from "./theories.slk";

fn main () -> int {
  let x: int = 1;
  #theory pos_x(x);
  return 0;
}
```

Rules:

- Only exported theories may be imported.
- A theory use (`#theory Name(args);`) resolves `Name` as either:
  - a local theory declared in the same module, or
  - an imported theory name from `import { ... } from "<specifier>";`.
- Namespace imports (`import ns from "<specifier>";`) do not currently provide
  theory access, because theory use sites do not accept qualified names
  (`ns::TheoryName`) yet.

### Semantics (initial subset)

When a theory is applied (`#theory Name(args);`):

- its parameters are bound to the provided argument expressions (as
  specification expressions),
- its `#const` formal declarations are evaluated and are visible only within the
  theory during checking,
- each `#require <Expr>;`, `#invariant <Expr>;`, and `#assure <Expr>;`
  directive in the theory body is treated as a compile-time proof obligation
  that must hold in the current symbolic state at the use site,
- each `#variant <Expr>;` directive in the theory body is treated as a
  non-negativity obligation (`Expr >= 0`) at the use site (the theory form does
  not model decrease across iterations).

Theory bodies are verifier-only:

- Theory argument expressions and theory directive expressions are **Formal Silk
  specification expressions** evaluated by the verifier.
- In the current subset, specification expressions do not support function
  calls or value construction (for example `foo(x)`, `Type{...}`, arrays, or
  `new`). Such expressions are rejected as unsupported Formal Silk.

The theory form is compile-time-only and has no runtime semantics.
