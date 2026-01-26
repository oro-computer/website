# Standard Library Integration

This document describes how the `std::` package integrates with the compiler and the CLI.

Key requirements:

- `std::` is a distinct package:
  - linked by default by `silk`,
  - replaceable with an alternative implementation via CLI or configuration.
- The default `std::` assumes POSIX semantics for OS-facing components.

Compiler responsibilities:

- Provide mechanisms for:
  - linking the default stdlib,
  - specifying an alternate stdlib,
  - ensuring FFI and ABI remain stable regardless of the stdlib implementation.

