# `std::args`

`std::args` exposes the process-argument surface used by Silk entrypoints. It keeps argument handling explicit at the ABI boundary: native targets use the conventional `(argc, argv)` shape, while `wasm32-wasi` exposes helpers that reconstruct the same view from WASI process arguments.

`std::args` currently supports two executable argument shapes:

- hosted/native entrypoints that receive:

```silk
fn main (argc: int, argv: u64) -> int { ... }
```

- and `wasm32-wasi` entrypoints that remain parameterless:

```silk
fn main () -> int { ... }
```

For hosted/native entrypoints, `argv` is a raw pointer to the process `argv`
pointer list (`char**` in C). For `wasm32-wasi`, `std::args` exposes helpers
that read the process arguments from the WASI Preview 1 `args_sizes_get` /
`args_get` syscalls and present the same `(argc, argv)` shape to downstream
code.

See also:

- [cli silk](?p=compiler/cli-silk) (entrypoint selection rules)
- [ext](?p=language/ext) (string ABI `{ ptr, len }` and C-string lowering rules)

## Exported API
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

// WASI-only helpers for parameterless `fn main () -> int`.
export fn argc () -> int;
export fn argv () -> u64;
export fn current () -> Args;

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

### WASI usage

On `wasm32-wasi`, build the same `Args` view from a parameterless `main`:

```silk
import args from "std/args";

fn main () -> int {
  let a = args::Args.init(args::argc(), args::argv());
  return a.count();
}
```

or use the convenience wrapper:

```silk
import args from "std/args";

fn main () -> int {
  let a = args::current();
  return a.count();
}
```

### Safety notes

- `cstr_len` scans memory until it finds a `0` byte. If the pointer is invalid
 or the string is not NUL-terminated, behavior is undefined.
- `argv_ptr` is target-aware:
 - on hosted/native entrypoints it reads `argv[index]` from an 8-byte pointer
 table (`char**`),
 - on `wasm32-wasi` it reads `argv[index]` from a cached 4-byte pointer table
 of `u32` linear-memory offsets returned by WASI `args_get`.
- `cstr_string` / `argv_string` return `string` **views** into existing memory.
 They do not copy or allocate, and therefore do not provide ownership. The
 caller must ensure the pointed-to bytes remain valid for the lifetime of the
 returned `string`. For process `argv` strings this is typically valid for the
 lifetime of the process.
- On `wasm32-wasi`, `argc()` / `argv()` / `current()` cache the argv snapshot
 for the process lifetime. When the snapshot cannot be loaded, they report an
 empty argument view (`argc() == 0`, `argv() == 0`).

## String construction intrinsic

The compiler provides a reserved, compiler-backed intrinsic to construct
`string` values at the ABI/IR level:

- `__silk_string_from_ptr_len(ptr: u64, len: int) -> string`

This intrinsic is intended only for stdlib bring-up (in particular `std::args`
and C-string bridging) and is **not** a stable user API.
