# `oro:timers`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:timers'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:timers
oro:timers/index
oro:timers/platform
oro:timers/promises
oro:timers/scheduler
oro:timers/timer
```

### TypeScript declarations

<details>
<summary><code>oro:timers</code></summary>

```ts
declare module 'oro:timers' {
  export * from 'oro:timers/index'
  export default exports
  import * as exports from 'oro:timers/index'
}
```

</details>

<details>
<summary><code>oro:timers/index</code></summary>

```ts
declare module 'oro:timers/index' {
  export function setTimeout(
    callback: any,
    delay: any,
    ...args: any[]
  ): import('oro:timers/timer').Timer
  export function clearTimeout(timeout: any): void
  export function setInterval(
    callback: any,
    delay: any,
    ...args: any[]
  ): import('oro:timers/timer').Timer
  export function clearInterval(interval: any): void
  export function setImmediate(
    callback: any,
    ...args: any[]
  ): import('oro:timers/timer').Timer
  export function clearImmediate(immediate: any): void
  /**
   * Pause async execution for `timeout` milliseconds.
   * @param {number} timeout
   * @return {Promise}
   */
  export function sleep(timeout: number): Promise<any>
  export namespace sleep {
    /**
     * Pause sync execution for `timeout` milliseconds.
     * @param {number} timeout
     */
    function sync(timeout: number): void
  }
  export { platform }
  namespace _default {
    export { platform }
    export { promises }
    export { scheduler }
    export { setTimeout }
    export { clearTimeout }
    export { setInterval }
    export { clearInterval }
    export { setImmediate }
    export { clearImmediate }
  }
  export default _default
  import platform from 'oro:timers/platform'
  import promises from 'oro:timers/promises'
  import scheduler from 'oro:timers/scheduler'
}
```

</details>

<details>
<summary><code>oro:timers/platform</code></summary>

```ts
declare module 'oro:timers/platform' {
  export namespace platform {
    let setTimeout: any
    let setInterval: any
    let setImmediate: any
    let clearTimeout: any
    let clearInterval: any
    let clearImmediate: any
    let postTask: any
  }
  export default platform
}
```

</details>

<details>
<summary><code>oro:timers/promises</code></summary>

```ts
declare module 'oro:timers/promises' {
  export function setTimeout(
    delay?: number,
    value?: any,
    options?: any
  ): Promise<any>
  export function setInterval(
    delay?: number,
    value?: any,
    options?: any
  ): AsyncGenerator<any, void, unknown>
  export function setImmediate(value?: any, options?: any): Promise<any>
  namespace _default {
    export { setImmediate }
    export { setInterval }
    export { setTimeout }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:timers/scheduler</code></summary>

```ts
declare module 'oro:timers/scheduler' {
  export function wait(delay: any, options?: any): Promise<any>
  export function postTask(callback: any, options?: any): Promise<any>
  namespace _default {
    export { postTask }
    export { setImmediate as yield }
    export { wait }
  }
  export default _default
  import { setImmediate } from 'oro:timers/promises'
}
```

</details>

<details>
<summary><code>oro:timers/timer</code></summary>

```ts
declare module 'oro:timers/timer' {
  export class Timer extends AsyncResource {
    [x: number]: () => {
      args: any[]
      handle(id: any, destroy: any): void
    }
    static from(...args: any[]): Timer
    constructor(type: any, create: any, destroy: any)
    get id(): number
    init(...args: any[]): this
    close(): boolean
    [Symbol.toPrimitive](): number
    #private
  }
  export class Timeout extends Timer {
    constructor()
  }
  export class Interval extends Timer {
    constructor()
  }
  export class Immediate extends Timer {
    constructor()
  }
  namespace _default {
    export { Timer }
    export { Immediate }
    export { Timeout }
    export { Interval }
  }
  export default _default
  import { AsyncResource } from 'oro:async/resource'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
