# Formal Silk

Formal Silk is Silk’s compile-time formal verification language. It is written
using syntax that does not exist at runtime and is discharged at compile time
using the Z3 SMT solver.



When Formal Silk syntax is present, compilation generates verification
conditions (VCs), proves them with Z3, and fails the build if any VC cannot be
proven. This behavior applies to:

- the `silk` CLI (`silk check`, `silk test`, `silk build`), and
- the C ABI build entrypoints (`silk_compiler_build`, `silk_compiler_build_to_bytes`).

## Proof requirements are opt-in by syntax

Silk requires proofs only when verification syntax is present in the compiled
module set:

- any use of `#...` directives (`#require`, `#assure`, `#assert`, `#invariant`,
 `#variant`, `#monovariant`, `#const`) — including `#require` attached to
 `struct` declarations.

When verification syntax is present, compilation MUST:

1. generate VCs,
2. prove them using Z3, and
3. fail compilation with clear diagnostics if any VC cannot be proven.

When verification syntax is not present, compilation does not require proofs.

## Z3 linkage and overrides

On supported native hosts, Silk links the vendored Z3 static library and its
headers (`vendor/include`) directly into the compiler:

- `linux/x86_64` -> `vendor/lib/x64-linux/libz3.a`
- `macos/aarch64` -> `vendor/lib/aarch64-macos/libz3.a`

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

Successful `silk build` runs that compile exported Formal Silk surface also emit
a distributable success-path bundle under `.silk/formal/` (or
`$SILK_WORK_DIR/formal/`) keyed by the output artifact identity. See
“Distribution and export bundles” below.

## Z3 model

The current Formal Silk verifier maps Silk constructs directly to Z3:

- `bool` → Z3 Bool.
- `string` → Z3 String (Supported forms: literals and equality/inequality comparisons).
- integer primitives → fixed-width Z3 bitvectors:
 - `i8`/`u8` → BV8
 - `i16`/`u16` → BV16
 - `i32`/`u32` → BV32
 - `i64`/`u64`/`int` → BV64

 Arithmetic is modular 2^N (wraparound). Ordered comparisons and `>>` use
 signed semantics for signed integers (`i*`/`int`) and unsigned semantics for
 unsigned integers (`u*`).
- other primitive/runtime values that do not currently have dedicated numeric
 reasoning support (for example `char`, floating-point primitives, `Range`,
 `Instant`, and `Duration`) are modeled as **opaque uninterpreted values**.
- non-primitive runtime values passed through contracts
 (`&T`, named values, optionals, arrays, function values, and applied types)
 are modeled as **opaque uninterpreted values**:
 - equality/inequality works when both sides have the same Silk type,
 - the verifier does not infer field layout or numeric ordering from these
 values,
 - this is enough for exported method receivers and distributable contracts
 that only need identity-style reasoning over non-primitive parameters.

Supported operators in specification expressions (Supported forms):

- boolean: `!`, `&&`, `||`, `==`, `!=`
- string: `==`, `!=`
- integer:
 - unary: `-`, `~`
 - arithmetic: `+`, `-`, `*`, `/`, `%`
 - bitwise: `&`, `|`, `^`, `<<`, `>>`
 - comparisons: `<`, `<=`, `>`, `>=`, `==`, `!=`
- size/layout queries: `sizeof`, `alignof`, `offsetof` (type operands and other statically-sized operands in the Supported forms)

Supported name-resolution sources in specification expressions (Supported forms):

- in-scope runtime/formal bindings,
- compiler-provided metadata constants such as `BUILD_*`, `OS_*`, and `SILK_*`,
- and const-evaluable module/package `const` bindings, including exported
 qualified names such as `std::limits::I64_MAX`.

Other operators and expression forms are currently rejected in verified code
(see the notes below).

## The `ext` boundary

External declarations (`ext`) have no body available to the verifier.

Therefore:

- The verifier cannot generate VCs about the behavior of `ext` bodies.
- In the current verifier subset, calls are supported only to functions and
 methods that have Formal Silk contracts (see “Contracted calls” below).
 `ext` declarations do not have Formal Silk contracts yet, so verified code
 cannot call `ext` functions.

