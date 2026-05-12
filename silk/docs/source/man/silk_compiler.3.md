# [`silk_compiler(3)`](?p=man/silk_compiler.3) — Embed the Silk Compiler

> NOTE: This is the Markdown source for the eventual man 3 page for the `SilkCompiler` embedding API. The roff-formatted manpage should be generated from this content.

## Name

`silk_compiler` — C99 embedding API for compiling Silk sources via `libsilk.a`.

## Synopsis

```c
#include <silk/silk.h>

typedef struct SilkCompiler SilkCompiler;
typedef struct SilkModule   SilkModule;
typedef struct SilkBytes    SilkBytes;
typedef struct SilkError    SilkError;
typedef enum SilkOutputKind SilkOutputKind;

SilkCompiler *silk_compiler_create(void);
void          silk_compiler_destroy(SilkCompiler *compiler);

bool silk_compiler_set_stdlib(SilkCompiler *compiler, SilkString stdlib_name);
bool silk_compiler_set_std_root(SilkCompiler *compiler, SilkString std_root);
bool silk_compiler_set_nostd(SilkCompiler *compiler, bool nostd);
bool silk_compiler_set_debug(SilkCompiler *compiler, bool debug);
bool silk_compiler_set_noheap(SilkCompiler *compiler, bool noheap);
bool silk_compiler_set_target(SilkCompiler *compiler, SilkString target_triple);
bool silk_compiler_set_z3_lib(SilkCompiler *compiler, SilkString path);
bool silk_compiler_set_std_archive(SilkCompiler *compiler, SilkString path);
bool silk_compiler_add_needed_library(SilkCompiler *compiler, SilkString soname);
bool silk_compiler_add_runpath(SilkCompiler *compiler, SilkString path);
bool silk_compiler_set_soname(SilkCompiler *compiler, SilkString soname);
bool silk_compiler_set_optimization_level(SilkCompiler *compiler, int level);
bool silk_compiler_set_c_header(SilkCompiler *compiler, SilkString path);

SilkModule *silk_compiler_add_source_buffer(SilkCompiler *compiler,
                                            SilkString    name,
                                            SilkString    contents);

bool silk_compiler_build(SilkCompiler   *compiler,
                         SilkOutputKind  kind,
                         SilkString      output_path);

bool silk_compiler_build_to_bytes(SilkCompiler   *compiler,
                                  SilkOutputKind  kind,
                                  SilkBytes      *out_bytes);
void silk_bytes_free(SilkBytes *bytes);

SilkError *silk_compiler_last_error(SilkCompiler *compiler);
size_t     silk_error_format(const SilkError *error,
                             char            *buffer,
                             size_t           buffer_len);
```

## Description

The `SilkCompiler` API embeds the Silk compiler in C or C++ programs.

Typical workflow:

1. Create a compiler: `silk_compiler_create`.
2. Optionally configure it (stdlib selection, target triple, etc).
3. Add one or more source buffers with `silk_compiler_add_source_buffer`.
4. Build an artifact with `silk_compiler_build` (filesystem) or `silk_compiler_build_to_bytes` (in-memory).
5. On error, retrieve diagnostics via `silk_compiler_last_error` and `silk_error_format` (see [`silk_error(3)`](?p=man/silk_error.3)).
6. Destroy the compiler with `silk_compiler_destroy`.

The canonical ABI specification lives at [abi libsilk](?p=compiler/abi-libsilk).

## Configuration

All configuration functions return `true` on success and `false` on failure. On failure, the compiler records an error retrievable via `silk_compiler_last_error`.

Stdlib configuration:

- `silk_compiler_set_stdlib` selects the stdlib package name (for example `"std"`).
- `silk_compiler_set_std_root` selects the filesystem root used to resolve `from "std/..."` module specifiers and direct std ABI imports.
- `silk_compiler_set_nostd(true)` disables filesystem-based stdlib auto-loading.
- `silk_compiler_set_std_archive` overrides the stdlib archive path used by hosted executable builds when archive linking is applicable.

Build-mode and verification configuration:

- `silk_compiler_set_debug(true)` enables the same debug lowering/debug-verifier behavior as CLI `--debug`.
- `silk_compiler_set_noheap(true)` enables the same no-heap restrictions as CLI `--noheap`.
- `silk_compiler_set_debug` and `silk_compiler_set_noheap` are currently mutually exclusive; attempting to enable both fails.
- `silk_compiler_set_z3_lib` overrides the Z3 dynamic library path used for Formal Silk verification.

Target, linkage, and header emission:

- `silk_compiler_set_target` selects the code generation target triple.
- `silk_compiler_add_needed_library` / `silk_compiler_add_runpath` / `silk_compiler_set_soname` configure dynamic linker metadata for ELF outputs (when applicable).
- `silk_compiler_set_c_header` requests generated C header output for object/static/shared builds, matching CLI `--c-header`.

Optimization:

- `silk_compiler_set_optimization_level` accepts an integer level in the range documented by the public Silk header. The default is level 0 unless overridden.
- Level 1+ enables lowering-time pruning of unused extern symbols before code generation (typically reducing output size and over-linking when using the prebuilt `libsilk_std.a` archive for auto-loaded std modules).
- The CLI also exposes `silk build --strip-unused` to force analogous reachability-based pruning at `-O0` for executable/static/shared outputs; the current C ABI does not yet expose a separate setter for that flag.

## Sources

`silk_compiler_add_source_buffer` registers a module as an in-memory UTF-8 source buffer. The returned `SilkModule*` is owned by the compiler; embedders must not free it.

The `name` parameter is used for diagnostics and does not need to correspond to an on-disk file path.

## Building

`silk_compiler_build` writes an artifact to `output_path`. Unlike the CLI, this ABI call does not create parent directories; the output directory must exist.

`silk_compiler_build_to_bytes` returns an in-memory artifact via `SilkBytes`. On success, the caller must free the buffer with `silk_bytes_free` (see [`silk_bytes(3)`](?p=man/silk_bytes.3)).

If `silk_compiler_set_c_header` is configured, the header is only emitted for filesystem builds of `object`, `static`, or `shared` outputs. In-memory `silk_compiler_build_to_bytes` calls reject `c_header` output.

## Thread safety

The `SilkCompiler` object is not currently specified as thread-safe. Confine it to one thread or synchronize access.

## See Also

- [`silk_error(3)`](?p=man/silk_error.3), [`silk_bytes(3)`](?p=man/silk_bytes.3), [`silk_abi_get_version(3)`](?p=man/silk_abi_get_version.3)
- [`libsilk(7)`](?p=man/libsilk.7)
- [abi libsilk](?p=compiler/abi-libsilk)
