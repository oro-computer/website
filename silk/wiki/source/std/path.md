# `std::path`

`std::path` provides path manipulation helpers.

Canonical doc: `docs/std/path.md`.

## Status

- Implemented subset is available (POSIX-style `/` paths).
- Details: `docs/std/path.md`

## Importing

```silk
import std::path;
import std::strings;
```

## Examples

### Works today: normalize + `PathBuf`

```silk
import std::path;
import std::strings;

fn main () -> int {
 let mut n: std::strings::String = std::path::normalize("/a//b/");
 if n.as_string() != "/a/b" {
 (mut n).drop();
 return 1;
 }
 (mut n).drop();

 let mut pb: std::path::PathBuf = std::path::PathBuf.empty();
 (mut pb).push("a");
 (mut pb).push("b");
 if pb.as_string() != "a/b" {
 (mut pb).drop();
 return 2;
 }
 if !(mut pb).pop() {
 (mut pb).drop();
 return 3;
 }
 if pb.as_string() != "a" {
 (mut pb).drop();
 return 4;
 }

 (mut pb).drop();
 return 0;
}
```

## See also

- Canonical doc: `docs/std/path.md`
- Filesystem: `docs/wiki/std/filesystem.md`
- End-to-end fixture: `tests/silk/pass_std_path_basic.slk`
