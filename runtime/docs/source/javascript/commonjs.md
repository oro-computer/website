# `oro:commonjs`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:commonjs'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:commonjs
oro:commonjs/builtins
oro:commonjs/cache
oro:commonjs/loader
oro:commonjs/module
oro:commonjs/package
oro:commonjs/require
```

### TypeScript declarations

<details>
<summary><code>oro:commonjs</code></summary>

```ts
declare module 'oro:commonjs' {
  export default exports
  import * as exports from 'oro:commonjs'
  import builtins from 'oro:commonjs/builtins'
  import Cache from 'oro:commonjs/cache'
  import createRequire from 'oro:commonjs/require'
  import Loader from 'oro:commonjs/loader'
  import Module from 'oro:commonjs/module'
  import Package from 'oro:commonjs/package'
  export { builtins, Cache, createRequire, Loader, Module, Package }
}
```

</details>

<details>
<summary><code>oro:commonjs/builtins</code></summary>

```ts
declare module 'oro:commonjs/builtins' {
  /**
   * Defines a builtin module by name making a shallow copy of the
   * module exports.
   * @param {string}
   * @param {object} exports
   */
  export function defineBuiltin(
    name: any,
    exports: object,
    copy?: boolean
  ): void
  /**
   * Predicate to determine if a given module name is a builtin module.
   * @param {string} name
   * @param {{ builtins?: object }}
   * @return {boolean}
   */
  export function isBuiltin(name: string, options?: any): boolean
  /**
   * Gets a builtin module by name.
   * @param {string} name
   * @param {{ builtins?: object }} [options]
   * @return {any}
   */
  export function getBuiltin(
    name: string,
    options?: {
      builtins?: object
    }
  ): any
  /**
   * A mapping of builtin modules
   * @type {object}
   */
  export const builtins: object
  /**
   * Known runtime specific builtin modules.
   * @type {Set<string>}
   */
  export const runtimeModules: Set<string>
  export default builtins
}
```

</details>

<details>
<summary><code>oro:commonjs/cache</code></summary>

```ts
declare module 'oro:commonjs/cache' {
  /**
   * @typedef {{
   *   types?: object,
   *   loader?: import('./loader.js').Loader
   * }} CacheOptions
   */
  export const CACHE_CHANNEL_MESSAGE_ID: 'id'
  export const CACHE_CHANNEL_MESSAGE_REPLICATE: 'replicate'
  /**
   * @typedef {{
   *   name: string
   * }} StorageOptions
   */
  /**
   * An storage context object with persistence and durability
   * for service worker storages.
   */
  export class Storage extends EventTarget {
    /**
     * Maximum entries that will be restored from storage into the context object.
     * @type {number}
     */
    static MAX_CONTEXT_ENTRIES: number
    /**
     * A mapping of known `Storage` instances.
     * @type {Map<string, Storage>}
     */
    static instances: Map<string, Storage>
    /**
     * Opens an storage for a particular name.
     * @param {StorageOptions} options
     * @return {Promise<Storage>}
     */
    static open(options: StorageOptions): Promise<Storage>
    /**
     * `Storage` class constructor
     * @ignore
     * @param {StorageOptions} options
     */
    constructor(options: StorageOptions)
    /**
     * A reference to the currently opened storage database.
     * @type {import('../internal/database.js').Database}
     */
    get database(): import('oro:internal/database').Database
    /**
     * `true` if the storage is opened, otherwise `false`.
     * @type {boolean}
     */
    get opened(): boolean
    /**
     * `true` if the storage is opening, otherwise `false`.
     * @type {boolean}
     */
    get opening(): boolean
    /**
     * A proxied object for reading and writing storage state.
     * Values written to this object must be cloneable with respect to the
     * structured clone algorithm.
     * @see {https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm}
     * @type {Proxy<object>}
     */
    get context(): ProxyConstructor
    /**
     * The current storage name. This value is also used as the
     * internal database name.
     * @type {string}
     */
    get name(): string
    /**
     * A promise that resolves when the storage is opened.
     * @type {Promise?}
     */
    get ready(): Promise<any> | null
    /**
     * @ignore
     * @param {Promise} promise
     */
    forwardRequest(promise: Promise<any>): Promise<any>
    /**
     * Resets the current storage to an empty state.
     */
    reset(): Promise<void>
    /**
     * Synchronizes database entries into the storage context.
     */
    sync(options?: any): Promise<void>
    /**
     * Opens the storage.
     * @ignore
     */
    open(options?: any): Promise<any>
    /**
     * Closes the storage database, purging existing state.
     * @ignore
     */
    close(): Promise<void>
    #private
  }
  /**
   * A container for `Snapshot` data storage.
   */
  export class SnapshotData {
    /**
     * `SnapshotData` class constructor.
     * @param {object=} [data]
     */
    constructor(data?: object | undefined)
    toJSON: () => this;
    [Symbol.toStringTag]: string
  }
  /**
   * A container for storing a snapshot of the cache data.
   */
  export class Snapshot {
    /**
     * @type {typeof SnapshotData}
     */
    static Data: typeof SnapshotData
    /**
     * A reference to the snapshot data.
     * @type {Snapshot.Data}
     */
    get data(): typeof SnapshotData
    /**
     * @ignore
     * @return {object}
     */
    toJSON(): object
    #private
  }
  /**
   * An interface for managing and performing operations on a collection
   * of `Cache` objects.
   */
  export class CacheCollection {
    /**
     * `CacheCollection` class constructor.
     * @ignore
     * @param {Cache[]|Record<string, Cache>=} [collection]
     */
    constructor(collection?: (Cache[] | Record<string, Cache>) | undefined)
    /**
     * Adds a `Cache` instance to the collection.
     * @param {string|Cache} name
     * @param {Cache=} [cache]
     * @param {boolean}
     */
    add(name: string | Cache, cache?: Cache | undefined): any
    /**
     * Calls a method on each `Cache` object in the collection.
     * @param {string} method
     * @param {...any} args
     * @return {Promise<Record<string,any>>}
     */
    call(method: string, ...args: any[]): Promise<Record<string, any>>
    restore(): Promise<Record<string, any>>
    reset(): Promise<Record<string, any>>
    snapshot(): Promise<Record<string, any>>
    get(key: any): Promise<Record<string, any>>
    delete(key: any): Promise<Record<string, any>>
    keys(key: any): Promise<Record<string, any>>
    values(key: any): Promise<Record<string, any>>
    clear(key: any): Promise<Record<string, any>>
  }
  /**
   * A container for a shared cache that lives for the life time of
   * application execution. Updates to this storage are replicated to other
   * instances in the application context, including windows and workers.
   */
  export class Cache {
    [x: number]: () => gc.Finalizer
    /**
     * A globally shared type mapping for the cache to use when
     * derserializing a value.
     * @type {Map<string, function>}
     */
    static types: Map<string, Function>
    /**
     * A globally shared cache store keyed by cache name. This is useful so
     * when multiple instances of a `Cache` are created, they can share the
     * same data store, reducing duplications.
     * @type {Record<string, Map<string, object>}
     */
    static shared: Record<string, Map<string, object>>
    /**
     * A mapping of opened `Storage` instances.
     * @type {Map<string, Storage>}
     */
    static storages: Map<string, Storage>
    /**
     * The `Cache.Snapshot` class.
     * @type {typeof Snapshot}
     */
    static Snapshot: typeof Snapshot
    /**
     * The `Cache.Storage` class
     * @type {typeof Storage}
     */
    static Storage: typeof Storage
    /**
     * Creates a snapshot of the current cache which can be serialized and
     * stored in persistent storage.
     * @return {Snapshot}
     */
    static snapshot(): Snapshot
    /**
     * Restore caches from persistent storage.
     * @param {string[]} names
     * @return {Promise}
     */
    static restore(names: string[]): Promise<any>
    /**
     * `Cache` class constructor.
     * @param {string} name
     * @param {CacheOptions=} [options]
     */
    constructor(name: string, options?: CacheOptions | undefined)
    /**
     * The unique ID for this cache.
     * @type {string}
     */
    get id(): string
    /**
     * The loader associated with this cache.
     * @type {import('./loader.js').Loader}
     */
    get loader(): import('oro:commonjs/loader').Loader
    /**
     * A reference to the persisted storage.
     * @type {Storage}
     */
    get storage(): Storage
    /**
     * The cache name
     * @type {string}
     */
    get name(): string
    /**
     * The underlying cache data map.
     * @type {Map}
     */
    get data(): Map<any, any>
    /**
     * The broadcast channel associated with this cach.
     * @type {BroadcastChannel}
     */
    get channel(): BroadcastChannel
    /**
     * The size of the cache.
     * @type {number}
     */
    get size(): number
    /**
     * @type {Map}
     */
    get types(): Map<any, any>
    /**
     * Resets the cache map and persisted storage.
     */
    reset(): Promise<void>
    /**
     * Restores cache data from storage.
     */
    restore(): Promise<void>
    /**
     * Creates a snapshot of the current cache which can be serialized and
     * stored in persistent storage.
     * @return {Snapshot.Data}
     */
    snapshot(): typeof SnapshotData
    /**
     * Get a value at `key`.
     * @param {string} key
     * @return {object|undefined}
     */
    get(key: string): object | undefined
    /**
     * Set `value` at `key`.
     * @param {string} key
     * @param {object} value
     * @return {Cache}
     */
    set(key: string, value: object): Cache
    /**
     * Returns `true` if `key` is in cache, otherwise `false`.
     * @param {string}
     * @return {boolean}
     */
    has(key: any): boolean
    /**
     * Delete a value at `key`.
     * This does not replicate to shared caches.
     * @param {string} key
     * @return {boolean}
     */
    delete(key: string): boolean
    /**
     * Returns an iterator for all cache keys.
     * @return {object}
     */
    keys(): object
    /**
     * Returns an iterator for all cache values.
     * @return {object}
     */
    values(): object
    /**
     * Returns an iterator for all cache entries.
     * @return {object}
     */
    entries(): object
    /**
     * Clears all entries in the cache.
     * This does not replicate to shared caches.
     * @return {undefined}
     */
    clear(): undefined
    /**
     * Enumerates entries in map calling `callback(value, key
     * @param {function(object, string, Cache): any} callback
     */
    forEach(callback: (arg0: object, arg1: string, arg2: Cache) => any): void
    /**
     * Broadcasts a replication to other shared caches.
     */
    replicate(): this
    /**
     * Destroys the cache. This function stops the broadcast channel and removes
     * and listeners
     */
    destroy(): void
    /**
     * @ignore
     */
    [Symbol.iterator](): any
    #private
  }
  export default Cache
  export type CacheOptions = {
    types?: object
    loader?: import('oro:commonjs/loader').Loader
  }
  export type StorageOptions = {
    name: string
  }
  import database from 'oro:internal/database'
}
```

</details>

<details>
<summary><code>oro:commonjs/loader</code></summary>

```ts
declare module 'oro:commonjs/loader' {
  /**
   * @typedef {{
   *   extensions?: string[] | Set<string>
   *   origin?: URL | string,
   *   statuses?: Cache
   *   cache?: { response?: Cache, status?: Cache },
   *   headers?: Headers | Map | object | string[][]
   * }} LoaderOptions
   */
  /**
   * @typedef {{
   *   loader?: Loader,
   *   origin?: URL | string
   * }} RequestOptions
   */
  /**
   * @typedef {{
   *   headers?: Headers | object | array[],
   *   status?: number
   * }} RequestStatusOptions
   */
  /**
   * @typedef {{
   *   headers?: Headers | object
   * }} RequestLoadOptions
   */
  /**
   * @typedef {{
   *   request?: Request,
   *   headers?: Headers,
   *   status?: number,
   *   buffer?: ArrayBuffer,
   *   text?: string
   * }} ResponseOptions
   */
  /**
   * A container for the status of a CommonJS resource. A `RequestStatus` object
   * represents meta data for a `Request` that comes from a preflight
   * HTTP HEAD request.
   */
  export class RequestStatus {
    [x: number]: () => {
      __type__: 'RequestStatus'
      id: string
      origin: string | null
      status: number
      headers: Array<string[]>
      request: object | null
    }
    /**
     * Creates a `RequestStatus` from JSON input.
     * @param {object} json
     * @return {RequestStatus}
     */
    static from(json: object, options: any): RequestStatus
    /**
     * `RequestStatus` class constructor.
     * @param {Request} request
     * @param {RequestStatusOptions} [options]
     */
    constructor(request: Request, options?: RequestStatusOptions)
    set request(request: Request)
    /**
     * The `Request` object associated with this `RequestStatus` object.
     * @type {Request}
     */
    get request(): Request
    /**
     * The unique ID of this `RequestStatus`, which is the absolute URL as a string.
     * @type {string}
     */
    get id(): string
    /**
     * The origin for this `RequestStatus` object.
     * @type {string}
     */
    get origin(): string
    /**
     * A HTTP status code for this `RequestStatus` object.
     * @type {number|undefined}
     */
    get status(): number | undefined
    /**
     * An alias for `status`.
     * @type {number|undefined}
     */
    get value(): number | undefined
    /**
     * @ignore
     */
    get valueOf(): number
    /**
     * The HTTP headers for this `RequestStatus` object.
     * @type {Headers}
     */
    get headers(): Headers
    /**
     * The resource location for this `RequestStatus` object. This value is
     * determined from the 'Content-Location' header, if available, otherwise
     * it is derived from the request URL pathname (including the query string).
     * @type {string}
     */
    get location(): string
    /**
     * `true` if the response status is considered OK, otherwise `false`.
     * @type {boolean}
     */
    get ok(): boolean
    /**
     * Loads the internal state for this `RequestStatus` object.
     * @param {RequestLoadOptions|boolean} [options]
     * @return {RequestStatus}
     */
    load(options?: RequestLoadOptions | boolean): RequestStatus
    /**
     * Converts this `RequestStatus` to JSON.
     * @ignore
     * @return {{
     *   id: string,
     *   origin: string | null,
     *   status: number,
     *   headers: Array<string[]>
     *   request: object | null | undefined
     * }}
     */
    toJSON(includeRequest?: boolean): {
      id: string
      origin: string | null
      status: number
      headers: Array<string[]>
      request: object | null | undefined
    }
    #private
  }
  /**
   * A container for a synchronous CommonJS request to local resource or
   * over the network.
   */
  export class Request {
    [x: number]: () => {
      __type__: 'Request'
      url: string
      status: object | undefined
    }
    /**
     * Creates a `Request` instance from JSON input
     * @param {object} json
     * @param {RequestOptions=} [options]
     * @return {Request}
     */
    static from(json: object, options?: RequestOptions | undefined): Request
    /**
     * `Request` class constructor.
     * @param {URL|string} url
     * @param {URL|string=} [origin]
     * @param {RequestOptions=} [options]
     */
    constructor(
      url: URL | string,
      origin?: (URL | string) | undefined,
      options?: RequestOptions | undefined
    )
    /**
     * The unique ID of this `Request`, which is the absolute URL as a string.
     * @type {string}
     */
    get id(): string
    /**
     * The absolute `URL` of this `Request` object.
     * @type {URL}
     */
    get url(): URL
    /**
     * The origin for this `Request`.
     * @type {string}
     */
    get origin(): string
    /**
     * The `Loader` for this `Request` object.
     * @type {Loader?}
     */
    get loader(): Loader | null
    /**
     * The `RequestStatus` for this `Request`
     * @type {RequestStatus}
     */
    get status(): RequestStatus
    /**
     * Loads the CommonJS source file, optionally checking the `Loader` cache
     * first, unless ignored when `options.cache` is `false`.
     * @param {RequestLoadOptions=} [options]
     * @return {Response}
     */
    load(options?: RequestLoadOptions | undefined): Response
    /**
     * Converts this `Request` to JSON.
     * @ignore
     * @return {{
     *   url: string,
     *   status: object | undefined
     * }}
     */
    toJSON(includeStatus?: boolean): {
      url: string
      status: object | undefined
    }
    #private
  }
  /**
   * A container for a synchronous CommonJS request response for a local resource
   * or over the network.
   */
  export class Response {
    [x: number]: () => {
      __type__: 'Response'
      id: string
      text: string
      status: number
      buffer: number[] | null
      headers: Array<string[]>
    }
    /**
     * Creates a `Response` from JSON input
     * @param {obejct} json
     * @param {ResponseOptions=} [options]
     * @return {Response}
     */
    static from(json: obejct, options?: ResponseOptions | undefined): Response
    /**
     * `Response` class constructor.
     * @param {Request|ResponseOptions} request
     * @param {ResponseOptions=} [options]
     */
    constructor(
      request: Request | ResponseOptions,
      options?: ResponseOptions | undefined
    )
    /**
     * The unique ID of this `Response`, which is the absolute
     * URL of the request as a string.
     * @type {string}
     */
    get id(): string
    /**
     * The `Request` object associated with this `Response` object.
     * @type {Request}
     */
    get request(): Request
    /**
     * The response headers from the associated request.
     * @type {Headers}
     */
    get headers(): Headers
    /**
     * The `Loader` associated with this `Response` object.
     * @type {Loader?}
     */
    get loader(): Loader | null
    /**
     * The `Response` status code from the associated `Request` object.
     * @type {number}
     */
    get status(): number
    /**
     * The `Response` string from the associated `Request`
     * @type {string}
     */
    get text(): string
    /**
     * The `Response` array buffer from the associated `Request`
     * @type {ArrayBuffer?}
     */
    get buffer(): ArrayBuffer | null
    /**
     * `true` if the response is considered OK, otherwise `false`.
     * @type {boolean}
     */
    get ok(): boolean
    /**
     * Converts this `Response` to JSON.
     * @ignore
     * @return {{
     *   id: string,
     *   text: string,
     *   status: number,
     *   buffer: number[] | null,
     *   headers: Array<string[]>
     * }}
     */
    toJSON(): {
      id: string
      text: string
      status: number
      buffer: number[] | null
      headers: Array<string[]>
    }
    #private
  }
  /**
   * A container for loading CommonJS module sources
   */
  export class Loader {
    /**
     * A request class used by `Loader` objects.
     * @type {typeof Request}
     */
    static Request: typeof Request
    /**
     * A response class used by `Loader` objects.
     * @type {typeof Request}
     */
    static Response: typeof Request
    /**
     * Resolves a given module URL to an absolute URL with an optional `origin`.
     * @param {URL|string} url
     * @param {URL|string} [origin]
     * @return {string}
     */
    static resolve(url: URL | string, origin?: URL | string): string
    /**
     * Default extensions for a loader.
     * @type {Set<string>}
     */
    static defaultExtensions: Set<string>
    /**
     * `Loader` class constructor.
     * @param {string|URL|LoaderOptions} origin
     * @param {LoaderOptions=} [options]
     */
    constructor(
      origin: string | URL | LoaderOptions,
      options?: LoaderOptions | undefined
    )
    /**
     * The internal caches for this `Loader` object.
     * @type {{ response: Cache, status: Cache }}
     */
    get cache(): {
      response: Cache
      status: Cache
    }
    /**
     * Headers used in too loader requests.
     * @type {Headers}
     */
    get headers(): Headers
    /**
     * A set of supported `Loader` extensions.
     * @type {Set<string>}
     */
    get extensions(): Set<string>
    set origin(origin: string)
    /**
     * The origin of this `Loader` object.
     * @type {string}
     */
    get origin(): string
    /**
     * Loads a CommonJS module source file at `url` with an optional `origin`, which
     * defaults to the application origin.
     * @param {URL|string} url
     * @param {URL|string|object} [origin]
     * @param {RequestOptions=} [options]
     * @return {Response}
     */
    load(
      url: URL | string,
      origin?: URL | string | object,
      options?: RequestOptions | undefined
    ): Response
    /**
     * Queries the status of a CommonJS module source file at `url` with an
     * optional `origin`, which defaults to the application origin.
     * @param {URL|string} url
     * @param {URL|string|object} [origin]
     * @param {RequestOptions=} [options]
     * @return {RequestStatus}
     */
    status(
      url: URL | string,
      origin?: URL | string | object,
      options?: RequestOptions | undefined
    ): RequestStatus
    /**
     * Resolves a given module URL to an absolute URL based on the loader origin.
     * @param {URL|string} url
     * @param {URL|string} [origin]
     * @return {string}
     */
    resolve(url: URL | string, origin?: URL | string): string
    #private
  }
  export default Loader
  export type LoaderOptions = {
    extensions?: string[] | Set<string>
    origin?: URL | string
    statuses?: Cache
    cache?: {
      response?: Cache
      status?: Cache
    }
    headers?: Headers | Map<any, any> | object | string[][]
  }
  export type RequestOptions = {
    loader?: Loader
    origin?: URL | string
  }
  export type RequestStatusOptions = {
    headers?: Headers | object | any[][]
    status?: number
  }
  export type RequestLoadOptions = {
    headers?: Headers | object
  }
  export type ResponseOptions = {
    request?: Request
    headers?: Headers
    status?: number
    buffer?: ArrayBuffer
    text?: string
  }
  import { Headers } from 'oro:ipc'
  import URL from 'oro:url'
  import { Cache } from 'oro:commonjs/cache'
}
```

</details>

<details>
<summary><code>oro:commonjs/module</code></summary>

```ts
declare module 'oro:commonjs/module' {
  /**
   * CommonJS module scope with module scoped globals.
   * @ignore
   * @param {object} exports
   * @param {function(string): any} require
   * @param {Module} module
   * @param {string} __filename
   * @param {string} __dirname
   * @param {typeof process} _process
   * @param {object} _global
   */
  export function CommonJSModuleScope(
    exports: object,
    require: (arg0: string) => any,
    module: Module,
    __filename: string,
    __dirname: string,
    _process: typeof process,
    _global: object
  ): void
  /**
   * Creates a `require` function from a given module URL.
   * @param {string|URL} url
   * @param {ModuleOptions=} [options]
   * @return {RequireFunction}
   */
  export function createRequire(
    url: string | URL,
    options?: ModuleOptions | undefined
  ): RequireFunction
  /**
   * @typedef {function(string, Module, function(string): any): any} ModuleResolver
   */
  /**
   * @typedef {import('./require.js').RequireFunction} RequireFunction
   */
  /**
   * @typedef {import('./package.js').PackageOptions} PackageOptions
   */
  /**
   * @typedef {{
   *   prefix?: string,
   *   request?: import('./loader.js').RequestOptions,
   *   builtins?: object
   * } CreateRequireOptions
   */
  /**
   * @typedef {{
   *   resolvers?: ModuleResolver[],
   *   importmap?: ImportMap,
   *   loader?: Loader | object,
   *   loaders?: object,
   *   package?: Package | PackageOptions
   *   parent?: Module,
   *   state?: State
   * }} ModuleOptions
   */
  /**
   * @typedef {{
   *   extensions?: object
   * }} ModuleLoadOptions
   */
  export const builtinModules: object
  /**
   * CommonJS module scope source wrapper.
   * @type {string}
   */
  export const COMMONJS_WRAPPER: string
  /**
   * A container for imports.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap}
   */
  export class ImportMap {
    set imports(imports: object)
    /**
     * The imports object for the importmap.
     * @type {object}
     */
    get imports(): object
    /**
     * Extends the current imports object.
     * @param {object} imports
     * @return {ImportMap}
     */
    extend(importmap: any): ImportMap
    #private
  }
  /**
   * A container for `Module` instance state.
   */
  export class State {
    /**
     * `State` class constructor.
     * @ignore
     * @param {object|State=} [state]
     */
    constructor(state?: (object | State) | undefined)
    loading: boolean
    loaded: boolean
    error: any
  }
  /**
   * The module scope for a loaded module.
   * This is a special object that is seal, frozen, and only exposes an
   * accessor the 'exports' field.
   * @ignore
   */
  export class ModuleScope {
    /**
     * `ModuleScope` class constructor.
     * @param {Module} module
     */
    constructor(module: Module)
    get id(): any
    get filename(): any
    get loaded(): any
    get children(): any
    set exports(exports: any)
    get exports(): any
    toJSON(): {
      id: any
      filename: any
      children: any
      exports: any
    }
    #private
  }
  /**
   * An abstract base class for loading a module.
   */
  export class ModuleLoader {
    /**
     * Creates a `ModuleLoader` instance from the `module` currently being loaded.
     * @param {Module} module
     * @param {ModuleLoadOptions=} [options]
     * @return {ModuleLoader}
     */
    static from(
      module: Module,
      options?: ModuleLoadOptions | undefined
    ): ModuleLoader
    /**
     * Creates a new `ModuleLoader` instance from the `module` currently
     * being loaded with the `source` string to parse and load with optional
     * `ModuleLoadOptions` options.
     * @param {Module} module
     * @param {ModuleLoadOptions=} [options]
     * @return {boolean}
     */
    static load(
      module: Module,
      options?: ModuleLoadOptions | undefined
    ): boolean
    /**
     * @param {Module} module
     * @param {ModuleLoadOptions=} [options]
     * @return {boolean}
     */
    load(module: Module, options?: ModuleLoadOptions | undefined): boolean
  }
  /**
   * A JavaScript module loader
   */
  export class JavaScriptModuleLoader extends ModuleLoader {}
  /**
   * A JSON module loader.
   */
  export class JSONModuleLoader extends ModuleLoader {}
  /**
     * A WASM module loader

     */
  export class WASMModuleLoader extends ModuleLoader {}
  /**
   * A container for a loaded CommonJS module. All errors bubble
   * to the "main" module and global object (if possible).
   */
  export class Module extends EventTarget {
    /**
     * A reference to the currently scoped module.
     * @type {Module?}
     */
    static current: Module | null
    /**
     * A reference to the previously scoped module.
     * @type {Module?}
     */
    static previous: Module | null
    /**
     * A cache of loaded modules
     * @type {Map<string, Module>}
     */
    static cache: Map<string, Module>
    /**
     * An array of globally available module loader resolvers.
     * @type {ModuleResolver[]}
     */
    static resolvers: ModuleResolver[]
    /**
     * Globally available 'importmap' for all loaded modules.
     * @type {ImportMap}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap}
     */
    static importmap: ImportMap
    /**
     * A limited set of builtins exposed to CommonJS modules.
     * @type {object}
     */
    static builtins: object
    /**
     * A limited set of builtins exposed to CommonJS modules.
     * @type {object}
     */
    static builtinModules: object
    /**
     * CommonJS module scope source wrapper components.
     * @type {string[]}
     */
    static wrapper: string[]
    /**
     * An array of global require paths, relative to the origin.
     * @type {string[]}
     */
    static globalPaths: string[]
    /**
     * Globabl module loaders
     * @type {object}
     */
    static loaders: object
    /**
     * The main entry module, lazily created.
     * @type {Module}
     */
    static get main(): Module
    /**
     * Wraps source in a CommonJS module scope.
     * @param {string} source
     */
    static wrap(source: string): string
    /**
     * Compiles given JavaScript module source.
     * @param {string} source
     * @param {{ url?: URL | string }=} [options]
     * @return {function(
     *   object,
     *   function(string): any,
     *   Module,
     *   string,
     *   string,
     *   typeof process,
     *   object
     * ): any}
     */
    static compile(
      source: string,
      options?:
        | {
            url?: URL | string
          }
        | undefined
    ): (
      arg0: object,
      arg1: (arg0: string) => any,
      arg2: Module,
      arg3: string,
      arg4: string,
      arg5: typeof process,
      arg6: object
    ) => any
    /**
     * Creates a `Module` from source URL and optionally a parent module.
     * @param {string|URL|Module} url
     * @param {ModuleOptions=} [options]
     */
    static from(
      url: string | URL | Module,
      options?: ModuleOptions | undefined
    ): any
    /**
     * Creates a `require` function from a given module URL.
     * @param {string|URL} url
     * @param {ModuleOptions=} [options]
     */
    static createRequire(
      url: string | URL,
      options?: ModuleOptions | undefined
    ): any
    /**
     * `Module` class constructor.
     * @param {string|URL} url
     * @param {ModuleOptions=} [options]
     */
    constructor(url: string | URL, options?: ModuleOptions | undefined)
    /**
     * A unique ID for this module.
     * @type {string}
     */
    get id(): string
    /**
     * A reference to the "main" module.
     * @type {Module}
     */
    get main(): Module
    /**
     * Child modules of this module.
     * @type {Module[]}
     */
    get children(): Module[]
    /**
     * A reference to the module cache. Possibly shared with all
     * children modules.
     * @type {object}
     */
    get cache(): object
    /**
     * A reference to the module package.
     * @type {Package}
     */
    get package(): Package
    /**
     * The `ImportMap` for this module.
     * @type {ImportMap}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap}
     */
    get importmap(): ImportMap
    /**
     * The module level resolvers.
     * @type {ModuleResolver[]}
     */
    get resolvers(): ModuleResolver[]
    /**
     * `true` if the module is currently loading, otherwise `false`.
     * @type {boolean}
     */
    get loading(): boolean
    /**
     * `true` if the module is currently loaded, otherwise `false`.
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * An error associated with the module if it failed to load.
     * @type {Error?}
     */
    get error(): Error | null
    /**
     * The exports of the module
     * @type {object}
     */
    get exports(): object
    /**
     * The scope of the module given to parsed modules.
     * @type {ModuleScope}
     */
    get scope(): ModuleScope
    /**
     * The origin of the loaded module.
     * @type {string}
     */
    get origin(): string
    /**
     * The parent module for this module.
     * @type {Module?}
     */
    get parent(): Module | null
    /**
     * The `Loader` for this module.
     * @type {Loader}
     */
    get loader(): Loader
    /**
     * The filename of the module.
     * @type {string}
     */
    get filename(): string
    /**
     * Known source loaders for this module keyed by file extension.
     * @type {object}
     */
    get loaders(): object
    /**
     * Factory for creating a `require()` function based on a module context.
     * @param {CreateRequireOptions=} [options]
     * @return {RequireFunction}
     */
    createRequire(options?: CreateRequireOptions | undefined): RequireFunction
    /**
     * Creates a `Module` from source the URL with this module as
     * the parent.
     * @param {string|URL|Module} url
     * @param {ModuleOptions=} [options]
     */
    createModule(
      url: string | URL | Module,
      options?: ModuleOptions | undefined
    ): any
    /**
     * Requires a module at for a given `input` which can be a relative file,
     * named module, or an absolute URL within the context of this odule.
     * @param {string|URL} input
     * @param {RequireOptions=} [options]
     * @throws ModuleNotFoundError
     * @throws ReferenceError
     * @throws SyntaxError
     * @throws TypeError
     * @return {any}
     */
    require(url: any, options?: RequireOptions | undefined): any
    /**
     * Loads the module
     * @param {ModuleLoadOptions=} [options]
     * @return {boolean}
     */
    load(options?: ModuleLoadOptions | undefined): boolean
    resolve(input: any): string
    /**
     * @ignore
     */
    [Symbol.toStringTag](): string
    #private
  }
  export namespace Module {
    export { Module }
  }
  export default Module
  export type ModuleResolver = (
    arg0: string,
    arg1: Module,
    arg2: (arg0: string) => any
  ) => any
  export type RequireFunction = import('oro:commonjs/require').RequireFunction
  export type PackageOptions = import('oro:commonjs/package').PackageOptions
  export type CreateRequireOptions = {
    prefix?: string
    request?: import('oro:commonjs/loader').RequestOptions
    builtins?: object
  }
  export type ModuleOptions = {
    resolvers?: ModuleResolver[]
    importmap?: ImportMap
    loader?: Loader | object
    loaders?: object
    package?: Package | PackageOptions
    parent?: Module
    state?: State
  }
  export type ModuleLoadOptions = {
    extensions?: object
  }
  import process from 'oro:process'
  import { Package } from 'oro:commonjs/package'
  import { Loader } from 'oro:commonjs/loader'
}
```

</details>

<details>
<summary><code>oro:commonjs/package</code></summary>

```ts
declare module 'oro:commonjs/package' {
  /**
   * @ignore
   * @param {string} source
   * @return {boolean}
   */
  export function detectESMSource(source: string): boolean
  /**
   * @typedef {{
   *   manifest?: string,
   *   index?: string,
   *   description?: string,
   *   version?: string,
   *   license?: string,
   *   exports?: object,
   *   type?: 'commonjs' | 'module',
   *   info?: object,
   *   origin?: string,
   *   dependencies?: Dependencies | object | Map
   * }} PackageOptions
   */
  /**
   * @typedef {import('./loader.js').RequestOptions & {
   *   type?: 'commonjs' | 'module'
   *   prefix?: string
   * }} PackageLoadOptions
   */
  /**
   * {import('./loader.js').RequestOptions & {
   *   load?: boolean,
   *   type?: 'commonjs' | 'module',
   *   browser?: boolean,
   *   children?: string[]
   *   extensions?: string[] | Set<string>
   * }} PackageResolveOptions
   */
  /**
   * @typedef {{
   *   organization: string | null,
   *   name: string,
   *   version: string | null,
   *   pathname: string,
   *   url: URL,
   *   isRelative: boolean,
   *   hasManifest: boolean
   * }} ParsedPackageName
   */
  /**
     * @typedef {{
     *   require?: string | string[],
     *   import?: string | string[],
     *   default?: string | string[],
     *   default?: string | string[],
     *   worker?: string | string[],
     *   browser?: string | string[]
     * }} PackageExports

    /**
     * The default package index file such as 'index.js'
     * @type {string}
     */
  export const DEFAULT_PACKAGE_INDEX: string
  /**
   * The default package manifest file name such as 'package.json'
   * @type {string}
   */
  export const DEFAULT_PACKAGE_MANIFEST_FILE_NAME: string
  /**
   * The default package path prefix such as 'node_modules/'
   * @type {string}
   */
  export const DEFAULT_PACKAGE_PREFIX: string
  /**
   * The default package version, when one is not provided
   * @type {string}
   */
  export const DEFAULT_PACKAGE_VERSION: string
  /**
   * The default license for a package'
   * @type {string}
   */
  export const DEFAULT_LICENSE: string
  /**
   * A container for a package name that includes a package organization identifier,
   * its fully qualified name, or for relative package names, its pathname
   */
  export class Name {
    /**
     * Parses a package name input resolving the actual module name, including an
     * organization name given. If a path includes a manifest file
     * ('package.json'), then the directory containing that file is considered a
     * valid package and it will be included in the returned value. If a relative
     * path is given, then the path is returned if it is a valid pathname. This
     * function returns `null` for bad input.
     * @param {string|URL} input
     * @param {{ origin?: string | URL, manifest?: string }=} [options]
     * @return {ParsedPackageName?}
     */
    static parse(
      input: string | URL,
      options?:
        | {
            origin?: string | URL
            manifest?: string
          }
        | undefined
    ): ParsedPackageName | null
    /**
     * Returns `true` if the given `input` can be parsed by `Name.parse` or given
     * as input to the `Name` class constructor.
     * @param {string|URL} input
     * @param {{ origin?: string | URL, manifest?: string }=} [options]
     * @return {boolean}
     */
    static canParse(
      input: string | URL,
      options?:
        | {
            origin?: string | URL
            manifest?: string
          }
        | undefined
    ): boolean
    /**
     * Creates a new `Name` from input.
     * @param {string|URL} input
     * @param {{ origin?: string | URL, manifest?: string }=} [options]
     * @return {Name}
     */
    static from(
      input: string | URL,
      options?:
        | {
            origin?: string | URL
            manifest?: string
          }
        | undefined
    ): Name
    /**
     * `Name` class constructor.
     * @param {string|URL|NameOptions|Name} name
     * @param {{ origin?: string | URL, manifest?: string }=} [options]
     * @throws TypeError
     */
    constructor(
      name: string | URL | NameOptions | Name,
      options?:
        | {
            origin?: string | URL
            manifest?: string
          }
        | undefined
    )
    /**
     * The id of this package name.
     * @type {string}
     */
    get id(): string
    /**
     * The actual package name.
     * @type {string}
     */
    get name(): string
    /**
     * An alias for 'name'.
     * @type {string}
     */
    get value(): string
    /**
     * The origin of the package, if available.
     * This value may be `null`.
     * @type {string?}
     */
    get origin(): string | null
    /**
     * The package version if available.
     * This value may be `null`.
     * @type {string?}
     */
    get version(): string | null
    /**
     * The actual package pathname, if given in name string.
     * This value is always a string defaulting to '.' if no path
     * was given in name string.
     * @type {string}
     */
    get pathname(): string
    /**
     * The organization name.
     * This value may be `null`.
     * @type {string?}
     */
    get organization(): string | null
    /**
     * `true` if the package name was relative, otherwise `false`.
     * @type {boolean}
     */
    get isRelative(): boolean
    /**
     * Converts this package name to a string.
     * @ignore
     * @return {string}
     */
    toString(): string
    /**
     * Converts this `Name` instance to JSON.
     * @ignore
     * @return {object}
     */
    toJSON(): object
    #private
  }
  /**
   * A container for package dependencies that map a package name to a `Package` instance.
   */
  export class Dependencies {
    constructor(parent: any, options?: any)
    get map(): Map<any, any>
    get origin(): any
    add(name: any, info?: any): void
    get(name: any, options?: any): any
    entries(): MapIterator<[any, any]>
    keys(): MapIterator<any>
    values(): MapIterator<any>
    load(options?: any): void
    [Symbol.iterator](): MapIterator<[any, any]>
    #private
  }
  /**
   * A container for CommonJS module metadata, often in a `package.json` file.
   */
  export class Package {
    /**
     * A high level class for a package name.
     * @type {typeof Name}
     */
    static Name: typeof Name
    /**
     * A high level container for package dependencies.
     * @type {typeof Dependencies}
     */
    static Dependencies: typeof Dependencies
    /**
     * Creates and loads a package
     * @param {string|URL|NameOptions|Name} name
     * @param {PackageOptions & PackageLoadOptions=} [options]
     * @return {Package}
     */
    static load(
      name: string | URL | NameOptions | Name,
      options?: (PackageOptions & PackageLoadOptions) | undefined
    ): Package
    /**
     * `Package` class constructor.
     * @param {string|URL|NameOptions|Name} name
     * @param {PackageOptions=} [options]
     */
    constructor(
      name: string | URL | NameOptions | Name,
      options?: PackageOptions | undefined
    )
    /**
     * The unique ID of this `Package`, which is the absolute
     * URL of the directory that contains its manifest file.
     * @type {string}
     */
    get id(): string
    /**
     * The absolute URL to the package manifest file
     * @type {string}
     */
    get url(): string
    /**
     * A reference to the package subpath imports and browser mappings.
     * These values are typically used with its corresponding `Module`
     * instance require resolvers.
     * @type {object}
     */
    get imports(): object
    /**
     * A loader for this package, if available. This value may be `null`.
     * @type {Loader}
     */
    get loader(): Loader
    /**
     * `true` if the package was actually "loaded", otherwise `false`.
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * The name of the package.
     * @type {string}
     */
    get name(): string
    /**
     * The description of the package.
     * @type {string}
     */
    get description(): string
    /**
     * The organization of the package. This value may be `null`.
     * @type {string?}
     */
    get organization(): string | null
    /**
     * The license of the package.
     * @type {string}
     */
    get license(): string
    /**
     * The version of the package.
     * @type {string}
     */
    get version(): string
    /**
     * The origin for this package.
     * @type {string}
     */
    get origin(): string
    /**
     * The exports mappings for the package
     * @type {object}
     */
    get exports(): object
    /**
     * The package type.
     * @type {'commonjs'|'module'}
     */
    get type(): 'commonjs' | 'module'
    /**
     * The raw package metadata object.
     * @type {object?}
     */
    get info(): object | null
    /**
     * @type {Dependencies}
     */
    get dependencies(): Dependencies
    /**
     * An alias for `entry`
     * @type {string?}
     */
    get main(): string | null
    /**
     * The entry to the package
     * @type {string?}
     */
    get entry(): string | null
    /**
     * Load the package information at an optional `origin` with
     * optional request `options`.
     * @param {PackageLoadOptions=} [options]
     * @throws SyntaxError
     * @return {boolean}
     */
    load(origin?: any, options?: PackageLoadOptions | undefined): boolean
    /**
     * Resolve a file's `pathname` within the package.
     * @param {string|URL} pathname
     * @param {PackageResolveOptions=} [options]
     * @return {string}
     */
    resolve(
      pathname: string | URL,
      options?: PackageResolveOptions | undefined
    ): string
    #private
  }
  export default Package
  export type PackageOptions = {
    manifest?: string
    index?: string
    description?: string
    version?: string
    license?: string
    exports?: object
    type?: 'commonjs' | 'module'
    info?: object
    origin?: string
    dependencies?: Dependencies | object | Map<any, any>
  }
  export type PackageLoadOptions =
    import('oro:commonjs/loader').RequestOptions & {
      type?: 'commonjs' | 'module'
      prefix?: string
    }
  export type ParsedPackageName = {
    organization: string | null
    name: string
    version: string | null
    pathname: string
    url: URL
    isRelative: boolean
    hasManifest: boolean
  }
  /**
   * /**
   * The default package index file such as 'index.js'
   */
  export type PackageExports = {
    require?: string | string[]
    import?: string | string[]
    default?: string | string[]
    default?: string | string[]
    worker?: string | string[]
    browser?: string | string[]
  }
  import URL from 'oro:url'
  import { Loader } from 'oro:commonjs/loader'
}
```

</details>

<details>
<summary><code>oro:commonjs/require</code></summary>

```ts
declare module 'oro:commonjs/require' {
  /**
   * Factory for creating a `require()` function based on a module context.
   * @param {CreateRequireOptions} options
   * @return {RequireFunction}
   */
  export function createRequire(options: CreateRequireOptions): RequireFunction
  /**
   * @typedef {function(string, import('./module.js').Module, function(string): any): any} RequireResolver
   */
  /**
   * @typedef {{
   *   module: import('./module.js').Module,
   *   prefix?: string,
   *   request?: import('./loader.js').RequestOptions,
   *   builtins?: object,
   *   resolvers?: RequireFunction[]
   * }} CreateRequireOptions
   */
  /**
   * @typedef {function(string): any} RequireFunction
   */
  /**
   * @typedef {import('./package.js').PackageOptions} PackageOptions
   */
  /**
   * @typedef {import('./package.js').PackageResolveOptions} PackageResolveOptions
   */
  /**
   * @typedef {
   *   PackageResolveOptions &
   *   PackageOptions &
   *   { origins?: string[] | URL[] }
   * } ResolveOptions
   */
  /**
   * @typedef {ResolveOptions & {
   *   resolvers?: RequireResolver[],
   *   importmap?: import('./module.js').ImportMap,
   *   cache?: boolean
   * }} RequireOptions
   */
  /**
   * An array of global require paths, relative to the origin.
   * @type {string[]}
   */
  export const globalPaths: string[]
  /**
   * An object attached to a `require()` function that contains metadata
   * about the current module context.
   */
  export class Meta {
    /**
     * `Meta` class constructor.
     * @param {import('./module.js').Module} module
     */
    constructor(module: import('oro:commonjs/module').Module)
    /**
     * The referrer (parent) of this module.
     * @type {string}
     */
    get referrer(): string
    /**
     * The referrer (parent) of this module.
     * @type {string}
     */
    get url(): string
    #private
  }
  export default createRequire
  export type RequireResolver = (
    arg0: string,
    arg1: import('oro:commonjs/module').Module,
    arg2: (arg0: string) => any
  ) => any
  export type CreateRequireOptions = {
    module: import('oro:commonjs/module').Module
    prefix?: string
    request?: import('oro:commonjs/loader').RequestOptions
    builtins?: object
    resolvers?: RequireFunction[]
  }
  export type RequireFunction = (arg0: string) => any
  export type PackageOptions = import('oro:commonjs/package').PackageOptions
  export type PackageResolveOptions =
    import('oro:commonjs/package').PackageResolveOptions
  export type RequireOptions = ResolveOptions & {
    resolvers?: RequireResolver[]
    importmap?: import('oro:commonjs/module').ImportMap
    cache?: boolean
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
