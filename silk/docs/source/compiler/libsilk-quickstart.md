# `libsilk` quickstart

This page is the shortest path to embedding the Silk compiler from C or C++.

Use it when you want to:

- compile Silk source from your own host process,
- build executables, libraries, objects, or wasm modules,
- capture diagnostics programmatically, and
- decide which deeper ABI/manpage document to read next.

For the full ABI contract, see [C ABI (`libsilk`)](?p=compiler/abi-libsilk).

## 1) Smallest working embedder

This builds one in-memory Silk source buffer to an executable on disk:

```c
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <silk/silk.h>

static SilkString silk_str(const char *ptr) {
    SilkString s;
    s.ptr = (char *)ptr;
    s.len = 0;
    while (ptr[s.len] != '\0') s.len++;
    return s;
}

static void print_last_error(SilkCompiler *compiler) {
    SilkError *err = silk_compiler_last_error(compiler);
    if (!err) return;

    int64_t needed = silk_error_format(err, NULL, 0);
    if (needed <= 0) return;

    char *buf = (char *)malloc((size_t)needed);
    if (!buf) return;

    silk_error_format(err, buf, needed);
    fprintf(stderr, "%s\n", buf);
    free(buf);
}

int main(void) {
    SilkCompiler *compiler = silk_compiler_create();
    if (!compiler) return 1;

    SilkString name = silk_str("main.slk");
    SilkString src = silk_str("fn main () -> int { return 0; }\n");
    if (!silk_compiler_add_source_buffer(compiler, name, src)) {
        print_last_error(compiler);
        silk_compiler_destroy(compiler);
        return 1;
    }

    if (!silk_compiler_build(
            compiler,
            SILK_OUTPUT_EXECUTABLE,
            silk_str("hello"))) {
        print_last_error(compiler);
        silk_compiler_destroy(compiler);
        return 1;
    }

    silk_compiler_destroy(compiler);
    return 0;
}
```

Minimal workflow:

1. create a `SilkCompiler`,
2. add source buffers,
3. build an artifact,
4. print diagnostics on failure,
5. destroy the compiler.

## 2) Compile real files and use the stdlib

If your host reads Silk files from disk, keep the source text ownership on the
host side and pass the contents through `silk_compiler_add_source_buffer`, or
load them yourself before calling the ABI.

For programs that import `std::...`, point the compiler at the stdlib root:

```c
SilkCompiler *compiler = silk_compiler_create();
if (!compiler) return 1;

silk_compiler_set_stdlib(compiler, silk_str("std"));
silk_compiler_set_std_root(compiler, silk_str("./std"));

silk_compiler_add_source_buffer(
    compiler,
    silk_str("src/main.slk"),
    silk_str(
        "import fs from \"std/fs\";\n"
        "fn main () -> int { return 0; }\n"));

if (!silk_compiler_build(
        compiler,
        SILK_OUTPUT_EXECUTABLE,
        silk_str("app"))) {
    print_last_error(compiler);
}
```

If you want to disable filesystem stdlib auto-loading entirely, call:

```c
silk_compiler_set_nostd(compiler, true);
```

## 3) Build to memory instead of disk

Use `silk_compiler_build_to_bytes` when your host needs the output artifact in
memory:

```c
SilkBytes bytes = {0};

silk_compiler_set_target(compiler, silk_str("wasm32-wasi"));
silk_compiler_add_source_buffer(
    compiler,
    silk_str("main.slk"),
    silk_str("fn main () -> int { return 0; }\n"));

if (!silk_compiler_build_to_bytes(
        compiler,
        SILK_OUTPUT_EXECUTABLE,
        &bytes)) {
    print_last_error(compiler);
    silk_compiler_destroy(compiler);
    return 1;
}

/* bytes.ptr / bytes.len now contain the final .wasm module */
silk_bytes_free(&bytes);
```

This is the common pattern for:

- wasm embedders,
- build systems,
- editor integrations,
- test harnesses that want to inspect output bytes directly.

## 4) Generate libraries and headers

For shared-library or object outputs, you can set metadata before building:

```c
silk_compiler_set_c_header(compiler, silk_str("libadd.h"));
silk_compiler_set_soname(compiler, silk_str("libadd.so"));
silk_compiler_add_runpath(compiler, silk_str("$ORIGIN"));
silk_compiler_add_needed_library(compiler, silk_str("libm.so.6"));

silk_compiler_add_source_buffer(
    compiler,
    silk_str("lib.slk"),
    silk_str(
        "export fn add (a: int, b: int) -> int {\n"
        "  return a + b;\n"
        "}\n"));

if (!silk_compiler_build(
        compiler,
        SILK_OUTPUT_SHARED_LIBRARY,
        silk_str("libadd.so"))) {
    print_last_error(compiler);
}
```

Read the ABI reference before relying on exported layout rules for `string`,
optionals, structs, and other public interface shapes.

## 5) Diagnostics: two-pass formatting

The error API is intentionally low-level and stable:

```c
SilkError *err = silk_compiler_last_error(compiler);
if (err) {
    int64_t needed = silk_error_format(err, NULL, 0);
    char *buf = (char *)malloc((size_t)needed);
    silk_error_format(err, buf, needed);
    fprintf(stderr, "%s\n", buf);
    free(buf);
}
```

Use this pattern whenever an ABI call returns `false`.

## 6) What to read next

- Need the full function-by-function ABI contract: [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
- Need the public C manpages: [`libsilk` (7)](?p=man/libsilk.7), [`silk_compiler` (3)](?p=man/silk_compiler.3), [`silk_error` (3)](?p=man/silk_error.3)
- Need Zig instead of C: [Zig embedding API](?p=compiler/zig-api)
