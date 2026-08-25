# `std::runtime::posix::process`

Source: `std/runtime/posix/process.slk`

This is the exact canonical documentation page for `std::runtime::posix::process`.

## Role

`std::runtime::posix::process` is an implementation-facing runtime module in the shipped `std/**` tree.
It exists so higher-level stdlib surfaces can delegate platform or runtime-specific behavior without changing their public module names.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [runtime](?p=std/runtime)
- [process](?p=std/process)

## Notes

- The shipped source for this module is `std/runtime/posix/process.slk`.
- The canonical module name is `std::runtime::posix::process`.
- It binds the hosted `silk_rt_process_executable_path_owned` helper for
 platform executable-path queries.
- It binds the POSIX `geteuid(2)` operation with the hosted `uid_t` ABI width
 (`u32`) used by `std::process::effective_user_id`. The higher runtime layer
 widens that value to the public `u64` identity type.
- It binds `setpgid(2)` for the higher runtime layer's child-only process-group
 setup. Raw group selection remains an implementation detail and is not part
 of the high-level child API.
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
