# `silk_error` (3) — Retrieve and Format Compiler Errors


## Name

`silk_error` — retrieve the last compiler error and format it as text.

## Synopsis

```c
#include "silk.h"

typedef struct SilkCompiler SilkCompiler;
typedef struct SilkError    SilkError;

SilkError *silk_compiler_last_error(SilkCompiler *compiler);

size_t silk_error_format(const SilkError *error,
                         char            *buffer,
                         size_t           buffer_len);
```

## Description

When a `SilkCompiler` API call fails, it records a last-error object. Embedders can access it with `silk_compiler_last_error` and format it with `silk_error_format`.

### Lifetime

The `SilkError*` returned by `silk_compiler_last_error` is owned by the compiler and remains valid until:

- the compiler is destroyed, or
- a subsequent operation overwrites the compiler’s last-error state.

Embedders must not free or dereference the `SilkError` object directly.

### Formatting

`silk_error_format` writes a UTF-8 diagnostic message into a caller-provided buffer.

- If `buffer_len > 0`, the message is always NUL-terminated.
- The return value is the number of bytes required to format the full message, excluding the terminating NUL.
- If the return value is `>= buffer_len`, the message was truncated.

## Example

After a failed compiler call, two-pass formatting is the normal embedder
pattern:

```c
SilkError *err = silk_compiler_last_error(compiler);
size_t need = silk_error_format(err, NULL, 0);
char *buf = (char *)malloc(need + 1);
if (!buf) {
  return;
}

silk_error_format(err, buf, need + 1);
fprintf(stderr, "%s\n", buf);
free(buf);
```

Format the message before issuing more compiler operations; the compiler owns
the `SilkError` object and may replace it on the next failure.

## See Also

- [`silk_compiler` (3)](?p=man/silk_compiler.3)
- [`libsilk` (7)](?p=man/libsilk.7)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
