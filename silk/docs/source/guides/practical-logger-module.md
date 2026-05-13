# Practical Logger Module Walkthrough

This walkthrough builds a small structured logger package that can be imported
from Silk and exposed to C through a generated header. It starts with the normal
Silk API in `src/lib.slk`, then adds `src/c_api.slk` for the narrow ABI wrapper.

After the `logger_static` target emits `build/acme_logger.h` and
`build/libacme_logger.a`, a C caller can drive the package with borrowed
`SilkString` values:

```c
#include <silk/silk.h>
#include "acme_logger.h"

static SilkString silk_str(const char *ptr) {
  SilkString s = { .ptr = (char *)ptr, .len = 0 };
  while (ptr[s.len] != '\0') s.len++;
  return s;
}

int main(void) {
  return logger_write_c(20, silk_str("ffi"), silk_str("hello from C"));
}
```

The manifest package name is `logger`. Source modules declare the symbol
namespace with `package acme::logger;`. Downstream code imports the package's
default module through the dependency key:

```silk
import logger from "logger";
```

Direct imports such as `import acme::logger::logger_write_c;` are shown only in
the ABI section because they bind ABI/export paths directly.

## Package Layout

Create this directory:

```text
logger/
  silk.toml
  README.md
  LICENSE
  src/
    lib.slk
    c_api.slk
  defs/
    api.slk
  examples/
    main.slk
  tests/
    logger_test.slk
```

`src/lib.slk` is the normal Silk API. `src/c_api.slk` is the C/ABI edge.
`defs/api.slk` mirrors the public surface for binary consumers.

## Manifest

`silk.toml` makes the package root portable:

```toml
[package]
name = "logger"
version = "0.1.0"
description = "Structured logging package for Silk applications"
license = "MIT"
repository = "https://github.com/acme/silk-logger"
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
name = "logger_static"
kind = "static"
entry = "src/c_api.slk"
output = "build/libacme_logger.a"
c_header = "build/acme_logger.h"

[[target]]
name = "logger_demo"
kind = "executable"
entry = "examples/main.slk"
output = "build/logger-demo"

[[target]]
name = "logger_wasi_demo"
kind = "executable"
entry = "examples/main.slk"
target = "wasm32-wasi"
output = "build/logger-demo.wasm"
```

The manifest package name is the identifier `logger`. The source package
namespace is `acme::logger`. Target names select build recipes. The static
target enters through `src/c_api.slk` because that artifact is meant for ABI
consumers; ordinary Silk consumers import the default module with `"logger"`.

## Implementation Module

`src/lib.slk` defines the reusable logging API:

