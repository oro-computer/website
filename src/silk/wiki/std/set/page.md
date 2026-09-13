---
layout: "docs"
title: "std::set"
description: "std::set provides set containers:"
docsCollection: "silkWiki"
section: "std"
order: 60
sourcePath: "std/set.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::set`](/silk/wiki/std/set/)

[`std::set`](/silk/wiki/std/set/) provides set containers:

- `SetMap(T)` (unordered set, open addressing),
- `TreeSet(T)` (ordered set, red-black tree).

Full reference: [set](/silk/wiki/std/set/).

## Notes

- Supported forms: usable in Silk currently with documented limits.
- Full reference: [set](/silk/wiki/std/set/)

## Importing

```silk
import std::set;
```

## Examples

### Example: `SetMap(u64)` basic usage
```silk
import std::set;
import std::result;
import std::memory;

type Set = std::set::SetMap(u64);
type InitResult = std::result::Result(Set, std::memory::AllocFailed);
type InsertResult = std::result::Result(bool, std::memory::OutOfMemory);

fn main () -> int {
  match (Set.init(4)) {
    InitResult::Ok(set) => {
      let mut s: Set = set;

      let insert_r: InsertResult = s.insert(1);
      if insert_r.is_err() { s.drop(); return 2; }
      let ok: bool = s.contains(1);
      s.drop();
      if ok { return 0; }
      return 1;
    },
    InitResult::Err(_) => {
      return 1;
    },
  }
}
```

## See also

- Full reference: [set](/silk/wiki/std/set/)
- Iterator protocol: [interfaces](/silk/wiki/std/interfaces/)
