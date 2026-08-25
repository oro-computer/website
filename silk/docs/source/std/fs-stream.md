# `std::fs::stream`

Source: `std/fs/stream.slk`

This is the exact canonical documentation page for `std::fs::stream`.

## Role

`std::fs::stream` is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [fs](?p=std/fs)
- [io](?p=std/io)

## Notes

- The shipped source for this module is `std/fs/stream.slk`.
- The canonical module name is `std::fs::stream`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
- Filesystem failures are translated exhaustively into stream failures:
 out-of-memory and invalid-input retain their corresponding stream kinds;
 path, permission, end-of-file, lock-contention, interruption, and unsupported
 operation failures become `RuntimeFailed`; an unknown filesystem failure
 remains `Unknown`. This mapping must be updated whenever `FSErrorKind` grows.
