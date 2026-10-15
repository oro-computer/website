---
layout: "docs"
description: "Silk uses unsafe to mark operations whose validity depends on an invariant the compiler cannot prove. An unsafe boundary does not disable the type checker, ownership rules, borrow checking, purity che"
docsCollection: "silk"
section: "language"
order: 310
sourcePath: "language/unsafe.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# Unsafe Boundaries



Silk uses `unsafe` to mark operations whose validity depends on an invariant
the compiler cannot prove. An unsafe boundary does not disable the type
checker, ownership rules, borrow checking, purity checking, target checks, or
ABI validation. It authorizes only the operations listed in this document.

`unsafe` is a last resort, not a label inferred from an operation merely
looking low-level. The language applies this decision order:

1. If the compiler can validate the invariant statically, the operation is
 safe.
2. If a runtime check can trap before an invalid access or call, the checked
 operation is safe.
3. Only an operation that must trust an invariant supplied by the programmer
 requires an unsafe context.

Adding a new primitive, cast, or ABI form does not make it unsafe by default.
Its specification must identify the concrete invariant that cannot be checked
and why a trapping checked form cannot provide the required semantics before
the operation may be added to the gated list below.

## Syntax

An unsafe statement block contains ordinary statements:

```silk
unsafe {
  asm "pause";
}
```

An unsafe expression contains exactly one expression and yields its value:

```silk
let callback = unsafe {
  address as raw c_fn (i64, i64) -> i64
};
```

When the boundary contains one unary or postfix expression, braces are
optional:

```silk
unsafe operation();
let callback = unsafe address as raw c_fn (i64, i64) -> i64;
```

The first line is exactly equivalent to `unsafe { operation() };`. The prefix
form owns one complete unary/postfix expression, including its calls, field or
index accesses, and cast suffixes. It does not absorb a following binary
operator: `unsafe operation() + other()` authorizes only `operation()`. Use
`unsafe (operation() + other())` or `unsafe { operation() + other() }` when the
whole compound expression must share the boundary.

At statement position, punctuation disambiguates the two forms:
`unsafe { operation(); }` is a statement block, while
`unsafe { operation() };` is an unsafe expression used as an expression
statement. An unbraced `unsafe operation();` always uses the single-expression
form. In value position, such as after `=`, the expression forms are
unambiguous.

Functions may declare an unsafe calling contract:

```silk
unsafe fn read_device_register (address: u64) -> u64 {
  return std::runtime::mem::load_u64(address, 0);
}
```

The body of an `unsafe fn` is an unsafe context. Calling it from safe code
requires an enclosing `unsafe` expression/block. `unsafe` is orthogonal to
`const`, `pure`, `task`, and `async`; all existing discipline rules continue to
apply.

Callable types retain the effect:

```silk
type RawReader = unsafe fn (u64) -> u64;
type ForeignRawReader = unsafe c_fn (u64) -> u64;
```

A safe callable may be stored where an unsafe callable is expected. An unsafe
callable may not be stored in a safe callable type, because doing so would erase
the call-site obligation.

Interface methods may use the same effect:

```silk
interface RawReadable {
  unsafe fn read_at (address: u64) -> u64;
}
```

A safe implementation may satisfy an unsafe interface method. An unsafe
implementation cannot satisfy a safe interface method, because that would
erase the caller's obligation from the interface contract.

## Operations That Require an Unsafe Context

The current compiler requires `unsafe` for:

- constructing an array/slice or string view from a raw `u64`/`usize` address,
 including `ptr as T[]`, `ptr as T[](/silk/docs/len)`, and `ptr as string(len)`;
- constructing a `c_fn`/`unsafe c_fn` from a raw `u64`/`usize` address with
 `as raw`;
- indexing or assigning through a slice whose runtime length is the
 unknown-length sentinel; safe indexing traps instead of performing an
 unchecked access, while the same index expression inside `unsafe` may use
 that sentinel;