```silk
package acme::logger;

import { println } from "std/io";

export enum Level {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
}

export error LogError {
  message: string
}

export struct Field {
  key: string,
  value: string,
}

export struct Entry {
  level: Level,
  target: string?,
  message: string,
  request_id: string?,
  fields: Field[],
}

export type WriteFn = fn (entry: &Entry) -> LogError?;

export interface Sink {
  fn write(entry: &Entry) -> LogError?;
}

export struct ConsoleSink {}

impl ConsoleSink as Sink {
  fn write (self: &ConsoleSink, entry: &Entry) -> LogError? {
    return console_writer(entry);
  }
}

export struct Config {
  min_level: Level,
  target: string,
  include_target: bool,
  writer: WriteFn,
}

export struct Logger {
  config: Config,
}

impl Logger {
  public fn enabled (self: &Logger, level: Level) -> bool {
    return level_value(level) >= level_value(self.config.min_level);
  }

  public fn with_target (self: &Logger, target: string) -> Logger {
    return Logger{
      config: Config{
        min_level: self.config.min_level,
        target: target,
        include_target: self.config.include_target,
        writer: self.config.writer,
      },
    };
  }

  public fn with_writer (self: &Logger, writer: WriteFn) -> Logger {
    return Logger{
      config: Config{
        min_level: self.config.min_level,
        target: self.config.target,
        include_target: self.config.include_target,
        writer: writer,
      },
    };
  }

  public fn write (
    self: &Logger,
    level: Level,
    message: string,
    request_id: string?,
    fields: Field[]
  ) -> LogError? {
    if self.enabled(level) == false {
      return None;
    }

    let entry = Entry{
      level: level,
      target: visible_target(&self.config),
      message: message,
      request_id: request_id,
      fields: fields,
    };
    let writer = self.config.writer;
    return writer(&entry);
  }
}

export fn default_config () -> Config {
  return Config{
    min_level: Level::Info,
    target: default_target(),
    include_target: true,
    writer: console_writer,
  };
}

export fn init (config: Config) -> Logger {
  return Logger{
    config: config,
  };
}

export fn enabled (logger: &Logger, level: Level) -> bool {
  return logger.enabled(level);
}

export fn with_target (logger: &Logger, target: string) -> Logger {
  return logger.with_target(target);
}

export fn with_writer (logger: &Logger, writer: WriteFn) -> Logger {
  return logger.with_writer(writer);
}

export fn log (
  logger: &Logger,
  level: Level,
  message: string,
  request_id: string?,
  fields: Field[]
) -> LogError? {
  return logger.write(level, message, request_id, fields);
}

export fn debug (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError? {
  return log(logger, Level::Debug, message, request_id, fields);
}

export fn info (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError? {
  return log(logger, Level::Info, message, request_id, fields);
}

export fn warn (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError? {
  return log(logger, Level::Warn, message, request_id, fields);
}

export fn error (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError? {
  return log(logger, Level::Error, message, request_id, fields);
}

export fn console_writer (entry: &Entry) -> LogError? {
  let level: string = level_name(entry.level);

  match (entry.target) {
    Some(target) => match (entry.request_id) {
      Some(id) => println("{s} target={s} req_id={s} {s}", level, target, id, entry.message),
      None => println("{s} target={s} {s}", level, target, entry.message),
    },
    None => match (entry.request_id) {
      Some(id) => println("{s} req_id={s} {s}", level, id, entry.message),
      None => println("{s} {s}", level, entry.message),
    },
  };

  for field in entry.fields {
    println("  {s}={s}", field.key, field.value);
  }

  return None;
}

export fn parse_level (raw: string) -> Result(Level, string) {
  if raw == "trace" { return Ok(Level::Trace); }
  if raw == "debug" { return Ok(Level::Debug); }
  if raw == "info" { return Ok(Level::Info); }
  if raw == "warn" { return Ok(Level::Warn); }
  if raw == "error" { return Ok(Level::Error); }
  return Err("unknown log level");
}

export fn level_name (level: Level) -> string {
  return match (level) {
    Level::Trace => "trace",
    Level::Debug => "debug",
    Level::Info => "info",
    Level::Warn => "warn",
    Level::Error => "error",
  };
}

fn level_value (level: Level) -> int {
  return match (level) {
    Level::Trace => 5,
    Level::Debug => 10,
    Level::Info => 20,
    Level::Warn => 30,
    Level::Error => 40,
  };
}

fn visible_target (config: &Config) -> string? {
  if config.include_target {
    return Some(config.target);
  }
  return None;
}

fn default_target () -> string {
  if attr(target="wasm32-wasi") { return "wasi"; }
  if attr(os="linux") { return "linux"; }
  if attr(os="macos") { return "macos"; }
  if attr(os="windows") { return "windows"; }
  return "app";
}
```

This is still compact, but it is no longer a print helper. It has:

- filtering (`Logger.enabled`),
- target/module naming (`Config.target`, `Logger.with_target`),
- optional request/correlation IDs (`request_id: string?`),
- multiple structured fields per call (`fields: Field[]`),
- a configurable writer hook (`WriteFn`) for file, JSON, syslog, or test sinks,
- a source-level sink contract (`interface Sink`) for concrete sink types,
- a concrete console writer,
- recoverable parse errors (`Result(Level, string)`),
- recoverable write errors (`LogError?`),
- and target-aware defaults through `attr(...)`.

## Downstream Use

`examples/main.slk` imports the package's default module namespace and handles parse/write
outcomes explicitly:

```silk
import logger from "logger";

fn main () -> int {
  let min_level = match (logger::parse_level("info")) {
    Ok(level) => level,
    Err(_) => logger::Level::Info,
  };

  let log = logger::init(logger::Config{
    min_level: min_level,
    target: "checkout",
    include_target: true,
    writer: logger::console_writer,
  });

  let fields: logger::Field[] = [
    logger::Field{ key: "total_usd", value: "42.00" },
    logger::Field{ key: "payment", value: "card" },
  ];

  let err = logger::info(
    &log,
    "accepted order",
    Some("req-7f1a"),
    fields
  );

  if err != None {
    return 1;
  }

  return 0;
}
```

Selected imports are useful when a module owns the logging setup:

