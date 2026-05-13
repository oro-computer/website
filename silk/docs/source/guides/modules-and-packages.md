# Modules, Packages, and Publication

Silk code is organized around explicit module sets. A module set is the group of
`.slk` files the compiler loads, resolves, checks, and builds together. Packages
give those files a public namespace, imports describe dependencies, and manifests
make the package root portable across local workspaces, GitHub releases, npm
packages, and system installs.

This guide is the user-space view of that system. For exact grammar and edge
cases, use [Packages, Imports, and Exports](?p=language/packages-imports-exports).

## The model

- A **source file** is one `.slk` file.
- A **module** is a compile-time namespace. It may be a file namespace, a
 header-form `module ...;`, or an inline `module Name { ... }`.
- A **package** is a named collection of modules that share a namespace and a
 `silk.toml` package identity.
- A **module set** is the concrete set of modules loaded for one compiler
 command.
- A **package root** is a directory with `silk.toml`; this is the unit you
 publish or depend on.

The most important practical rule: imports resolve against the module set. A
package can only be imported after the compiler knows where that package root or
source file lives.

## File layout

A reusable package usually looks like this:

```text
logger/
  silk.toml
  README.md
  LICENSE
  src/
    lib.slk
    sinks.slk
  defs/
    api.slk
  examples/
    main.slk
  tests/
    logger_test.slk
```

Conventions:

- `src/` contains implementation modules.
- `defs/` contains prototype/interface modules for public ABI or binary package
 consumers.
- `examples/` contains copyable downstream examples.
- `tests/` contains package-local tests.
- `silk.toml` declares package metadata, sources, dependencies, targets, and the
 distribution file set.

## Defining modules

Most user-space files start with a package declaration:

```silk
package oro::logger;

import { println } from "std/io";

export fn info (message: string) -> void {
  println("[info] {s}", message);
}
```

Rules that keep tooling simple:

- `package ...;` or `module ...;` comes first.
- Imports form one contiguous block immediately after the package/module header.
- Exports are explicit.
- Source package declarations use `::` namespaces.
- Manifest package names are simple identifiers such as `logger` or
 `oro_logger`.
- Quoted import specifiers use filesystem-style paths such as `logger` or
 `logger/sinks`.

Use `package ...;` for reusable application/library code. Use header-form
`module ...;` when you need a compile-time-only namespace or module conformance
surface, especially in definition/prototype files.

Inline modules are useful for nested namespaces inside one package:

```silk
package oro::logger;

export module level {
  export let INFO: int = 20;
  export let ERROR: int = 40;
}
```

Downstream code can then refer to `logger::level::INFO` after importing the
package's default module namespace.

## Import style for user-space code

Prefer module-specifier imports:

```silk
import { println } from "std/io";
import fs from "std/fs";
import logger from "logger";
import { Logger, info as log_info } from "./lib.slk";
```

Use these forms as your default:

- `import ns from "specifier";` binds a namespace, then call
 `ns::symbol(...)`.
- `import { Name } from "specifier";` imports selected exported names.
- `import { Name as LocalName } from "specifier";` gives a local alias.
- `import "./file.slk";` loads a module for side effects such as prototype
 conformance without binding names.

Specifier meanings:

- `./x.slk` or `../x.slk` resolves relative to the importing file.
- `std/io` resolves from the configured stdlib root.
- `logger` resolves through the dependency key or package root named `logger`.
- `logger/sinks` resolves to the `sinks` module inside that package root.

String import specifiers are path-like. Use `/` for module paths inside the
string, not `::`. Reserve `::` for source namespaces, direct package/symbol
import paths, and qualified names in code.

This form scales well because it works for local files, stdlib modules, and
dependencies while keeping aliases explicit.

## Std prelude globals

When the standard library is enabled, the compiler automatically loads
`std::runtime::globals`. That module exposes a small prelude with `using`
aliases for common std types and interfaces. User code does not import these
names.

The current global list is:

```text
Boolean
Builder
Capacity
Clear
Deserialize
Drop
Function
IsEmpty
Iterator
Len
Number
Parse
Range
ReadU8
RegExp
ReserveAdditional
Result
Serialize
Sized
String
TrySerialize
WriteU8
```

Use those names directly. For example, write `Result(T, E)` rather than
importing `std/result` only to reach the defining module.

## Direct package and symbol imports

Silk also supports direct import paths:

```silk
import oro::logger;
import oro::logger::info;
import ::puts;
```

These are ABI-oriented imports. They name the package/export path directly, so
they are useful for:

- definition/prototype modules that describe an ABI surface,
- FFI wrappers that expose exact linked symbols,
- stdlib/runtime internals,
- and explicit global namespace access such as `::malloc`.

Effects:

- `import oro::logger;` imports the package namespace directly.
- `import oro::logger::info;` binds the exported symbol `info` directly in the
 importing module.
- `import ::puts;` resolves `puts` from the unnamed global package.

For ordinary user-space modules, prefer:

```silk
import logger from "logger";
import { info } from "logger";
```

That keeps low-level ABI paths out of most code and gives you aliases through
the same import form.

## Exports

Exports define the public surface other modules may depend on:

```silk
package oro::logger;

export enum Level {
  Debug,
  Info,
  Warn,
  Error,
}

export struct Logger {
  min_level: Level,
}

export fn info (logger: &Logger, message: string) -> void {
  log(logger, Level::Info, message);
}
```

Best practices:

- Export only the surface you intend downstream users to call.
- Keep implementation helpers private by leaving off `export`.
- Prefer one small public namespace over many unrelated exported names.
- Use a `defs/api.slk` prototype file when a package may be consumed as a
 prebuilt binary.

## Manifests and module loading

`silk.toml` is the package root manifest:

