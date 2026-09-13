---
layout: "silkWiki-docs"
title: "std::process"
description: "std::process provides process-oriented primitives (hosted baseline)."
docsCollection: "silkWiki"
section: "std"
order: 67
sourcePath: "std/process.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::process`](/silk/docs/std/process/)

[`std::process`](/silk/docs/std/process/) provides process-oriented primitives (hosted baseline).

Full reference: [process](/silk/wiki/std/process/).

## Notes

- Supported forms is available for the hosted POSIX baseline.
- Full reference: [process](/silk/wiki/std/process/)

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

- Full reference: [process](/silk/wiki/std/process/)
- Environment helpers: [env](/silk/wiki/std/env/)
