# `oro:cookies`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:cookies'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:cookies
```

### TypeScript declarations

<details>
<summary><code>oro:cookies</code></summary>

```ts
declare module 'oro:cookies' {
  /**
   * Get cookies for a URL as a `Cookie` header value ("a=b; c=d").
   *
   * @param {string} url
   * @returns {Promise<{ value: string }>}
   */
  export function get(url: string): Promise<{
    value: string
  }>
  /**
   * Set a cookie for a URL from a `Set-Cookie` header value.
   *
   * @param {string} url
   * @param {string} cookie - a Set-Cookie header value
   * @returns {Promise<{ ok: boolean }>}
   */
  export function set(
    url: string,
    cookie: string
  ): Promise<{
    ok: boolean
  }>
  /**
   * Remove cookies matching `name` for a URL.
   *
   * @param {string} url
   * @param {string} name
   * @returns {Promise<{ ok: boolean }>}
   */
  export function remove(
    url: string,
    name: string
  ): Promise<{
    ok: boolean
  }>
  /**
   * Clear all cookies in the current WebView data store.
   *
   * @returns {Promise<{ ok: boolean }>}
   */
  export function clear(): Promise<{
    ok: boolean
  }>
  namespace _default {
    export { get }
    export { set }
    export { remove }
    export { clear }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
