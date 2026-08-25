# `std::runtime::wasi::process`

Source: `std/runtime/wasi/process.slk`

This is the exact canonical documentation page for `std::runtime::wasi::process`.

## Role

`std::runtime::wasi::process` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [process](?p=std/process)

## Notes

- The shipped source for this module is `std/runtime/wasi/process.slk`.
- The canonical module name is `std::runtime::wasi::process`.
- WASI Preview 1 does not expose an OS executable-path query in this module;
 argv-backed views are available through `std::args`.
- WASI Preview 1 also has no POSIX effective-user identity; its
 `effective_user_id` implementation returns the documented zero placeholder.
- WASI Preview 1 has no process-group primitive. Its `setpgid` compatibility
 stub fails, so the high-level hosted child API reports process-group setup as
 unsupported instead of claiming isolation.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
