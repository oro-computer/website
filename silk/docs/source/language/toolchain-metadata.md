# Toolchain Metadata (`SILK_VERSION`, `SILK_ABI_VERSION`, `SILK_GIT_COMMIT`)

Silk exposes a small set of compiler-provided **toolchain metadata** values to:

- runtime Silk code (as built-in compile-time constants embedded into the output),
- and Formal Silk directives (`#require`, `#assure`, theories, etc).

These values let downstream code:

- report the exact toolchain used to build an artifact,
- gate behavior on the toolchain version,
- and express minimum-version requirements in Formal Silk.

## Implementation Status (Current Compiler Subset)

- Implemented: the toolchain metadata constants listed below are available as
  built-in compile-time constants in every module.
- Implemented: `silk --version` reports the same toolchain version, ABI version,
  and git commit.

## Built-In Constants

The compiler provides the following built-in constants in every module:

- `SILK_VERSION: string`
- `SILK_VERSION_MAJOR: u64`
- `SILK_VERSION_MINOR: u64`
- `SILK_VERSION_PATCH: u64`

- `SILK_ABI_VERSION: string`
- `SILK_ABI_VERSION_MAJOR: u64`
- `SILK_ABI_VERSION_MINOR: u64`
- `SILK_ABI_VERSION_PATCH: u64`

- `SILK_GIT_COMMIT: string`

These behave like normal `const` values:

- They do not require an import.
- They may be used anywhere an expression of the corresponding type is allowed.
- They are compile-time constants (their values are fixed at compile time and
  are embedded into the output artifact).

### `SILK_VERSION`

The Silk **toolchain** semantic version string for the compiler that is
compiling the current module (SemVer core `major.minor.patch`).

### `SILK_VERSION_MAJOR` / `SILK_VERSION_MINOR` / `SILK_VERSION_PATCH`

The SemVer **core triplet** (`major.minor.patch`) of `SILK_VERSION` exposed as
`u64` values for convenient comparisons (especially in Formal Silk).

### `SILK_ABI_VERSION`

The semantic version string of the embedding ABI exposed by `libsilk.a`.

This must match:

- the `SILK_ABI_VERSION_*` macros in `include/silk/silk.h`, and
- the values reported by `silk_abi_get_version(...)`.

### `SILK_ABI_VERSION_MAJOR` / `SILK_ABI_VERSION_MINOR` / `SILK_ABI_VERSION_PATCH`

The SemVer core components of `SILK_ABI_VERSION` exposed as `u64` values.

### `SILK_GIT_COMMIT`

The git commit hash of the Silk toolchain used to compile the current module.

Rules:

- When the toolchain build can determine a git commit, this is set to a stable
  hash string.
- When the toolchain build cannot determine a commit (for example when building
  from a source snapshot without git metadata), this is set to `"unknown"`.

## Examples

### Printing toolchain information at runtime

```silk
import { println } from "std/io";

fn main () -> int {
  println("silk={}, abi={}, commit={}", SILK_VERSION, SILK_ABI_VERSION, SILK_GIT_COMMIT);
  return 0;
}
```

### Formal Silk: minimum toolchain requirement

```silk
#require SILK_VERSION_MAJOR > 0 || (SILK_VERSION_MAJOR == 0 && SILK_VERSION_MINOR >= 2);
```

## Related

- CLI output: `docs/compiler/cli-silk.md` and `docs/man/silk.1.md` (`silk --version`)
- Conditional compilation: `docs/language/attributes.md` (`if attr(...) { ... }`)
