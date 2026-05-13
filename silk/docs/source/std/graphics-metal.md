# `std::graphics::metal`

Source: `std/graphics/metal.slk`

`std::graphics::metal` is the opt-in Metal facade for Silk applications. It
exposes typed opaque handles for the core Metal objects needed by native
windowed apps, keeps Objective-C and raw `silk_rt_*` symbols behind the runtime
module, and provides a high-level `Context` / `Frame` workflow for rendering
into `std::window` AppKit windows.

The shipped implementation currently supports macOS. Linux exposes the same
public package namespaces for import/type-checking, but runtime-facing operations
return `Err(MetalFailed{ code: UnsupportedPlatform })` without declaring Metal
runtime externs for that target. Other non-macOS targets keep the documented
capability checks and high-level unsupported results.

## Exported API

```silk
module std::graphics::metal;
import runtime_metal from "std/runtime/graphics/metal";
import mem from "std/runtime/mem";
import window from "std/window";

export type Handle = u64;
export type PixelFormat = u64;
export type LoadAction = u64;
export type StoreAction = u64;
export type ResourceOptions = u64;
export type PrimitiveType = u64;

export let PIXEL_FORMAT_INVALID: PixelFormat;
export let PIXEL_FORMAT_RGBA8_UNORM: PixelFormat;
export let PIXEL_FORMAT_RGBA8_UNORM_SRGB: PixelFormat;
export let PIXEL_FORMAT_BGRA8_UNORM: PixelFormat;
export let PIXEL_FORMAT_BGRA8_UNORM_SRGB: PixelFormat;

export let LOAD_ACTION_DONT_CARE: LoadAction;
export let LOAD_ACTION_LOAD: LoadAction;
export let LOAD_ACTION_CLEAR: LoadAction;

export let STORE_ACTION_DONT_CARE: StoreAction;
export let STORE_ACTION_STORE: StoreAction;
export let STORE_ACTION_MULTISAMPLE_RESOLVE: StoreAction;

export let RESOURCE_CPU_CACHE_MODE_DEFAULT_CACHE: ResourceOptions;
export let RESOURCE_CPU_CACHE_MODE_WRITE_COMBINED: ResourceOptions;
export let RESOURCE_STORAGE_MODE_SHARED: ResourceOptions;
export let RESOURCE_STORAGE_MODE_MANAGED: ResourceOptions;
export let RESOURCE_STORAGE_MODE_PRIVATE: ResourceOptions;

export let PRIMITIVE_TYPE_POINT: PrimitiveType;
export let PRIMITIVE_TYPE_LINE: PrimitiveType;
export let PRIMITIVE_TYPE_LINE_STRIP: PrimitiveType;
export let PRIMITIVE_TYPE_TRIANGLE: PrimitiveType;
export let PRIMITIVE_TYPE_TRIANGLE_STRIP: PrimitiveType;

export enum MetalErrorKind {
  UnsupportedPlatform,
  InvalidWindow,
  InvalidHandle,
  DeviceUnavailable,
  DrawableUnavailable,
  RuntimeFailed,
}

export error MetalFailed { code: int }

impl MetalFailed {
  public fn kind (self: &MetalFailed) -> MetalErrorKind;
}

export struct ClearColor { red: f64, green: f64, blue: f64, alpha: f64 }

export struct Device { handle: Handle }
export struct CommandQueue { handle: Handle }
export struct CommandBuffer { handle: Handle }
export struct Layer { handle: Handle }
export struct Drawable { handle: Handle }
export struct Texture { handle: Handle }
export struct RenderPassDescriptor { handle: Handle }
export struct RenderCommandEncoder { handle: Handle }
export struct Buffer { handle: Handle }
export struct Library { handle: Handle }
export struct Function { handle: Handle }
export struct RenderPipelineDescriptor { handle: Handle }
export struct RenderPipelineState { handle: Handle }

export struct ContextOptions {
  width: int,
  height: int,
  pixel_format: PixelFormat,
  framebuffer_only: bool,
}

export struct Context {
  device: Device,
  command_queue: CommandQueue,
  layer: Layer,
  options: ContextOptions,
}

export struct Frame {
  drawable: Drawable,
  texture: Texture,
  command_buffer: CommandBuffer,
  descriptor: RenderPassDescriptor,
  encoder: RenderCommandEncoder,
}

export type RenderResult = Result(bool, MetalFailed);
export type DeviceResult = Result(Device, MetalFailed);
export type CommandQueueResult = Result(CommandQueue, MetalFailed);
export type CommandBufferResult = Result(CommandBuffer, MetalFailed);
export type LayerResult = Result(Layer, MetalFailed);
export type DrawableResult = Result(Drawable, MetalFailed);
export type TextureResult = Result(Texture, MetalFailed);
export type RenderPassDescriptorResult = Result(RenderPassDescriptor, MetalFailed);
export type RenderCommandEncoderResult = Result(RenderCommandEncoder, MetalFailed);
export type BufferResult = Result(Buffer, MetalFailed);
export type LibraryResult = Result(Library, MetalFailed);
export type FunctionResult = Result(Function, MetalFailed);
export type RenderPipelineDescriptorResult = Result(RenderPipelineDescriptor, MetalFailed);
export type RenderPipelineStateResult = Result(RenderPipelineState, MetalFailed);
export type ContextResult = Result(Context, MetalFailed);
export type FrameResult = Result(Frame, MetalFailed);

export fn failed (kind: MetalErrorKind) -> MetalFailed;
export fn default_context_options (width: int, height: int) -> ContextOptions;
export fn is_supported () -> bool;

attr(os="macos") export fn release (handle: Handle) -> RenderResult;
attr(os="macos") export fn release_device (device: Device) -> RenderResult;
attr(os="macos") export fn release_command_queue (queue: CommandQueue) -> RenderResult;
attr(os="macos") export fn release_command_buffer (command_buffer: CommandBuffer) -> RenderResult;
attr(os="macos") export fn release_layer (layer: Layer) -> RenderResult;
attr(os="macos") export fn release_drawable (drawable: Drawable) -> RenderResult;
attr(os="macos") export fn release_texture (texture: Texture) -> RenderResult;
attr(os="macos") export fn release_render_pass_descriptor (descriptor: RenderPassDescriptor) -> RenderResult;
attr(os="macos") export fn release_render_command_encoder (encoder: RenderCommandEncoder) -> RenderResult;
attr(os="macos") export fn release_buffer (buffer: Buffer) -> RenderResult;
attr(os="macos") export fn release_library (library: Library) -> RenderResult;
attr(os="macos") export fn release_function (function: Function) -> RenderResult;
attr(os="macos") export fn release_render_pipeline_descriptor (descriptor: RenderPipelineDescriptor) -> RenderResult;
attr(os="macos") export fn release_render_pipeline_state (state: RenderPipelineState) -> RenderResult;

attr(os="macos") export fn create_system_default_device () -> DeviceResult;
attr(os="macos") export fn new_command_queue (device: Device) -> CommandQueueResult;
attr(os="macos") export fn window_layer (window: std::window::Window, device: Device, options: ContextOptions) -> LayerResult;
attr(os="macos") export fn set_drawable_size (layer: Layer, width: int, height: int) -> RenderResult;
attr(os="macos") export fn next_drawable (layer: Layer) -> DrawableResult;
attr(os="macos") export fn drawable_texture (drawable: Drawable) -> TextureResult;
attr(os="macos") export fn new_command_buffer (queue: CommandQueue) -> CommandBufferResult;
attr(os="macos") export fn create_render_pass_descriptor () -> RenderPassDescriptorResult;
attr(os="macos") export fn set_color_attachment (descriptor: RenderPassDescriptor, index: u64, texture: Texture, color: ClearColor, load_action: LoadAction, store_action: StoreAction) -> RenderResult;
attr(os="macos") export fn render_encoder (command_buffer: CommandBuffer, descriptor: RenderPassDescriptor) -> RenderCommandEncoderResult;
attr(os="macos") export fn end_encoding (encoder: RenderCommandEncoder) -> RenderResult;
attr(os="macos") export fn present (command_buffer: CommandBuffer, drawable: Drawable) -> RenderResult;
attr(os="macos") export fn commit (command_buffer: CommandBuffer) -> RenderResult;
attr(os="macos") export fn wait_until_completed (command_buffer: CommandBuffer) -> RenderResult;

attr(os="macos") export fn new_buffer (device: Device, length: u64, options: ResourceOptions) -> BufferResult;
attr(os="macos") export fn new_buffer_with_bytes (device: Device, bytes: u64, length: u64, options: ResourceOptions) -> BufferResult;
attr(os="macos") export fn new_library_with_source (device: Device, source: string) -> LibraryResult;
attr(os="macos") export fn new_function (library: Library, name: string) -> FunctionResult;
attr(os="macos") export fn create_render_pipeline_descriptor () -> RenderPipelineDescriptorResult;
attr(os="macos") export fn set_vertex_function (descriptor: RenderPipelineDescriptor, function: Function) -> RenderResult;
attr(os="macos") export fn set_fragment_function (descriptor: RenderPipelineDescriptor, function: Function) -> RenderResult;
attr(os="macos") export fn set_color_pixel_format (descriptor: RenderPipelineDescriptor, index: u64, pixel_format: PixelFormat) -> RenderResult;
attr(os="macos") export fn new_render_pipeline_state (device: Device, descriptor: RenderPipelineDescriptor) -> RenderPipelineStateResult;
attr(os="macos") export fn set_pipeline_state (encoder: RenderCommandEncoder, state: RenderPipelineState) -> RenderResult;
attr(os="macos") export fn set_vertex_buffer (encoder: RenderCommandEncoder, buffer: Buffer, offset: u64, index: u64) -> RenderResult;
attr(os="macos") export fn draw_primitives (encoder: RenderCommandEncoder, primitive_type: PrimitiveType, vertex_start: u64, vertex_count: u64) -> RenderResult;

export fn create_context (window: std::window::Window, options: ContextOptions) -> ContextResult;
export fn destroy_context (context: Context) -> RenderResult;
export fn begin_frame (context: Context, color: ClearColor) -> FrameResult;
export fn end_frame (frame: Frame) -> RenderResult;
export fn clear_with_context (context: Context, color: ClearColor) -> RenderResult;
export fn clear (window: std::window::Window, color: ClearColor) -> RenderResult;
export fn clear_window (window: std::window::Window, width: int, height: int, color: ClearColor) -> RenderResult;
```

