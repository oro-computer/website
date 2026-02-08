# `std::graphics` — Graphics API Bindings

Status: **generated raw bindings (pinned)**. `std::graphics` is a namespace for
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
- `std::graphics::opengl` — generated OpenGL bindings (core OpenGL 4.6).
- `std::graphics::opengles` — generated OpenGL ES bindings (core OpenGL ES 3.2).
- `std::graphics::vulkan` — generated Vulkan bindings (core Vulkan 1.3).

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
