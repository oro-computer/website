# `std::runtime`

`std::runtime` is the interface layer that isolates OS/environment-specific
primitives (I/O, filesystem, time, threads, allocation) from higher-level
`std::...` modules.

[Canonical doc](../docs/?p=std/runtime).

## Status

- Hosted runtime boundary modules are implemented for the current compiler
  subset.
- `std::runtime::event_loop` is the current async wait surface used by hosted
  `async` code and async-aware stdlib helpers.

## Importing

```silk
import std::runtime::build;
import std::runtime::mem;
```

## Examples

### Example: build metadata + raw memory
```silk
import std::runtime::build;
import std::runtime::mem;

fn main () -> int {
  if std::runtime::build::is_debug() {
    return 1;
  }

  let ptr: u64 = std::runtime::mem::alloc(4);
  if ptr == 0 { return 2; }

  std::runtime::mem::store_u8(ptr, 0, std::runtime::mem::trunc_u8(65));
  std::runtime::mem::store_u8(ptr, 1, std::runtime::mem::trunc_u8(66));

  if std::runtime::mem::load_u8(ptr, 0) != 65 {
    std::runtime::mem::free(ptr);
    return 3;
  }

  std::runtime::mem::free(ptr);
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/runtime)
- [Std package structure and swappability](?p=std/package-structure)
- [Event loop surface](../docs/?p=std/runtime-event-loop)
