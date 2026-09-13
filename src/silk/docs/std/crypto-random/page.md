---
layout: "silk-docs"
title: "std::crypto::random"
description: "Source: std/crypto/random.slk"
docsCollection: "silk"
section: "std"
order: 158
sourcePath: "std/crypto-random.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::crypto::random`](/silk/docs/std/crypto-random/)

Source: [`std/crypto/random.slk`](https://github.com/oro-computer/silk/blob/master/std/crypto/random.slk)

This is the exact canonical documentation page for [`std::crypto::random`](/silk/docs/std/crypto-random/).

## Role

[`std::crypto::random`](/silk/docs/std/crypto-random/) is a shipped nested module in the Silk standard library.
This exact-name page exists so the module can be discovered and referenced directly by its canonical name.

## Canonical Context

Use the following owning docs for the substantive API/design context for this module:

- [crypto](/silk/docs/std/crypto/)

## Notes

- The shipped source for this module is [`std/crypto/random.slk`](https://github.com/oro-computer/silk/blob/master/std/crypto/random.slk).
- The canonical module name is [`std::crypto::random`](/silk/docs/std/crypto-random/).
- Provider behavior follows [crypto](/silk/docs/std/crypto/): Apple `auto` and `platform`
 builds use Security-backed random bytes, while `builtin` builds use
 libsodium `randombytes_*`.
- Family-wide semantics, examples, and cross-module relationships live in the owning docs listed above.
