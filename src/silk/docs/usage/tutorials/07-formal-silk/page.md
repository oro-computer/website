---
layout: "docs"
description: "This tutorial shows how Formal Silk fits into ordinary systems code:"
docsCollection: "silk"
section: "usage"
order: 239
sourcePath: "usage/tutorials/07-formal-silk.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Tutorial 7: Formal Silk in real code

This tutorial shows how Formal Silk fits into ordinary systems code:

- function contracts for API boundaries,
- loop invariants for state that changes over time,
- struct requirements for construction-time guarantees, and
- reusable theories for proof rules you want to apply in more than one place.

Reference pages:

- [Formal Silk](/silk/docs/guides/formal-silk/)
- [Formal verification reference](/silk/docs/language/formal-verification/)
- [Struct requirements](/silk/docs/language/struct-requirements/)

## 1) Guard a public function boundary

Start with a frame containing a four-byte header and a payload. Restrict the payload so the frame fits a 65,535-byte protocol limit:

```silk
#require payload_bytes >= 0 && payload_bytes <= 65531;
#assure result == payload_bytes + 4;
#assure result >= 4 && result <= 65535;
fn frame_size (payload_bytes: int) -> int {
  return payload_bytes + 4;
}

fn main () -> int {
  let bytes = frame_size(1200);
  #assert bytes == 1204;
  return 0;
}
```

What to notice:

- `#require` describes the caller obligation.
- `#assure` describes the return guarantee.
- The payload bound keeps both the addition and the resulting frame size within range.
- For arbitrary CLI or network input, first [parse the value and guard the contracted call](/silk/docs/guides/formal-silk/). A precondition is a proof obligation, not a runtime validator.

## 2) State loop facts explicitly

Formal Silk is especially useful when a loop mutates state and you want the
compiler to keep track of the intended bounds. This example models bookkeeping for four fixed-size pages:

```silk
fn main () -> int {
  let page_count: int = 4;
  let page_bytes: int = 256;
  let mut processed_pages: int = 0;
  let mut processed_bytes: int = 0;

  #invariant processed_pages >= 0 && processed_pages <= page_count;
  #invariant processed_bytes == processed_pages * page_bytes;
  #variant page_count - processed_pages;
  #monovariant processed_pages;
  while processed_pages < page_count {
    processed_bytes += page_bytes;
    processed_pages += 1;
  }

  #assert processed_pages == page_count;
  #assert processed_bytes == 1024;
  return 0;
}
```

Here:

- `#invariant` relates the byte counter to the page counter on every iteration. The bounded page count keeps the arithmetic in range,
- `#variant` gives the decreasing termination measure,
- `#monovariant` states that `i` moves in one direction only.

## 3) Enforce construction-time invariants

Struct requirements let you move “valid shape” rules to the type’s construction
sites. Define a read window within a one-million-byte logical object:

```silk
#require offset >= 0 && offset <= 1000000;
#require length >= 0 && length <= 1000000 - offset;
struct ReadWindow {
  offset: int,
  length: int,
}

fn main () -> int {
  let window = ReadWindow{ offset: 4096, length: 512 };
  #assert window.offset + window.length <= 1000000;
  return 0;
}
```

Changing the offset or length to exceed the logical object size makes construction fail verification. This proves numeric metadata; it does not establish that a file exists or that memory has been allocated.

## 4) Reuse proof rules with theories

Both payload and frame helpers use the same non-negative, 16-bit byte-count rule. Package that rule as a theory:

```silk
export theory PacketBytes (count: int) {
  #require count >= 0 && count <= 65535;
}

#theory PacketBytes(payload_bytes);
#require payload_bytes <= 65531;
#assure result == payload_bytes + 4;
fn frame_size (payload_bytes: int) -> int {
  return payload_bytes + 4;
}

#theory PacketBytes(payload_bytes);
#assure result == payload_bytes;
fn payload_size (payload_bytes: int) -> int {
  return payload_bytes;
}

fn main () -> int {
  let frame = frame_size(1200);
  let payload = payload_size(1200);
  #assert frame - payload == 4;
  return 0;
}
```

`#theory PacketBytes(...)` attaches the shared preconditions to each helper. `frame_size` adds the tighter header-space requirement. Callers must establish all attached requirements.

## 5) Local assertions inside ordinary code

You do not need a full contract-heavy style everywhere. For many functions, a
single local proof is enough:

```silk
fn main () -> int {
  let width: int = 1920;
  let height: int = 1080;
  let bytes_per_pixel: int = 4;
  let frame_bytes: int = width * height * bytes_per_pixel;
  #const expected_bytes = 8294400;
  #assert frame_bytes == expected_bytes;
  return 0;
}
```

This is the common “real code” pattern: write normal Silk, then pin down the
one fact that matters. `expected_bytes` is a proof-only name; `frame_bytes` is an ordinary runtime binding. A `#const` value cannot be used in runtime expressions.

## Build and check

Save one of the examples above, then run:

```bash
mkdir -p build
silk check --verify tutorial7_formal.slk
silk build tutorial7_formal.slk -o build/tutorial7_formal
./build/tutorial7_formal
```

Each example is a separate complete program. Expect verification to succeed and the executable to exit with status `0`. Plain `check` type-checks; `check --verify` discharges proof obligations. `build` verifies by default.

Try `frame_size(65532)` in the first example: expect `E3007`. Restore a valid payload before building. These contracts verify the stated arithmetic properties; they do not prove I/O success, protocol authentication, or the correctness of an unmodeled dependency.

## Next

- Reference: [Formal verification](/silk/docs/language/formal-verification/)
- Reference: [Struct requirements](/silk/docs/language/struct-requirements/)
- Guide: [Formal Silk](/silk/docs/guides/formal-silk/)
