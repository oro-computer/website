# `std::abort_controller`

This module provides a WHATWG-style
`AbortController` / `AbortSignal` pair for cooperative cancellation across
`async` functions and OS-thread-backed `task` concurrency.

The goal is to make cancellation **obvious and uniform** across the standard
library:

- APIs that can be aborted accept an `AbortSignalBorrow` (usually as an optional
 parameter).
- Callers create and own an `AbortController`, and pass `controller.signal()`
 to the operations they want to be able to abort.
- When a signal is aborted, operations stop early and return an `Aborted`
 error-kind in their module’s native error type.

Thread-safety:

- `AbortSignal` state is protected by a mutex + condition variable.
- `AbortSignalBorrow` is a non-owning, copyable handle intended for sharing
 across OS threads and `task` boundaries.

## Exported API
```silk
module std::abort_controller;

import interfaces from "std/interfaces";
import memory from "std/memory";
import result from "std/result";

export enum AbortReasonKind {
  Aborted,
  Message,
}

export struct AbortReason {
  kind: AbortReasonKind,
  message: string,
}

// Owns the abort state.
export struct AbortController {
  signal: AbortSignal,
}

// Owns the abort state (dropped/destroyed by the last owner).
export struct AbortSignal {
  handle: u64,
}

// Non-owning, copyable view of an abort signal.
export struct AbortSignalBorrow {
  handle: u64,
}

export type AbortControllerResult = std::result::Result(AbortController, std::memory::OutOfMemory);

impl AbortController {
  public fn init () -> AbortControllerResult;
  public fn signal (self: &AbortController) -> AbortSignalBorrow;
  public fn abort (self: &AbortController) -> void;
  public fn abort_with_message (self: &AbortController, message: string) -> std::memory::OutOfMemory?;
  public fn destroy (mut self: &AbortController) -> void;
}

impl AbortSignal {
  public fn invalid () -> AbortSignal;
  public fn is_valid (self: &AbortSignal) -> bool;
  public fn borrow (self: &AbortSignal) -> AbortSignalBorrow;
  public fn is_aborted (self: &AbortSignal) -> bool;
  public fn reason (self: &AbortSignal) -> AbortReason?;
  public fn wait_fd (self: &AbortSignal) -> int?;
  public fn wait (self: &AbortSignal) -> void;
  public fn destroy (mut self: &AbortSignal) -> void;
}

impl AbortSignalBorrow {
  public fn is_aborted (self: &AbortSignalBorrow) -> bool;
  public fn reason (self: &AbortSignalBorrow) -> AbortReason?;
  public fn wait_fd (self: &AbortSignalBorrow) -> int?;
  public fn wait (self: &AbortSignalBorrow) -> void;
}
```

## Semantics

- `AbortController.init()` creates an un-aborted signal.
- `AbortController.signal()` returns an `AbortSignalBorrow` that points to the
 controller’s underlying signal state.
- `AbortSignalBorrow` is non-owning:
 - it is safe to copy and pass across tasks/threads,
 - it becomes invalid once the owning `AbortController`/`AbortSignal` is
 destroyed or dropped.
- `AbortController.abort()` is idempotent: aborting an already-aborted signal
 is a no-op (the original reason is preserved).
- `abort_with_message` aborts with a user-provided message. If the message
 cannot be copied due to allocation failure, the signal is still aborted, and
 the method returns `Some(OutOfMemory{...})`.
- `AbortSignal.reason()` returns an `AbortReason` whose `message: string` view
 is backed by memory owned by the signal. Do not use the returned `message`
 after the signal/controller has been destroyed or dropped.
- `AbortSignalBorrow.wait_fd()` returns a file descriptor that becomes readable
 when the signal is aborted. This is intended for `poll(2)`/`select(2)` style
 waiting (for example to wait on both a TTY fd and an abort signal at the same
 time). Do not read from or close the returned fd; it is owned by the signal
 and used as an internal wake mechanism.
- `AbortSignal.wait()` blocks the current OS thread until the signal is aborted.
 In the Supported forms, this is a blocking synchronization primitive. For
 select-style waiting, use `wait_fd()` instead.

## Using `AbortSignalBorrow` Across Tasks

`AbortSignal` is an owning, droppable handle. To share a signal across tasks
without transferring ownership, pass a borrow view:

```silk
match (std::abort_controller::AbortController.init()) {
  Ok(controller) => {
    let mut ctl: std::abort_controller::AbortController = controller;
    let sig: std::abort_controller::AbortSignalBorrow = ctl.signal();
    // Pass `sig` into tasks/operations while `ctl` stays alive.
    ctl.destroy();
  },
  Err(_) => {
    // Handle OutOfMemory.
  },
}

task fn worker (sig: std::abort_controller::AbortSignalBorrow) -> int {
  if sig.is_aborted() { return 0; }
  // ...
  return 1;
}
```

This pattern keeps ownership with the creator while allowing other threads to
observe and wait on the abort signal.

If a borrow must remain in use after the initialization branch, keep the owning
`AbortController` alive in an outer binding as well. Do not store only the
`AbortSignalBorrow`, because the borrow becomes invalid once the owner is
dropped.