## Semantics

- `is_supported()` returns `true` only on macOS targets where the bundled Metal
 runtime can load Objective-C, Metal, QuartzCore, and the needed AppKit layer
 integration.
- On Linux, the lower-level device, command, pipeline, buffer, draw, and
 release APIs are still importable from `std/graphics/metal`; each returns an
 `UnsupportedPlatform` failure and does not reference the Metal runtime.
- All object wrappers are opaque handles. A handle value of `0` is invalid.
- Functions named `create_*`, `new_*`, `next_drawable(...)`, and
 `drawable_texture(...)` return retained handles. Release them through the
 matching `release_*` function unless ownership is transferred to
 `destroy_context(...)` or `end_frame(...)`.
- `Context` owns a `Device`, `CommandQueue`, and `Layer`.
 `destroy_context(...)` releases those persistent objects.
- `Frame` owns a drawable, texture, command buffer, pass descriptor, and
 encoder. `end_frame(...)` ends encoding, presents, commits, waits for
 completion, and releases all frame objects.
- `begin_frame(...)` creates a render pass whose color attachment is configured
 with `LOAD_ACTION_CLEAR` and `STORE_ACTION_STORE`.
- `new_library_with_source(...)` compiles Metal Shading Language source from a
 Silk `string`. `new_function(...)` looks up a named function from that
 library. `create_render_pipeline_descriptor(...)`,
 `set_vertex_function(...)`, `set_fragment_function(...)`,
 `set_color_pixel_format(...)`, and `new_render_pipeline_state(...)` provide
 the render-pipeline setup path needed for visible triangle or quad examples.
