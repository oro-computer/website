# CLI and toolchain

Silk’s CLI is designed to make the “normal loop” cheap:

1. **check** — parse + type-check
2. **test** — run language-level tests
3. **build** — produce artifacts (executables and libraries)

Everything else (docs/man, embedding helpers) is there to make the language usable as a toolchain, not only as a compiler
binary.

This guide focuses on the **user-facing model**: what the commands mean and how they fit together.

## The key idea: a module set

Every invocation operates on a **module set**: the set of `.slk` files compiled together.

You can define that set in two ways:

- **Explicit files:** `silk check a.slk b.slk`
- **A package manifest:** `silk check --package .` (loads `silk.toml`)

The module set determines:

- what packages exist
- how `import` resolves
- what gets type-checked together

This is why the CLI feels deterministic: you always know what the compiler is looking at.

## `silk check`: fast feedback

Use `silk check` when you want a quick, cheap answer:

```bash
silk check src/main.slk
```

Common patterns:

- Check a whole package:
  ```bash
  silk check --package .
  ```
- Check with a custom stdlib root:
  ```bash
  silk check --std-root ./path/to/std src/main.slk
  ```

Why it’s valuable:

- it makes “does this program make sense?” a first-class operation
- editors and CI can run it constantly without building outputs

## `silk build`: artifacts and build targets

`silk build` compiles and produces an output artifact. The output **kind** is explicit:

```bash
# Executable (default kind is executable)
silk build src/main.slk -o build/app

# Object file (useful for embedding into other build systems)
silk build src/lib.slk --kind object -o build/lib.o

# Static / shared libraries
silk build src/lib.slk --kind static -o build/libfoo.a
silk build src/lib.slk --kind shared -o build/libfoo.so
```

Build targets matter because they change how you structure code:

- **executables** center around `main`
- **libraries** emphasize exported functions and stable boundaries (often with a C header via `--c-header`)

### Target selection

When you need to select a target explicitly:

```bash
silk build src/main.slk --target x86_64-linux-gnu -o build/app
silk build src/main.slk --arch wasm32 --kind executable -o build/app.wasm
```

The CLI also exposes knobs for linking metadata (`--needed`, `--runpath`, `--soname`) when producing executables or shared
libraries.

## `silk test`: language-level tests (TAP)

Silk tests are authored in the language and live next to the code they exercise:

```silk
import std::test::expect_equal;

fn add (a: int, b: int) -> int { return a + b; }

test "add returns the sum" {
  expect_equal(3, add(1, 2));
}
```

Run them with:

```bash
silk test src/main.slk
silk test --package .          # run package tests
silk test --filter add         # run only matching tests
```

The runner emits TAP v13 output so it drops into existing tooling without special adapters.

## `silk doc` and `silk man`: documentation as part of the toolchain

Silk treats documentation as something the compiler can *extract* and *render*:

- `silk doc` generates Markdown from doc comments
- `silk man` renders a manpage view for a symbol/module/concept

This is a practical way to keep “what this code means” close to the codebase without inventing a separate doc pipeline.

## `silk cc` and embedding (C99 ABI)

Silk includes a stable embedding interface (`libsilk`) for host applications.

If you’re integrating Silk into an existing C build:

- use `silk build --kind object|static|shared` for artifacts
- emit headers with `--c-header`
- link against `libsilk` when embedding the compiler itself

For deep embedding details, see:

- C ABI: `libsilk` (sidebar → compiler/ABI)
- Zig embedding: `Zig Embedding API` (sidebar → compiler)

## Diagnostics

When a command fails, the compiler prints a diagnostic with a stable error code. These codes are designed to be:

- human readable (good in terminals)
- machine consumable (good in CI and tooling)

Reference: `Diagnostics` (sidebar → compiler).

## Next

- [Testing](?p=guides/testing)
- [Formal Silk](?p=guides/formal-silk)

