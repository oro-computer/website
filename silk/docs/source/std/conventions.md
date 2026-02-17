# `std::` Conventions

Status: **Design + migration in progress**. This defines the intended
conventions for the Silk standard library. New and refactored `std::` APIs must
follow this document; older surfaces may temporarily diverge but
must be migrated as they are touched.

This document exists to keep `std::` APIs consistent across modules.

## Public vs Internal API

- Only `export` declarations are considered part of the stable public surface.
- Non-exported declarations are internal implementation details and may change
  freely.
- Internal helper packages may exist under names such as `std::internal::...`
  or `std::sys::...`, but these are not stable surfaces.

## Naming

- Packages use `std::area` naming (`std::strings`, `std::fs`, `std::net`).
- Types use `PascalCase` (`String`, `Vector(T)`, `Path`, `File`).
- Functions and methods use `snake_case` (`read_all`, `push`, `starts_with`).
- Constants use `SCREAMING_SNAKE_CASE`.

## Documentation

All user-facing `std::` APIs must be documented in source using doc comments
(`/** ... */` or `/// ...`) per `docs/language/doc-comments.md`.

Documentation coverage rules:

- Every **exported declaration** must have a non-empty doc comment:
  - exported functions (`export fn ...`),
  - exported bindings (`export let ...` / `export const ...`),
  - exported `ext` declarations (`export ext ...`),
  - exported type aliases (`export type ...`),
  - exported types (`export struct` / `export enum` / `export error` /
    `export interface`),
  - exported Formal Silk theories intended for reuse (for example under
    `std::formal`).
- Every **public method** on a type must have a non-empty doc comment:
  - instance and static methods declared `public fn ...` inside `impl`.

This is enforced by the test suite so the stdlib can be fully documented via
`silk doc` and surfaced consistently in editor tooling.

The canonical narrative/spec for each module lives under `docs/std/`. The
source-level doc comments are the machine-consumable layer used by `silk doc`,
`silk man`, and editor tooling (hover and completion documentation).

## Allocation and Ownership

`std::` should be explicit about allocation:

- Prefer allocation-free views (`Slice(T)`, `Str`) for APIs that can operate on
  borrowed data.
- Allocating APIs should accept an explicit allocator (or region) parameter, or
  clearly document which allocator is used.
- Avoid hidden global allocation in core functionality. Convenience helpers may
  exist, but must be clearly marked.

String ownership (initial design intent):

- The built-in `string` type is a UTF-8 byte sequence represented as a
  `{ ptr, len }` pair (see `docs/language/literals-string.md` and
  `docs/language/ext.md`).
- The stdlib provides an owned string builder/container (`String`) whose memory
  management is explicit and interoperable with `string`.

## Construction and Defaults

Public `std::` types should be easy to construct correctly, without callers
needing to know internal sentinel values or manually fill out large structs.

- Every public `std::` struct should provide an explicit “safe default” constructor:
  - container/builder types should provide `empty()` (preferred over requiring `init(0)`),
  - handle/resource types should provide `invalid()` (or an equivalent clearly-named constructor) and ensure methods either:
    - treat invalid handles as no-ops (for example `close`/`drop`), or
    - return a recoverable error (for example `InvalidInput`) rather than trapping.
- If a type’s primary constructor requires configuration (capacity, hash function pointers, etc.), provide a convenience constructor that uses a sensible default:
  - for capacity-driven containers: `empty()` and a parameterized constructor (`init(cap)` in the current subset; consider `with_capacity(cap)` long-term),
  - for option/config structs: a `default()` constructor or clearly-named presets (for example `read_only()` / `write_only()`).
- `Drop` types must be safe to drop in their default/empty/invalid state and should be idempotent when possible (invalidate the handle/pointer after freeing).
- Constructors must not silently “succeed” while discarding failures:
  - if `init(cap)` allocates, it must return a recoverable error (`Result(...)`
    or an optional error return) when allocation fails,
  - `empty()` exists for infallible construction.

## Errors

