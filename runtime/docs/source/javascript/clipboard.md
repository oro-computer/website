# `oro:clipboard`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:clipboard'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:clipboard
```

### TypeScript declarations

<details>
<summary><code>oro:clipboard</code></summary>

```ts
declare module 'oro:clipboard' {
  /**
   * Write a string to the system clipboard.
   * @param {string} text
   * @returns {Promise<void>}
   */
  export function writeText(text: string): Promise<void>
  /**
   * Read the current text contents from the system clipboard.
   * @returns {Promise<string>}
   */
  export function readText(): Promise<string>
  /**
   * @returns {boolean} True when clipboard write operations are supported.
   */
  export function canWriteText(): boolean
  /**
   * @returns {boolean} True when clipboard read operations are supported.
   */
  export function canReadText(): boolean
  namespace _default {
    export { writeText }
    export { readText }
    export { canWriteText }
    export { canReadText }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
