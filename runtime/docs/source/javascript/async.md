# `oro:async`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:async'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:async
oro:async/context
oro:async/deferred
oro:async/hooks
oro:async/resource
oro:async/storage
oro:async/wrap
```

### TypeScript declarations

<details>
<summary><code>oro:async</code></summary>

```ts
declare module 'oro:async' {
  export default exports
  import AsyncLocalStorage from 'oro:async/storage'
  import AsyncResource from 'oro:async/resource'
  import AsyncContext from 'oro:async/context'
  import Deferred from 'oro:async/deferred'
  import { executionAsyncResource } from 'oro:async/hooks'
  import { executionAsyncId } from 'oro:async/hooks'
  import { triggerAsyncId } from 'oro:async/hooks'
  import { createHook } from 'oro:async/hooks'
  import { AsyncHook } from 'oro:async/hooks'
  import * as exports from 'oro:async'
  export {
    AsyncLocalStorage,
    AsyncResource,
    AsyncContext,
    Deferred,
    executionAsyncResource,
    executionAsyncId,
    triggerAsyncId,
    createHook,
    AsyncHook,
  }
}
```

</details>

<details>
<summary><code>oro:async/context</code></summary>

```ts
declare module 'oro:async/context' {
  /**
   * @module async.context
   *
   * Async Context for JavaScript based on the TC39 proposal.
   *
   * Example usage:
   * ```js
   * // `AsyncContext` is also globally available as `globalThis.AsyncContext`
   * import AsyncContext from 'oro:async/context'
   *
   * const var = new AsyncContext.Variable()
   * var.run('top', () => {
   *   console.log(var.get()) // 'top'
   *   queueMicrotask(() => {
   *     var.run('nested', () => {
   *       console.log(var.get()) // 'nested'
   *     })
   *   })
   * })
   * ```
   *
   * @see {@link https://tc39.es/proposal-async-context}
   * @see {@link https://github.com/tc39/proposal-async-context}
   */
  /**
   * @template T
   * @typedef {{
   *   name?: string,
   *   defaultValue?: T
   * }} VariableOptions
   */
  /**
   * @callback AnyFunc
   * @template T
   * @this T
   * @param {...any} args
   * @returns {any}
   */
  /**
   * `FrozenRevert` holds a frozen Mapping that will be simply restored
   * when the revert is run.
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/src/fork.ts}
   */
  export class FrozenRevert {
    /**
     * `FrozenRevert` class constructor.
     * @param {Mapping} mapping
     */
    constructor(mapping: Mapping)
    /**
     * Restores (unchaged) mapping from this `FrozenRevert`. This function is
     * called by `AsyncContext.Storage` when it reverts a current mapping to the
     * previous state before a "fork".
     * @param {Mapping=} [unused]
     * @return {Mapping}
     */
    restore(unused?: Mapping | undefined): Mapping
    #private
  }
  /**
   * Revert holds the state on how to revert a change to the
   * `AsyncContext.Storage` current `Mapping`
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/src/fork.ts}
   * @template T
   */
  export class Revert<T> {
    /**
     * `Revert` class constructor.
     * @param {Mapping} mapping
     * @param {Variable<T>} key
     */
    constructor(mapping: Mapping, key: Variable<T>)
    /**
     * @type {T|undefined}
     */
    get previousVariable(): T | undefined
    /**
     * Restores a mapping from this `Revert`. This function is called by
     * `AsyncContext.Storage` when it reverts a current mapping to the
     * previous state before a "fork".
     * @param {Mapping} current
     * @return {Mapping}
     */
    restore(current: Mapping): Mapping
    #private
  }
  /**
   * A container for all `AsyncContext.Variable` instances and snapshot state.
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/src/mapping.ts}
   */
  export class Mapping {
    /**
     * `Mapping` class constructor.
     * @param {Map<Variable<any>, any>} data
     */
    constructor(data: Map<Variable<any>, any>)
    /**
     * Freezes the `Mapping` preventing `AsyncContext.Variable` modifications with
     * `set()` and `delete()`.
     */
    freeze(): void
    /**
     * Returns `true` if the `Mapping` is frozen, otherwise `false`.
     * @return {boolean}
     */
    isFrozen(): boolean
    /**
     * Optionally returns a new `Mapping` if the current one is "frozen",
     * otherwise it just returns the current instance.
     * @return {Mapping}
     */
    fork(): Mapping
    /**
     * Returns `true` if the `Mapping` has a `AsyncContext.Variable` at `key`,
     * otherwise `false.
     * @template T
     * @param {Variable<T>} key
     * @return {boolean}
     */
    has<T>(key: Variable<T>): boolean
    /**
     * Gets an `AsyncContext.Variable` value at `key`. If not set, this function
     * returns `undefined`.
     * @template T
     * @param {Variable<T>} key
     * @return {boolean}
     */
    get<T>(key: Variable<T>): boolean
    /**
     * Sets an `AsyncContext.Variable` value at `key`. If the `Mapping` is frozen,
     * then a "forked" (new) instance with the value set on it is returned,
     * otherwise the current instance.
     * @template T
     * @param {Variable<T>} key
     * @param {T} value
     * @return {Mapping}
     */
    set<T>(key: Variable<T>, value: T): Mapping
    /**
     * Delete  an `AsyncContext.Variable` value at `key`.
     * If the `Mapping` is frozen, then a "forked" (new) instance is returned,
     * otherwise the current instance.
     * @template T
     * @param {Variable<T>} key
     * @param {T} value
     * @return {Mapping}
     */
    delete<T>(key: Variable<T>): Mapping
    #private
  }
  /**
   * A container of all `AsyncContext.Variable` data.
   * @ignore
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/src/storage.ts}
   */
  export class Storage {
    /**
     * The current `Mapping` for this `AsyncContext`.
     * @type {Mapping}
     */
    static '__#private@#current': Mapping
    /**
     * Returns `true` if the current `Mapping` has a
     * `AsyncContext.Variable` at `key`,
     * otherwise `false.
     * @template T
     * @param {Variable<T>} key
     * @return {boolean}
     */
    static has<T>(key: Variable<T>): boolean
    /**
     * Gets an `AsyncContext.Variable` value at `key` for the current `Mapping`.
     * If not set, this function returns `undefined`.
     * @template T
     * @param {Variable<T>} key
     * @return {T|undefined}
     */
    static get<T>(key: Variable<T>): T | undefined
    /**
     * Set updates the `AsyncContext.Variable` with a new value and returns a
     * revert action that allows the modification to be reversed in the future.
     * @template T
     * @param {Variable<T>} key
     * @param {T} value
     * @return {Revert<T>|FrozenRevert}
     */
    static set<T>(key: Variable<T>, value: T): Revert<T> | FrozenRevert
    /**
     * "Freezes" the current storage `Mapping`, and returns a new `FrozenRevert`
     * or `Revert` which can restore the storage state to the state at
     * the time of the snapshot.
     * @return {FrozenRevert}
     */
    static snapshot(): FrozenRevert
    /**
     * Restores the storage `Mapping` state to state at the time the
     * "revert" (`FrozenRevert` or `Revert`) was created.
     * @template T
     * @param {Revert<T>|FrozenRevert} revert
     */
    static restore<T>(revert: Revert<T> | FrozenRevert): void
    /**
     * Switches storage `Mapping` state to the state at the time of a
     * "snapshot".
     * @param {FrozenRevert} snapshot
     * @return {FrozenRevert}
     */
    static switch(snapshot: FrozenRevert): FrozenRevert
  }
  /**
   * `AsyncContext.Variable` is a container for a value that is associated with
   * the current execution flow. The value is propagated through async execution
   * flows, and can be snapshot and restored with Snapshot.
   * @template T
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/README.md#asynccontextvariable}
   */
  export class Variable<T> {
    /**
     * `Variable` class constructor.
     * @param {VariableOptions<T>=} [options]
     */
    constructor(options?: VariableOptions<T> | undefined)
    set defaultValue(defaultValue: T)
    /**
     * @ignore
     */
    get defaultValue(): T
    /**
     * @ignore
     */
    get revert(): FrozenRevert | Revert<T>
    /**
     * The name of this async context variable.
     * @type {string}
     */
    get name(): string
    /**
     * Executes a function `fn` with specified arguments,
     * setting a new value to the current context before the call,
     * and ensuring the environment is reverted back afterwards.
     * The function allows for the modification of a specific context's
     * state in a controlled manner, ensuring that any changes can be undone.
     * @template T, F extends AnyFunc<null>
     * @param {T} value
     * @param {F} fn
     * @param {...Parameters<F>} args
     * @returns {ReturnType<F>}
     */
    run<T_1, F>(value: T_1, fn: F, ...args: Parameters<F>[]): ReturnType<F>
    /**
     * Get the `AsyncContext.Variable` value.
     * @template T
     * @return {T|undefined}
     */
    get<T_1>(): T_1 | undefined
    #private
  }
  /**
   * `AsyncContext.Snapshot` allows you to opaquely capture the current values of
   * all `AsyncContext.Variable` instances and execute a function at a later time
   * as if those values were still the current values (a snapshot and restore).
   * @see {@link https://github.com/tc39/proposal-async-context/blob/master/README.md#asynccontextsnapshot}
   */
  export class Snapshot {
    /**
     * Wraps a given function `fn` with additional logic to take a snapshot of
     * `Storage` before invoking `fn`. Returns a new function with the same
     * signature as `fn` that when called, will invoke `fn` with the current
     * `this` context and provided arguments, after restoring the `Storage`
     * snapshot.
     *
     * `AsyncContext.Snapshot.wrap` is a helper which captures the current values
     * of all Variables and returns a wrapped function. When invoked, this
     * wrapped function restores the state of all Variables and executes the
     * inner function.
     *
     * @see {@link https://github.com/tc39/proposal-async-context/blob/master/README.md#asynccontextsnapshotwrap}
     *
     * @template F
     * @param {F} fn
     * @returns {F}
     */
    static wrap<F>(fn: F): F
    /**
     * Runs the given function `fn` with arguments `args`, using a `null`
     * context and the current snapshot.
     *
     * @template F extends AnyFunc<null>
     * @param {F} fn
     * @param {...Parameters<F>} args
     * @returns {ReturnType<F>}
     */
    run<F>(fn: F, ...args: Parameters<F>[]): ReturnType<F>
    #private
  }
  /**
   * `AsyncContext` container.
   */
  export class AsyncContext {
    /**
     * `AsyncContext.Variable` is a container for a value that is associated with
     * the current execution flow. The value is propagated through async execution
     * flows, and can be snapshot and restored with Snapshot.
     * @see {@link https://github.com/tc39/proposal-async-context/blob/master/README.md#asynccontextvariable}
     * @type {typeof Variable}
     */
    static Variable: typeof Variable
    /**
     * `AsyncContext.Snapshot` allows you to opaquely capture the current values of
     * all `AsyncContext.Variable` instances and execute a function at a later time
     * as if those values were still the current values (a snapshot and restore).
     * @see {@link https://github.com/tc39/proposal-async-context/blob/master/README.md#asynccontextsnapshot}
     * @type {typeof Snapshot}
     */
    static Snapshot: typeof Snapshot
  }
  export default AsyncContext
  export type VariableOptions<T> = {
    name?: string
    defaultValue?: T
  }
  export type AnyFunc = () => any
}
```

</details>

<details>
<summary><code>oro:async/deferred</code></summary>

```ts
declare module 'oro:async/deferred' {
  /**
   * Dispatched when a `Deferred` internal promise is resolved.
   */
  export class DeferredResolveEvent extends Event {
    /**
     * `DeferredResolveEvent` class constructor
     * @ignore
     * @param {string=} [type]
     * @param {any=} [result]
     */
    constructor(type?: string | undefined, result?: any | undefined)
    /**
     * The `Deferred` promise result value.
     * @type {any?}
     */
    result: any | null
  }
  /**
   * Dispatched when a `Deferred` internal promise is rejected.
   */
  export class DeferredRejectEvent {
    /**
     * `DeferredRejectEvent` class constructor
     * @ignore
     * @param {string=} [type]
     * @param {Error=} [error]
     */
    constructor(type?: string | undefined, error?: Error | undefined)
  }
  /**
   * A utility class for creating deferred promises.
   */
  export class Deferred extends EventTarget {
    /**
     * `Deferred` class constructor.
     * @param {Deferred|Promise?} [promise]
     */
    constructor(promise?: Deferred | (Promise<any> | null))
    /**
     * Function to resolve the associated promise.
     * @type {function}
     */
    resolve: Function
    /**
     * Function to reject the associated promise.
     * @type {function}
     */
    reject: Function
    /**
     * Attaches a fulfillment callback and a rejection callback to the promise,
     * and returns a new promise resolving to the return value of the called
     * callback.
     * @param {function(any)=} [resolve]
     * @param {function(Error)=} [reject]
     */
    then(
      resolve?: ((arg0: any) => any) | undefined,
      reject?: ((arg0: Error) => any) | undefined
    ): Promise<any>
    /**
     * Attaches a rejection callback to the promise, and returns a new promise
     * resolving to the return value of the callback if it is called, or to its
     * original fulfillment value if the promise is instead fulfilled.
     * @param {function(Error)=} [callback]
     */
    catch(callback?: ((arg0: Error) => any) | undefined): Promise<any>
    /**
     * Attaches a callback for when the promise is settled (fulfilled or rejected).
     * @param {function(any?)} [callback]
     */
    finally(callback?: (arg0: any | null) => any): Promise<any>
    /**
     * The promise associated with this Deferred instance.
     * @type {Promise<any>}
     */
    get promise(): Promise<any>
    /**
     * A string representation of this Deferred instance.
     * @type {string}
     * @ignore
     */
    get [Symbol.toStringTag](): string
    #private
  }
  export default Deferred
}
```

</details>

<details>
<summary><code>oro:async/hooks</code></summary>

```ts
declare module 'oro:async/hooks' {
  /**
   * Factory for creating a `AsyncHook` instance.
   * @param {AsyncHookCallbackOptions|AsyncHookCallbacks=} [callbacks]
   * @return {AsyncHook}
   */
  export function createHook(
    callbacks?: (AsyncHookCallbackOptions | AsyncHookCallbacks) | undefined
  ): AsyncHook
  /**
   * A container for `AsyncHooks` callbacks.
   * @ignore
   */
  export class AsyncHookCallbacks {
    /**
     * `AsyncHookCallbacks` class constructor.
     * @ignore
     * @param {AsyncHookCallbacks} [options]
     */
    constructor(options?: AsyncHookCallbacks)
    init(_asyncId: any, _type: any, _triggerAsyncId: any, _resource: any): void
    before(_asyncId: any): void
    after(_asyncId: any): void
    destroy(_asyncId: any): void
    promiseResolve(_asyncId: any): void
  }
  /**
   * A container for registering various callbacks for async resource hooks.
   */
  export class AsyncHook {
    /**
     * @param {AsyncHookCallbacks=} [options]
     */
    constructor(callbacks?: any)
    /**
     * @type {boolean}
     */
    get enabled(): boolean
    /**
     * Enable the async hook.
     * @return {AsyncHook}
     */
    enable(): AsyncHook
    /**
     * Disables the async hook
     * @return {AsyncHook}
     */
    disable(): AsyncHook
    #private
  }
  export default createHook
  import { executionAsyncResource } from 'oro:internal/async/hooks'
  import { executionAsyncId } from 'oro:internal/async/hooks'
  import { triggerAsyncId } from 'oro:internal/async/hooks'
  export { executionAsyncResource, executionAsyncId, triggerAsyncId }
}
```

</details>

<details>
<summary><code>oro:async/resource</code></summary>

```ts
declare module 'oro:async/resource' {
  /**
   * @typedef {{
   *   triggerAsyncId?: number,
   *   requireManualDestroy?: boolean
   * }} AsyncResourceOptions
   */
  /**
   * A container that should be extended that represents a resource with
   * an asynchronous execution context.
   */
  export class AsyncResource extends CoreAsyncResource {
    /**
     * Binds function `fn` with an optional this `thisArg` binding to run
     * in the execution context of an anonymous `AsyncResource`.
     * @param {function} fn
     * @param {object|string=} [type]
     * @param {object=} [thisArg]
     * @return {function}
     */
    static bind(
      fn: Function,
      type?: (object | string) | undefined,
      thisArg?: object | undefined
    ): Function
    /**
     * `AsyncResource` class constructor.
     * @param {string} type
     * @param {AsyncResourceOptions|number=} [options]
     */
    constructor(
      type: string,
      options?: (AsyncResourceOptions | number) | undefined
    )
    /**
     * Manually emits destroy hook for the resource.
     * @return {AsyncResource}
     */
    emitDestroy(): AsyncResource
    /**
     * Binds function `fn` with an optional this `thisArg` binding to run
     * in the execution context of this `AsyncResource`.
     * @param {function} fn
     * @param {object=} [thisArg]
     * @return {function}
     */
    bind(fn: Function, thisArg?: object | undefined): Function
    /**
     * Runs function `fn` in the execution context of this `AsyncResource`.
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
  }
  export default AsyncResource
  export type AsyncResourceOptions = {
    triggerAsyncId?: number
    requireManualDestroy?: boolean
  }
  import { executionAsyncResource } from 'oro:internal/async/hooks'
  import { executionAsyncId } from 'oro:internal/async/hooks'
  import { triggerAsyncId } from 'oro:internal/async/hooks'
  import { CoreAsyncResource } from 'oro:internal/async/hooks'
  export { executionAsyncResource, executionAsyncId, triggerAsyncId }
}
```

</details>

<details>
<summary><code>oro:async/storage</code></summary>

```ts
declare module 'oro:async/storage' {
  /**
   * A container for storing values that remain present during
   * asynchronous operations.
   */
  export class AsyncLocalStorage {
    /**
     * Binds function `fn` to run in the execution context of an
     * anonymous `AsyncResource`.
     * @param {function} fn
     * @return {function}
     */
    static bind(fn: Function): Function
    /**
     * Captures the current async context and returns a function that runs
     * a function in that execution context.
     * @return {function}
     */
    static snapshot(): Function
    /**
     * @type {boolean}
     */
    get enabled(): boolean
    /**
     * Disables the `AsyncLocalStorage` instance. When disabled,
     * `getStore()` will always return `undefined`.
     */
    disable(): void
    /**
     * Enables the `AsyncLocalStorage` instance.
     */
    enable(): void
    /**
     * Enables and sets the `AsyncLocalStorage` instance default store value.
     * @param {any} store
     */
    enterWith(store: any): void
    /**
     * Runs function `fn` in the current asynchronous execution context with
     * a given `store` value and arguments given to `fn`.
     * @param {any} store
     * @param {function} fn
     * @param {...any} args
     * @return {any}
     */
    run(store: any, fn: Function, ...args: any[]): any
    exit(fn: any, ...args: any[]): any
    /**
     * If the `AsyncLocalStorage` instance is enabled, it returns the current
     * store value for this asynchronous execution context.
     * @return {any|undefined}
     */
    getStore(): any | undefined
    #private
  }
  export default AsyncLocalStorage
}
```

</details>

<details>
<summary><code>oro:async/wrap</code></summary>

```ts
declare module 'oro:async/wrap' {
  /**
   * Returns `true` if a given function `fn` has the "async" wrapped tag,
   * meaning it was "tagged" in a `wrap(fn)` call before, otherwise this
   * function will return `false`.
   * @ignore
   * @param {function} fn
   * @param {boolean}
   */
  export function isTagged(fn: Function): boolean
  /**
   * Tags a function `fn` as being "async wrapped" so subsequent calls to
   * `wrap(fn)` do not wrap an already wrapped function.
   * @ignore
   * @param {function} fn
   * @return {function}
   */
  export function tag(fn: Function): Function
  /**
   * Wraps a function `fn` that captures a snapshot of the current async
   * context. This function is idempotent and will not wrap a function more
   * than once.
   * @ignore
   * @param {function} fn
   * @return {function}
   */
  export function wrap(fn: Function): Function
  export const symbol: unique symbol
  export default wrap
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
