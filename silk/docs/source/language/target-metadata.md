# Target Metadata (`OS_PLATFORM`, `OS_ARCH`, `OS_IS_UNIX`, `OS_IS_POSIX`)

Silk exposes a small set of compiler-provided **target metadata** values to both
runtime code and Formal Silk (compile-time verification).

These values let programs adapt to the compilation target (platform/OS and CPU
architecture) without requiring environment-specific runtime queries.

## Implementation Status (Current Compiler Subset)

- Implemented: target metadata is available as built-in compile-time constants
  in every module:
  - `OS_PLATFORM`, `OS_ARCH`, `OS_IS_UNIX`, `OS_IS_POSIX`.
- Implemented: the standard library re-exports these via `std::os`
  (`docs/std/os.md`).

## Built-In Constants

The compiler provides the following built-in constants in every module:

- `OS_PLATFORM: string`
- `OS_ARCH: string`
- `OS_IS_UNIX: bool`
- `OS_IS_POSIX: bool`

These behave like normal `const` values:

- They do not require an import.
- They may be used anywhere an expression of the corresponding type is allowed.
- They are compile-time constants (their values are fixed at compile time and
  are embedded into the output artifact).

### `OS_PLATFORM`

A canonical target platform/OS name string.

Current compiler target set and values:

- `linux/x86_64`:
  - `OS_PLATFORM == "linux"`
- `wasm32-unknown-unknown`:
  - `OS_PLATFORM == "unknown"`
- `wasm32-wasi`:
  - `OS_PLATFORM == "wasi"`

### `OS_ARCH`

A canonical target CPU architecture name string.

Current compiler target set and values:

- `linux/x86_64`:
  - `OS_ARCH == "x86_64"`
- `wasm32-unknown-unknown` and `wasm32-wasi`:
  - `OS_ARCH == "wasm32"`

### `OS_IS_UNIX`

Whether the compilation target is a UNIX family target.

Current compiler target set:

- `linux/x86_64`: `true`
- `wasm32-unknown-unknown`: `false`
- `wasm32-wasi`: `false`

### `OS_IS_POSIX`

Whether the compilation target is a POSIX target.

Current compiler target set:

- `linux/x86_64`: `true`
- `wasm32-unknown-unknown`: `false`
- `wasm32-wasi`: `false`

## Relationship to `std::os`

The standard library provides `std::os` helpers that expose the same metadata
in a namespaced form and additionally map these strings into enums for use with
`match` (see `docs/std/os.md`).

## Examples

### Target-gated behavior

```silk
import std::os;
import { println } from "std/io";

fn main () -> int {
  if OS_IS_POSIX {
    println("posix");
  }

  match (std::os::platform()) {
    std::os::Platform::Linux => println("linux"),
    std::os::Platform::WASI => println("wasi"),
    std::os::Platform::Unknown => println("unknown"),
  };

  return 0;
}
```

### Formal Silk requirements

```silk
#require OS_IS_POSIX;
```
