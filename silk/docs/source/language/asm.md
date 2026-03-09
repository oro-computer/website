# Inline Assembly (`asm`)

Silk provides an `asm` keyword for embedding inline assembly in a way that is
explicit in source code and assembled at compile time.

Inline assembly is inherently low-level and target-dependent. Use `asm` when
you need precise control over emitted instructions that cannot be expressed
with the standard library or `ext` bindings.

## Syntax

`asm` is an expression that takes a single string literal:

```silk
fn spin_pause () -> void {
  asm "pause";
}
```

The expression has type `void` and is intended to appear as an expression
statement.

## Semantics

- `asm "<text>";` emits the machine instructions assembled from `<text>`.
- The assembly text must be a **string literal**; it is not computed at
  runtime.
- Inline asm produces no values (type `void`).
- Inline asm is treated as an explicit side-effecting operation (it is not
  elided).

### Assembly dialect (current implementation)

In the current implementation, `<text>` is assembled by the system GNU
assembler (`as`) using **Intel syntax** (`.intel_syntax noprefix`).

The assembly may contain multiple instructions, for example:

```silk
fn main () -> int {
  asm "mov rax, rax\nnop";
  return 0;
}
```

### Restrictions (current implementation)

- `asm` is implemented only for the native `linux/x86_64` IR→ELF backend.
- The assembled output must not require **relocations**. As a result, inline
  asm may not refer to external symbols (for example `call foo` where `foo` is
  not defined within the asm text).
- Operands (inputs/outputs), clobbers, and options are not yet modeled in the
  type system. Inline asm is therefore not suitable for expressing constraints
  like “reads memory” / “clobbers rax”; it is raw instruction emission.

## Portability and safety notes

- `asm` is target-dependent by nature. The current implementation is supported
  only for the native `linux/x86_64` IR→ELF backend.
- Using `asm` can make programs non-portable. Prefer standard library
  facilities and compiler-provided intrinsics when possible.

## Implementation status

- Parser: accepts `asm "<string literal>"` as an expression.
- Type checker:
  - requires a string literal operand,
  - assembles the text for the native backend and reports `E2116` when the asm
    fails to assemble or uses unsupported features (such as relocations),
  - assigns the expression type `void`.
- Code generation:
  - emits the assembled bytes in the `linux/x86_64` IR→ELF backend.
- Tests:
  - end-to-end coverage via:
    - `tests/silk/pass_asm_basic.slk`
    - `tests/silk/pass_asm_arbitrary.slk`
    - `tests/silk/fail_asm_unknown_mnemonic.slk`
    - `tests/silk/fail_asm_relocations_not_supported.slk`

Not yet implemented:

- inline asm with operands (inputs/outputs), clobbers, or options,
- any `asm` support on non-`linux/x86_64` targets/backends.
