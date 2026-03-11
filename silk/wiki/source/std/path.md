# `std::path`

`std::path` provides path manipulation helpers.

[Canonical doc](../docs/?p=std/path).

## Status

- Implemented subset is available (POSIX-style `/` paths).
- [Details](../docs/?p=std/path)

## Importing

```silk
import std::path;
import std::strings;
```

## Examples

### Example: normalize + `PathBuf`
```silk
import std::path;
import std::strings;

fn main () -> int {
  let mut n: std::strings::String = std::path::normalize("/a//b/");
  if n.as_string() != "/a/b" {
    n.drop();
    return 1;
  }
  n.drop();

  let mut pb: std::path::PathBuf = std::path::PathBuf.empty();
  pb.push("a");
  pb.push("b");
  if pb.as_string() != "a/b" {
    pb.drop();
    return 2;
  }
  if !pb.pop() {
    pb.drop();
    return 3;
  }
  if pb.as_string() != "a" {
    pb.drop();
    return 4;
  }

  pb.drop();
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/path)
- Filesystem: [std::fs](?p=std/filesystem)
- Strings: [std::strings](../docs/?p=std/strings)
