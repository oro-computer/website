# Compiler Limits

This document enumerates the current hard limits in the Silk compiler and its
tooling. These limits are **implementation guardrails** (primarily to keep
memory usage bounded when compiling untrusted inputs); they are not intended to
be permanent language constraints unless explicitly called out in the language
spec (`docs/language/`).

Where a language feature has an implementation cap that affects user code, the
cap is also documented in the relevant language document (for example
`docs/language/varargs.md`).

## Source and Manifest Size Limits

- **Silk source file max size (per file)**: **64 MiB**
  - Applies to:
    - the `silk` CLI,
    - the Zig wrapper API when it loads sources from disk,
    - the C ABI entrypoints that load sources from disk,
    - the LSP server file loader.
  - Rationale: avoid unbounded allocations while still allowing large modules.
- **Package manifest max size**: **1 MiB**
  - Applies to reading `silk.toml`.

## Front-End (Type Checker) Structural Limits

The current checker uses fixed-capacity buffers for a number of intermediate
tables. Module-/package-scoped tables are heap-backed to avoid stack overflows
when compiling large module sets, while some per-function scratch state is
still stack-backed.

When these limits are exceeded, the compiler typically reports
`E2002` (“unsupported expression in the current subset”) because the checker
uses `CheckError.UnsupportedExpression` as a shared “not supported yet” / “hit
an internal cap” path. This will be refined into dedicated “limit exceeded”
diagnostics as the compiler matures.

Current caps:

- **Top-level bindings per module**: **16384**
- **Local bindings per function**: **1024**
- **Function-like bindings tracked in a module set** (functions, externs,
  imported callables, etc.): **16384**
- **Struct declarations tracked in a module set**: **16384**
- **Enum declarations tracked in a module set**: **16384**
- **Interface declarations tracked in a module set**: **16384**
- **Type aliases tracked in a module set**: **16384**
- **Methods tracked in a module set** (impl methods, coercions, etc.): **16384**
- **Fixed array type length cap** (`T[N]`): **4096**

## Varargs Pack Capacity

Varargs are implemented using an internal, fixed-size “pack struct” lowered as
a flattened scalar-slot struct value.

- **Varargs pack capacity** (`N`): **128**

See `docs/language/varargs.md` for the surface rules and current representation.

## Lowering / IR Limits

Current caps:

- **Lowering binding environment size (per function)**: **1024**
  - This is the maximum number of simultaneously in-scope bindings that the IR
    lowerer can track.
- **Type-alias resolution depth**: **256**
  - This bounds recursive/chain alias resolution during lowering to avoid
    runaway recursion in pathological cases.
- **Varargs pack capacity** (`N`): **128**

## Const Evaluator Limits

The current const-evaluator used for the `fn main() -> int` constant
program path builds a small environment of constant top-level `let` bindings
that `main` may reference.

- **Const-eval environment bindings**: **4096**

If a module exceeds this, additional candidate bindings are ignored for the
purposes of const-evaluating `main` in that path.

## Practical examples

### Fixed array length cap

```silk
let xs: u8[4096] = [0; 4096];
```

This is within the current supported cap. Larger fixed lengths may be rejected
by the current compiler subset.

### Varargs pack capacity

```silk
std::io::println("{d} {d} {d}", 1, 2, 3);
```

Ordinary calls stay far below the current varargs pack cap. Extremely wide
varargs calls can hit the implementation guardrail even when the surface syntax
is otherwise valid.

## User-facing guidance

- Treat these as current toolchain limits, not language guarantees.
- When a limit is hit today, the diagnostic may still surface as a broader
  “current subset” rejection rather than a dedicated “limit exceeded” code.
- If a limit materially affects your downstream workload, check the relevant
  feature page and the [Diagnostics reference](?p=compiler/diagnostics) before
  assuming the construct is semantically unsupported.
