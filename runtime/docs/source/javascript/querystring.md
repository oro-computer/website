# `oro:querystring`

`oro:querystring` parses and serializes URL query strings.

## Examples

Parse and serialize query strings with the Node-compatible helpers:

```js
import { stringify, parse } from 'oro:querystring'

const query = stringify({ q: 'oro runtime', page: 2 })

console.log(query)
console.log(parse(query))
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:querystring
```

### TypeScript declarations

<details>
<summary><code>oro:querystring</code></summary>

```ts
declare module "oro:querystring" {
    export function unescapeBuffer(s: any, decodeSpaces: any): any;
    export function unescape(s: any, decodeSpaces: any): any;
    export function escape(str: any): any;
    export function stringify(obj: any, sep: any, eq: any, options: any): string;
    export function parse(qs: any, sep: any, eq: any, options: any): {};
    export function decode(qs: any, sep: any, eq: any, options: any): {};
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
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
