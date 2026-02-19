# `oro:background`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:background'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:background
```

### TypeScript declarations

<details>
<summary><code>oro:background</code></summary>

```ts
declare module 'oro:background' {
  export default background
  export namespace background {
    let available: boolean
    function register(options: any): Promise<never>
    function schedule(id: any, overrides: any): Promise<never>
    function cancel(id: any): Promise<never>
    function status(id: any): Promise<never>
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
