---
layout: "docs"
description: "Source: std/process/child.slk"
docsCollection: "silk"
section: "std"
order: 176
sourcePath: "std/process-child.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::process::child`](/silk/docs/std/process-child/)

Source: [`std/process/child.slk`](https://github.com/oro-computer/silk/blob/master/std/process/child.slk)

This is the exact canonical documentation page for [`std::process::child`](/silk/docs/std/process-child/).

## Role

All pipes created for child standard streams and exec-error reporting must
have close-on-exec set on both ends before forking. Failure to set either flag
closes both descriptors and reports `ErrorStage::Pipe` with the mapped I/O
error; no child is spawned with an unprotected exec-error descriptor.

[`std::process::child`](/silk/docs/std/process-child/) is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [process](/silk/docs/std/process/)

## Notes

- The shipped source for this module is [`std/process/child.slk`](https://github.com/oro-computer/silk/blob/master/std/process/child.slk).
- The canonical module name is [`std::process::child`](/silk/docs/std/process-child/).
- `PtyChild.take_master()` transfers descriptor ownership to the caller;
 `wait()` does not close the master. The owner must keep it open while
 draining output and waiting for normal exit. Closing the last
 master of a live controlling terminal can deliver `SIGHUP` to the child.
 Accumulate short reads to the application's message boundary and drain
 unbounded output while supervising exit to avoid blocking child writes.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
- `Command` owns the backing allocations used by its argument and environment
 vectors. It implements [`std::interfaces::Drop`](/silk/docs/std/interfaces/); `drop()` releases both
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

`Command.resource_limits(cpu_seconds: int, address_space_bytes: int)` enables
hard and soft CPU/address-space limits for the child and disables core dumps.
Both arguments must be positive; invalid configuration makes spawn fail.
The configuration fields are `limits_enabled: bool`, `cpu_seconds: int`, and
`address_space_bytes: int` (disabled/zero by default). Both pipe and PTY spawn
paths apply limits before exec and report failures through the exec handshake
with `ErrorStage::ResourceLimits` (stage 18). The parent is not constrained.
Limit setup has no rollback in the child: any failure terminates the child.
This does not close descriptors, change dumpability, or sandbox filesystem
access; workers can explicitly use the process containment operations.

For resource-limit setup failures, `Failed.detail` preserves the native errno;
`Failed.kind()` classifies invalid input and permission failures. Invalid
nonpositive configuration reports `EINVAL` in `detail`.

### Data segment limits

`Command.data_limit(bytes: int) -> void` requests equal soft/hard RLIMIT_DATA
limits before exec, independently of `resource_limits`. Nonpositive values
are rejected at spawn with `ErrorStage::ResourceLimits`, as are native setup
failures. Both ordinary and PTY spawn apply this setting only in the child;
the parent is unchanged. This bounds data allocations, not the entire virtual
address space; combine it with `resource_limits` when both bounds are needed.
