# Modules & packages

Silk uses `::`-qualified names to organize code. The goal is not novelty — it’s **clarity**:

- you can see where names come from,
- you can see what depends on what,
- and builds stay deterministic because the compiler always knows what the module set is.

This page focuses on the practical model you’ll use in real code.

## Packages

A **package** is a named collection of source files that share a namespace. A file can declare its package at the top:

```silk
package my_app::core;
```

Package names are `::`-qualified paths. The standard library lives under `std::...` (for example `std::io`, `std::fs`,
`std::strings`).

### Importing packages

When you import a package, you are declaring a dependency on that package’s public surface:

```silk
import std::strings;
```

Exports are explicit (`export fn`, `export let`, and named re-exports). This keeps public API surfaces intentional.

### A tiny multi-file example

`util.slk`:

```silk
package app::util;

export fn add (a: int, b: int) -> int { return a + b; }
```

`main.slk`:

```silk
package app;

import app::util;
import std::io::println;

fn main () -> int {
  println("sum={d}", app::util::add(20, 22));
  return 0;
}
```

The important thing is how *obvious* this is: `main` depends on `app::util` and `std::io::println`, and nothing else is
implicitly pulled in.

## Modules

A **module** declaration is a compile-time-only namespace value. It lets you write code that is “about” a module, including
module-level conformance checks.

```silk
module my_app::logger;
```

Modules are useful when you want a named namespace in a single file without necessarily treating it as “a package you import
from other files”.

In addition to header-form modules, you can define inline modules for nested namespaces:

```silk
package my_app;

export module math {
  export fn add (a: int, b: int) -> int { return a + b; }
}
```

## Imports: whole packages vs individual symbols

Silk supports a small set of import forms that cover most real programs:

- **package imports** for cohesive namespaces
- **symbol imports** when you want a single dependency in scope
- **module-specifier imports** (for relative files, `std/` file paths, or package specifiers)

```silk
import std::io::println;
import std::strings;
```

Use package imports when you want a cohesive namespace; use symbol imports when you want explicit local dependencies.

## Exports: keeping APIs deliberate

Exports define what other packages can depend on.

Common forms:

```silk
export let version: string = "0.1.0";

export fn parse (s: string) -> int? {
  return None;
}

export { parse as parse_port };
```

This “explicit exports” rule is a major readability win in larger codebases: public surfaces stay curated.

## The CLI view: module sets and package manifests

The compiler always operates on a **module set**: the set of `.slk` files compiled together for that command.

You can define the module set explicitly (a list of files), or you can load it from a package manifest (`silk.toml`) using
`--package`.

Why this matters for packages/modules:

- Package imports only resolve to packages that exist in the module set.
- Tooling can answer questions like “what packages exist?” without executing code.
- Builds become reproducible because “what was compiled” is not a hidden global.

If you want the user-facing toolchain model, read: [CLI and toolchain](?p=guides/cli).

## Why this structure matters

The language design is intentionally strict about where these declarations live (package/module headers first, then a
contiguous import block). The payoff is large in practice:

- tools can parse dependency structure without executing code
- refactors are safer because imports and exports are explicit
- builds can be reproducible because module sets are well-defined

## Next

- [Standard library](?p=guides/standard-library)
- [Testing](?p=guides/testing)