See [ext](?p=language/ext) for the external-declaration rules.

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

### Function annotations

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

### Struct requirements (`#require` on `struct`)

Struct declarations may be preceded by one or more `#require` directives:

```silk
#require <Expr>;
struct Name {
  field: int,
}
```

These `#require` expressions are **struct requirements**: properties that must
hold for all values constructed for that struct type.

Rules (Supported forms):

- Struct requirement expressions may reference the struct's fields by name.
- When Formal Silk syntax is present, the verifier proves all requirements at
 struct literal construction sites (`Name{ ... }` and `new Name{ ... }`),
 using the literal's field initializers and default initialization for any
 omitted fields.
- When a struct extends a base struct, the derived struct inherits the base
 struct's requirements (all requirements must be proven at construction).
- If the verifier cannot prove a requirement, compilation fails with `E3006`.
 The diagnostic names the failed predicate and, when the predicate references
 fields initialized by the literal or by defaults, reports those field values.

Loop specifications (`#invariant`, `#variant`, `#monovariant`) follow a similar
pattern for loops.

### Loop annotations

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

- `#invariant` expressions (type `bool` in the Supported forms) as properties that must hold:
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

## Notes

Implemented end-to-end (Z3-backed, Supported forms):

- The verifier runs only when Formal Silk syntax is present.
- `#require` / `#assure`:
 - generate VCs and prove them for verified `fn` declarations and verified
 `impl` methods.
 - `#assure` may reference `result` (the return value) as a built-in formal declaration.
 - build metadata constants are available in Formal Silk expressions:
 - `BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION` as built-in compile-time `string` values,
 - and `BUILD_VERSION_MAJOR` / `BUILD_VERSION_MINOR` / `BUILD_VERSION_PATCH` as built-in compile-time `u64` values.
- Struct requirements (`#require` on `struct` declarations):
 - generate VCs and prove them at struct literal construction sites (`Type{ ... }`
 and `new Type{ ... }`),
 - include inherited requirements from base structs (`struct Child extends Base { ... }`).
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
- Contracted calls:
 - direct calls of the form `Name(args...)` are checked when `Name` resolves to
 a function with a Formal Silk contract,
 - receiver calls of the form `expr.method(args...)` are checked when the
 receiver resolves to a concrete method owner and `method` resolves to a
 method with a Formal Silk contract,
 - at every checked call site, including ordinary callers that have no Formal
 Silk annotations of their own, the verifier proves the callee’s
 preconditions (explicit `#require` and any attached-theory `#require`) under
 the caller’s current path condition; errors report `E3007`,
 - after the call, the verifier assumes the callee’s postconditions (explicit
 `#assure` plus attached-theory `#assure`/`#invariant`) into verified
 callers' symbolic state so subsequent proofs can use them,
 - if the callee has a source-visible body, the Supported forms requires that
 body to be a single return expression (no runtime statements); the verifier
 inlines that return expression in the caller’s symbolic state,
 - if the callee has **no body** (a declaration-only prototype, typically used
 when linking against a precompiled implementation), the verifier treats the
 call as **opaque**:
 - it proves the preconditions at the call site,
 - introduces an uninterpreted symbolic value for the return,
 - and assumes postconditions about that return value,
 - if the callee has **no Formal Silk contract**, verified code may still call
 it in the Supported forms:
 - if the source-visible body is a single return expression, the verifier
 may inline that return expression into the caller’s symbolic state,
 - otherwise the verifier treats the return value as opaque and assumes no
 additional facts about it,
 - unused expression-statement calls are permitted under the same rule,
 - and the verifier does not infer side-effect facts from these
 contractless calls,
 - recursion is not supported yet.
- Stdlib modules are verified when they use Formal Silk syntax, subject to the
 same current-subset restrictions described here.

Not implemented yet (selected gaps):

- Counterexample models (the verifier reports errors, but does not yet print
 a model).
