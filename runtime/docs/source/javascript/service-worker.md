# `oro:service-worker`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:service-worker'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:service-worker
oro:service-worker/clients
oro:service-worker/container
oro:service-worker/context
oro:service-worker/debug
oro:service-worker/env
oro:service-worker/events
oro:service-worker/global
oro:service-worker/init
oro:service-worker/instance
oro:service-worker/notification
oro:service-worker/registration
oro:service-worker/state
oro:service-worker/storage
oro:service-worker/worker
```

### TypeScript declarations

<details>
<summary><code>oro:service-worker</code></summary>

```ts
declare module 'oro:service-worker' {
  /**
   * A reference to the opened environment. This value is an instance of an
   * `Environment` if the scope is a ServiceWorker scope.
   * @type {Environment|null}
   */
  export const env: Environment | null
  namespace _default {
    export { ExtendableEvent }
    export { FetchEvent }
    export { Environment }
    export { Context }
    export { env }
  }
  export default _default
  import { Environment } from 'oro:service-worker/env'
  import { ExtendableEvent } from 'oro:service-worker/events'
  import { FetchEvent } from 'oro:service-worker/events'
  import { Context } from 'oro:service-worker/context'
  export { ExtendableEvent, FetchEvent, Environment, Context }
}
```

</details>

<details>
<summary><code>oro:service-worker/clients</code></summary>

```ts
declare module 'oro:service-worker/clients' {
  export class Client {
    constructor(options: any)
    get id(): any
    get url(): any
    get type(): any
    get frameType(): any
    postMessage(message: any, optionsOrTransferables?: any): void
    #private
  }
  export class WindowClient extends Client {
    get focused(): boolean
    get ancestorOrigins(): any[]
    get visibilityState(): string
    focus(): Promise<this>
    navigate(url: any): Promise<this>
    #private
  }
  export class Clients {
    get(id: any): Promise<Client>
    matchAll(options?: any): Promise<any>
    openWindow(url: any, options?: any): Promise<WindowClient>
    claim(): Promise<void>
  }
  const _default: Clients
  export default _default
}
```

</details>

<details>
<summary><code>oro:service-worker/container</code></summary>

```ts
declare module 'oro:service-worker/container' {
  /**
   * Predicate to determine if service workers are allowed
   * @return {boolean}
   */
  export function isServiceWorkerAllowed(): boolean
  /**
   * A `ServiceWorkerContainer` implementation that is attached to the global
   * `globalThis.navigator.serviceWorker` object.
   */
  export class ServiceWorkerContainer extends EventTarget {
    get ready(): any
    get controller(): any
    /**
     * A special initialization function for augmenting the global
     * `globalThis.navigator.serviceWorker` platform `ServiceWorkerContainer`
     * instance.
     *
     * All functions MUST be sure to what a lexically bound `this` becomes as the
     * target could change with respect to the `internal` `Map` instance which
     * contains private implementation properties relevant to the runtime
     * `ServiceWorkerContainer` internal state implementations.
     * @ignore
     */
    init(): Promise<any>
    register(
      scriptURL: any,
      options?: any
    ): Promise<globalThis.ServiceWorkerRegistration | ServiceWorkerRegistration>
    getRegistration(
      clientURL: any
    ): Promise<globalThis.ServiceWorkerRegistration | ServiceWorkerRegistration>
    getRegistrations(
      options: any
    ): Promise<
      | readonly globalThis.ServiceWorkerRegistration[]
      | ServiceWorkerRegistration[]
    >
    startMessages(): void
  }
  export default ServiceWorkerContainer
  import { ServiceWorkerRegistration } from 'oro:service-worker/registration'
}
```

</details>

<details>
<summary><code>oro:service-worker/context</code></summary>

```ts
declare module 'oro:service-worker/context' {
  /**
   * A context given to `ExtendableEvent` interfaces and provided to
   * simplified service worker modules
   */
  export class Context {
    /**
     * `Context` class constructor.
     * @param {import('./events.js').ExtendableEvent} event
     */
    constructor(event: import('oro:service-worker/events').ExtendableEvent)
    /**
     * Context data. This may be a custom protocol handler scheme data
     * by default, if available.
     * @type {any?}
     */
    data: any | null
    /**
     * The `ExtendableEvent` for this `Context` instance.
     * @type {ExtendableEvent}
     */
    get event(): ExtendableEvent
    /**
     * An environment context object.
     * @type {object?}
     */
    get env(): object | null
    /**
     * Resets the current environment context.
     * @return {Promise<boolean>}
     */
    resetEnvironment(): Promise<boolean>
    /**
     * Unused, but exists for cloudflare compat.
     * @ignore
     */
    passThroughOnException(): void
    /**
     * Tells the event dispatcher that work is ongoing.
     * It can also be used to detect whether that work was successful.
     * @param {Promise} promise
     */
    waitUntil(promise: Promise<any>): Promise<any>
    /**
     * TODO
     */
    handled(): Promise<any>
    /**
     * Gets the client for this event context.
     * @return {Promise<import('./clients.js').Client>}
     */
    client(): Promise<import('oro:service-worker/clients').Client>
    #private
  }
  namespace _default {
    export { Context }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:service-worker/debug</code></summary>

```ts
declare module 'oro:service-worker/debug' {
  export function debug(...args: any[]): void
  export default debug
}
```

</details>

<details>
<summary><code>oro:service-worker/env</code></summary>

```ts
declare module 'oro:service-worker/env' {
  /**
   * Opens an environment for a particular scope.
   * @param {EnvironmentOptions} options
   * @return {Promise<Environment>}
   */
  export function open(options: EnvironmentOptions): Promise<Environment>
  /**
   * Closes an active `Environment` instance, dropping the global
   * instance reference.
   * @return {Promise<boolean>}
   */
  export function close(): Promise<boolean>
  /**
   * Resets an active `Environment` instance
   * @return {Promise<boolean>}
   */
  export function reset(): Promise<boolean>
  /**
   * @typedef {{
   *   scope: string
   * }} EnvironmentOptions
   */
  /**
   * An event dispatched when an environment value is updated (set, delete)
   */
  export class EnvironmentEvent extends Event {
    /**
     * `EnvironmentEvent` class constructor.
     * @param {'set'|'delete'} type
     * @param {object=} [entry]
     */
    constructor(type: 'set' | 'delete', entry?: object | undefined)
    entry: any
  }
  /**
   * An environment context object with persistence and durability
   * for service worker environments.
   */
  export class Environment extends EventTarget {
    /**
     * Maximum entries that will be restored from storage into the environment
     * context object.
     * @type {number}
     */
    static MAX_CONTEXT_ENTRIES: number
    /**
     * Opens an environment for a particular scope.
     * @param {EnvironmentOptions} options
     * @return {Environment}
     */
    static open(options: EnvironmentOptions): Environment
    /**
     * The current `Environment` instance
     * @type {Environment?}
     */
    static instance: Environment | null
    /**
     * `Environment` class constructor
     * @ignore
     * @param {EnvironmentOptions} options
     */
    constructor(options: EnvironmentOptions)
    /**
     * A reference to the currently opened environment database.
     * @type {import('../internal/database.js').Database}
     */
    get database(): import('oro:internal/database').Database
    /**
     * A proxied object for reading and writing environment state.
     * Values written to this object must be cloneable with respect to the
     * structured clone algorithm.
     * @see {https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm}
     * @type {Proxy<object>}
     */
    get context(): ProxyConstructor
    /**
     * The environment type
     * @type {string}
     */
    get type(): string
    /**
     * The current environment name. This value is also used as the
     * internal database name.
     * @type {string}
     */
    get name(): string
    /**
     * Resets the current environment to an empty state.
     */
    reset(): Promise<void>
    /**
     * Opens the environment.
     * @ignore
     */
    open(): Promise<void>
    /**
     * Closes the environment database, purging existing state.
     * @ignore
     */
    close(): Promise<void>
    #private
  }
  namespace _default {
    export { Environment }
    export { close }
    export { reset }
    export { open }
  }
  export default _default
  export type EnvironmentOptions = {
    scope: string
  }
  import database from 'oro:internal/database'
}
```

</details>

<details>
<summary><code>oro:service-worker/events</code></summary>

```ts
declare module 'oro:service-worker/events' {
  export const textEncoder: TextEncoderStream
  export const FETCH_EVENT_TIMEOUT: number
  export const FETCH_EVENT_MAX_RESPONSE_REDIRECTS: number
  /**
   * The `ExtendableEvent` interface extends the lifetime of the "install" and
   * "activate" events dispatched on the global scope as part of the service
   * worker lifecycle.
   */
  export class ExtendableEvent extends Event {
    /**
     * `ExtendableEvent` class constructor.
     * @ignore
     */
    constructor(...args: any[])
    /**
     * A context for this `ExtendableEvent` instance.
     * @type {import('./context.js').Context}
     */
    get context(): import('oro:service-worker/context').Context
    /**
     * A promise that can be awaited which waits for this `ExtendableEvent`
     * instance no longer has pending promises.
     * @type {Promise}
     */
    get awaiting(): Promise<any>
    /**
     * The number of pending promises
     * @type {number}
     */
    get pendingPromises(): number
    /**
     * `true` if the `ExtendableEvent` instance is considered "active",
     * otherwise `false`.
     * @type {boolean}
     */
    get isActive(): boolean
    /**
     * Tells the event dispatcher that work is ongoing.
     * It can also be used to detect whether that work was successful.
     * @param {Promise} promise
     */
    waitUntil(promise: Promise<any>): void
    /**
     * Returns a promise that this `ExtendableEvent` instance is waiting for.
     * @return {Promise}
     */
    waitsFor(): Promise<any>
    #private
  }
  /**
   * This is the event type for "fetch" events dispatched on the service worker
   * global scope. It contains information about the fetch, including the
   * request and how the receiver will treat the response.
   */
  export class FetchEvent extends ExtendableEvent {
    static defaultHeaders: Headers
    /**
     * `FetchEvent` class constructor.
     * @ignore
     * @param {string=} [type = 'fetch']
     * @param {object=} [options]
     */
    constructor(type?: string | undefined, options?: object | undefined)
    /**
     * The handled property of the `FetchEvent` interface returns a promise
     * indicating if the event has been handled by the fetch algorithm or not.
     * This property allows executing code after the browser has consumed a
     * response, and is usually used together with the `waitUntil()` method.
     * @type {Promise}
     */
    get handled(): Promise<any>
    /**
     * The request read-only property of the `FetchEvent` interface returns the
     * `Request` that triggered the event handler.
     * @type {Request}
     */
    get request(): Request
    /**
     * The `clientId` read-only property of the `FetchEvent` interface returns
     * the id of the Client that the current service worker is controlling.
     * @type {string}
     */
    get clientId(): string
    /**
     * @ignore
     * @type {string}
     */
    get resultingClientId(): string
    /**
     * @ignore
     * @type {string}
     */
    get replacesClientId(): string
    /**
     * @ignore
     * @type {boolean}
     */
    get isReload(): boolean
    /**
     * @ignore
     * @type {Promise}
     */
    get preloadResponse(): Promise<any>
    /**
     * The `respondWith()` method of `FetchEvent` prevents the webview's
     * default fetch handling, and allows you to provide a promise for a
     * `Response` yourself.
     * @param {Response|Promise<Response>} response
     */
    respondWith(response: Response | Promise<Response>): void
    #private
  }
  export class ExtendableMessageEvent extends ExtendableEvent {
    /**
     * `ExtendableMessageEvent` class constructor.
     * @param {string=} [type = 'message']
     * @param {object=} [options]
     */
    constructor(type?: string | undefined, options?: object | undefined)
    /**
     * @type {any}
     */
    get data(): any
    /**
     * @type {MessagePort[]}
     */
    get ports(): MessagePort[]
    /**
     * @type {import('./clients.js').Client?}
     */
    get source(): import('oro:service-worker/clients').Client | null
    /**
     * @type {string?}
     */
    get origin(): string | null
    /**
     * @type {string}
     */
    get lastEventId(): string
    #private
  }
  export class NotificationEvent extends ExtendableEvent {
    constructor(type: any, options: any)
    get action(): string
    get notification(): any
    #private
  }
  namespace _default {
    export { ExtendableMessageEvent }
    export { ExtendableEvent }
    export { FetchEvent }
  }
  export default _default
  import { Context } from 'oro:service-worker/context'
}
```

</details>

<details>
<summary><code>oro:service-worker/global</code></summary>

```ts
declare module 'oro:service-worker/global' {
  export class ServiceWorkerGlobalScope {
    get isServiceWorkerScope(): boolean
    get ExtendableEvent(): typeof ExtendableEvent
    get FetchEvent(): typeof FetchEvent
    get serviceWorker(): any
    set registration(value: any)
    get registration(): any
    get clients(): import('oro:service-worker/clients').Clients
    set onactivate(listener: any)
    get onactivate(): any
    set onmessage(listener: any)
    get onmessage(): any
    set oninstall(listener: any)
    get oninstall(): any
    set onfetch(listener: any)
    get onfetch(): any
    skipWaiting(): Promise<void>
  }
  const _default: ServiceWorkerGlobalScope
  export default _default
  import { ExtendableEvent } from 'oro:service-worker/events'
  import { FetchEvent } from 'oro:service-worker/events'
}
```

</details>

<details>
<summary><code>oro:service-worker/init</code></summary>

```ts
declare module 'oro:service-worker/init' {
  export function onRegister(event: any): Promise<void>
  export function onUnregister(event: any): Promise<void>
  export function onSkipWaiting(event: any): Promise<void>
  export function onActivate(event: any): Promise<void>
  export function onFetch(event: any): Promise<ipc.Result>
  export function onNotificationShow(event: any, target: any): any
  export function onNotificationClose(event: any): void
  export function onGetNotifications(event: any): void
  export const workers: Map<any, any>
  export const channel: BroadcastChannel
  export class ServiceWorkerInstance extends Worker {
    constructor(filename: any, options: any)
    get info(): any
    get notifications(): any[]
    onMessage(event: any): Promise<void>
    #private
  }
  export class ServiceWorkerInfo {
    constructor(data: any)
    id: any
    url: any
    hash: any
    scope: any
    scriptURL: any
    serializedWorkerArgs: any
    priority: string
    get pathname(): string
    get promise(): any
    #private
  }
  const _default: any
  export default _default
  import ipc from 'oro:ipc'
}
```

</details>

<details>
<summary><code>oro:service-worker/instance</code></summary>

```ts
declare module 'oro:service-worker/instance' {
  export function createServiceWorker(currentState?: any, options?: any): any
  export const channel: BroadcastChannel
  export const ServiceWorker:
    | {
        new (): ServiceWorker
        prototype: ServiceWorker
      }
    | {
        new (): {
          get onmessage(): any
          set onmessage(_: any)
          get onerror(): any
          set onerror(_: any)
          get onstatechange(): any
          set onstatechange(_: any)
          get state(): any
          get scriptURL(): any
          postMessage(): void
          addEventListener(
            type: string,
            callback: EventListenerOrEventListenerObject | null,
            options?: AddEventListenerOptions | boolean
          ): void
          dispatchEvent(event: Event): boolean
          removeEventListener(
            type: string,
            callback: EventListenerOrEventListenerObject | null,
            options?: EventListenerOptions | boolean
          ): void
        }
      }
  export default createServiceWorker
}
```

</details>

<details>
<summary><code>oro:service-worker/notification</code></summary>

```ts
declare module 'oro:service-worker/notification' {
  export function showNotification(
    registration: any,
    title: any,
    options: any
  ): Promise<void>
  export function getNotifications(
    registration: any,
    options?: any
  ): Promise<any>
  namespace _default {
    export { showNotification }
    export { getNotifications }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:service-worker/registration</code></summary>

```ts
declare module 'oro:service-worker/registration' {
  export class ServiceWorkerRegistration extends EventTarget {
    constructor(info: any, serviceWorker: any)
    get scope(): any
    get updateViaCache(): string
    get installing(): any
    get waiting(): any
    get active(): any
    set onupdatefound(onupdatefound: any)
    get onupdatefound(): any
    get navigationPreload(): any
    getNotifications(): Promise<any>
    showNotification(title: any, options: any): Promise<void>
    unregister(): Promise<boolean>
    update(): Promise<void>
    #private
  }
  export default ServiceWorkerRegistration
}
```

</details>

<details>
<summary><code>oro:service-worker/state</code></summary>

```ts
declare module 'oro:service-worker/state' {
  export const channel: BroadcastChannel
  export const state: any
  export default state
}
```

</details>

<details>
<summary><code>oro:service-worker/storage</code></summary>

```ts
declare module 'oro:service-worker/storage' {
  /**
   * A factory for creating storage interfaces.
   * @param {'memoryStorage'|'localStorage'|'sessionStorage'} type
   * @return {Promise<Storage>}
   */
  export function createStorageInterface(
    type: 'memoryStorage' | 'localStorage' | 'sessionStorage'
  ): Promise<Storage>
  /**
   * @typedef {{ done: boolean, value: string | undefined }} IndexIteratorResult
   */
  /**
   * An iterator interface for an `Index` instance.
   */
  export class IndexIterator {
    /**
     * `IndexIterator` class constructor.
     * @ignore
     * @param {Index} index
     */
    constructor(index: Index)
    /**
     * `true` if the iterator is "done", otherwise `false`.
     * @type {boolean}
     */
    get done(): boolean
    /**
     * Returns the next `IndexIteratorResult`.
     * @return {IndexIteratorResult}
     */
    next(): IndexIteratorResult
    /**
     * Mark `IndexIterator` as "done"
     * @return {IndexIteratorResult}
     */
    return(): IndexIteratorResult
    #private
  }
  /**
   * A container used by the `Provider` to index keys and values
   */
  export class Index {
    /**
     * A reference to the keys in this index.
     * @type {string[]}
     */
    get keys(): string[]
    /**
     * A reference to the values in this index.
     * @type {string[]}
     */
    get values(): string[]
    /**
     * The number of entries in this index.
     * @type {number}
     */
    get length(): number
    /**
     * Returns the key at a given `index`, if it exists otherwise `null`.
     * @param {number} index}
     * @return {string?}
     */
    key(index: number): string | null
    /**
     * Returns the value at a given `index`, if it exists otherwise `null`.
     * @param {number} index}
     * @return {string?}
     */
    value(index: number): string | null
    /**
     * Inserts a value in the index.
     * @param {string} key
     * @param {string} value
     */
    insert(key: string, value: string): void
    /**
     * Computes the index of a key in this index.
     * @param {string} key
     * @return {number}
     */
    indexOf(key: string): number
    /**
     * Clears all keys and values in the index.
     */
    clear(): void
    /**
     * Returns an entry at `index` if it exists, otherwise `null`.
     * @param {number} index
     * @return {string[]|null}
     */
    entry(index: number): string[] | null
    /**
     * Removes entries at a given `index`.
     * @param {number} index
     * @return {boolean}
     */
    remove(index: number): boolean
    /**
     * Returns an array of computed entries in this index.
     * @return {IndexIterator}
     */
    entries(): IndexIterator
    /**
     * @ignore
     * @return {IndexIterator}
     */
    [Symbol.iterator](): IndexIterator
    #private
  }
  /**
   * A base class for a storage provider.
   */
  export class Provider {
    /**
     * An error currently associated with the provider, likely from an
     * async operation.
     * @type {Error?}
     */
    get error(): Error | null
    /**
     * A promise that resolves when the provider is ready.
     * @type {Promise}
     */
    get ready(): Promise<any>
    /**
     * A reference the service worker storage ID, which is the service worker
     * registration ID.
     * @type {string}
     * @throws DOMException
     */
    get id(): string
    /**
     * A reference to the provider `Index`
     * @type {Index}
     * @throws DOMException
     */
    get index(): Index
    /**
     * The number of entries in the provider.
     * @type {number}
     * @throws DOMException
     */
    get length(): number
    /**
     * Returns `true` if the provider has a value for a given `key`.
     * @param {string} key}
     * @return {boolean}
     * @throws DOMException
     */
    has(key: string): boolean
    /**
     * Get a value by `key`.
     * @param {string} key
     * @return {string?}
     * @throws DOMException
     */
    get(key: string): string | null
    /**
     * Sets a `value` by `key`
     * @param {string} key
     * @param {string} value
     * @throws DOMException
     */
    set(key: string, value: string): void
    /**
     * Removes a value by `key`.
     * @param {string} key
     * @return {boolean}
     * @throws DOMException
     */
    remove(key: string): boolean
    /**
     * Clear all keys and values.
     * @throws DOMException
     */
    clear(): void
    /**
     * The keys in the provider index.
     * @return {string[]}
     * @throws DOMException
     */
    keys(): string[]
    /**
     * The values in the provider index.
     * @return {string[]}
     * @throws DOMException
     */
    values(): string[]
    /**
     * Returns the key at a given `index`
     * @param {number} index
     * @return {string|null}
     * @throws DOMException
     */
    key(index: number): string | null
    /**
     * Loads the internal index with keys and values.
     * @return {Promise}
     */
    load(): Promise<any>
    #private
  }
  /**
   * An in-memory storage provider. It just used the built-in provider `Index`
   * for storing key-value entries.
   */
  export class MemoryStorageProvider extends Provider {}
  /**
   * A session storage provider that persists for the runtime of the
   * application and through service worker restarts.
   */
  export class SessionStorageProvider extends Provider {
    /**
     * Remove a value by `key`.
     * @param {string} key
     * @return {string?}
     * @throws DOMException
     * @throws NotFoundError
     */
    remove(key: string): string | null
  }
  /**
   * A local storage provider that persists until the data is cleared.
   */
  export class LocalStorageProvider extends Provider {}
  /**
   * A generic interface for storage implementations
   */
  export class Storage {
    /**
     * A factory for creating a `Storage` instance that is backed
     * by a storage provider. Extending classes should define a `Provider`
     * class that is statically available on the extended `Storage` class.
     * @param {symbol} token
     * @return {Promise<Proxy<Storage>>}
     */
    static create(token: symbol): Promise<ProxyConstructor>
    /**
     * `Storage` class constructor.
     * @ignore
     * @param {symbol} token
     * @param {Provider} provider
     */
    constructor(token: symbol, provider: Provider)
    /**
     * A readonly reference to the storage provider.
     * @type {Provider}
     */
    get provider(): Provider
    /**
     * The number of entries in the storage.
     * @type {number}
     */
    get length(): number
    /**
     * Returns `true` if the storage has a value for a given `key`.
     * @param {string} key
     * @return {boolean}
     * @throws TypeError
     */
    hasItem(key: string, ...args: any[]): boolean
    /**
     * Clears the storage of all entries
     */
    clear(): void
    /**
     * Returns the key at a given `index`
     * @param {number} index
     * @return {string|null}
     */
    key(index: number, ...args: any[]): string | null
    /**
     * Get a storage value item for a given `key`.
     * @param {string} key
     * @return {string|null}
     */
    getItem(key: string, ...args: any[]): string | null
    /**
     * Removes a storage value entry for a given `key`.
     * @param {string}
     * @return {boolean}
     */
    removeItem(key: any, ...args: any[]): boolean
    /**
     * Sets a storage item `value` for a given `key`.
     * @param {string} key
     * @param {string} value
     */
    setItem(key: string, value: string, ...args: any[]): void
    /**
     * @ignore
     */
    get [Symbol.toStringTag](): string
    #private
  }
  /**
   * An in-memory `Storage` interface.
   */
  export class MemoryStorage extends Storage {
    static Provider: typeof MemoryStorageProvider
  }
  /**
   * A locally persisted `Storage` interface.
   */
  export class LocalStorage extends Storage {
    static Provider: typeof LocalStorageProvider
  }
  /**
   * A session `Storage` interface.
   */
  export class SessionStorage extends Storage {
    static Provider: typeof SessionStorageProvider
  }
  namespace _default {
    export { Storage }
    export { LocalStorage }
    export { MemoryStorage }
    export { SessionStorage }
    export { createStorageInterface }
  }
  export default _default
  export type IndexIteratorResult = {
    done: boolean
    value: string | undefined
  }
}
```

</details>

<details>
<summary><code>oro:service-worker/worker</code></summary>

```ts
declare module 'oro:service-worker/worker' {
  export function onReady(): void
  export function onMessage(event: any): Promise<any>
  const _default: any
  export default _default
  export namespace SERVICE_WORKER_READY_TOKEN {
    let __service_worker_ready: boolean
  }
  export namespace module {
    let exports: {}
  }
  export const events: Set<any>
  export namespace stages {
    let register: Deferred
    let install: Deferred
    let activate: Deferred
  }
  import { Deferred } from 'oro:async'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
