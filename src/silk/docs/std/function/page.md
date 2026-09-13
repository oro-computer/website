---
layout: "docs"
title: "std::function"
description: "std::function provides a boxed holder for first-class Silk function values."
docsCollection: "silk"
section: "std"
order: 164
sourcePath: "std/function.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::function`](/silk/docs/std/function/)

[`std::function`](/silk/docs/std/function/) provides a boxed holder for first-class Silk function values.

## Exported API

```silk
module std::function;

export struct Function(F) {
  value: F,
}

impl Function(F) {
  public fn new (value: F) -> Function(F);
  public fn get (self: &Function(F)) -> F;
  public fn into_inner (self: Function(F)) -> F;
}
```

## Notes

- `Function(F)` does not change the callable representation. It is a holder
 box around an already-typed function value.
- This is useful for storing function values in containers or attaching a
 nominal stdlib type to callback-bearing APIs.
- The Supported forms intentionally keeps this surface minimal. Call invocation
 still happens through the returned function value.
