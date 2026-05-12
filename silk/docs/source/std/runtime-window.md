# `std::runtime::window`

`std::runtime::window` is the low-level runtime boundary used by
`std::window`. It is not intended as the ergonomic application API; import
`std::window` or a platform facade under `std::window::*` instead.

## Exported API

```silk
module std::runtime::window;

export fn backend_code () -> int;
export fn open (width: int, height: int, title_ptr: u64, title_len: usize) -> u64;
export fn open_ex (
  width: int,
  height: int,
  title_ptr: u64,
  title_len: usize,
  flags: u64,
  x: int,
  y: int,
  min_width: int,
  min_height: int,
  max_width: int,
  max_height: int,
  background_red: f64,
  background_green: f64,
  background_blue: f64,
  background_alpha: f64
) -> u64;
export fn close (handle: u64) -> int;
export fn poll (handle: u64) -> int;
export fn next_event (handle: u64) -> int;
export fn show (handle: u64) -> int;
export fn hide (handle: u64) -> int;
export fn focus (handle: u64) -> int;
export fn blur (handle: u64) -> int;
export fn minimize (handle: u64) -> int;
export fn maximize (handle: u64) -> int;
export fn restore (handle: u64) -> int;
export fn is_visible (handle: u64) -> int;
export fn set_title (handle: u64, title_ptr: u64, title_len: usize) -> int;
export fn set_size (handle: u64, width: int, height: int) -> int;
export fn size_width (handle: u64) -> int;
export fn size_height (handle: u64) -> int;
export fn set_position (handle: u64, x: int, y: int) -> int;
export fn position_x (handle: u64) -> int;
export fn position_y (handle: u64) -> int;
export fn set_always_on_top (handle: u64, enabled: int) -> int;
export fn is_always_on_top (handle: u64) -> int;
export fn set_background (handle: u64, red: f64, green: f64, blue: f64, alpha: f64) -> int;
export fn screen_width () -> int;
export fn screen_height () -> int;
export fn run (width: int, height: int, title_ptr: u64, title_len: usize) -> int;
export fn run_ex (
  width: int,
  height: int,
  title_ptr: u64,
  title_len: usize,
  flags: u64,
  x: int,
  y: int,
  min_width: int,
  min_height: int,
  max_width: int,
  max_height: int,
  background_red: f64,
  background_green: f64,
  background_blue: f64,
  background_alpha: f64
) -> int;
```

## Backend Codes

- `0`: unsupported target.
- `1`: macOS.
- `2`: iOS.
- `3`: GTK.

## Runtime Boundary

On macOS, iOS, and Linux, the shipped runtime exports the corresponding C
symbols:

- `silk_rt_window_backend`
- `silk_rt_window_open`
- `silk_rt_window_open_ex`
- `silk_rt_window_close`
- `silk_rt_window_poll`
- `silk_rt_window_next_event`
- `silk_rt_window_run`
- `silk_rt_window_run_ex`
- `silk_rt_window_show`
- `silk_rt_window_hide`
- `silk_rt_window_focus`
- `silk_rt_window_blur`
- `silk_rt_window_minimize`
- `silk_rt_window_maximize`
- `silk_rt_window_restore`
- `silk_rt_window_is_visible`
- `silk_rt_window_set_title`
- `silk_rt_window_set_size`
- `silk_rt_window_size_width`
- `silk_rt_window_size_height`
- `silk_rt_window_set_position`
- `silk_rt_window_position_x`
- `silk_rt_window_position_y`
- `silk_rt_window_set_always_on_top`
- `silk_rt_window_is_always_on_top`
- `silk_rt_window_set_background`
- `silk_rt_window_screen_width`
- `silk_rt_window_screen_height`

On WASI, Windows, Android, and unknown targets, this module provides local
unsupported-provider stubs instead of declaring those extern symbols. That
keeps `std::window` usable for capability checks and unsupported-open handling
without requiring platform window libraries.

The current implementation is the Apple window provider boundary plus a Linux
GTK provider boundary and unsupported-provider stubs for other targets. It
returns a real AppKit `NSWindow` handle for `open(...)` / `open_ex(...)` on
macOS, applies AppKit creation options before showing the window when
requested, pumps one AppKit event through `next_event(...)`, exposes direct
AppKit controls for native window state, keeps iOS direct `open(...)` as a
bootstrap capability handle, and returns a bundled runtime record around a GTK
top-level window on Linux when GTK and a display connection are available.

`next_event(...)` returns:

- `0` when no event is immediately available,
- `1` when the provider-owned window is no longer visible,
- `2` when the provider consumed an event with no portable payload,
- `-2` when nonblocking event delivery is owned by the provider lifecycle,
- any other value for provider failure.

`run(...)` returns:

- `0` after a provider application loop exits normally,
- `-2` when a provider reports that app-bundle/lifecycle ownership is
 required outside the current entrypoint,
- any other value for provider failure.

Control functions return:

- `0` when a mutation succeeds,
- `1` / `0` for boolean queries such as `is_visible` and
 `is_always_on_top`,
- positive dimensions or coordinates for size/position queries,
- `-2` when the provider lifecycle owns the requested operation,
- `-1` for provider failure or unsupported targets.

On macOS, `silk_rt_window_run_ex` loads AppKit and the Objective-C runtime at
runtime, creates an `NSApplication` and `NSWindow`, applies size constraints,
chrome flags, visibility, positioning, always-on-top state, and background
color, and runs the AppKit event loop until the last window closes.
`silk_rt_window_next_event` uses the same AppKit runtime boundary to dequeue at
most one event, send it through `NSApplication`, update windows, and report a
close request when the `NSWindow` is no longer visible. On iOS executable
targets, `silk_rt_window_run_ex` loads UIKit and the Objective-C runtime,
registers a runtime
`UIApplicationDelegate`, calls `UIApplicationMain`, and creates a `UIWindow`
with a root view controller during application launch. The UIKit launch path
applies the requested title, frame size, visibility, and background color; the
desktop chrome, positioning, size-constraint, and always-on-top fields do not
have UIKit equivalents. The CLI supplies app-bundle ownership for
`std::window` iOS executables by materializing an adjacent `<output>.app`
bundle.

On Linux, `silk_rt_window_backend` loads GTK with `dlopen` and returns GTK only
when GTK can initialize a display connection. `silk_rt_window_open_ex` creates
a GTK top-level window, stores it in a bundled runtime record, applies the
portable creation options, connects the destroy signal, and returns that
record pointer as the opaque handle. `silk_rt_window_next_event` drains at most
one GTK event without blocking and reports close when the destroy signal has
run or the widget is no longer visible. `silk_rt_window_run_ex` opens a GTK
window and enters `gtk_main()` until the window is destroyed. The GTK provider
uses runtime-loaded symbols only; no GTK headers or link-time GTK libraries
are required to build Silk or unrelated programs.
