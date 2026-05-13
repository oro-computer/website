# `std::` package structure

This page describes how `std::` modules are organized and how the compiler
finds and links them (including std-root selection and archive wiring).

Canonical doc: [package structure](?p=std/package-structure).

## Notes

- Design + implementation: std-root resolution and `std/...` import mapping are implemented.
- Details: [package structure](?p=std/package-structure)

## How `std::` resolves

- `foo::bar` resolves to `<std_root>/foo/bar.slk`.
- The std root can be overridden per build (CLI flags) or via environment variables.
- On supported hosted targets, a prebuilt std archive (`libsilk_std.a`) can be used to link std modules without recompiling them.

## Examples

### Example: import a std module
```silk
import io from "std/io";
import strings from "std/strings";

fn main () -> int {
  if strings::eq("a", "a") {
    io::println("ok");
    return 0;
  }
  return 1;
}
```

### Build with a custom std root (CLI)

```bash
silk build main.slk
silk build --std-root ./my-stdlib main.slk
silk build --std-root ./my-stdlib --std-lib ./my-stdlib/libsilk_std.a main.slk
```

## See also

- Canonical doc: [package structure](?p=std/package-structure)
- Runtime interface layer: [runtime](?p=std/runtime)
