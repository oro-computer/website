# `oro:worker`

`oro:worker` re-exports the runtime worker classes for dedicated, shared, and service workers.

## Examples

Launch a dedicated worker through the runtime worker surface:

```js
import Worker from 'oro:worker'

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  workerData: { job: 'thumbnail' }
})

worker.postMessage({ type: 'start' })
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

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
declare module "oro:worker" {
    export default Worker;
    import { SharedWorker } from "oro:shared-worker/index";
    import { ServiceWorker } from "oro:service-worker/instance";
    import { Worker } from "oro:worker_threads";
    export { SharedWorker, ServiceWorker, Worker };
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
