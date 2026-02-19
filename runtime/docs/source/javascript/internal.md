# `oro:internal/*`

`oro:internal/*` modules are internal runtime building blocks. They exist so the runtime can compose its
Node-compatibility surface and WebView integrations, but they are not considered stable application-facing API.

## Import

```js
import * as api from 'oro:internal/async/hooks'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:internal/async/hooks
oro:internal/bluetooth-web
oro:internal/callsite
oro:internal/credentials
oro:internal/database
oro:internal/direct-sockets-policy
oro:internal/error
oro:internal/events
oro:internal/geolocation
oro:internal/globals
oro:internal/hid-web
oro:internal/init
oro:internal/iterator
oro:internal/permissions
oro:internal/pickers
oro:internal/post-message
oro:internal/primitives
oro:internal/promise
oro:internal/runtime-schemes
oro:internal/scheduler
oro:internal/serialize
oro:internal/service-worker
oro:internal/shared-array-buffer
oro:internal/streams
oro:internal/streams/web
oro:internal/symbols
oro:internal/tcp-server-socket
oro:internal/tcp-socket
oro:internal/timers
oro:internal/udp-socket
oro:internal/usb-web
oro:internal/web-share
oro:internal/webassembly
oro:internal/worker
```

### TypeScript declarations

<details>
<summary><code>oro:internal/async/hooks</code></summary>

```ts
declare module 'oro:internal/async/hooks' {
  export function dispatch(
    hook: any,
    asyncId: any,
    type: any,
    triggerAsyncId: any,
    resource: any
  ): void
  export function getNextAsyncResourceId(): number
  export function executionAsyncResource(): any
  export function executionAsyncId(): any
  export function triggerAsyncId(): any
  export function getDefaultExecutionAsyncId(): any
  export function wrap(
    callback: any,
    type: any,
    asyncId?: number,
    triggerAsyncId?: any,
    resource?: any
  ): (...args: any[]) => any
  export function getTopLevelAsyncResourceName(): any
  /**
   * The default top level async resource ID
   * @type {number}
   */
  export const TOP_LEVEL_ASYNC_RESOURCE_ID: number
  export namespace state {
    let defaultExecutionAsyncId: number
  }
  export namespace hooks {
    let init: any[]
    let before: any[]
    let after: any[]
    let destroy: any[]
    let promiseResolve: any[]
  }
  /**
   * A base class for the `AsyncResource` class or other higher level async
   * resource classes.
   */
  export class CoreAsyncResource {
    [x: number]: () => import('oro:gc').Finalizer
    /**
     * `CoreAsyncResource` class constructor.
     * @param {string} type
     * @param {object|number=} [options]
     */
    constructor(type: string, options?: (object | number) | undefined)
    /**
     * The `CoreAsyncResource` type.
     * @type {string}
     */
    get type(): string
    /**
     * `true` if the `CoreAsyncResource` was destroyed, otherwise `false`. This
     * value is only set to `true` if `emitDestroy()` was called, likely from
     * destroying the resource manually.
     * @type {boolean}
     */
    get destroyed(): boolean
    /**
     * The unique async resource ID.
     * @return {number}
     */
    asyncId(): number
    /**
     * The trigger async resource ID.
     * @return {number}
     */
    triggerAsyncId(): number
    /**
     * Manually emits destroy hook for the resource.
     * @return {CoreAsyncResource}
     */
    emitDestroy(): CoreAsyncResource
    /**
     * Binds function `fn` with an optional this `thisArg` binding to run
     * in the execution context of this `CoreAsyncResource`.
     * @param {function} fn
     * @param {object=} [thisArg]
     * @return {function}
     */
    bind(fn: Function, thisArg?: object | undefined): Function
    /**
     * Runs function `fn` in the execution context of this `CoreAsyncResource`.
     * @param {function} fn
     * @param {object=} [thisArg]
     * @param {...any} [args]
     * @return {any}
     */
    runInAsyncScope(
      fn: Function,
      thisArg?: object | undefined,
      ...args: any[]
    ): any
    #private
  }
  export class TopLevelAsyncResource extends CoreAsyncResource {}
  export const asyncContextVariable: Variable<any>
  export const topLevelAsyncResource: TopLevelAsyncResource
  export default hooks
  import { Variable } from 'oro:async/context'
}
```

</details>

<details>
<summary><code>oro:internal/bluetooth-web</code></summary>

```ts
declare module 'oro:internal/bluetooth-web' {
  export class Bluetooth extends EventTarget {
    requestDevice(options?: {}): Promise<BluetoothDevice>
    getDevices(): Promise<any[]>
    getAvailability(): Promise<boolean>
  }
  export class BluetoothDevice extends EventTarget {
    constructor({
      id,
      name,
      services,
      manufacturerData,
    }?: {
      id?: string
      name?: string
      services?: any[]
    })
    id: string
    name: string
    gatt: BluetoothRemoteGATTServer
    gattServer: BluetoothRemoteGATTServer
    uuids: string[]
    manufacturerData: BluetoothManufacturerDataMap
    watchAdvertisements(): Promise<this>
    forget(): Promise<this>
  }
  export class BluetoothRemoteGATTServer extends EventTarget {
    constructor(device: any)
    device: any
    connected: boolean
    connect(): Promise<this>
    disconnect(): void
    getPrimaryService(uuid: any): Promise<BluetoothRemoteGATTService>
    getPrimaryServices(uuid: any): Promise<any>
  }
  export class BluetoothRemoteGATTService extends EventTarget {
    constructor(server: any, uuid: any, primary?: boolean)
    device: any
    uuid: string
    isPrimary: boolean
    getCharacteristic(uuid: any): Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristics(uuid: any): Promise<any>
  }
  export class BluetoothRemoteGATTCharacteristic extends EventTarget {
    constructor(service: any, uuid: any)
    service: any
    uuid: string
    properties: Readonly<{
      broadcast: false
      read: false
      writeWithoutResponse: false
      write: false
      notify: false
      indicate: false
      authenticatedSignedWrites: false
      reliableWrite: false
      writableAuxiliaries: false
    }>
    readValue(): Promise<DataView<any>>
    value: DataView<any>
    writeValue(value: any): Promise<void>
    writeValueWithResponse(value: any): Promise<void>
    writeValueWithoutResponse(value: any): Promise<void>
    startNotifications(): Promise<this>
    stopNotifications(): Promise<this>
  }
  export class BluetoothManufacturerDataMap extends Map<any, any> {
    constructor(entries: any)
    set(key: any, value: any): this
    get(key: any): any
    has(key: any): boolean
  }
}
```

</details>

<details>
<summary><code>oro:internal/callsite</code></summary>

