# `oro:worker`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:worker'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:worker
```

### TypeScript declarations

<details>
<summary><code>oro:worker</code></summary>

```ts
declare module 'oro:worker' {
  export default Worker
  import { SharedWorker } from 'oro:shared-worker/index'
  import { ServiceWorker } from 'oro:service-worker/instance'
  import { Worker } from 'oro:worker_threads'
  export { SharedWorker, ServiceWorker, Worker }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
