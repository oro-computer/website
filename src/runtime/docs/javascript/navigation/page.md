---
layout: "runtime-docs"
title: "oro:navigation"
description: "oro:navigation surfaces the Navigation API state that the runtime makes available to application code."
docsCollection: "runtime"
section: "javascript"
order: 100
sourcePath: "javascript/navigation.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:navigation`](/runtime/docs/javascript/navigation/)

[`oro:navigation`](/runtime/docs/javascript/navigation/) surfaces the Navigation API state that the runtime makes available to application code.

## Related guides

- [Lifecycle hooks and deep links](/runtime/docs/guides/lifecycle-hooks-and-deep-links/)
- [Windows and messaging](/runtime/docs/guides/windows-and-messaging/)

## Examples

Read the current navigation entry and listen for browser-style navigation events:

```js
import navigation from 'oro:navigation'

console.log(navigation.currentEntry?.url)

navigation.addEventListener('navigate', (event) => {
  console.log(event.destination.url)
})
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:navigation
oro:navigation/navigation
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:navigation`](/runtime/docs/javascript/navigation/)

```ts
declare module "oro:navigation" {
    export const Navigation: any;
    export const NavigationHistoryEntry: any;
    export const navigation: any;
    export default navigation;
}
```

#### `oro:navigation/navigation`

```ts
declare module "oro:navigation/navigation" {
    export function setSerializer(serializer: any): void;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
