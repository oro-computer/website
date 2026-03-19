# `std::image`

Status: **Implemented**. `std::image` covers shared image types, color-space
helpers, and hosted PNG/JPEG codecs.

## Exported API

### Root module: `std::image`

`std::image` exports one shared image container:

- `ImageRGBA8`
  - fields:
    - `width: i64`
    - `height: i64`
    - `pixels: std::buffer::BufferU8`
  - methods:
    - `ImageRGBA8.invalid() -> ImageRGBA8`
    - `img.is_valid() -> bool`
    - `img.bytes_per_row() -> i64`
    - `img.drop() -> void`

`ImageRGBA8` stores tightly packed RGBA8 pixels in row-major order:
`width * height * 4` bytes.

### `std::image::color`

Value structs:

- `RGB`
- `RGBA32`
- `CMYK`
- `YCbCr`
- `Alpha`
- `Alpha16`
- `Gray`
- `Gray16`
- `RGBA`
- `RGBA64`
- `NRGBA`
- `NRGBA64`
- `NYCbCrA`

Union and conversion helpers:

- `Color`
- `rgba(c: Color) -> RGBA32`
- `cmyk_to_rgb(c, m, y, k) -> RGB`
- `rgb_to_cmyk(r, g, b) -> CMYK`
- `rgb_to_ycbcr(r, g, b) -> YCbCr`
- `ycbcr_to_rgb(y, cb, cr) -> RGB`

Concrete color methods:

- `Alpha.rgba() -> RGBA32`
- `Alpha16.rgba() -> RGBA32`
- `Gray.rgba() -> RGBA32`
- `Gray16.rgba() -> RGBA32`
- `RGBA.rgba() -> RGBA32`
- `RGBA64.rgba() -> RGBA32`
- `NRGBA.rgba() -> RGBA32`
- `NRGBA64.rgba() -> RGBA32`
- `CMYK.rgba() -> RGBA32`
- `YCbCr.rgba() -> RGBA32`
- `NYCbCrA.rgba() -> RGBA32`

Model and palette helpers:

- `Model`
- `model_func(f: fn (u64) -> u64) -> Model`
- `model_convert(m: &Model, c: Color) -> Color`
- `Palette`
  - `Palette.empty() -> Palette`
  - `Palette.init(ptr: u64, len: i64) -> Palette`
  - `p.index(c: Color) -> int`
  - `p.convert(c: Color) -> Color`

### `std::image::png`

Error constants:

- `ERR_INVALID_INPUT`
- `ERR_DECODE_FAILED`
- `ERR_ENCODE_FAILED`
- `ERR_BUFFER_TOO_SMALL`
- `ERR_OUT_OF_MEMORY`

Types:

- `PngFailed`
  - `err.kind() -> PngErrorKind`
- `ImageResult = std::result::Result(std::image::ImageRGBA8, PngFailed)`
- `BufferResult = std::result::Result(std::buffer::BufferU8, PngFailed)`

Functions:

- `decode_rgba8(bytes: std::arrays::ByteSlice) -> ImageResult`
- `encode_rgba8(pixels: std::arrays::ByteSlice, width: i64, height: i64) -> BufferResult`
- `encode_image_rgba8(img: &std::image::ImageRGBA8) -> BufferResult`

### `std::image::jpeg`

Error constants:

- `ERR_INVALID_INPUT`
- `ERR_INIT_FAILED`
- `ERR_DECODE_FAILED`
- `ERR_ENCODE_FAILED`
- `ERR_BUFFER_TOO_SMALL`
- `ERR_OUT_OF_MEMORY`

Types:

- `JpegFailed`
  - `err.kind() -> JpegErrorKind`
- `ImageResult = std::result::Result(std::image::ImageRGBA8, JpegFailed)`
- `BufferResult = std::result::Result(std::buffer::BufferU8, JpegFailed)`

Functions:

