# Hello world

This page teaches the Silk “shape of a program”: explicit imports, a normal `main`, and a workflow that makes it cheap to
iterate.

Assumption: you have a `silk` binary available on your PATH.

## The smallest program

Create a file named `hello.slk`:

```silk
import { println } from "std/io";

fn main () -> int {
  println("hello from silk");
  return 0;
}
```

### Why this looks the way it does

- **Imports are explicit.** If you want `println`, you import it. This keeps dependencies obvious and makes refactors
 safer.
- **`main` is a normal function.** Executables use a conventional entrypoint. There isn’t a special “program block” that
 behaves differently from the rest of the language.
- **The return type is explicit.** `-> int` is the process exit code on hosted platforms. A successful run returns `0`.

## Iteration loop: check → test → build

Most Silk workflows are intentionally simple:

```bash
silk check hello.slk
silk test hello.slk
silk build hello.slk -o build/hello
```

- `silk check` answers: “does this module set parse and type-check?”
- `silk test` discovers and runs `test "name" { ... }` blocks and emits TAP output.
- `silk build` compiles and produces an artifact. When you omit `--kind`, you’re building an executable.

The important term is **module set**: each command operates on a set of `.slk` files compiled together. Even in small
programs, thinking in module sets scales well to larger codebases.

Next: [CLI and toolchain](?p=guides/cli)

## A slightly richer example

This adds a helper function and shows how “real” Silk code stays ordinary:

```silk
import { println } from "std/io";

fn greet (name: string) -> void {
  println("hello {s}", name);
}

fn main () -> int {
  greet("silk");
  return 0;
}
```

## A practical hello: reading arguments

On hosted targets, Silk can also accept a conventional `(argc, argv)` entrypoint shape. The standard library includes a
small `std::args` helper so you can treat raw `argv` pointers as `string` views.

```silk
import args from "std/args";
import { println } from "std/io";

fn main (argc: int, argv: u64) -> int {
  let a = args::Args.init(argc, argv);
  if a.count() < 2 {
    println("usage: hello <name>");
    return 2;
  }

  println("hello {s}", a.get(1));
  return 0;
}
```

This example is intentionally small, but it demonstrates the “systems” posture of Silk: when a boundary is low-level
(process arguments are ultimately raw pointers), the language and stdlib make that boundary explicit rather than hiding it
behind magic.

## Hello, standard library

The smallest program imports a single symbol. Real programs quickly pull in modules: filesystems, networking, crypto, and
more. Each tab below is a self-contained “hello, but practical” sketch you can paste into its own `.slk` file.

<!-- tabs:start Standard library examples -->

### Filesystem

Create a directory, write a file, read it back, clean up:

```silk
import fs from "std/fs";
import { println } from "std/io";

fn main () -> int {
  // 493 == 0o755 on POSIX.
  if fs::mkdir_all("tmp", 493) != None {
    println("mkdir failed");
    return 1;
  }

  let path: string = "tmp/hello_silk.txt";
  fs::unlink(path); // ignore errors; we just want the file gone

  // 420 == 0o644 on POSIX.
  match (fs::write_file_string(path, "hello from silk\\n", 420)) {
    Ok(_) => {},
    Err(_) => {
      println("write failed");
      fs::unlink(path);
      return 2;
    },
  }

  match (fs::read_file_string(path)) {
    Ok(s) => {
      println("read: {s}", s.as_string());
      fs::unlink(path);
      return 0;
    },
    Err(_) => {
      println("read failed");
      fs::unlink(path);
      return 3;
    },
  }
}
```

Reference: [`std::fs`](?p=std/filesystem)

### Networking

A tiny single-request HTTP server on loopback (blocking I/O):

```silk
import http from "std/http";
import net from "std/net";
import { println } from "std/io";

fn main () -> int {
  let addr = net::SocketAddrV4.loopback(8080);

  let mut listener = match net::TcpListener.listen(addr, 16) {
    Ok(v) => v,
    Err(_) => {
      println("listen failed");
      return 1;
    },
  };

  println("listening on 127.0.0.1:8080 (try: curl http://127.0.0.1:8080/)");

  let stream = match listener.accept() {
    Ok(v) => v,
    Err(_) => {
      listener.close();
      println("accept failed");
      return 2;
    },
  };

  let mut conn = http::Connection.from_stream(stream);
  let req = match conn.read_request() {
    Ok(v) => v,
    Err(_) => {
      conn.close();
      listener.close();
      return 3;
    },
  };

  println("got {s} {s}", req.method(), req.target());

  let w_err: http::Error? = conn.write_response(200, "OK", "hello from silk http\\n");
  conn.close();
  listener.close();
  if w_err != None { return 4; }
  return 0;
}
```

Reference: [`std::net`](?p=std/networking), [`std::http`](?p=std/http)

### Cryptography

Hash bytes, compare safely, and wipe buffers when you’re done:

```silk
import arrays from "std/arrays";
import buffer from "std/buffer";
import crypto from "std/crypto";
import hash from "std/crypto/hash";
import { print, println } from "std/io";
import mem from "std/runtime/mem";

fn main () -> int {
  if crypto::init() != None {
    println("crypto init failed");
    return 1;
  }

  let msg: string = "hello from silk";
  let msg_ptr: u64 = mem::string_ptr(msg);
  let msg_len: i64 = mem::string_len(msg);

  let mut out = match buffer::BufferU8.init(32) {
    Ok(v) => v,
    Err(_) => return 2,
  };

  let hash_err: crypto::CryptoError? = hash::blake2b(
    mut out,
    32,
    arrays::ByteSlice{ ptr: msg_ptr, len: msg_len }
  );
  if hash_err != None {
    out.drop();
    return 3;
  }

  print("blake2b-256(\"{s}\") = ", msg);
  var i: i64 = 0;
  while i < 32 {
    print("{x:02}", out.get(i));
    i = i + 1;
  }
  println("");

  let wipe_err: crypto::CryptoFailed? = crypto::memzero(out.as_bytes());
  out.drop();
  if wipe_err != None { return 4; }
  return 0;
}
```