```silk
import { Config, Field, Level, console_writer, init, warn } from "logger";

fn main () -> int {
  let log = init(Config{
    min_level: Level::Warn,
    target: "scheduler",
    include_target: true,
    writer: console_writer,
  });

  let fields: Field[] = [Field{ key: "attempt", value: "2" }];
  warn(&log, "retrying job", None, fields);
  return 0;
}
```

## Replacing the Writer

A real application usually keeps logger setup in one module and injects a
writer. The public logger API stores a `WriteFn`, so callers can swap console,
file, JSON, syslog, or test writers without changing call sites.

```silk
import logger from "logger";
import { println } from "std/io";

fn audit_writer (entry: &logger::Entry) -> logger::LogError? {
  println("audit=true");
  return logger::console_writer(entry);
}

fn main () -> int {
  let base = logger::init(logger::default_config());
  let audit = logger::with_writer(&base, audit_writer);
  let fields: logger::Field[] = [logger::Field{ key: "subject", value: "order" }];

  let err = logger::warn(&audit, "manual review required", Some("req-88"), fields);
  if err != None { return 1; }
  return 0;
}
```

`interface Sink` is still valuable for concrete sink types that want conformance
checking inside one build. It is a source-level contract, not a stable
open-world plugin ABI. Across FFI or separately built libraries, expose explicit
functions such as `logger_write_c` instead.

## Definition Module

`defs/api.slk` mirrors the public type-checking surface:

```silk
module acme::logger;
export enum Level {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
}

export error LogError {
  message: string
}

export struct Field {
  key: string,
  value: string,
}

export struct Entry {
  level: Level,
  target: string?,
  message: string,
  request_id: string?,
  fields: Field[],
}

export type WriteFn = fn (entry: &Entry) -> LogError?;

export interface Sink {
  fn write(entry: &Entry) -> LogError?;
}

export struct ConsoleSink {}

export struct Config {
  min_level: Level,
  target: string,
  include_target: bool,
  writer: WriteFn,
}

export struct Logger {
  config: Config,
}

export fn default_config () -> Config;
export fn init (config: Config) -> Logger;
export fn enabled (logger: &Logger, level: Level) -> bool;
export fn with_target (logger: &Logger, target: string) -> Logger;
export fn with_writer (logger: &Logger, writer: WriteFn) -> Logger;
export fn log (logger: &Logger, level: Level, message: string, request_id: string?, fields: Field[]) -> LogError?;
export fn debug (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError?;
export fn info (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError?;
export fn warn (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError?;
export fn error (logger: &Logger, message: string, request_id: string?, fields: Field[]) -> LogError?;
export fn console_writer (entry: &Entry) -> LogError?;
export fn parse_level (raw: string) -> Result(Level, string);
export fn level_name (level: Level) -> string;
export fn logger_write_c (level: int, target: string, message: string) -> int;
```

Definition modules use `module ...;` because they describe an importable
surface without implementation bodies. Binary packages can ship this file plus
`lib/<target>/...` artifacts.

## Tests

`tests/logger_test.slk` exercises parsing and filtering:

```silk
import logger from "logger";
import { expect, expect_equal } from "std/test";

test "parse level" {
  match (logger::parse_level("warn")) {
    Ok(level) => expect_equal(logger::Level::Warn, level),
    Err(_) => expect(false, Some("warn parses")),
  };
}

test "filter debug when minimum is info" {
  let log = logger::init(logger::Config{
    min_level: logger::Level::Info,
    target: "test",
    include_target: false,
    writer: logger::console_writer,
  });

  expect(logger::enabled(&log, logger::Level::Info), Some("info is enabled"));
  expect(logger::enabled(&log, logger::Level::Debug) == false, Some("debug is filtered"));
}
```

Run the package tests:

```bash
silk test --package .
```

## Loading Rules

The imports above resolve through the active module set:

- `std/io` and `std/test` load stdlib modules from the configured std root.
- `Result` is a std-prelude global from `std::runtime::globals`, so it does not
 need an import in user-space modules.
- `logger` resolves through the dependency key or package root named `logger`;
 by convention it loads the package's `src/lib.slk` module.
- `./file.slk` resolves relative to the importing file.

Quoted import specifiers use `/` path separators. Do not put `::` inside the
string; `::` belongs to direct package/symbol imports and qualified names.

For local development, downstream apps should use a path dependency:

```toml
[dependencies]
logger = { path = "../logger", version = "^0.1.0" }
```

Source still imports the package through the dependency module specifier:

```silk
import logger from "logger";
```

The dependency key (`logger`) is manifest-local. Source files inside the package
declare the corresponding symbol namespace with `package acme::logger;`.

