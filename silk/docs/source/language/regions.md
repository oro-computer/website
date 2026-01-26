# Regions

Regions provide a fixed-size, **statically allocated** block of memory that can
be used as an allocation context for `new`.

Regions are represented at runtime as a first-class `Region` handle value. A
`Region` value may be passed to functions, stored in structs, and exported.

This is a replacement for the older “arenas” concept; see `arenas.md` for the
rename note.

## Implementation Status (Current Compiler)

Status: **in progress**.

Implemented subset:

- Parsing and type-checking of:
  - `const region <name>: u8[N];`
  - `with <name> { ... }`
  - `with <bytes> { ... }` / `with(<bytes>) { ... }` (anonymous region for the block)
  - `with <bytes> from <region> { ... }`
  - `with <bytes> from <region>[<start>..] { ... }`
  - `with <bytes> from <region>[<start>..<end>] { ... }`
- `Region` is a primitive handle type:
  - `const region name: u8[N];` binds `name` as a `Region` value,
  - `Region` values may be passed and stored (including in struct fields),
  - `with <name> { ... }` accepts any `Region`-typed binding (including function parameters and locals).
- Inside a `with <region> { ... }` block, `new` allocations for non-opaque
  `struct` values allocate from the active region instead of the heap.
- Within the dynamic extent of a `with <region> { ... }` block (including calls
  performed while the block is active), raw allocations via
  `std::runtime::mem::alloc` allocate from the active region (8-byte aligned).
- Region allocation overflow traps at runtime.

Limitations (current subset):

- The region backing store is currently restricted to `u8[N]` (a fixed-size
  byte array type annotation).
- Only the existing `new` subset is affected (non-opaque `struct` allocations
  that produce `&Struct`).
- Region-backed `new` allocations are still reference-counted:
  - last-release runs `drop` (when defined),
  - but the backing bytes are not freed (region memory is reclaimed only by
    reusing the region cursor, as described below).

## Syntax

### `Region` handle type

`Region` is a primitive value type representing a region allocation context.

Conceptually, a `Region` value contains:

- a base pointer to the backing bytes,
- a pointer to a mutable cursor cell (shared by copies of the handle), and
- a byte limit used for overflow checking.

Copying a `Region` value copies the handle; copies refer to the same backing
store and cursor.

### Declaring a region

A region declaration has the surface form:

```silk
const region arena: u8[1024];
```

Rules:

- `const region` is a declaration form (it is not a type).
- A region declaration has no initializer.
- The type annotation specifies the region backing size and must be a fixed
  byte array type: `u8[N]`.
- The declared name is bound as a `Region` value.

### Using a region: `with`

`with` establishes a region allocation context for the enclosed block.

#### 1) Bind an existing region

`with <region> { ... }` activates a named region binding:

```silk
struct Packet { x: int }

fn main () -> int {
  const region arena: u8[1024];

  with arena {
    let p: &Packet = new Packet{ x: 1 };
    // ...
  }

  return 0;
}
```

The `<region>` name may refer to any `Region`-typed binding, including a region
parameter passed to a function:

```silk
struct Packet { x: int }

fn alloc_in (r: Region) -> int {
  with r {
    let p: &Packet = new Packet{ x: 1 };
    return p.x;
  }
}
```

#### 2) Use an anonymous region with an explicit byte budget

`with <bytes> { ... }` (or `with(<bytes>) { ... }`) creates an anonymous region
backed by `<bytes>` writable bytes and activates it for the block:

```silk
struct Packet { x: int }

fn main () -> int {
  with 1024 {
    let p: &Packet = new Packet{ x: 1 };
    // ...
  }
  return 0;
}
```

Rules (current subset):

- `<bytes>` must be a positive integer literal.

#### 3) Use a slice of an existing region (`from`)

`with <bytes> from <region> { ... }` creates an anonymous region backed by the
first `<bytes>` bytes of `<region>`:

