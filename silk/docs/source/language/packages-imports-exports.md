# Packages, Imports, and Exports

This document specifies the initial surface syntax for packages, imports, and
exports in Silk. The semantics are intentionally minimal for now and will be
extended as the compiler’s resolver and linker mature.

## Implementation Status (Current Compiler Subset)

Implemented:

- `package <path>;` declarations (with the module ordering rules below).
- `module <path>;` declarations (mutually exclusive with `package`) including
  `module ... as <Interface>;` conformance checking.
- Inline module declarations (`module Name { ... }` / `export module Name { ... }`)
  for nested namespaces.
- A contiguous top-level `import` block (package imports and `from "..."` module
  specifier imports).
- Named re-exports: `export { Name, Other as Alias };` (exports an in-scope value
  name so other modules may import it).
- Package imports (`import std::strings;`) that make a package’s exported values
  available for use in the importing source file.
- Qualified symbol imports (`import std::strings::Builder;`, `import std::io::println;`,
  `import ::malloc;`) that bring a single symbol into scope without importing the
  entire package namespace.
- Module-specifier imports (`import { Name } from "...";`, `import ns from "...";`)
  including:
  - relative file imports (`from "./file.slk"`),
  - std-root file imports (`from "std/strings"`; `.slk` is appended when missing),
  - and package specifier imports (`from "ns_pkg"`, `from "ns_pkg/subpath"` where `/`
    is treated as `::` for namespace paths).
- Default exports (`export default fn ...` and `export default Name;`) and default
  imports that bind either:
  - the default-exported symbol, or
  - the module namespace when no default export exists.
- Declaration-only exported function prototypes (`export fn name(...) -> T;`)
  for header-style “prototype modules” that describe an exported surface without
  providing a body (satisfied by link-time definitions from other Silk sources
  and/or `.o`/`.a` inputs).

Not implemented yet:

- Package-import aliasing (for example `import std::strings as str;`).
- Bulk re-exports (“export from ...”) and forwarding of export surfaces.
- A stable, fully specified “package build” system outside the current CLI/module-set
  model (see `docs/compiler/package-manifests.md` for current manifest support).

Working examples (recommended to read alongside this doc):

- Package imports: `tests/silk/pass_import_std_strings.slk`, `tests/silk/pass_import_std_arrays_methods.slk`, `tests/silk/pass_import_pkg_util.slk`
- File imports (named + default): `tests/silk/pass_file_import_named_values.slk`,
  `tests/silk/pass_file_import_default_export.slk`,
  `tests/silk/pass_import_namespace_file_no_default.slk`
- Package specifier imports (`from "..."`): `tests/silk/pass_import_namespace_package.slk`,
  `tests/silk/pass_import_named_from_package_spec.slk`

When an import fails, the relevant error codes live in `docs/compiler/diagnostics.md`
(notably `E1001`–`E1006`, plus `E2003`/`E2004` for invalid imported names).

## Terminology

- **Source file**: a single `.slk` source file.
- **Package**: a named collection of source files that share a namespace (declared via
  `package ...;`).
- **Module declaration**: a `module ...;` header that declares a namespace and a
  **compile-time-only** module value, and may declare interface conformance via `as`.
- **Module set**: the set of source files the compiler is compiling together for a
  given command. Package imports can only resolve to packages that exist in this
  module set.
- **Named import**: `import { A, B as C } from "...";` (introduces unqualified names).
- **Default import**: `import X from "...";` (binds either a default export symbol or
  a namespace, depending on what is imported).
- **Namespace import**: a default import that binds a module or package namespace; you
  access its members as `X::Name`.

## Packages

A Silk program is organized into packages and source files.

Each source file may declare the package it belongs to using a `package`
declaration at the top of the file:

```silk
package my_app::core;
```

Rules:

- Each module MAY declare at most one `package` declaration.
- When present, the `package` declaration MUST appear before all other
  top-level declarations in the module; it is the first declaration in
  the file.
- Package names are sequences of identifiers separated by `::`.
  - As a special case, the keyword `task` is permitted as a `::`-qualified
    segment so `std::task` is a valid package name.
  - `std::strings`
  - `std::task`
  - `my_app::core`
  - `example`
- The standard library lives under the reserved `std::` namespace, for
  example `std::strings`, `std::memory`, etc.

