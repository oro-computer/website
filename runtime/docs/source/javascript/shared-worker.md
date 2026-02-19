# `oro:shared-worker`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:shared-worker'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:shared-worker
oro:shared-worker/debug
oro:shared-worker/global
oro:shared-worker/index
oro:shared-worker/init
oro:shared-worker/state
oro:shared-worker/worker
```

### TypeScript declarations

<details>
<summary><code>oro:shared-worker</code></summary>

```ts
declare module 'oro:shared-worker' {
  /**
   * A reference to the opened environment. This value is an instance of an
   * `Environment` if the scope is a ServiceWorker scope.
   * @type {Environment|null}
   */
  export const env: Environment | null
  export default SharedWorker
  import { SharedWorker } from 'oro:shared-worker/index'
  export { Environment, SharedWorker }
}
```

</details>

<details>
<summary><code>oro:shared-worker/debug</code></summary>

```ts
declare module 'oro:shared-worker/debug' {
  export function debug(...args: any[]): void
  export default debug
}
```

</details>

<details>
<summary><code>oro:shared-worker/global</code></summary>

```ts
declare module 'oro:shared-worker/global' {
  export class SharedWorkerGlobalScope {
    get isSharedWorkerScope(): boolean
    set onconnect(listener: any)
    get onconnect(): any
  }
  const _default: SharedWorkerGlobalScope
  export default _default
}
```

</details>

<details>
<summary><code>oro:shared-worker/index</code></summary>

```ts
declare module 'oro:shared-worker/index' {
  export function init(sharedWorker: any, options: any): Promise<void>
  /**
   * Gets the SharedWorker context window.
   * This function will create it if it does not already exist.
   * @return {Promise<import('./window.js').ApplicationWindow}
   */
  export function getContextWindow(): Promise<any>
  export const SHARED_WORKER_WINDOW_TITLE: 'oro:shared-worker'
  export const SHARED_WORKER_WINDOW_PATH: '/oro/shared-worker/index.html'
  export const channel: BroadcastChannel
  export const workers: Map<any, any>
  export class SharedWorkerMessagePort extends ipc.IPCMessagePort {}
  export class SharedWorker extends EventTarget {
    /**
     * `SharedWorker` class constructor.
     * @param {string|URL|Blob} aURL
     * @param {string|object=} [nameOrOptions]
     */
    constructor(
      aURL: string | URL | Blob,
      nameOrOptions?: (string | object) | undefined
    )
    set onerror(onerror: any)
    get onerror(): any
    get ready(): any
    get channel(): ipc.IPCMessageChannel
    get port(): any
    get id(): any
    #private
  }
  export default SharedWorker
  import ipc from 'oro:ipc'
}
```

</details>

<details>
<summary><code>oro:shared-worker/init</code></summary>

```ts
declare module 'oro:shared-worker/init' {
  export function onInstall(event: any): Promise<void>
  export function onUninstall(event: any): Promise<void>
  export function onConnect(event: any): Promise<void>
  export const workers: Map<any, any>
  export { channel }
  export class SharedWorkerInstance extends Worker {
    constructor(filename: any, options: any)
    get info(): any
    onMessage(event: any): Promise<void>
    #private
  }
  export class SharedWorkerInfo {
    constructor(data: any)
    id: any
    port: any
    client: any
    scriptURL: any
    url: any
    hash: any
    get pathname(): string
  }
  const _default: any
  export default _default
  import { channel } from 'oro:shared-worker/index'
}
```

</details>

<details>
<summary><code>oro:shared-worker/state</code></summary>

```ts
declare module 'oro:shared-worker/state' {
  export const state: any
  export default state
}
```

</details>

<details>
<summary><code>oro:shared-worker/worker</code></summary>

```ts
declare module 'oro:shared-worker/worker' {
  export function onReady(): void
  export function onMessage(event: any): Promise<void>
  const _default: any
  export default _default
  export namespace SHARED_WORKER_READY_TOKEN {
    let __shared_worker_ready: boolean
  }
  export namespace module {
    let exports: {}
  }
  export const connections: Set<any>
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