- the raw memory load/store and pointer-to-string primitives declared as
 `unsafe fn` by [`std::runtime::mem`](/silk/docs/std/runtime-mem/);
- inline assembly;
- calling an `unsafe fn` or `unsafe c_fn`, directly, through a method, or
 through a stored callable value.

Each gate corresponds to a concrete unchecked obligation: a raw view needs a
valid, suitably aligned allocation with the claimed extent; a raw callback
needs an executable address with the claimed ABI and signature; a raw memory
primitive needs valid accessible storage; inline assembly may violate machine
state invariants; and an unsafe callable documents an obligation its body
cannot establish for the caller. The checker must not extend this list by
analogy alone.

Raw address-to-reference construction is not implemented. If it is added, it
must require an unsafe context under the same rule as other pointer-backed
views.

## Operations That Remain Safe

The following do not require `unsafe`:

- checked `fn (...) -> R` to `c_fn (...) -> R` conversion, which rejects or
 traps on a nonzero closure environment;
- storing, returning, passing, or calling a verified function/callback value;
- scalar `as raw` bit reinterpretation;
- extracting a string/reference/slice/array/`c_fn` address as an inert
 `u64`/`usize` value;
- layout-proven struct and reference shape casts;
- calling a safe `c_fn`, including one produced from a verified
 non-capturing Silk function.

## Worked Example: Checked Silk Callback Conversion

No unsafe boundary is needed when Silk can validate the conversion. The
compiler checks that the signatures match, rejects a directly visible capture,
and emits a runtime environment check for an indirect function value:

```silk
let add = fn (x: int, y: int) -> x + y;
let callback = add as c_fn (int, int) -> int;
let answer = callback(20, 22);
```

The conversion either produces a valid environment-free callback or traps
before producing one. Adding `unsafe` here would communicate no caller-owned
invariant and is unnecessary.

## Worked Example: Dynamic Symbol Lookup

A dynamic loader returns an untyped address. Only the program and the foreign
library's documentation can establish that the address is executable, has the
declared signature and calling convention, and remains live while it is used.
That assertion belongs at the address-to-callback cast:

```silk
import { Library, Symbol, is_supported, open_self } from "std/dylib";

type StrLen = c_fn (u64) -> u64;

fn main () -> int {
  if !is_supported() {
    return 0;
  }

  let library_opt: Library? = open_self().unwrap();
  if library_opt == None {
    return 1;
  }
  let library = library_opt ?? Library.invalid();

  let symbol_opt: Symbol? = library.symbol("strlen").unwrap();
  if symbol_opt == None {
    return 1;
  }
  let symbol = symbol_opt ?? Symbol.invalid();

  let strlen: StrLen = unsafe { symbol.address() as raw StrLen };
  let length = strlen("dynamic" as raw u64);
  if length != 7 {
    return 1;
  }
  return 0;
}
```

The `strlen(...)` call is safe after the cast because the narrow unsafe
boundary established a safe `c_fn` value. The `Library` must remain open until
after the call. Closing it earlier, selecting a data symbol, or declaring the
wrong parameter/result types would violate the asserted invariant; Silk cannot
discover any of those facts from the integer address.

