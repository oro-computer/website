# `oro:ip`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:ip'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:ip
```

### TypeScript declarations

<details>
<summary><code>oro:ip</code></summary>

```ts
declare module 'oro:ip' {
  /**
   * Normalizes input as an IPv4 address string
   * @param {string|object|string[]|Uint8Array} input
   * @return {string}
   */
  export function normalizeIPv4(
    input: string | object | string[] | Uint8Array
  ): string
  /**
   * Determines if an input `string` is in IP address version 4 format.
   * @param {string|object|string[]|Uint8Array} input
   * @return {boolean}
   */
  export function isIPv4(
    input: string | object | string[] | Uint8Array
  ): boolean
  namespace _default {
    export { normalizeIPv4 }
    export { isIPv4 }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
