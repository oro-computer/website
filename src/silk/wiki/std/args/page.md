---
layout: "docs"
title: "std::args"
description: "std::args provides helpers for working with the hosted main(argc, argv) entrypoint shape."
docsCollection: "silkWiki"
section: "std"
order: 65
sourcePath: "std/args.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::args`](/silk/docs/std/args/)

[`std::args`](/silk/docs/std/args/) provides helpers for working with the hosted
`main(argc, argv)` entrypoint shape.

Full reference: [args](/silk/wiki/std/args/).

## Example
```silk
import args from "std/args";
import { println } from "std/io";

fn main (argc: int, argv: u64) -> int {
  let a = args::Args.init(argc, argv);
  if (a.count() != argc) {
    return 1;
  }
  if argc > 0 {
    println("argv[0]={}", a.get(0));
  }
  return 0;
}
```

## See also

- Full reference: [args](/silk/wiki/std/args/)
- CLI entrypoint rules: [cli silk](/silk/docs/compiler/cli-silk/)
