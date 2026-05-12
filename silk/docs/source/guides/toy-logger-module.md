# Toy Logger Module Walkthrough

This walkthrough builds a small logger package that is useful enough to keep,
but compact enough to show the whole module system:

- a reusable package root with `silk.toml`,
- source modules, definition modules, examples, and tests,
- `import ns from "module"` and `import { Name } from "module"` imports,
- targets for executables, static libraries, and WASI,
- `attr(os="...")` platform selection,
- an ABI/FFI edge, and
- GitHub/npm publication.

The package name is `toy::logger`. Downstream users import it as a module
specifier:

```silk
import logger from "toy::logger";
```

Direct imports such as `import toy::logger::info;` are shown only in the ABI
section because they bind ABI/export paths directly.

## Package Layout

Create this directory:

```text
toy-logger/
  silk.toml
  README.md
  LICENSE
  src/
    logger.slk
    c_sink.slk
  defs/
    api.slk
  examples/
    main.slk
  tests/
    logger_test.slk
```

`src/` is the implementation. `defs/` is the public type-checking surface for
binary consumers. `examples/` shows downstream use. `tests/` stays package-local.

## Manifest

`silk.toml` makes the package root portable:

```toml
[package]
name = "toy::logger"
version = "0.1.0"
description = "A tiny structured logger used to demonstrate Silk packages"
license = "MIT"
repository = "https://github.com/example/toy-logger"
readme = "README.md"
definitions = ["defs/api.slk"]

[sources]
include = [
  "src/**/*.slk",
  "defs/**/*.slk",
  "examples/**/*.slk",
  "tests/**/*.slk"
]

[dist]
include = [
  "silk.toml",
  "README.md",
  "LICENSE",
  "src/**",
  "defs/**",
  "examples/**"
]

[[target]]
name = "logger-static"
kind = "static"
entry = "src/logger.slk"
output = "build/libtoy_logger.a"
c_header = "build/toy_logger.h"

[[target]]
name = "logger-demo"
kind = "executable"
entry = "examples/main.slk"
output = "build/toy-logger-demo"

[[target]]
name = "logger-wasi-demo"
kind = "executable"
entry = "examples/main.slk"
target = "wasm32-wasi"
output = "build/toy-logger-demo.wasm"
```

The package name is the import identity. The target names are build outputs.
Changing `[[target]]` does not change how source imports the package.

## Implementation Module

`src/logger.slk` defines the public logger surface:

```silk
package toy::logger;

import { println } from "std/io";

export enum Level {
  Debug,
  Info,
  Warn,
  Error,
}

export struct Logger {
  min_level: Level,
  prefix: string,
}

export fn new_logger (min_level: Level) -> Logger {
  return Logger{
    min_level: min_level,
    prefix: default_prefix(),
  };
}

export fn log (logger: &Logger, level: Level, message: string) -> void {
  if enabled(logger.min_level, level) == false {
    return;
  }
  println("[{s}] {s}: {s}", logger.prefix, level_name(level), message);
}

export fn debug (logger: &Logger, message: string) -> void {
  log(logger, Level::Debug, message);
}

export fn info (logger: &Logger, message: string) -> void {
  log(logger, Level::Info, message);
}

export fn warn (logger: &Logger, message: string) -> void {
  log(logger, Level::Warn, message);
}

export fn error (logger: &Logger, message: string) -> void {
  log(logger, Level::Error, message);
}

fn enabled (minimum: Level, actual: Level) -> bool {
  return level_value(actual) >= level_value(minimum);
}

fn level_value (level: Level) -> int {
  return match (level) {
    Level::Debug => 10,
    Level::Info => 20,
    Level::Warn => 30,
    Level::Error => 40,
  };
}

fn level_name (level: Level) -> string {
  return match (level) {
    Level::Debug => "debug",
    Level::Info => "info",
    Level::Warn => "warn",
    Level::Error => "error",
  };
}

fn default_prefix () -> string {
  if attr(os="linux") { return "linux"; }
  if attr(os="macos") { return "macos"; }
  if attr(os="windows") { return "windows"; }
  if attr(os="wasi") { return "wasi"; }
  return "host";
}
```

The only stdlib dependency is selected with:

```silk
import { println } from "std/io";
```

That keeps the call site concise and keeps the dependency clear. If this module
used more of `std/io`, prefer:

```silk
import io from "std/io";
```

and call `io::println(...)`.

## Downstream Use

`examples/main.slk` imports the package namespace:

```silk
import logger from "toy::logger";

fn main () -> int {
  let log = logger::new_logger(logger::Level::Info);
  logger::debug(&log, "hidden by the minimum level");
  logger::info(&log, "service started");
  logger::warn(&log, "cache is cold");
  return 0;
}
```

This is the user-space default: bind the namespace with
`import logger from "toy::logger";`, then call `logger::Name`.

If a program only needs one or two names, selected imports are also idiomatic:

```silk
import { Level, new_logger, info } from "toy::logger";

fn main () -> int {
  let log = new_logger(Level::Info);
  info(&log, "started");
  return 0;
}
```

## Definition Module

`defs/api.slk` mirrors the public surface for binary or interface-only
consumers:

