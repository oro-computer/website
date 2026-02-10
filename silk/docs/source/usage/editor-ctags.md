# Universal Ctags Support

The Silk compiler repository ships a Universal Ctags configuration for Silk at its root (`.ctags`).

## What It Tags

The bundled rules recognize:

- `fn` declarations (including `export fn`, `export default fn` when named, and `async`/`task`-modified functions),
- `let` and `var` bindings (including `export let`, `export var`, and `let mut`),
- `ext` declarations (including `export ext`),
- `struct`, `enum`, `error`, `interface`, and `impl` declarations,
- `package` declarations.

These tags are regex-based and intentionally conservative; they do not perform semantic resolution or scope analysis.

## Usage (Project-Local)

To use the Silk rules in a single project:

1. Copy the Silk `.ctags` file (from the Silk compiler repository root) into your project root.
2. Run:

```sh
ctags -R
```

Universal Ctags will read `.ctags` automatically and tag `*.slk` files as Silk.

If your `ctags` binary is not Universal Ctags, install it first; Exuberant/etags do not support the same configuration format.

If you are working in the Silk compiler repository itself, `.ctags` is already present at the repository root; you can run `ctags -R` directly.

## Usage (Global)

To use the Silk rules across multiple projects:

1. Copy the Silk `.ctags` rules (from the Silk compiler repository root) into your global config (for example `~/.ctags.d/silk.ctags`).
2. Run `ctags -R` in any Silk project.

If you already maintain a global ctags configuration, merge the Silk rules into it instead.
