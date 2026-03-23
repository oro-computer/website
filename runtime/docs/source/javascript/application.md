# `oro:application`

`oro:application` exposes application-level APIs: creating windows, querying windows, menus, and runtime metadata.

## Import

```js
import application from 'oro:application'
import { createWindow } from 'oro:application'
```

## Window indices

Windows are addressed by numeric indices. The main window is typically index `0`.

```js
import application from 'oro:application'

console.log(application.getCurrentWindowIndex())
```

## Creating a window

```js
import application from 'oro:application'

await application.createWindow({
  index: 1,
  path: 'peer.html',
  title: 'Peer',
})
```

## Querying windows

```js
import application from 'oro:application'

const current = await application.getCurrentWindow()
const peer = await application.getWindow(1, { max: false })
const all = await application.getWindows()
```

## Screen size

```js
import application from 'oro:application'

const { width, height } = await application.getScreenSize()
```

## Menus

`setSystemMenu(...)` sets a native application menu using a simple DSL:

```js
import application from 'oro:application'

await application.setSystemMenu({
  index: 0,
  value: `
    App:
      About: _;
      Quit: q + Meta;
  `,
})
```

## Runtime metadata

```js
import application from 'oro:application'

console.log(application.runtimeVersion)
console.log(application.debug)
console.log(application.config.meta_bundle_identifier)
```

## Backend process control

```js
import application from 'oro:application'

await application.backend.open()
// ...
await application.backend.close()
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:application
oro:application/client
oro:application/menu
oro:application/update
```

### TypeScript declarations

<details>
<summary><code>oro:application</code></summary>

