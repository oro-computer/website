# `oro:ip`

`oro:ip` normalizes and validates IP address inputs.

## Examples

Normalize user-provided IP input before using it in socket code:

```js
import { normalizeIPv4, isIPv4 } from 'oro:ip'

const address = normalizeIPv4('127.000.000.001')

console.log(address)
console.log(isIPv4(address))
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

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
declare module "oro:ip" {
    /**
     * Normalizes input as an IPv4 address string
     * @param {string|object|string[]|Uint8Array} input
     * @return {string}
     */
    export function normalizeIPv4(input: string | object | string[] | Uint8Array): string;
    /**
     * Determines if an input `string` is in IP address version 4 format.
     * @param {string|object|string[]|Uint8Array} input
     * @return {boolean}
     */
    export function isIPv4(input: string | object | string[] | Uint8Array): boolean;
    namespace _default {
        export { normalizeIPv4 };
        export { isIPv4 };
    }
    export default _default;
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