- Verified local bindings are still limited to primitive/string-like symbolic
 types plus opaque parameter-style values. Field projections from typed
 parameters/results/receivers used in contracts and `#theory` arguments are
 supported through uninterpreted projections. Direct field assignment through
 a named aggregate or receiver (`name.field = expr`) is modeled by creating a
 fresh aggregate value, constraining the assigned field, preserving the other
 fields, and rechecking the aggregate's struct requirements. Verified
 function/method entry also assumes struct requirements for non-optional typed
 aggregate parameters, so direct field writes can prove requirements over
 untouched fields from the aggregate's starting invariant. Fully nested
 field-sensitive named-struct local-state reasoning is not yet supported in
 verified blocks.
- Verification of the full expression language and full statement language
 (`match`, nested loops, indirect calls, and many operators are not supported
 yet in verified code). Statement-level `if` path splitting is implemented in
 the Supported forms.
- Verified assignment statements currently support local names and direct field
 writes through named aggregate or receiver values (`name.field = expr`).
 Direct field writes re-prove the target aggregate's struct `#require`
 clauses after the write. Optional-field, index, nested-field, and compound
 assignment targets are rejected with `E3005`.

## Theories (`theory` / `#theory`)

A **theory** is a reusable, parameterized block of Formal Silk directives that
can be applied at points inside a function body to assert properties about the
current symbolic state.

### Syntax

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

### Prefix `#require` / `#assure` on theories

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

### Theories as function contracts

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
- are used by the verifier to check contracted call preconditions and to enable
 contracted calls in verified code (see “Contracted calls” above),
- are not permitted before a top-level `theory` declaration (only `#require` /
 `#assure` may prefix a theory declaration).

### Importing theories

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
- A theory use (`#theory Name(args);` or `#theory pkg::Name(args);`) resolves
 the theory name as either:
 - a local theory declared in the same module, or
 - an imported theory name from `import { ... } from "<specifier>";`, or
 - an exported theory addressed by its package-qualified name.

### Semantics

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
- In the Supported forms, specification expressions do not support function
 calls or value construction (for example `foo(x)`, `Type{...}`, arrays, or
 `new`). Such expressions are rejected as unsupported Formal Silk.

The theory form is compile-time-only and has no runtime semantics.

## Distribution and export bundles

When a successful `silk build` compiles a module set that exposes reusable
Formal Silk surface, the compiler emits a machine-readable export bundle.

Exported surface that participates today:

- `export theory Name(...) { ... }`
- exported top-level functions whose contract surface is non-empty
 (`#require`, `#assure`, or contract `#theory`)
- exported/public `impl` methods whose contract surface is non-empty

The bundle is written under the compiler work directory:

- direct builds:
 - `.silk/formal/<output-identity>/manifest.json`
 - `.silk/formal/<output-identity>/bundle.smt2`
- when `SILK_WORK_DIR` is set, the same layout is rooted there instead of
 `.silk/`

The manifest records, for each entry:

- a stable entry id
- whether it is a `theory`, `function`, or `method`
- the originating module path
- the package namespace
- the exported symbol name
- the owner type for methods
- the normalized signature string
- the payload section id inside `bundle.smt2`
- the count of exported `#require` / `#assure` obligations
- and the attached theory ids for contracted functions/methods

The payload contract is intentionally source-oriented and portable:

- `payload_solver = "z3"`
- `payload_format = "smt2"`
- `payload_encoding = "source"`

That is, Silk currently distributes normalized SMT-LIB2 source, not a
solver-private binary snapshot. This keeps the artifact inspectable, stable
across hosts, and suitable for replay with an external `z3 -smt2 ...` tool.

Installed packages copy the same bundle under the package root:

- `share/silk/formal/<artifact-relative-path>/manifest.json`
- `share/silk/formal/<artifact-relative-path>/bundle.smt2`

This makes Formal Silk metadata distributable alongside definitions, headers,
and native artifacts, while keeping source-visible theory/prototype declarations
as the authoritative import-time verification surface. Installed package
loading and `silk package inspect` discover these bundle paths so downstream
tooling can locate the exported Formal Silk payload directly.
