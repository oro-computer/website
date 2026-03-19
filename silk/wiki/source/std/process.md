# `std::process`

`std::process` provides process-oriented primitives (hosted baseline).

Canonical doc: `docs/std/process.md`.

## Status

- Implemented subset is available for the hosted POSIX baseline.
- Details: `docs/std/process.md`

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
  match (std::process::getcwd()) {
    std::process::GetCwdResult::Ok(cwd_value) => {
      let mut cwd: std::strings::String = cwd_value;

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
    },
    std::process::GetCwdResult::Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Canonical doc: `docs/std/process.md`
- Environment helpers: `docs/wiki/std/env.md`
- End-to-end fixture: `tests/silk/pass_std_process_getcwd_chdir.slk`
