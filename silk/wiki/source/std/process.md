# `std::process`

`std::process` provides process-oriented primitives (hosted baseline).

Canonical doc: [process](?p=std/process).

## Notes

- Supported forms is available for the hosted POSIX baseline.
- Details: [process](?p=std/process)

## Importing

```silk
import process from "std/process";
import strings from "std/strings";
```

## Examples

### Example: `getcwd` + `chdir` with recoverable errors
```silk
import process from "std/process";
import strings from "std/strings";

fn main () -> int {
  match (process::getcwd()) {
    process::GetCwdResult::Ok(cwd_value) => {
      let mut cwd: strings::String = cwd_value;

      let err1: process::ChdirFailed? = process::chdir("/");
      if err1 != None {
        cwd.drop();
        return 2;
      }

      let err2: process::ChdirFailed? = process::chdir(cwd.as_string());
      if err2 != None {
        cwd.drop();
        return 3;
      }

      cwd.drop();
      return 0;
    },
    process::GetCwdResult::Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Canonical doc: [process](?p=std/process)
- Environment helpers: [env](?p=std/env)
- End-to-end fixture: `tests/silk/pass_std_process_getcwd_chdir.slk`
