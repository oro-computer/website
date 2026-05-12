# `std::graphics::opengl`

Source: `std/graphics/opengl.slk`

This is the exact canonical documentation page for `std::graphics::opengl`.

## Role

`std::graphics::opengl` is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

Use this module when Silk code needs to issue OpenGL calls into a context that a
host application has already created and made current. The module is generated
from the pinned Khronos OpenGL registry and exposes raw type aliases,
constants, and `ext` declarations; it is not a windowing toolkit or a GL object
lifetime manager.

## Practical Workflow

- Create the window and OpenGL context in the host application.
- Compile Silk rendering code as an object with `silk build --kind object`.
- Link the object into the host executable with the platform OpenGL loader
 (`libGL.so.1` on the hosted Linux baseline, or the platform equivalent).
- Call exported Silk frame functions only while the OpenGL context is current.
- Pass framebuffer dimensions, time, and input state as plain scalar
 parameters; keep swap/present in the host.

Guide queries that route to concrete examples:

```sh
silk guide "draw an opengl triangle"
silk guide "animated opengl cube"
silk guide "opengl mouse reactive"
```

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [graphics](?p=std/graphics)

## Notes

- The shipped source for this module is `std/graphics/opengl.slk`.
- The canonical module name is `std::graphics::opengl`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
