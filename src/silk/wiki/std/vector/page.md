---
layout: "silkWiki-docs"
title: "std::vector"
description: "std::vector provides a generic, growable owning container Vector(T) used widely throughout std::."
docsCollection: "silkWiki"
section: "std"
order: 58
sourcePath: "std/vector.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::vector`](/silk/docs/std/vector/)

[`std::vector`](/silk/docs/std/vector/) provides a generic, growable owning container `Vector(T)` used
widely throughout `std::`.

Full reference: [vector](/silk/wiki/std/vector/).

## Notes

- Supported forms + design: a usable subset is implemented in [`std/vector.slk`](https://github.com/oro-computer/silk/blob/master/std/vector.slk).
- Full reference: [vector](/silk/wiki/std/vector/)

## Importing

```silk
import std::vector;
```

## Examples

### Example: push/pop
```silk
import std::vector;

type Vec = std::vector::Vector(int);

fn main () -> int {
  match (Vec.init(4)) {
    Ok(vec) => {
      let mut v: Vec = vec;
      v.push(1);
      v.push(2);
      let x: int = v.pop() ?? 0;
      v.drop();
      return x;
    },
    Err(_) => {
      return 0;
    },
  }
}
```

## See also

- Full reference: [vector](/silk/wiki/std/vector/)
- Slices and iterators: [arrays](/silk/wiki/std/arrays/), [interfaces](/silk/wiki/std/interfaces/)
