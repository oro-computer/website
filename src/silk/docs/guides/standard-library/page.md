---
layout: "docs"
description: "Read a file with std/fs, then choose the module for your next task."
docsCollection: "silk"
section: "guides"
order: 7
sourcePath: "guides/standard-library.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Standard library

Read a message from disk with `std/fs`. The same import style works for the rest of Silk's standard library.

## Read a file

With [Silk installed](/silk/docs/usage/getting-started/), save this as `read-message.slk`:

```silk
import fs from "std/fs";
import { println } from "std/io";

fn main () -> int {
  match (fs::read_file_string("message.txt")) {
    Ok(s) => {
      println("{s}", s.as_string());
      return 0;
    },
    Err(e) => {
      // A real program would format/inspect `e.kind()` and report it.
      println("read failed");
      return 1;
    },
  }
}
```

Create the input and run the program:

```bash
printf 'Delivery confirmed\n' > message.txt
mkdir -p build
silk build read-message.slk -o build/read-message
./build/read-message
```

Expect `Delivery confirmed`. Remove `message.txt` and run again: expect `read failed` and exit status `1`.

`Ok` carries the owned text; `as_string()` exposes a view for printing. [Filesystem APIs](/silk/docs/std/fs/) describe the error types and file handles.

## Choose the next module

| Task | Reference |
| --- | --- |
| Print or stream data | [`std/io`](/silk/docs/std/io/) |
| Build an owned string | [`std/strings`](/silk/docs/std/strings/) |
| Read configuration | [`std/toml`](/silk/docs/std/toml/) |
| Exchange structured data | [`std/json`](/silk/docs/std/json/) |
| Run concurrent work | [Concurrency tutorial](/silk/docs/usage/tutorials/05-concurrency/) |
| Run device code | [CPU/GPU walkthrough](/silk/docs/usage/pure-silk-gpu/) |

For return types, follow [optionals](/silk/learn/types-and-optionals/) and [results](/silk/learn/results-and-errors/). The [module index](/silk/docs/std/overview/) covers the full library.

<!-- Preserve existing section links; details now live in the linked references. -->
<span id="importing-std-modules"></span>
<span id="the-three-common-return-shapes"></span>
<span id="1-optionals-t"></span>
<span id="2-results-resultt-e"></span>
<span id="3-typed-errors-t--e"></span>
<span id="a-quick-tour-of-key-modules"></span>
<span id="stdio--printing-and-stream-io"></span>
<span id="stdfs--filesystem-operations"></span>
<span id="stdstrings--owned-strings-and-utilities"></span>
<span id="stdjson-and-stdtoml--configuration-and-structured-data"></span>
<span id="stdtask-stdsync-stdtemporal"></span>
<span id="stdgpu--portable-device-execution"></span>
<span id="how-to-keep-std-code-readable"></span>
<span id="next"></span>
