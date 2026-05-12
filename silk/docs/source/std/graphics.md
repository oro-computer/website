# `std::graphics` — Graphics API Bindings

`std::graphics` is a
namespace for low-level, FFI-oriented bindings to common graphics APIs and
platform-specific facades where a generated SDK registry is not available.

The generated raw-binding modules intentionally do **not** include:

- window-system integration (creating a surface/context),
- swapchain/window management,
- higher-level rendering abstractions,
- automatic resource lifetime management.

Those pieces are platform- and engine-specific and usually live above
`std::graphics`. The shipped `std::window` module is the opt-in
standard-library application layer for platform windows; downstream engines can
build higher-level surface and swapchain management on top of `std::graphics`
plus `std::window`. `std::graphics::metal` now provides a macOS Metal handle
API with window-context integration for applications that need direct Metal
devices, queues, render passes, buffers, libraries, render pipelines, and draw
commands.

## Module Layout

`std::graphics` is organized as:

- `std::graphics` — shared conventions and basic pointer/handle aliases.
- `std::graphics::opengl` — generated OpenGL bindings (core OpenGL 4.6).
- `std::graphics::opengles` — generated OpenGL ES bindings (core OpenGL ES 3.2).
- `std::graphics::vulkan` — generated Vulkan bindings (core Vulkan 1.3).
- `std::graphics::metal` — macOS Metal handle API and `std::window`
 `CAMetalLayer` context facade.
- `std::graphics::window` — provider-neutral helper for clearing a
 `std::window` with the active graphics backend.

These bindings are generated from the Khronos registries and pinned to specific
upstream commits so the surface area is stable and reviewable.

Pinned registry inputs:

- OpenGL / OpenGL ES: `gl.xml` from `KhronosGroup/OpenGL-Registry` commit
 `0b449b97cdf1043eef5e1f0e235cbbab6ec10c86`.
- Vulkan: `vk.xml` from `KhronosGroup/Vulkan-Docs` commit
 `fb8116669f76e26bdab4c7ad0bf1cafdeff484dc`.

Regeneration:

- Run `python3 docs/tools/gen_graphics_bindings.py`.
- The generated outputs are:
 - `std/graphics/opengl.slk`
 - `std/graphics/opengles.slk`
 - `std/graphics/vulkan.slk`

`std::graphics::metal` is not generated from a registry. It is a hand-written
macOS facade backed by the bundled runtime and documented in
[graphics metal](?p=std/graphics-metal). It exposes typed opaque handles for Metal
devices, command queues, command buffers, layers, drawables, textures, render
pass descriptors, render encoders, buffers, libraries, functions, render
pipeline descriptors, and render pipeline states. Its provider symbol
declarations live under `std::runtime::graphics::metal`, not in the public
graphics facade.

`std::graphics::window` is also hand-written. It is the current ergonomic
window-rendering facade and routes to Metal on macOS while returning explicit
unsupported results on targets without a shipped window-rendering provider.

## Boundary Model

`std::graphics::opengl`, `std::graphics::opengles`, and
`std::graphics::vulkan` are generated raw SDK binding modules. Their public
surface intentionally consists of ABI-level constants, aliases, and `ext`
declarations that mirror the upstream registries. They are suitable for engine
or runtime authors that need direct API access and are not the ergonomic
application windowing surface.

`std::graphics::window` and `std::graphics::metal` are different: they are
stdlib-owned helper facades used by application examples. Those facades must
not expose `silk_rt_*` provider symbols directly. Provider runtime calls for
the Metal window helper live under `std::runtime::graphics::metal`, matching
the `std::window` / `std::runtime::window` layering.

## Linking (Hosted `linux/x86_64` Baseline)

These modules declare external symbols via `ext`. On the hosted baseline, they
are typically provided by dynamic loader libraries such as:

- OpenGL: `libGL.so.1`
- OpenGL ES: `libGLESv2.so.2` (or a platform-specific GL ES loader)
- Vulkan: `libvulkan.so.1`

Downstream programs must link the appropriate library via the CLI:

- `silk build ... --needed libGL.so.1`
- `silk build ... --needed libGLESv2.so.2`
- `silk build ... --needed libvulkan.so.1`

and may also need to provide search paths via `--runpath` depending on how the
system libraries are installed.

## Linking (macOS Metal)

