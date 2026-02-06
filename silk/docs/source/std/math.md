# `std::math`

Status: **Design + initial implementation**. This module provides linear
algebra utilities intended for graphics and general-purpose computation.

The initial focus is:

- vectors and matrices (fixed-size and dynamic-dimension),
- predictable, SIMD-friendly layouts (contiguous storage for dynamic forms),
- safe shape-checking APIs for dynamic operations.

Longer-term, `std::math` will also grow:

- fast SIMD implementations for hot operations,
- trig and transcendental functions (sin/cos/exp/log),
- higher-precision scalar support (`f128`, `u128`) for advanced numeric work and
  future tensor integration. The primitives are part of the supported native
  backend subset; `std::math` will add `f128`-based surfaces incrementally as
  needed.

See also:

- `docs/std/vector.md` (`std::vector::Vector(T)` used for dynamic storage)
- `docs/std/arrays.md` (`std::arrays::Slice(T)` views)

## Module Structure

- `std::math` (this file) is the user-facing entrypoint.
- `std::math::vector` contains vector types and operations.
- `std::math::matrix` contains matrix types and operations.

## Error Model

Dynamic-dimension operations return `Result(T, MathFailed)` when shapes are
incompatible (for example adding vectors of different lengths).

## Current API (Initial Subset)

```silk
module std::math;

import std::math::vector;
import std::math::matrix;

// Re-export core types for ergonomic imports.
export type Vec2f = std::math::vector::Vec2f;
export type Vec3f = std::math::vector::Vec3f;
export type Vec4f = std::math::vector::Vec4f;
export type Vec2d = std::math::vector::Vec2d;
export type Vec3d = std::math::vector::Vec3d;
export type Vec4d = std::math::vector::Vec4d;
export type VectorF32 = std::math::vector::VectorF32;
export type VectorF64 = std::math::vector::VectorF64;

export type Mat2f = std::math::matrix::Mat2f;
export type Mat3f = std::math::matrix::Mat3f;
export type Mat4f = std::math::matrix::Mat4f;
export type Mat2d = std::math::matrix::Mat2d;
export type Mat3d = std::math::matrix::Mat3d;
export type Mat4d = std::math::matrix::Mat4d;
export type MatrixF32 = std::math::matrix::MatrixF32;
export type MatrixF64 = std::math::matrix::MatrixF64;

export type MathError = std::math::vector::MathFailed;

export type F32Result = std::math::vector::F32Result;
export type F64Result = std::math::vector::F64Result;
export type BoolResult = std::math::vector::BoolResult;
export type VectorF32Result = std::math::vector::VectorF32Result;
export type VectorF64Result = std::math::vector::VectorF64Result;
export type MatrixF32Result = std::math::matrix::MatrixF32Result;
export type MatrixF64Result = std::math::matrix::MatrixF64Result;
```

`std::math::vector` (initial subset):

