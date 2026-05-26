# `std::window::gtk`

`std::window::gtk` is the GTK-specific facade for applications that want to
select the Linux GTK provider explicitly while still using the portable
`std::window` types.

This module is intentionally linkable without GTK development libraries. It
does not declare GTK symbols or force GTK support into unrelated builds. The
bundled Linux runtime loads GTK dynamically when `std::window` code is reached.

## Exported API

```silk
module std::window::gtk;

import std::window;

export fn is_supported () -> bool;
export fn open (options: std::window::Options) -> std::window::WindowResult;
```

## Semantics

- `is_supported()` returns `true` only when the runtime selected
 `std::window::Backend::GTK`.
- `open(...)` delegates to `std::window::open(...)` after checking that the GTK
 provider is active.
- On Linux, the provider is active only when GTK can be loaded and
 `gtk_init_check` can initialize a display connection.
- When GTK is unavailable, or when the process has no usable display,
 `open(...)` returns `Err(UnsupportedPlatform)` through the portable facade.
- The portable `std::window::next_event(...)`, `poll(...)`, `close(...)`, and
 control surfaces operate on GTK-backed windows while the provider is active.

Current provider

- The module is a stable opt-in namespace and carries no compile-time GTK link
 dependency.
- GTK-backed native window creation, high-level `run(...)`, manual
 `run_loop(...)` support through `next_event(...)`, screen-size queries, and
 common window controls are implemented by the bundled Linux runtime.
- GTK applies title, size, size constraints, visibility, positioning,
 always-on-top, background color, resizable/decorated state, and closable
 state where GTK and the active window manager expose those operations.
- `blur(...)` succeeds without forcing focus away from the window because GTK
 does not provide a portable way to move focus to another application window.