If a source file omits a `package` declaration, it is treated as belonging to an
implementation-defined default package (for example, the “main” package for
an executable). The exact rules for default packages will be specified as
multi-module builds are implemented.

In the current `silk` CLI implementation, when building a package via a package
manifest (`silk.toml`), source files that omit `package` default to the
manifest’s `package.name`. See `docs/compiler/package-manifests.md`.

## Modules (`module`)

`module` declares a named module namespace and a **compile-time-only** module
value.

Syntax:

```silk
module my_app::core;
module my_app::core as SomeInterface;
```

Rules:

- A source file MAY declare at most one `module` declaration.
- A source file MAY declare at most one of:
  - a `package` declaration, or
  - a `module` declaration.
- When present, the `module` declaration MUST appear before all other top-level
  declarations in the source file; it is the first declaration in the file.
- Module names follow the same `::`-qualified naming rules as packages.
- Modules are **compile-time-only** values: there is no runtime representation
  for a module value.
- If a module declares `as <Interface>`, the compiler MUST validate that the
  module satisfies the interface surface as specified in
  `docs/language/interfaces.md`.

### Inline modules (`module Name { ... }`)

In addition to the source file header form (`module ...;`), Silk supports
**inline modules** as a nested-namespace mechanism inside a file:

```silk
package my_package;

export module inner_module {
  export fn hello () -> string {
    return "hello world";
  }
}
```

Rules (current compiler subset):

- Inline modules MUST appear at top level (not inside function blocks).
- The inline module name is a single identifier.
- The body is a brace-delimited list of top-level declarations; inline modules
  may be nested.
- `package`, header-form `module ...;`, and `import` declarations are not
  permitted inside an inline module body.
- Declarations inside an inline module are referenced from outside using `::`
  qualification (`inner_module::hello()`).
- Within an inline module body, unqualified name lookup for inline-module
  declarations is not implemented yet in the current compiler subset; use
  explicit `::` qualification.
- `export module Name { ... }` exports the namespace:
  - exported declarations inside it become part of the containing package’s
    export surface with their names prefixed by `Name::` (for example
    `inner_module::hello`),
  - nested `export module` declarations extend the prefix (for example
    `outer::inner::name`).

## Source File Header Ordering (Mandatory)

In each source file, top-level declarations must appear in this order:

1. Optional `package` or `module` declaration (`package ...;` or `module ...;`).
2. Zero or more `import` declarations, as a contiguous block.
3. All other top-level declarations.

This ordering is enforced by the parser/resolver and keeps dependency structure
easy to understand and tooling-friendly.

## Imports

Source files may refer to other packages or modules via `import` declarations:

```silk
package my_app::core;

import std::strings;

fn main () -> int {
  return 0;
}
```

Rules:

- `import` declarations MUST appear at top level (not inside functions or
  blocks).
- All `import` declarations in a module, if any, MUST appear after the
  optional `package` declaration (if present) and before any other kind of
  top-level declaration. In other words, imports form a contiguous block at
  the beginning of the module immediately following the optional package.
- An `import` path is a sequence of identifiers separated by `::`, matching
  the package naming rules above (including the `std::task` special case).
  - As with expression/type qualified names, an import path MAY start with `::`
    to explicitly name the global namespace (the unnamed package).
- `import` declarations identify dependencies and bring exported symbols
  from the imported package into scope in the importing module, subject to
  the visibility rules below.
