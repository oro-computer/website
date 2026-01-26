# Compiler Architecture

This document describes the intended architecture of the Silk compiler implemented in Zig.

Current hard implementation limits (file size caps, current maxima, etc.)
are documented in `docs/compiler/limits.md`.

## High-Level Structure

The compiler is implemented in Zig and organized into three major layers:

- Front-end:
  - Lexer: implements the token set and literals from `docs/language/operators.md` and the literal docs.
  - Parser: implements the grammar from `docs/language/grammar.md`.
  - Type checker: enforces the type rules from `docs/language/types.md` and related concept docs.
  - Verifier: handles Formal Silk constructs from `docs/language/formal-verification.md`.
- Middle-end:
  - IR representation for Silk programs, including regions, buffers, concurrency, and FFI constructs (see `docs/compiler/ir-overview.md` for the current IR design and roadmap).
  - Optimizations that respect the language’s safety guarantees.
- Back-end:
  - Code generation for executables, static libraries, and shared libraries using an Silk-owned backend (IR + codegen), not by “transpiling to C”.
  - Emission of object files and archives that can be linked into executables and libraries.
  - C99 ABI mappings for interop with `libsilk.a`.

In terms of concrete targets and file formats, the back-end MUST eventually support:

- ELF for Unix-like systems:
  - initial implementation is `linux/x86_64` only (already prototyped for constant-expression `main`),
  - `linux/aarch64` (ARM64) is a required future target,
  - position-independent code and shared objects (`.so`) for dynamic libraries.
- Mach-O for macOS:
  - both Intel (`x86_64`) and Apple Silicon (`arm64`) MUST be supported,
  - dynamic libraries (`.dylib`) for loading Silk packages at runtime.
- PE/COFF for Windows:
  - initially `x86_64`, with other architectures considered later as needed,
  - DLLs for dynamic loading.

The current ELF-only constant-expression backend is a temporary first slice targeting `linux/x86_64`; Mach-O, PE/COFF, and additional architectures (notably ARM64 on Linux and macOS), as well as full object-file, archive (`.a`), and shared-library emission, are explicit future requirements and MUST be planned and implemented as the back-end matures.

An initial IR-driven, native backend is being prototyped alongside the existing constant-expression emitter:

- the front-end (parser + checker) produces `ast.Module` values,
- a lowering pass in `src/lower_ir.zig` translates a constrained subset of `fn main() -> int` programs into `ir.Function` graphs, using integer arithmetic, comparisons, and simple control flow (`Br` / `BrCond`),
- a target-independent IR interpreter in `src/ir_eval.zig` provides reference semantics for these IR functions,
- the existing ELF64 emitter in `src/backend_const.zig` still constructs the final executable image by writing a minimal ELF64 file for `linux/x86_64` whose entrypoint performs a `sys_exit(value)` system call,
- a dedicated IR→ELF backend module (`src/backend_ir_elf.zig`) will gradually assume responsibility for emitting native code directly from `ir.Function` graphs, starting with a single-function, integer-returning subset and expanding as more language features are lowered to IR.

### Packages, Modules, Imports, and Exports

Silk programs are organized into **packages** and **modules**:

- A *module* is a single source file and the natural unit of parsing and type checking.
- A *package* is a collection of modules that share a namespace and build configuration (e.g. the main package, `std::`, and third-party packages).
- Packages may:
  - **export** symbols (types, functions, constants) that are visible to importers,
  - **import** symbols from other packages via explicit imports.

The compiler MUST:

- represent packages and their dependency graph explicitly in the middle-end,
- implement an import resolver that:
  - maps import paths to source modules/packages,
  - enforces acyclic and well-formed package graphs,
- implement symbol visibility rules:
  - distinguish exported vs internal symbols within a package,
  - ensure only exported symbols are visible across package boundaries.

Front-end work (parser, checker, resolver) and back-end work (linkage, symbol emission) MUST be designed so that:

- importing and exporting package symbols is a first-class, well-specified feature,
- building advanced programs that span multiple modules and packages (including `std::` and user packages) is supported by both the CLI (`silk`) and the C ABI (`libsilk.a`).

The concrete surface syntax for packages, imports, and exports is specified in
`docs/language/packages-imports-exports.md` and is being implemented
incrementally in the front-end. Resolver and back-end integration will follow
that spec.

The implementation must remain spec-driven: any architectural decision should be traceable back to a document in `docs/`.

### Executable Entrypoint (Initial Rule)

For executable builds driven via the C ABI (`SILK_OUTPUT_EXECUTABLE`) and,
eventually, the `silk` CLI, the compiler enforces a simple, explicit entrypoint:

- there MUST be exactly one top-level function with the signature:

  ```silk
  fn main() -> int { ... }
  ```

- this function:
  - takes no parameters,
  - returns `int`,
  - serves as the process entrypoint when an executable is produced.

At the current implementation stage, this requirement is enforced by the
front-end (via `silk_compiler_build`) and a minimal back-end
that currently supports only constant integer `main` functions. This is a
temporary measure; the long-term back-end is a true Silk code generator, not
a C transpiler.

## Module Layout (Draft)

This is a draft module layout for the Zig implementation. Exact file names may change, but the layering should be preserved.

- `src/` (compiler implementation):
  - `src/driver.zig` — CLI entry points and high-level orchestration.
  - `src/lexer.zig` — tokenization and trivia handling.
  - `src/parser.zig` — AST construction.
  - `src/ast.zig` — AST node definitions.
  - `src/types.zig` — type system representation and operations.
  - `src/checker.zig` — type checking and semantic analysis.
  - `src/formal_silk.zig` — Formal Silk VC generation and verification (Z3-backed).
  - `src/z3_api.zig` — Z3 C API shim (static-by-default, optional dynamic override).
  - `src/ir.zig` — core intermediate representation.
  - `src/codegen.zig` — target-independent code generation logic.
  - `src/abi.zig` — C99 ABI and FFI glue for `libsilk.a`.
  - `src/std_integration.zig` — integration with the `std::` package and stdlib selection.
  - `src/cli/` (optional breakdown):
  - `src/cli/options.zig` — option parsing.
  - `src/cli/commands.zig` — `build`, `check`, `abi` subcommands.

In addition to the core compiler, a separate language server executable (`silk-lsp`) is provided for editor and IDE integrations. It is implemented in Zig, reuses the front-end modules above (lexer, parser, type checker), and speaks the Language Server Protocol as specified in `docs/compiler/lsp-silk.md`. The language server does not introduce new language features; it is a tooling layer over the existing compiler.

Test code is expected to live alongside these modules (via Zig `test` blocks) and/or under dedicated test drivers.

## Test Layout (Draft)

Testing is incremental and must be developed alongside the implementation:

- Zig unit tests:
  - Each core module (`lexer.zig`, `parser.zig`, `checker.zig`, etc.) contains Zig `test` blocks that exercise its behavior.
  - Additional integration tests may live in dedicated files (e.g. `src/tests_frontend.zig`) that compile sample Silk programs drawn from `docs/language/`.
- C99 tests:
  - A separate directory (e.g. `c-tests/`) will contain C test programs and harnesses that:
    - link against `libsilk.a`,
    - use the C ABI (`silk.h`) to drive compilation/execution,
    - validate FFI and ABI behavior.

The build system (Zig build file and any supporting scripts) must be wired so that:

- running the Zig test suite exercises all relevant `test` blocks,
- running the C test suite builds and runs the C harnesses,
- both suites can be invoked easily during development and CI.
