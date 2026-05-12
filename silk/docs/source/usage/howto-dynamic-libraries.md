# How To Load Dynamic Libraries

This guide shows how to load a dynamic library at runtime, resolve a symbol,
convert it to a typed C function pointer, and call it from Silk.

Use `std::dylib` for runtime-selected libraries and symbols. Use `ext` for
fixed build-time foreign symbols.

## Build and Run the Example

From the Silk compiler repository root:

```sh
./build/bin/silk build --std-root std examples/std_dylib_strlen.slk -o tmp/dylib_strlen
./tmp/dylib_strlen
```

The example opens the current process image, resolves `strlen`, casts the raw
symbol address to a typed `c_fn`, and calls it.

On `linux/x86_64`, `silk build` automatically adds `libdl.so.2` when
`std::dylib` is imported. On macOS, the loader functions are provided by
`libSystem`, so no extra framework or library flag is needed.

## The Shape of a Dynamic Call

Start by naming the ABI you expect:

```silk
type StrLenFn = c_fn (u64) -> u64;
```

Then resolve the symbol and cast the raw address:

```silk
let strlen: StrLenFn = sym.address() as raw StrLenFn;
let n: u64 = strlen("dynamic" as raw u64);
```

The cast is the boundary where the program asserts that the symbol really has
that C ABI. Silk cannot inspect the foreign function signature at runtime.

## Full Pattern

```silk
import { ErrorKind, Library, LibraryResult, OpenFlags, Symbol, SymbolResult, is_supported, open, open_self, open_with_flags } from "std/dylib";

type StrLenFn = c_fn (u64) -> u64;

fn main () -> int {
  if !is_supported() {
    return 0;
  }

  let lib_opt: Library? = open_self().unwrap();
  if lib_opt == None {
    return 1;
  }
  let lib: Library = lib_opt ?? Library.invalid();

  let sym_opt: Symbol? = lib.symbol("strlen").unwrap();
  if sym_opt == None {
    return 1;
  }
  let sym: Symbol = sym_opt ?? Symbol.invalid();

  let strlen: StrLenFn = sym.address() as raw StrLenFn;
  let n: u64 = strlen("dynamic" as raw u64);

  assert(n == 7, "strlen should count the dynamic string bytes");
  return 0;
}
```

## Opening a Named Library

Use `open(path)` when the library path is known at runtime:

```silk
let result = open("/usr/lib/libSystem.B.dylib");
```

Use `open_with_flags(path, flags)` when the loader policy matters:

```silk
let flags = OpenFlags.now().or(OpenFlags.global());
let result = open_with_flags("/usr/lib/libSystem.B.dylib", flags);
```

Prefer `OpenFlags.defaults()` or `open(path)` unless the library documentation
requires lazy binding or global symbol visibility.

## Error Handling

Match the result type and branch on `Failed.kind()`:

```silk
match (lib.symbol("required_symbol")) {
  SymbolResult::Ok(sym) => {
    let _ = sym.address();
  },
  SymbolResult::Err(failure) => {
    assert(
      failure.kind() == ErrorKind::SymbolNotFound,
      "required_symbol should be missing in this example"
    );
  },
};
```

`Failed.message` is useful for diagnostics, but program logic should use
`Failed.kind()` because the message can come from the platform loader.

See `examples/std_dylib_errors.slk` for a runnable error-path example.

## Safety Checklist

Before calling a resolved symbol:

- Confirm the symbol name is correct for the target platform.
- Declare the `c_fn` alias with the exact C ABI shape.
- Use `u64` or a documented C alias for pointer parameters.
- Keep the `Library` open for as long as any `Symbol` or function pointer is
 used.
- Keep every symbol address within the lifetime of its `Library`. Let scope
 cleanup close the library, or call `close()` when close failure needs to be
 observed.
- Treat mismatched signatures as undefined behavior.

## Troubleshooting

- `ErrorKind::Unsupported`: the target has no hosted dynamic-loader backend.
- `ErrorKind::OpenFailed`: the path is wrong, the loader cannot find a
 dependency of that library, or platform policy rejected the load.
- `ErrorKind::SymbolNotFound`: the library opened, but the named symbol is not
 exported in that image.
- Link errors for `silk_rt_dylib_*`: rebuild or reinstall Silk so
 `libsilk_rt.a` contains `src/silk_rt_dylib.c`; when using a copied local
 `build/bin/silk`, keep `build/lib/libsilk_rt*.a` in sync with `zig-out/lib`.

## Related Reference

- [dylib](?p=std/dylib)
- [ext](?p=language/ext)
- [operators](?p=language/operators)