```ts
declare module 'oro:application' {
  /**
   * Add an application event `type` callback `listener` with `options`.
   * @param {string} type
   * @param {function(Event|MessageEvent|CustomEvent|ApplicationURLEvent): boolean} listener
   * @param {{ once?: boolean }|boolean=} [options]
   */
  export function addEventListener(
    type: string,
    listener: (
      arg0: Event | MessageEvent | CustomEvent | ApplicationURLEvent
    ) => boolean,
    options?:
      | (
          | {
              once?: boolean
            }
          | boolean
        )
      | undefined
  ): void
  /**
   * Remove an application event `type` callback `listener` with `options`.
   * @param {string} type
   * @param {function(Event|MessageEvent|CustomEvent|ApplicationURLEvent): boolean} listener
   */
  export function removeEventListener(
    type: string,
    listener: (
      arg0: Event | MessageEvent | CustomEvent | ApplicationURLEvent
    ) => boolean
  ): void
  /**
   * Returns the current window index
   * @return {number}
   */
  export function getCurrentWindowIndex(): number
  /**
   * Creates a new window and returns an instance of ApplicationWindow.
   * @param {object} opts - an options object
   * @param {string=} opts.aspectRatio - a string (split on ':') provides two float values which set the window's aspect ratio.
   * @param {boolean=} opts.closable - deterime if the window can be closed.
   * @param {boolean=} opts.minimizable - deterime if the window can be minimized.
   * @param {boolean=} opts.maximizable - deterime if the window can be maximized.
   * @param {number} [opts.margin] - a margin around the webview. (Private)
   * @param {number} [opts.radius] - a radius on the webview. (Private)
   * @param {number=} [opts.index = -1] - the index of the window, if not provided or the value is `-1`, then one will be assigned
   * @param {string} opts.path - the path to the HTML file to load into the window.
   * @param {string=} opts.title - the title of the window.
   * @param {string=} opts.titlebarStyle - determines the style of the titlebar (MacOS only).
   * @param {string=} opts.windowControlOffsets - a string (split on 'x') provides the x and y position of the traffic lights (MacOS only).
   * @param {string=} opts.backgroundColorDark - determines the background color of the window in dark mode.
   * @param {string=} opts.backgroundColorLight - determines the background color of the window in light mode.
   * @param {boolean=} opts.followSystemTheme - whether the window should follow the desktop theme (default: true).
   * @param {boolean=} opts.preferDarkTheme - whether the window should prefer a dark theme when not following the system theme.
   * @param {(number|string)=} opts.width - the width of the window. If undefined, the window will have the main window width.
   * @param {(number|string)=} opts.height - the height of the window. If undefined, the window will have the main window height.
   * @param {(number|string)=} [opts.minWidth = 0] - the minimum width of the window
   * @param {(number|string)=} [opts.minHeight = 0] - the minimum height of the window
   * @param {(number|string)=} [opts.maxWidth = '100%'] - the maximum width of the window
   * @param {(number|string)=} [opts.maxHeight = '100%'] - the maximum height of the window
   * @param {boolean=} [opts.resizable=true] - whether the window is resizable
   * @param {boolean=} [opts.frameless=false] - whether the window is frameless
   * @param {boolean=} [opts.utility=false] - whether the window is utility (macOS only)
   * @param {boolean=} [opts.shouldExitApplicationOnClose=false] - whether the window can exit the app
   * @param {boolean=} [opts.headless=false] - whether the window will be headless or not (no frame)
   * @param {string=} [opts.userScript=null] - A user script that will be injected into the window (desktop only)
   * @param {string[]=} [opts.protocolHandlers] - An array of protocol handler schemes to register with the new window (requires service worker)
   * @param {Record<string, string|number|boolean|(string|number|boolean)[]>=} [opts.config] - additional configuration key/value pairs
   * @param {string=} [opts.resourcesDirectory]
   * @param {boolean=} [opts.shouldPreferServiceWorker=false]
   * @return {Promise<ApplicationWindow>}
   */
  export function createWindow(opts: {
    aspectRatio?: string | undefined
    closable?: boolean | undefined
    minimizable?: boolean | undefined
    maximizable?: boolean | undefined
    margin?: number
    radius?: number
    index?: number | undefined
    path: string
    title?: string | undefined
    titlebarStyle?: string | undefined
    windowControlOffsets?: string | undefined
    backgroundColorDark?: string | undefined
    backgroundColorLight?: string | undefined
    followSystemTheme?: boolean | undefined
    preferDarkTheme?: boolean | undefined
    width?: (number | string) | undefined
    height?: (number | string) | undefined
    minWidth?: (number | string) | undefined
    minHeight?: (number | string) | undefined
    maxWidth?: (number | string) | undefined
    maxHeight?: (number | string) | undefined
    resizable?: boolean | undefined
    frameless?: boolean | undefined
    utility?: boolean | undefined
    shouldExitApplicationOnClose?: boolean | undefined
    headless?: boolean | undefined
    userScript?: string | undefined
    protocolHandlers?: string[] | undefined
    config?:
      | Record<
          string,
          string | number | boolean | (string | number | boolean)[]
        >
      | undefined
    resourcesDirectory?: string | undefined
    shouldPreferServiceWorker?: boolean | undefined
  }): Promise<ApplicationWindow>
  /**
   * Returns the current screen size.
   * @returns {Promise<{ width: number, height: number }>}
   */
  export function getScreenSize(): Promise<{
    width: number
    height: number
  }>
  /**
   * Returns the ApplicationWindow instances for the given indices or all windows if no indices are provided.
   * @param {number[]} [indices] - the indices of the windows
   * @throws {Error} - if indices is not an array of integer numbers
   * @return {Promise<ApplicationWindowList>}
   */
  export function getWindows(
    indices?: number[],
    options?: any
  ): Promise<ApplicationWindowList>
  /**
   * Returns the ApplicationWindow instance for the given index
   * @param {number} index - the index of the window
   * @throws {Error} - if index is not a valid integer number
   * @returns {Promise<ApplicationWindow>} - the ApplicationWindow instance or null if the window does not exist
   */
  export function getWindow(
    index: number,
    options: any
  ): Promise<ApplicationWindow>
  /**
   * Returns the ApplicationWindow instance for the current window.
   * @return {Promise<ApplicationWindow>}
   */
  export function getCurrentWindow(): Promise<ApplicationWindow>
  /**
   * Quits the backend process and then quits the render process, the exit code used is the final exit code to the OS.
   * @param {number} [code = 0] - an exit code
   * @return {Promise<ipc.Result['data']>}
   */
  export function exit(code?: number): Promise<ipc.Result['data']>
  /**
   * Set the native menu for the app.
   *
   * @param {object} options - an options object
   * @param {string} options.value - the menu layout
   * @param {number} options.index - the window to target (if applicable)
   * @return {Promise<ipc.Result>}
   *
   * Oro Runtime provides a minimalist DSL that makes it easy to create cross
   * platform native system and context menus.
   *
   * Menus are created at run time. They can be created from either the Main or
   * Render process. The can be recreated instantly by calling the `setSystemMenu` method.
   *
   * The method takes a string. Here's an example of a menu. The semi colon is
   * significant indicates the end of the menu. Use an underscore when there is no
   * accelerator key. Modifiers are optional. And well known OS menu options like
   * the edit menu will automatically get accelerators you dont need to specify them.
   *
   *
   * ```js
   * oro.application.setSystemMenu({ index: 0, value: `
   *   App:
   *     Foo: f;
   *
   *   Edit:
   *     Cut: x
   *     Copy: c
   *     Paste: v
   *     Delete: _
   *     Select All: a;
   *
   *   Other:
   *     Apple: _
   *     Another Test: T
   *     !Im Disabled: I
   *     Some Thing: S + Meta
   *     ---
   *     Bazz: s + Meta, Control, Alt;
   * `)
   * ```
   *
   * Separators
   *
   * To create a separator, use three dashes `---`.
   *
   *
   * Accelerator Modifiers
   *
   * Accelerator modifiers are used as visual indicators but don't have a
   * material impact as the actual key binding is done in the event listener.
   *
   * A capital letter implies that the accelerator is modified by the `Shift` key.
   *
   * Additional accelerators are `Meta`, `Control`, `Option`, each separated
   * by commas. If one is not applicable for a platform, it will just be ignored.
   *
   * On MacOS `Meta` is the same as `Command`.
   *
   *
   * Disabled Items
   *
   * If you want to disable a menu item just prefix the item with the `!` character.
   * This will cause the item to appear disabled when the system menu renders.
   *
   *
   * Submenus
   *
   * We feel like nested menus are an anti-pattern. We don't use them. If you have a
   * strong argument for them and a very simple pull request that makes them work we
   * may consider them.
   *
   *
   * Event Handling
   *
   * When a menu item is activated, it raises the `menuItemSelected` event in
   * the front end code, you can then communicate with your backend code if you
   * want from there.
   *
   * For example, if the `Apple` item is selected from the `Other` menu...
   *
   * ```js
   * window.addEventListener('menuItemSelected', event => {
   *   assert(event.detail.parent === 'Other')
   *   assert(event.detail.title === 'Apple')
   * })
   * ```
   *
   */
  export function setSystemMenu(o: any): Promise<ipc.Result>
  /**
   * An alias to setSystemMenu for creating a tary menu
   */
  export function setTrayMenu(o: any): Promise<ipc.Result>
  /**
   * Set the enabled state of the system menu.
   * @param {object} value - an options object
   * @return {Promise<ipc.Result>}
   */
  export function setSystemMenuItemEnabled(value: object): Promise<ipc.Result>
  /**
   * Predicate function to determine if application is in a "paused" state.
   * @return {boolean}
   */
  export function isPaused(): boolean
  export const MAX_WINDOWS: 64
  export class ApplicationWindowList {
    static from(...args: any[]): ApplicationWindowList
    constructor(items: any)
    get length(): number
    get size(): number
    forEach(callback: any, thisArg: any): void
    item(index: any): any
    entries(): any[][]
    keys(): any[]
    values(): any[]
    add(window: any): this
    remove(windowOrIndex: any): boolean
    contains(windowOrIndex: any): boolean
    clear(): this
    [Symbol.iterator](): ArrayIterator<any>
    #private
  }
  /**
   * Oro Runtime semantic version metadata mirrored from `process.versions.oro`.
   * The legacy `process.versions.socket` string remains frozen for compatibility.
   * @type {object} - an object containing the version information
   */
  export const runtimeVersion: object
  /**
   * Runtime debug flag.
   * @type {boolean}
   */
  export const debug: boolean
  /**
   * Application configuration.
   * @type {Record<string, string|number|boolean|(string|number|boolean)[]>}
   */
  export const config: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >
  export namespace backend {
    /**
     * @param {object} opts - an options object
     * @param {boolean} [opts.force = false] - whether to force the existing process to close
     * @return {Promise<ipc.Result>}
     */
    function open(opts?: { force?: boolean }): Promise<ipc.Result>
    /**
     * @return {Promise<ipc.Result>}
     */
    function close(): Promise<ipc.Result>
  }
  export default exports
  import { ApplicationURLEvent } from 'oro:internal/events'
  import ApplicationWindow from 'oro:window'
  import ipc from 'oro:ipc'
  import client from 'oro:application/client'
  import menu from 'oro:application/menu'
  import * as exports from 'oro:application'
  export { client, menu }
}
```

</details>

<details>
<summary><code>oro:application/client</code></summary>

```ts
declare module 'oro:application/client' {
  /**
   * @typedef {{
   *  id?: string | null,
   *  type?: 'window' | 'worker',
   *  parent?: object | null,
   *  top?: object | null,
   *  frameType?: 'top-level' | 'nested' | 'none'
   * }} ClientState
   */
  export class Client {
    /**
     * `Client` class constructor
     * @private
     * @param {ClientState} state
     */
    private constructor()
    /**
     * The unique ID of the client.
     * @type {string|null}
     */
    get id(): string | null
    /**
     * The frame type of the client.
     * @type {'top-level'|'nested'|'none'}
     */
    get frameType(): 'top-level' | 'nested' | 'none'
    /**
     * The type of the client.
     * @type {'window'|'worker'}
     */
    get type(): 'window' | 'worker'
    /**
     * The parent client of the client.
     * @type {Client|null}
     */
    get parent(): Client | null
    /**
     * The top client of the client.
     * @type {Client|null}
     */
    get top(): Client | null
    /**
     * A readonly `URL` of the current location of this client.
     * @type {URL}
     */
    get location(): URL
    /**
     * Converts this `Client` instance to JSON.
     * @return {object}
     */
    toJSON(): object
    #private
  }
  const _default: any
  export default _default
  export type ClientState = {
    id?: string | null
    type?: 'window' | 'worker'
    parent?: object | null
    top?: object | null
    frameType?: 'top-level' | 'nested' | 'none'
  }
}
```

</details>

<details>
<summary><code>oro:application/menu</code></summary>

```ts
declare module 'oro:application/menu' {
  /**
   * Internal IPC for setting an application menu
   * @ignore
   */
  export function setMenu(options: any, type: any): Promise<ipc.Result>
  /**
   * Internal IPC for setting an application context menu
   * @ignore
   */
  export function setContextMenu(options: any): Promise<any>
  /**
   * A `Menu` is base class for a `ContextMenu`, `SystemMenu`, or `TrayMenu`.
   */
  export class Menu extends EventTarget {
    /**
     * `Menu` class constructor.
     * @ignore
     * @param {string} type
     */
    constructor(type: string)
    /**
     * The broadcast channel for this menu.
     * @ignore
     * @type {BroadcastChannel}
     */
    get channel(): BroadcastChannel
    /**
     * The `Menu` instance type.
     * @type {('context'|'system'|'tray')?}
     */
    get type(): ('context' | 'system' | 'tray') | null
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
     * Setter for the level 1 'menuitem'` event listener.
     * @ignore
     * @type {function(MenuItemEvent)?}
     */
    set onmenuitem(onmenuitem: ((arg0: menuitemEvent) => any) | null)
    /**
     * Level 1 'menuitem'` event listener.
     * @type {function(menuitemEvent)?}
     */
    get onmenuitem(): ((arg0: menuitemEvent) => any) | null
    /**
     * Set the menu layout for this `Menu` instance.
     * @param {string|object} layoutOrOptions
     * @param {object=} [options]
     */
    set(
      layoutOrOptions: string | object,
      options?: object | undefined
    ): Promise<any>
    #private
  }
  /**
   * A container for various `Menu` instances.
   */
  export class MenuContainer extends EventTarget {
    /**
     * `MenuContainer` class constructor.
     * @param {EventTarget} [sourceEventTarget]
     * @param {object=} [options]
     */
    constructor(sourceEventTarget?: EventTarget, options?: object | undefined)
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
     * Setter for the level 1 'menuitem'` event listener.
     * @ignore
     * @type {function(MenuItemEvent)?}
     */
    set onmenuitem(onmenuitem: ((arg0: menuitemEvent) => any) | null)
    /**
     * Level 1 'menuitem'` event listener.
     * @type {function(menuitemEvent)?}
     */
    get onmenuitem(): ((arg0: menuitemEvent) => any) | null
    /**
     * The `TrayMenu` instance for the application.
     * @type {TrayMenu}
     */
    get tray(): TrayMenu
    /**
     * The `SystemMenu` instance for the application.
     * @type {SystemMenu}
     */
    get system(): SystemMenu
    /**
     * The `ContextMenu` instance for the application.
     * @type {ContextMenu}
     */
    get context(): ContextMenu
    #private
  }
  /**
   * A `Menu` instance that represents a context menu.
   */
  export class ContextMenu extends Menu {
    constructor()
  }
  /**
   * A `Menu` instance that represents the system menu.
   */
  export class SystemMenu extends Menu {
    constructor()
  }
  /**
   * A `Menu` instance that represents the tray menu.
   */
  export class TrayMenu extends Menu {
    constructor()
  }
  /**
   * The application tray menu.
   * @type {TrayMenu}
   */
  export const tray: TrayMenu
  /**
   * The application system menu.
   * @type {SystemMenu}
   */
  export const system: SystemMenu
  /**
   * The application context menu.
   * @type {ContextMenu}
   */
  export const context: ContextMenu
  /**
   * The application menus container.
   * @type {MenuContainer}
   */
  export const container: MenuContainer
  export default container
  import ipc from 'oro:ipc'
}
```

</details>

<details>
<summary><code>oro:application/update</code></summary>

```ts
declare module 'oro:application/update' {
  /**
   * Selects a suitable update for the given options.
   * @param {UpdateManifest} manifest
   * @param {UpdateSelectionOptions} [options]
   * @returns {UpdateSelectionResult|null}
   */
  export function selectUpdate(
    manifest: UpdateManifest,
    options?: UpdateSelectionOptions
  ): UpdateSelectionResult | null
  /**
   * Verifies an artifact payload against the hash declared in the target.
   * @param {Uint8Array|ArrayBuffer} payload
   * @param {UpdateTarget} target
   * @returns {Promise<void>}
   */
  export function verifyArtifact(
    payload: Uint8Array | ArrayBuffer,
    target: UpdateTarget
  ): Promise<void>
  /**
   * Opens a verified artifact as a tar archive using the native tar service.
   * This is a convenience helper that wraps the artifact bytes in a TarArchive
   * so callers can inspect and extract entries using the `oro:tar` API surface.
   *
   * @param {Uint8Array|ArrayBuffer|import('../buffer.js').Buffer} artifact
   * @returns {Promise<import('../tar.js').TarArchive>}
   */
  export function openArtifactArchive(
    artifact: Uint8Array | ArrayBuffer | import('oro:buffer').Buffer
  ): Promise<import('tar').TarArchive>
  /**
   * Downloads an artifact and verifies its hash.
   * Prefers the native update service and falls back to the JS fetch-based
   * implementation when the service is not available in this build.
   * @param {UpdateTarget} target
   * @param {DownloadOptions} [options]
   * @returns {Promise<Uint8Array>}
   */
  export function downloadUpdate(
    target: UpdateTarget,
    options?: DownloadOptions
  ): Promise<Uint8Array>
  /**
   * Fetches and verifies a manifest + signature pair.
   * @param {ManifestFetchOptions} options
   * @returns {Promise<{ manifest: UpdateManifest, raw: Uint8Array, signature: ManifestSignature }>}
   */
  export function fetchManifest(options: ManifestFetchOptions): Promise<{
    manifest: UpdateManifest
    raw: Uint8Array
    signature: ManifestSignature
  }>
  /**
   * High-level helper: fetches & verifies the manifest, selects an update,
   * and optionally downloads the artifact. Prefers the native update(service)
   * when available and falls back to the JS implementation otherwise.
   * @param {UpdateCheckOptions} options
   * @returns {Promise<UpdateCheckResult>}
   */
  export function checkForUpdates(
    options: UpdateCheckOptions
  ): Promise<UpdateCheckResult>
  export default api
  export type UpdateTarget = {
    /**
     * - Target platform identifier (for example, `darwin`, `win32`, `linux`).
     */
    platform: string
    /**
     * - Target CPU architecture (for example, `x64`, `arm64`).
     */
    arch: string
    /**
     * - Absolute or relative URL for the update payload.
     */
    artifactUrl: string
    /**
     * - Expected payload length in bytes.
     */
    length?: number
    /**
     * - Hash algorithm identifier (for example, `sha256`).
     */
    hashAlgorithm: string
    /**
     * - Hex or base64url encoded hash of the payload.
     */
    hash: string
    /**
     * - Optional artifact signature algorithm (for example, `ed25519`).
     */
    signatureAlgorithm?: string
    /**
     * - Optional encoded signature over the artifact bytes.
     */
    artifactSignature?: string
    /**
     * - Optional OS version range constraint.
     */
    osVersionRange?: string
  }
  export type UpdateDescriptor = {
    /**
     * - Update identifier, unique within the manifest.
     */
    id: string
    /**
     * - Application version string (semantic version recommended).
     */
    version: string
    /**
     * - Distribution channel (for example, `stable`, `beta`).
     */
    channel?: string
    /**
     * - Minimum Oro runtime version required.
     */
    minRuntimeVersion?: string
    /**
     * - Whether this update is considered critical.
     */
    critical?: boolean
    /**
     * - Optional URL to human-readable release notes.
     */
    notesUrl?: string
    /**
     * - Platform-specific artifacts for this update.
     */
    targets: UpdateTarget[]
  }
  export type UpdateManifest = {
    /**
     * - Manifest schema version.
     */
    schemaVersion: number
    /**
     * - Application identifier (for example, reverse DNS).
     */
    appId: string
    /**
     * - ISO8601 timestamp when the manifest was generated.
     */
    generatedAt?: string
    /**
     * - Optional list of known channels.
     */
    channels?: string[]
    /**
     * - List of available updates.
     */
    updates: UpdateDescriptor[]
  }
  export type ManifestSignature = {
    /**
     * - Signature schema version.
     */
    schemaVersion: number
    /**
     * - Signature algorithm (for example, `ed25519`).
     */
    algorithm: string
    /**
     * - Optional key identifier for bookkeeping.
     */
    keyId?: string
    /**
     * - Raw signature bytes.
     */
    signature: Uint8Array
    /**
     * - Original textual encoding (`hex`, `base64`, or `base64url`).
     */
    encoding?: string
  }
  export type KeyLike =
    | Uint8Array
    | ArrayBuffer
    | import('oro:buffer').Buffer
    | string
  export type ManifestFetchOptions = {
    /**
     * - URL of the manifest JSON document.
     */
    manifestUrl: string
    /**
     * - URL of the manifest signature JSON; defaults to `manifestUrl + '.sig'`.
     */
    signatureUrl?: string
    /**
     * - Public key used to verify the manifest signature.
     */
    publicKey?: KeyLike
    /**
     * - Optional list of public keys; the manifest is accepted if any key verifies.
     */
    publicKeys?: KeyLike[]
    /**
     * - Optional expected appId; if provided, the manifest's appId must match.
     */
    expectedAppId?: string
    /**
     * - Optional custom fetch implementation.
     */
    fetch?: typeof globalThis.fetch
    /**
     * - Optional abort signal for network requests.
     */
    signal?: AbortSignal
    /**
     * - Optional additional HTTP headers for manifest/signature requests.
     */
    headers?: Record<string, string>
    /**
     * - Optional maximum manifest size in bytes; manifests larger than this are rejected.
     */
    maxManifestBytes?: number
  }
  export type UpdateSelectionOptions = {
    /**
     * - Desired update channel; defaults to `"stable"`.
     */
    channel?: string
    /**
     * - Current application version.
     */
    currentVersion?: string
    /**
     * - Target platform identifier; defaults to the runtime platform when available.
     */
    platform?: string
    /**
     * - Target architecture identifier; defaults to the runtime architecture when available.
     */
    arch?: string
    /**
     * - Current Oro runtime version; defaults to `process.versions.oro` when available.
     */
    runtimeVersion?: string
  }
  export type UpdateSelectionResult = {
    /**
     * - The validated manifest.
     */
    manifest: UpdateManifest
    /**
     * - The chosen update descriptor.
     */
    update: UpdateDescriptor
    /**
     * - The chosen platform-specific target.
     */
    target: UpdateTarget
  }
  export type DownloadOptions = {
    /**
     * - Optional custom fetch implementation.
     */
    fetch?: typeof globalThis.fetch
    /**
     * - Optional abort signal for the download request.
     */
    signal?: AbortSignal
    /**
     * - Optional maximum artifact size in bytes; artifacts larger than this are rejected.
     */
    maxArtifactBytes?: number
  }
  export type UpdateCheckOptions = ManifestFetchOptions &
    UpdateSelectionOptions &
    DownloadOptions & {
      download?: boolean
    }
  export type UpdateCheckResult = {
    /**
     * - Indicates whether an update is available.
     */
    updateAvailable: boolean
    /**
     * - The validated manifest.
     */
    manifest: UpdateManifest
    /**
     * - The validated manifest signature.
     */
    signature: ManifestSignature
    /**
     * - The chosen update descriptor, when `updateAvailable` is `true`.
     */
    update?: UpdateDescriptor
    /**
     * - The chosen platform-specific target, when `updateAvailable` is `true`.
     */
    target?: UpdateTarget
    /**
     * - The downloaded and verified artifact bytes when `download` is `true`.
     */
    artifact?: Uint8Array
  }
  export type UpdateModule = {
    selectUpdate: typeof selectUpdate
    verifyArtifact: typeof verifyArtifact
    downloadUpdate: typeof downloadUpdate
    fetchManifest: typeof fetchManifest
    checkForUpdates: typeof checkForUpdates
  }
  import { Buffer } from 'oro:buffer'
  import { TarArchive } from 'oro:tar'
  /**
   * @typedef {object} UpdateModule
   * @property {typeof selectUpdate} selectUpdate
   * @property {typeof verifyArtifact} verifyArtifact
   * @property {typeof downloadUpdate} downloadUpdate
   * @property {typeof fetchManifest} fetchManifest
   * @property {typeof checkForUpdates} checkForUpdates
   */
  /** @type {UpdateModule} */
  const api: UpdateModule
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
