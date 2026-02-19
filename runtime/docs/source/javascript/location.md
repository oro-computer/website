# `oro:location`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:location'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:location
```

### TypeScript declarations

<details>
<summary><code>oro:location</code></summary>

```ts
declare module 'oro:location' {
  export class Location {
    get url(): URL
    get protocol(): string
    get host(): string
    get hostname(): string
    get port(): string
    get pathname(): string
    get search(): string
    get origin(): any
    get href(): any
    get hash(): string
    toString(): any
  }
  const _default: Location
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
