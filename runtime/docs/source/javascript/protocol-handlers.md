# `oro:protocol-handlers`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:protocol-handlers'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:protocol-handlers
```

### TypeScript declarations

<details>
<summary><code>oro:protocol-handlers</code></summary>

```ts
declare module 'oro:protocol-handlers' {
  /**
     * @typedef {{ scheme: string }} GetServiceWorkerOptions

    /**
     * @param {GetServiceWorkerOptions} options
     * @return {Promise<ServiceWorker|null>
     */
  export function getServiceWorker(
    options: GetServiceWorkerOptions
  ): Promise<ServiceWorker | null>
  namespace _default {
    export { getServiceWorker }
  }
  export default _default
  /**
   * /**
   */
  export type GetServiceWorkerOptions = {
    scheme: string
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
