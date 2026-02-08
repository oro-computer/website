# `silk_compiler` (3) — Embed the Silk Compiler

> NOTE: This is the Markdown source for the eventual man 3 page for the `SilkCompiler` embedding API. The roff-formatted manpage should be generated from this content.

## Name

`silk_compiler` — C99 embedding API for compiling Silk sources via `libsilk.a`.

## Synopsis

```c
#include "silk.h"

typedef struct SilkCompiler SilkCompiler;
typedef struct SilkModule   SilkModule;
typedef enum SilkOutputKind SilkOutputKind;

SilkCompiler *silk_compiler_create(void);
void          silk_compiler_destroy(SilkCompiler *compiler);

bool silk_compiler_set_stdlib(SilkCompiler *compiler, SilkString stdlib_name);
bool silk_compiler_set_std_root(SilkCompiler *compiler, SilkString std_root);
bool silk_compiler_set_nostd(SilkCompiler *compiler, bool nostd);
bool silk_compiler_set_target(SilkCompiler *compiler, SilkString target_triple);
bool silk_compiler_add_needed_library(SilkCompiler *compiler, SilkString soname);
bool silk_compiler_add_runpath(SilkCompiler *compiler, SilkString path);
bool silk_compiler_set_soname(SilkCompiler *compiler, SilkString soname);
bool silk_compiler_set_optimization_level(SilkCompiler *compiler, int level);

SilkModule *silk_compiler_add_source_buffer(SilkCompiler *compiler,
                                            SilkString    name,
                                            SilkString    contents);

bool silk_compiler_build(SilkCompiler   *compiler,
                         SilkOutputKind  kind,
                         SilkString      output_path);

bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                  SilkOutputKind  kind,
                                  SilkBytes      *out_bytes);
```

## Description

The `SilkCompiler` API embeds the Silk compiler in C or C++ programs.

Typical workflow:

1. Create a compiler: `silk_compiler_create`.
2. Optionally configure it (stdlib selection, target triple, etc).
3. Add one or more source buffers with `silk_compiler_add_source_buffer`.
4. Build an artifact with `silk_compiler_build` (filesystem) or `silk_compiler_build_to_bytes` (in-memory).
5. On error, retrieve diagnostics via `silk_compiler_last_error` and `silk_error_format` (see `silk_error` (3)).
6. Destroy the compiler with `silk_compiler_destroy`.

The canonical ABI specification lives in `docs/compiler/abi-libsilk.md`.

## Configuration

All configuration functions return `true` on success and `false` on failure. On failure, the compiler records an error retrievable via `silk_compiler_last_error`.

Stdlib configuration:

- `silk_compiler_set_stdlib` selects the stdlib package name (for example `"std"`).
- `silk_compiler_set_std_root` selects the filesystem root used to resolve `import std::...;`.
- `silk_compiler_set_nostd(true)` disables filesystem-based stdlib auto-loading.

Target and linkage:

- `silk_compiler_set_target` selects the code generation target triple.
- `silk_compiler_add_needed_library` / `silk_compiler_add_runpath` / `silk_compiler_set_soname` configure dynamic linker metadata for ELF outputs (when applicable).

Optimization:

- `silk_compiler_set_optimization_level` accepts an integer level in the range documented by `include/silk.h`. The default is level 0 unless overridden.
- Level 1+ enables lowering-time pruning of unused extern symbols before code generation (typically reducing output size and over-linking when using the prebuilt `libsilk_std.a` archive for auto-loaded `import std::...;` modules).

## Sources

`silk_compiler_add_source_buffer` registers a module as an in-memory UTF-8 source buffer. The returned `SilkModule*` is owned by the compiler; embedders must not free it.

The `name` parameter is used for diagnostics and does not need to correspond to an on-disk file path.

## Building

`silk_compiler_build` writes an artifact to `output_path`. Unlike the CLI, this ABI call does not create parent directories; the output directory must exist.

`silk_compiler_build_to_bytes` returns an in-memory artifact via `SilkBytes`. On success, the caller must free the buffer with `silk_bytes_free` (see `silk_bytes` (3)).

## Thread safety

The `SilkCompiler` object is not currently specified as thread-safe. Confine it to one thread or synchronize access.

## See Also

- `silk_error` (3), `silk_bytes` (3), `silk_abi_get_version` (3)
- `libsilk` (7)
- `docs/compiler/abi-libsilk.md`