```toml
[package]
name = "logger"
version = "0.1.0"
description = "Small structured logger for Silk examples"
license = "MIT"
repository = "https://github.com/oro-computer/silk-logger"
readme = "README.md"
definitions = ["defs/api.slk"]

[sources]
include = ["src/**/*.slk", "defs/**/*.slk", "examples/**/*.slk"]

[dist]
include = ["silk.toml", "README.md", "LICENSE", "src/**", "defs/**"]

[[target]]
name = "logger"
kind = "static"
entry = "src/lib.slk"
output = "build/liblogger.a"
c_header = "build/logger.h"

[[target]]
name = "logger_demo"
kind = "executable"
entry = "examples/main.slk"
output = "build/logger-demo"
```

How loading works:

- `silk build --package .` reads `silk.toml` and loads files selected by
 `[sources]`.
- A dependency with `path = "../logger"` is loaded from that directory.
- A dependency without `path` is searched through `SILK_PACKAGE_PATH` and the
 installed package roots.
- Manifest package names are identifiers; `logger` maps to
 `logger/silk.toml` under each search root.
- Quoted imports use dependency-rooted module paths: `import logger from
 "logger";` loads the dependency's default module, and `import sinks from
 "logger/sinks";` loads a submodule.
- Source modules may still declare a symbol namespace such as
 `package oro::logger;`.

## Dependencies

A package depends on another package through `[dependencies]`:

```toml
[dependencies]
logger = { path = "../logger", version = "^0.1.0" }
```

Then source can import the dependency through the dependency key:

```silk
import logger from "logger";

fn main () -> int {
  let l = logger::Logger{ min_level: logger::Level::Info };
  logger::info(&l, "hello");
  return 0;
}
```

For local development, prefer `path`. For published packages, use a version
requirement plus a package root materialized by your chosen distribution system.

## Publishing through GitHub

Silk does not require a Silk-owned registry. A GitHub release can publish the
same package root users build locally:

```bash
git archive --format=tar --prefix=logger-0.1.0/ v0.1.0 | gzip > logger-0.1.0.tar.gz
```

Recommended release payload:

- `silk.toml`
- `README.md` and license files
- `src/**` for source packages
- `defs/**` for importable public surfaces
- `lib/<target>/**` for prebuilt libraries, when shipped
- `share/man/**` or `docs/**` for package docs

Consumers can unpack the archive and either:

- use a path dependency,
- vendor it under `./packages/logger`,
- or add the parent search root to `SILK_PACKAGE_PATH`.

## Publishing through npm

npm can act as a transport for a Silk package root. Silk still consumes files
from disk; the compiler does not fetch npm packages itself.

Minimal `package.json` next to `silk.toml`:

```json
{
  "name": "@oro/silk-logger",
  "version": "0.1.0",
  "description": "Small structured logger for Silk examples",
  "files": [
    "silk.toml",
    "README.md",
    "LICENSE",
    "src",
    "defs",
    "lib",
    "share"
  ]
}
```

After installation, depend on the installed package root by path:

```toml
[dependencies]
logger = { path = "node_modules/@oro/silk-logger", version = "^0.1.0" }
```

If the npm package root is `node_modules/@oro/silk-logger` but the Silk package
name is `logger`, either place or symlink the package under a search root as
`logger`, or use a manifest `path` dependency directly to the installed package
directory.

## Targets and platform selection

Targets describe build outputs, not imports. A single package can expose one
public module surface and build different artifacts:

```toml
[[target]]
name = "logger_static"
kind = "static"
entry = "src/lib.slk"
target = "linux-x86_64"
output = "build/linux-x86_64/liblogger.a"

[[target]]
name = "logger_wasi"
kind = "executable"
entry = "examples/main.slk"
target = "wasm32-wasi"
output = "build/logger.wasm"
```

Inside code, use `attr(...)` for compile-time selection:

```silk
import { println } from "std/io";

attr(os="linux") fn platform_note () -> string { return "linux"; }
attr(os="macos") fn platform_note () -> string { return "macos"; }
attr(target="wasm32-wasi") fn platform_note () -> string { return "wasi"; }

fn main () -> int {
  println("{s}", platform_note());
  return 0;
}
```

Use target gates sparingly. Prefer portable stdlib code first, then isolate
target-specific code in small modules or functions.

## ABI and FFI packages

When a package exposes native ABI, ship a definition file:

```silk
// defs/api.slk
module oro::logger as LoggerAbi;

export struct LoggerHandle;
export fn logger_new () -> &LoggerHandle;
export fn logger_free (handle: &LoggerHandle) -> void;
export fn logger_info (handle: &LoggerHandle, message: string) -> void;
```

Implementation modules may use `ext` to bind C symbols or may provide Silk
`export fn` bodies directly. Binary-only packages ship the `defs/` file plus a
compatible artifact in `lib/<target>/`.

Direct package/symbol imports are appropriate in this layer because the code is
describing ABI paths intentionally:

```silk
import oro::logger::logger_info;
import ::puts;
```

User code should normally import the friendly namespace instead:

```silk
import logger from "logger";
```

## Best practices

- Prefer `import ns from "module"` for namespaces and
 `import { Name } from "module"` for selected names.
- Use direct `package::symbol` imports only when naming ABI/export paths is the
 point.
- Keep a package's public surface small and exported deliberately.
- Put reusable public prototypes in `defs/` when publishing libraries.
- Keep source packages buildable without network access.
- Make GitHub/npm/system packages materialize the same package root.
- Use `[dist]` so published files are intentional.
- Put platform-specific code behind `attr(os="...")` or `attr(target="...")`,
 and keep those gates narrow.

## Next

- [Practical logger module walkthrough](?p=guides/practical-logger-module)
- [Standard library](?p=guides/standard-library)
- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
