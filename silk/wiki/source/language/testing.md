# Testing (`test`)

Silk supports top-level `test` declarations that are discovered and executed by
`silk test`.

Canonical doc: `docs/language/testing.md`.

## Syntax

```silk
test "addition works" {
  if (1 + 2) != 3 {
    std::abort();
  }
}
```

## See also

- Canonical doc: `docs/language/testing.md`
- CLI runner: `docs/compiler/cli-silk.md`
