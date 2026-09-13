---
layout: "silk-docs"
title: "std::fs"
description: "This is the canonical module doc for std::fs."
docsCollection: "silk"
section: "std"
order: 163
sourcePath: "std/fs.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::fs`](/silk/docs/std/fs/)

This is the canonical module doc for [`std::fs`](/silk/docs/std/fs/).

[`std::fs`](/silk/docs/std/fs/) provides the hosted filesystem API shipped in [`std/fs.slk`](https://github.com/oro-computer/silk/blob/master/std/fs.slk): low-level
file handles, stat-style metadata queries (`stat`, `lstat`, `fstat`,
`Stats`), whole-file helpers, directory iteration, and path-based mutation
primitives, all backed by [`std::runtime::fs`](/silk/docs/std/runtime-fs/).

Hosted package build modules may use the same `Dir.next()` and borrowed
`Dir.next_view()` iteration APIs as ordinary executables. Optional
`DirEntryViewResult` bindings and loops retain their normal semantics inside
the compiler-generated build-module wrapper.

The detailed API contract and platform notes are documented in:

- [filesystem](/silk/docs/std/filesystem/)

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
 `chmod`, `flock`, `funlock`, `mkdir_all`, and `mkdirp`

Related docs:

- [filesystem](/silk/docs/std/filesystem/)
- [io](/silk/docs/std/io/)
- [path](/silk/docs/std/path/)
- [runtime](/silk/docs/std/runtime/)