- `decode_rgba8(bytes: std::arrays::ByteSlice) -> ImageResult`
- `encode_rgba8(pixels: std::arrays::ByteSlice, width: i64, height: i64, quality: int = 90) -> BufferResult`
- `encode_image_rgba8(img: &std::image::ImageRGBA8, quality: int = 90) -> BufferResult`

## Examples

### Convert colors and use a palette

```silk
import std::image::color;

fn invert_rgba64_bits (bits: u64) -> u64 {
  let r: u64 = bits & 0xffff;
  let g: u64 = (bits >> 16) & 0xffff;
  let b: u64 = (bits >> 32) & 0xffff;
  let a: u64 = (bits >> 48) & 0xffff;

  return
    ((0xffff - r) & 0xffff) |
    (((0xffff - g) & 0xffff) << 16) |
    (((0xffff - b) & 0xffff) << 32) |
    ((a & 0xffff) << 48);
}

fn main () -> int {
  let ycc = std::image::color::rgb_to_ycbcr(255, 0, 0);
  let red = std::image::color::ycbcr_to_rgb(ycc.y, ycc.cb, ycc.cr);
  if red.r < 250 {
    return 1;
  }

  let values: std::image::color::RGBA64[2] = [
    std::image::color::RGBA64{ r: 0, g: 0, b: 0, a: 0xffff },
    std::image::color::RGBA64{ r: 0xffff, g: 0xffff, b: 0xffff, a: 0xffff },
  ];
  let palette = std::image::color::Palette.init(values as u64, 2);
  if palette.index(std::image::color::RGBA{ r: 250, g: 250, b: 250, a: 255 }) != 1 {
    return 2;
  }

  let model = std::image::color::model_func(invert_rgba64_bits);
  let inverted = std::image::color::model_convert(&model, std::image::color::RGBA{ r: 0, g: 0, b: 0, a: 255 });
  let rgba = std::image::color::rgba(inverted);
  if rgba.r != 0xffff || rgba.g != 0xffff || rgba.b != 0xffff {
    return 3;
  }

  return 0;
}
```

### Encode and decode a PNG image in memory

```silk
import std::buffer;
import std::image;
import std::image::png;
import std::runtime::mem;

fn main () -> int {
  let mut pixels = match std::buffer::BufferU8.init(16) {
    Ok(v) => v,
    Err(_) => return 1,
  };
  pixels.len = 16;

  let src: u8[16] = [
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 255, 255, 255,
  ];

  var i: i64 = 0;
  while i < 16 {
    std::runtime::mem::store_u8(pixels.ptr, i, (src as u8[](16))[i]);
    i = i + 1;
  }

  let img = std::image::ImageRGBA8{ width: 2, height: 2, pixels: pixels };
  let encoded = match std::image::png::encode_image_rgba8(&img) {
    Ok(v) => v,
    Err(_) => return 2,
  };
  let decoded = match std::image::png::decode_rgba8(encoded.as_bytes()) {
    Ok(v) => v,
    Err(_) => return 3,
  };

  if decoded.width != 2 || decoded.height != 2 {
    return 4;
  }

  return 0;
}
```

## Considerations

- The codec boundary is intentionally `RGBA8`. Use `std::image::color` to
  convert values before encoding or after decoding.
- `ImageRGBA8` and the codec output buffers are owning values. Call `drop()`
  when you release them early; otherwise scope exit handles cleanup.
- `Palette` is a non-owning view over caller-provided `RGBA64` values. The
  backing storage must outlive the palette.
- On the hosted `linux/x86_64` baseline, PNG and JPEG rely on vendored codec
  libraries built by `zig build deps`. `silk build` auto-links the staged codec
  archives when the corresponding modules are imported.
- PNG and JPEG decoding do not sandbox untrusted input. Apply caller-level
  limits for input size, time, and memory if you ingest attacker-controlled
  data.

## See also

- [`std::buffer`](?p=std/buffer)
- [`std::arrays`](?p=std/arrays)
- [`std::filesystem`](?p=std/filesystem)
