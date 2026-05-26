# `std::window`

`std::window` is the opt-in standard-library windowing facade. Importing and
reaching this module's runtime calls is the signal that an executable wants
platform window support; unrelated `std::` users do not link window provider
shims or provider frameworks.

Application code that wants portable provider-owned windows should stay on
this public facade. Stdlib-owned window examples do not declare `ext`, import
`std::runtime::*`, reference `silk_rt_*` symbols, or pass native
header/source inputs to reach a provider. Explicit native interop examples may
instead ship their own `.m` provider and call it through Silk `ext`.

The current implementation provides target detection, opt-in Apple SDK
framework linkage, a high-level `run(...)` application entrypoint, real AppKit
window handles, nonblocking AppKit event polling on macOS, a UIKit application
lifecycle path for iOS device and simulator targets, a runtime-loaded GTK
provider for Linux, and a portable native window-control API. On macOS,
`Options` maps to AppKit creation settings and control calls route to the
underlying `NSWindow`. On iOS, `run(...)` enters `UIApplicationMain`; direct
window controls report `ApplicationLifecycleRequired` when UIKit owns the
lifecycle. On Linux, the runtime selects GTK only when GTK can be loaded and a
display connection can be initialized. The CLI automatically materializes an
adjacent `<output>.app` bundle for iOS executable builds whose module graph
reaches `std::window`.

## Exported API

```silk
module std::window;

import std::result;

export enum Backend { Unsupported, MacOS, IOS, GTK }
export enum WindowErrorKind {
  UnsupportedPlatform,
  InvalidDimensions,
  InvalidColor,
  RuntimeFailed,
  ApplicationLifecycleRequired,
}
export enum EventKind { NoEvent, CloseRequested, Provider }

export error WindowFailed { code: int }

impl WindowFailed {
  public fn kind (self: &WindowFailed) -> WindowErrorKind;
}

export struct Size { width: int = 0, height: int = 0 }
export struct Position { x: int = 0, y: int = 0 }
export struct Color {
  red: f64 = 0.0,
  green: f64 = 0.0,
  blue: f64 = 0.0,
  alpha: f64 = 1.0,
}
export struct Options {
  title: string,
  size: Size,
  position: Position = Position{ x: 0, y: 0 },
  positioned: bool = false,
  min_size: Size = Size{ width: 0, height: 0 },
  max_size: Size = Size{ width: 0, height: 0 },
  resizable: bool = true,
  minimizable: bool = true,
  maximizable: bool = true,
  closable: bool = true,
  frameless: bool = false,
  utility: bool = false,
  visible: bool = true,
  always_on_top: bool = false,
  background: Color = Color{ red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0 },
  has_background: bool = false,
}
export struct Window {
  handle: u64,
  size: Size,
  title: string = "",
  position: Position = Position{ x: 0, y: 0 },
}
export struct Event { kind: EventKind }

impl Window {
  public fn is_valid (self: Window) -> bool;
  public fn show (self: Window) -> ActionResult;
  public fn hide (self: Window) -> ActionResult;
  public fn focus (self: Window) -> ActionResult;
  public fn blur (self: Window) -> ActionResult;
  public fn minimize (self: Window) -> ActionResult;
  public fn maximize (self: Window) -> ActionResult;
  public fn restore (self: Window) -> ActionResult;
  public fn is_visible (self: Window) -> BoolResult;
  public fn set_title (self: Window, title: string) -> ActionResult;
  public fn set_size (self: Window, value: Size) -> ActionResult;
  public fn size (self: Window) -> SizeResult;
  public fn set_position (self: Window, value: Position) -> ActionResult;
  public fn position (self: Window) -> PositionResult;
  public fn set_always_on_top (self: Window, enabled: bool) -> ActionResult;
  public fn is_always_on_top (self: Window) -> BoolResult;
  public fn set_background (self: Window, color: Color) -> ActionResult;
  public fn next_event (self: Window) -> EventResult;
  public fn poll (self: Window) -> PollResult;
  public fn close (self: Window) -> CloseResult;
}

export type WindowResult = std::result::Result(Window, WindowFailed);
export type EventResult = std::result::Result(Event, WindowFailed);
export type PollResult = std::result::Result(bool, WindowFailed);
export type CloseResult = std::result::Result(bool, WindowFailed);
export type ActionResult = std::result::Result(bool, WindowFailed);
export type BoolResult = std::result::Result(bool, WindowFailed);
export type SizeResult = std::result::Result(Size, WindowFailed);
export type PositionResult = std::result::Result(Position, WindowFailed);
export type RunResult = std::result::Result(bool, WindowFailed);
export type FrameCallback = fn (Window) -> int;

export fn options (title: string, width: int, height: int) -> Options;
export fn failed (kind: WindowErrorKind) -> WindowFailed;
export fn backend () -> Backend;
export fn is_supported () -> bool;
export fn open (options: Options) -> WindowResult;
export fn screen_size () -> SizeResult;
export fn show (window: Window) -> ActionResult;
export fn hide (window: Window) -> ActionResult;
export fn focus (window: Window) -> ActionResult;
export fn blur (window: Window) -> ActionResult;
export fn minimize (window: Window) -> ActionResult;
export fn maximize (window: Window) -> ActionResult;
export fn restore (window: Window) -> ActionResult;
export fn is_visible (window: Window) -> BoolResult;
export fn set_title (window: Window, title: string) -> ActionResult;
export fn set_size (window: Window, value: Size) -> ActionResult;
export fn size (window: Window) -> SizeResult;
export fn set_position (window: Window, value: Position) -> ActionResult;
export fn position (window: Window) -> PositionResult;
export fn set_always_on_top (window: Window, enabled: bool) -> ActionResult;
export fn is_always_on_top (window: Window) -> BoolResult;
export fn set_background (window: Window, color: Color) -> ActionResult;
export fn next_event (window: Window) -> EventResult;
export fn poll (window: Window) -> PollResult;
export fn close (window: Window) -> CloseResult;
export fn run (options: Options) -> RunResult;
export fn run_loop (options: Options, frame: FrameCallback) -> RunResult;
```