## Build Targets

Build the demo executable:

```bash
silk build --package . --package-target logger_demo
```

Build the static library and C header:

```bash
silk build --package . --package-target logger_static
```

Build the WASI demo:

```bash
silk build --package . --package-target logger_wasi_demo
```

Target selection changes code guarded with `attr(os="...")` and
`attr(target="...")`. The quoted dependency module specifier stays `logger`.

## ABI and FFI Edge

Most user code should avoid direct package imports. ABI code is the exception
because it intentionally names linker-visible exports.

`src/c_api.slk` exposes a C-friendly wrapper:

```silk
package acme::logger;

export fn logger_write_c (level: int, target: string, message: string) -> int {
  let ctx = init(Config{
    min_level: Level::Info,
    target: target,
    include_target: true,
    writer: console_writer,
  });

  let err = log(&ctx, level_from_int(level), message, None, []);
  if err != None { return 1; }
  return 0;
}

fn level_from_int (level: int) -> Level {
  if level <= 5 { return Level::Trace; }
  if level <= 10 { return Level::Debug; }
  if level <= 20 { return Level::Info; }
  if level <= 30 { return Level::Warn; }
  return Level::Error;
}
```

The generated header uses the ABI shapes from `silk/silk.h`. A minimal C caller
can pass borrowed string views into the exported wrapper:

```c
#include <silk/silk.h>
#include "acme_logger.h"

static SilkString silk_str(const char *ptr) {
  SilkString s = { .ptr = (char *)ptr, .len = 0 };
  while (ptr[s.len] != '\0') s.len++;
  return s;
}

int main(void) {
  return logger_write_c(
      20,
      silk_str("ffi"),
      silk_str("hello from C"));
}
```

An ABI-facing Silk consumer can import the exact exported symbol:

```silk
import acme::logger::logger_write_c;

fn main () -> int {
  return logger_write_c(20, "ffi", "hello from a direct ABI symbol");
}
```

That import binds the `logger_write_c` ABI/export path directly. It is useful
for definition modules, FFI wrappers, and low-level integration tests. Ordinary
application code should use:

```silk
import logger from "logger";
```

## Publishing on GitHub

GitHub can distribute the same package root that local builds use:

```bash
git tag v0.1.0
git archive --format=tar --prefix=logger-0.1.0/ v0.1.0 | gzip > logger-0.1.0.tar.gz
```

Consumers can unpack it and use a path dependency:

```toml
[dependencies]
logger = { path = "vendor/logger", version = "^0.1.0" }
```

For package-search-path consumption, place the root under a directory layout
that matches the manifest package name:

```text
vendor/logger/silk.toml
```

Then:

```bash
export SILK_PACKAGE_PATH="$PWD/vendor"
silk build --package .
```

## Publishing on npm

npm can act as a transport for a Silk package root. Silk reads files from disk;
it does not fetch npm packages itself.

Minimal `package.json`:

```json
{
  "name": "@acme/silk-logger",
  "version": "0.1.0",
  "description": "Structured logging package for Silk applications",
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

After `npm install @acme/silk-logger`, consumers can depend on the installed
directory directly:

```toml
[dependencies]
logger = { path = "node_modules/@acme/silk-logger", version = "^0.1.0" }
```

If you want `SILK_PACKAGE_PATH` lookup instead, materialize the package under a
search root that mirrors the package name `logger`:

```text
packages/logger -> ../../node_modules/@acme/silk-logger
```

Then set:

```bash
export SILK_PACKAGE_PATH="$PWD/packages"
```

## Best Practices

- Keep the public import style user-facing: `import logger from "logger";`.
- Use direct `import package::ns::symbol;` imports only in ABI/FFI code.
- Keep a narrow public API in `defs/api.slk`.
- Treat `Config` as the stable setup surface; add new behavior there before
 changing logger call signatures.
- Keep sink-specific code behind `WriteFn` functions or concrete types that
 satisfy `interface Sink`; add file, JSON, or syslog sinks as separate modules.
- Use `LogError?` for write paths where failure is uncommon but must be visible.
- Use `Result` for parsing or configuration loading where failure
 carries a message.
- Keep target-specific defaults behind `attr(os="...")` or
 `attr(target="...")`.
- Publish the same `silk.toml` package root through GitHub, npm, vendored
 directories, or system packages.

## Next

- [Modules, Packages, and Publication](?p=guides/modules-and-packages)
- [Packages, Imports, and Exports](?p=language/packages-imports-exports)
- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
