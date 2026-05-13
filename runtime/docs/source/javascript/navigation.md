# `oro:navigation`

`oro:navigation` surfaces the Navigation API state that the runtime makes available to application code.

## Related guides

- [Lifecycle hooks and deep links](?p=guides/lifecycle-hooks-and-deep-links)
- [Windows and messaging](?p=guides/windows-and-messaging)

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

#### `oro:navigation`

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

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
