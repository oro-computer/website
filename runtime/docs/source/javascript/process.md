# `oro:process`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:process'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:process
oro:process/signal
```

### TypeScript declarations

<details>
<summary><code>oro:process</code></summary>

```ts
declare module 'oro:process' {
  /**
   * Adds callback to the 'nextTick' queue.
   * @param {Function} callback
   */
  export function nextTick(callback: Function, ...args: any[]): void
  /**
   * Computed high resolution time as a `BigInt`.
   * @param {Array<number>?} [time]
   * @return {bigint}
   */
  export function hrtime(time?: Array<number> | null): bigint
  export namespace hrtime {
    function bigint(): any
  }
  /**
   * @param {number=} [code=0] - The exit code. Default: 0.
   */
  export function exit(code?: number | undefined): Promise<void>
  /**
   * Returns an object describing the memory usage of the Node.js process measured in bytes.
   * @returns {Object}
   */
  export function memoryUsage(): any
  export namespace memoryUsage {
    function rss(): any
  }
  /**
   * @typedef {Object} ProcessVersionsMap
   * @property {string} socket - Legacy `process.versions.socket` identifier (frozen at Oro 0.6.0).
   * @property {string} oro - Current Oro Runtime semantic version.
   * @property {string} [uv]
   * @property {string} [llama]
   * @property {string} [whisper]
   * @property {string} [iroh]
   * @property {string} [sqlite]
   * @property {string} [libusb]
   * @property {string} [libsodium]
   * @property {string} [mbedtls]
   * @property {string} [cpp_httplib]
   * @property {string} [nlohmann_json]
   */
  export class ProcessEnvironmentEvent extends Event {
    constructor(type: any, key: any, value: any)
    key: any
    value: any
  }
  export class ProcessEnvironment extends EventTarget {
    get [Symbol.toStringTag](): string
  }
  /**
   * Emitted when an environment variable is set.
   * @event ProcessEnvironment#set
   * @type {{ key: string, value: any }}
   */
  /**
   * Emitted when an environment variable is deleted.
   * @event ProcessEnvironment#delete
   * @type {{ key: string, value: any }}
   */
  /**
   * Emitted when an environment variable is changed (set or delete).
   * @event ProcessEnvironment#change
   * @type {{ key: string, value: any }}
   */
  export const env: {
    key: string
    value: any
  }
  export default process
  export type ProcessVersionsMap = {
    /**
     * - Legacy `process.versions.socket` identifier (frozen at Oro 0.6.0).
     */
    socket: string
    /**
     * - Current Oro Runtime semantic version.
     */
    oro: string
    uv?: string
    llama?: string
    whisper?: string
    iroh?: string
    sqlite?: string
    libusb?: string
    libsodium?: string
    mbedtls?: string
    cpp_httplib?: string
    nlohmann_json?: string
  }
  const process: any
}
```

</details>

<details>
<summary><code>oro:process/signal</code></summary>

```ts
declare module 'oro:process/signal' {
  /**
   * Converts an `signal` code to its corresponding string message.
   * @param {import('./os/constants.js').signal} {code}
   * @return {string}
   */
  export function toString(code: any): string
  /**
   * Gets the code for a given 'signal' name.
   * @param {string|number} name
   * @return {signal}
   */
  export function getCode(name: string | number): signal
  /**
   * Gets the name for a given 'signal' code
   * @return {string}
   * @param {string|number} code
   */
  export function getName(code: string | number): string
  /**
   * Gets the message for a 'signal' code.
   * @param {number|string} code
   * @return {string}
   */
  export function getMessage(code: number | string): string
  /**
   * Add a signal event listener.
   * @param {string|number} signal
   * @param {function(SignalEvent)} callback
   * @param {{ once?: boolean }=} [options]
   */
  export function addEventListener(
    signalName: any,
    callback: (arg0: SignalEvent) => any,
    options?:
      | {
          once?: boolean
        }
      | undefined
  ): void
  /**
   * Remove a signal event listener.
   * @param {string|number} signal
   * @param {function(SignalEvent)} callback
   * @param {{ once?: boolean }=} [options]
   */
  export function removeEventListener(
    signalName: any,
    callback: (arg0: SignalEvent) => any,
    options?:
      | {
          once?: boolean
        }
      | undefined
  ): void
  export { constants }
  export const channel: BroadcastChannel
  export const SIGHUP: any
  export const SIGINT: any
  export const SIGQUIT: any
  export const SIGILL: any
  export const SIGTRAP: any
  export const SIGABRT: any
  export const SIGIOT: any
  export const SIGBUS: any
  export const SIGFPE: any
  export const SIGKILL: any
  export const SIGUSR1: any
  export const SIGSEGV: any
  export const SIGUSR2: any
  export const SIGPIPE: any
  export const SIGALRM: any
  export const SIGTERM: any
  export const SIGCHLD: any
  export const SIGCONT: any
  export const SIGSTOP: any
  export const SIGTSTP: any
  export const SIGTTIN: any
  export const SIGTTOU: any
  export const SIGURG: any
  export const SIGXCPU: any
  export const SIGXFSZ: any
  export const SIGVTALRM: any
  export const SIGPROF: any
  export const SIGWINCH: any
  export const SIGIO: any
  export const SIGINFO: any
  export const SIGSYS: any
  export const strings: {
    [SIGHUP]: string
    [SIGINT]: string
    [SIGQUIT]: string
    [SIGILL]: string
    [SIGTRAP]: string
    [SIGABRT]: string
    [SIGIOT]: string
    [SIGBUS]: string
    [SIGFPE]: string
    [SIGKILL]: string
    [SIGUSR1]: string
    [SIGSEGV]: string
    [SIGUSR2]: string
    [SIGPIPE]: string
    [SIGALRM]: string
    [SIGTERM]: string
    [SIGCHLD]: string
    [SIGCONT]: string
    [SIGSTOP]: string
    [SIGTSTP]: string
    [SIGTTIN]: string
    [SIGTTOU]: string
    [SIGURG]: string
    [SIGXCPU]: string
    [SIGXFSZ]: string
    [SIGVTALRM]: string
    [SIGPROF]: string
    [SIGWINCH]: string
    [SIGIO]: string
    [SIGINFO]: string
    [SIGSYS]: string
  }
  namespace _default {
    export { addEventListener }
    export { removeEventListener }
    export { constants }
    export { channel }
    export { strings }
    export { toString }
    export { getName }
    export { getCode }
    export { getMessage }
    export { SIGHUP }
    export { SIGINT }
    export { SIGQUIT }
    export { SIGILL }
    export { SIGTRAP }
    export { SIGABRT }
    export { SIGIOT }
    export { SIGBUS }
    export { SIGFPE }
    export { SIGKILL }
    export { SIGUSR1 }
    export { SIGSEGV }
    export { SIGUSR2 }
    export { SIGPIPE }
    export { SIGALRM }
    export { SIGTERM }
    export { SIGCHLD }
    export { SIGCONT }
    export { SIGSTOP }
    export { SIGTSTP }
    export { SIGTTIN }
    export { SIGTTOU }
    export { SIGURG }
    export { SIGXCPU }
    export { SIGXFSZ }
    export { SIGVTALRM }
    export { SIGPROF }
    export { SIGWINCH }
    export { SIGIO }
    export { SIGINFO }
    export { SIGSYS }
  }
  export default _default
  export type signal = any
  import { SignalEvent } from 'oro:internal/events'
  import { signal as constants } from 'oro:os/constants'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