The runnable source is [`examples/std_dylib_strlen.slk`](https://github.com/oro-computer/silk/blob/master/examples/std_dylib_strlen.slk).

## Worked Example: Raw Memory Owned by an Allocation

Raw memory access needs a live allocation, a non-overflowing in-bounds offset,
the required alignment, and suitable read/write permission. A helper that
cannot establish those facts from its `u64` and length arguments exposes an
unsafe calling contract:

```silk
import { alloc, free, load_u8, store_u8 } from "std/runtime/mem";

unsafe fn checksum_bytes (ptr: u64, len: i64) -> u64 {
  var index: i64 = 0;
  var sum: u64 = 0;
  while index < len {
    sum += load_u8(ptr, index) as u64;
    index += 1;
  }

  return sum;
}

fn main () -> int {
  let ptr = alloc(4);
  if ptr == 0 {
    return 1;
  }

  unsafe {
    store_u8(ptr, 0, 10);
    store_u8(ptr, 1, 20);
    store_u8(ptr, 2, 5);
    store_u8(ptr, 3, 7);
  }

  let sum = unsafe { checksum_bytes(ptr, 4) };
  free(ptr);

  if sum != 42 {
    return 1;
  }
  return 0;
}
```

Here `main` owns the allocation, checks allocation failure, uses only offsets
`0..3`, calls the helper before `free`, and never publishes the pointer. Those
facts justify both narrow boundaries. Moving `free(ptr)` before the checksum or
passing a length greater than four would violate the contract. The runnable
source is [`examples/unsafe_raw_memory_checksum.slk`](https://github.com/oro-computer/silk/blob/master/examples/unsafe_raw_memory_checksum.slk).

## Formal Silk Integration

Unsafe permission and formal proof are independent:

- the ordinary checker runs first, so a missing boundary reports `E2129`
 before formal verification;
- unsafe expression and statement wrappers are transparent to the Formal Silk
 translator and add no path condition, assumption, or axiom;
- `#require`, `#assure`, `#assert`, loop obligations, and contracted-call
 preconditions are checked inside unsafe wrappers exactly as outside them;
- contracts can prove modeled facts such as `address != 0` or `len > 0`, but
 the current model cannot prove that an integer denotes live readable memory
 or executable code with a particular C ABI.

For example, a declaration-only platform primitive can expose both a formal
condition and a broader unsafe machine contract:

```silk
#require address != 0;
#assure result == address;
unsafe fn preserve_registered_address (address: u64) -> u64;

#require address != 0;
#assure result == address;
fn checked_forwarder (address: u64) -> u64 {
  return unsafe preserve_registered_address(address);
}
```

The verifier proves that `checked_forwarder` supplies the declared nonzero
precondition and may use the callee's postcondition. The unsafe boundary does
not prove that the address is registered, mapped, executable, or associated
with a particular device. Those machine facts remain part of the documented
unsafe contract. Calling the primitive with literal `0` inside an unsafe block
passes the unsafe-context check but fails formal call-precondition verification
with `E3007`.

See [formal verification](/silk/docs/language/formal-verification/) for the complete modeled subset.

## Encapsulation

Safe functions may contain a narrow unsafe block after validating the
invariants needed by the operation. Callers then rely on the safe function's
documented contract rather than repeating `unsafe`.

For example, a collection implementation may bounds-check an index and use an
unsafe raw-memory operation internally. The collection's public checked method
can remain safe. A function that cannot establish the necessary invariant must
instead be declared `unsafe fn` and document the caller's obligation.

## Diagnostics

Using a gated operation outside an unsafe context reports `E2129`. The
diagnostic identifies the operation and suggests a narrow `unsafe` prefix, an
`unsafe { ... }` boundary, or a safe wrapper.

For example:

```silk
fn main () -> int {
  let address: u64 = 1;
  let callback = address as raw c_fn (int) -> int;
  return 0;
}
```

reports:

```text
error[E2129]: unsafe operation requires an unsafe context
  |
  |   let callback = address as raw c_fn (int) -> int;
  |                             ^^^ raw address-to-callback cast
  = help: prefix the operation with `unsafe` or wrap it in `unsafe { ... }` after validating its safety invariants
  = help: or declare the containing function `unsafe fn` when callers must uphold those invariants
```

The compiler anchors the diagnostic at the gated operation rather than the
containing function. CLI, C ABI diagnostic adapters, and LSP diagnostics use
the same stable `E2129` code and operation-specific detail.

`E2128` is distinct: it reports a known capturing `fn` converted to `c_fn`.
That conversion is invalid rather than an operation an unsafe boundary may
authorize, so adding `unsafe` does not suppress `E2128`.
