# `oro:fetch`

`oro:fetch` exposes the runtime fetch stack and standard request/response primitives.

## Related guides

- [Calling HTTP APIs](?p=guides/calling-http-apis)
- [Offline-first with service workers](?p=guides/offline-first-with-service-workers)

## Examples

Use the runtime fetch stack exactly like standard web fetch:

```js
import fetch from 'oro:fetch'

const response = await fetch('https://example.com/api/status')
const data = await response.json()

console.log(data)
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:fetch
oro:fetch/fetch
oro:fetch/index
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:fetch`

```ts
declare module "oro:fetch" {
    export * from "oro:fetch/index";
    export default fetch;
    import fetch from "oro:fetch/index";
}
```

#### `oro:fetch/fetch`

```ts
declare module "oro:fetch/fetch" {
    export function Headers(headers: any): void;
    export class Headers {
        constructor(headers: any);
        map: {};
        append(name: any, value: any): void;
        delete(name: any): void;
        get(name: any): any;
        has(name: any): boolean;
        set(name: any, value: any): void;
        forEach(callback: any, thisArg: any): void;
        keys(): {
            next: () => {
                done: boolean;
                value: any;
            };
        };
        values(): {
            next: () => {
                done: boolean;
                value: any;
            };
        };
        entries(): {
            next: () => {
                done: boolean;
                value: any;
            };
        };
    }
    export function Request(input: any, options: any, xhr: any): void;
    export class Request {
        constructor(input: any, options: any, xhr: any);
        url: string;
        credentials: any;
        headers: Headers;
        method: any;
        mode: any;
        signal: any;
        referrer: any;
        clone(): Request;
    }
    export function Response(bodyInit: any, options: any, xhr: any): void;
    export class Response {
        constructor(bodyInit: any, options: any, xhr: any);
        type: string;
        status: any;
        ok: boolean;
        statusText: string;
        headers: Headers;
        url: any;
        clone(): Response;
    }
    export namespace Response {
        function error(): Response;
        function redirect(url: any, status: any): Response;
    }
    export function fetch(input: any, init: any): Promise<any>;
    export class DOMException {
        private constructor();
    }
    namespace _default {
        export { fetch };
        export { Headers };
        export { Request };
        export { Response };
    }
    export default _default;
}
```

#### `oro:fetch/index`

```ts
declare module "oro:fetch/index" {
    export default fetch;
    import { fetch } from "oro:fetch/fetch";
    import { Headers } from "oro:fetch/fetch";
    import { Request } from "oro:fetch/fetch";
    import { Response } from "oro:fetch/fetch";
    export { fetch, Headers, Request, Response };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
