# `oro:secure-storage`

`oro:secure-storage` stores secrets scoped by origin (for example tokens, credentials, API keys).

## Import

```js
import * as secureStorage from 'oro:secure-storage'
```

## Store and retrieve a token

```js
import * as secureStorage from 'oro:secure-storage'

await secureStorage.setItem('authToken', 'secret-token-value')
const token = await secureStorage.getItem('authToken')
```

## Scopes

By default, secure storage uses `location.origin` as the scope (when available). You can override the scope explicitly:

```js
await secureStorage.setItem('key', 'value', { scope: 'https://example.com' })
```

## Encodings and binary values

For strings, `encoding` may be `utf8` (default), `base64`, or `hex`.

For binary values, pass a `Uint8Array`, `ArrayBuffer`, or `Buffer`. When reading binary values, use `encoding: 'buffer'`
to get a `Uint8Array` back.

```js
const bytes = new Uint8Array([1, 2, 3])
await secureStorage.setItem('blob', bytes)

const restored = await secureStorage.getItem('blob', { encoding: 'buffer' })
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:secure-storage
```

### TypeScript declarations

<details>
<summary><code>oro:secure-storage</code></summary>

```ts
declare module 'oro:secure-storage' {
  /**
   * Stores a value inside secure storage for the given key.
   * @param {string} key
   * @param {string|Uint8Array|ArrayBuffer|Buffer} value
   * @param {SetItemOptions} [options]
   * @returns {Promise<void>}
   */
  export function setItem(
    key: string,
    value: string | Uint8Array | ArrayBuffer | Buffer,
    options?: SetItemOptions
  ): Promise<void>
  /**
   * Retrieves a previously stored value.
   * @param {string} key
   * @param {GetItemOptions} [options]
   * @returns {Promise<string|Uint8Array|null>}
   */
  export function getItem(
    key: string,
    options?: GetItemOptions
  ): Promise<string | Uint8Array | null>
  /**
   * Removes a single key from secure storage.
   * @param {string} key
   * @param {SecureStorageOptions} [options]
   * @returns {Promise<void>}
   */
  export function removeItem(
    key: string,
    options?: SecureStorageOptions
  ): Promise<void>
  /**
   * Clears all keys for the provided scope (or default scope).
   * @param {SecureStorageOptions} [options]
   * @returns {Promise<void>}
   */
  export function clear(options?: SecureStorageOptions): Promise<void>
  /**
   * Lists the stored keys for the provided scope.
   * @param {SecureStorageOptions} [options]
   * @returns {Promise<string[]>}
   */
  export function keys(options?: SecureStorageOptions): Promise<string[]>
  export default api
  export type SecureStorageOptions = {
    /**
     * Origin string identifying the storage namespace.
     */
    scope?: string | null
  }
  export type SetItemOptions = SecureStorageOptions & {
    encoding?: 'utf8' | 'base64' | 'hex'
  }
  export type GetItemOptions = SecureStorageOptions & {
    encoding?: 'utf8' | 'base64' | 'hex' | 'buffer'
  }
  export type SecureStorageModule = {
    setItem: typeof setItem
    getItem: typeof getItem
    removeItem: typeof removeItem
    clear: typeof clear
    keys: typeof keys
  }
  import { Buffer } from 'oro:buffer'
  /**
   * @typedef {Object} SecureStorageModule
   * @property {typeof setItem} setItem
   * @property {typeof getItem} getItem
   * @property {typeof removeItem} removeItem
   * @property {typeof clear} clear
   * @property {typeof keys} keys
   */
  /** @type {SecureStorageModule} */
  const api: SecureStorageModule
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