- In the current implementation:
  - importing a package makes its exported `let` bindings with explicit
    type annotations visible as ordinary, unqualified names in the
    importing module (for example, `import util;` followed by `answer`
    refers to `util::answer` when `util` exports `let answer: int = 42;`),
  - imported exported `let` bindings are also reachable via qualified
    names of the form `pkg::name` (for example, `util::answer` after
    `import util;`); both unqualified (`answer`) and qualified
    (`util::answer`) forms are accepted for now, but the qualified form
    reflects the intended package-namespaced style,
  - exported functions (`export fn`) are callable across packages for the
    compiler’s current backend subset:
    - within a package, top-level functions form a shared namespace across
      all modules in that package (so functions in one module may call
      functions defined in another module of the same package),
    - when a module imports a package, that package’s `export fn`
      declarations become callable from the importing module,
    - both unqualified (`foo()`) and qualified (`util::foo()`) call forms
      are accepted initially for imported exports, matching the current
      constant-import behavior, though the qualified form reflects the
      intended package-namespaced style,
    - this callable subset is limited to the compiler’s current
      code generation subset (supported parameters/results, direct calls, and
      structured control flow supported by the IR→ELF backend on
      `linux/x86_64`),
  - struct type names (`struct` declarations) from imported packages are visible in the importing module for the current supported `struct` subset:
    - the qualified form `pkg::Struct` is always accepted when `pkg` is imported,
    - the unqualified form `Struct` is accepted when it is unambiguous across the module’s imports and does not conflict with a locally defined struct name,
    - when multiple imported packages define the same struct name, the unqualified form is rejected as ambiguous and the qualified form must be used,
  - enum type names (`enum` declarations) from imported packages are visible in the importing module for the current supported enum subset:
    - the qualified form `pkg::Enum` is always accepted when `pkg` is imported,
    - the unqualified form `Enum` is accepted when it is unambiguous across the module’s imports and does not conflict with a locally defined type name,
    - enum variants are referenced relative to the enum name (`Enum::Variant` or `pkg::Enum::Variant`),
  - if an imported package does not exist, resolution fails before
    type-checking (see the resolver).
  - a leading `::` on a qualified name forces lookup in the **global namespace**
    (the unnamed package), bypassing any same-named declarations in the current
    package or imported packages. This is intended as an explicit escape hatch
    for shadowing (for example, calling `::malloc(...)` when the current module
    also defines or exports `malloc`). The prefix is valid in both expression
    and type positions, including:
    - values: `::malloc(...)`,
    - types and struct literals: `::Foo` and `::Foo{...}`,
    - enum variant paths/patterns: `::E::Variant`.

### Qualified Symbol Imports

In addition to importing whole packages, a module may import a single symbol by
fully qualifying it:

```silk
import std::io::println;
import std::url::URL;
import ::malloc;
```

Semantics:

- If the import path matches a package name present in the module set, it is a
  **package import** (`import std::io;`).
- Otherwise, it is treated as a **qualified symbol import**:
  - the compiler finds the longest package-name prefix of the path,
  - the remaining suffix is the symbol name within that package (it may contain
    `::` due to exported inline modules),
  - the symbol is introduced into the importing module under its final path
    segment (for example, `println` for `import std::io::println;`).
- When the import path begins with `::`, the symbol is resolved from the global
  namespace (the unnamed package) and is not subject to package export gating.

`import { Name } from "...";` remains the preferred form when you need to rename
imports (`as`) or import from a file path.

Global namespace (`::name`) rules (current compiler subset):

- The global namespace is the package formed by modules that have **no**
  `package ...;` or header-form `module ...;` declaration (their package name is
  empty).
- `::Name` resolves `Name` from that global namespace, if a matching declaration
  exists in the current module set.
- `::Outer::Inner::Name` resolves `Outer::Inner::Name` from that same global
  namespace (for example, names nested under inline modules in a global module).
- Global names are only accessible via the explicit `::` prefix; there is no
  implicit “prelude import” of global symbols.

Future extensions may introduce aliasing (e.g. `import std::strings as str;`)
and more fine-grained import forms. Such features will be documented here
before they are implemented.

### Example: a two-module package program

Two modules can share a package name and export symbols for other packages to
use.

```silk
// util.slk
package util;

export let answer: int = 41;

export fn add1 (x: int) -> int {
  return x + 1;
}
```

```silk
// app.slk
package app;

import util;

fn main () -> int {
  // In the current implementation, both unqualified and qualified access are
  // accepted after importing a package. Prefer the qualified form to make the
  // origin explicit.
  if util::add1(util::answer) != 42 {
    return 1;
  }
  return 0;
}
```

### Package imports resolve against the module set

In the current implementation, a **package import** can only resolve if the
package exists in the current module set.

This matters most when you use package specifiers (`from "ns_pkg"`) or when you
expect a package import to find a package that is not otherwise present.

Tooling note (the `silk` CLI):

- The language semantics are still “imports resolve against the module set”.
  The CLI grows the module set by loading additional source files.
- In addition to auto-loading `std::...` packages from the stdlib root, the CLI
  MAY load non-`std::` packages from a **package search path** when a bare
  package specifier is imported (e.g. `import api from "my_api";`).
- The package search path is configured via `SILK_PACKAGE_PATH` (PATH-like:
  roots separated by `:` on POSIX).
- A package name like `my_api::core` maps to the filesystem candidate
  `<root>/my_api/core/silk.toml`. The first matching manifest in search order is
  used.
