# `oro:string_decoder`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:string_decoder'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:string_decoder
```

### TypeScript declarations

<details>
<summary><code>oro:string_decoder</code></summary>

```ts
declare module 'oro:string_decoder' {
  export function StringDecoder(encoding: any): void
  export class StringDecoder {
    constructor(encoding: any)
    encoding: any
    text: typeof utf16Text | typeof base64Text
    end: typeof utf16End | typeof base64End | typeof simpleEnd
    fillLast: typeof utf8FillLast
    write: typeof simpleWrite
    lastNeed: number
    lastTotal: number
    lastChar: Uint8Array<any>
  }
  export default StringDecoder
  function utf16Text(buf: any, i: any): any
  class utf16Text {
    constructor(buf: any, i: any)
    lastNeed: number
    lastTotal: number
  }
  function base64Text(buf: any, i: any): any
  class base64Text {
    constructor(buf: any, i: any)
    lastNeed: number
    lastTotal: number
  }
  function utf16End(buf: any): any
  function base64End(buf: any): any
  function simpleEnd(buf: any): any
  function utf8FillLast(buf: any): any
  function simpleWrite(buf: any): any
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
