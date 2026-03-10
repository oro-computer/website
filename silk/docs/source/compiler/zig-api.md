# Zig Embedding API

This page documents the Zig-facing embedding surface exported as the `silk` module.

It wraps the same compiler engine used by the `silk` CLI and the C ABI in `libsilk.a`, but presents it as Zig slices, Zig error unions, and owned Zig values instead of raw C handles.

If your host is C or C++, start with [`libsilk` quickstart](?p=compiler/libsilk-quickstart) and [C ABI (`libsilk`)](?p=compiler/abi-libsilk). If your host is Zig, this is the primary downstream reference.

## What the Zig module exports

The upstream `src/silk.zig` module exports four public pieces:

- `silk.OutputKind` — alias of the embedding output-kind enum.
- `silk.Error` — `error{ OutOfMemory, Failed }`.
- `silk.OwnedBytes` — owned in-memory build output with `slice()` and `deinit()`.
- `silk.Compiler` — the main embedding handle.

### `silk.OutputKind`

Use one of these output kinds when building:

- `.SILK_OUTPUT_EXECUTABLE`
- `.SILK_OUTPUT_STATIC_LIBRARY`
- `.SILK_OUTPUT_SHARED_LIBRARY`
- `.SILK_OUTPUT_OBJECT`

For wasm targets, see [WASM backend](?p=compiler/backend-wasm) and [C ABI (`libsilk`)](?p=compiler/abi-libsilk) for the currently supported output subset.

### `silk.Error`

The wrapper uses a small error set:

- `error.OutOfMemory` — wrapper-side allocation failure (for example `Compiler.init`, `lastErrorAlloc`, or Zig-side buffer setup).
- `error.Failed` — the underlying compiler rejected the operation; inspect `Compiler.lastErrorAlloc(...)` for the diagnostic text.

## Add `silk` to a Zig build

The Silk repository exports a Zig module named `silk` from its `build.zig`.

```zig
const silk_dep = b.dependency("silk", .{
    .target = target,
    .optimize = optimize,
});

exe.root_module.addImport("silk", silk_dep.module("silk"));
exe.root_module.link_libc = true;
```

Notes:

- The module is source-based: depending on it compiles the Silk compiler into your Zig program.
- Downstream artifacts that import `silk` should link libc.
- If you instead want to link the compiled static library from C or C++, use [C ABI (`libsilk`)](?p=compiler/abi-libsilk).

## Smallest working example

This is the shortest practical Zig embedder: one in-memory Silk source buffer, one executable output, and one reusable diagnostic printer.

```zig
const std = @import("std");
const silk = @import("silk");

fn reportCompilerFailure(
    compiler: *silk.Compiler,
    allocator: std.mem.Allocator,
) !void {
    if (try compiler.lastErrorAlloc(allocator)) |msg_with_nul| {
        defer allocator.free(msg_with_nul);
        const msg = std.mem.trimRight(u8, msg_with_nul, "\x00");
        std.debug.print("{s}\n", .{msg});
    } else {
        std.debug.print("unknown Silk compiler error\n", .{});
    }
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var compiler = try silk.Compiler.init();
    defer compiler.deinit();

    compiler.addSourceBuffer(
        "main.slk",
        "fn main () -> int { return 0; }\n",
    ) catch |err| switch (err) {
        error.Failed => {
            try reportCompilerFailure(&compiler, allocator);
            return err;
        },
        else => return err,
    };

    compiler.build(.SILK_OUTPUT_EXECUTABLE, "hello") catch |err| switch (err) {
        error.Failed => {
            try reportCompilerFailure(&compiler, allocator);
            return err;
        },
        else => return err,
    };
}
```

This example uses no `std::` imports, so it does not need a stdlib root yet.

## Common workflows

### Compile on-disk sources

If your host tool already has `.slk` files on disk, use `addSourceFile`.

```zig
const std = @import("std");
const silk = @import("silk");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var compiler = try silk.Compiler.init();
    defer compiler.deinit();

    try compiler.setStdRoot("./std");
    try compiler.addSourceFile(allocator, "src/main.slk");
    try compiler.addSourceFile(allocator, "src/util.slk");
    try compiler.build(.SILK_OUTPUT_EXECUTABLE, "app");
}
```

Notes:

- `addSourceFile` reads the file from the current working directory.
- The current wrapper caps file size at 64 MiB per file.
- The path you pass also becomes the logical module name used in diagnostics.

### Build to memory

Use `buildToBytes` when the host wants the artifact in memory instead of on disk.

```zig
const std = @import("std");
const silk = @import("silk");

pub fn main() !void {
    var compiler = try silk.Compiler.init();
    defer compiler.deinit();

    try compiler.setTargetTriple("wasm32-wasi");
    try compiler.addSourceBuffer(
        "main.slk",
        "fn main () -> int { return 0; }\n",
    );

    var wasm = try compiler.buildToBytes(.SILK_OUTPUT_EXECUTABLE);
    defer wasm.deinit();

    const wasm_bytes = wasm.slice();
    _ = wasm_bytes;
}
```

`silk.OwnedBytes` is the exact type returned by `buildToBytes`:

- `slice()` returns the output as `[]u8`.
- `deinit()` frees the owned bytes.

### Build a shared library and generate a C header

