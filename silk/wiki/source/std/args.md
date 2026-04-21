# `std::args`

`std::args` provides helpers for working with the hosted
`main(argc, argv)` entrypoint shape.

Canonical doc: [args](?p=std/args).

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

- Canonical doc: [args](?p=std/args)
- CLI entrypoint rules: [cli silk](../docs/?p=compiler/cli-silk)
