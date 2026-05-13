# `oro:protocol-handlers`

`oro:protocol-handlers` exposes runtime helpers for custom protocol and service-worker routing.

## Related guides

- [Custom protocols and routing](?p=guides/custom-protocols-and-routing)
- [Offline-first with service workers](?p=guides/offline-first-with-service-workers)

## Examples

Ask the runtime which service worker is currently handling a custom scheme:

```js
import { getServiceWorker } from 'oro:protocol-handlers'

const worker = await getServiceWorker({ scheme: 'npm' })

console.log(worker)
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:protocol-handlers
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:protocol-handlers`

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

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