```silk
struct Packet { x: int }

fn main () -> int {
  const region arena: u8[2048];

  with 1024 from arena {
    let p: &Packet = new Packet{ x: 1 };
    // ...
  }

  return 0;
}
```

You may also specify a byte slice of the source region:

```silk
with 1024 from arena[64..] {
  // uses bytes 64..(64 + 1024) of `arena`
}

with 1024 from arena[64..1088] {
  // uses bytes 64..1088 of `arena`
}
```

Rules (current subset):

- `<bytes>` must be a positive integer literal.
- `<region>` must name a `Region` value that has a compile-time-known backing size
  in the current subset (for example a `const region` declaration).
- Slice bounds use **byte offsets** (the region backing store is `u8[N]`).
- `<start>` / `<end>` must be non-negative integer literals.
- When an explicit `<end>` is present, it is exclusive (`[start..end]`).
- The `from` slice must contain at least `<bytes>` writable bytes:
  - `with <bytes> from r { ... }` requires `<bytes> <= sizeof(r)`.
  - `with <bytes> from r[start..end] { ... }` requires `<bytes> <= end - start`.
  - `with <bytes> from r[start..] { ... }` requires `<bytes> <= sizeof(r) - start`.

## Semantics

### Region-backed `new`

Within a `with <region> { ... }` block:

- any `new` allocation performed by the compiler’s `new` lowering uses the
  active region as its backing store,
- allocations are **8-byte aligned** in the current implementation subset,
- if the region does not have enough remaining space, the program traps.

Outside of a `with` block, `new` uses the current heap model described in
`docs/language/memory-model.md`.

### Region-backed raw allocation (`std::runtime::mem::alloc`)

Within the dynamic extent of a `with <region> { ... }` block (including calls
performed while the block is active):

- `std::runtime::mem::alloc(n)` allocates an `n`-byte payload from the active
  region (8-byte aligned) and reserves an additional 8-byte header immediately
  before the returned pointer (used by the runtime to distinguish region-backed
  and heap-backed pointers and to record the allocation size),
- if the region does not have enough remaining space, the program traps.

Implication for `with <bytes>` limits: each `alloc(n)` consumes at least
`n + 8` bytes of region capacity (plus any alignment padding from 8-byte
alignment).

Region-backed raw allocations are bump-allocated. In the current runtime model:

- `std::runtime::mem::free` is a no-op for region-backed pointers,
- `std::runtime::mem::realloc` reallocates by allocating a new region block and
  copying bytes (it never calls libc `realloc` on a region-backed pointer).

### Nested `with`

Nested `with` blocks use the innermost active region:

```silk
with a {
  with b {
    // `new` uses region `b` here.
  }
}
```

## Reclaiming Region Memory (Current Subset)

Regions are bump allocators: each allocation advances a cursor within the
backing byte buffer.

Because region-backed `new` allocations are still RC-managed in the current
subset and do not free backing bytes on last-release, reclaiming region memory
requires resetting the region cursor so the backing bytes can be reused.

Current behavior:

- `with <region> { ... }` activates the region but does **not** reset its cursor.
  - allocations across multiple `with <region>` blocks accumulate and can
    eventually overflow and trap.
- `with <bytes> { ... }` creates an anonymous region and resets its cursor to `0`
  on entry so repeated execution of the block starts from an empty region.
- `with <bytes> from <region>[...] { ... }` creates an anonymous region backed by
  a subrange of `<region>` and resets its cursor to the slice start on entry.

Important limitation:

- The compiler does not yet enforce “region allocations must not escape the
  `with` block”. Because anonymous-region cursors are reset on entry, code must
  treat pointers/`&Struct` values allocated inside `with <bytes> { ... }` and
  `with <bytes> from ... { ... }` as block-scoped.

## Exports

Region declarations may be exported and imported like other top-level bindings:

```silk
export const region global_arena: u8[4096];
```

Exporting a region exports a `Region` handle that refers to the same backing
bytes and cursor cell. Importing a region binds a `Region` value that may be
used with `with` like a locally declared region.
