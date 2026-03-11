# Testing (`test`)

Silk supports top-level `test` declarations that are discovered and executed by
`silk test`.

[Canonical doc](../docs/?p=language/testing).

## Syntax

```silk
test "addition works" {
  if (1 + 2) != 3 {
    std::abort();
  }
}
```

## See also

- [Canonical doc](../docs/?p=language/testing)
- CLI runner: [silk CLI](../docs/?p=compiler/cli-silk)
