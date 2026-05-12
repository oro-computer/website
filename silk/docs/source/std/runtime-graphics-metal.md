# `std::runtime::graphics::metal`

`std::runtime::graphics::metal` is the low-level runtime boundary used by
`std::graphics::metal`. It is not the application API; application code should
import `std::graphics::metal` or `std::graphics::window` instead.

## Exported API

On macOS, the module declares the bundled C runtime ABI and exposes typed
wrappers for the public graphics facade:

```silk
module std::runtime::graphics::metal;

attr(os="macos") export fn is_supported () -> int;
attr(os="macos") export fn retain (handle: u64) -> u64;
attr(os="macos") export fn release (handle: u64) -> int;

attr(os="macos") export fn create_system_default_device () -> u64;
attr(os="macos") export fn device_new_command_queue (device: u64) -> u64;
attr(os="macos") export fn window_layer (
  window: u64,
  device: u64,
  width: int,
  height: int,
  pixel_format: u64,
  framebuffer_only: int
) -> u64;
attr(os="macos") export fn layer_set_drawable_size (layer: u64, width: int, height: int) -> int;
attr(os="macos") export fn layer_next_drawable (layer: u64) -> u64;
attr(os="macos") export fn drawable_texture (drawable: u64) -> u64;

attr(os="macos") export fn command_queue_command_buffer (queue: u64) -> u64;
attr(os="macos") export fn render_pass_descriptor_create () -> u64;
attr(os="macos") export fn render_pass_set_color_attachment (
  descriptor: u64,
  index: u64,
  texture: u64,
  red: f64,
  green: f64,
  blue: f64,
  alpha: f64,
  load_action: u64,
  store_action: u64
) -> int;
attr(os="macos") export fn command_buffer_render_encoder (command_buffer: u64, descriptor: u64) -> u64;
attr(os="macos") export fn render_encoder_end_encoding (encoder: u64) -> int;
attr(os="macos") export fn command_buffer_present_drawable (command_buffer: u64, drawable: u64) -> int;
attr(os="macos") export fn command_buffer_commit (command_buffer: u64) -> int;
attr(os="macos") export fn command_buffer_wait_until_completed (command_buffer: u64) -> int;

attr(os="macos") export fn device_new_buffer (device: u64, length: u64, options: u64) -> u64;
attr(os="macos") export fn device_new_buffer_with_bytes (device: u64, bytes: u64, length: u64, options: u64) -> u64;
attr(os="macos") export fn device_new_library_with_source (device: u64, source_ptr: u64, source_len: usize) -> u64;
attr(os="macos") export fn library_new_function (library: u64, name_ptr: u64, name_len: usize) -> u64;

attr(os="macos") export fn render_pipeline_descriptor_create () -> u64;
attr(os="macos") export fn render_pipeline_descriptor_set_vertex_function (descriptor: u64, function: u64) -> int;
attr(os="macos") export fn render_pipeline_descriptor_set_fragment_function (descriptor: u64, function: u64) -> int;
attr(os="macos") export fn render_pipeline_descriptor_set_color_pixel_format (descriptor: u64, index: u64, pixel_format: u64) -> int;
attr(os="macos") export fn device_new_render_pipeline_state (device: u64, descriptor: u64) -> u64;
attr(os="macos") export fn render_encoder_set_pipeline_state (encoder: u64, state: u64) -> int;
attr(os="macos") export fn render_encoder_set_vertex_buffer (encoder: u64, buffer: u64, offset: u64, index: u64) -> int;
attr(os="macos") export fn render_encoder_draw_primitives (encoder: u64, primitive_type: u64, vertex_start: u64, vertex_count: u64) -> int;

attr(os="macos") export fn clear_window (
  handle: u64,
  width: int,
  height: int,
  red: f64,
  green: f64,
  blue: f64,
  alpha: f64
) -> int;
```

## Runtime Boundary

The shipped runtime exports the matching `silk_rt_metal_*` C symbols from
`src/silk_rt_metal.c`. This module is the only stdlib source that declares
those symbols.

On iOS, Linux, WASI, Windows, Android, and unknown targets, this module declares
no runtime ABI functions. Unsupported-target behavior is implemented by the
public `std::graphics::metal` and `std::graphics::window` facades without
calling into this runtime shim.

Return conventions:

- Handle-returning functions return `0` on failure.
- Integer-returning command functions return `0` on success and non-zero on
 failure.
- `is_supported()` returns `1` when the runtime can load the required macOS
 Objective-C and Metal entry points, otherwise `0`.

## Ownership

The runtime returns retained Objective-C objects for all handle-producing calls
that cross into Silk. The public facade releases those handles through
`release(...)`, `destroy_context(...)`, or `end_frame(...)`.

The runtime bridge intentionally keeps Objective-C selectors, SDK headers,
Metal protocol types, and by-value SDK structs out of Silk's public ABI. It
uses opaque `u64` handles and scalar arguments so the facade remains compatible
with the current C99-safe FFI subset.
