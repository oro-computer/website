# `oro:window`

`oro:window` provides the `ApplicationWindow` class and window-specific methods.

You typically do not import this module directly—get window instances via `oro:application`:

```js
import application from 'oro:application'

const current = await application.getCurrentWindow()
```

## Common operations

```js
const win = await application.getCurrentWindow()

await win.setTitle('Hello')
await win.setSize({ width: '80%', height: '80%' })
await win.navigate('index.html')
```

## Messaging

Send a message to another window:

```js
const peer = await application.getWindow(1, { max: false })
await peer.postMessage({ type: 'ping' })
```

Receive messages:

```js
globalThis.addEventListener('message', (event) => {
  const payload = event.detail ?? event.data
  console.log(payload)
})
```

## File pickers

`ApplicationWindow` exposes native file pickers:

```js
const win = await application.getCurrentWindow()

const paths = await win.showOpenFilePicker({ multiple: true })
console.log(paths)
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:window
oro:window/constants
oro:window/hotkey
```

### TypeScript declarations

<details>
<summary><code>oro:window</code></summary>

```ts
declare module 'oro:window' {
  /**
   * @param {string} url
   * @return {string}
   * @ignore
   */
  export function formatURL(url: string): string
  /**
   * @class ApplicationWindow
   * Represents a window in the application
   */
  export class ApplicationWindow extends EventTarget {
    static constants: typeof statuses
    static hotkey: import('oro:window/hotkey').Bindings
    constructor({ index, ...state }: { [x: string]: any; index: any })
    /**
     * The unique ID of this window.
     * @type {string}
     */
    get id(): string
    /**
     * Get the index of the window
     * @return {number} - the index of the window
     */
    get index(): number
    /**
     * @type {import('./window/hotkey.js').default}
     */
    get hotkey(): import('oro:window/hotkey').Bindings
    get state(): {
      [x: string]: any
    }
    /**
     * The broadcast channel for this window.
     * @type {BroadcastChannel}
     */
    get channel(): BroadcastChannel
    /**
     * Get the size of the window
     * @type {{ width: number, height: number }} - the size of the window
     */
    get size(): {
      width: number
      height: number
    }
    get location(): any
    /**
     * get  the position of the window
     * @type {{ x: number, y: number }} - the position of the window
     */
    get position(): {
      x: number
      y: number
    }
    /**
     * get  the title of the window
     * @type {string}
     */
    get title(): string
    /**
     * Indicates whether the window follows the host desktop theme.
     * @type {boolean}
     */
    get followSystemTheme(): boolean
    /**
     * Indicates whether the window prefers a dark theme when not
     * following the system theme.
     * @type {boolean}
     */
    get preferDarkTheme(): boolean
    /**
     * Whether the window is currently in dark mode.
     * @type {boolean}
     */
    get isDarkMode(): boolean
    /**
     * Current appearance metadata for the window.
     * @type {{ followSystemTheme: boolean, preferDarkTheme: boolean, isDarkMode: boolean, backgroundColor: { red: number, green: number, blue: number, alpha: number } }}
     */
    get appearance(): {
      followSystemTheme: boolean
      preferDarkTheme: boolean
      isDarkMode: boolean
      backgroundColor: {
        red: number
        green: number
        blue: number
        alpha: number
      }
    }
    /**
     * @type {string}
     */
    get token(): string
    /**
     * get  the status of the window
     * @type {number} - the status of the window
     */
    get status(): number
    /**
     * Get the size of the window
     * @return {{ width: number, height: number }} - the size of the window
     */
    getSize(): {
      width: number
      height: number
    }
    /**
     * Get the position of the window
     * @return {{ x: number, y: number }} - the position of the window
     */
    getPosition(): {
      x: number
      y: number
    }
    /**
     * Get the title of the window
     * @return {string} - the title of the window
     */
    getTitle(): string
    /**
     * Get the status of the window
     * @return {number} - the status of the window
     */
    getStatus(): number
    /**
     * Close the window
     * @return {Promise<object>} - the options of the window
     */
    close(): Promise<object>
    /**
     * Shows the window
     * @return {Promise<ipc.Result>}
     */
    show(): Promise<ipc.Result>
    /**
     * Hides the window
     * @return {Promise<ipc.Result>}
     */
    hide(): Promise<ipc.Result>
    /**
     * Brings the window to the foreground and focuses it.
     * @return {Promise<ipc.Result>}
     */
    focus(): Promise<ipc.Result>
    /**
     * Removes focus from the window (desktop: sends to back; mobile: hides).
     * @return {Promise<ipc.Result>}
     */
    blur(): Promise<ipc.Result>
    /**
     * Maximize the window
     * @return {Promise<ipc.Result>}
     */
    maximize(): Promise<ipc.Result>
    /**
     * Minimize the window
     * @return {Promise<ipc.Result>}
     */
    minimize(): Promise<ipc.Result>
    /**
     * Restore the window
     * @return {Promise<ipc.Result>}
     */
    restore(): Promise<ipc.Result>
    /**
     * Sets the title of the window
     * @param {string} title - the title of the window
     * @return {Promise<ipc.Result>}
     */
    setTitle(title: string): Promise<ipc.Result>
    /**
     * Sets the size of the window
     * @param {object} opts - an options object
     * @param {(number|string)=} opts.width - the width of the window
     * @param {(number|string)=} opts.height - the height of the window
     * @return {Promise<ipc.Result>}
     * @throws {Error} - if the width or height is invalid
     */
    setSize(opts: {
      width?: (number | string) | undefined
      height?: (number | string) | undefined
    }): Promise<ipc.Result>
    /**
     * Sets the position of the window
     * @param {object} opts - an options object
     * @param {(number|string)=} opts.x - the x position of the window
     * @param {(number|string)=} opts.y - the y position of the window
     * @return {Promise<object>}
     * @throws {Error} - if the x or y is invalid
     */
    setPosition(opts: {
      x?: (number | string) | undefined
      y?: (number | string) | undefined
    }): Promise<object>
    /**
     * Navigate the window to a given path
     * @param {object} path - file path
     * @return {Promise<ipc.Result>}
     */
    navigate(path: object): Promise<ipc.Result>
    /**
     * Opens the Web Inspector for the window
     * @return {Promise<object>}
     */
    showInspector(): Promise<object>
    /**
     * Sets the background color of the window
     * @param {object} opts - an options object
     * @param {number} opts.red - the red value
     * @param {number} opts.green - the green value
     * @param {number} opts.blue - the blue value
     * @param {number} opts.alpha - the alpha value
     * @return {Promise<object>}
     */
    setBackgroundColor(opts: {
      red: number
      green: number
      blue: number
      alpha: number
    }): Promise<object>
    /**
     * Gets the background color of the window
     * @return {Promise<string>}
     */
    getBackgroundColor(): Promise<string>
    /**
     * Opens a native context menu.
     * @param {object} options - an options object
     * @return {Promise<object>}
     */
    setContextMenu(options: object): Promise<object>
    /**
     * Sets whether the window should stay always on top (desktop only).
     * @param {boolean} enabled
     * @return {Promise<ipc.Result>}
     */
    setAlwaysOnTop(enabled: boolean): Promise<ipc.Result>
    /**
     * Checks if the window is set to always be on top (desktop only).
     * @return {Promise<boolean>}
     */
    isAlwaysOnTop(): Promise<boolean>
    /**
     * Shows a native open file dialog.
     * @param {object} options - an options object
     * @return {Promise<string[]>} - an array of file paths
     */
    showOpenFilePicker(options: object): Promise<string[]>
    /**
     * Shows a native save file dialog.
     * @param {object} options - an options object
     * @return {Promise<string|null>} - the selected file path or null
     */
    showSaveFilePicker(options: object): Promise<string | null>
    /**
     * Shows a native directory dialog.
     * @param {object} options - an options object
     * @return {Promise<string[]>} - an array of file paths
     */
    showDirectoryFilePicker(options: object): Promise<string[]>
    /**
     * Opens the platform share sheet for the current window.
     * @param {{ title?: string, text?: string, url?: string }} [options]
     * @return {Promise<void>}
     */
    share(options?: {
      title?: string
      text?: string
      url?: string
    }): Promise<void>
    /**
     * This is a high-level API that you should use instead of `ipc.request` when
     * you want to send a message to another window or to the backend.
     *
     * @param {object} options - an options object
     * @param {number=} options.window - the window to send the message to
     * @param {boolean=} [options.backend = false] - whether to send the message to the backend
     * @param {string} options.event - the event to send
     * @param {(string|object)=} options.value - the value to send
     * @returns
     */
    send(options: {
      window?: number | undefined
      backend?: boolean | undefined
      event: string
      value?: (string | object) | undefined
    }): Promise<ipc.Result>
    /**
     * Post a message to a window
     * TODO(@jwerle): research using `BroadcastChannel` instead
     * @param {object} data
     * @return {Promise}
     */
    postMessage(data: object): Promise<any>
    /**
     * Opens an URL in the default application associated with the URL protocol,
     * such as 'https:' for the default web browser.
     * @param {string} value
     * @returns {Promise<{ url: string }>}
     */
    openExternal(value: string): Promise<{
      url: string
    }>
    /**
     * Opens a file in the default file explorer.
     * @param {string} value
     * @returns {Promise}
     */
    revealFile(value: string): Promise<any>
    /**
     * Updates window state
     * @return {Promise<ipc.Result>}
     */
    update(): Promise<ipc.Result>
    /**
     * Adds a listener to the window.
     * @param {string} event - the event to listen to
     * @param {function(*): void} cb - the callback to call
     * @returns {void}
     */
    addListener(event: string, cb: (arg0: any) => void): void
    /**
     * Adds a listener to the window. An alias for `addListener`.
     * @param {string} event - the event to listen to
     * @param {function(*): void} cb - the callback to call
     * @returns {void}
     * @see addListener
     */
    on(event: string, cb: (arg0: any) => void): void
    /**
     * Adds a listener to the window. The listener is removed after the first call.
     * @param {string} event - the event to listen to
     * @param {function(*): void} cb - the callback to call
     * @returns {void}
     */
    once(event: string, cb: (arg0: any) => void): void
    /**
     * Removes a listener from the window.
     * @param {string} event - the event to remove the listener from
     * @param {function(*): void} cb - the callback to remove
     * @returns {void}
     */
    removeListener(event: string, cb: (arg0: any) => void): void
    /**
     * Removes all listeners from the window.
     * @param {string} event - the event to remove the listeners from
     * @returns {void}
     */
    removeAllListeners(event: string): void
    /**
     * Removes a listener from the window. An alias for `removeListener`.
     * @param {string} event - the event to remove the listener from
     * @param {function(*): void} cb - the callback to remove
     * @returns {void}
     * @see removeListener
     */
    off(event: string, cb: (arg0: any) => void): void
    #private
  }
  export default ApplicationWindow
  /**
   * @ignore
   */
  export const constants: typeof statuses
  import ipc from 'oro:ipc'
  import * as statuses from 'oro:window/constants'
  import client from 'oro:application/client'
  import hotkey from 'oro:window/hotkey'
  export { client, hotkey }
}
```