Reachable calls to `std::graphics::metal::clear(...)`,
`std::graphics::metal::clear_window(...)`, `std::graphics::metal::create_context(...)`,
direct Metal object creation/encoding calls, or
`std::graphics::window::clear(...)` on `macos-aarch64` opt host-backed Mach-O
executable links into:

- `Metal.framework`,
- `QuartzCore.framework`.

The visible-window example also imports `std::window`, which opts the same
executable into `AppKit.framework`.

## Workflow Guide

Use `std::graphics` as the low-level rendering ABI layer under a host program or
engine that already owns the platform objects. The current workflow is:

1. Pick the backend module:
 - `std::graphics::opengl` for a host-owned desktop OpenGL context,
 - `std::graphics::opengles` for a host-owned OpenGL ES context,
 - `std::graphics::vulkan` for raw Vulkan handles and function entrypoints.
2. Keep window, surface, swapchain, input, and frame pacing in the host.
3. Export one or more Silk frame functions that accept plain scalar frame
 inputs such as framebuffer size, elapsed time, or normalized input
 coordinates.
4. Build the Silk code as an object (`--kind object`) when it is meant to be
 linked into a host executable.
5. Link the host executable against the platform graphics loader and call the
 exported Silk frame function only after the relevant context/device is
 current and ready.

This split is intentional. It keeps the stdlib bindings ABI-stable and avoids
pretending that there is one portable windowing, swapchain, or input-loop model
for all downstream hosts.

Useful guide queries:

```sh
silk guide "draw an opengl triangle"
silk guide "animated opengl cube"
silk guide "opengl mouse reactive"
silk guide "std graphics host context"
```

## Examples

The Silk compiler repository ships host-driven OpenGL examples under `examples/`:

- `examples/std_graphics_opengl_triangle.slk` exports
 `silk_example_opengl_triangle_frame(width, height)`, which draws one colored
 triangle.
- `examples/std_graphics_opengl_3d_cube.slk` exports
 `silk_example_opengl_cube_frame(width, height, time_seconds)`, which draws an
 animated perspective cube.
- `examples/std_graphics_opengl_mouse_reactive.slk` exports
 `silk_example_opengl_mouse_frame(width, height, mouse_x, mouse_y,
 time_seconds)`, which draws a triangle that follows normalized mouse
 coordinates.

These are object examples, not standalone windowed applications. A host program
must:

- create the window or surface,
- create and make current an OpenGL context,
- pass the framebuffer dimensions each frame,
- pass frame time and normalized mouse coordinates where required,
- call the exported frame function,
- and present/swap the rendered frame afterward.

Build them as objects:

```sh
./zig-out/bin/silk build --kind object examples/std_graphics_opengl_triangle.slk -o tmp/std_graphics_opengl_triangle.o
./zig-out/bin/silk build --kind object examples/std_graphics_opengl_3d_cube.slk -o tmp/std_graphics_opengl_3d_cube.o
./zig-out/bin/silk build --kind object examples/std_graphics_opengl_mouse_reactive.slk -o tmp/std_graphics_opengl_mouse_reactive.o
```

When a host executable links one of these objects, it must also link the OpenGL
loader/library for the platform, for example `--needed libGL.so.1` on the
hosted `linux/x86_64` baseline.

The examples deliberately avoid creating a window or context. If a standalone
program is needed today, write a C, Zig, or engine-host executable that creates
the window/context with the platform library of your choice, links the Silk
object, forwards per-frame inputs, and swaps/presents after the exported Silk
frame function returns.

## Safety Notes

These APIs are inherently low-level:

- Many functions are unsafe without an active context/device.
- Most pointer parameters are represented as `std::graphics::Ptr` (`u64`)
 addresses and must be valid for the duration of the call.
- Some `const char *` inputs are represented as Silk `string` values for
 convenience (lowered as C-string pointers by the current `ext` ABI mapping).
- Returned pointers (for example from `glGetString`) are borrowed views into
 driver-managed memory and must not be freed.

The `std::graphics` bindings focus on mechanical ABI mapping and leave
ownership/lifetime management to higher layers.

Important current limitation (compiler subset):

- The compiler does not yet implement packed C struct layout. As a result,
 these bindings use `u64` pointers for C pointer parameters and do not rely on
 passing user-defined structs by value to C.
