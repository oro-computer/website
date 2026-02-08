# Testing Strategy (Zig + C99 + Silk)

This document defines how we validate the compiler, ABI, and standard library.

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
  - record any observed differences or limitations in `STATUS.md`,
  - update `docs/` before or alongside the fix so that behavior stays spec‑driven.

## Silk Tests

In addition to Zig and C99 tests, we maintain **Silk-written test programs**:

- Location:
  - Silk test sources live under `tests/silk/` in this repository.
  - They are regular Silk modules and are intended to be readable examples of language features.
- Categories:
  - **Passing tests** (e.g. `tests/silk/pass_if_bool.slk`, `tests/silk/pass_while_bool.slk`, `tests/silk/pass_requires_ensures.slk`):
    - must parse and type-check successfully,
    - are exercised from Zig tests via the compiler front-end and CLI helpers.
  - **Failing tests** (e.g. `tests/silk/fail_type_mismatch.slk`, `tests/silk/fail_return_type.slk`, `tests/silk/fail_break_outside.slk`):
    - are expected to fail type checking (many fixtures only assert “fails”, with targeted tests asserting specific error kinds such as `TypeMismatch` / `InvalidBreak` when stability matters),
    - are used to validate that the front-end rejects invalid programs as described in `docs/language/`.
  - **Verification-failing tests** (e.g. `tests/silk/verify_fail_postcondition.slk`, `tests/silk/verify_fail_variant_negative.slk`):
    - must parse and type-check successfully,
    - are expected to fail Formal Silk verification with stable diagnostic codes (`E3001`..`E3008`),
    - are used to validate verifier behavior independently of the type checker.
  - **Support modules** (e.g. `tests/silk/support_file_import_values.slk`, `tests/silk/support_pkg_import_util.slk`):
    - are fixtures imported by other tests,
    - are not executed directly by the harness as standalone “tests”.
  - **Package fixtures** (`tests/silk/pkg_*.slk`):
    - are multi-module package/import fixtures that require running `silk check` on an explicit module set,
    - include both expected-success and expected-error scenarios (for example, duplicate exports across modules in the same package).
- Execution:
  - Zig tests in `src/tests.zig`:
    - iterate all `.slk` files under `tests/silk/` and, based on filename prefix:
      - for `pass_*.slk`, call `driver.runCheck` and require success,
      - for `fail_*.slk`, parse and type-check and require that type checking fails (most fixtures only assert “fails”, with targeted tests asserting specific `CheckError` values),
    - run `verify_fail_*.slk` fixtures through the Formal Silk verifier and assert stable diagnostic codes,
    - run `pkg_*.slk` fixtures via explicit `silk check` module-set invocations (some are expected to fail),
    - include a small guard test that rejects unknown `tests/silk/*.slk` filename prefixes so new fixtures cannot silently land without harness coverage.
    - for a growing subset of `pass_*.slk` programs whose `main` fits the current constant-expression backend (e.g. `pass_let_locals.slk`, `pass_top_level_let.slk`), invoke the `silk` CLI to `build` them to native executables and run those executables, asserting on their exit codes; this keeps Silk-written tests participating in both front-end and back-end validation as code generation matures.
  - The `silk test` CLI subcommand runs **language-level** `test` declarations embedded in Silk source files (see `docs/language/testing.md`), emitting TAP output. This is complementary to the repository’s `tests/silk/pass_*` / `tests/silk/fail_*` suite, which is driven from Zig tests today.
  - As the backend matures, additional Silk tests will be added that:
    - build and run executables beyond the constant-expression subset,
    - exercise libraries and FFI,
    - validate behavior across targets (ELF/Mach-O/PE) and architectures.

Silk tests are part of the overall strategy to keep the implementation grounded in real programs, not just synthetic unit tests. Every new language feature should, where practical, land with at least one Silk test program under `tests/silk/` in addition to Zig and C tests.
