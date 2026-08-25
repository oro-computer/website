# How-To: Run `wasm32-wasi` Output in Node.js

This guide shows how to:

- compile a Silk program to `wasm32-wasi`, and
- run it under Node’s built-in WASI runtime (`node:wasi`), and
- forward process arguments into Silk.

The `wasm32-wasi` backend emits a `_start () -> void` entrypoint that calls Silk
`fn main () -> int` and then calls `wasi_snapshot_preview1.proc_exit(exit_code)`.

## 1) Build a WASI Module

Create `main.slk`:

```silk
import io from "std/io";

fn main () -> int {
  io::println("hello from silk wasm wasi");
  return 0;
}
```

Build:

```sh
silk build main.slk --target wasm32-wasi -o out.wasm
```

## 2) Run it with `node:wasi`

Create `run.js`:

```js
const fs = require('node:fs');
const { WASI } = require('node:wasi');

async function main() {
  const wasmPath = process.argv[2];
  const userArgs = process.argv.slice(3);
  const wasi = new WASI({ version: 'preview1', args: [wasmPath, ...userArgs], env: {}, preopens: {} });
  const bytes = fs.readFileSync(wasmPath);
  const { instance } = await WebAssembly.instantiate(bytes, wasi.getImportObject());

  try {
    wasi.start(instance);
  } catch (err) {
    // Some Node versions throw on proc_exit; the exit code is still available.
  }

  const exitSym = Object.getOwnPropertySymbols(wasi).find((s) => s.toString() === 'Symbol(kExitCode)');
  const code = (exitSym && typeof wasi[exitSym] === 'number') ? wasi[exitSym] : (process.exitCode ?? 0);
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```sh
node --no-warnings run.js out.wasm
echo $?
```

Expected output:

- stdout contains `hello from silk wasm wasi`
- exit code is `0`

## 3) Access argv from `fn main () -> int`

The WASI entrypoint remains parameterless. Read arguments through `std::args`
inside `main`:

```silk
import { current } from "std/args";
import { println } from "std/io";

fn main () -> int {
  let args = current();
  println("argc={}", args.count());
  if args.count() > 1 {
    println("argv[1]={}", args.get(1));
  }
  return 0;
}
```

Pass user arguments after the `.wasm` path:

```sh
node --no-warnings run.js out.wasm alpha beta
```

Silk then sees `out.wasm`, `alpha`, and `beta` as `argv[0]`, `argv[1]`, and
`argv[2]`.

## Troubleshooting

- If you see missing-import errors mentioning `wasi_snapshot_preview1`, confirm
 you built with `--target wasm32-wasi` (not `wasm32-unknown-unknown`).
- `task` / `yield` and `async` / `await` do not yet have a WASM concurrency
 runtime.
- WASI is a constrained environment. Shipped modules such as `std::args`,
 `std::env`, and parts of `std::fs` use the WASI runtime surface; unsupported
 OS facilities can still fail code generation or return runtime errors.
- For deeper backend details and entrypoint behavior, see: [WASM backend](?p=compiler/backend-wasm).