```silk
module std::math::vector;

import std::result;
import std::vector;

export enum MathErrorKind {
  InvalidInput,
  ShapeMismatch,
  OutOfMemory,
}

export error MathFailed {
  kind: MathErrorKind,
}

export struct Vec2f { x: f32, y: f32 }
export struct Vec3f { x: f32, y: f32, z: f32 }
export struct Vec4f { x: f32, y: f32, z: f32, w: f32 }

export struct Vec2d { x: f64, y: f64 }
export struct Vec3d { x: f64, y: f64, z: f64 }
export struct Vec4d { x: f64, y: f64, z: f64, w: f64 }

impl Vec2f {
  public fn add (self: &Vec2f, rhs: Vec2f) -> Vec2f;
  public fn sub (self: &Vec2f, rhs: Vec2f) -> Vec2f;
  public fn scale (self: &Vec2f, s: f32) -> Vec2f;
  public fn dot (self: &Vec2f, rhs: Vec2f) -> f32;
  public fn hadamard (self: &Vec2f, rhs: Vec2f) -> Vec2f;
  public fn length_squared (self: &Vec2f) -> f32;
  public fn distance_squared (self: &Vec2f, rhs: Vec2f) -> f32;
  public fn lerp (self: &Vec2f, rhs: Vec2f, t: f32) -> Vec2f;
}

impl Vec3f {
  public fn add (self: &Vec3f, rhs: Vec3f) -> Vec3f;
  public fn sub (self: &Vec3f, rhs: Vec3f) -> Vec3f;
  public fn scale (self: &Vec3f, s: f32) -> Vec3f;
  public fn dot (self: &Vec3f, rhs: Vec3f) -> f32;
  public fn cross (self: &Vec3f, rhs: Vec3f) -> Vec3f;
  public fn hadamard (self: &Vec3f, rhs: Vec3f) -> Vec3f;
  public fn length_squared (self: &Vec3f) -> f32;
  public fn distance_squared (self: &Vec3f, rhs: Vec3f) -> f32;
  public fn lerp (self: &Vec3f, rhs: Vec3f, t: f32) -> Vec3f;
}

impl Vec4f {
  public fn add (self: &Vec4f, rhs: Vec4f) -> Vec4f;
  public fn sub (self: &Vec4f, rhs: Vec4f) -> Vec4f;
  public fn scale (self: &Vec4f, s: f32) -> Vec4f;
  public fn dot (self: &Vec4f, rhs: Vec4f) -> f32;
  public fn hadamard (self: &Vec4f, rhs: Vec4f) -> Vec4f;
  public fn length_squared (self: &Vec4f) -> f32;
  public fn distance_squared (self: &Vec4f, rhs: Vec4f) -> f32;
  public fn lerp (self: &Vec4f, rhs: Vec4f, t: f32) -> Vec4f;
}

impl Vec2d {
  public fn add (self: &Vec2d, rhs: Vec2d) -> Vec2d;
  public fn sub (self: &Vec2d, rhs: Vec2d) -> Vec2d;
  public fn scale (self: &Vec2d, s: f64) -> Vec2d;
  public fn dot (self: &Vec2d, rhs: Vec2d) -> f64;
  public fn hadamard (self: &Vec2d, rhs: Vec2d) -> Vec2d;
  public fn length_squared (self: &Vec2d) -> f64;
  public fn distance_squared (self: &Vec2d, rhs: Vec2d) -> f64;
  public fn lerp (self: &Vec2d, rhs: Vec2d, t: f64) -> Vec2d;
}

impl Vec3d {
  public fn add (self: &Vec3d, rhs: Vec3d) -> Vec3d;
  public fn sub (self: &Vec3d, rhs: Vec3d) -> Vec3d;
  public fn scale (self: &Vec3d, s: f64) -> Vec3d;
  public fn dot (self: &Vec3d, rhs: Vec3d) -> f64;
  public fn cross (self: &Vec3d, rhs: Vec3d) -> Vec3d;
  public fn hadamard (self: &Vec3d, rhs: Vec3d) -> Vec3d;
  public fn length_squared (self: &Vec3d) -> f64;
  public fn distance_squared (self: &Vec3d, rhs: Vec3d) -> f64;
  public fn lerp (self: &Vec3d, rhs: Vec3d, t: f64) -> Vec3d;
}

impl Vec4d {
  public fn add (self: &Vec4d, rhs: Vec4d) -> Vec4d;
  public fn sub (self: &Vec4d, rhs: Vec4d) -> Vec4d;
  public fn scale (self: &Vec4d, s: f64) -> Vec4d;
  public fn dot (self: &Vec4d, rhs: Vec4d) -> f64;
  public fn hadamard (self: &Vec4d, rhs: Vec4d) -> Vec4d;
  public fn length_squared (self: &Vec4d) -> f64;
  public fn distance_squared (self: &Vec4d, rhs: Vec4d) -> f64;
  public fn lerp (self: &Vec4d, rhs: Vec4d, t: f64) -> Vec4d;
}

// Dynamic-dimension vector (owning).
export struct VectorF32 {
  data: std::vector::Vector(f32),
}

export struct VectorF64 {
  data: std::vector::Vector(f64),
}

export type VectorF32Result = std::result::Result(VectorF32, MathFailed);
export type F32Result = std::result::Result(f32, MathFailed);
export type VectorF64Result = std::result::Result(VectorF64, MathFailed);
export type F64Result = std::result::Result(f64, MathFailed);
export type BoolResult = std::result::Result(bool, MathFailed);

impl VectorF32 {
  public fn empty () -> VectorF32;
  public fn init (len: i64) -> VectorF32Result;
  public fn len (self: &VectorF32) -> i64;
  public fn as_slice (self: &VectorF32) -> std::arrays::Slice(f32);
  public fn get (self: &VectorF32, index: i64) -> f32;
  public fn set (mut self: &VectorF32, index: i64, value: f32) -> void;
  public fn fill (mut self: &VectorF32, value: f32) -> void;

  public fn add (self: &VectorF32, rhs: &VectorF32) -> VectorF32Result;
  public fn sub (self: &VectorF32, rhs: &VectorF32) -> VectorF32Result;
  public fn add_in_place (mut self: &VectorF32, rhs: &VectorF32) -> BoolResult;
  public fn sub_in_place (mut self: &VectorF32, rhs: &VectorF32) -> BoolResult;
  public fn scale (self: &VectorF32, s: f32) -> VectorF32Result;
  public fn scale_in_place (mut self: &VectorF32, s: f32) -> void;
  public fn dot (self: &VectorF32, rhs: &VectorF32) -> F32Result;
}

impl VectorF64 {
  public fn empty () -> VectorF64;
  public fn init (len: i64) -> VectorF64Result;
  public fn len (self: &VectorF64) -> i64;
  public fn as_slice (self: &VectorF64) -> std::arrays::Slice(f64);
  public fn get (self: &VectorF64, index: i64) -> f64;
  public fn set (mut self: &VectorF64, index: i64, value: f64) -> void;
  public fn fill (mut self: &VectorF64, value: f64) -> void;

  public fn add (self: &VectorF64, rhs: &VectorF64) -> VectorF64Result;
  public fn sub (self: &VectorF64, rhs: &VectorF64) -> VectorF64Result;
  public fn add_in_place (mut self: &VectorF64, rhs: &VectorF64) -> BoolResult;
  public fn sub_in_place (mut self: &VectorF64, rhs: &VectorF64) -> BoolResult;
  public fn scale (self: &VectorF64, s: f64) -> VectorF64Result;
  public fn scale_in_place (mut self: &VectorF64, s: f64) -> void;
  public fn dot (self: &VectorF64, rhs: &VectorF64) -> F64Result;
}
```

