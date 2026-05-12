# `std::dylib`

`std::dylib` is the opt-in standard-library facade for loading dynamic
libraries and resolving symbols at runtime.

Use it when the library or symbol is chosen at runtime. Use `ext` declarations
instead when the foreign symbol is a fixed build-time dependency and normal
linker diagnostics are the right failure mode.

The shipped hosted backend is based on the platform dynamic loader:

- POSIX/macOS: `dlopen(3)`, `dlsym(3)`, `dlclose(3)`, and `dlerror(3)`.
- Unsupported targets return ordinary `Result` failures with
 `ErrorKind::Unsupported`.
- On `linux/x86_64`, importing `std::dylib` automatically adds `libdl.so.2` for
 executable/shared-library outputs. macOS resolves the dynamic-loader APIs
 through `libSystem`.

## Exported API
- `is_supported() -> bool`: reports whether the bundled runtime has a hosted
 dynamic-loader backend for the current target.
- `ErrorKind`: stable loader failure categories:
 `InvalidInput`, `OpenFailed`, `SymbolNotFound`, `CloseFailed`,
 `Unsupported`, and `Unknown`.
- `Failed { code, message }`: loader failure payload. `kind()` converts the
 stable code to `ErrorKind`. `message` is a borrowed diagnostic string when
 the platform loader provides one, otherwise a stdlib fallback string.
- `OpenFlags { bits }`: loader flags with `lazy()`, `now()`, `local()`,
 `global()`, `defaults()`, and `or(...)`.
- `Library { handle }`: owning dynamic-library handle wrapper.
- `Symbol { addr }`: non-owning raw symbol address wrapper.
- `LibraryResult = Result(Library, Failed)`.
- `SymbolResult = Result(Symbol, Failed)`.

## Minimal Workflow

1. Check `is_supported()` when the program should also run on targets without a
 hosted dynamic loader.
2. Open a handle with `open(path)`, `open_with_flags(path, flags)`, or
 `open_self()`.
3. Resolve a symbol with `Library.symbol(name)`.
4. Convert `Symbol.address()` to the exact `c_fn` type with `as raw`.
5. Call the function pointer.
6. Let scope cleanup close the `Library`, or call `close()` when the program
 must observe a close failure before continuing.

```silk
import { ErrorKind, Library, LibraryResult, OpenFlags, Symbol, SymbolResult, is_supported, open, open_self, open_with_flags } from "std/dylib";

type StrLen = c_fn (u64) -> u64;

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

  let strlen: StrLen = sym.address() as raw StrLen;
  let n: u64 = strlen("hello" as raw u64);

  assert(n == 5, "strlen should count the hello string bytes");
  return 0;
}
```

See `examples/std_dylib_strlen.slk` for the runnable version.

## Opening Libraries

Use `open(path)` for default eager/local loader behavior:

```silk
let lib_r: LibraryResult = open("/usr/lib/libSystem.B.dylib");
```

Use `open_with_flags(path, flags)` when loader policy matters:

```silk
let flags: OpenFlags = OpenFlags.now().or(OpenFlags.global());
let lib_r = open_with_flags("/usr/lib/libSystem.B.dylib", flags);
```

Use `open_self()` to resolve symbols from the current process image and the
process-global loader namespace. This is useful for examples, plugin systems
that intentionally export host symbols, and tests that need a stable symbol
without depending on a platform-specific library path.

## Function Pointer Typing

`Symbol.address()` returns a raw `u64` address. It is intentionally not typed.
The caller must assert the ABI by casting to a `c_fn` alias:

```silk
type StrLen = c_fn (u64) -> u64;
let strlen: StrLen = sym.address() as raw StrLen;
```

The declared `c_fn` type must match the foreign symbol exactly:

- parameter count,
- parameter widths and signedness,
- return type,
- platform calling convention,
- pointer ownership and lifetime rules.

Silk cannot validate dynamic symbol signatures at runtime. A mismatched
signature is undefined behavior in the same way it is undefined behavior in C.

Silk strings can be passed to C string parameters by converting the string view
to its byte pointer:

```silk
let ptr: u64 = "hello" as raw u64;
```

The compiler emits string literal backing bytes with a trailing NUL terminator;
the Silk string length excludes that terminator.

## Errors

Prefer matching on `LibraryResult` and `SymbolResult`, then inspect
`Failed.kind()` for stable control flow:

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

`Failed.message` is for diagnostics. It may be a platform loader string or a
stdlib fallback string; do not parse it for program logic.

See `examples/std_dylib_errors.slk` for a runnable failure-path example.

## Ownership

`Library` owns the platform loader handle:

- `Library.close()` closes the handle and invalidates it on success.
- Calling `close()` on an invalid handle is a no-op success.
- Scope cleanup calls `Library.drop()`, which delegates to `close()` and ignores
 close failures.
- `Symbol` does not own anything. It is valid only while the owning `Library`
 remains open.

Do not cache a `Symbol` address past `Library.close()` unless the platform
library documentation explicitly guarantees the symbol remains valid.

## Testing and Distribution

For portable tests, prefer `open_self()` and a stable process symbol such as
`strlen`. For application integration tests, use `open(path)` with a
platform-specific test fixture and keep the expected path in the test
environment or package manifest.

When distributing applications:

- On Linux, ensure the target system has the library you open and that the path
 or loader search path is correct. `std::dylib` adds `libdl.so.2`
 automatically for the dynamic-loader API itself; it does not add the library
 you choose at runtime.
- On macOS, use absolute framework/library paths when the symbol provider is a
 system framework, or package private libraries beside the app and open the
 path your app controls.
- Prefer `OpenFlags.defaults()` unless the foreign library explicitly requires
 lazy binding or global symbol visibility.

## Related Guides

- [howto dynamic libraries](?p=usage/howto-dynamic-libraries)
- [ext](?p=language/ext)
- [operators](?p=language/operators)

## Implementation

`std::dylib` delegates to `std::runtime::dylib`, which delegates to
`std::runtime::posix::dylib` in the shipped hosted stdlib. The C runtime shim is
implemented in `src/silk_rt_dylib.c` and is statically linked as part of the
bundled runtime support when reachable.
