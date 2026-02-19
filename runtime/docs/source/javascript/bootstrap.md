# `oro:bootstrap`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:bootstrap'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:bootstrap
```

### TypeScript declarations

<details>
<summary><code>oro:bootstrap</code></summary>

```ts
declare module 'oro:bootstrap' {
  /**
   * @param {string} dest - file path
   * @param {string} hash - hash string
   * @param {string} hashAlgorithm - hash algorithm
   * @returns {Promise<boolean>}
   */
  export function checkHash(
    dest: string,
    hash: string,
    hashAlgorithm: string
  ): Promise<boolean>
  export function bootstrap(options: any): Bootstrap
  namespace _default {
    export { bootstrap }
    export { checkHash }
  }
  export default _default
  class Bootstrap extends EventEmitter {
    constructor(options: any)
    options: any
    run(): Promise<void>
    /**
     * @param {object} options
     * @param {Uint8Array} options.fileBuffer
     * @param {string} options.dest
     * @returns {Promise<void>}
     */
    write({
      fileBuffer,
      dest,
    }: {
      fileBuffer: Uint8Array
      dest: string
    }): Promise<void>
    /**
     * @param {string} url - url to download
     * @returns {Promise<Uint8Array>}
     * @throws {Error} - if status code is not 200
     */
    download(url: string): Promise<Uint8Array>
    cleanup(): void
  }
  import { EventEmitter } from 'oro:events'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