- Qualified imports that include extra `::` segments (e.g. `my_api::core::Thing`)
  are treated as qualified symbol imports: the CLI resolves the **longest**
  package prefix that exists (`my_api::core`, then `my_api`) and loads that
  package into the module set.

Example: bringing a package into the module set via a file import, then importing
the package namespace:

```silk
// main.slk
import { answer as ignored } from "./support_pkg_ns_pkg.slk"; // declares `package ns_pkg;`
import pkg from "ns_pkg"; // now resolves because `ns_pkg` exists in the module set

fn main () -> int {
  return pkg::add1(pkg::answer);
}
```

If you omit the file import (or otherwise fail to include a module that declares
`package ns_pkg;`), the package import fails with `E1001` (“unknown imported package”).

From the CLI, the usual fix is to ensure the missing package’s module(s) are
part of the command’s module set (for example by passing their `.slk` files to
`silk check` / `silk build`, or by adding a file import). See
`docs/compiler/cli-silk.md` and `docs/usage/cli-examples.md`.

## Import Specifier Imports (JS-style)

In addition to `import pkg::name;` package imports, Silk supports JS-style
import forms that use a string literal *import specifier* after `from`.

The current JS-style forms are:

- Named imports: `import { Name } from "<specifier>";`
- Default imports / namespace imports: `import Name from "<specifier>";`
- Ambient imports: `import "<specifier>";`

An import specifier string is interpreted in one of three ways:

- **File specifier**: the string begins with `./` or `../`, or is an absolute
  path. These imports resolve to a module by file path.
- **Std-root file specifier**: the string begins with `std/`. These imports
  resolve to a module by file path under the configured stdlib root (see the
  stdlib root selection rules in `docs/compiler/cli-silk.md` and
  `docs/compiler/abi-libsilk.md`).
- **Package specifier**: any other string. These imports resolve to a package
  by name (for example `"ui"` or `"std::strings"`).

Note: in the current compiler subset, package specifiers are matched literally
against package names present in the module set. In practice this means the
specifier must be a valid Silk package path (identifiers separated by `::`,
with `task` permitted as a `::` segment).

This mirrors the common JS convention that relative file imports must start
with `./` or `../`. Silk additionally reserves the `std/` prefix for stdlib
source imports resolved via the configured stdlib root.

Example (namespace-style imports):

```silk
import ui from "ui";                 // package namespace
import helpers from "./helpers.slk";  // file module namespace (if no default export)

fn main () -> void {
  let opts: &ui::WindowOptions = new ui::WindowOptions();
  helpers::do_something();
}
```

### Ambient imports

An ambient import loads a module into the module set without introducing any
imported names into local scope:

```silk
import "./my_api.slk";
import "std/io";
```

Notes:

- Ambient imports use the same specifier interpretation rules as other
  specifier-based imports:
  - `./` / `../` / absolute paths are resolved as file imports,
  - `std/<path>` is resolved under the configured stdlib root,
  - other strings are treated as package specifiers (for example `"ui"` or
    `"std::strings"`).
- Ambient imports do not bind a namespace or import any symbols. If you need to
  call a function or reference a type from the imported module, use a named
  import, a default import (namespace import), or a package import.
- Ambient imports are useful for declaring dependencies that exist only to:
  - satisfy prototype/definition conformance rules (see below), or
  - ensure a module is present in the module set so its types and methods are
    available for type checking and monomorphization.

### Named imports

Named imports import selected exported names directly into the importing
module:

```silk
import { StringBuilder, write_u8 as writeByte } from "./runtime.slk";
```

Notes:

- There is no combined `import foo, { bar } from "...";` form in the current grammar.
  Use separate `import` declarations.
- For non-`std/` file specifiers, include the `.slk` extension explicitly. (Only
  `std/...` specifiers get `.slk` appended automatically in the current implementation.)

Rules:

- File imports MUST appear in the same import-declaration block as package
  imports: after the optional `package` declaration and before any other
  top-level declaration.
- The `from` keyword is part of the import syntax.
- The `from` specifier may be either:
  - a string literal (`from "./file.slk"`, `from "std/io"`, `from "ns_pkg/sub"`), or
  - a package path (`from std::io;`, `from ns_pkg::sub;`).
- If the specifier is a **file specifier**, it is resolved relative to the
  importing file’s directory. `./` and `../` path segments are permitted.
  (Absolute paths are permitted for tooling, but downstream projects should
  prefer relative imports.)
