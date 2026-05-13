# What Silk is for

Silk is for systems code that has to be understood, shipped, embedded, and trusted after it grows beyond a single file.

It is a native programming language for tools, libraries, runtimes, services, protocol code, WASI modules, and platform-facing
software where the boundaries are as important as the implementation. Silk keeps those boundaries visible: the package a file
belongs to, the modules it imports, the values that can be missing, the failures that must be handled, the target assumptions
behind a branch, and the invariants the compiler should prove.

> Silk is for code where “it compiled” is not enough. The source should also say what it depends on, what can fail, what crosses
> the ABI, and what must remain true.

## Why it exists

Most systems languages give you power, but they often leave the shape of the system to convention. Package boundaries live in
build scripts. Foreign calls live in headers. Failure policy lives in team habits. Correctness arguments live in review comments
or bug reports.

Silk pulls those concerns back into the program. Imports are explicit and path-like for normal user-space modules. Public exports
are deliberate. `Result(T, E)` and `T?` make failure and absence part of the type a caller sees. `attr(...)` lets source code name
the platform or target assumption behind a branch. Formal Silk directives let you attach local proofs to the parts of a program
that are easiest to get wrong: bounds, invariants, preconditions, postconditions, and protocol rules.

The result is not a language trying to hide systems programming. It is a language trying to make systems programming readable
enough that humans, tooling, embedders, and verifiers can agree on what the program means.

## The shape of useful Silk

A Silk file should tell you its operating context before you read the body. In ordinary user-space code, imports use module
specifier syntax, so dependency paths look like package and filesystem paths instead of ABI symbol paths.

```silk
package worker;

import { println } from "std/io";
import fs from "std/fs";

struct Job {
  path: string,
  bytes: int,
}

interface Sink {
  fn write(job: Job) -> int;
}

struct ConsoleSink {
  label: string,
}

impl ConsoleSink as Sink {
  fn write (self: &ConsoleSink, job: Job) -> int {
    println("[{s}] indexed {s} ({d} bytes)", self.label, job.path, job.bytes);
    return 0;
  }
}

fn default_path () -> string {
  if attr(target="wasm32-wasi") { return "/data/input.txt"; }
  if attr(os="linux") { return "/var/lib/app/input.txt"; }
  return "./input.txt";
}

fn inspect (path: string, max_bytes: int) -> Job? {
  match (fs::read_file_string(path)) {
    Ok(body) => {
      let bytes: int = body.len() as int;
      if bytes > max_bytes {
        return None;
      }
      return Some(Job{ path: path, bytes: bytes });
    },
    Err(_) => {
      return None;
    },
  }
}

fn main () -> int {
  let sink = ConsoleSink{ label: "silk" };
  let path: string = default_path();
  let job: Job = match (inspect(path, 1048576)) {
    Some(v) => v,
    None => Job{ path: path, bytes: -1 },
  };

  if job.bytes < 0 {
    println("error: inspect failed");
    return 1;
  }

  return sink.write(job);
}
```

The point of this example is not that Silk has structs, interfaces, imports, optionals, and attributes. The point
is that those pieces serve one story: a small systems component can state its dependency surface, platform choice, error path,
and public behavior without pushing that knowledge into prose or a separate build layer.

## Where it fits

Silk is a good fit when you are writing code that will become someone else’s dependency. That might be a command-line tool, a
runtime component, a parser, a network or storage library, a WASI module, a native library with a C ABI, or a package meant to be
published and reused. In each case, the reader needs to know what is stable, what is private, what can fail, and what assumptions
the build made.

Silk is also a good fit when correctness has local pressure points. You do not need to turn the whole program into a proof
project. You can keep ordinary code ordinary, then add Formal Silk where a boundary check, loop invariant, structure requirement,
or function contract earns its keep.

For embedders, Silk is meant to be more than a standalone compiler binary. The toolchain ships a documented C99 `libsilk` ABI,
generated headers, explicit output kinds, and target-aware build behavior so hosts can treat compilation as a component in a
larger system.

## The payoff

Silk’s value is strongest once a project has multiple modules, targets, and consumers. The language is designed so source files
remain navigable, package APIs remain intentional, failure remains typed, native and WASI targets remain explicit, and proof
obligations stay close to the code they justify.

If you are evaluating Silk, read this page as the thesis: Silk is for building systems software whose contracts should be visible
in the same place as the code. From here, continue with [Hello world](?p=guides/hello-world), then the
[Language tour](?p=guides/language-tour), [Modules, packages, and publication](?p=guides/modules-and-packages), and
[Formal Silk](?p=guides/formal-silk).
