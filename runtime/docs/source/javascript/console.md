# `oro:console`

`oro:console` exposes the runtime console implementation and patch helpers.

## Related guides

- [Testing and diagnostics](?p=guides/testing-and-diagnostics)

## Examples

Patch the global console so application logs use the runtime console implementation:

```js
import { patchGlobalConsole } from 'oro:console'

patchGlobalConsole(globalThis.console)

console.info('runtime console is active')
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:console
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:console`

```ts
declare module "oro:console" {
    export function patchGlobalConsole(globalConsole: any, options?: {}): any;
    export const globalConsole: globalThis.Console;
    export class Console {
        /**
         * @ignore
         */
        constructor(options: any);
        /**
         * @type {import('dom').Console}
         */
        console: any;
        /**
         * @type {Map}
         */
        timers: Map<any, any>;
        /**
         * @type {Map}
         */
        counters: Map<any, any>;
        /**
         * @type {function?}
         */
        postMessage: Function | null;
        write(destination: any, ...args: any[]): any;
        assert(assertion: any, ...args: any[]): void;
        clear(): void;
        count(label?: string): void;
        countReset(label?: string): void;
        debug(...args: any[]): void;
        dir(...args: any[]): void;
        dirxml(...args: any[]): void;
        error(...args: any[]): void;
        info(...args: any[]): void;
        log(...args: any[]): void;
        table(...args: any[]): any;
        time(label?: string): void;
        timeEnd(label?: string): void;
        timeLog(label?: string): void;
        trace(...objects: any[]): void;
        warn(...args: any[]): void;
    }
    const _default: Console & {
        Console: typeof Console;
        globalConsole: globalThis.Console;
    };
    export default _default;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