- If the specifier is a **std-root file specifier** (`"std/<path>"` or
  `"std/<path>.slk"`), it is resolved relative to the configured stdlib root and
  then treated as a file import. If the `.slk` extension is omitted, it is
  appended during std-root resolution.
- If the specifier is a **package specifier**, it is interpreted as a package
  name (using the same `::`-separated syntax as `package` declarations) and is
  resolved via the package graph.
- The imported module MAY declare a `package` or omit it. File specifiers refer
  to the target module *by file path*, not by package name.

Exported names for named imports:

- Named imports can import:
  - exported values: `export fn`, `export let`, and exported `ext` bindings, and
  - type names: `struct`, `enum`, `error`, and `interface` declarations (treated
    as visible across module boundaries in the current implementation),
  - exported type aliases: `export type ...;`, and
  - exported Formal Silk theories: `export theory` declarations (importable so
    they can be applied via `#theory Name(args);`).
- `impl` blocks do not introduce importable names directly, but loading the
  imported module makes its methods available for method-call checking on the
  corresponding types.

Name binding rules:

- Each entry in the `{ ... }` list names one imported symbol.
- `as` can be used to rename an imported symbol (`Name as Alias`).
  - For values (`fn` / `let` / `ext`), this introduces a value alias.
  - For type names (`struct` / `enum` / `error` / `interface`) and exported
    type aliases (`export type`), this introduces a local `type` alias
    (transparent: it does not create a new type identity).
  - For Formal Silk theories (`export theory`), this introduces a theory alias.
- Imported names are introduced into the importing module as unqualified names
  (matching the existing behavior for package imports).
- Importing an unknown name from a file is an error.
- Importing the same value name from multiple file imports without aliasing is
  an error.
- Importing a value name that is already visible in the module (for example
  via same-package scope or a package import) is treated as a no-op in the
  current implementation **unless** it conflicts with a local declaration in
  the importing module.
- Importing a type name that is already visible in the module is treated as a
  no-op in the current implementation.

### Default imports and namespace imports

A module may declare a single *default export* and importing modules may bind
that default export with a JS-style default import:

```silk
// module.slk
package module;

export default fn () -> int {
  return 1 + 2;
}
```

```silk
// main.slk
import foo from "./module.slk";

fn main () -> int {
  let value = foo();
  if (value != 3) {
    return 1;
  }
  return 0;
}
```

Rules:

- Default exports are module-level and are consumed by default imports
  (`import Name from "<specifier>";`).
- A default export may be declared in either of two ways:
  - a default-exported function declaration:
    - `export default fn ...` (the function name is optional only in this form),
  - or a default-export statement:
    - `export default Name;` (names an in-scope symbol in the current module).
- Default exports may target any top-level symbol kind that can be referenced
  by name:
  - functions (`fn`),
  - top-level bindings (`let` / `const` / `var`),
  - external bindings (`ext`),
  - type aliases (`type`),
  - nominal types (`struct`, `enum`, `error`, `interface`),
  - Formal Silk theories (`theory`).
- Each module MAY declare **at most one** default export.
- A default export is distinct from named exports:
  - `export default fn add () -> int { ... }` declares a default export whose
    internal name is `add` within the module,
  - but it does **not** implicitly create a named export of `add` for other
    modules. To export it as a named export, write `export fn add ...` (or add
    an explicit named export form once one exists in the language).
- The function name after `fn` is optional only for default exports. When the
  name is omitted (`export default fn () -> ...`), the function is anonymous in
  the surface language and can only be referenced by importing it via a default
  file import.
- Default imports have two behaviors depending on whether a default export
  exists:

  - If the imported module declares `export default`, the local name binds to
    that default-exported symbol.
  - If the imported module does **not** declare a default export, the default
    import becomes a **namespace import**: the local name refers to the
    imported module’s namespace and its exported names are accessed via
    `foo::Name`.

  In other words: *if there is no explicit default export, the module’s
  namespace is treated as the default export.*

- When a default import binds a default export, it introduces a single
  unqualified name into the importing module:
  - if the default export is callable (a `fn` or an `ext` function), it binds a
    callable value name (`foo()`),
  - if the default export is a type (`struct`/`enum`/`error`/`interface`/`type`),
    it binds a type name usable in type positions (and as the head of struct
    literals),
  - if the default export is a Formal Silk theory, it binds a theory name that
    may be applied via `#theory foo(args...);`,
  - if the default export is a non-callable value (`let`/`const`/`var` or a
    non-function `ext`), it binds a value name.
  When a default import binds a namespace, it does not introduce any unqualified
  imported names; you must use `foo::Name` to access exported names.
