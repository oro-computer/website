# `oro:navigation`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:navigation'

console.log(Object.keys(api))
```

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
declare module 'oro:navigation' {
  export const Navigation: any
  export const NavigationHistoryEntry: any
  export const navigation: any
  export default navigation
}
```

</details>

<details>
<summary><code>oro:navigation/navigation</code></summary>

```ts
declare module 'oro:navigation/navigation' {
  export function setSerializer(serializer: any): void
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
