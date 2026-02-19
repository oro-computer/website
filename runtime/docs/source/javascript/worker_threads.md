# `oro:worker_threads`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:worker_threads'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:worker_threads
oro:worker_threads/init
```

### TypeScript declarations

<details>
<summary><code>oro:worker_threads</code></summary>

```ts
declare module 'oro:worker_threads' {
  /**
   * Set shared worker environment data.
   * @param {string} key
   * @param {any} value
   */
  export function setEnvironmentData(key: string, value: any): void
  /**
   * Get shared worker environment data.
   * @param {string} key
   * @return {any}
   */
  export function getEnvironmentData(key: string): any
  /**

     * A pool of known worker threads.
     * @type {<Map<string, Worker>}
     */
  export const workers: <Map>() => <string, Worker>() => any
  /**
   * `true` if this is the "main" thread, otherwise `false`
   * The "main" thread is the top level webview window.
   * @type {boolean}
   */
  export const isMainThread: boolean
  /**
   * The main thread `MessagePort` which is `null` when the
   * current context is not the "main thread".
   * @type {MessagePort?}
   */
  export const mainPort: MessagePort | null
  /**
   * A worker thread `BroadcastChannel` class.
   */
  export class BroadcastChannel extends globalThis.BroadcastChannel {}
  /**
   * A worker thread `MessageChannel` class.
   */
  export class MessageChannel extends globalThis.MessageChannel {}
  /**
   * A worker thread `MessagePort` class.
   */
  export class MessagePort extends globalThis.MessagePort {}
  /**
   * The current unique thread ID.
   * @type {number}
   */
  export const threadId: number
  /**
   * The parent `MessagePort` instance
   * @type {MessagePort?}
   */
  export const parentPort: MessagePort | null
  /**
   * Transferred "worker data" when creating a new `Worker` instance.
   * @type {any?}
   */
  export const workerData: any | null
  export class Pipe extends AsyncResource {
    /**
     * `Pipe` class constructor.
     * @param {Worker} worker
     * @ignore
     */
    constructor(worker: Worker)
    /**
     * `true` if the pipe is still reading, otherwise `false`.
     * @type {boolean}
     */
    get reading(): boolean
    /**
     * Destroys the pipe
     */
    destroy(): void
    #private
  }
  /**
     * @typedef {{
     *   env?: object,
     *   stdin?: boolean = false,
     *   stdout?: boolean = false,
     *   stderr?: boolean = false,
     *   workerData?: any,
     *   transferList?: any[],
     *   eval?: boolean = false
     * }} WorkerOptions

    /**
     * A worker thread that can communicate directly with a parent thread,
     * share environment data, and process streamed data.
     */
  export class Worker extends EventEmitter {
    /**
     * `Worker` class constructor.
     * @param {string} filename
     * @param {WorkerOptions=} [options]
     */
    constructor(filename: string, options?: WorkerOptions | undefined)
    /**
     * Handles incoming worker messages.
     * @ignore
     * @param {MessageEvent} event
     */
    onWorkerMessage(event: MessageEvent): boolean
    /**
     * Handles process environment change events
     * @ignore
     * @param {import('./process.js').ProcessEnvironmentEvent} event
     */
    onProcessEnvironmentEvent(
      event: import('oro:process').ProcessEnvironmentEvent
    ): void
    /**
     * The unique ID for this `Worker` thread instance.
     * @type {number}
     */
    get id(): number
    get threadId(): number
    /**
     * A `Writable` standard input stream if `{ stdin: true }` was set when
     * creating this `Worker` instance.
     * @type {import('./stream.js').Writable?}
     */
    get stdin(): import('oro:stream').Writable | null
    /**
     * A `Readable` standard output stream if `{ stdout: true }` was set when
     * creating this `Worker` instance.
     * @type {import('./stream.js').Readable?}
     */
    get stdout(): import('oro:stream').Readable | null
    /**
     * A `Readable` standard error stream if `{ stderr: true }` was set when
     * creating this `Worker` instance.
     * @type {import('./stream.js').Readable?}
     */
    get stderr(): import('oro:stream').Readable | null
    /**
     * Terminates the `Worker` instance
     */
    terminate(): void
    postMessage(...args: any[]): void
    #private
  }
  namespace _default {
    export { Worker }
    export { isMainThread }
    export { parentPort }
    export { setEnvironmentData }
    export { getEnvironmentData }
    export { workerData }
    export { threadId }
    export { SHARE_ENV }
  }
  export default _default
  /**
   * /**
   * A worker thread that can communicate directly with a parent thread,
   * share environment data, and process streamed data.
   */
  export type WorkerOptions = {
    env?: object
    stdin?: boolean
    stdout?: boolean
    stderr?: boolean
    workerData?: any
    transferList?: any[]
    eval?: boolean
  }
  import { AsyncResource } from 'oro:async/resource'
  import { EventEmitter } from 'oro:events'
  import { Writable } from 'oro:stream'
  import { Readable } from 'oro:stream'
  import { SHARE_ENV } from 'oro:worker_threads/init'
  import init from 'oro:worker_threads/init'
  export { SHARE_ENV, init }
}
```

</details>

<details>
<summary><code>oro:worker_threads/init</code></summary>

```ts
declare module 'oro:worker_threads/init' {
  export const SHARE_ENV: unique symbol
  export const isMainThread: boolean
  export namespace state {
    export { isMainThread }
    export let parentPort: any
    export let mainPort: any
    export let workerData: any
    export let url: any
    export let env: {}
    export let id: number
  }
  namespace _default {
    export { state }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
