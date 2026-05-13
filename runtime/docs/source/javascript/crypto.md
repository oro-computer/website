# `oro:crypto`

`oro:crypto` exposes hashing, random bytes, and bundled sodium-backed helpers.

## Related guides

- [Secure storage and sessions](?p=guides/secure-storage-and-sessions)

## Examples

Generate random bytes and hash them with the runtime digest helper:

```js
import { randomBytes, createDigest, murmur3 } from 'oro:crypto'

const nonce = randomBytes(16)
const digest = await createDigest('sha256', nonce)

console.log(digest.toString('hex'))
console.log(murmur3('hello-runtime'))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:crypto
oro:crypto/sodium
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:crypto`

```ts
declare module "oro:crypto" {
    /**
     * Generate cryptographically strong random values into the `buffer`
     * @param {TypedArray} buffer
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
     * @return {TypedArray}
     */
    export function getRandomValues(buffer: TypedArray, ...args: any[]): TypedArray;
    /**
     * Generate a random 64-bit number.
     * @returns {BigInt} - A random 64-bit number.
     */
    export function rand64(): bigint;
    /**
     * Generate `size` random bytes.
     * @param {number} size - The number of bytes to generate. The size must not be larger than 2**31 - 1.
     * @returns {Buffer} - A `Buffer` containing random bytes.
     */
    export function randomBytes(size: number): Buffer;
    /**
     * @param {string} algorithm - `SHA-1` | `SHA-256` | `SHA-384` | `SHA-512`
     * @param {Buffer | TypedArray | DataView} message - A `Buffer`, TypedArray, or DataView.
     * @returns {Promise<Buffer>} - A promise that resolves to a `Buffer` containing the digest.
     */
    export function createDigest(algorithm: string, buf: any): Promise<Buffer>;
    /**
     * A murmur3 hash implementation based on https://github.com/jwerle/murmurhash.c
     * that works on strings and `ArrayBuffer` views (typed arrays)
     * @param {string|Uint8Array|ArrayBuffer} value
     * @param {number=} [seed = 0]
     * @return {number}
     */
    export function murmur3(value: string | Uint8Array | ArrayBuffer, seed?: number | undefined): number;
    /**
     * @typedef {Uint8Array|Int8Array} TypedArray
     */
    /**
     * WebCrypto API
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto}
     */
    export let webcrypto: any;
    /**
     * A promise that resolves when all internals to be loaded/ready.
     * @type {Promise}
     */
    export const ready: Promise<any>;
    /**
     * Maximum total size of random bytes per page
     */
    export const RANDOM_BYTES_QUOTA: number;
    /**
     * Maximum total size for random bytes.
     */
    export const MAX_RANDOM_BYTES: 281474976710655;
    /**
     * Maximum total amount of allocated per page of bytes (max/quota)
     */
    export const MAX_RANDOM_BYTES_PAGES: number;
    export default exports;
    export type TypedArray = Uint8Array | Int8Array;
    import { Buffer } from "oro:buffer";
    export namespace sodium {
        let ready: Promise<any>;
    }
    import * as exports from "oro:crypto";

}
```

#### `oro:crypto/sodium`

```ts
declare module "oro:crypto/sodium" {
    export {};
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