Silk supports both typed errors (`docs/language/typed-errors.md`) and
recoverable error values (`T?` and `std::result::Result(T, E)`). Public `std::`
APIs should follow these rules:

- Use `T?` when “absence” is the only meaningful error case and no additional
  error information is required (e.g. `pop() -> T?`).
- Use a result type when callers need to distinguish multiple error causes.
  The design target is `std::result::Result(T, E)` (see `docs/std/result.md`),
  with `Ok(T)` / `Err(E)` cases.
- Prefer that the **primary** API name returns `Result(...)` / optional error,
  rather than exporting parallel `*_result` variants.
- Callers that want to discard error details can:
  - compare an optional error return against `None`, or
  - for `Result(T, E)`:
    - prefer `match (r)` when `T` or `E` may implement `Drop`,
    - use `ResultType.ok_value(r)` / `unwrap(r)` / `unwrap_or(r, fallback)` / `err_value(r)` only when the active payload is copy-safe (does not implement `Drop`).
  Avoid exporting parallel `*_opt` helpers that hide error information.
- Do not use `bool` returns for fallible operations that can fail for multiple
  reasons; return an optional error (`ErrorType?`) or `Result(T, E)` instead.
- Keep OS/runtime-specific error mechanisms (such as POSIX `errno`) out of the
  public surface. Map them into stable, portable error kinds/codes in the
  top-level `std::` module and confine the platform details to `std::runtime`.
- Do not expose typed error contracts (`T | ErrorType...`) or `panic` for
  routine runtime failures such as I/O errors or parse failures. Prefer
  `Result(...)` or an optional error return (`ErrorType?` where `None` is
  success).
- Do not call `assert` / `std::abort()` from `std::` APIs. Malformed inputs,
  invariant violations, and resource exhaustion must be surfaced as recoverable
  errors.

## Concurrency and Thread Safety

Silk’s hosted `task` concurrency runs on OS threads. `std::` APIs must make it
obvious when values can safely cross task/thread boundaries.

Conventions:

- Prefer **immutable value types** (no interior mutation) for data that will be
  shared across tasks.
- For shared mutable state, require explicit synchronization via `std::sync`
  primitives (`Mutex`, `Condvar`, channels).
- For handle types that own runtime state, use the `T` / `TBorrow` pattern:
  - `T` is an owning, droppable handle (non-copyable in safe code),
  - `TBorrow` is a non-owning, copyable view intended for passing across tasks
    while keeping ownership with the creator.
- Cancellation must be explicit:
  - abortable operations should accept `std::abort_controller::AbortSignalBorrow`
    (often as an optional parameter),
  - callers should create and own an `AbortController` and call `abort()` to
    request cancellation.

## Formal Silk Contracts

`std::` should actively use Formal Silk to document and enforce invariants in
low-level code (buffers, parsing, and pointer/length handling):

- Prefer reusable theories from `std::formal` (for example `slice_well_formed`
  and `vector_well_formed`) over ad-hoc `#require` / `#assert` boilerplate.
- Contracts must reflect real runtime invariants (avoid over-strong
  preconditions that callers cannot prove). When handling untrusted inputs,
  validate at runtime and return a recoverable error value rather than relying
  on preconditions.
- See `docs/language/formal-verification.md` for the Formal Silk model. Note
  that the verifier currently skips `std::...` modules; contracts in `std::`
  are still valuable as precise documentation and for future verification work.

## UTF-8 and Text

- `string` is defined as UTF-8 bytes.
- APIs that operate on “characters” must be explicit about whether they mean:
  - bytes,
  - Unicode scalar values (`char`),
  - or grapheme clusters (locale/text-segmentation dependent).
- By default, indexing/slicing is byte-based and does not validate UTF-8 unless
  an API explicitly says it does.

## Platform Baselines

- Hosted baseline: POSIX behavior for filesystem, networking, and clocks.
- Freestanding baseline: no OS; only core modules are available.

Each hosted API must clearly document which POSIX calls it relies on and which
errors are surfaced to callers.
