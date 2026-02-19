# `oro:querystring`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:querystring'

console.log(Object.keys(api))
```

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
declare module 'oro:querystring' {
  export function unescapeBuffer(s: any, decodeSpaces: any): any
  export function unescape(s: any, decodeSpaces: any): any
  export function escape(str: any): any
  export function stringify(obj: any, sep: any, eq: any, options: any): string
  export function parse(qs: any, sep: any, eq: any, options: any): {}
  export function decode(qs: any, sep: any, eq: any, options: any): {}
  export function encode(obj: any, sep: any, eq: any, options: any): string
  namespace _default {
    export { decode }
    export { encode }
    export { parse }
    export { stringify }
    export { escape }
    export { unescape }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
