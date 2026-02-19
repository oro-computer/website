# `oro:dns`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:dns'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:dns
oro:dns/constants
oro:dns/index
oro:dns/promises
oro:dns/utils
```

### TypeScript declarations

<details>
<summary><code>oro:dns</code></summary>

```ts
declare module 'oro:dns' {
  export * from 'oro:dns/index'
  export default exports
  import * as exports from 'oro:dns/index'
}
```

</details>

<details>
<summary><code>oro:dns/constants</code></summary>

```ts
declare module 'oro:dns/constants' {
  export const ADDRCONFIG: 1024
  export const V4MAPPED: 2048
  export const ALL: 256
  export namespace constants {
    export { ADDRCONFIG }
    export { V4MAPPED }
    export { ALL }
  }
  export default constants
}
```

</details>

<details>
<summary><code>oro:dns/index</code></summary>

```ts
declare module 'oro:dns/index' {
  /**
   * @typedef {object} LookupAddress
   * @property {string} address - Resolved IP address.
   * @property {4|6} family - Address family of the result.
   *
   * @typedef {object} LookupOptions
   * @property {0|4|6|'IPv4'|'IPv6'} [family=0] - Address family preference.
   * @property {number} [hints=0] - Optional getaddrinfo flags (combine dns.ADDRCONFIG, dns.V4MAPPED, dns.ALL).
   * @property {boolean} [all=false] - Return all resolved addresses if true.
   * @property {boolean} [verbatim=false] - Preserve the original address ordering.
   */
  /**
   * Resolves a host name (e.g. `example.org`) into the first found A (IPv4) or
   * AAAA (IPv6) record. All option properties are optional. If options is an
   * integer, then it must be 4 or 6 – if options is 0 or not provided, then IPv4
   * and IPv6 addresses are both returned if found.
   *
   * From the node.js website...
   *
   * > With the all option set to true, the arguments for callback change to (err,
   * addresses), with addresses being an array of objects with the properties
   * address and family.
   *
   * > On error, err is an Error object, where err.code is the error code. Keep in
   * mind that err.code will be set to 'ENOTFOUND' not only when the host name does
   * not exist but also when the lookup fails in other ways such as no available
   * file descriptors. dns.lookup() does not necessarily have anything to do with
   * the DNS protocol. The implementation uses an operating system facility that
   * can associate names with addresses and vice versa. This implementation can
   * have subtle but important consequences on the behavior of any Node.js program.
   * Please take some time to consult the Implementation considerations section
   * before using dns.lookup().
   *
   * @see {@link https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback}
   * @param {string} hostname - The host name to resolve.
   * @param {(LookupOptions|number|string)=} [options] - Lookup options or the record family.
   * @param {function(Error, string|LookupAddress[], 4|6=):void} cb - Invoked when the lookup completes.
   * @returns {void}
   */
  export function lookup(
    hostname: string,
    options?: (LookupOptions | number | string) | undefined,
    cb: (
      arg0: Error,
      arg1: string | LookupAddress[],
      arg2: (4 | 6) | undefined
    ) => void
  ): void
  export default exports
  export type LookupAddress = {
    /**
     * - Resolved IP address.
     */
    address: string
    /**
     * - Address family of the result.
     */
    family: 4 | 6
  }
  export type LookupOptions = {
    /**
     * - Address family preference.
     */
    family?: 0 | 4 | 6 | 'IPv4' | 'IPv6'
    /**
     * - Optional getaddrinfo flags (combine dns.ADDRCONFIG, dns.V4MAPPED, dns.ALL).
     */
    hints?: number
    /**
     * - Return all resolved addresses if true.
     */
    all?: boolean
    /**
     * - Preserve the original address ordering.
     */
    verbatim?: boolean
  }
  import * as promises from 'oro:dns/promises'
  import { ADDRCONFIG } from 'oro:dns/constants'
  import { ALL } from 'oro:dns/constants'
  import { V4MAPPED } from 'oro:dns/constants'
  import { constants } from 'oro:dns/constants'
  import * as exports from 'oro:dns/index'
  export { promises, ADDRCONFIG, ALL, V4MAPPED, constants }
}
```

</details>

<details>
<summary><code>oro:dns/promises</code></summary>

```ts
declare module 'oro:dns/promises' {
  /**
   * @async
   * @typedef {import('./index.js').LookupAddress} LookupAddress
   * @typedef {import('./index.js').LookupOptions} LookupOptions
   *
   * @async
   * @see {@link https://nodejs.org/api/dns.html#dnspromiseslookuphostname-options}
   * @param {string} hostname - The host name to resolve.
   * @param {(LookupOptions|number|string)=} [opts] - Lookup options or family.
   * @returns {Promise<LookupAddress|LookupAddress[]>}
   */
  export function lookup(
    hostname: string,
    opts?: (LookupOptions | number | string) | undefined
  ): Promise<LookupAddress | LookupAddress[]>
  export default exports
  export type LookupAddress = import('oro:dns/index').LookupAddress
  export type LookupOptions = import('oro:dns/index').LookupOptions
  import * as exports from 'oro:dns/promises'
  import { ADDRCONFIG } from 'oro:dns/constants'
  import { ALL } from 'oro:dns/constants'
  import { V4MAPPED } from 'oro:dns/constants'
  import { constants } from 'oro:dns/constants'
  export { ADDRCONFIG, ALL, V4MAPPED, constants }
}
```

</details>

<details>
<summary><code>oro:dns/utils</code></summary>

```ts
declare module 'oro:dns/utils' {
  /**
   * Normalizes options for dns.lookup style APIs.
   * @param {(number|string|object)=} input
   * @returns {{ family: 0|4|6, hints: number, all: boolean, verbatim: boolean }}
   * @ignore
   */
  export function normalizeLookupOptions(
    input?: (number | string | object) | undefined
  ): {
    family: 0 | 4 | 6
    hints: number
    all: boolean
    verbatim: boolean
  }
  /**
   * Creates a Node.js compatible getaddrinfo error.
   * @param {string} hostname
   * @param {Error|object|null} cause
   * @returns {Error}
   * @ignore
   */
  export function createLookupError(
    hostname: string,
    cause: Error | object | null
  ): Error
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
