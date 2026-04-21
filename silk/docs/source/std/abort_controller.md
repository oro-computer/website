# `std::abort_controller`

This is the canonical module doc for `std::abort_controller`.

`std::abort_controller` provides the WHATWG-style cooperative cancellation API
shipped in `std/abort_controller.slk`: `AbortController`, `AbortSignal`, and
`AbortSignalBorrow`.

The detailed API contract and semantics are documented in:

- [abort controller](?p=std/abort-controller)

Read that page as the complete public surface for:

- `AbortReasonKind`
- `AbortReason`
- `AbortController`
- `AbortSignal`
- `AbortSignalBorrow`
- `AbortControllerResult`
- cancellation semantics, ownership, and wait/wait-fd behavior

Related docs:

- [abort controller](?p=std/abort-controller)
- [task](?p=std/task)
- [stream](?p=std/stream)
- [concurrency](?p=language/concurrency)
