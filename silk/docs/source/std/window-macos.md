# `std::window::macos`

`std::window::macos` is the macOS-specific facade for applications that want to
select the macOS provider explicitly while still using the portable
`std::window` types.

## Exported API

```silk
module std::window::macos;

import std::window;

export fn is_supported () -> bool;
export fn open (options: std::window::Options) -> std::window::WindowResult;
```

## Semantics

- `is_supported()` returns `true` only when the runtime selected
 `std::window::Backend::MacOS`.
- `open(...)` delegates to `std::window::open(...)` after checking that the
 macOS provider is active.
- On non-macOS targets, `open(...)` returns `Err(UnsupportedPlatform)`.

Current provider

- The module is linkable, opts reachable `std::window` executables into the
 `AppKit` framework, and `open(...)` creates a visible provider-owned
 `NSWindow` on macOS targets.
- The portable `std::window::next_event(...)` call pumps at most one AppKit
 event, updates AppKit windows, and reports `CloseRequested` when the
 provider-owned `NSWindow` is no longer visible.
- `poll(...)` remains available as a compatibility liveness/update helper, and
 `close(...)` closes the provider-owned `NSWindow`.
- `std::window` native controls route to AppKit for title, visibility, focus,
 size, position, minimize/maximize/restore, always-on-top, screen size, and
 background color.
- The portable `std::window::run(...)` entrypoint opens a visible AppKit
 window and runs the application event loop until the user closes the last
 window.
- The portable `std::window::run_loop(...)` entrypoint owns open/event/close
 lifecycle for frame-rendering examples and calls the application callback
 while the AppKit window remains open.
