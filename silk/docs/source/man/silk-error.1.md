# [`silk-error(1)`](?p=man/silk-error.1) — Explain Compiler Diagnostic Codes

> NOTE: This is the Markdown source for the eventual man 1 page for `silk error`. The roff-formatted manpage should be generated from this content.

## Name

`silk-error` — explain stable Silk compiler diagnostic codes.

## Synopsis

- `silk error <code>`
- `silk error --list`
- `silk error -l`

## Description

`silk error` is the terminal lookup surface for stable compiler diagnostics.
When another command prints a diagnostic such as `error[E2028]`, pass that code
to `silk error` to see the canonical short description, category, related docs,
any bundled example, and a guide lookup hint when the installed guide catalog
links that diagnostic code.

The lookup accepts copied forms:

- `E2028`
- `2028`
- `diag:E2028`
- `error[E2028]`

`silk error --list` and `silk error -l` print every stable compiler error code
and its short description in deterministic order.

## Output

For a single code, output includes:

- the code and canonical description,
- the diagnostic category,
- extra details when the compiler has a useful static explanation,
- documentation references,
- a `silk guide <code>` search hint when the installed guide catalog links the
 code,
- and a Silk example when one is bundled.

Examples are syntax-highlighted when stdout is a color-capable TTY. Piped
output, `NO_COLOR`, and `TERM=dumb` remain plain text.

## Examples

```sh
silk error E2028
silk error error[E2028]
silk error --list
```

## See Also

- [`silk(1)`](?p=man/silk.1)
- [`silk-guide(1)`](?p=man/silk-guide.1)
- [`silk-check(1)`](?p=man/silk-check.1)
- [`silk-build(1)`](?p=man/silk-build.1)
- [`silk-test(1)`](?p=man/silk-test.1)
