---
layout: "runtime-docs"
title: "oro:background"
description: "oro:background lets you inspect and coordinate the runtime background task surface."
docsCollection: "runtime"
section: "javascript"
order: 64
sourcePath: "javascript/background.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:background`](/runtime/docs/javascript/background/)

[`oro:background`](/runtime/docs/javascript/background/) lets you inspect and coordinate the runtime background task surface.

## Examples

Check whether background execution is available before scheduling work:

```js
import background from 'oro:background'

if (background.available) {
  console.log(await background.status())
}
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:background
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:background`](/runtime/docs/javascript/background/)

```ts
declare module "oro:background" {
    export default background;
    export namespace background {
        let available: boolean;
        function register(): Promise<never>;
        function schedule(): Promise<never>;
        function cancel(): Promise<never>;
        function status(): Promise<never>;
    }
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
