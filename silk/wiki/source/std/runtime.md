# `std::runtime`

`std::runtime` is the interface layer that isolates OS/environment-specific
primitives (I/O, filesystem, time, threads, allocation) from higher-level
`std::...` modules.

Canonical doc: [runtime](?p=std/runtime).

## Notes

- Design + partial implementation.
- Details: [runtime](?p=std/runtime)

## Importing

```silk
import build from "std/runtime/build";
import mem from "std/runtime/mem";
```

## Examples

### Example: build metadata + raw memory
```silk
import build from "std/runtime/build";
import mem from "std/runtime/mem";

fn main () -> int {
  // This reports whether the current artifact was built with `--debug` / `-g`.
  if build::is_debug() {
    return 1;
  }

  // `runtime::mem` provides low-level allocation and raw load/store.
  let ptr: u64 = mem::alloc(4);
  if ptr == 0 { return 2; }

  mem::store_u8(ptr, 0, mem::trunc_u8(65));
  mem::store_u8(ptr, 1, mem::trunc_u8(66));

  if mem::load_u8(ptr, 0) != 65 {
    mem::free(ptr);
    return 3;
  }

  mem::free(ptr);
  return 0;
}
```

## See also

- Canonical doc: [runtime](?p=std/runtime)
- Std package structure and swappability: [package structure](?p=std/package-structure)
- End-to-end fixture (build metadata): `tests/silk/pass_std_runtime_build_is_debug.slk`
