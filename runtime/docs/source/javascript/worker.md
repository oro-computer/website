# `oro:worker`

`oro:worker` re-exports the runtime worker classes for dedicated, shared, and service workers.

## Related guides

- [Worker threads for heavy work](?p=guides/worker-threads-for-heavy-work)
- [Shared workers across windows](?p=guides/shared-workers-across-windows)

## Examples

Launch a dedicated worker through the runtime worker surface:

```js
import Worker from 'oro:worker'

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  workerData: { job: 'thumbnail' }
})

worker.postMessage({ type: 'start' })
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:worker
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:worker`

```ts
declare module "oro:worker" {
    export default Worker;
    import { SharedWorker } from "oro:shared-worker/index";
    import { ServiceWorker } from "oro:service-worker/instance";
    import { Worker } from "oro:worker_threads";
    export { SharedWorker, ServiceWorker, Worker };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
