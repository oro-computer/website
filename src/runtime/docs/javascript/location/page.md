---
layout: "runtime-docs"
title: "oro:location"
description: "oro:location normalizes the current runtime location and origin semantics across platforms."
docsCollection: "runtime"
section: "javascript"
order: 97
sourcePath: "javascript/location.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:location`](/runtime/docs/javascript/location/)

[`oro:location`](/runtime/docs/javascript/location/) normalizes the current runtime location and origin semantics across platforms.

## Related guides

- [Lifecycle hooks and deep links](/runtime/docs/guides/lifecycle-hooks-and-deep-links/)

## Examples

Inspect the runtime-normalized location values for the current context:

```js
import location from 'oro:location'

console.log(location.href)
console.log(location.origin)
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:location
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:location`](/runtime/docs/javascript/location/)

```ts
declare module "oro:location" {
    export class Location {
        get url(): URL;
        get protocol(): string;
        get host(): string;
        get hostname(): string;
        get port(): string;
        get pathname(): string;
        get search(): string;
        get origin(): any;
        get href(): any;
        get hash(): string;
        toString(): any;
    }
    const _default: Location;
    export default _default;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
