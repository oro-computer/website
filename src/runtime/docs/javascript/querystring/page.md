---
layout: "docs"
description: "oro:querystring parses and serializes URL query strings."
docsCollection: "runtime"
section: "javascript"
order: 108
sourcePath: "javascript/querystring.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:querystring`](/runtime/docs/javascript/querystring/)

[`oro:querystring`](/runtime/docs/javascript/querystring/) parses and serializes URL query strings.

## Examples

Parse and serialize query strings with the Node-compatible helpers:

```js
import { stringify, parse } from 'oro:querystring'

const query = stringify({ q: 'oro runtime', page: 2 })

console.log(query)
console.log(parse(query))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:querystring
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:querystring`](/runtime/docs/javascript/querystring/)

```ts
declare module "oro:querystring" {
    export function unescapeBuffer(s: any, decodeSpaces: any): any;
    /**
     * Decodes percent escapes, replacing malformed UTF-8 sequences.
     * @param {string} s
     * @param {boolean} [decodeSpaces]
     * @returns {string}
     */
    export function unescape(s: string, decodeSpaces?: boolean): string;
    export function escape(str: any): any;
    export function stringify(obj: any, sep: any, eq: any, options: any): string;
    /**
     * @typedef {object} ParseOptions
     * @property {number} [maxKeys]
     * @property {(value: string) => string} [decodeURIComponent]
     */
    /**
     * Parses key/value pairs separated by the supplied delimiters.
     * @param {string} qs
     * @param {string} [sep]
     * @param {string} [eq]
     * @param {ParseOptions} [options]
     * @returns {Record<string, string|string[]>}
     */
    export function parse(qs: string, sep?: string, eq?: string, options?: ParseOptions): Record<string, string | string[]>;
    /**
     * @typedef {object} ParseOptions
     * @property {number} [maxKeys]
     * @property {(value: string) => string} [decodeURIComponent]
     */
    /**
     * Parses key/value pairs separated by the supplied delimiters.
     * @param {string} qs
     * @param {string} [sep]
     * @param {string} [eq]
     * @param {ParseOptions} [options]
     * @returns {Record<string, string|string[]>}
     */
    export function decode(qs: string, sep?: string, eq?: string, options?: ParseOptions): Record<string, string | string[]>;
    export function encode(obj: any, sep: any, eq: any, options: any): string;
    namespace _default {
        export { decode };
        export { encode };
        export { parse };
        export { stringify };
        export { escape };
        export { unescape };
    }
    export default _default;
    export type ParseOptions = {
        maxKeys?: number;
        decodeURIComponent?: (value: string) => string;
    };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
