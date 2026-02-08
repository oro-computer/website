# `std::args`

`std::args` provides helpers for working with the hosted
`main(argc, argv)` entrypoint shape.

Canonical doc: `docs/std/args.md`.

## Example (Works today)

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

- Canonical doc: `docs/std/args.md`
- CLI entrypoint rules: `docs/compiler/cli-silk.md`