- Using a namespace import name as a callable (e.g. `foo()`) is an error; add an
  explicit `export default` to the imported module or use a named import.

Package namespace imports:

- For a **package specifier** (for example `import ui from "ui";`), the default
  import binds the package’s default export when the package declares one.
  Otherwise, it binds a namespace and exported names are accessed via `ui::Name`.

## Exports

Top-level declarations can be marked as exported using the `export`
modifier:

```silk
package my_app::core;

export fn main () -> int {
  return 0;
}

export let answer: int = 42;
```

Rules:

- `export` is not allowed inside blocks; it applies only to module-level
  declarations. Inside `impl` blocks, `public` controls method visibility and
  `export` is reserved for static members.
- The initial implementation supports `export` on:
  - functions (`export fn ...`), including a declaration-only prototype form
    (`export fn name(...) -> T;`) used for header-style interface modules,
  - `let` and `const` bindings (`export let ...`, `export const ...`).
  - `ext` declarations (`export ext name = ...;`),
  - Formal Silk theories (`export theory Name(...) { ... }`),
  - `type` aliases (`export type Name = ...;`),
  - `struct` declarations (`export struct Name { ... }`),
  - `enum` declarations (`export enum Name { ... }`),
  - `error` declarations (`export error Name { ... }`),
  - `interface` declarations (`export interface Name { ... }`),
  - static members inside `impl` blocks (`impl T { export fn ... }` with no
    `self` receiver).
- The `export` modifier marks a declaration as part of the package’s
  externally visible surface. The exact visibility rules across packages
  (including how exports appear in the resolver and back-end symbol tables)
  will be specified and implemented alongside the package graph in
  `docs/compiler/architecture.md`.

In the current implementation, most type names are treated as visible across
module boundaries once the relevant module(s) are loaded into the module set.
The `export` modifier is still recorded on type declarations so the
package/export model can be tightened later without changing source.

### Prototype exports (`export fn ...;`)

In addition to ordinary function definitions (`export fn ... { ... }`), a module
may declare a **prototype** (a declaration without a body) by terminating the
signature with `;`:

```silk
module bar;

export fn foo (value: string) -> int;
```

This is the Silk analogue of a C/C++ header prototype or a TypeScript `*.d.ts`
declaration file:

- Other modules may import the prototype (named import or namespace import) and
  type-check calls against its signature.
- The prototype itself does **not** provide an implementation. The symbol must
  be provided at link time by:
  - another Silk source file in the same package that defines `export fn foo ... { ... }`, and/or
  - an object/archive input that defines the symbol (for example a `.o`/`.a`
    produced by a C compiler).
- Prototype declarations may include Formal Silk contract annotations (`#require`
  / `#assure` / contract `#theory` uses). This is the visible contract surface
  for callers; when the implementation is precompiled and the function body is
  not available in the module set, callers still type-check and may verify call
  sites against the prototype’s contract surface.

When both a prototype declaration and a source-level implementation are present
in the same build/module set, the compiler enforces:

- the signatures match, and
- the implementation package explicitly imports the prototype module (via a
  file import) so the relationship is declared in source.

Example (consumer imports the prototype):

```silk
import { foo } from "./ibar.slk";

export fn main () -> int {
  return foo("hello");
}
```

Example (implementation imports the prototype and provides the body):

```silk
module bar;

import "./ibar.slk"; // ambient import; used for conformance only

export fn foo (value: string) -> int {
  return 0;
}
```

This pattern is equivalent in intent to describing the export surface as an
`interface` and declaring module conformance (`module ... as ...`), but it is
file-based and designed to support separate compilation + link-style workflows.

### Re-export declarations (`export { ... };`)

In addition to `export fn ...` and `export let ...`, Silk supports exporting an
*already in-scope name* via a re-export declaration:

```silk
import { my_function } from "./module.slk";
export { my_function };
```

This is the idiomatic way to build “barrel” modules that forward selected
exports from other modules.

Rules (current compiler subset):

- A re-export declaration must appear at top level and ends with `;`.
- Each entry in the `{ ... }` list names a **local** in-scope symbol.
  - The entry may rename the exported name: `export { localName as ExportedName };`.
