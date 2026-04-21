# `std::fs`

This is the canonical module doc for `std::fs`.

`std::fs` provides the hosted filesystem API shipped in `std/fs.slk`: low-level
file handles, whole-file helpers, directory iteration, and path-based mutation
primitives, all backed by `std::runtime::fs`.

The detailed API contract and platform notes are documented in:

- [filesystem](?p=std/filesystem)

Read that page as the complete public surface for:

- `FSErrorKind`, `FSFailed`, and the `FS*Result` aliases
- `PathKind`
- `OpenOptions`
- `SeekWhence`
- `File`
- `MMap`
- `Dir`
- `DirEntry`
- top-level helpers such as `exists`, `realpath`, `read_file`, `write_file`,
 `copy_file`, `read_dir`, `unlink`, `rename`, `mkdir`, `rmdir`, and
 `mkdir_all`

Related docs:

- [filesystem](?p=std/filesystem)
- [io](?p=std/io)
- [path](?p=std/path)
- [runtime](?p=std/runtime)
