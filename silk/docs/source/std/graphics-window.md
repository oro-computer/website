# `std::graphics::window`

Source: `std/graphics/window.slk`

`std::graphics::window` is the provider-neutral graphics helper for rendering
into a `std::window` handle. It exists above the raw graphics bindings so
applications can request a simple visible rendering path without naming the
active platform graphics provider directly.

The current implementation routes macOS window clears through
`std::graphics::metal`. Unsupported targets return explicit errors and do not
require Metal, QuartzCore, AppKit, GTK, Vulkan, or OpenGL linkage through this
module unless a future provider is added and reached.

## Exported API

```silk
module std::graphics::window;

import metal from "std/graphics/metal";
import result from "std/result";
import window from "std/window";

export enum Backend {
  Unsupported,
  Metal,
}

export enum RenderErrorKind {
  UnsupportedPlatform,
  InvalidWindow,
  RuntimeFailed,
}

export error RenderFailed { code: int }

impl RenderFailed {
  public fn kind (self: &RenderFailed) -> RenderErrorKind;
}

export struct ClearColor {
  red: f64,
  green: f64,
  blue: f64,
  alpha: f64,
}

export type RenderResult = std::result::Result(bool, RenderFailed);

export fn failed (kind: RenderErrorKind) -> RenderFailed;
export fn backend () -> Backend;
export fn is_supported () -> bool;
export fn clear (window: std::window::Window, color: ClearColor) -> RenderResult;
```

## Semantics

- `backend()` returns `Backend::Metal` on macOS while the Metal facade is the
 selected provider; otherwise it returns `Backend::Unsupported`.
- `is_supported()` returns whether `backend()` is not `Unsupported`.
- `clear(...)` requires a non-zero `std::window::Window` handle from the active
 window provider.
- On macOS, `clear(...)` calls `std::graphics::metal::clear(...)`, which is
 implemented through the Metal `Context` / `Frame` path. The runtime derives
 the current AppKit content-view size and backing scale before configuring the
 `CAMetalLayer` drawable size, with a fallback to the requested logical size
 stored in the `std::window::Window` value.
- Unsupported targets return `Err(UnsupportedPlatform)`.

## Example

`examples/std_macos_metal_window.slk` uses `std::window` plus
`std::graphics::window` to run a stdlib-owned window loop and clear each frame
through the active graphics provider. On current macOS builds that provider is
Metal.
