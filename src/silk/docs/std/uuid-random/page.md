---
layout: "docs"
description: "Source: std/uuid/random.slk."
docsCollection: "silk"
section: "std"
order: 230
sourcePath: "std/uuid-random.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::uuid::random`](/silk/docs/std/uuid-random/)

Source: [`std/uuid/random.slk`](https://github.com/oro-computer/silk/blob/master/std/uuid/random.slk).

This module generates UUIDs using the active security provider through
[`std::crypto::random`](/silk/docs/std/crypto-random/). Built-in providers use libsodium; supported Apple
platform providers use native cryptographic randomness without requiring
libsodium symbols.

- `v4() -> std::uuid::UUIDResult` generates random bits and sets the v4 version
 and RFC variant.
- `v7(unix_ms: u64) -> std::uuid::UUIDResult` combines Unix milliseconds with
 random bits.
- `v1(timestamp_100ns: u64)` and `v6(timestamp_100ns: u64)` return `UUIDResult`
 using Gregorian 100ns ticks, a random clock sequence, and a random node ID
 with the multicast bit set.
- `v1_now()`, `v6_now()`, and `v7_now()` return `UUIDResult` using the current
 system time.

Provider initialization or random-generation failure returns `InitFailed`;
clock failures return `NoTime`. Timestamp validation errors are preserved from
[`std::uuid`](/silk/docs/std/uuid/). See [UUIDs](/silk/docs/std/uuid/) for formats and timestamp conversions.
