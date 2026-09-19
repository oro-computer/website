---
layout: "docs"
description: "This is the canonical module doc for std::abort_controller."
docsCollection: "silk"
section: "std"
order: 153
sourcePath: "std/abort_controller.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# [`std::abort_controller`](/silk/docs/std/abort_controller/)

This is the canonical module doc for [`std::abort_controller`](/silk/docs/std/abort_controller/).

[`std::abort_controller`](/silk/docs/std/abort_controller/) provides the WHATWG-style cooperative cancellation API
shipped in [`std/abort_controller.slk`](https://github.com/oro-computer/silk/blob/master/std/abort_controller.slk): `AbortController`, `AbortSignal`, and
`AbortSignalBorrow`.

The detailed API contract and semantics are documented in:

- [abort controller](/silk/docs/std/abort-controller/)

Read that page as the complete public surface for:

- `AbortReasonKind`
- `AbortReason`
- `AbortController`
- `AbortSignal`
- `AbortSignalBorrow`
- `AbortControllerResult`
- cancellation semantics, ownership, and wait/wait-fd behavior

Related docs:

- [abort controller](/silk/docs/std/abort-controller/)
- [task](/silk/docs/std/task/)
- [stream](/silk/docs/std/stream/)
- [concurrency](/silk/docs/language/concurrency/)