The Zig wrapper exposes the same header-generation and ELF metadata knobs as the C ABI.

```zig
const silk = @import("silk");

pub fn buildLibrary() !void {
    var compiler = try silk.Compiler.init();
    defer compiler.deinit();

    try compiler.addSourceBuffer(
        "lib.slk",
        \\export fn add (a: int, b: int) -> int {
        \\  return a + b;
        \\}
    );
    try compiler.setCHeader("libadd.h");
    try compiler.setSoname("libadd.so");
    try compiler.addRunpath("$ORIGIN");
    try compiler.build(.SILK_OUTPUT_SHARED_LIBRARY, "libadd.so");
}
```

For ABI lowering details of exported `string`, optionals, and structs, read [C ABI (`libsilk`)](?p=compiler/abi-libsilk).

## `Compiler` API

`silk.Compiler` is a thin wrapper over the C embedding handle. It owns one compilation session.

### Lifecycle

- `init() -> silk.Error!Compiler`
- `deinit()`

Create a compiler, configure it, add sources, build, then destroy it.

### Stdlib and verification configuration

- `setStdlib(stdlib_name: []const u8)`
  - Selects the stdlib package name, usually `"std"`.
- `setStdRoot(std_root: []const u8)`
  - Points the compiler at the stdlib source root for `import std::...;`.
- `setNoStd(nostd: bool)`
  - Disables filesystem-based stdlib auto-loading.
- `setDebug(debug: bool)`
  - Enables debug-mode behavior, including runtime assert traces on supported native targets and Z3 debug output when verification fails.
- `setNoHeap(no_heap: bool)`
  - Enables the same no-heap mode as `silk --noheap`.
- `setZ3Lib(path: []const u8)`
  - Overrides the Z3 dynamic library path used for Formal Silk verification.
- `setStdArchive(path: []const u8)`
  - Overrides the stdlib archive path used for prebuilt stdlib linkage.

These correspond directly to the CLI and C ABI surfaces documented in [CLI reference](?p=compiler/cli-silk), [Standard library integration](?p=compiler/stdlib-integration), and [C ABI (`libsilk`)](?p=compiler/abi-libsilk).

### Target and output configuration

- `setTargetTriple(target_triple: []const u8)`
  - Examples: `"linux-x86_64"`, `"x86_64-linux-gnu"`, `"wasm32-unknown-unknown"`, `"wasm32-wasi"`.
- `setOptimizationLevel(level: u8)`
  - Valid levels are `0` through `3`.
- `setCHeader(path: []const u8)`
  - Configures generated C header output for non-executable builds.
- `addNeededLibrary(soname: []const u8)`
  - Adds a `DT_NEEDED` entry for executable/shared outputs.
- `addRunpath(path: []const u8)`
  - Adds one runpath element for executable/shared outputs.
- `setSoname(soname: []const u8)`
  - Sets `DT_SONAME` for shared outputs.

These knobs matter only for the output kinds that support them. The detailed native-output rules are defined in [C ABI (`libsilk`)](?p=compiler/abi-libsilk).

### Adding sources

- `addSourceBuffer(name: []const u8, contents: []const u8)`
  - Adds an in-memory UTF-8 source buffer.
- `addSourceFile(allocator: std.mem.Allocator, path: []const u8)`
  - Reads a `.slk` file from disk and then adds it as a source buffer.

Use `addSourceBuffer` when the host already owns the text. Use `addSourceFile` when the host wants the wrapper to read from the filesystem.

### Building

- `build(kind: silk.OutputKind, output_path: []const u8)`
  - Writes the artifact to the filesystem.
- `buildToBytes(kind: silk.OutputKind) -> silk.Error!silk.OwnedBytes`
  - Returns the artifact in an owned memory buffer.

`build` does not create parent directories. Create them before calling the compiler.

### Diagnostics

- `lastErrorAlloc(allocator: std.mem.Allocator) -> !?[]u8`

This is the Zig-facing equivalent of `silk_compiler_last_error` + `silk_error_format`.

Behavior:

- returns `null` when the compiler has no recorded last error,
- otherwise returns an owned UTF-8 buffer,
- the caller must free that buffer with the allocator it used.

The current implementation returns the formatted message with the trailing NUL emitted by the underlying C formatter, so trimming `"\x00"` is the simplest way to produce a plain Zig text slice for display.

## Choosing between the Zig API and the C ABI

Use the Zig module when:

- your host application is already Zig,
- you want `[]const u8` inputs instead of C strings,
- you want Zig error unions and owned Zig values,
- you want to stay in a single-language host integration.

Use the C ABI when:

- your host is C or C++,
- you need to link `libsilk.a` directly,
- you need generated headers for downstream C consumers,
- you want the stable public ABI surface independent of Zig source integration.

The two surfaces drive the same compiler engine and should stay aligned.

## See also

- [`libsilk` quickstart](?p=compiler/libsilk-quickstart)
- [C ABI (`libsilk`)](?p=compiler/abi-libsilk)
- [`libsilk` (7)](?p=man/libsilk.7)
- [`silk_compiler` (3)](?p=man/silk_compiler.3)
- [`silk_error` (3)](?p=man/silk_error.3)
- [Compiler diagnostics](?p=compiler/diagnostics)