```silk
module toy::logger;

export enum Level {
  Debug,
  Info,
  Warn,
  Error,
}

export struct Logger {
  min_level: Level,
  prefix: string,
}

export fn new_logger (min_level: Level) -> Logger;
export fn log (logger: &Logger, level: Level, message: string) -> void;
export fn debug (logger: &Logger, message: string) -> void;
export fn info (logger: &Logger, message: string) -> void;
export fn warn (logger: &Logger, message: string) -> void;
export fn error (logger: &Logger, message: string) -> void;
```

Definition modules use `module ...;` because they describe an importable
surface without providing bodies. A source package ships `src/` and `defs/`.
A binary package can ship `defs/` plus `lib/<target>/...` artifacts so users can
type-check calls without implementation source.

## Tests

`tests/logger_test.slk` can use selected imports from the package and from the
stdlib test module:

```silk
import { Level, new_logger } from "toy::logger";
import { expect_equal } from "std/test";

test "new logger uses requested minimum level" {
  let log = new_logger(Level::Warn);
  expect_equal(Level::Warn, log.min_level);
}
```

Run the package tests:

```bash
silk test --package .
```

## Loading Rules

The imports above resolve through the active module set:

- `std/io` and `std/test` load stdlib modules from the configured std root.
- `toy::logger` resolves as a package specifier from the package graph or
 package search path.
- `./file.slk` would resolve relative to the importing file.

For local development, a downstream app can use a path dependency:

```toml
[dependencies]
toy_logger = { path = "../toy-logger", version = "^0.1.0" }
```

Then source still imports the package by its Silk identity:

```silk
import logger from "toy::logger";
```

The dependency key (`toy_logger`) is manifest-local. The import identity is
`package.name`.

## Build Targets

Build the demo executable:

```bash
silk build --package . --target logger-demo
```

Build the static library and C header:

```bash
silk build --package . --target logger-static
```

Build the WASI demo:

```bash
silk build --package . --target logger-wasi-demo
```

Target selection changes code guarded with `attr(os="...")` and
`attr(target="...")`. The package import path stays `toy::logger`.

When target-specific behavior belongs in the logger, keep it small:

```silk
fn sink_name () -> string {
  if attr(target="wasm32-wasi") { return "wasi-stdout"; }
  if attr(os="linux") { return "linux-stdout"; }
  return "stdout";
}
```

## ABI and FFI Edge

Most user code should avoid direct package imports. ABI code is the exception
because it is intentionally naming linker-visible exports.

`src/c_sink.slk` binds C `puts` and exposes a small wrapper:

```silk
package toy::logger;

ext c_puts "puts" = fn (string) -> int;

export fn log_raw_c (message: string) -> int {
  return c_puts(message);
}
```

An ABI-facing consumer may import the exact exported symbol:

```silk
import toy::logger::log_raw_c;

fn main () -> int {
  return log_raw_c("hello from c puts");
}
```

That import binds the `log_raw_c` ABI/export path directly. It is useful for
definition modules, FFI wrappers, and low-level integration tests. It is not the
normal style for application code.

Global `::` imports are even lower-level:

```silk
import ::puts;
```

That asks the resolver for `puts` in the unnamed global package. Use it only
when a global external binding is deliberately part of the ABI boundary.

## Publishing on GitHub

GitHub can distribute the same package root that local builds use:

```bash
git tag v0.1.0
git archive --format=tar --prefix=toy-logger-0.1.0/ v0.1.0 | gzip > toy-logger-0.1.0.tar.gz
```

Attach the archive to a release. Consumers can unpack it and use:

```toml
[dependencies]
toy_logger = { path = "vendor/toy-logger", version = "^0.1.0" }
```

For package-search-path consumption, place the root under a directory layout
that matches the Silk package name:

```text
vendor/toy/logger/silk.toml
```

Then:

```bash
export SILK_PACKAGE_PATH="$PWD/vendor"
silk build --package .
```

## Publishing on npm

npm can be a transport for the package root. Silk does not fetch npm packages
itself; it reads files that already exist on disk.

Minimal `package.json`:

```json
{
  "name": "@toy/silk-logger",
  "version": "0.1.0",
  "description": "A tiny structured logger used to demonstrate Silk packages",
  "files": [
    "silk.toml",
    "README.md",
    "LICENSE",
    "src",
    "defs",
    "examples"
  ]
}
```

After `npm install @toy/silk-logger`, consumers can depend on the installed
directory directly:

```toml
[dependencies]
toy_logger = { path = "node_modules/@toy/silk-logger", version = "^0.1.0" }
```

If you want `SILK_PACKAGE_PATH` lookup instead, materialize the package under a
search root that mirrors `toy::logger`, for example:

```text
packages/toy/logger -> ../node_modules/@toy/silk-logger
```

Then set:

```bash
export SILK_PACKAGE_PATH="$PWD/packages"
```

## Best Practices

- Use `import ns from "module"` for package or module namespaces.
- Use `import { Name } from "module"` for a small selected surface.
- Keep direct `import package::ns::symbol;` imports in ABI/FFI code.
- Keep `defs/api.slk` in sync with exported source APIs.
- Make target-specific code narrow and explicit with `attr(os="...")` or
 `attr(target="...")`.
- Publish the same `silk.toml` package root through GitHub, npm, vendored
 directories, or system packages.
- Keep package builds offline-friendly; package managers should place files on
 disk before `silk build` runs.

## Next

- [Modules, Packages, and Publication](?p=guides/modules-and-packages)
- [Packages, Imports, and Exports](?p=language/packages-imports-exports)
- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
