# `std::fs`

This is the canonical module doc for `std::fs`.

`std::fs` provides the hosted filesystem API shipped in `std/fs.slk`: low-level
file handles, stat-style metadata queries (`stat`, `lstat`, `fstat`,
`Stats`), whole-file helpers, directory iteration, and path-based mutation
primitives, all backed by `std::runtime::fs`.

The detailed API contract and platform notes are documented in:

- [filesystem](?p=std/filesystem)

Read that page as the complete public surface for:

- `FSErrorKind`, `FSFailed`, and the `FS*Result` aliases
- `PathKind`
- `Stats`
- `OpenOptions`
- `SeekWhence`
- `File`
- `MMap`
- `Dir`
- `DirEntry`
- `DirEntryView` and `DirEntryType`
- top-level helpers such as `exists`, `stat`, `lstat`, `fstat`,
 `metadata_size`, `file_size`, `realpath`, `read_file`, `write_file`,
 `copy_file`, `read_dir`, `readdir`, `unlink`, `rename`, `mkdir`, `rmdir`,
 `mkdir_all`, and `mkdirp`

Related docs:

- [filesystem](?p=std/filesystem)
- [io](?p=std/io)
- [path](?p=std/path)
- [runtime](?p=std/runtime)
