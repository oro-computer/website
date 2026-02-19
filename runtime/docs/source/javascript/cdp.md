# `oro:cdp`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:cdp'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:cdp
```

### TypeScript declarations

<details>
<summary><code>oro:cdp</code></summary>

```ts
declare module 'oro:cdp' {
  /**
   * @typedef {object} CDPListenOptions
   * @property {string} [hostname='127.0.0.1'] - Bind address (defaults to loopback).
   * @property {number} [port=0] - Port to listen on. Use `0` for a random port.
   */
  /**
   * @typedef {object} CDPStatus
   * @property {boolean} listening
   * @property {string} hostname
   * @property {number} port
   * @property {string} browserId
   * @property {string} wsEndpoint
   * @property {string} httpEndpoint
   */
  /**
   * Starts the runtime CDP (Chrome DevTools Protocol) server.
   *
   * This exposes Chromium-style endpoints such as:
   * - `GET /json/version`
   * - `ws://<hostname>:<port>/devtools/browser/<browserId>`
   *
   * @param {CDPListenOptions} [options]
   * @returns {Promise<CDPStatus>}
   */
  export function listen(options?: CDPListenOptions): Promise<CDPStatus>
  /**
   * Stops the runtime CDP server.
   * @returns {Promise<void>}
   */
  export function close(): Promise<void>
  /**
   * Gets the current CDP server status.
   * @returns {Promise<CDPStatus>}
   */
  export function status(): Promise<CDPStatus>
  namespace _default {
    export { listen }
    export { close }
    export { status }
  }
  export default _default
  export type CDPListenOptions = {
    /**
     * - Bind address (defaults to loopback).
     */
    hostname?: string
    /**
     * - Port to listen on. Use `0` for a random port.
     */
    port?: number
  }
  export type CDPStatus = {
    listening: boolean
    hostname: string
    port: number
    browserId: string
    wsEndpoint: string
    httpEndpoint: string
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
