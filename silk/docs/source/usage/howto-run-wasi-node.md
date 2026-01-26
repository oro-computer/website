# How-To: Run `wasm32-wasi` Output in Node.js

This guide shows how to:

- compile a Silk program to `wasm32-wasi`, and
- run it under Node’s built-in WASI runtime (`node:wasi`).

The `wasm32-wasi` backend emits a `_start () -> void` entrypoint that calls Silk
`fn main () -> int` and then calls `wasi_snapshot_preview1.proc_exit(exit_code)`.

## 1) Build a WASI Module

Create `main.slk`:

```silk
import std::io;

fn main () -> int {
  std::io::println("hello from silk wasm wasi");
  return 7;
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
  const wasi = new WASI({ version: 'preview1', args: [wasmPath], env: {}, preopens: {} });
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
- exit code is `7`

## Troubleshooting

- If you see missing-import errors mentioning `wasi_snapshot_preview1`, confirm
  you built with `--target wasm32-wasi` (not `wasm32-unknown-unknown`).
- If your program relies on OS-specific APIs (filesystem, processes): WASI is a constrained environment. Prefer
  stdlib APIs that are designed for WASI, or build for a hosted target.
- For deeper backend details and entrypoint behavior, see: [WASM backend](?p=compiler/backend-wasm).