</details>

<details>
<summary><code>oro:window/constants</code></summary>

```ts
declare module 'oro:window/constants' {
  export const WINDOW_ERROR: -1
  export const WINDOW_NONE: 0
  export const WINDOW_CREATING: 10
  export const WINDOW_CREATED: 11
  export const WINDOW_HIDING: 20
  export const WINDOW_HIDDEN: 21
  export const WINDOW_SHOWING: 30
  export const WINDOW_SHOWN: 31
  export const WINDOW_CLOSING: 40
  export const WINDOW_CLOSED: 41
  export const WINDOW_EXITING: 50
  export const WINDOW_EXITED: 51
  export const WINDOW_KILLING: 60
  export const WINDOW_KILLED: 61
  export default exports
  import * as exports from 'oro:window/constants'
}
```

</details>

<details>
<summary><code>oro:window/hotkey</code></summary>

```ts
declare module 'oro:window/hotkey' {
  /**
   * Normalizes an expression string.
   * @param {string} expression
   * @return {string}
   */
  export function normalizeExpression(expression: string): string
  /**
   * Bind a global hotkey expression.
   * @param {string} expression
   * @param {{ passive?: boolean }} [options]
   * @return {Promise<Binding>}
   */
  export function bind(
    expression: string,
    options?: {
      passive?: boolean
    }
  ): Promise<Binding>
  /**
   * Bind a global hotkey expression.
   * @param {string} expression
   * @param {object=} [options]
   * @return {Promise<Binding>}
   */
  export function unbind(
    id: any,
    options?: object | undefined
  ): Promise<Binding>
  /**
   * Get all known globally register hotkey bindings.
   * @param {object=} [options]
   * @return {Promise<Binding[]>}
   */
  export function getBindings(options?: object | undefined): Promise<Binding[]>
  /**
   * Get all known possible keyboard modifier and key mappings for
   * expression bindings.
   * @param {object=} [options]
   * @return {Promise<{ keys: object, modifiers: object }>}
   */
  export function getMappings(options?: object | undefined): Promise<{
    keys: object
    modifiers: object
  }>
  /**
   * Adds an event listener to the global active bindings. This function is just
   * proxy to `bindings.addEventListener`.
   * @param {string} type
   * @param {function(Event)} listener
   * @param {(boolean|object)=} [optionsOrUseCapture]
   */
  export function addEventListener(
    type: string,
    listener: (arg0: Event) => any,
    optionsOrUseCapture?: (boolean | object) | undefined
  ): void
  /**
   * Removes  an event listener to the global active bindings. This function is
   * just a proxy to `bindings.removeEventListener`
   * @param {string} type
   * @param {function(Event)} listener
   * @param {(boolean|object)=} [optionsOrUseCapture]
   */
  export function removeEventListener(
    type: string,
    listener: (arg0: Event) => any,
    optionsOrUseCapture?: (boolean | object) | undefined
  ): void
  /**
   * A high level bindings container map that dispatches events.
   */
  export class Bindings extends EventTarget {
    [x: number]: () => import('oro:gc').Finalizer
    /**
     * `Bindings` class constructor.
     * @ignore
     * @param {EventTarget} [sourceEventTarget]
     */
    constructor(sourceEventTarget?: EventTarget)
    /**
     * Global `HotKeyEvent` event listener for `Binding` instance event dispatch.
     * @ignore
     * @param {import('../internal/events.js').HotKeyEvent} event
     */
    onHotKey(event: import('oro:internal/events').HotKeyEvent): boolean
    /**
     * The number of `Binding` instances in the mapping.
     * @type {number}
     */
    get size(): number
    /**
     * Setter for the level 1 'error'` event listener.
     * @ignore
     * @type {function(ErrorEvent)?}
     */
    set onerror(onerror: ((arg0: ErrorEvent) => any) | null)
    /**
     * Level 1 'error'` event listener.
     * @type {function(ErrorEvent)?}
     */
    get onerror(): ((arg0: ErrorEvent) => any) | null
    /**
     * Setter for the level 1 'hotkey'` event listener.
     * @ignore
     * @type {function(import('../internal/events.js').HotKeyEvent)?}
     */
    set onhotkey(
      onhotkey:
        | ((arg0: import('oro:internal/events').HotKeyEvent) => any)
        | null
    )
    /**
     * Level 1 'hotkey'` event listener.
     * @type {function(import('../internal/events.js').HotKeyEvent)?}
     */
    get onhotkey():
      | ((arg0: import('oro:internal/events').HotKeyEvent) => any)
      | null
    /**
     * Initializes bindings from global context.
     * @ignore
     * @return {Promise}
     */
    init(): Promise<any>
    /**
     * Get a binding by `id`
     * @param {number} id
     * @return {Binding}
     */
    get(id: number): Binding
    /**
     * Set a `binding` a by `id`.
     * @param {number} id
     * @param {Binding} binding
     */
    set(id: number, binding: Binding): void
    /**
     * Delete a binding by `id`
     * @param {number} id
     * @return {boolean}
     */
    delete(id: number): boolean
    /**
     * Returns `true` if a binding exists in the mapping, otherwise `false`.
     * @return {boolean}
     */
    has(id: any): boolean
    /**
     * Known `Binding` values in the mapping.
     * @return {{ next: function(): { value: Binding|undefined, done: boolean } }}
     */
    values(): {
      next: () => {
        value: Binding | undefined
        done: boolean
      }
    }
    /**
     * Known `Binding` keys in the mapping.
     * @return {{ next: function(): { value: number|undefined, done: boolean } }}
     */
    keys(): {
      next: () => {
        value: number | undefined
        done: boolean
      }
    }
    /**
     * Known `Binding` ids in the mapping.
     * @return {{ next: function(): { value: number|undefined, done: boolean } }}
     */
    ids(): {
      next: () => {
        value: number | undefined
        done: boolean
      }
    }
    /**
     * Known `Binding` ids and values in the mapping.
     * @return {{ next: function(): { value: [number, Binding]|undefined, done: boolean } }}
     */
    entries(): {
      next: () => {
        value: [number, Binding] | undefined
        done: boolean
      }
    }
    /**
     * Bind a global hotkey expression.
     * @param {string} expression
     * @return {Promise<Binding>}
     */
    bind(expression: string): Promise<Binding>
    /**
     * Bind a global hotkey expression.
     * @param {string} expression
     * @return {Promise<Binding>}
     */
    unbind(expression: string): Promise<Binding>
    /**
     * Returns an array of all active bindings for the application.
     * @return {Promise<Binding[]>}
     */
    active(): Promise<Binding[]>
    /**
     * Resets all active bindings in the application.
     * @param {boolean=} [currentContextOnly]
     * @return {Promise}
     */
    reset(currentContextOnly?: boolean | undefined): Promise<any>
    /**
     * Implements the `Iterator` protocol for each currently registered
     * active binding in this window context. The `AsyncIterator` protocol
     * will probe for all gloally active bindings.
     * @return {Iterator<Binding>}
     */
    [Symbol.iterator](): Iterator<Binding>
    /**
     * Implements the `AsyncIterator` protocol for each globally active
     * binding registered to the application. This differs from the `Iterator`
     * protocol as this will probe for _all_ active bindings in the entire
     * application context.
     * @return {AsyncGenerator<Binding>}
     */
    [Symbol.asyncIterator](): AsyncGenerator<Binding>
    #private
  }
  /**
   * An `EventTarget` container for a hotkey binding.
   */
  export class Binding extends EventTarget {
    /**
     * `Binding` class constructor.
     * @ignore
     * @param {object} data
     */
    constructor(data: object)
    /**
     * `true` if the binding is valid, otherwise `false`.
     * @type {boolean}
     */
    get isValid(): boolean
    /**
     * `true` if the binding is considered active, otherwise `false`.
     * @type {boolean}
     */
    get isActive(): boolean
    /**
     * The global unique ID for this binding.
     * @type {number?}
     */
    get id(): number | null
    /**
     * The computed hash for this binding expression.
     * @type {number?}
     */
    get hash(): number | null
    /**
     * The normalized expression as a sequence of tokens.
     * @type {string[]}
     */
    get sequence(): string[]
    /**
     * The original expression of the binding.
     * @type {string?}
     */
    get expression(): string | null
    /**
     * Setter for the level 1 'hotkey'` event listener.
     * @ignore
     * @type {function(import('../internal/events.js').HotKeyEvent)?}
     */
    set onhotkey(
      onhotkey:
        | ((arg0: import('oro:internal/events').HotKeyEvent) => any)
        | null
    )
    /**
     * Level 1 'hotkey'` event listener.
     * @type {function(import('../internal/events.js').HotKeyEvent)?}
     */
    get onhotkey():
      | ((arg0: import('oro:internal/events').HotKeyEvent) => any)
      | null
    /**
     * Binds this hotkey expression.
     * @return {Promise<Binding>}
     */
    bind(): Promise<Binding>
    /**
     * Unbinds this hotkey expression.
     * @return {Promise}
     */
    unbind(): Promise<any>
    /**
     * Implements the `AsyncIterator` protocol for async 'hotkey' events
     * on this binding instance.
     * @return {AsyncGenerator}
     */
    [Symbol.asyncIterator](): AsyncGenerator
    #private
  }
  /**
   * A container for all the bindings currently bound
   * by this window context.
   * @type {Bindings}
   */
  export const bindings: Bindings
  export default bindings
  import { HotKeyEvent } from 'oro:internal/events'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
