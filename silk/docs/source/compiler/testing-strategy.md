# Testing Strategy (Zig + C99 + Silk)

This document defines how we validate the compiler, ABI, and standard library.

For downstream users, the practical takeaway is simple:

```sh
silk check app.slk
silk test app.slk
silk build app.slk -o build/app
```

The reference implementation uses deeper Zig/C/Silk validation behind the
scenes, but the public CLI loop above remains the first smoke test for any
language or stdlib feature.

## Goals

- Ensure that the Zig implementation and the C99 ABI behave identically for all semantics specified in `docs/`.
- Provide confidence in language features, FFI, and standard library behavior.
- Make testing incremental and continuous: **every new feature or module must land with tests**, not as a separate phase.

## Zig Tests

- For each compiler subsystem (lexer, parser, type checker, verifier, codegen), add Zig tests **as the subsystem is implemented**:
  - Unit tests for lexer, parser, type checker, and verifier.
  - Integration tests that compile and run programs exercising each concept from `docs/language/`.
- Prefer placing tests close to the code they exercise (e.g. Zig `test` blocks in the same modules, plus higher-level integration suites where needed).
- Use examples and edge cases from `docs/language/*` as canonical test inputs.

## C99 Tests

- For ABI and FFI boundaries, add C99 tests in lockstep with the implementation:
  - Tests that link against `libsilk.a` and invoke compiled Silk code through the C ABI.
  - Tests that exercise FFI boundaries (strings, structs, arrays, closures, error paths).
  - Tests that validate ABI stability across builds (e.g. struct layouts, calling conventions).
- C test suites should live in a dedicated directory (e.g. `c-tests/` or similar) and be wired into the build system so they run regularly.
- When building and running these tests:
  - it is expected that the build system uses a C99 compiler (for example `cc`) **only** to compile the C test harnesses and embedder examples that link against `libsilk.a`,
  - the Silk compiler itself MUST NOT generate C or invoke `cc` as part of its own code generation pipeline; using a C compiler here is strictly for exercising the public C ABI from C code, not for compiling Silk programs.

## Parity & Regression

- For critical features (especially FFI and ABI), maintain **parallel test cases in Zig and C**:
  - Zig tests verify language semantics and internal representations.
  - C tests verify ABI conformance and interop.
- For native codegen quality, maintain a small set of **end-to-end guardrails** that:
  - build representative Silk code to `linux/x86_64` objects,
  - disassemble with `objdump` using a stable format (no addresses / no raw bytes),
  - and compare instruction counts + stack frame sizes against a C reference built with the host `cc`,
  so obvious regressions (exploding instruction counts, excessive spills) are caught early.
- When a bug is found:
  - add a regression test in Zig and, where relevant, in C,
  - record any observed differences or limitations in the docs,
  - update `docs/` before or alongside the fix so that behavior stays spec‑driven.

## Silk Tests

In addition to Zig and C99 tests, we maintain **Silk-written test programs** in
the Silk compiler repository.

- Location:
  - The fixture suite lives alongside the compiler sources and is kept runnable
    from CI.
  - Fixtures are regular Silk modules and are intended to be readable examples
    of language features.
- Categories (by filename prefix):
  - **Passing fixtures** (`pass_*`): must parse and type-check successfully.
  - **Failing fixtures** (`fail_*`): must be rejected by the checker.
  - **Verification-failing fixtures** (`verify_fail_*`): must type-check, but
    fail Formal Silk verification with stable diagnostic codes (`E3001`..`E3008`).
  - **Support fixtures** (`support_*`): shared helpers imported by other fixtures.
  - **Package fixtures** (`pkg_*`): multi-module import/export scenarios
    exercised via explicit module-set invocations.
- Execution:
  - Zig integration tests iterate the fixture suite, dispatch by prefix, and
    assert the expected outcome (success, check failure, or verifier diagnostic
    code).
  - For a growing subset of passing fixtures, CI also builds a native
    executable and runs it, so the same programs validate both the front-end
    and the current backend subset.
  - The `silk test` CLI subcommand runs **language-level** `test` declarations
    embedded in Silk source files (see `docs/language/testing.md`), emitting TAP
    output. This is complementary to the fixture suite above (which is driven
    from the Zig test runner today).

Silk fixtures keep the implementation grounded in real programs, not just unit
tests. Every new language feature should, where practical, land with at least
one Silk fixture in addition to Zig and C tests.