```ts
declare module 'oro:internal/callsite' {
  /**
   * Creates an ordered and link array of `CallSite` instances from a
   * given `Error`.
   * @param {Error} error
   * @param {string} source
   * @return {CallSite[]}
   */
  export function createCallSites(error: Error, source: string): CallSite[]
  /**
   * @typedef {{
   *   sourceURL: string | null,
   *   symbol: string,
   *   column: number | undefined,
   *   line: number | undefined,
   *   native: boolean
   * }} ParsedStackFrame
   */
  /**
   * A container for location data related to a `StackFrame`
   */
  export class StackFrameLocation {
    [x: number]: () => {
      __type__: 'StackFrameLocation'
      lineNumber: number | undefined
      columnNumber: number | undefined
      sourceURL: string | null
      isNative: boolean
    }
    /**
     * Creates a `StackFrameLocation` from JSON input.
     * @param {object=} json
     * @return {StackFrameLocation}
     */
    static from(json?: object | undefined): StackFrameLocation
    /**
     * The line number of the location of the stack frame, if available.
     * @type {number | undefined}
     */
    lineNumber: number | undefined
    /**
     * The column number of the location of the stack frame, if available.
     * @type {number | undefined}
     */
    columnNumber: number | undefined
    /**
     * The source URL of the location of the stack frame, if available. This value
     * may be `null`.
     * @type {string?}
     */
    sourceURL: string | null
    /**
     * `true` if the stack frame location is in native location, otherwise
     * this value `false` (default).
     * @type
     */
    isNative: any
    /**
     * Converts this `StackFrameLocation` to a JSON object.
     * @ignore
     * @return {{
     *   lineNumber: number | undefined,
     *   columnNumber: number | undefined,
     *   sourceURL: string | null,
     *   isNative: boolean
     * }}
     */
    toJSON(): {
      lineNumber: number | undefined
      columnNumber: number | undefined
      sourceURL: string | null
      isNative: boolean
    }
  }
  /**
   * A stack frame container related to a `CallSite`.
   */
  export class StackFrame {
    [x: number]: () => {
      __type__: 'StackFrame'
      location: {
        __type__: 'StackFrameLocation'
        lineNumber: number | undefined
        columnNumber: number | undefined
        sourceURL: string | null
        isNative: boolean
      }
      isNative: boolean
      symbol: string | null
      source: string | null
      error: {
        message: string
        name: string
        stack: string
      } | null
    }
    /**
     * Parses a raw stack frame string into structured data.
     * @param {string} rawStackFrame
     * @return {ParsedStackFrame}
     */
    static parse(rawStackFrame: string): ParsedStackFrame
    /**
     * Creates a new `StackFrame` from an `Error` and raw stack frame
     * source `rawStackFrame`.
     * @param {Error} error
     * @param {string} rawStackFrame
     * @return {StackFrame}
     */
    static from(error: Error, rawStackFrame: string): StackFrame
    /**
     * `StackFrame` class constructor.
     * @param {Error} error
     * @param {ParsedStackFrame=} [frame]
     * @param {string=} [source]
     */
    constructor(
      error: Error,
      frame?: ParsedStackFrame | undefined,
      source?: string | undefined
    )
    /**
     * The stack frame location data.
     * @type {StackFrameLocation}
     */
    location: StackFrameLocation
    /**
     * The `Error` associated with this `StackFrame` instance.
     * @type {Error?}
     */
    error: Error | null
    /**
     * The name of the function where the stack frame is located.
     * @type {string?}
     */
    symbol: string | null
    /**
     * The raw stack frame source string.
     * @type {string?}
     */
    source: string | null
    /**
     * Converts this `StackFrameLocation` to a JSON object.
     * @ignore
     * @return {{
     *   location: {
     *     lineNumber: number | undefined,
     *     columnNumber: number | undefined,
     *     sourceURL: string | null,
     *     isNative: boolean
     *   },
     *   isNative: boolean,
     *   symbol: string | null,
     *   source: string | null,
     *   error: { message: string, name: string, stack: string } | null
     * }}
     */
    toJSON(): {
      location: {
        lineNumber: number | undefined
        columnNumber: number | undefined
        sourceURL: string | null
        isNative: boolean
      }
      isNative: boolean
      symbol: string | null
      source: string | null
      error: {
        message: string
        name: string
        stack: string
      } | null
    }
  }
  /**
   * A v8 compatible interface and container for call site information.
   */
  export class CallSite {
    [x: number]: () => {
      __type__: 'CallSite'
      frame: {
        __type__: 'StackFrame'
        location: {
          __type__: 'StackFrameLocation'
          lineNumber: number | undefined
          columnNumber: number | undefined
          sourceURL: string | null
          isNative: boolean
        }
        isNative: boolean
        symbol: string | null
        source: string | null
        error: {
          message: string
          name: string
          stack: string
        } | null
      }
    }
    /**
     * An internal symbol used to refer to the index of a promise in
     * `Promise.all` or `Promise.any` function call site.
     * @ignore
     * @type {symbol}
     */
    static PromiseElementIndexSymbol: symbol
    /**
     * An internal symbol used to indicate that a call site is in a `Promise.all`
     * function call.
     * @ignore
     * @type {symbol}
     */
    static PromiseAllSymbol: symbol
    /**
     * An internal symbol used to indicate that a call site is in a `Promise.any`
     * function call.
     * @ignore
     * @type {symbol}
     */
    static PromiseAnySymbol: symbol
    /**
     * An internal source symbol used to store the original `Error` stack source.
     * @ignore
     * @type {symbol}
     */
    static StackSourceSymbol: symbol
    /**
     * `CallSite` class constructor
     * @param {Error} error
     * @param {string} rawStackFrame
     * @param {CallSite=} previous
     */
    constructor(
      error: Error,
      rawStackFrame: string,
      previous?: CallSite | undefined
    )
    /**
     * The `Error` associated with the call site.
     * @type {Error}
     */
    get error(): Error
    /**
     * The previous `CallSite` instance, if available.
     * @type {CallSite?}
     */
    get previous(): CallSite | null
    /**
     * A reference to the `StackFrame` data.
     * @type {StackFrame}
     */
    get frame(): StackFrame
    /**
     * This function _ALWAYS__ returns `globalThis` as `this` cannot be determined.
     * @return {object}
     */
    getThis(): object
    /**
     * This function _ALWAYS__ returns `null` as the type name of `this`
     * cannot be determined.
     * @return {null}
     */
    getTypeName(): null
    /**
     * This function _ALWAYS__ returns `undefined` as the current function
     * reference cannot be determined.
     * @return {undefined}
     */
    getFunction(): undefined
    /**
     * Returns the name of the function in at the call site, if available.
     * @return {string|undefined}
     */
    getFunctionName(): string | undefined
    /**
     * An alias to `getFunctionName()
     * @return {string}
     */
    getMethodName(): string
    /**
     * Get the filename of the call site location, if available, otherwise this
     * function returns 'unknown location'.
     * @return {string}
     */
    getFileName(): string
    /**
     * Returns the location source URL defaulting to the global location.
     * @return {string}
     */
    getScriptNameOrSourceURL(): string
    /**
     * Returns a hash value of the source URL return by `getScriptNameOrSourceURL()`
     * @return {string}
     */
    getScriptHash(): string
    /**
     * Returns the line number of the call site location.
     * This value may be `undefined`.
     * @return {number|undefined}
     */
    getLineNumber(): number | undefined
    /**
     * @ignore
     * @return {number}
     */
    getPosition(): number
    /**
     * Attempts to get an "enclosing" line number, potentially the previous
     * line number of the call site
     * @param {number|undefined}
     */
    getEnclosingLineNumber(): any
    /**
     * Returns the column number of the call site location.
     * This value may be `undefined`.
     * @return {number|undefined}
     */
    getColumnNumber(): number | undefined
    /**
     * Attempts to get an "enclosing" column number, potentially the previous
     * line number of the call site
     * @param {number|undefined}
     */
    getEnclosingColumnNumber(): any
    /**
     * Gets the origin of where `eval()` was called if this call site function
     * originated from a call to `eval()`. This function may return `undefined`.
     * @return {string|undefined}
     */
    getEvalOrigin(): string | undefined
    /**
     * This function _ALWAYS__ returns `false` as `this` cannot be determined so
     * "top level" detection is not possible.
     * @return {boolean}
     */
    isTopLevel(): boolean
    /**
     * Returns `true` if this call site originated from a call to `eval()`.
     * @return {boolean}
     */
    isEval(): boolean
    /**
     * Returns `true` if the call site is in a native location, otherwise `false`.
     * @return {boolean}
     */
    isNative(): boolean
    /**
     * This function _ALWAYS_ returns `false` as constructor detection
     * is not possible.
     * @return {boolean}
     */
    isConstructor(): boolean
    /**
     * Returns `true` if the call site is in async context, otherwise `false`.
     * @return {boolean}
     */
    isAsync(): boolean
    /**
     * Returns `true` if the call site is in a `Promise.all()` function call,
     * otherwise `false.
     * @return {boolean}
     */
    isPromiseAll(): boolean
    /**
     * Gets the index of the promise element that was followed in a
     * `Promise.all()` or `Promise.any()` function call. If not available, then
     * this function returns `null`.
     * @return {number|null}
     */
    getPromiseIndex(): number | null
    /**
     * Converts this call site to a string.
     * @return {string}
     */
    toString(): string
    /**
     * Converts this `CallSite` to a JSON object.
     * @ignore
     * @return {{
     *   frame: {
     *     location: {
     *       lineNumber: number | undefined,
     *       columnNumber: number | undefined,
     *       sourceURL: string | null,
     *       isNative: boolean
     *     },
     *     isNative: boolean,
     *     symbol: string | null,
     *     source: string | null,
     *     error: { message: string, name: string, stack: string } | null
     *   }
     * }}
     */
    toJSON(): {
      frame: {
        location: {
          lineNumber: number | undefined
          columnNumber: number | undefined
          sourceURL: string | null
          isNative: boolean
        }
        isNative: boolean
        symbol: string | null
        source: string | null
        error: {
          message: string
          name: string
          stack: string
        } | null
      }
    }
    set [$previous](previous: any)
    /**
     * Private accessor to "friend class" `CallSiteList`.
     * @ignore
     */
    get [$previous](): any
    #private
  }
  /**
   * An array based list container for `CallSite` instances.
   */
  export class CallSiteList extends Array<any> {
    [x: number]: () => Array<{
      __type__: 'CallSite'
      frame: {
        __type__: 'StackFrame'
        location: {
          __type__: 'StackFrameLocation'
          lineNumber: number | undefined
          columnNumber: number | undefined
          sourceURL: string | null
          isNative: boolean
        }
        isNative: boolean
        symbol: string | null
        source: string | null
        error: {
          message: string
          name: string
          stack: string
        } | null
      }
    }>
    /**
     * Creates a `CallSiteList` instance from `Error` input.
     * @param {Error} error
     * @param {string} source
     * @return {CallSiteList}
     */
    static from(error: Error, source: string): CallSiteList
    /**
     * `CallSiteList` class constructor.
     * @param {Error} error
     * @param {string[]=} [sources]
     */
    constructor(error: Error, sources?: string[] | undefined)
    /**
     * A reference to the `Error` for this `CallSiteList` instance.
     * @type {Error}
     */
    get error(): Error
    /**
     * An array of stack frame source strings.
     * @type {string[]}
     */
    get sources(): string[]
    /**
     * The original stack string derived from the sources.
     * @type {string}
     */
    get stack(): string
    /**
     * Adds `CallSite` instances to the top of the list, linking previous
     * instances to the next one.
     * @param {...CallSite} callsites
     * @return {number}
     */
    unshift(...callsites: CallSite[]): number
    /**
     * A no-op function as `CallSite` instances cannot be added to the end
     * of the list.
     * @return {number}
     */
    push(): number
    /**
     * Pops a `CallSite` off the end of the list.
     * @return {CallSite|undefined}
     */
    pop(): CallSite | undefined
    /**
     * Converts this `CallSiteList` to a JSON object.
     * @return {{
     *   frame: {
     *     location: {
     *       lineNumber: number | undefined,
     *       columnNumber: number | undefined,
     *       sourceURL: string | null,
     *       isNative: boolean
     *     },
     *     isNative: boolean,
     *     symbol: string | null,
     *     source: string | null,
     *     error: { message: string, name: string, stack: string } | null
     *   }
     * }[]}
     */
    toJSON(): {
      frame: {
        location: {
          lineNumber: number | undefined
          columnNumber: number | undefined
          sourceURL: string | null
          isNative: boolean
        }
        isNative: boolean
        symbol: string | null
        source: string | null
        error: {
          message: string
          name: string
          stack: string
        } | null
      }
    }[]
    #private
  }
  export default CallSite
  export type ParsedStackFrame = {
    sourceURL: string | null
    symbol: string
    column: number | undefined
    line: number | undefined
    native: boolean
  }
  const $previous: unique symbol
}
```

</details>

<details>
<summary><code>oro:internal/credentials</code></summary>

```ts
declare module 'oro:internal/credentials' {
  namespace _default {
    export { get }
  }
  export default _default
  function get(options: any, ...args: any[]): Promise<any>
}
```

</details>

<details>
<summary><code>oro:internal/database</code></summary>

```ts
declare module 'oro:internal/database' {
  /**
   * A typed container for optional options given to the `Database`
   * class constructor.
   *
   * @typedef {{
   *   version?: string | undefined
   * }} DatabaseOptions
   */
  /**
   * A typed container for various optional options made to a `get()` function
   * on a `Database` instance.
   *
   * @typedef {{
   *   store?: string | undefined,
   *   stores?: string[] | undefined,
   *   count?: number | undefined
   * }} DatabaseGetOptions
   */
  /**
   * A typed container for various optional options made to a `put()` function
   * on a `Database` instance.
   *
   * @typedef {{
   *   store?: string | undefined,
   *   stores?: string[] | undefined,
   *   durability?: 'strict' | 'relaxed' | undefined
   * }} DatabasePutOptions
   */
  /**
   * A typed container for various optional options made to a `delete()` function
   * on a `Database` instance.
   *
   * @typedef {{
   *   store?: string | undefined,
   *   stores?: string[] | undefined
   * }} DatabaseDeleteOptions
   */
  /**
   * A typed container for optional options given to the `Database`
   * class constructor.
   *
   * @typedef {{
   *   offset?: number | undefined,
   *   backlog?: number | undefined
   * }} DatabaseRequestQueueWaitOptions
   */
  /**
   * A typed container for various optional options made to a `entries()` function
   * on a `Database` instance.
   *
   * @typedef {{
   *   store?: string | undefined,
   *   stores?: string[] | undefined
   * }} DatabaseEntriesOptions
   */
  /**
   * A `DatabaseRequestQueueRequestConflict` callback function type.
   * @typedef {function(Event, DatabaseRequestQueueRequestConflict): any} DatabaseRequestQueueConflictResolutionCallback
   */
  /**
   * Waits for an event of `eventType` to be dispatched on a given `EventTarget`.
   * @param {EventTarget} target
   * @param {string} eventType
   * @return {Promise<Event>}
   */
  export function waitFor(
    target: EventTarget,
    eventType: string
  ): Promise<Event>
  /**
   * Creates an opens a named `Database` instance.
   * @param {string} name
   * @param {?DatabaseOptions | undefined} [options]
   * @return {Promise<Database>}
   */
  export function open(
    name: string,
    options?: (DatabaseOptions | undefined) | null
  ): Promise<Database>
  /**
   * Complete deletes a named `Database` instance.
   * @param {string} name
   * @param {?DatabaseOptions|undefined} [options]
   */
  export function drop(
    name: string,
    options?: (DatabaseOptions | undefined) | null
  ): Promise<void>
  /**
   * A mapping of named `Database` instances that are currently opened
   * @type {Map<string, WeakRef<Database>>}
   */
  export const opened: Map<string, WeakRef<Database>>
  /**
   * A container for conflict resolution for a `DatabaseRequestQueue` instance
   * `IDBRequest` instance.
   */
  export class DatabaseRequestQueueRequestConflict {
    /**
     * `DatabaseRequestQueueRequestConflict` class constructor
     * @param {function(any): void)} resolve
     * @param {function(Error): void)} reject
     * @param {function(): void)} cleanup
     */
    constructor(resolve: any, reject: any, cleanup: any)
    /**
     * Called when a conflict is resolved.
     * @param {any} argument
     */
    resolve(argument?: any): void
    /**
     * Called when a conflict is rejected
     * @param {Error} error
     */
    reject(error: Error): void
    #private
  }
  /**
   * An event dispatched on a `DatabaseRequestQueue`
   */
  export class DatabaseRequestQueueEvent extends Event {
    /**
     * `DatabaseRequestQueueEvent` class constructor.
     * @param {string} type
     * @param {IDBRequest|IDBTransaction} request
     */
    constructor(type: string, request: IDBRequest | IDBTransaction)
    /**
     * A reference to the underlying request for this event.
     * @type {IDBRequest|IDBTransaction}
     */
    get request(): IDBRequest | IDBTransaction
    #private
  }
  /**
   * An event dispatched on a `Database`
   */
  export class DatabaseEvent extends Event {
    /**
     * `DatabaseEvent` class constructor.
     * @param {string} type
     * @param {Database} database
     */
    constructor(type: string, database: Database)
    /**
     * A reference to the underlying database for this event.
     * @type {Database}
     */
    get database(): Database
    #private
  }
  /**
   * An error event dispatched on a `DatabaseRequestQueue`
   */
  export class DatabaseRequestQueueErrorEvent extends ErrorEvent {
    /**
     * `DatabaseRequestQueueErrorEvent` class constructor.
     * @param {string} type
     * @param {IDBRequest|IDBTransaction} request
     * @param {{ error: Error, cause?: Error }} options
     */
    constructor(
      type: string,
      request: IDBRequest | IDBTransaction,
      options: {
        error: Error
        cause?: Error
      }
    )
    /**
     * A reference to the underlying request for this error event.
     * @type {IDBRequest|IDBTransaction}
     */
    get request(): IDBRequest | IDBTransaction
    #private
  }
  /**
   * A container for various `IDBRequest` and `IDBTransaction` instances
   * occurring during the life cycles of a `Database` instance.
   */
  export class DatabaseRequestQueue extends EventTarget {
    /**
     * Computed queue length
     * @type {number}
     */
    get length(): number
    /**
     * Pushes an `IDBRequest` or `IDBTransaction onto the queue and returns a
     * `Promise` that resolves upon a 'success' or 'complete' event and rejects
     * upon an error' event.
     * @param {IDBRequest|IDBTransaction}
     * @param {?DatabaseRequestQueueConflictResolutionCallback} [conflictResolutionCallback]
     * @return {Promise}
     */
    push(
      request: any,
      conflictResolutionCallback?: DatabaseRequestQueueConflictResolutionCallback | null
    ): Promise<any>
    /**
     * Waits for all pending requests to complete. This function will throw when
     * an `IDBRequest` or `IDBTransaction` instance emits an 'error' event.
     * Callers of this function can optionally specify a maximum backlog to wait
     * for instead of waiting for all requests to finish.
     * @param {?DatabaseRequestQueueWaitOptions | undefined} [options]
     */
    wait(
      options?: (DatabaseRequestQueueWaitOptions | undefined) | null
    ): Promise<any[]>
    #private
  }
  /**
   * An interface for reading from named databases backed by IndexedDB.
   */
  export class Database extends EventTarget {
    [x: number]: () => import('oro:gc').Finalizer
    /**
     * `Database` class constructor.
     * @param {string} name
     * @param {?DatabaseOptions | undefined} [options]
     */
    constructor(name: string, options?: (DatabaseOptions | undefined) | null)
    /**
     * `true` if the `Database` is currently opening, otherwise `false`.
     * A `Database` instance should not attempt to be opened if this property value
     * is `true`.
     * @type {boolean}
     */
    get opening(): boolean
    /**
     * `true` if the `Database` instance was successfully opened such that the
     * internal `IDBDatabase` storage instance was created and can be referenced
     * on the `Database` instance, otherwise `false`.
     * @type {boolean}
     */
    get opened(): boolean
    /**
     * `true` if the `Database` instance was closed or has not been opened such
     * that the internal `IDBDatabase` storage instance was not created or cannot
     * be referenced on the `Database` instance, otherwise `false`.
     * @type {boolean}
     */
    get closed(): boolean
    /**
     * `true` if the `Database` is currently closing, otherwise `false`.
     * A `Database` instance should not attempt to be closed if this property value
     * is `true`.
     * @type {boolean}
     */
    get closing(): boolean
    /**
     * The name of the `IDBDatabase` database. This value cannot be `null`.
     * @type {string}
     */
    get name(): string
    /**
     * The version of the `IDBDatabase` database. This value may be `null`.
     * @type {?string}
     */
    get version(): string | null
    /**
     * A reference to the `IDBDatabase`, if the `Database` instance was opened.
     * This value may ba `null`.
     * @type {?IDBDatabase}
     */
    get storage(): IDBDatabase | null
    /**
     * Opens the `IDBDatabase` database optionally at a specific "version" if
     * one was given upon construction of the `Database` instance. This function
     * is not idempotent and will throw if the underlying `IDBDatabase` instance
     * was created successfully or is in the process of opening.
     * @return {Promise}
     */
    open(): Promise<any>
    /**
     * Closes the `IDBDatabase` database storage, if opened. This function is not
     * idempotent and will throw if the underlying `IDBDatabase` instance is
     * already closed (not opened) or currently closing.
     * @return {Promise}
     */
    close(): Promise<any>
    /**
     * Deletes entire `Database` instance and closes after successfully
     * delete storage.
     */
    drop(): Promise<void>
    /**
     * Gets a "readonly" value by `key` in the `Database` object storage.
     * @param {string} key
     * @param {?DatabaseGetOptions|undefined} [options]
     * @return {Promise<object|object[]|null>}
     */
    get(
      key: string,
      options?: (DatabaseGetOptions | undefined) | null
    ): Promise<object | object[] | null>
    /**
     * Put a `value` at `key`, updating if it already exists, otherwise
     * "inserting" it into the `Database` instance.
     * @param {string} key
     * @param {any} value
     * @param {?DatabasePutOptions|undefined} [options]
     * @return {Promise}
     */
    put(
      key: string,
      value: any,
      options?: (DatabasePutOptions | undefined) | null
    ): Promise<any>
    /**
     * Inserts a new `value` at `key`. This function throws if a value at `key`
     * already exists.
     * @param {string} key
     * @param {any} value
     * @param {?DatabasePutOptions|undefined} [options]
     * @return {Promise}
     */
    insert(
      key: string,
      value: any,
      options?: (DatabasePutOptions | undefined) | null
    ): Promise<any>
    /**
     * Update a `value` at `key`, updating if it already exists, otherwise
     * "inserting" it into the `Database` instance.
     * @param {string} key
     * @param {any} value
     * @param {?DatabasePutOptions|undefined} [options]
     * @return {Promise}
     */
    update(
      key: string,
      value: any,
      options?: (DatabasePutOptions | undefined) | null
    ): Promise<any>
    /**
     * Delete a value at `key`.
     * @param {string} key
     * @param {?DatabaseDeleteOptions|undefined} [options]
     * @return {Promise}
     */
    delete(
      key: string,
      options?: (DatabaseDeleteOptions | undefined) | null
    ): Promise<any>
    /**
     * Gets a "readonly" value by `key` in the `Database` object storage.
     * @param {?DatabaseEntriesOptions|undefined} [options]
     * @return {Promise<object|object[]|null>}
     */
    entries(
      options?: (DatabaseEntriesOptions | undefined) | null
    ): Promise<object | object[] | null>
    #private
  }
  namespace _default {
    export { Database }
    export { open }
    export { drop }
  }
  export default _default
  /**
   * A typed container for optional options given to the `Database`
   * class constructor.
   */
  export type DatabaseOptions = {
    version?: string | undefined
  }
  /**
   * A typed container for various optional options made to a `get()` function
   * on a `Database` instance.
   */
  export type DatabaseGetOptions = {
    store?: string | undefined
    stores?: string[] | undefined
    count?: number | undefined
  }
  /**
   * A typed container for various optional options made to a `put()` function
   * on a `Database` instance.
   */
  export type DatabasePutOptions = {
    store?: string | undefined
    stores?: string[] | undefined
    durability?: 'strict' | 'relaxed' | undefined
  }
  /**
   * A typed container for various optional options made to a `delete()` function
   * on a `Database` instance.
   */
  export type DatabaseDeleteOptions = {
    store?: string | undefined
    stores?: string[] | undefined
  }
  /**
   * A typed container for optional options given to the `Database`
   * class constructor.
   */
  export type DatabaseRequestQueueWaitOptions = {
    offset?: number | undefined
    backlog?: number | undefined
  }
  /**
   * A typed container for various optional options made to a `entries()` function
   * on a `Database` instance.
   */
  export type DatabaseEntriesOptions = {
    store?: string | undefined
    stores?: string[] | undefined
  }
  /**
   * A `DatabaseRequestQueueRequestConflict` callback function type.
   */
  export type DatabaseRequestQueueConflictResolutionCallback = (
    arg0: Event,
    arg1: DatabaseRequestQueueRequestConflict
  ) => any
}
```

</details>

<details>
<summary><code>oro:internal/direct-sockets-policy</code></summary>

```ts
declare module 'oro:internal/direct-sockets-policy' {
  /**
   * Direct Sockets Permissions-Policy gating.
   *
   * This runtime does not consume HTTP Permissions-Policy headers directly,
   * but apps may configure an opt-in/opt-out toggle using either:
   * - __args.config.permissions_policy_direct_sockets (boolean)
   * - __args.env.DIRECT_SOCKETS_ALLOWED ("1" | "true" | "yes" | "0" | "false" | "no")
   *
   * Default behavior: allowed.
   */
  export function isDirectSocketsAllowed(): boolean
  namespace _default {
    export { isDirectSocketsAllowed }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/error</code></summary>

```ts
declare module 'oro:internal/error' {
  /**
   * The default `Error` class stack trace limit.
   * @type {number}
   */
  export const DEFAULT_ERROR_STACK_TRACE_LIMIT: number
  export const DefaultPlatformError: ErrorConstructor
  export const Error: ErrorConstructor
  export const URIError: ErrorConstructor
  export const EvalError: ErrorConstructor
  export const TypeError: ErrorConstructor
  export const RangeError: ErrorConstructor
  export const MediaError: ErrorConstructor
  export const SyntaxError: ErrorConstructor
  export const ReferenceError: ErrorConstructor
  export const AggregateError: ErrorConstructor
  export const RTCError: ErrorConstructor
  export const OverconstrainedError: ErrorConstructor
  export const GeolocationPositionError: ErrorConstructor
  export const ApplePayError: ErrorConstructor
  namespace _default {
    export { Error }
    export { URIError }
    export { EvalError }
    export { TypeError }
    export { RangeError }
    export { MediaError }
    export { SyntaxError }
    export { ReferenceError }
    export { AggregateError }
    export { RTCError }
    export { OverconstrainedError }
    export { GeolocationPositionError }
    export { ApplePayError }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/events</code></summary>

```ts
declare module 'oro:internal/events' {
  /**
   * An event dispatched when an application URL is opening the application.
   */
  export class ApplicationURLEvent extends Event {
    /**
     * `ApplicationURLEvent` class constructor.
     * @param {string=} [type]
     * @param {object=} [options]
     */
    constructor(type?: string | undefined, options?: object | undefined)
    /**
     * `true` if the application URL is valid (parses correctly).
     * @type {boolean}
     */
    get isValid(): boolean
    /**
     * Data associated with the `ApplicationURLEvent`.
     * @type {?any}
     */
    get data(): any | null
    /**
     * The original source URI
     * @type {?string}
     */
    get source(): string | null
    /**
     * The `URL` for the `ApplicationURLEvent`.
     * @type {?URL}
     */
    get url(): URL | null
    /**
     * String tag name for an `ApplicationURLEvent` instance.
     * @type {string}
     */
    get [Symbol.toStringTag](): string
    #private
  }
  /**
   * An event dispacted for a registered global hotkey expression.
   */
  export class HotKeyEvent extends MessageEvent<any> {
    /**
     * `HotKeyEvent` class constructor.
     * @ignore
     * @param {string=} [type]
     * @param {object=} [data]
     */
    constructor(type?: string | undefined, data?: object | undefined)
    /**
     * The global unique ID for this hotkey binding.
     * @type {number?}
     */
    get id(): number | null
    /**
     * The computed hash for this hotkey binding.
     * @type {number?}
     */
    get hash(): number | null
    /**
     * The normalized hotkey expression as a sequence of tokens.
     * @type {string[]}
     */
    get sequence(): string[]
    /**
     * The original expression of the hotkey binding.
     * @type {string?}
     */
    get expression(): string | null
  }
  /**
   * An event dispacted when a menu item is selected.
   */
  export class MenuItemEvent extends MessageEvent<any> {
    /**
     * `MenuItemEvent` class constructor
     * @ignore
     * @param {string=} [type]
     * @param {object=} [data]
     * @param {import('../application/menu.js').Menu} menu
     */
    constructor(
      type?: string | undefined,
      data?: object | undefined,
      menu?: import('oro:application/menu').Menu
    )
    /**
     * The `Menu` this event has been dispatched for.
     * @type {import('../application/menu.js').Menu?}
     */
    get menu(): import('oro:application/menu').Menu | null
    /**
     * The title of the menu item.
     * @type {string?}
     */
    get title(): string | null
    /**
     * An optional tag value for the menu item that may also be the
     * parent menu item title.
     * @type {string?}
     */
    get tag(): string | null
    /**
     * The parent title of the menu item.
     * @type {string?}
     */
    get parent(): string | null
    #private
  }
  /**
   * An event dispacted when the application receives an OS signal
   */
  export class SignalEvent extends MessageEvent<any> {
    /**
     * `SignalEvent` class constructor
     * @ignore
     * @param {string=} [type]
     * @param {object=} [options]
     */
    constructor(type?: string | undefined, options?: object | undefined)
    /**
     * The code of the signal.
     * @type {import('../process/signal.js').signal}
     */
    get code(): import('oro:process/signal').signal
    /**
     * The name of the signal.
     * @type {string}
     */
    get name(): string
    /**
     * An optional message describing the signal
     * @type {string}
     */
    get message(): string
    #private
  }
  namespace _default {
    export { ApplicationURLEvent }
    export { MenuItemEvent }
    export { SignalEvent }
    export { HotKeyEvent }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/geolocation</code></summary>

```ts
declare module 'oro:internal/geolocation' {
  /**
   * Get the current position of the device.
   * @param {function(GeolocationPosition)} onSuccess
   * @param {onError(Error)} onError
   * @param {object=} options
   * @param {number=} options.timeout
   * @return {Promise}
   */
  export function getCurrentPosition(
    onSuccess: (arg0: GeolocationPosition) => any,
    onError: any,
    options?: object | undefined,
    ...args: any[]
  ): Promise<any>
  /**
   * Register a handler function that will be called automatically each time the
   * position of the device changes. You can also, optionally, specify an error
   * handling callback function.
   * @param {function(GeolocationPosition)} onSuccess
   * @param {function(Error)} onError
   * @param {object=} [options]
   * @param {number=} [options.timeout = null]
   * @return {number}
   */
  export function watchPosition(
    onSuccess: (arg0: GeolocationPosition) => any,
    onError: (arg0: Error) => any,
    options?: object | undefined,
    ...args: any[]
  ): number
  /**
   * Unregister location and error monitoring handlers previously installed
   * using `watchPosition`.
   * @param {number} id
   */
  export function clearWatch(id: number, ...args: any[]): any
  export namespace platform {
    let getCurrentPosition: Function
    let watchPosition: Function
    let clearWatch: Function
  }
  namespace _default {
    export { getCurrentPosition }
    export { watchPosition }
    export { clearWatch }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/globals</code></summary>

```ts
declare module 'oro:internal/globals' {
  /**
   * Gets a runtime global value by name.
   * @ignore
   * @param {string} name
   * @return {any|null}
   */
  export function get(name: string): any | null
  /**
   * Symbolic global registry
   * @ignore
   */
  export class GlobalsRegistry {
    get global(): any
    symbol(name: any): symbol
    register(name: any, value: any): any
    get(name: any): any
  }
  export default registry
  const registry: any
}
```

</details>

<details>
<summary><code>oro:internal/hid-web</code></summary>

```ts
declare module 'oro:internal/hid-web' {
  export function installNavigatorHID(): any
  export class NavigatorHID extends EventTarget {
    getDevices(): Promise<any>
    requestDevice(options?: {}): Promise<any>
    cancelRequest(): Promise<void>
    #private
  }
  export class HIDDevice extends EventTarget {
    constructor(descriptor: any, _navigatorHID: any)
    _applyDescriptor(descriptor?: {}): void
    deviceId: string
    vendorId: number
    productId: number
    productName: any
    manufacturerName: any
    serialNumber: any
    set opened(value: boolean)
    get opened(): boolean
    get collections(): any[]
    get authorized(): boolean
    open(): Promise<void>
    close(): Promise<void>
    forget(): Promise<void>
    sendReport(reportId: any, data: any): Promise<void>
    sendFeatureReport(reportId: any, data: any): Promise<void>
    receiveFeatureReport(reportId: any, length: any): Promise<DataView<any>>
    #private
  }
  export class HIDInputReportEvent extends Event {
    constructor(type: any, init: any)
    device: any
    reportId: number
    data: any
  }
}
```

</details>

<details>
<summary><code>oro:internal/init</code></summary>

```ts
declare module 'oro:internal/init' {
  namespace _default {
    export { location }
  }
  export default _default
  import location from 'oro:location'
}
```

</details>

<details>
<summary><code>oro:internal/iterator</code></summary>

```ts
declare module 'oro:internal/iterator' {
  /**
   * Internal iterator utilities.
   * Currently only provides a trivial iterator wrapper.
   */
  export function fromArray(items: any): {
    next(): {
      value: any
      done: boolean
    }
  }
}
```

</details>

<details>
<summary><code>oro:internal/permissions</code></summary>

```ts
declare module 'oro:internal/permissions' {
  /**
   * Query for a permission status.
   * @param {PermissionDescriptor} descriptor
   * @param {object=} [options]
   * @param {?AbortSignal} [options.signal = null]
   * @return {Promise<PermissionStatus>}
   */
  export function query(
    descriptor: PermissionDescriptor,
    options?: object | undefined,
    ...args: any[]
  ): Promise<PermissionStatus>
  /**
   * Request a permission to be granted.
   * @param {PermissionDescriptor} descriptor
   * @param {object=} [options]
   * @param {?AbortSignal} [options.signal = null]
   * @return {Promise<PermissionStatus>}
   */
  export function request(
    descriptor: PermissionDescriptor,
    options?: object | undefined,
    ...args: any[]
  ): Promise<PermissionStatus>
  /**
   * An enumeration of the permission types.
   * - 'geolocation'
   * - 'notifications'
   * - 'push'
   * - 'persistent-storage'
   * - 'midi'
   * - 'storage-access'
   * @type {Enumeration}
   * @ignore
   */
  export const types: Enumeration
  const _default: any
  export default _default
  export type PermissionDescriptor = {
    name: string
  }
  /**
   * A container that provides the state of an object and an event handler
   * for monitoring changes permission changes.
   * @ignore
   */
  class PermissionStatus extends EventTarget {
    [x: number]: () => import('oro:gc').Finalizer
    /**
     * `PermissionStatus` class constructor.
     * @param {string} name
     * @param {string} initialState
     * @param {object=} [options]
     * @param {?AbortSignal} [options.signal = null]
     */
    constructor(
      name: string,
      initialState: string,
      options?: object | undefined
    )
    /**
     * The name of this permission this status is for.
     * @type {string}
     */
    get name(): string
    /**
     * The current state of the permission status.
     * @type {string}
     */
    get state(): string
    set onchange(onchange: (arg0: Event) => any)
    /**
     * Level 0 event target 'change' event listener accessor
     * @type {function(Event)}
     */
    get onchange(): (arg0: Event) => any
    /**
     * Non-standard method for unsubscribing to status state updates.
     * @ignore
     */
    unsubscribe(): void
    /**
     * String tag for `PermissionStatus`.
     * @ignore
     */
    get [Symbol.toStringTag](): string
    #private
  }
  import Enumeration from 'oro:enumeration'
}
```

</details>

<details>
<summary><code>oro:internal/pickers</code></summary>

```ts
declare module 'oro:internal/pickers' {
  /**
   * @typedef {{
   *   description?: string,
   *   accept?: Record<string, string[]>
   * }} FilePickerAcceptType
   */
  /**
   * @typedef {{
   *   id?: string,
   *   mode?: 'read' | 'readwrite',
   *   startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos',
   * }} ShowDirectoryPickerOptions
   */
  /**
   * Shows a directory picker which allows the user to select a directory.
   * @param {ShowDirectoryPickerOptions=} [options]
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker}
   * @return {Promise<FileSystemDirectoryHandle[]>}
   */
  export function showDirectoryPicker(
    options?: ShowDirectoryPickerOptions | undefined
  ): Promise<FileSystemDirectoryHandle[]>
  /**
   * @typedef {{
   *   id?: string,
   *   excludeAcceptAllOption?: boolean,
   *   startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos',
   *   types?: Array<FilePickerAcceptType>
   * }} ShowOpenFilePickerOptions
   */
  /**
   * Shows a file picker that allows a user to select a file or multiple files
   * and returns a handle for each selected file.
   * @param {ShowOpenFilePickerOptions=} [options]
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker}
   * @return {Promise<FileSystemFileHandle[]>}
   */
  export function showOpenFilePicker(
    options?: ShowOpenFilePickerOptions | undefined
  ): Promise<FileSystemFileHandle[]>
  /**
   * @typedef {{
   *   id?: string,
   *   excludeAcceptAllOption?: boolean,
   *   suggestedName?: string,
   *   startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos',
   *   types?: Array<FilePickerAcceptType>
   * }} ShowSaveFilePickerOptions
   */
  /**
   * Shows a file picker that allows a user to save a file by selecting an
   * existing file, or entering a name for a new file.
   * @param {ShowSaveFilePickerOptions=} [options]
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker}
   * @return {Promise<FileSystemHandle>}
   */
  export function showSaveFilePicker(
    options?: ShowSaveFilePickerOptions | undefined
  ): Promise<FileSystemHandle>
  /**
   * Key-value store for general usage by the file pickers"
   * @ignore
   */
  export class Database {
    get(key: any): any
    set(key: any, value: any): void
  }
  /**
   * Internal database for pickers, such as mapping IDs to directory/file paths.
   * @ignore
   */
  export const db: Database
  namespace _default {
    export { showDirectoryPicker }
    export { showOpenFilePicker }
    export { showSaveFilePicker }
  }
  export default _default
  export type FilePickerAcceptType = {
    description?: string
    accept?: Record<string, string[]>
  }
  export type ShowDirectoryPickerOptions = {
    id?: string
    mode?: 'read' | 'readwrite'
    startIn?:
      | FileSystemHandle
      | 'desktop'
      | 'documents'
      | 'downloads'
      | 'music'
      | 'pictures'
      | 'videos'
  }
  export type ShowOpenFilePickerOptions = {
    id?: string
    excludeAcceptAllOption?: boolean
    startIn?:
      | FileSystemHandle
      | 'desktop'
      | 'documents'
      | 'downloads'
      | 'music'
      | 'pictures'
      | 'videos'
    types?: Array<FilePickerAcceptType>
  }
  export type ShowSaveFilePickerOptions = {
    id?: string
    excludeAcceptAllOption?: boolean
    suggestedName?: string
    startIn?:
      | FileSystemHandle
      | 'desktop'
      | 'documents'
      | 'downloads'
      | 'music'
      | 'pictures'
      | 'videos'
    types?: Array<FilePickerAcceptType>
  }
}
```

</details>

<details>
<summary><code>oro:internal/post-message</code></summary>

```ts
declare module 'oro:internal/post-message' {
  const _default: any
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/primitives</code></summary>

```ts
declare module 'oro:internal/primitives' {
  export function init(): {
    natives: {}
    patches: {}
  }
  namespace _default {
    export { natives }
    export { patches }
  }
  export default _default
  const natives: {}
  const patches: {}
}
```

</details>

<details>
<summary><code>oro:internal/promise</code></summary>

```ts
declare module 'oro:internal/promise' {
  export const NativePromise: PromiseConstructor
  export namespace NativePromisePrototype {
    export let then: <TResult1 = any, TResult2 = never>(
      onfulfilled?: (value: any) => TResult1 | PromiseLike<TResult1>,
      onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
    ) => globalThis.Promise<TResult1 | TResult2>
    let _catch: <TResult = never>(
      onrejected?: (reason: any) => TResult | PromiseLike<TResult>
    ) => globalThis.Promise<any>
    export { _catch as catch }
    let _finally: (onfinally?: () => void) => globalThis.Promise<any>
    export { _finally as finally }
  }
  export const NativePromiseAll: any
  export const NativePromiseAny: any
  /**
   * @typedef {function(any): void} ResolveFunction
   */
  /**
   * @typedef {function(Error|string|null): void} RejectFunction
   */
  /**
   * @typedef {function(ResolveFunction, RejectFunction): void} ResolverFunction
   */
  /**
   * @typedef {{
   *   promise: Promise,
   *   resolve: ResolveFunction,
   *   reject: RejectFunction
   * }} PromiseResolvers
   */
  export class Promise extends globalThis.Promise<any> {
    /**
     * Creates a new `Promise` with resolver functions.
     * @see {https://github.com/tc39/proposal-promise-with-resolvers}
     * @return {PromiseResolvers}
     */
    static withResolvers(): PromiseResolvers
    /**
     * `Promise` class constructor.
     * @ignore
     * @param {ResolverFunction} resolver
     */
    constructor(resolver: ResolverFunction)
    [resourceSymbol]: {
      [x: number]: () => import('oro:gc').Finalizer
      get type(): string
      get destroyed(): boolean
      asyncId(): number
      triggerAsyncId(): number
      emitDestroy(): asyncHooks.CoreAsyncResource
      bind(fn: Function, thisArg?: object | undefined): Function
      runInAsyncScope(
        fn: Function,
        thisArg?: object | undefined,
        ...args: any[]
      ): any
      '__#private@#private': any
    }
  }
  export namespace Promise {
    function all(iterable: any): any
    function any(iterable: any): any
  }
  export default Promise
  export type ResolveFunction = (arg0: any) => void
  export type RejectFunction = (arg0: Error | string | null) => void
  export type ResolverFunction = (
    arg0: ResolveFunction,
    arg1: RejectFunction
  ) => void
  export type PromiseResolvers = {
    promise: Promise
    resolve: ResolveFunction
    reject: RejectFunction
  }
  const resourceSymbol: unique symbol
  import * as asyncHooks from 'oro:internal/async/hooks'
}
```

</details>

<details>
<summary><code>oro:internal/runtime-schemes</code></summary>

```ts
declare module 'oro:internal/runtime-schemes' {
  /**
   * @param {string} value
   * @returns {boolean}
   */
  export function isRuntimeSpecifier(value: string): boolean
  /**
   * @param {string} value
   * @returns {boolean}
   */
  export function isRuntimeURL(value: string): boolean
  /**
   * Rewrites the provided specifier or URL so it uses the preferred runtime scheme.
   * When `options.url === true`, the `://` delimiter is assumed. Otherwise `:` is used.
   * @param {string} value
   * @param {{ url?: boolean, scheme?: string }} [options]
   * @returns {string}
   */
  export function withPreferredRuntimeScheme(
    value: string,
    {
      url,
      scheme,
    }?: {
      url?: boolean
      scheme?: string
    }
  ): string
  /**
   * Builds a runtime origin string (e.g., `oro://com.example.app`).
   * @param {string} bundleIdentifier
   * @param {{ scheme?: string }} [options]
   * @returns {string}
   */
  export function runtimeOrigin(
    bundleIdentifier: string,
    {
      scheme,
    }?: {
      scheme?: string
    }
  ): string
  /**
   * Normalizes a scheme string (with/without the trailing colon) to the runtime value.
   * Returns an empty string for unrecognised schemes.
   * @param {string} scheme
   * @returns {string}
   */
  export function normalizeRuntimeScheme(scheme: string): string
  export const PRIMARY_SCHEME: 'oro'
  export const RUNTIME_SCHEMES: readonly string[]
}
```

</details>

<details>
<summary><code>oro:internal/scheduler</code></summary>

```ts
declare module 'oro:internal/scheduler' {
  export * from 'oro:timers/scheduler'
  export default scheduler
  import scheduler from 'oro:timers/scheduler'
}
```

</details>

<details>
<summary><code>oro:internal/serialize</code></summary>

```ts
declare module 'oro:internal/serialize' {
  export default function serialize(value: any): any
}
```

</details>

<details>
<summary><code>oro:internal/service-worker</code></summary>

```ts
declare module 'oro:internal/service-worker' {
  export const serviceWorker: ServiceWorkerContainer
  export default serviceWorker
  import { ServiceWorkerContainer } from 'oro:service-worker/container'
}
```

</details>

<details>
<summary><code>oro:internal/shared-array-buffer</code></summary>

```ts
declare module 'oro:internal/shared-array-buffer' {
  export default SharedArrayBufferPolyfill
  let SharedArrayBufferPolyfill: SharedArrayBufferConstructor
}
```

</details>

<details>
<summary><code>oro:internal/streams</code></summary>

```ts
declare module 'oro:internal/streams' {
  const _default: any
  export default _default
  import { ReadableStream } from 'oro:internal/streams/web'
  import { ReadableStreamBYOBReader } from 'oro:internal/streams/web'
  import { ReadableByteStreamController } from 'oro:internal/streams/web'
  import { ReadableStreamBYOBRequest } from 'oro:internal/streams/web'
  import { ReadableStreamDefaultController } from 'oro:internal/streams/web'
  import { ReadableStreamDefaultReader } from 'oro:internal/streams/web'
  import { WritableStream } from 'oro:internal/streams/web'
  import { WritableStreamDefaultController } from 'oro:internal/streams/web'
  import { WritableStreamDefaultWriter } from 'oro:internal/streams/web'
  import { TransformStream } from 'oro:internal/streams/web'
  import { TransformStreamDefaultController } from 'oro:internal/streams/web'
  import { ByteLengthQueuingStrategy } from 'oro:internal/streams/web'
  import { CountQueuingStrategy } from 'oro:internal/streams/web'
  export {
    ReadableStream,
    ReadableStreamBYOBReader,
    ReadableByteStreamController,
    ReadableStreamBYOBRequest,
    ReadableStreamDefaultController,
    ReadableStreamDefaultReader,
    WritableStream,
    WritableStreamDefaultController,
    WritableStreamDefaultWriter,
    TransformStream,
    TransformStreamDefaultController,
    ByteLengthQueuingStrategy,
    CountQueuingStrategy,
  }
}
```

</details>

<details>
<summary><code>oro:internal/streams/web</code></summary>

```ts
declare module 'oro:internal/streams/web' {
  export class ByteLengthQueuingStrategy {
    constructor(e: any)
    _byteLengthQueuingStrategyHighWaterMark: any
    get highWaterMark(): any
    get size(): (e: any) => any
  }
  export class CountQueuingStrategy {
    constructor(e: any)
    _countQueuingStrategyHighWaterMark: any
    get highWaterMark(): any
    get size(): () => number
  }
  export class ReadableByteStreamController {
    get byobRequest(): any
    get desiredSize(): number
    close(): void
    enqueue(e: any): void
    error(e?: any): void
    _pendingPullIntos: v;
    [T](e: any): any
    [C](e: any): any
    [P](): void
  }
  export class ReadableStream {
    [x: number]: (e: any) => any
    static from(e: any): any
    constructor(e?: {}, t?: {})
    get locked(): boolean
    cancel(e?: any): any
    getReader(e?: any): ReadableStreamBYOBReader | ReadableStreamDefaultReader
    pipeThrough(e: any, t?: {}): any
    pipeTo(e: any, t?: {}): any
    tee(): any
    values(e?: any): any
  }
  export class ReadableStreamBYOBReader {
    constructor(e: any)
    _readIntoRequests: v
    get closed(): any
    cancel(e?: any): any
    read(e: any, t?: {}): any
    releaseLock(): void
  }
  export class ReadableStreamBYOBRequest {
    get view(): any
    respond(e: any): void
    respondWithNewView(e: any): void
  }
  export class ReadableStreamDefaultController {
    get desiredSize(): number
    close(): void
    enqueue(e?: any): void
    error(e?: any): void
    [T](e: any): any
    [C](e: any): void
    [P](): void
  }
  export class ReadableStreamDefaultReader {
    constructor(e: any)
    _readRequests: v
    get closed(): any
    cancel(e?: any): any
    read(): any
    releaseLock(): void
  }
  export class TransformStream {
    constructor(e?: {}, t?: {}, r?: {})
    get readable(): any
    get writable(): any
  }
  export class TransformStreamDefaultController {
    get desiredSize(): number
    enqueue(e?: any): void
    error(e?: any): void
    terminate(): void
  }
  export class WritableStream {
    constructor(e?: {}, t?: {})
    get locked(): boolean
    abort(e?: any): any
    close(): any
    getWriter(): WritableStreamDefaultWriter
  }
  export class WritableStreamDefaultController {
    get abortReason(): any
    get signal(): any
    error(e?: any): void
    [w](e: any): any
    [R](): void
  }
  export class WritableStreamDefaultWriter {
    constructor(e: any)
    _ownerWritableStream: any
    get closed(): any
    get desiredSize(): number
    get ready(): any
    abort(e?: any): any
    close(): any
    releaseLock(): void
    write(e?: any): any
  }
  class v {
    _cursor: number
    _size: number
    _front: {
      _elements: any[]
      _next: any
    }
    _back: {
      _elements: any[]
      _next: any
    }
    get length(): number
    push(e: any): void
    shift(): any
    forEach(e: any): void
    peek(): any
  }
  const T: unique symbol
  const C: unique symbol
  const P: unique symbol
  const w: unique symbol
  const R: unique symbol
  export {}
}
```

</details>

<details>
<summary><code>oro:internal/symbols</code></summary>

```ts
declare module 'oro:internal/symbols' {
  export const dispose: any
  export const serialize: any
  namespace _default {
    export { dispose }
    export { serialize }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/tcp-server-socket</code></summary>

```ts
declare module 'oro:internal/tcp-server-socket' {
  export class TCPServerSocket {
    /**
     * @typedef {Object} TCPServerSocketOptions
     * @property {number} [localPort] - 0 to have OS pick a free port
     * @property {number} [backlog] - Size of accept queue; platform default if omitted
     */
    constructor(localAddress: any, options?: {})
    /** @type {Promise<{ readable: ReadableStream<any>, localAddress: string, localPort: number }>} */
    get opened(): Promise<{
      readable: ReadableStream<any>
      localAddress: string
      localPort: number
    }>
    /** @type {Promise<void>} */
    get closed(): Promise<void>
    close(): Promise<void>
    #private
  }
  export default TCPServerSocket
}
```

</details>

<details>
<summary><code>oro:internal/tcp-socket</code></summary>

```ts
declare module 'oro:internal/tcp-socket' {
  export class TCPSocket {
    static kFromNetSocket: symbol
    /**
     * @param {string} remoteAddress - Hostname or IP.
     * @param {number} remotePort - Destination port (0..65535).
     * @param {TCPSocketOptions} [options]
     *
     * Notes
     * - Gating: if disabled by policy, `opened` rejects immediately and no
     *   underlying socket is created.
     * - 'opened' resolution: deferred until native emits 'connect'; errors
     *   before that reject `opened`.
     * - Readable semantics: enqueues Uint8Array; closes on 'end'.
     * - Writable semantics: resolves per-write callback; backpressure is
     *   handled by the underlying socket and surfaced via the callback.
     */
    constructor(
      remoteAddress: string,
      remotePort: number,
      options?: {
        /**
         * - Enable/disable Nagle’s algorithm
         */
        noDelay?: boolean
        /**
         * - Alias for enabling TCP keepalive
         */
        keepAlive?: boolean
        /**
         * - Seconds between TCP keepalive probes
         */
        keepAliveDelay?: number
        /**
         * - Not currently used by the runtime
         */
        sendBufferSize?: number
        /**
         * - Not currently used by the runtime
         */
        receiveBufferSize?: number
        /**
         * - Hint for name resolution
         */
        dnsQueryType?: 'ipv4' | 'ipv6'
      }
    )
    /** @type {Promise<{ readable: ReadableStream<Uint8Array>, writable: WritableStream<BufferSource>, remoteAddress: string, remotePort: number, localAddress: string, localPort: number }>} */
    get opened(): Promise<{
      readable: ReadableStream<Uint8Array>
      writable: WritableStream<BufferSource>
      remoteAddress: string
      remotePort: number
      localAddress: string
      localPort: number
    }>
    /** @type {Promise<void>} */
    get closed(): Promise<void>
    close(): Promise<void>
    #private
  }
  export default TCPSocket
}
```

</details>

<details>
<summary><code>oro:internal/timers</code></summary>

```ts
declare module 'oro:internal/timers' {
  export function setTimeout(callback: any, ...args: any[]): number
  export function clearTimeout(timeout: any): any
  export function setInterval(callback: any, ...args: any[]): number
  export function clearInterval(interval: any): any
  export function setImmediate(callback: any, ...args: any[]): number
  export function clearImmediate(immediate: any): any
  namespace _default {
    export { setTimeout }
    export { setInterval }
    export { setImmediate }
    export { clearTimeout }
    export { clearInterval }
    export { clearImmediate }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/udp-socket</code></summary>

```ts
declare module 'oro:internal/udp-socket' {
  export class UDPSocket {
    /**
     * @typedef {Object} UDPSocketOptions
     * @property {string} [remoteAddress]
     * @property {number} [remotePort]
     * @property {string} [localAddress]
     * @property {number} [localPort]
     * @property {'ipv4'|'ipv6'} [dnsQueryType]
     * @property {number} [sendBufferSize]
     * @property {number} [receiveBufferSize]
     * @description Provide either remoteAddress/remotePort (connected mode) OR localAddress[/localPort] (bound mode). Options are mutually exclusive.
     */
    /**
     * @typedef {Object} UDPMessage
     * @property {BufferSource} data
     * @property {string} [remoteAddress] - Required in bound mode for send; omitted in connected mode
     * @property {number} [remotePort] - Required in bound mode for send; omitted in connected mode
     */
    constructor(options: any)
    /** @type {Promise<{ readable: ReadableStream<any>, writable: WritableStream<any>, remoteAddress: string, remotePort: number, localAddress: string, localPort: number }>} */
    get opened(): Promise<{
      readable: ReadableStream<any>
      writable: WritableStream<any>
      remoteAddress: string
      remotePort: number
      localAddress: string
      localPort: number
    }>
    /** @type {Promise<void>} */
    get closed(): Promise<void>
    close(): Promise<void>
    #private
  }
  export default UDPSocket
}
```

</details>

<details>
<summary><code>oro:internal/usb-web</code></summary>

```ts
declare module 'oro:internal/usb-web' {
  export function installNavigatorUSB(): any
  export class NavigatorUSB extends EventTarget {
    _deviceCache: Map<any, any>
    _onNativeConnect: (event: any) => void
    _onNativeDisconnect: (event: any) => void
    _createDevice(descriptor: any): any
    getDevices(): Promise<any>
    requestDevice(options?: {}): Promise<any>
    cancelRequest(): Promise<void>
    #private
  }
  export class USBDevice extends EventTarget {
    constructor(descriptor: any)
    _applyDescriptor(descriptor?: {}): void
    deviceId: string
    vendorId: number
    productId: number
    deviceClass: number
    deviceSubclass: number
    deviceProtocol: number
    productName: any
    manufacturerName: any
    serialNumber: any
    opened: boolean
    _authorized: boolean
    configurations: any
    open(): Promise<void>
    close(): Promise<void>
    forget(): Promise<void>
    selectConfiguration(configurationValue: any): Promise<void>
    claimInterface(interfaceNumber: any): Promise<void>
    releaseInterface(interfaceNumber: any): Promise<void>
    selectAlternateInterface(
      interfaceNumber: any,
      alternateSetting: any
    ): Promise<void>
    controlTransferIn(setup: any, length: any): Promise<USBInTransferResult>
    controlTransferOut(setup: any, data: any): Promise<USBOutTransferResult>
    transferIn(endpointNumber: any, length: any): Promise<USBInTransferResult>
    transferOut(endpointNumber: any, data: any): Promise<USBOutTransferResult>
    clearHalt(direction: any, endpointNumber: any): Promise<void>
    reset(): Promise<void>
  }
  export class USBInTransferResult {
    constructor(status: any, dataView: any)
    status: any
    data: any
  }
  export class USBOutTransferResult {
    constructor(status: any, bytesWritten: any)
    status: any
    bytesWritten: number
  }
  export class USBConnectionEvent extends Event {
    constructor(type: any, init: any)
    device: any
  }
}
```

</details>

<details>
<summary><code>oro:internal/web-share</code></summary>

```ts
declare module 'oro:internal/web-share' {
  namespace _default {
    export { share }
    export { canShare }
    export { normalizeShareData }
    export { platformSupportsShare }
  }
  export default _default
  function share(data?: {}): Promise<void>
  function canShare(data?: {}): boolean
  function normalizeShareData(
    input?: {},
    {
      allowEmpty,
    }?: {
      allowEmpty?: boolean
    }
  ): {
    title: string
    text: string
    url: string
    files: any[]
    hasData: boolean
  }
  function platformSupportsShare(): boolean
}
```

</details>

<details>
<summary><code>oro:internal/webassembly</code></summary>

```ts
declare module 'oro:internal/webassembly' {
  /**
   * The `instantiateStreaming()` function compiles and instantiates a WebAssembly
   * module directly from a streamed source.
   * @ignore
   * @param {Response} response
   * @param {=object} [importObject]
   * @return {Promise<WebAssembly.Instance>}
   */
  export function instantiateStreaming(
    response: Response,
    importObject?: any
  ): Promise<WebAssembly.Instance>
  /**
   * The `compileStreaming()` function compiles and instantiates a WebAssembly
   * module directly from a streamed source.
   * @ignore
   * @param {Response} response
   * @return {Promise<WebAssembly.Module>}
   */
  export function compileStreaming(
    response: Response
  ): Promise<WebAssembly.Module>
  namespace _default {
    export { instantiateStreaming }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:internal/worker</code></summary>

```ts
declare module 'oro:internal/worker' {
  export function onWorkerMessage(event: any): Promise<any>
  export function addEventListener(
    eventName: any,
    callback: any,
    ...args: any[]
  ): any
  export function removeEventListener(
    eventName: any,
    callback: any,
    ...args: any[]
  ): any
  export function dispatchEvent(event: any): any
  export function postMessage(message: any, ...args: any[]): any
  export function close(): any
  export function importScripts(...scripts: any[]): void
  export const WorkerGlobalScopePrototype: any
  /**
   * The absolute `URL` of the internal worker initialization entry.
   * @ignore
   * @type {URL}
   */
  export const url: URL
  /**
   * The worker entry source.
   * @ignore
   * @type {string}
   */
  export const source: string
  /**
   * A unique identifier for this worker made available on the global scope
   * @ignore
   * @type {string}
   */
  export const RUNTIME_WORKER_ID: string
  /**
   * Internally scoped event interface for a worker context.
   * @ignore
   * @type {object}
   */
  export const worker: object
  /**
   * A reference to the global worker scope.
   * @type {WorkerGlobalScope}
   */
  export const self: WorkerGlobalScope
  namespace _default {
    export { RUNTIME_WORKER_ID }
    export { removeEventListener }
    export { addEventListener }
    export { importScripts }
    export { dispatchEvent }
    export { postMessage }
    export { source }
    export { close }
    export { url }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
