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
- This page is intentionally implementation-oriented. Downstream users should usually start with the higher-level std module docs listed above unless they are working on the runtime layer itself.
