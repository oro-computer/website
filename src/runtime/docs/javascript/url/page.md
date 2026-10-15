---
layout: "docs"
description: "oro:url exposes the WHATWG URL implementation used by the runtime."
docsCollection: "runtime"
section: "javascript"
order: 123
sourcePath: "javascript/url.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:url`](/runtime/docs/javascript/url/)

[`oro:url`](/runtime/docs/javascript/url/) exposes the WHATWG URL implementation used by the runtime.

## Examples

Use the WHATWG URL implementation for robust URL parsing:

```js
import URL from 'oro:url'

const url = new URL('https://oro.computer/docs?project=runtime')

console.log(url.pathname)
console.log(url.searchParams.get('project'))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:url
oro:url/index
oro:url/url/url
oro:url/urlpattern/urlpattern
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:url`](/runtime/docs/javascript/url/)

```ts
declare module "oro:url" {
    export * from "oro:url/index";
    export default URL;
    import URL from "oro:url/index";
}
```

#### `oro:url/index`

```ts
declare module "oro:url/index" {
    /**
     * @typedef {{ strict?: boolean }} URLParseOptions
     */
    /**
     * @typedef {object} ParsedURL
     * @property {string|null} protocol
     * @property {string|null} host
     * @property {string|null} hostname
     * @property {string|null} origin
     * @property {string|null} auth
     * @property {string|null} username
     * @property {string|null} password
     * @property {string|null} port
     * @property {string|null} pathname
     * @property {string|null} path
     * @property {string|null} search
     * @property {string|null} hash
     * @property {string} href
     * @property {URLSearchParams} searchParams
     * @property {string|Record<string, any>} [query]
     */
    /**
     * @typedef {Partial<ParsedURL>} URLFormatOptions
     */
    /**
     * Parse a URL-like input into a structured object.
     * @param {string} input
     * @param {boolean|URLParseOptions|null} [options]
     * @returns {ParsedURL|null}
     * - When `options === true`, includes a Node-compatible `query` object.
     * - When `options?.strict === true`, returns `null` if input cannot be parsed.
     *
     * Example:
     * ```js
     * parse('https://user:pass@example.com:8080/a/b?x=1#h')
     * // => {
     * //   protocol: 'https:', hostname: 'example.com', origin: 'https://example.com:8080',
     * //   username: 'user', password: 'pass', port: '8080', pathname: '/a/b',
     * //   search: '?x=1', hash: '#h', path: '/a/b', href: 'https://user:pass@example.com:8080/a/b?x=1#h',
     * //   auth: 'user:pass', searchParams: URLSearchParams, query: 'x=1'
     * // }
     * ```
     */
    export function parse(input: string, options?: boolean | URLParseOptions | null): ParsedURL | null;
    /**
     * Resolve a target URL/path `to` against a base `from`.
     * Mirrors Node.js `url.resolve()` semantics.
     *
     * Example:
     * ```js
     * resolve('http://example.com/a/b', '../c') // => 'http://example.com/c'
     * resolve('/a/b', 'c') // => '/a/c'
     * ```
     */
    export function resolve(from: any, to: any): any;
    /**
     * Format a URL from either a string or a partial object containing URL fields.
     * Returns an empty string if the input is invalid or insufficient.
     *
     * Example (object):
     * ```js
     * format({ protocol: 'https:', hostname: 'example.com', pathname: '/a/b' })
     * // => 'https://example.com/a/b'
     * ```
     *
     * Example (string):
     * ```js
     * format('https://example.com/a/b') // => 'https://example.com/a/b'
     * ```
     *
     * Notes
     * - When specifying `hostname` with an IPv6 literal, brackets are added automatically.
     *   Alternatively, you can pass `host` directly as `[2001:db8::1]:8080`.
     * @param {string|URLFormatOptions} input
     * @returns {string}
     */
    export function format(input: string | URLFormatOptions): string;
    export function fileURLToPath(url: any): any;
    /**
     * @type {Set & { handlers: Set<string> }}
     */
    export const protocols: Set<any> & {
        handlers: Set<string>;
    };
    export default URL;
    export type URLParseOptions = {
        strict?: boolean;
    };
    export type ParsedURL = {
        protocol: string | null;
        host: string | null;
        hostname: string | null;
        origin: string | null;
        auth: string | null;
        username: string | null;
        password: string | null;
        port: string | null;
        pathname: string | null;
        path: string | null;
        search: string | null;
        hash: string | null;
        href: string;
        searchParams: URLSearchParams;
        query?: string | Record<string, any>;
    };
    export type URLFormatOptions = Partial<ParsedURL>;
    export class URL {
        private constructor();
    }
    export const URLSearchParams: any;
    export const parseURL: any;
    import { URLPattern } from "oro:url/urlpattern/urlpattern";
    export { URLPattern };
}
```

#### `oro:url/url/url`

```ts
declare module "oro:url/url/url" {
    const _default: any;
    export default _default;
}
```

#### `oro:url/urlpattern/urlpattern`

```ts
declare module "oro:url/urlpattern/urlpattern" {
    export { me as URLPattern };
    var me: {
        new (t: {}, r: any, n: any): {
            "__#private@#i": any;
            "__#private@#n": {};
            "__#private@#t": {};
            "__#private@#e": {};
            "__#private@#s": {};
            "__#private@#l": boolean;
            test(t: {}, r: any): boolean;
            exec(t: {}, r: any): {
                inputs: any[] | {}[];
            };
            get protocol(): any;
            get username(): any;
            get password(): any;
            get hostname(): any;
            get port(): any;
            get pathname(): any;
            get search(): any;
            get hash(): any;
            get hasRegExpGroups(): boolean;
        };
        compareComponent(t: any, r: any, n: any): number;
    };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
