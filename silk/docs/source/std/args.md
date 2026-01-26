# `std::args`

Status: **Implemented subset**. A small native-argv helper surface is implemented in
`std/args.slk` to make early programs ergonomic while `string[]` parameters and
richer slice/iterator features are still future work.

`std::args` focuses on the hosted `linux/x86_64` executable entrypoint shape:

```silk
fn main (argc: int, argv: u64) -> int { ... }
```

Where `argv` is a raw pointer to the process `argv` pointer list (`char**` in C).

See also:

- `docs/compiler/cli-silk.md` (entrypoint selection rules)
- `docs/language/ext.md` (string ABI `{ ptr, len }` and C-string lowering rules)

## Implemented API

The following items are implemented in `std/args.slk`:

```silk
module std::args;

// Read argv pointers.
export fn argv_ptr (argv: u64, index: int) -> u64;
export fn argv_cstr (argv: u64, index: int) -> u64;

// Inspect NUL-terminated C strings.
export fn cstr_byte (cstr: u64, index: int) -> u8;
export fn cstr_len (cstr: u64) -> int;

// Convert stable C strings to Silk `string` views (no allocation, no copy).
export fn cstr_string (cstr: u64) -> string;
export fn argv_string (argv: u64, index: int) -> string;

// Convenience wrapper for (argc, argv).
struct Args {
  argc: int,
  argv: u64,
}

impl Args {
  public fn init (argc: int, argv: u64) -> Args;
  public fn count (self: &Args) -> int;
  public fn ptr (self: &Args, index: int) -> u64;
  public fn get (self: &Args, index: int) -> string;
}
```

### Safety notes

- `cstr_len` scans memory until it finds a `0` byte. If the pointer is invalid
  or the string is not NUL-terminated, behavior is undefined.
- `cstr_string` / `argv_string` return `string` **views** into existing memory.
  They do not copy or allocate, and therefore do not provide ownership. The
  caller must ensure the pointed-to bytes remain valid for the lifetime of the
  returned `string`. For process `argv` strings this is typically valid for the
  lifetime of the process.

## String construction intrinsic

The current implementation uses a reserved, compiler-backed intrinsic
to construct `string` values at the ABI/IR level:

- `__silk_string_from_ptr_len(ptr: u64, len: int) -> string`

This intrinsic is intended only for stdlib bring-up (in particular `std::args`
and C-string bridging) and is **not** a stable user API.
