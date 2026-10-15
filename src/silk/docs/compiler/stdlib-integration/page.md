---
layout: "docs"
description: "This document describes how the std:: package integrates with the compiler and the CLI."
docsCollection: "silk"
section: "compiler"
order: 263
sourcePath: "compiler/stdlib-integration.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Standard Library Integration

This document describes how the `std::` package integrates with the compiler and the CLI.

Key requirements:

- `std::` is a distinct package:
 - linked by default by `silk`,
 - replaceable with an alternative implementation via CLI or configuration.
- The default `std::` assumes POSIX semantics for OS-facing components.

Precompiled stdlib archives must supply all referenced generated Silk function,
method, and data symbols, including dependencies of archive members selected
for linking. A generic specialization needed by a consumer may be absent from
an archive built without that consumer. Linux AArch64 executable and test-harness
linking rejects such incomplete archive links before emitting an executable.
An automatically discovered archive then falls back to compiling the std
sources, including the required specialization. An explicit `--std-lib` override
instead fails with a missing-Silk-symbol diagnostic; it cannot silently change
the selected stdlib. Ordinary native dynamic imports remain supported.

Compiler responsibilities:

- Provide mechanisms for:
 - linking the default stdlib,
 - specifying an alternate stdlib,
 - ensuring FFI and ABI remain stable regardless of the stdlib implementation.
