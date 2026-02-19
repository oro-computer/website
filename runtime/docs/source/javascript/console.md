# `oro:console`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:console'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:console
```

### TypeScript declarations

<details>
<summary><code>oro:console</code></summary>

```ts
declare module 'oro:console' {
  export function patchGlobalConsole(globalConsole: any, options?: {}): any
  export const globalConsole: globalThis.Console
  export class Console {
    /**
     * @ignore
     */
    constructor(options: any)
    /**
     * @type {import('dom').Console}
     */
    console: any
    /**
     * @type {Map}
     */
    timers: Map<any, any>
    /**
     * @type {Map}
     */
    counters: Map<any, any>
    /**
     * @type {function?}
     */
    postMessage: Function | null
    write(destination: any, ...args: any[]): any
    assert(assertion: any, ...args: any[]): void
    clear(): void
    count(label?: string): void
    countReset(label?: string): void
    debug(...args: any[]): void
    dir(...args: any[]): void
    dirxml(...args: any[]): void
    error(...args: any[]): void
    info(...args: any[]): void
    log(...args: any[]): void
    table(...args: any[]): any
    time(label?: string): void
    timeEnd(label?: string): void
    timeLog(label?: string): void
    trace(...objects: any[]): void
    warn(...args: any[]): void
  }
  const _default: Console & {
    Console: typeof Console
    globalConsole: globalThis.Console
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
