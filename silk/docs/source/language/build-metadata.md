# Build Metadata (`BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION`)

Silk exposes a small set of compiler-provided **build metadata** values to both
runtime code and Formal Silk (compile-time verification) so programs can adapt
to build configuration and so theories can express “this code is only valid in
test builds”, “this feature requires a minimum version”, and similar policies.

## Implementation Status (Current Compiler Subset)

- Implemented: build metadata is available to runtime code via `std::runtime::build`
  (`docs/std/runtime.md`).
- Implemented: build metadata is available as built-in compile-time constants:
  `BUILD_KIND`, `BUILD_MODE`, `BUILD_VERSION`.

## Built-In Constants

The compiler provides the following built-in constants in every module:

- `BUILD_KIND: string`
- `BUILD_MODE: string`
- `BUILD_VERSION: string`
- `BUILD_VERSION_MAJOR: u64`
- `BUILD_VERSION_MINOR: u64`
- `BUILD_VERSION_PATCH: u64`

These behave like normal `const` string values:

- They do not require an import.
- They may be used anywhere a `string` expression is allowed.
- They are compile-time constants (their values are fixed at compile time and
  are embedded into the output artifact).

### `BUILD_KIND`

The output kind currently being built:

- `"executable"`
- `"object"`
- `"static"`
- `"shared"`

### `BUILD_MODE`

The build mode currently being built:

- `"debug"`
- `"release"`
- `"test"`

Notes:

- `"test"` is the mode used by `silk test`.
- Debug stack traces and debug assertion behavior are controlled separately by
  `std::runtime::build::is_debug()` (see `docs/std/runtime.md`).

### `BUILD_VERSION`

The semantic version of the current package when building from a manifest.

- When building from a package manifest (`silk.toml`), `BUILD_VERSION` is the
  manifest `version`.
- When not building from a manifest, `BUILD_VERSION` is `"0.0.0"`.

### `BUILD_VERSION_MAJOR` / `BUILD_VERSION_MINOR` / `BUILD_VERSION_PATCH`

The SemVer **core triplet** (`major.minor.patch`) of `BUILD_VERSION` exposed as
`u64` values for convenient comparisons (especially in Formal Silk).

Rules:

- These parse the `major.minor.patch` prefix of `BUILD_VERSION`.
- Any trailing `-prerelease` or `+build` suffix is ignored.
- On parse failure, all three values default to `0`.

## Relationship to `std::runtime::build`

The standard library provides `std::runtime::build` functions that return the
same metadata:

- `std::runtime::build::kind() -> string`
- `std::runtime::build::mode() -> string`
- `std::runtime::build::version() -> string`

Use `std::runtime::build` when you prefer explicit namespacing or when writing
code intended to run under alternate stdlib roots.

## Examples

### Build-mode gated behavior

```silk
fn main () -> int {
  if BUILD_MODE == "test" {
    // Test-only behavior.
    return 0;
  }
  return 0;
}
```

### Version-gated behavior

For semver parsing and comparison, use `std::semver` at runtime or reuse the
formal theories provided by `std::formal` (see `docs/language/formal-verification.md`).