- Re-exported names are part of the module/package export surface, so other
  modules may import them via `import { Name } from "./barrel.slk";`.
- In the current implementation, `export { ... }` supports values and exported
  Formal Silk theories (`theory` declarations). It does not export type names.

## Status and Future Work

The current compiler front-end:

- parses `package` declarations into the AST,
- parses `import` declarations into the AST,
- records whether top-level declarations are marked `export`:
  - values (`fn`, `let`, `ext`),
  - Formal Silk theories (`theory`),
  - type aliases (`type`),
  - type declarations where supported (`error`, `interface`),
  - and similarly tracks `export` for static `impl` members and `export default`
    for top-level functions.

The type checker partially respects `package`, `import`, and `export` today:

- a multi-module helper (`checker.checkModuleSetWithImports`) seeds each
  module’s top-level environment with exported `let` bindings (with
  explicit type annotations) from any packages it imports, making those
  constants visible as unqualified names in the importing module,
- within a module set, function calls are type-checked against:
  - all top-level functions in the current package (across all modules of
    that package), and
  - `export fn` declarations from any imported packages,
  while still rejecting calls to non-exported functions across package
  boundaries.

A package-level resolver now exists in `src/resolver.zig` and is used by the
ABI build path (`silk_compiler_build`) to:

- group modules into packages (including an implementation-defined default
  package for modules that omit `package`),
- ensure that every `import` refers to a package that exists in the current
  module set,
- reject cyclic package graphs (e.g. `package a` importing `b` while `b`
  imports `a`).

Resolver errors are surfaced through `libsilk.a` as human-readable
errors (for example, `"unknown imported package"` or
`"cyclic package imports"`), and are covered by both Zig tests and C99
tests under `c-tests/`.

In addition to the package graph, the resolver also builds per-package
export tables:

- for each package, all `export fn` and `export let` declarations are
  collected into a symbol list,
- duplicate exported names within the same package are rejected, except for the
  prototype/definition pairing described above (`export fn name(...) -> T;` +
  `export fn name(...) -> T { ... }`), which is accepted only when the
  signatures match,
- these export tables are currently used only for consistency checks; the
  type checker does not yet use them for cross-package name resolution.

Future work (tracked in `PLAN.md`) will:

- extend the resolver and checker to:
  - map imports to concrete modules and exported symbols,
  - ensure only exported symbols are visible across package boundaries,
- propagate package and export information into the IR and back-end so that
  symbol visibility and linkage match these rules.

## Common Pitfalls

- **Forgetting semicolons**: `package` and `import` declarations end with `;` (parse error, `E0001`).
- **Imports not at the top**: imports must come immediately after the optional
  `package` declaration and before any other top-level declaration (`E0001`).
- **Assuming package imports find code automatically**: a package import can only
  resolve if the package exists in the module set (fix by adding the relevant `.slk`
  files to the build, or by file-importing them; missing packages are `E1001`).
- **Calling a namespace import**: if `import foo from "./mod.slk";` binds a namespace
  (because there is no default export), then `foo()` is invalid; use `foo::Name` or
  add `export default` (`E2018`).
- **Name collisions with named imports**: when importing from multiple modules, use
  `as` to rename one binding (`E2004`).

## Relevant Tests

- Package import + unqualified/qualified access:
  - `tests/silk/pass_import_std_strings.slk`
  - `tests/silk/pass_import_pkg_util.slk` (module-set package import; built with `tests/silk/support_pkg_import_util.slk`)
- Namespace imports (file and package):
  - `tests/silk/pass_import_namespace_file_no_default.slk`
  - `tests/silk/pass_import_namespace_package.slk`
- Named imports + aliasing:
  - `tests/silk/pass_file_import_named_values.slk`
  - `tests/silk/pass_import_named_from_package_spec.slk`
- Re-exports (`export { ... };`):
  - `tests/silk/pass_reexport_named_import.slk` (built with `tests/silk/support_reexport_barrel.slk` and `tests/silk/support_reexport_target.slk`)
  - `tests/silk/pass_reexport_local_decl.slk` (built with `tests/silk/support_reexport_local_decl.slk`)
- Default exports:
  - `tests/silk/pass_file_import_default_export.slk`
- Importing types and using exported methods:
  - `tests/silk/pass_file_import_methods_counter.slk`
