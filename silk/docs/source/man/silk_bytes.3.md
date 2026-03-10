# `silk_bytes` (3) — Manage Owned Build Output Buffers


## Name

`silk_bytes` — manage owned `SilkBytes` buffers returned by `libsilk` build APIs.

## Synopsis

```c
#include "silk.h"

typedef struct SilkBytes {
  uint8_t *ptr;
  int64_t  len;
} SilkBytes;

bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                  SilkOutputKind  kind,
                                  SilkBytes      *out_bytes);

void silk_bytes_free(SilkBytes *bytes);
```

## Description

`silk_compiler_build_to_bytes` returns an owned artifact buffer in `SilkBytes` (for example for sandboxed or filesystem-free embedding scenarios).

The buffer memory is owned by `libsilk.a` and must be released with `silk_bytes_free`.

## `silk_bytes_free`

`silk_bytes_free` frees a buffer returned by `silk_compiler_build_to_bytes`.

- It is safe to call this with `NULL`.
- It is safe to call this with a `SilkBytes` whose `ptr` is `NULL`.
- After freeing, the buffer contents must not be accessed.

## Example

After configuring the compiler and adding sources:

```c
SilkBytes bytes = {0};

if (!silk_compiler_build_to_bytes(compiler, SILK_OUTPUT_EXECUTABLE, &bytes)) {
  return 1;
}

fwrite(bytes.ptr, 1, (size_t)bytes.len, stdout);
silk_bytes_free(&bytes);
```

Use `silk_bytes_free` exactly once for each successful `build_to_bytes` call.

## See Also

- [`silk_compiler` (3)](?p=man/silk_compiler.3)
- [`libsilk` (7)](?p=man/libsilk.7)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
