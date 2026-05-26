# Project Dependencies

Silk projects build dependencies from package roots on disk. A dependency can be
an explicit local path, a package found under a `packages/` search root, or an
installed package root. The `examples/projects/cove/` project in the Silk
compiler checkout is the concrete model for this workflow.

## Cove layout

Cove is a static file server with two user-space dependencies:

```text
cove/
  silk.toml
  src/
    main.slk
  public/
    index.html
  deps/
    docroot/
      silk.toml
      src/lib.slk
      native/path_guard.c
  packages/
    access_log/
      silk.toml
      src/lib.slk
```

The root package owns the executable. `deps/docroot/` owns document-root path
resolution and its native helper. `packages/access_log/` owns small logging
functions and is discovered from the package search path.

## Root manifest

Cove's root `silk.toml` keeps both dependency forms visible. This excerpt omits
secondary metadata so the dependency structure stays prominent:

```toml
[package]
name = "cove"
version = "0.1.0"
description = "Async static HTTP file server with std::flag, std::mime, std::fs, access logging, and native C path containment."
license = "MIT"
readme = "README.md"

[sources]
include = ["src/**/*.slk"]

[dist]
include = [
  "silk.toml",
  "README.md",
  "src/**/*.slk",
  "public/**/*",
  "deps/docroot/silk.toml",
  "deps/docroot/**/*.slk",
  "deps/docroot/native/path_guard.c",
  "deps/docroot/**/*.md",
  "packages/access_log/silk.toml",
  "packages/access_log/**/*.slk",
  "packages/access_log/**/*.md",
]

[dependencies]
docroot = { path = "deps/docroot", version = "^0.1.0" }
access_log = { version = "^0.1.0" }

[[target]]
name = "cove"
kind = "executable"
entry = "src/main.slk"
```

`docroot` is explicit: the `path` is resolved relative to Cove's manifest
directory. `access_log` omits `path`, so the compiler searches contextual
package roots and finds `packages/access_log/silk.toml` next to the root
package. No network fetch or registry lookup is involved.

The root `[dist]` includes the vendored dependency roots because Cove is meant
to travel as one self-contained example. A dependency that is published on its
own should also define its own `[dist]` payload.

## Importing dependencies

Source imports use the dependency key, not necessarily the dependency package's
full `package.name`:

```silk
package cove;

import { error as log_error } from "access_log";
import { listening as log_listening } from "access_log";
import { request as log_request } from "access_log";
import { FileStore, ResponseDoc } from "docroot";
```

The dependency key is local to the importing manifest. In Cove:

- `docroot` maps to `deps/docroot` because the manifest declares `path`.
- `access_log` maps to `packages/access_log` because the key is searched under
 contextual `packages/` roots.
- The dependency packages may still use namespaced package identities such as
 `cove::docroot` and `cove::access_log` inside their own manifests and source
 files.

Quoted import strings use `/` paths. Use `::` for Silk package namespaces and
qualified names in source code.

## Authoring a source dependency

A user-space source dependency is just another package root. For a small
package-search dependency, create this shape:

```text
packages/access_log/
  silk.toml
  README.md
  src/
    lib.slk
```

The dependency manifest declares its package identity and source set:

```toml
[package]
name = "cove::access_log"
version = "0.1.0"
description = "Tiny access-log package used by the Cove file server."
license = "MIT"
readme = "README.md"

[sources]
include = ["src/**/*.slk"]
```

The implementation exports the names downstream code may import:

```silk
package cove::access_log;

import { eprintln, println } from "std/io";

export fn listening (host: string, port: int, dir: string) -> void {
  println("[info] listening on http://{}:{} serving {}", host, port, dir);
}

export fn request (method: string, target: string, status: int) -> void {
  println("[request] {} {} -> {}", method, target, status);
}

export fn error (message: string) -> void {
  eprintln("[error] {}", message);
}
```

Then add the dependency to the application manifest:

```toml
[dependencies]
access_log = { version = "^0.1.0" }
```

Use a `path` field instead when the dependency lives outside a searched
`packages/` root:

```toml
[dependencies]
access_log = { path = "../access_log", version = "^0.1.0" }
```

## Dependencies with native helpers

If the dependency's Silk code calls package-owned native code through `ext`,
put that native requirement in the dependency manifest. Cove's `docroot`
package does this:

```toml
[package]
name = "cove::docroot"
version = "0.1.0"
description = "Static-file serving abstraction with native path-containment validation."
license = "MIT"
readme = "README.md"

[sources]
include = ["src/**/*.slk"]

[[native]]
target = "linux-x86_64"
inputs = ["native/path_guard.c"]
```

The Silk module declares the native symbol it calls:

```silk
package cove::docroot;

ext cove_path_is_within = fn (u64, i64, u64, i64) -> bool;
```

Prefer `[[native]]` for package-level native code that should travel with a
source or hybrid dependency. Use `[[target]].inputs` for native files that
belong only to one root package output.

## Build and verify

From the Cove package root:

```bash
silk package lint --package packages/access_log
silk package lint --package deps/docroot
silk package lint --package .
silk build --package .
```

The build produces `build/cove`. Run it with a document root:

```bash
./build/cove --host 127.0.0.1 --port 8080 --dir public
```

From the Silk compiler checkout root, use the same commands with
`examples/projects/cove/...` paths.

## Rules of thumb

- Keep dependency roots real and buildable on disk; Silk does not fetch remote
 packages during `silk build`.
- Use `path` for active local development and vendored paths outside
 `packages/`.
- Use `packages/<dependency-key>/` for pathless dependencies you want the
 package graph to find automatically.
- Keep the dependency key stable for imports, even if the dependency's
 `package.name` is namespaced.
- Export only the names downstream packages should call.
- Add definition files under `defs/` when a dependency may be consumed as a
 binary or interface-only package.
- Use `[dist]` to make the package payload explicit before publishing or
 vendoring it.

## Next

- [Modules, Packages, and Publication](?p=guides/modules-and-packages)
- [Package manifests](?p=compiler/package-manifests)
- [Package distribution](?p=compiler/package-distribution)
