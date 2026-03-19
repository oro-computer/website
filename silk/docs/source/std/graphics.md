# `std::graphics`

Status: **Implemented raw bindings**. `std::graphics` is the standard library’s
low-level namespace for pinned graphics API bindings.

This layer intentionally does not provide window creation, swapchains,
resource-lifetime wrappers, or renderer abstractions. It exists to give Silk
programs direct access to the underlying APIs.

## Exported API

### Root module

`std::graphics` exports the shared binding conventions:

- `Ptr = u64` — raw pointer-shaped values passed through the C ABI
- `Handle = u64` — raw handle-shaped values used by APIs such as Vulkan and GL
  sync objects

### `std::graphics::opengl`

The OpenGL binding module is generated from the Khronos OpenGL registry at core
OpenGL 4.6. It exports:

- 39 type aliases such as `GLenum`, `GLuint`, `GLsizei`, `GLsync`, and callback
  pointer aliases like `GLDEBUGPROC`
- 1367 constants such as `GL_COLOR_BUFFER_BIT`, `GL_NO_ERROR`, and
  `GL_TEXTURE_2D`
- 657 `gl*` entry points such as `glClear`, `glClearColor`, `glBindBuffer`,
  `glCreateShader`, `glDrawElements`, and `glGetString`

### `std::graphics::opengles`

The OpenGL ES binding module is generated from the Khronos OpenGL registry at
core OpenGL ES 3.2. It exports:

- 39 type aliases such as `GLenum`, `GLuint`, `GLsizei`, `GLsync`, and
  callback pointer aliases
- 1001 constants covering the ES 3.2 core surface
- 358 `gl*` entry points such as `glClear`, `glBindTexture`, `glUseProgram`,
  and `glDrawArrays`

### `std::graphics::vulkan`

The Vulkan binding module is generated from the Khronos Vulkan registry at core
Vulkan 1.3. It exports:

- 233 type aliases including handle types like `VkInstance`, `VkDevice`,
  `VkBuffer`, `VkCommandBuffer`, flag types, enums, and callback pointer types
- 1102 constants covering core Vulkan enums, bitfields, result codes, and
  structure tags
- 215 `vk*` entry points such as `vkCreateInstance`, `vkEnumeratePhysicalDevices`,
  `vkCreateDevice`, `vkQueueSubmit`, and `vkCmdDraw`

### Registry provenance

Pinned registry inputs:

- OpenGL / OpenGL ES: `gl.xml` from `KhronosGroup/OpenGL-Registry` commit
  `0b449b97cdf1043eef5e1f0e235cbbab6ec10c86`
- Vulkan: `vk.xml` from `KhronosGroup/Vulkan-Docs` commit
  `fb8116669f76e26bdab4c7ad0bf1cafdeff484dc`

Generated outputs:

- `std/graphics/opengl.slk`
- `std/graphics/opengles.slk`
- `std/graphics/vulkan.slk`

## Examples

### Call OpenGL after a context already exists

```silk
import std::graphics::opengl;

fn main () -> int {
  let mask: std::graphics::opengl::GLbitfield = std::graphics::opengl::GL_COLOR_BUFFER_BIT;
  std::graphics::opengl::glClearColor(0.08, 0.08, 0.12, 1.0);
  std::graphics::opengl::glClear(mask);
  return 0;
}
```

This example assumes a valid OpenGL context is already current on the thread.

## Considerations

- These are raw bindings. Ownership, synchronization, context lifetime, and
  higher-level safety remain the caller’s responsibility.
- Most pointer parameters are represented as `std::graphics::Ptr` (`u64`).
  Ensure any pointed-to storage is correctly laid out and remains valid for the
  full duration of the call.
- On the hosted `linux/x86_64` baseline, you still need to link the relevant
  system loader library, for example:
  - `silk build ... --needed libGL.so.1`
  - `silk build ... --needed libGLESv2.so.2`
  - `silk build ... --needed libvulkan.so.1`
- Returned driver-managed strings or pointers are borrowed. Do not free them.
- The current compiler subset does not rely on passing user-defined packed C
  structs by value. The generated bindings therefore favor pointer-based ABI
  mapping.

## See also

- [`std::ffi::c`](?p=std/ffi-c)
- [`Package structure`](?p=std/package-structure)

## Design goals

- Pin the registry inputs so the public surface is reproducible and reviewable.
- Provide exhaustive raw symbol coverage for the selected core API versions.
- Keep the standard library layer mechanical; let higher-level rendering
  packages build ergonomic abstractions above it.
