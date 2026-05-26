# Testing (`test`)

Silk supports top-level `test` declarations that are discovered and executed by
`silk test`.

Canonical doc: [testing](?p=language/testing).

## Syntax

```silk
test "addition works" {
  if (1 + 2) != 3 {
    std::abort();
  }
}
```

## See also

- Canonical doc: [testing](?p=language/testing)
- CLI runner: [cli silk](../docs/?p=compiler/cli-silk)