Reference: [`std::crypto`](?p=std/crypto)

### GGML

`std::ggml` brings the ggml tensor library into the standard library surface. On the hosted baseline, the toolchain
auto-links ggml when the module is included in your module set.

```silk
import ggml from "std/ggml";
import { println } from "std/io";

fn main () -> int {
  println("hello from std::ggml");
  return 0;
}
```

Reference: [`std::ggml`](?p=std/ggml)

### Graphics

`std::graphics` provides raw, pinned bindings to common APIs (OpenGL, OpenGL ES, Vulkan). These are FFI bindings — context
creation and safety live above this layer — and hosted builds must link the appropriate loader library.

```silk
import opengl from "std/graphics/opengl";
import { println } from "std/io";

fn main () -> int {
  println("hello from std::graphics::opengl");
  return 0;
}
```

Build (hosted `linux/x86_64` baseline):

```bash
silk build hello_gl.slk -o build/hello_gl --needed libGL.so.1
```

Reference: [`std::graphics`](?p=std/graphics)

<!-- tabs:end -->

## Concurrency: `async` and `task`

Silk’s concurrency keywords are explicit: `task` spawns work (returns a `Task(T)`), and `async` produces a `Promise(T)`.

<!-- tabs:start Concurrency examples -->

### Task + `yield`

```silk
import { println } from "std/io";

task fn add (a: int, b: int) -> int { return a + b; }

async fn main () -> int {
  let h = add(1, 2); // h: Task(int)

  task {
    let v: int = yield h;
    println("1 + 2 = {d}", v);
    return 0;
  }
}
```

### Promise + `await`

```silk
import { println } from "std/io";

async fn answer () -> int { return 42; }

async fn main () -> int {
  let p = answer();     // p: Promise(int)
  let v: int = await p; // unwrap the promise
  println("answer = {d}", v);
  return 0;
}
```

<!-- tabs:end -->

Reference: [Concurrency](?p=language/concurrency), [Tutorial 5](?p=usage/tutorials/05-concurrency)

## Formal Silk: `#invariant`, `#variant`, `#monovariant`

Formal Silk is Silk’s compile-time verification surface (Z3-backed). When you use directives like `#invariant` or
`#monovariant`, `silk check` / `silk build` prove the obligations at compile time and fail the build if they can’t be
proven.

<!-- tabs:start Formal Silk examples -->

### Loop specs

Use `#variant` to prove termination, and `#monovariant` to prove a measure moves in one direction (non-decreasing or
non-increasing):

```silk
fn main () -> int {
  let limit: int = 3;
  #const original_limit = limit;

  let mut i: int = 0;
  #invariant i >= 0;
  #invariant i <= original_limit;
  #variant original_limit - i;
  #monovariant i;
  while i < limit {
    i += 1;
  }

  return 0;
}
```

### Function contracts

Contracts attach to a function and introduce proof obligations:

```silk
#require x >= 0;
#assure result == x + 1;
fn inc (x: int) -> int {
  return x + 1;
}

fn main () -> int {
  return inc(2) - 3;
}
```

<!-- tabs:end -->

Reference: [Formal Silk guide](?p=guides/formal-silk), [Formal Silk reference](?p=language/formal-verification), [`while` loop](?p=language/flow-while), [Syntax tour](?p=language/syntax-tour)

## WebAssembly and WASI

Silk can target `wasm32-wasi` and run under standard WASI runtimes (including Node’s built-in WASI support).

<!-- tabs:start WASI hello -->

### `main.slk`

```silk
import io from "std/io";

fn main () -> int {
  io::println("hello from silk wasm wasi");
  return 7;
}
```

Build:

```bash
silk build main.slk --target wasm32-wasi -o out.wasm
```

### `run.js`

```js
const fs = require("node:fs");
const { WASI } = require("node:wasi");

async function main() {
  const wasmPath = process.argv[2];
  const wasi = new WASI({
    version: "preview1",
    args: [wasmPath],
    env: {},
    preopens: {},
  });

  const bytes = fs.readFileSync(wasmPath);
  const { instance } = await WebAssembly.instantiate(bytes, wasi.getImportObject());

  try {
    wasi.start(instance);
  } catch {
    // Some Node versions throw on proc_exit; the exit code is still available.
  }

  const exitSym = Object.getOwnPropertySymbols(wasi).find(
    (s) => s.toString() === "Symbol(kExitCode)"
  );
  const code =
    exitSym && typeof wasi[exitSym] === "number" ? wasi[exitSym] : process.exitCode ?? 0;
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
node --no-warnings run.js out.wasm
echo $?
```

Expected:

- stdout contains `hello from silk wasm wasi`
- exit code is `7`

<!-- tabs:end -->

Reference: [How-To: Run `wasm32-wasi` Output in Node.js](?p=usage/howto-run-wasi-node)

## Where to go next

- [Language tour](?p=guides/language-tour)
- [Modules & packages](?p=guides/modules-and-packages)
- [Standard library](?p=guides/standard-library)
- Tutorials: [Filesystem](?p=usage/tutorials/04-filesystem), [Concurrency](?p=usage/tutorials/05-concurrency)
- [WASI + Node](?p=usage/howto-run-wasi-node)
- [Formal Silk](?p=language/formal-verification)
- Reference: packages/imports/exports (`Packages, imports, exports` in the sidebar under “Language”)
