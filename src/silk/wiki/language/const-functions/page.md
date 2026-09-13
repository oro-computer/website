---
layout: "silkWiki-docs"
title: "Const Functions (const fn)"
description: "const fn marks a function as eligible for compile-time evaluation."
docsCollection: "silkWiki"
section: "language"
order: 41
sourcePath: "language/const-functions.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Const Functions (`const fn`)

`const fn` marks a function as eligible for **compile-time evaluation**.

This wiki page is an overview. The canonical specification is
[const functions](/silk/wiki/language/const-functions/).

## Example

```silk
const fn add (a: int, b: int) -> int {
  return a + b;
}

const answer: int = add(20, 22);

fn main () -> int {
  return answer;
}
```

## Notes

- Const functions are intended for `const` initializer evaluation.
- Const functions are compile-time-only: they are not callable from runtime
 code and are not emitted as runtime/linkable symbols.
- The Supported forms targets scalar-only const evaluation; `string`/aggregate
 return values and higher-order const evaluation are planned.
- In the Supported forms, `const fn` bodies must not allocate (`new`) or use
 regions/`with`, must not contain `panic`, and may only call other `const fn`
 declarations.

## See also

- Full reference: [const functions](/silk/wiki/language/const-functions/)
- `const` bindings: [flow blocks statements](/silk/wiki/language/flow-blocks-statements/)
- Function modifiers (`pure`/`async`/`task`): [function disciplines](/silk/wiki/language/function-disciplines/)