## Provider Model

Windowing support is intentionally not part of default hosted runtime behavior.
The compiler links provider support only when reachable code imports and calls
`std::window` / `std::window::*`.

The `std::runtime::window` module is the stdlib-owned implementation boundary,
not the application API. It may use target-gated runtime symbols internally,
but callers should use `std::window` types and functions.

Current providers:

- `Backend::MacOS` for macOS targets.
- `Backend::IOS` for `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64`.
- `Backend::GTK` for Linux targets when the bundled runtime can load GTK and
 initialize the process display connection.

Unsupported targets return `Backend::Unsupported` and `open(...)` returns
`Err(UnsupportedPlatform)`. Those targets use local runtime stubs and do not
declare or import `silk_rt_window_*` provider symbols.

## Errors

`WindowFailed.kind()` returns a stable `WindowErrorKind`:

- `UnsupportedPlatform` means the current target has no selected provider.
- `InvalidDimensions` means a requested size or size constraint is zero,
 negative, incomplete, or internally inconsistent.
- `InvalidColor` means a normalized RGBA channel is outside `0.0 ... 1.0`.
- `RuntimeFailed` means the selected provider rejected or could not complete
 the operation.
- `ApplicationLifecycleRequired` means the selected provider owns the requested
 operation under its application lifecycle, such as direct UIKit window
 controls outside `UIApplicationMain`.

## High-Level Application API

`run(options)` is the ergonomic entrypoint for application code. A minimal
window application imports only `std::window`:

```silk
import std::window;

fn main () -> int {
  let options = std::window::Options{
    title: "Silk Window App",
    size: std::window::Size{ width: 640, height: 480 },
    min_size: std::window::Size{ width: 360, height: 240 },
    background: std::window::Color{ red: 0.08, green: 0.10, blue: 0.12, alpha: 1.0 },
    has_background: true,
  };

  return match (std::window::run(options)) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
}
```

The same program is shipped as `examples/std_window_app.slk`.

## Window Options And Controls

`Options` keeps the simple `{ title, size }` shape as the minimum useful
window configuration. Additional fields have compile-time defaults, so callers
can opt into native behavior without helper-specific APIs:

- `positioned` plus `position` places the window at a provider screen
 coordinate.
- `min_size` and `max_size` apply native size constraints when both width and
 height are non-zero.
- `resizable`, `minimizable`, `maximizable`, `closable`, `frameless`, and
 `utility` map to native window chrome on providers that support those
 concepts.
- `visible` can create a hidden window for applications that want to configure
 it before showing it.
- `always_on_top` requests a floating window level.
- `has_background` plus `background` applies a normalized RGBA native
 background color.

After opening a window, applications can use `show`, `hide`, `focus`, `blur`,
`minimize`, `maximize`, `restore`, `set_title`, `set_size`, `size`,
`set_position`, `position`, `set_always_on_top`, `is_always_on_top`,
`set_background`, and `is_visible`. These functions are part of the public
facade and are also exposed as `Window` methods, so normal application code can
write `window.set_title(...)`, `window.size()`, and `window.close()`. For
interactive applications, prefer `run_loop(...)` so the stdlib owns open,
event-poll, and close sequencing while application code receives a `Window`
inside the frame callback. Examples and applications should not call
`std::runtime::window` directly.

```silk
import std::task;
import std::window;

fn frame (window: std::window::Window) -> int {
  let title_code = match (window.set_title("Ready - close the window to exit")) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
  if title_code != 0 {
    return title_code;
  }

  let resize_code = match (window.set_size(std::window::Size{ width: 560, height: 340 })) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
  if resize_code != 0 {
    return resize_code;
  }

  match (window.size()) {
    Ok(current) => {
      if current.width <= 0 || current.height <= 0 {
        return 40;
      }
    },
    Err(failed) => {
      return failed.code;
    },
  };

  std::task::sleep_ms(16);
  return 0;
}

fn main () -> int {
  let options = std::window::Options{
    title: "Silk Window Controls",
    size: std::window::Size{ width: 520, height: 320 },
    min_size: std::window::Size{ width: 360, height: 240 },
    positioned: true,
    position: std::window::Position{ x: 80, y: 360 },
    background: std::window::Color{ red: 0.04, green: 0.14, blue: 0.22, alpha: 1.0 },
    has_background: true,
  };

  return match (std::window::run_loop(options, frame)) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
}
```

The fuller interactive control example is shipped as
`examples/std_window_controls.slk`; it remains open until the user closes the
window.

For frame-rendering demos, use `run_loop(options, frame)`. The stdlib owns the
provider lifecycle and the application provides only per-frame behavior:

```silk
import std::graphics::window;
import std::window;

fn draw_frame (window: std::window::Window) -> int {
  let color = std::graphics::window::ClearColor{
    red: 0.05,
    green: 0.20,
    blue: 0.85,
    alpha: 1.0,
  };

  return match (std::graphics::window::clear(window, color)) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
}

fn main () -> int {
  let options = std::window::Options{
    title: "Silk Metal Window",
    size: std::window::Size{ width: 800, height: 520 },
  };

  return match (std::window::run_loop(options, draw_frame)) {
    Ok(_) => 0,
    Err(failed) => failed.code,
  };
}
```

The same pattern is shipped as `examples/std_macos_metal_window.slk`.

On macOS, `run(...)` opens an AppKit window, activates the application, and
blocks in the platform event loop until the user closes the last window.
`run_loop(...)` opens a provider window, polls events through
`next_event(...)`, calls the supplied frame callback while the window remains
open, and always routes cleanup through `close(...)`. On iOS device and
simulator targets, `run(...)` enters `UIApplicationMain` with a
runtime-registered application delegate that creates a `UIWindow` and root
view controller from the supplied `Options`. UIKit launch applies the requested
title, frame size, visibility, and background color fields; desktop chrome and
positioning fields have no UIKit equivalent and remain no-ops on iOS.

