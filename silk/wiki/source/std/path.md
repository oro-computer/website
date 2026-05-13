# `std::path`

`std::path` provides path manipulation helpers.

Canonical doc: [path](?p=std/path).

## Notes

- Supported forms is available (POSIX-style `/` paths).
- Details: [path](?p=std/path)

## Importing

```silk
import path from "std/path";
import strings from "std/strings";
```

## Examples

### Example: normalize + `PathBuf`
```silk
import path from "std/path";
import strings from "std/strings";

fn main () -> int {
  let mut n: strings::String = path::normalize("/a//b/");
  if n.as_string() != "/a/b" {
    n.drop();
    return 1;
  }
  n.drop();

  let mut pb: path::PathBuf = path::PathBuf.empty();
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

- Canonical doc: [path](?p=std/path)
- Filesystem: [filesystem](?p=std/filesystem)
- End-to-end fixture: `tests/silk/pass_std_path_basic.slk`
