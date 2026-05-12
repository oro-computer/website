# `std::graphics::vulkan`

Source: `std/graphics/vulkan.slk`

This is the exact canonical documentation page for `std::graphics::vulkan`.

## Role

`std::graphics::vulkan` is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

Use this module when Silk code needs raw Vulkan constants, type aliases, and
entrypoint declarations while a host application owns instance/device creation,
surface setup, swapchains, queues, command buffers, synchronization, and
presentation. The current Silk compiler subset does not model Vulkan's C
struct-heavy API ergonomically yet, so these bindings are primarily an ABI
surface for lower-level integration work.

## Practical Workflow

- Keep Vulkan instance, device, queue, swapchain, and allocator setup in the
 host or engine layer.
- Use Silk functions for small, explicit integration points where raw Vulkan
 handles can be passed as `std::graphics::Handle`/`Ptr` values.
- Link the final host executable with the platform Vulkan loader
 (`libvulkan.so.1` on the hosted Linux baseline, or the platform equivalent).
- Avoid by-value C struct calls from Silk until the compiler has packed C struct
 layout support; pass pointers to host-owned data where the binding surface
 requires pointer-shaped parameters.

Useful guide query:

```sh
silk guide "std graphics vulkan"
```

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [graphics](?p=std/graphics)

## Notes

- The shipped source for this module is `std/graphics/vulkan.slk`.
- The canonical module name is `std::graphics::vulkan`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
