# External declarations (`ext`)

`ext` declares foreign symbols so Silk code can call C (or wasm imports) and
access foreign variables.

Canonical spec: `docs/language/ext.md`.

## Status

- Current supported `ext` subset + ABI notes: `docs/language/ext.md`
- End-to-end support snapshot: `STATUS.md`
- Embedding ABI contract: `docs/compiler/abi-libsilk.md`

## Syntax (Selected)

```silk
// C function named `puts`.
ext puts = fn (string) -> i32;

// Bind a different symbol name.
ext c_malloc "malloc" = fn (i64) -> u64;
ext c_free "free" = fn (u64) -> void;

// External variable.
ext errno = i32;
```

## Examples

### Works today: call a C symbol

```silk
import std::io;

ext puts = fn (string) -> i32;

fn main () -> int {
  puts("hello from ext");
  std::io::println("ok");
  return 0;
}
```

### Works today: opaque handle pattern (FFI-safe pointers)

```silk
struct Thing;

ext thing_new = fn () -> &Thing;
ext thing_free = fn (&Thing) -> void;

fn main () -> int {
  let t: &Thing = thing_new();
  thing_free(t);
  return 0;
}
```

## See also

- Canonical spec: `docs/language/ext.md`
- ABI details for `string` and optionals: `docs/compiler/abi-libsilk.md`