- `new_buffer(...)`, `new_buffer_with_bytes(...)`, `set_vertex_buffer(...)`,
 and `draw_primitives(...)` provide the basic vertex-buffer draw path.
- `clear(...)` is a compatibility helper implemented through
 `create_context(...)`, `clear_with_context(...)`, and `destroy_context(...)`.

## Linking

Reachable calls to the macOS Metal runtime opt host-backed Mach-O executable
links into:

- `Metal.framework`,
- `QuartzCore.framework`.

When a Metal layer is attached to a visible `std::window` AppKit window, the
same executable also links `AppKit.framework` through `std::window` runtime
requirements.

## Runtime Boundary

`std::graphics::metal` routes provider calls through
`std::runtime::graphics::metal`. Application code should not declare Metal
runtime `ext` symbols or reference `silk_rt_*` names directly.

The runtime bridge is C99-safe: it exposes integers and opaque handles instead
of Objective-C protocol calls, by-value Metal structs, or SDK headers in Silk
code. This keeps the public stdlib API stable while allowing the runtime to
perform Objective-C message sends internally.

## Example

`examples/std_macos_metal_window.slk` opens a macOS `std::window` AppKit
window through the provider-neutral `std::graphics::window` facade, clears a
Metal layer with an animated color, and runs until the user closes the window.

`examples/std_macos_metal_triangle.slk` uses this module directly. It creates a
persistent Metal context, embeds adjacent Metal Shading Language source with
`#embed("std_macos_metal_triangle.metal")`, builds a render pipeline, calls
`begin_frame(...)`, sets the pipeline state, issues `draw_primitives(...)`, and
finishes with `end_frame(...)` each frame.
