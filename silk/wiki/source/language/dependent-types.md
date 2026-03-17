# Dependent types (const parameters)

Silk already supports a practical dependent-type-like subset through **const
parameters** and applied generic types with compile-time integer arguments.

[Canonical doc](../docs/?p=language/dependent-types).

## Supported behavior

- const parameters such as `N: usize`
- applied types like `Wrap(u8, 4)`
- generic functions with the `;` split
- const/type argument inference at call sites when runtime arguments carry the
  needed shape

## Example

```silk
struct Wrap(T, N: usize) {
  buf: T[N],
}

fn take_wrap (T, N: usize; w: Wrap(T, N)) -> int {
  return 0;
}
```

## Use it for

- fixed-size buffers and digests
- APIs that preserve array length or capacity
- compile-time-sized wrappers

## See also

- [Canonical doc](../docs/?p=language/dependent-types)
- [Generics](?p=language/generics)
- [Formal verification](?p=language/formal-verification)
