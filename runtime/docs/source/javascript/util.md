# `oro:util`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:util'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:util
oro:util/types
```

### TypeScript declarations

<details>
<summary><code>oro:util</code></summary>

```ts
declare module 'oro:util' {
  export function debug(section: any): {
    (...args: any[]): void
    enabled: boolean
  }
  export function hasOwnProperty(object: any, property: any): any
  export function isDate(object: any): boolean
  export function isTypedArray(object: any): boolean
  export function isArrayLike(input: any): boolean
  export function isError(object: any): boolean
  export function isSymbol(value: any): value is symbol
  export function isNumber(value: any): boolean
  export function isBoolean(value: any): boolean
  export function isArrayBufferView(buf: any): boolean
  export function isAsyncFunction(object: any): boolean
  export function isArgumentsObject(object: any): boolean
  export function isEmptyObject(object: any): boolean
  export function isObject(object: any): boolean
  export function isUndefined(value: any): boolean
  export function isNull(value: any): boolean
  export function isNullOrUndefined(value: any): boolean
  export function isPrimitive(value: any): boolean
  export function isRegExp(value: any): boolean
  export function isPlainObject(object: any): boolean
  export function isArrayBuffer(object: any): boolean
  export function isBufferLike(object: any): boolean
  export function isFunction(value: any): boolean
  export function isErrorLike(error: any): boolean
  export function isClass(value: any): boolean
  export function isBuffer(value: any): boolean
  export function isPromiseLike(object: any): boolean
  export function toString(object: any): any
  export function toBuffer(object: any, encoding?: any): any
  export function toProperCase(string: any): any
  export function splitBuffer(buffer: any, highWaterMark: any): any[]
  export function clamp(value: any, min: any, max: any): number
  export function promisify(original: any): any
  export function inspect(value: any, options: any): any
  export namespace inspect {
    let ignore: symbol
    let custom: symbol
  }
  export function format(format: any, ...args: any[]): string
  export function parseJSON(string: any): any
  export function parseHeaders(headers: any): string[][]
  export function noop(): void
  export function isValidPercentageValue(input: any): boolean
  export function compareBuffers(a: any, b: any): any
  export function inherits(Constructor: any, Super: any): void
  /**
   * @ignore
   * @param {string} source
   * @return {boolean}
   */
  export function isESMSource(source: string): boolean
  export function deprecate(..._args: any[]): void
  export const TextDecoder: {
    new (label?: string, options?: TextDecoderOptions): TextDecoder
    prototype: TextDecoder
  }
  export const TextEncoder: {
    new (): TextEncoder
    prototype: TextEncoder
  }
  export const isArray: any
  export const inspectSymbols: symbol[]
  export class IllegalConstructor {}
  export const ESM_TEST_REGEX: RegExp
  export default exports
  import types from 'oro:util/types'
  import { MIMEType } from 'oro:mime/type'
  import { MIMEParams } from 'oro:mime/params'
  import * as exports from 'oro:util'
  export { types, MIMEType, MIMEParams }
}
```

</details>

<details>
<summary><code>oro:util/types</code></summary>

```ts
declare module 'oro:util/types' {
  /**
   * Returns `true` if input is a plan `Object` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isPlainObject(input: any): boolean
  /**
   * Returns `true` if input is an `AsyncFunction`
   * @param {any} input
   * @return {boolean}
   */
  export function isAsyncFunction(input: any): boolean
  /**
   * Returns `true` if input is an `Function`
   * @param {any} input
   * @return {boolean}
   */
  export function isFunction(input: any): boolean
  /**
   * Returns `true` if input is an `AsyncFunction` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isAsyncFunctionObject(input: any): boolean
  /**
   * Returns `true` if input is an `Function` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isFunctionObject(input: any): boolean
  /**
   * Always returns `false`.
   * @param {any} input
   * @return {boolean}
   */
  export function isExternal(_input: any): boolean
  /**
   * Returns `true` if input is a `Date` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isDate(input: any): boolean
  /**
   * Returns `true` if input is an `arguments` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isArgumentsObject(input: any): boolean
  /**
   * Returns `true` if input is a `BigInt` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isBigIntObject(input: any): boolean
  /**
   * Returns `true` if input is a `Boolean` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isBooleanObject(input: any): boolean
  /**
   * Returns `true` if input is a `Number` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isNumberObject(input: any): boolean
  /**
   * Returns `true` if input is a `String` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isStringObject(input: any): boolean
  /**
   * Returns `true` if input is a `Symbol` object.
   * @param {any} input
   * @return {boolean}
   */
  export function isSymbolObject(input: any): boolean
  /**
   * Returns `true` if input is native `Error` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isNativeError(input: any): boolean
  /**
   * Returns `true` if input is a `RegExp` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isRegExp(input: any): boolean
  /**
   * Returns `true` if input is a `GeneratorFunction`.
   * @param {any} input
   * @return {boolean}
   */
  export function isGeneratorFunction(input: any): boolean
  /**
   * Returns `true` if input is an `AsyncGeneratorFunction`.
   * @param {any} input
   * @return {boolean}
   */
  export function isAsyncGeneratorFunction(input: any): boolean
  /**
   * Returns `true` if input is an instance of a `Generator`.
   * @param {any} input
   * @return {boolean}
   */
  export function isGeneratorObject(input: any): boolean
  /**
   * Returns `true` if input is a `Promise` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isPromise(input: any): boolean
  /**
   * Returns `true` if input is a `Map` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isMap(input: any): boolean
  /**
   * Returns `true` if input is a `Set` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isSet(input: any): boolean
  /**
   * Returns `true` if input is an instance of an `Iterator`.
   * @param {any} input
   * @return {boolean}
   */
  export function isIterator(input: any): boolean
  /**
   * Returns `true` if input is an instance of an `AsyncIterator`.
   * @param {any} input
   * @return {boolean}
   */
  export function isAsyncIterator(input: any): boolean
  /**
   * Returns `true` if input is an instance of a `MapIterator`.
   * @param {any} input
   * @return {boolean}
   */
  export function isMapIterator(input: any): boolean
  /**
   * Returns `true` if input is an instance of a `SetIterator`.
   * @param {any} input
   * @return {boolean}
   */
  export function isSetIterator(input: any): boolean
  /**
   * Returns `true` if input is a `WeakMap` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isWeakMap(input: any): boolean
  /**
   * Returns `true` if input is a `WeakSet` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isWeakSet(input: any): boolean
  /**
   * Returns `true` if input is an `ArrayBuffer` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isArrayBuffer(input: any): boolean
  /**
   * Returns `true` if input is an `DataView` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isDataView(input: any): boolean
  /**
   * Returns `true` if input is a `SharedArrayBuffer`.
   * This will always return `false` if a `SharedArrayBuffer`
   * type is not available.
   * @param {any} input
   * @return {boolean}
   */
  export function isSharedArrayBuffer(input: any): boolean
  /**
   * Not supported. This function will return `false` always.
   * @param {any} input
   * @return {boolean}
   */
  export function isProxy(_input: any): boolean
  /**
   * Returns `true` if input looks like a module namespace object.
   * @param {any} input
   * @return {boolean}
   */
  export function isModuleNamespaceObject(input: any): boolean
  /**
   * Returns `true` if input is an `ArrayBuffer` of `SharedArrayBuffer`.
   * @param {any} input
   * @return {boolean}
   */
  export function isAnyArrayBuffer(input: any): boolean
  /**
   * Returns `true` if input is a "boxed" primitive.
   * @param {any} input
   * @return {boolean}
   */
  export function isBoxedPrimitive(input: any): boolean
  /**
   * Returns `true` if input is an `ArrayBuffer` view.
   * @param {any} input
   * @return {boolean}
   */
  export function isArrayBufferView(input: any): boolean
  /**
   * Returns `true` if input is a `TypedArray` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isTypedArray(input: any): boolean
  /**
   * Returns `true` if input is an `Uint8Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isUint8Array(input: any): boolean
  /**
   * Returns `true` if input is an `Uint8ClampedArray` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isUint8ClampedArray(input: any): boolean
  /**
   * Returns `true` if input is an `Uint16Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isUint16Array(input: any): boolean
  /**
   * Returns `true` if input is an `Uint32Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isUint32Array(input: any): boolean
  /**
   * Returns `true` if input is an Int8Array`` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isInt8Array(input: any): boolean
  /**
   * Returns `true` if input is an `Int16Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isInt16Array(input: any): boolean
  /**
   * Returns `true` if input is an `Int32Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isInt32Array(input: any): boolean
  /**
   * Returns `true` if input is an `Float32Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isFloat32Array(input: any): boolean
  /**
   * Returns `true` if input is an `Float64Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isFloat64Array(input: any): boolean
  /**
   * Returns `true` if input is an `BigInt64Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isBigInt64Array(input: any): boolean
  /**
   * Returns `true` if input is an `BigUint64Array` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isBigUint64Array(input: any): boolean
  /**
   * @ignore
   * @param {any} input
   * @return {boolean}
   */
  export function isKeyObject(_input: any): boolean
  /**
   * Returns `true` if input is a `CryptoKey` instance.
   * @param {any} input
   * @return {boolean}
   */
  export function isCryptoKey(_input: any): boolean
  /**
   * Returns `true` if input is an `Array`.
   * @param {any} input
   * @return {boolean}
   */
  export const isArray: any
  export default exports
  import * as exports from 'oro:util/types'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
