# `oro:protocol-handlers`

`oro:protocol-handlers` exposes runtime helpers for custom protocol and service-worker routing.

## Examples

Ask the runtime which service worker is currently handling a custom scheme:

```js
import { getServiceWorker } from 'oro:protocol-handlers'

const worker = await getServiceWorker({ scheme: 'npm' })

console.log(worker)
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

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
declare module "oro:protocol-handlers" {
    /**
     * @typedef {{ scheme: string }} GetServiceWorkerOptions

    /**
     * @param {GetServiceWorkerOptions} options
     * @return {Promise<ServiceWorker|null>
     */
    export function getServiceWorker(options: GetServiceWorkerOptions): Promise<ServiceWorker | null>;
    namespace _default {
        export { getServiceWorker };
    }
    export default _default;
    /**
     * /**
     */
    export type GetServiceWorkerOptions = {
        scheme: string;
    };
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
