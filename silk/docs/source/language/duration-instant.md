# `Duration` & `Instant`

`Duration` and `Instant` are time-related types with special literal and operator support.

Key ideas:

- `Duration` represents a signed time span.
- `Instant` represents a signed point-in-time on a monotonic timeline (an opaque
  epoch chosen by the runtime).
- Duration literals represent time spans with unit suffixes and are converted into
  integral ticks.
- Operators cover arithmetic, comparisons, and construction from scalars.

## Representation (Implemented)

In the current compiler/backend subset:

- `Duration` is represented as a signed 64-bit integer count of **nanoseconds**.
- `Instant` is represented as a signed 64-bit integer count of **nanoseconds**
  since a monotonic, runtime-defined origin.

These are distinct Silk types in the type system, but share the same underlying
scalar representation (`i64`) at the IR and native ABI layers.

## Operators (Implemented Subset)

Supported operator subset:

- `Duration + Duration -> Duration`
- `Duration - Duration -> Duration`
- `-Duration -> Duration`

- `Instant + Duration -> Instant`
- `Duration + Instant -> Instant`
- `Instant - Duration -> Instant`
- `Instant - Instant -> Duration`

- Comparisons (`==`, `!=`, `<`, `<=`, `>`, `>=`) are supported for:
  - `Duration` vs `Duration`
  - `Instant` vs `Instant`

Other arithmetic (`*`, `/`, `%`) and bitwise operators are not defined for time
types in the implemented subset.

## Overflow (Implemented)

Arithmetic uses the same deterministic wrapping behavior as the underlying
`i64` operations in the current back-end subset (two’s complement wraparound).

## Future Work

At maturity, this document will be expanded to fully specify:

- duration/instant division semantics and rounding rules,
- checked/saturating variants exposed by the standard library,
- the precise relationship between `Instant` and the platform clock APIs,
- and FFI-safe conversions and APIs in `std::temporal`.

Compiler requirements:

- Implement type-checking and lowering for the operator subset above.
- Implement duration literal parsing as specified in `docs/language/literals-duration.md`.
- Integrate with `std::temporal` in the standard library.
