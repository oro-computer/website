# `std::graphics::opengles`

Source: `std/graphics/opengles.slk`

This is the exact canonical documentation page for `std::graphics::opengles`.

## Role

`std::graphics::opengles` is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

Use this module when Silk code needs raw OpenGL ES calls under a host-owned ES
context, such as an EGL, mobile, embedded, or browser-adjacent runtime. Like the
desktop OpenGL module, this page documents bindings only: surface creation,
context ownership, swap/present, input, and frame pacing remain host
responsibilities.

## Practical Workflow

- Create the surface and OpenGL ES context in the host.
- Compile Silk rendering code as an object with `silk build --kind object`.
- Link against the platform OpenGL ES loader (`libGLESv2.so.2` on common Linux
 hosted systems, or the platform equivalent).
- Call exported Silk functions only after the ES context is current.
- Use `std::graphics::Ptr` (`u64`) for raw C pointer parameters and preserve
 pointer lifetimes on the host side.

Useful guide query:

```sh
silk guide "std graphics opengles"
```

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [graphics](?p=std/graphics)

## Notes

- The shipped source for this module is `std/graphics/opengles.slk`.
- The canonical module name is `std::graphics::opengles`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
