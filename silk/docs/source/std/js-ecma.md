# ECMAScript FFI (`std::js::ecma`)

Status: **Implemented subset (interface + initial std wrapper)**.

This module defines a small, environment-agnostic interface for interacting
with an ECMAScript engine from Silk.

Scope constraints:

- **ECMAScript only**: this module intentionally exposes **no** DOM/Web APIs, no
  Node.js APIs, and no host-environment globals beyond what ECMAScript itself
  requires to exist on the global object.
- It is intended as a shared substrate for future tooling such as `silk bindgen`
  (for example: **Web IDL → Silk** bindings when targeting WASM and calling out
  to a JavaScript host).

## High-Level API

The public Silk surface is centered around:

- `Context` — an execution context / realm handle.
- `Value` — a JS value handle (primitives and objects).
- `Error` — a typed error representing host failures or thrown JS exceptions.

The API is intentionally minimal but ergonomic:

- obtain a default context (`Context.default_ctx()`),
- access the global object (`ctx.global()`),
- get/set properties (`ctx.get(obj, name)`, `ctx.set(obj, name, value)`),
- call functions and constructors (`ctx.call(...)`, `ctx.construct(...)`),
- convert common primitives (`ctx.bool(...)`, `ctx.f64(...)`, `ctx.string_utf8(...)`),
- convert values to UTF‑8 (`ctx.to_utf8_string(value)`).

## Naming Conventions (camelCase vs snake_case)

JavaScript global objects use `camelCase` naming conventions for functions and
methods, but Silk style is `snake_case`.

`std::js::ecma` exposes `snake_case` names for JavaScript intrinsics.
Additionally, acronyms within a method name are all lower case. For example,
JavaScript `decodeURI` is exposed as Silk `decode_uri`.

## `js_sys`-Modeled Surface (ECMAScript Intrinsics)

On top of the minimal `Context`/`Value`/`Error` API, `std::js::ecma` provides
names for common ECMAScript-standard globals (modeled after Rust’s `js_sys`).

Important constraints:

- **No environment APIs**: no DOM/Web APIs, no Node.js APIs, and no other
  host-specific globals.
- These bindings are intentionally shallow: they define stable names and small
  helpers; most behavior is accessed via `get`/`call` against the underlying JS
  values.

### Provided Names

Modules / global objects:

- `Atomics`
- `Intl`
- `JSON`
- `Math`
- `Reflect`
- `WebAssembly` (when provided by the host)

Struct-style JS value wrappers:

- `Array`, `Object`, `Function`, `Number`, `Boolean`, `Symbol`, `JsString`
- `Promise`, `Proxy`
- `Map`, `Set`, `WeakMap`, `WeakSet`, `WeakRef`
- `RegExp`, `Date`
- `Error`, `EvalError`, `RangeError`, `ReferenceError`, `SyntaxError`,
  `TypeError`, `UriError`
- `ArrayBuffer`, `SharedArrayBuffer`, `DataView`
- Typed arrays: `Int8Array`, `Int16Array`, `Int32Array`, `Uint8Array`,
  `Uint8ClampedArray`, `Uint16Array`, `Uint32Array`, `Float32Array`,
  `Float64Array`, `BigInt64Array`, `BigUint64Array`
- BigInt: `BigInt`
- Iteration protocol: `Iterator`, `IteratorNext`, `Iter`, `IntoIter`,
  `ArrayIter`, `ArrayIntoIter`, `AsyncIterator`, `Generator`
- Conversion placeholder: `TryFromIntError`

Global functions (snake_case):

- `decode_uri`, `decode_uri_component`
- `encode_uri`, `encode_uri_component`
- `escape`, `unescape`
- `eval`
- `global`
- `is_finite`
- `parse_float`, `parse_int`
- `try_iter`

## The “Silk Ext JavaScript Standard Interface”

This std module is implemented on top of a required set of `ext` symbols that
must be provided by the embedding environment.

Two common implementation strategies:

- **WASM host**: provide the symbols as imported wasm functions (the compiler
  maps `ext foo = ...;` to `env.foo`).
- **Native embedder**: provide the symbols in a linked library that uses an
  engine such as JavaScriptCore, QuickJS, or V8.

### Handle Model

All handles are represented as `u64` at the ABI boundary:

- `ctx: u64` — a context handle (must be non-zero).
- `value: u64` — a value handle (must be non-zero).

`0` is reserved as an invalid handle and is used as the failure sentinel for
`u64`-returning operations.

Implementers define the concrete meaning of handles (pointers, indices into a
table, tagged integers, etc.) but MUST keep them stable for as long as the
handle is “retained” by Silk.

### Error Reporting Contract

Operations that can fail either:

- return `0` (for `u64` results), or
- return non-zero (for `int` results),

and in that case the implementation MUST set a per-context “last error” record
retrievable via `silk_js_error_code` / `silk_js_error_take_exception`.

Error codes are stable integers:

- `0` — no error / unknown (should not be observed after a failing call)
- `1` — a JS exception was thrown (`silk_js_error_take_exception` returns the thrown value)
- `2` — out of memory / allocation failure in the host
- `3` — invalid handle / wrong realm / misuse detected by the host
- `4` — not implemented by this host

Notes:

- For iterator helpers (e.g. `try_iter`), implementations SHOULD return a
  canonical, stable handle for `undefined` and `null` per-context so equality
  checks against `silk_js_undefined` / `silk_js_null` work as expected.

### Required External Symbols (v0)

These symbols are required by `std::js::ecma` (external names are fixed
and stable):

```silk
// Context / lifetime
ext silk_js_ctx_default = fn () -> u64;
ext silk_js_retain = fn (u64, u64) -> void;
ext silk_js_release = fn (u64, u64) -> void;

// Error retrieval (after a failing call)
ext silk_js_error_code = fn (u64) -> int;
ext silk_js_error_take_exception = fn (u64) -> u64;

// Common primitives
ext silk_js_undefined = fn (u64) -> u64;
ext silk_js_null = fn (u64) -> u64;
ext silk_js_bool = fn (u64, bool) -> u64;
ext silk_js_i64 = fn (u64, i64) -> u64;
ext silk_js_f64 = fn (u64, f64) -> u64;
ext silk_js_string_utf8 = fn (u64, string) -> u64;

// Global + property access
ext silk_js_global = fn (u64) -> u64;
ext silk_js_get = fn (u64, u64, string) -> u64;
ext silk_js_set = fn (u64, u64, string, u64) -> int;

// Calls
ext silk_js_call = fn (u64, u64, u64, u64, i64) -> u64;
ext silk_js_construct = fn (u64, u64, u64, i64) -> u64;

// String extraction
ext silk_js_to_string = fn (u64, u64) -> u64;
ext silk_js_string_utf8_len = fn (u64, u64) -> i64;
ext silk_js_string_utf8_write = fn (u64, u64, u64, i64) -> i64;
```

Notes:

- In the current compiler subset, passing a Silk `string` to `ext` lowers as a
  NUL-terminated `const char *`. Therefore `silk_js_string_utf8` expects UTF‑8
  without embedded NUL bytes.
- The `*_write` function copies **raw UTF‑8 bytes** (no NUL terminator) into the
  destination buffer and returns the number of bytes written.

## Future Work

Expected follow-ups as `silk bindgen` becomes concrete:

- richer conversions (arrays, maps, typed arrays / `ArrayBuffer` via a separate
  environment-specific layer),
- promise integration (job queue hooks),
- structured cloning / JSON convenience helpers on top of ECMAScript intrinsics,
- a codegen layer that maps Web IDL types onto `std::js::ecma` calls.
