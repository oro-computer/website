# `libsilk` quickstart

`libsilk.a` is the public C99 embedding surface for driving Silk compilation from native host tools, editors, build systems, and language integrations.

If you want the full ABI contract, read [C ABI (`libsilk`)](?p=compiler/abi-libsilk). This page is the shortest path to a working embedder.

## Start here

1. Include `silk.h`.
2. Link `libsilk.a`.
3. Create a `SilkCompiler`.
4. Add one or more source buffers.
5. Build either to the filesystem or to an in-memory `SilkBytes` buffer.
6. On failure, read `silk_compiler_last_error` and format it with `silk_error_format`.
7. Destroy the compiler, and free any `SilkBytes` output with `silk_bytes_free`.

On `linux/x86_64`, `libsilk.a` vendors Z3 and must also link the host C++ runtime:

```sh
cc -std=c99 -Wall -Wextra \
   -I/path/to/include your_app.c \
   -L/path/to/lib -lsilk \
   -lstdc++ -lpthread -lm
```

## Smallest working embedder

This example builds a tiny executable from an in-memory Silk module. It avoids `std::` imports so you can focus on the embedding flow first.

```c
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "silk.h"

static SilkString silk_cstr(const char *s) {
  SilkString out;
  out.ptr = (char *)s;
  out.len = (int64_t)strlen(s);
  return out;
}

static int fail_with_last_error(SilkCompiler *compiler) {
  SilkError *err = silk_compiler_last_error(compiler);
  char buf[4096];
  size_t n;

  if (!err) {
    fputs("unknown Silk compiler error\n", stderr);
    return 1;
  }

  n = silk_error_format(err, buf, sizeof buf);
  if (n >= sizeof buf) {
    n = sizeof buf - 1;
  }
  buf[n] = '\0';

  fputs(buf, stderr);
  fputc('\n', stderr);
  return 1;
}

int main(void) {
  SilkCompiler *compiler = silk_compiler_create();
  int rc = 0;

  if (!compiler) {
    return 1;
  }

  if (!silk_compiler_add_source_buffer(
        compiler,
        silk_cstr("main.slk"),
        silk_cstr("fn main () -> int { return 0; }\n"))) {
    rc = fail_with_last_error(compiler);
    goto done;
  }

  if (!silk_compiler_build(
        compiler,
        SILK_OUTPUT_EXECUTABLE,
        silk_cstr("build/hello"))) {
    rc = fail_with_last_error(compiler);
    goto done;
  }

done:
  silk_compiler_destroy(compiler);
  return rc;
}
```

## Common paths

### Build an artifact on disk

Use `silk_compiler_build` when you want the compiler to write:

- an executable,
- a relocatable object,
- a static library,
- or a shared library.

Start with:

- [`silk_compiler` (3)](?p=man/silk_compiler.3)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)

### Generate a C header for exported Silk symbols

For non-executable outputs, call `silk_compiler_set_c_header` before the build:

```c
silk_compiler_set_c_header(compiler, silk_cstr("build/mylib.h"));
silk_compiler_build(compiler, SILK_OUTPUT_SHARED, silk_cstr("build/libmylib.so"));
```

The detailed ABI lowering rules for exported `string`, optionals, and multi-slot structs live here:

- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
- [`silk_compiler` (3)](?p=man/silk_compiler.3)

### Build to memory instead of the filesystem

Use `silk_compiler_build_to_bytes` when the host wants to own the output bytes directly, for example when:

- emitting a `.wasm` module into an application-managed buffer,
- storing an object file in a cache,
- or passing an artifact to another tool without creating a temporary file.

```c
SilkBytes out = {0};

if (!silk_compiler_build_to_bytes(compiler, SILK_OUTPUT_OBJECT, &out)) {
  return fail_with_last_error(compiler);
}

/* use out.ptr / out.len */
silk_bytes_free(&out);
```

Reference pages:

- [`silk_bytes` (3)](?p=man/silk_bytes.3)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)

### Format diagnostics for users

The normal failure path is:

1. call a `silk_compiler_*` function,
2. if it returns `false`, fetch `silk_compiler_last_error`,
3. format that error with `silk_error_format`.

For the full two-pass formatting pattern, read:

- [`silk_error` (3)](?p=man/silk_error.3)
- [Compiler diagnostics](?p=compiler/diagnostics)

### Check ABI compatibility at startup

Embedders that ship their own copy of `silk.h` should call `silk_abi_get_version` when they start and reject incompatible library versions explicitly.

Reference:

- [`silk_abi_get_version` (3)](?p=man/silk_abi_get_version.3)

## When you need `std::`

The smallest example above uses no standard library modules. Real applications usually do.

When your Silk sources import `std::...`, configure the compiler before adding sources:

- `silk_compiler_set_std_root` to point at the stdlib root,
- `silk_compiler_set_stdlib` to select the stdlib package name,
- `silk_compiler_set_nostd(true)` only when you intentionally want a filesystem-free embedder with no stdlib auto-loading.

Reference:

- [CLI reference](?p=compiler/cli-silk)
- [Standard library integration](?p=compiler/stdlib-integration)
- [`libsilk` (7)](?p=man/libsilk.7)

## See also

- [Zig embedding API](?p=compiler/zig-api)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
- [`libsilk` (7)](?p=man/libsilk.7)
- [`silk_compiler` (3)](?p=man/silk_compiler.3)
- [`silk_error` (3)](?p=man/silk_error.3)
- [`silk_bytes` (3)](?p=man/silk_bytes.3)
- [`silk_abi_get_version` (3)](?p=man/silk_abi_get_version.3)
