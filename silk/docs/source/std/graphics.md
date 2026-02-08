# `std::graphics` — Graphics API Bindings

Status: **design + initial stubs**. `std::graphics` is a namespace for
low-level, FFI-oriented bindings to common graphics APIs.

This layer intentionally does **not** include:

- window-system integration (creating a surface/context),
- swapchain/window management,
- higher-level rendering abstractions,
- automatic resource lifetime management.

Those pieces are platform- and engine-specific and are expected to live above
`std::graphics` (either as future `std::...` modules or downstream packages).

## Module Layout

`std::graphics` is organized as:

- `std::graphics` — shared conventions and basic pointer/handle aliases.
- `std::graphics::opengl` — a small set of OpenGL types/constants and `ext`
  function declarations.
- `std::graphics::opengles` — the corresponding OpenGL ES subset.
- `std::graphics::vulkan` — a small set of Vulkan types/constants and `ext`
  function declarations.

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

## Safety Notes

These APIs are inherently low-level:

- Many functions are unsafe without an active context/device.
- Pointer parameters are represented as `u64` addresses and must be valid for
  the duration of the call.
- Returned pointers (for example from `glGetString`) are borrowed views into
  driver-managed memory and must not be freed.

The initial `std::graphics` bindings focus on mechanical ABI mapping and leave
ownership/lifetime management to higher layers.

