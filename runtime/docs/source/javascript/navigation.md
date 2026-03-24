# `oro:navigation`

`oro:navigation` surfaces the Navigation API state that the runtime makes available to application code.

## Examples

Read the current navigation entry and listen for browser-style navigation events:

```js
import navigation from 'oro:navigation'

console.log(navigation.currentEntry?.url)

navigation.addEventListener('navigate', (event) => {
  console.log(event.destination.url)
})
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:navigation
oro:navigation/navigation
```

### TypeScript declarations

<details>
<summary><code>oro:navigation</code></summary>

```ts
declare module "oro:navigation" {
    export const Navigation: any;
    export const NavigationHistoryEntry: any;
    export const navigation: any;
    export default navigation;
}
```

</details>

<details>
<summary><code>oro:navigation/navigation</code></summary>

```ts
declare module "oro:navigation/navigation" {
    export function setSerializer(serializer: any): void;
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
