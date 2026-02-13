# `std::build`

Status: **Implemented subset** (manifest builder + step graph).

`std::build` provides helper APIs for writing Silk build modules (`build.slk`).
Build modules are executed by the `silk` CLI (see `docs/compiler/build-scripts.md`)
and must print a TOML v1.0 package manifest (`silk.toml` format) to stdout.

This module is intentionally a *tooling* surface:

- it does not change the compiler’s manifest-driven build model,
- it exists to make build modules easy to write, deterministic, and hard to get wrong.

## Concepts

### `Context`

A `Context` describes the build-module invocation.

- `package_root`: absolute package root directory.
- `action`: one of:
  - `"build"`
  - `"install"`
  - `"uninstall"`

The driver provides these values to the build module via the
`std::interfaces::Builder` entrypoint parameters:

- `package_root` (string)
- `action` (string)

The build-module wrapper program also receives these as process arguments:

- `argv[1]` is `package_root`
- `argv[2]` is `action` (when omitted, treat as `"build"`)

### `Build`

A `Build` is a programmatic builder for a package manifest. It exposes methods
for setting:

- `[package]` fields (`name`, `version`, `definitions`),
- `[build]` fields (`default_target`),
- and `[[target]]` entries (including native `inputs`, `cflags`, `ldflags`, and
  dynamic linkage fields like `needed`/`runpath`/`soname`).

`std::build` emits TOML in a deterministic, canonical form.

## API (current)

Build modules are intended to be normal modules that export a `run` entrypoint.

Declaring module conformance to `std::interfaces::Builder` is recommended for
clearer diagnostics and tooling, but the driver requires only that `run` exists
with the correct signature.

The interface name in `module ... as ...` is resolved after imports, so build
modules may use the unqualified form (`module ... as Builder;`) and import
`Builder` in the import block.

Typical entrypoint:

```silk
module hello::build as Builder;

import { Builder } from "std/interfaces";
import build from "std/build";

export async fn run (package_root: string, action: string) -> int {
  let ctx: build::Context = build::Context{ package_root: package_root, action: action };
  let _ = action;
  let _ = ctx;
  let mut b: build::Build = build::Build.init();
  b.package("hello", "0.1.0");
  let t = b.add_executable("hello", "src/main.slk");
  b.target_set_output(t, "build/hello");
  return b.emit();
}
```

Notes:

- Build modules may still write TOML directly to stdout; `std::build` is a
  convenience layer.
- Build modules are allowed to be `async` so they can `await` during manifest
  generation.
- `build::context(argc, argv)` remains available for wrapper/legacy usage when
  you are writing a standalone hosted program and want to parse `argv` into a
  `Context`.
- `build::run(argc, argv, callback)` remains available for older callback-style
  build modules.

### Step graph (`StepGraph`)

Build modules often need to run deterministic, dependency-ordered “pre-build”
work before emitting the manifest (for example: generating `.slk` sources,
writing version files, or running small code generators).

`std::build` provides a small step graph API to make these build-module actions:

- explicit (steps + dependencies),
- deterministic (stable execution order),
- and cacheable (content-addressed generated-file cache).

Concepts:

- `StepId` — an integer handle for a created step.
- `StepKind` — the kind of a step (`MkdirAll`, `WriteFile`, or `Run`).
- A step graph is executed with `g.run()` which runs all steps in dependency
  order (topological sort) and returns `0` on success.
- Dependencies are declared with `g.depends_on(step, dep)` (“run `dep` before
  `step`”). Cycles are rejected.

API surface (current):

- `StepGraph.init(package_root)`
- `mkdir_all(path, mode) -> StepId`
- `write_file(path, bytes, mode) -> StepId` (cached)
- `write_file_uncached(path, bytes, mode) -> StepId`
- `write_file_string(path, contents, mode) -> StepId` (cached)
- `run_cmd(program) -> StepId`
- `cmd_arg(step, arg)`
- `cmd_set_cwd(step, cwd)`
- `depends_on(step, dep)`
- `run() -> int`

Path rules:

- Step paths are interpreted relative to `package_root` when not absolute.

Caching:

- `WriteFile` steps are cacheable.
- When caching is enabled for a `WriteFile` step:
  - the step computes a content hash over the output bytes,
  - stores a blob under `<package_root>/.silk/cache/build/<hash>.blob`,
  - and only (re)writes the destination file when its bytes differ from the
    desired output (to avoid unnecessary rebuild churn from timestamp changes).

- `Run` steps are not cached in the current API.

Minimal example (generate a source file before emitting the manifest):

```silk
module app::build as std::interfaces::Builder;

import build from "std/build";

export async fn run (package_root: string, action: string) -> int {
  let _ = action;

  let mut g: build::StepGraph = build::StepGraph.init(package_root);
  let dir = g.mkdir_all("build/gen", 493); // 0755
  let gen = g.write_file_string(
    "build/gen/generated.slk",
    "export fn generated_answer () -> int { return 42; }\n",
    420, // 0644
  );
  g.depends_on(gen, dir);
  if g.run() != 0 {
    return 1;
  }

  let mut b: build::Build = build::Build.init();
  b.package("app", "0.1.0");
  b.sources_add_include("src/**/*.slk");
  b.sources_add_include("build/gen/**/*.slk");
  let _ = b.add_executable("app", "src/main.slk");
  return b.emit();
}
```

## Future work

This module is expected to grow toward a Zig-like build system:

- programmatic installation/uninstallation hooks,
- and richer native build configuration beyond the current `cflags`/`ldflags`
  fields (additional include path kinds, link search paths, and platform selection).

When those features are introduced, they will be specified here first.