On Linux, `run(...)` opens a GTK window and blocks in `gtk_main()` until that
window is destroyed. `run_loop(...)` uses the same `open(...)` and
`next_event(...)` surface as macOS: GTK events are drained without blocking,
provider-only events report `EventKind::Provider`, and destroying or hiding
the window reports `EventKind::CloseRequested`. GTK applies title, size,
minimum/maximum size hints, visibility, positioning, always-on-top, background
color, resizable/decorated state, and closable state where the active window
manager honors those GTK hints. `blur(...)` is a successful no-op on GTK
because focus transfer is controlled by the window manager.

When the CLI builds an iOS executable whose reachable module graph includes
`std::window`, it keeps the requested executable at `-o <output>` and also
creates `<output>.app` next to it. The app bundle contains the executable,
`Info.plist`, and `PkgInfo`; on macOS hosts it is ad-hoc signed after
materialization. No extra CLI flag is required.

## Manual Event Loop API

`run_loop(...)` should be the default stdlib API for applications that need a
per-frame callback. `open(...)`, `next_event(...)`, and `close(...)` remain the
portable nonblocking event surface for applications that need custom lifecycle
control.

It returns:

- `EventKind::NoEvent` when no provider event is immediately available,
- `EventKind::Provider` when the provider consumed an event that does not yet
 have a portable payload,
- `EventKind::CloseRequested` when the provider-owned window is no longer
 visible and the portable loop should stop.

On macOS, `next_event(...)` pumps at most one AppKit event, updates AppKit
windows, and checks the underlying `NSWindow` visibility. On Linux, it drains
one pending GTK event when available, checks the provider record for destroy
notifications, and reports close when the window is no longer visible. On iOS,
nonblocking event delivery is owned by `UIApplicationMain`, so direct
`next_event(...)` returns `Err(ApplicationLifecycleRequired)` for a valid
bootstrap handle. On unsupported targets, `next_event(...)` returns
`Err(UnsupportedPlatform)`.
`poll(...)` and `close(...)` perform the same provider-availability check
before calling the runtime, so unsupported targets report
`Err(UnsupportedPlatform)` instead of a generic runtime failure.

## Current Runtime Behavior

`open(...)` validates dimensions, optional size constraints, and color ranges,
checks provider availability, and returns a window value containing the provider
handle plus the requested logical size, title, and position. On macOS the
handle is a provider-owned AppKit `NSWindow`. Creation options are applied
before the window is shown when possible, `next_event(...)` pumps one AppKit
event, `poll(...)` updates AppKit windows for compatibility, control functions
route to `NSWindow`, and `close(...)` closes that window. On Linux, the handle
is a bundled runtime record around a GTK top-level window; GTK libraries are
loaded with `dlopen`, so builds do not need GTK headers and unrelated programs
do not link GTK. On iOS, `run(...)` is the owned lifecycle entrypoint; direct
`open(...)` remains a bootstrap capability handle because UIKit windows and
events must be created and delivered under application lifecycle ownership.
Direct control calls on that handle report `ApplicationLifecycleRequired`. The
lifecycle-owned `run(...)` path carries title, requested size, visibility, and
background color into the UIKit launch delegate.

When reachable code calls the `std::window` runtime on host-backed Mach-O
targets, the compiler links the matching provider framework:

- `AppKit` for `macos-aarch64`,
- `UIKit` for `ios-aarch64`, `ios-simulator-aarch64`, and
 `ios-simulator-x86_64`.

When reachable code calls the `std::window` runtime on Linux/x86_64, the
compiler statically links the bundled runtime archive and adds the dynamic
loader API provider needed by the GTK shim (`libdl.so.2` on glibc targets,
`libc.so` on musl targets). GTK itself remains a runtime-loaded provider:
missing GTK libraries or a missing display connection make
`backend() == Backend::Unsupported`.

The next implementation steps are:

- richer portable input-event payloads plus surface and rendering integration
 on top of the current visible-window providers.
- explicit UIKit lifecycle callbacks for application-authored post-launch
 window mutations after `UIApplicationMain` has created the provider-owned
 window.

## Relationship To `std::graphics`

`std::graphics` exposes low-level rendering API bindings such as OpenGL,
OpenGL ES, and Vulkan. It intentionally does not own windows, surfaces, or
event loops. `std::window` is the higher layer responsible for platform window
bootstrap and eventual surface/context integration.
