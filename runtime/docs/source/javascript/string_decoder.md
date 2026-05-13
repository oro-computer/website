# `oro:string_decoder`

`oro:string_decoder` decodes split byte streams into text without corrupting multibyte characters.

## Examples

Decode chunked UTF-8 data without splitting multibyte characters:

```js
import Buffer from 'oro:buffer'
import StringDecoder from 'oro:string_decoder'

const decoder = new StringDecoder('utf8')
const chunks = [Buffer.from([0xe2, 0x82]), Buffer.from([0xac])]

console.log(decoder.write(chunks[0]))
console.log(decoder.write(chunks[1]))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:string_decoder
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:string_decoder`

```ts
declare module "oro:string_decoder" {
    export function StringDecoder(encoding: any): void;
    export class StringDecoder {
        constructor(encoding: any);
        encoding: any;
        text: typeof utf16Text | typeof base64Text;
        end: typeof utf16End | typeof base64End | typeof simpleEnd;
        fillLast: typeof utf8FillLast;
        write: typeof simpleWrite;
        lastNeed: number;
        lastTotal: number;
        lastChar: Uint8Array<any>;
    }
    export default StringDecoder;
    function utf16Text(buf: any, i: any): any;
    class utf16Text {
        constructor(buf: any, i: any);
        lastNeed: number;
        lastTotal: number;
    }
    function base64Text(buf: any, i: any): any;
    class base64Text {
        constructor(buf: any, i: any);
        lastNeed: number;
        lastTotal: number;
    }
    function utf16End(buf: any): any;
    function base64End(buf: any): any;
    function simpleEnd(buf: any): any;
    function utf8FillLast(buf: any): any;
    function simpleWrite(buf: any): any;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
