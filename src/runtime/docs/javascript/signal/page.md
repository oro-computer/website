---
layout: "docs"
title: "oro:signal"
description: "oro:signal exposes process-signal constants, conversion helpers, and event listeners."
docsCollection: "runtime"
section: "javascript"
order: 112
sourcePath: "javascript/signal.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:signal`](/runtime/docs/javascript/signal/)

[`oro:signal`](/runtime/docs/javascript/signal/) exposes process-signal constants, conversion helpers, and event listeners.

## Examples

Listen for runtime process signals using the signal helper surface:

```js
import signal from 'oro:signal'

signal.addEventListener('SIGTERM', (event) => {
  console.log(event.type)
})
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:signal
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:signal`](/runtime/docs/javascript/signal/)

```ts
declare module "oro:signal" {
    export * from "oro:process/signal";
    export default signal;
    import signal from "oro:process/signal";
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
