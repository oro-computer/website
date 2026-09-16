---
layout: "docs"
description: "std::env provides access to process environment variables and common directory helpers."
docsCollection: "silkWiki"
section: "std"
order: 66
sourcePath: "std/env.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::env`](/silk/docs/std/env/)

[`std::env`](/silk/docs/std/env/) provides access to process environment variables and common
directory helpers.

Full reference: [env](/silk/wiki/std/env/).

## Example: `get`
```silk
import std::env;
import { println } from "std/io";

fn main () -> int {
  let v_opt = std::env::get("HOME");
  match (v_opt) {
    Some(v) => println("HOME = {}", v),
    None => println("HOME is not set"),
  };
  return 0;
}
```

## See also

- Full reference: [env](/silk/wiki/std/env/)
- Typed errors: [typed errors](/silk/wiki/language/typed-errors/)