`std::math::matrix` (initial subset):

```silk
module std::math::matrix;

import std::result;
import std::vector;
import std::math::vector;

export type MathFailed = std::math::vector::MathFailed;
export type MathErrorKind = std::math::vector::MathErrorKind;
export type F32Result = std::math::vector::F32Result;
export type BoolResult = std::math::vector::BoolResult;
export type VectorF32Result = std::math::vector::VectorF32Result;

export struct Mat2f { m00: f32, m01: f32, m10: f32, m11: f32 }
export struct Mat3f { /* row-major */ }
export struct Mat4f { /* row-major */ }

export struct Mat2d { m00: f64, m01: f64, m10: f64, m11: f64 }
export struct Mat3d { /* row-major */ }
export struct Mat4d { /* row-major */ }

impl Mat2f {
  public fn identity () -> Mat2f;
  public fn mul_vec2 (self: &Mat2f, v: std::math::vector::Vec2f) -> std::math::vector::Vec2f;
  public fn mul_mat2 (self: &Mat2f, rhs: Mat2f) -> Mat2f;
  public fn transpose (self: &Mat2f) -> Mat2f;
}

impl Mat3f {
  public fn identity () -> Mat3f;
  public fn mul_vec3 (self: &Mat3f, v: std::math::vector::Vec3f) -> std::math::vector::Vec3f;
  public fn mul_mat3 (self: &Mat3f, rhs: Mat3f) -> Mat3f;
  public fn transpose (self: &Mat3f) -> Mat3f;
}

impl Mat4f {
  public fn identity () -> Mat4f;
  public fn translation (tx: f32, ty: f32, tz: f32) -> Mat4f;
  public fn scale (sx: f32, sy: f32, sz: f32) -> Mat4f;
  public fn mul_vec4 (self: &Mat4f, v: std::math::vector::Vec4f) -> std::math::vector::Vec4f;
  public fn mul_mat4 (self: &Mat4f, rhs: Mat4f) -> Mat4f;
  public fn transpose (self: &Mat4f) -> Mat4f;
}

impl Mat2d {
  public fn identity () -> Mat2d;
  public fn mul_vec2 (self: &Mat2d, v: std::math::vector::Vec2d) -> std::math::vector::Vec2d;
  public fn mul_mat2 (self: &Mat2d, rhs: Mat2d) -> Mat2d;
  public fn transpose (self: &Mat2d) -> Mat2d;
}

impl Mat3d {
  public fn identity () -> Mat3d;
  public fn mul_vec3 (self: &Mat3d, v: std::math::vector::Vec3d) -> std::math::vector::Vec3d;
  public fn mul_mat3 (self: &Mat3d, rhs: Mat3d) -> Mat3d;
  public fn transpose (self: &Mat3d) -> Mat3d;
}

impl Mat4d {
  public fn identity () -> Mat4d;
  public fn translation (tx: f64, ty: f64, tz: f64) -> Mat4d;
  public fn scale (sx: f64, sy: f64, sz: f64) -> Mat4d;
  public fn mul_vec4 (self: &Mat4d, v: std::math::vector::Vec4d) -> std::math::vector::Vec4d;
  public fn mul_mat4 (self: &Mat4d, rhs: Mat4d) -> Mat4d;
  public fn transpose (self: &Mat4d) -> Mat4d;
}

// Dynamic-dimension matrix (row-major, owning).
export struct MatrixF32 {
  rows: i64,
  cols: i64,
  data: std::vector::Vector(f32), // length = rows * cols
}

export struct MatrixF64 {
  rows: i64,
  cols: i64,
  data: std::vector::Vector(f64), // length = rows * cols
}

export type MatrixF32Result = std::result::Result(MatrixF32, MathFailed);
export type MatrixF64Result = std::result::Result(MatrixF64, MathFailed);

impl MatrixF32 {
  public fn empty () -> MatrixF32;
  public fn init (rows: i64, cols: i64) -> MatrixF32Result;
  public fn as_slice (self: &MatrixF32) -> std::arrays::Slice(f32);
  public fn fill (mut self: &MatrixF32, value: f32) -> void;
  public fn at (self: &MatrixF32, row: i64, col: i64) -> F32Result;
  public fn set (mut self: &MatrixF32, row: i64, col: i64, value: f32) -> BoolResult;

  public fn add (self: &MatrixF32, rhs: &MatrixF32) -> MatrixF32Result;
  public fn sub (self: &MatrixF32, rhs: &MatrixF32) -> MatrixF32Result;
  public fn scale (self: &MatrixF32, s: f32) -> MatrixF32Result;
  public fn add_in_place (mut self: &MatrixF32, rhs: &MatrixF32) -> BoolResult;
  public fn sub_in_place (mut self: &MatrixF32, rhs: &MatrixF32) -> BoolResult;
  public fn scale_in_place (mut self: &MatrixF32, s: f32) -> void;
  public fn mul (self: &MatrixF32, rhs: &MatrixF32) -> MatrixF32Result; // matmul
  public fn mul_vec (self: &MatrixF32, rhs: &std::math::vector::VectorF32) -> VectorF32Result;
  public fn transpose (self: &MatrixF32) -> MatrixF32Result;
}

impl MatrixF64 {
  public fn empty () -> MatrixF64;
  public fn init (rows: i64, cols: i64) -> MatrixF64Result;
  public fn as_slice (self: &MatrixF64) -> std::arrays::Slice(f64);
  public fn fill (mut self: &MatrixF64, value: f64) -> void;
  public fn at (self: &MatrixF64, row: i64, col: i64) -> F64Result;
  public fn set (mut self: &MatrixF64, row: i64, col: i64, value: f64) -> BoolResult;

  public fn add (self: &MatrixF64, rhs: &MatrixF64) -> MatrixF64Result;
  public fn sub (self: &MatrixF64, rhs: &MatrixF64) -> MatrixF64Result;
  public fn scale (self: &MatrixF64, s: f64) -> MatrixF64Result;
  public fn add_in_place (mut self: &MatrixF64, rhs: &MatrixF64) -> BoolResult;
  public fn sub_in_place (mut self: &MatrixF64, rhs: &MatrixF64) -> BoolResult;
  public fn scale_in_place (mut self: &MatrixF64, s: f64) -> void;
  public fn mul (self: &MatrixF64, rhs: &MatrixF64) -> MatrixF64Result; // matmul
  public fn mul_vec (self: &MatrixF64, rhs: &std::math::vector::VectorF64) -> VectorF64Result;
  public fn transpose (self: &MatrixF64) -> MatrixF64Result;
}
```

## Notes on `f128` / `u128`

`std::math` intends to expose higher precision scalars for numeric work and
tensor integration. The language primitives `i128` / `u128` / `f128` are now
part of the supported native backend subset; `std::math` currently focuses on
`f32` and `f64` surfaces and will add higher-precision variants incrementally
as needed.
