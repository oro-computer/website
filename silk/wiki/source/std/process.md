# `std::process`

`std::process` provides process-oriented primitives (hosted baseline).

[Canonical doc](../docs/?p=std/process).

## Status

- Implemented subset is available for the hosted POSIX baseline.
- [Details](../docs/?p=std/process)

## Importing

```silk
import std::process;
import std::strings;
```

## Examples

### Example: `getcwd` + `chdir` with recoverable errors
```silk
import std::process;
import std::strings;

fn main () -> int {
  let mut cwd = match std::process::getcwd() {
    std::process::GetCwdResult::Ok(v) => v,
    std::process::GetCwdResult::Err(_) => return 1,
  };

  let err1: std::process::ChdirFailed? = std::process::chdir("/");
  if err1 != None {
    cwd.drop();
    return 2;
  }

  let err2: std::process::ChdirFailed? = std::process::chdir(cwd.as_string());
  if err2 != None {
    cwd.drop();
    return 3;
  }

  cwd.drop();
  return 0;
}
```

## See also

- [Canonical doc](../docs/?p=std/process)
- Environment helpers: [std::env](?p=std/env)
- Runtime/process boundary: [std::runtime](../docs/?p=std/runtime)
