# `std::fs`

`std::fs` provides a small hosted POSIX-oriented filesystem API (Supported forms
subset).

Canonical doc: [filesystem](?p=std/filesystem).

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

- Canonical doc: [filesystem](?p=std/filesystem)
- Paths: [path](?p=std/path)
