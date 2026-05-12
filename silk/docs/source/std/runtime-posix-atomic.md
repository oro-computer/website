# `std::runtime::posix::atomic`

`std::runtime::posix::atomic` is the hosted POSIX implementation module for
`std::runtime::atomic`.

This module is implementation-facing and should not be imported directly by
ordinary user code.

## Behavior

The module exposes `ext` declarations for runtime symbols implemented in
`src/silk_rt_atomic.c`, then re-exports narrow wrappers for
`std::runtime::atomic`.

The runtime symbols use native compiler atomic builtins for:

- `u64` load/store,
- `u64` swap,
- `u64` fetch-add/fetch-sub,
- `u64` compare-exchange,
- thread fences.

Invalid memory-order combinations are a checker error at the public
`std::atomic` layer. Runtime helpers still sanitize invalid load/store/failure
orders to a conservative sequentially consistent operation so malformed
low-level direct calls do not lower to ordinary non-atomic memory access.
