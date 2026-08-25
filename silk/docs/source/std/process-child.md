# `std::process::child`

Source: `std/process/child.slk`

This is the exact canonical documentation page for `std::process::child`.

## Role

`std::process::child` is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [process](?p=std/process)

## Notes

- The shipped source for this module is `std/process/child.slk`.
- The canonical module name is `std::process::child`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
- `Command` owns the backing allocations used by its argument and environment
 vectors. It implements `std::interfaces::Drop`; `drop()` releases both
 allocations, resets them to empty vectors, and is safe to call repeatedly.
- `Child::try_wait()` is non-blocking and may be called repeatedly. It returns
 `None` while the process is running and a stable cached status after exit.
- `Child::wait()` returns that same cached status when a preceding `try_wait()`
 already observed exit, rather than attempting to reap the process again.
- `Child::kill()` rejects an already-reaped child, so a cached process ID cannot
 target an unrelated process after operating-system identifier reuse.
- `Child::invalid()` is the inert, already-completed sentinel used for safe
 moves and fallback construction. Its cached status is a successful zero exit,
 so `try_wait()` and `wait()` terminate deterministically without invoking
 `waitpid`; operations that require a live process, such as `kill`, still
 report invalid input.
- `Command::new_process_group()` opts `spawn`, `output`, or `spawn_pty` into an
 owned group without changing the default behavior of ordinary commands.
 Group establishment completes before a successful spawn result is returned.
 A failure is classified as `ErrorStage::ProcessGroup`.
- `Child::kill_group(signal)` and `PtyChild::kill_group(signal)` signal only a
 group explicitly owned by that handle. They reject ordinary, invalid, and
 already-reaped children, and the raw group identifier is never public.
- To force-stop a supervised tree, call `kill_group(signal)` before `wait()`.
 `wait()` reaps the direct child; terminated descendants are reaped by their
 direct parent or the operating system.
