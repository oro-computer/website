---
layout: "docs"
description: "std::fs provides a small hosted POSIX-oriented filesystem API (Supported forms subset)."
docsCollection: "silkWiki"
section: "std"
order: 69
sourcePath: "std/filesystem.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::fs`](/silk/docs/std/fs/)

[`std::fs`](/silk/docs/std/fs/) provides a small hosted POSIX-oriented filesystem API (Supported forms
subset).

Full reference: [filesystem](/silk/wiki/std/filesystem/).

## Example: existence checks
```silk
import std::fs;

fn main () -> int {
  if !std::fs::exists("docs") { return 1; }
  if !std::fs::can_read("docs") { return 2; }
  if std::fs::exists("this_file_should_not_exist___silk_std_fs") { return 3; }
  return 0;
}
```

## See also

- Full reference: [filesystem](/silk/wiki/std/filesystem/)
- Paths: [path](/silk/wiki/std/path/)
