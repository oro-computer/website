# `oro:path`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:path'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:path
oro:path/index
oro:path/mounts
oro:path/path
oro:path/posix
oro:path/well-known
oro:path/win32
```

### TypeScript declarations

<details>
<summary><code>oro:path</code></summary>

```ts
declare module 'oro:path' {
  export const sep: '\\' | '/'
  export const delimiter: ';' | ':'
  export const resolve: typeof posix.win32.resolve
  export const join: typeof posix.win32.join
  export const dirname: typeof posix.win32.dirname
  export const basename: typeof posix.win32.basename
  export const extname: typeof posix.win32.extname
  export const cwd: typeof posix.win32.cwd
  export const isAbsolute: typeof posix.win32.isAbsolute
  export const parse: typeof posix.win32.parse
  export const format: typeof posix.win32.format
  export const normalize: typeof posix.win32.normalize
  export const relative: typeof posix.win32.relative
  const _default: typeof posix.win32 | typeof posix
  export default _default
  import { posix } from 'oro:path/index'
  import { Path } from 'oro:path/index'
  import { win32 } from 'oro:path/index'
  import { mounts } from 'oro:path/index'
  import { DOWNLOADS } from 'oro:path/index'
  import { DOCUMENTS } from 'oro:path/index'
  import { RESOURCES } from 'oro:path/index'
  import { PICTURES } from 'oro:path/index'
  import { DESKTOP } from 'oro:path/index'
  import { VIDEOS } from 'oro:path/index'
  import { CONFIG } from 'oro:path/index'
  import { MEDIA } from 'oro:path/index'
  import { MUSIC } from 'oro:path/index'
  import { HOME } from 'oro:path/index'
  import { DATA } from 'oro:path/index'
  import { LOG } from 'oro:path/index'
  import { TMP } from 'oro:path/index'
  export {
    Path,
    posix,
    win32,
    mounts,
    DOWNLOADS,
    DOCUMENTS,
    RESOURCES,
    PICTURES,
    DESKTOP,
    VIDEOS,
    CONFIG,
    MEDIA,
    MUSIC,
    HOME,
    DATA,
    LOG,
    TMP,
  }
}
```

</details>

<details>
<summary><code>oro:path/index</code></summary>

```ts
declare module 'oro:path/index' {
  export default exports
  import * as mounts from 'oro:path/mounts'
  import * as posix from 'oro:path/posix'
  import * as win32 from 'oro:path/win32'
  import { Path } from 'oro:path/path'
  import { DOWNLOADS } from 'oro:path/well-known'
  import { DOCUMENTS } from 'oro:path/well-known'
  import { RESOURCES } from 'oro:path/well-known'
  import { PICTURES } from 'oro:path/well-known'
  import { DESKTOP } from 'oro:path/well-known'
  import { VIDEOS } from 'oro:path/well-known'
  import { CONFIG } from 'oro:path/well-known'
  import { MEDIA } from 'oro:path/well-known'
  import { MUSIC } from 'oro:path/well-known'
  import { HOME } from 'oro:path/well-known'
  import { DATA } from 'oro:path/well-known'
  import { LOG } from 'oro:path/well-known'
  import { TMP } from 'oro:path/well-known'
  import * as exports from 'oro:path/index'
  export {
    mounts,
    posix,
    win32,
    Path,
    DOWNLOADS,
    DOCUMENTS,
    RESOURCES,
    PICTURES,
    DESKTOP,
    VIDEOS,
    CONFIG,
    MEDIA,
    MUSIC,
    HOME,
    DATA,
    LOG,
    TMP,
  }
}
```

</details>

<details>
<summary><code>oro:path/mounts</code></summary>

```ts
declare module 'oro:path/mounts' {
  const _default: {}
  export default _default
}
```

</details>

<details>
<summary><code>oro:path/path</code></summary>

```ts
declare module 'oro:path/path' {
  /**
   * The path.resolve() method resolves a sequence of paths or path segments into an absolute path.
   * @param {object} options
   * @param {...PathComponent} components
   * @returns {string}
   * @see {@link https://nodejs.org/api/path.html#path_path_resolve_paths}
   */
  export function resolve(
    options: object,
    ...components: PathComponent[]
  ): string
  /**
   * Computes current working directory for a path
   * @param {object=} [opts]
   * @param {boolean=} [opts.posix] Set to `true` to force POSIX style path
   * @return {string}
   */
  export function cwd(opts?: object | undefined): string
  /**
   * Computed location origin. Defaults to `oro:///` if not available.
   * @return {string}
   */
  export function origin(): string
  /**
   * Computes the relative path from `from` to `to`.
   * @param {object} options
   * @param {PathComponent} from
   * @param {PathComponent} to
   * @return {string}
   */
  export function relative(
    options: object,
    from: PathComponent,
    to: PathComponent
  ): string
  /**
   * Joins path components. This function may not return an absolute path.
   * @param {object} options
   * @param {...PathComponent} components
   * @return {string}
   */
  export function join(options: object, ...components: PathComponent[]): string
  /**
   * Computes directory name of path.
   * @param {object} options
   * @param {PathComponent} path
   * @return {string}
   */
  export function dirname(options: object, path: PathComponent): string
  /**
   * Computes base name of path.
   * @param {object} options
   * @param {PathComponent} path
   * @return {string}
   */
  export function basename(options: object, path: PathComponent): string
  /**
   * Computes extension name of path.
   * @param {object} options
   * @param {PathComponent} path
   * @return {string}
   */
  export function extname(options: object, path: PathComponent): string
  /**
   * Computes normalized path
   * @param {object} options
   * @param {PathComponent} path
   * @return {string}
   */
  export function normalize(options: object, path: PathComponent): string
  /**
   * Formats `Path` object into a string.
   * @param {object} options
   * @param {object|Path} path
   * @return {string}
   */
  export function format(options: object, path: object | Path): string
  /**
   * Parses input `path` into a `Path` instance.
   * @param {PathComponent} path
   * @return {object}
   */
  export function parse(path: PathComponent): object
  /**
   * @typedef {(string|Path|URL|{ pathname: string }|{ url: string)} PathComponent
   */
  /**
   * A container for a parsed Path.
   */
  export class Path {
    /**
     * Creates a `Path` instance from `input` and optional `cwd`.
     * @param {PathComponent} input
     * @param {string} [cwd]
     */
    static from(input: PathComponent, cwd?: string): any
    /**
     * `Path` class constructor.
     * @protected
     * @param {string} pathname
     * @param {string} [cwd = Path.cwd()]
     */
    protected constructor()
    pattern: {
      '__#private@#i': any
      '__#private@#n': {}
      '__#private@#t': {}
      '__#private@#e': {}
      '__#private@#s': {}
      '__#private@#l': boolean
      test(t: {}, r: any): boolean
      exec(
        t: {},
        r: any
      ): {
        inputs: any[] | {}[]
      }
      readonly protocol: any
      readonly username: any
      readonly password: any
      readonly hostname: any
      readonly port: any
      readonly pathname: any
      readonly search: any
      readonly hash: any
      readonly hasRegExpGroups: boolean
    }
    url: any
    get pathname(): any
    get protocol(): any
    get href(): any
    /**
     * `true` if the path is relative, otherwise `false.
     * @type {boolean}
     */
    get isRelative(): boolean
    /**
     * The working value of this path.
     */
    get value(): any
    /**
     * The original source, unresolved.
     * @type {string}
     */
    get source(): string
    /**
     * Computed parent path.
     * @type {string}
     */
    get parent(): string
    /**
     * Computed root in path.
     * @type {string}
     */
    get root(): string
    /**
     * Computed directory name in path.
     * @type {string}
     */
    get dir(): string
    /**
     * Computed base name in path.
     * @type {string}
     */
    get base(): string
    /**
     * Computed base name in path without path extension.
     * @type {string}
     */
    get name(): string
    /**
     * Computed extension name in path.
     * @type {string}
     */
    get ext(): string
    /**
     * The computed drive, if given in the path.
     * @type {string?}
     */
    get drive(): string | null
    /**
     * @return {URL}
     */
    toURL(): URL
    /**
     * Converts this `Path` instance to a string.
     * @return {string}
     */
    toString(): string
    /**
     * @ignore
     */
    inspect(): {
      root: string
      dir: string
      base: string
      ext: string
      name: string
    }
    /**
     * @ignore
     */
    [Symbol.toStringTag](): string
    #private
  }
  export default Path
  export type PathComponent =
    | string
    | Path
    | URL
    | {
        pathname: string
      }
    | {
        url: string
      }
  import { URL } from 'oro:url/index'
}
```

</details>

<details>
<summary><code>oro:path/posix</code></summary>

```ts
declare module 'oro:path/posix' {
  /**
   * Computes current working directory for a path
   * @param {string}
   * @return {string}
   */
  export function cwd(): string
  /**
   * Resolves path components to an absolute path.
   * @param {...PathComponent} components
   * @return {string}
   */
  export function resolve(...components: PathComponent[]): string
  /**
   * Joins path components. This function may not return an absolute path.
   * @param {...PathComponent} components
   * @return {string}
   */
  export function join(...components: PathComponent[]): string
  /**
   * Computes directory name of path.
   * @param {PathComponent} path
   * @return {string}
   */
  export function dirname(path: PathComponent): string
  /**
   * Computes base name of path.
   * @param {PathComponent} path
   * @param {string=} [suffix]
   * @return {string}
   */
  export function basename(
    path: PathComponent,
    suffix?: string | undefined
  ): string
  /**
   * Computes extension name of path.
   * @param {PathComponent} path
   * @return {string}
   */
  export function extname(path: PathComponent): string
  /**
   * Predicate helper to determine if path is absolute.
   * @param {PathComponent} path
   * @return {boolean}
   */
  export function isAbsolute(path: PathComponent): boolean
  /**
   * Parses input `path` into a `Path` instance.
   * @param {PathComponent} path
   * @return {{ root: string, dir: string, base: string, ext: string, name: string }}
   */
  export function parse(path: PathComponent): {
    root: string
    dir: string
    base: string
    ext: string
    name: string
  }
  /**
   * Formats `Path` object into a string.
   * @param {object|Path} path
   * @return {string}
   */
  export function format(path: object | Path): string
  /**
   * Normalizes `path` resolving `..` and `./` preserving trailing
   * slashes.
   * @param {string} path
   * @return {string}
   */
  export function normalize(path: string): string
  /**
   * Computes the relative path from `from` to `to`.
   * @param {string} from
   * @param {string} to
   * @return {string}
   */
  export function relative(from: string, to: string): string
  export default exports
  export const posix: typeof win32.posix
  export const sep: '/'
  export const delimiter: ':'
  export type PathComponent = import('oro:path/path').PathComponent
  import { Path } from 'oro:path/path'
  import * as mounts from 'oro:path/mounts'
  import * as win32 from 'oro:path/win32'
  import { DOWNLOADS } from 'oro:path/well-known'
  import { DOCUMENTS } from 'oro:path/well-known'
  import { RESOURCES } from 'oro:path/well-known'
  import { PICTURES } from 'oro:path/well-known'
  import { DESKTOP } from 'oro:path/well-known'
  import { VIDEOS } from 'oro:path/well-known'
  import { CONFIG } from 'oro:path/well-known'
  import { MEDIA } from 'oro:path/well-known'
  import { MUSIC } from 'oro:path/well-known'
  import { HOME } from 'oro:path/well-known'
  import { DATA } from 'oro:path/well-known'
  import { LOG } from 'oro:path/well-known'
  import { TMP } from 'oro:path/well-known'
  import * as exports from 'oro:path/posix'
  export {
    mounts,
    win32,
    Path,
    DOWNLOADS,
    DOCUMENTS,
    RESOURCES,
    PICTURES,
    DESKTOP,
    VIDEOS,
    CONFIG,
    MEDIA,
    MUSIC,
    HOME,
    DATA,
    LOG,
    TMP,
  }
}
```

</details>

<details>
<summary><code>oro:path/well-known</code></summary>

```ts
declare module 'oro:path/well-known' {
  /**
   * Well known path to the user's "Downloads" folder.
   * @type {?string}
   */
  export const DOWNLOADS: string | null
  /**
   * Well known path to the user's "Documents" folder.
   * @type {?string}
   */
  export const DOCUMENTS: string | null
  /**
   * Well known path to the user's "Pictures" folder.
   * @type {?string}
   */
  export const PICTURES: string | null
  /**
   * Well known path to the user's "Desktop" folder.
   * @type {?string}
   */
  export const DESKTOP: string | null
  /**
   * Well known path to the user's "Videos" folder.
   * @type {?string}
   */
  export const VIDEOS: string | null
  /**
   * Well known path to the user's "Music" folder.
   * @type {?string}
   */
  export const MUSIC: string | null
  /**
   * Well known path to the application's "resources" folder.
   * @type {?string}
   */
  export const RESOURCES: string | null
  /**
   * Well known path to the application's "config" folder.
   * @type {?string}
   */
  export const CONFIG: string | null
  /**
   * Well known path to the application's public "media" folder.
   * @type {?string}
   */
  export const MEDIA: string | null
  /**
   * Well known path to the application's "data" folder.
   * @type {?string}
   */
  export const DATA: string | null
  /**
   * Well known path to the application's "log" folder.
   * @type {?string}
   */
  export const LOG: string | null
  /**
   * Well known path to the application's "tmp" folder.
   * @type {?string}
   */
  export const TMP: string | null
  /**
   * Well known path to the application's "home" folder.
   * This may be the user's HOME directory or the application container sandbox.
   * @type {?string}
   */
  export const HOME: string | null
  namespace _default {
    export { DOWNLOADS }
    export { DOCUMENTS }
    export { RESOURCES }
    export { PICTURES }
    export { DESKTOP }
    export { VIDEOS }
    export { CONFIG }
    export { MEDIA }
    export { MUSIC }
    export { HOME }
    export { DATA }
    export { LOG }
    export { TMP }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:path/win32</code></summary>

```ts
declare module 'oro:path/win32' {
  /**
   * Computes current working directory for a path
   * @param {string}
   * @return {string}
   */
  export function cwd(): string
  /**
   * Resolves path components to an absolute path.
   * @param {...PathComponent} components
   * @return {string}
   */
  export function resolve(...components: PathComponent[]): string
  /**
   * Joins path components. This function may not return an absolute path.
   * @param {...PathComponent} components
   * @return {string}
   */
  export function join(...components: PathComponent[]): string
  /**
   * Computes directory name of path.
   * @param {PathComponent} path
   * @return {string}
   */
  export function dirname(path: PathComponent): string
  /**
   * Computes base name of path.
   * @param {PathComponent} path
   * @param {string=} [suffix]
   * @return {string}
   */
  export function basename(
    path: PathComponent,
    suffix?: string | undefined
  ): string
  /**
   * Computes extension name of path.
   * @param {PathComponent} path
   * @return {string}
   */
  export function extname(path: PathComponent): string
  /**
   * Predicate helper to determine if path is absolute.
   * @param {PathComponent} path
   * @return {boolean}
   */
  export function isAbsolute(path: PathComponent): boolean
  /**
   * Parses input `path` into a `Path` instance.
   * @param {PathComponent} path
   * @return {{ root: string, dir: string, base: string, ext: string, name: string }}
   */
  export function parse(path: PathComponent): {
    root: string
    dir: string
    base: string
    ext: string
    name: string
  }
  /**
   * Formats `Path` object into a string.
   * @param {object|Path} path
   * @return {string}
   */
  export function format(path: object | Path): string
  /**
   * Normalizes `path` resolving `..` and `.\` preserving trailing
   * slashes.
   * @param {string} path
   * @return {string}
   */
  export function normalize(path: string): string
  /**
   * Computes the relative path from `from` to `to`.
   * @param {string} from
   * @param {string} to
   * @return {string}
   */
  export function relative(from: string, to: string): string
  export default exports
  export const win32: typeof posix.win32
  export const sep: '\\'
  export const delimiter: ';'
  export type PathComponent = import('oro:path/path').PathComponent
  import { Path } from 'oro:path/path'
  import * as mounts from 'oro:path/mounts'
  import * as posix from 'oro:path/posix'
  import { DOWNLOADS } from 'oro:path/well-known'
  import { DOCUMENTS } from 'oro:path/well-known'
  import { RESOURCES } from 'oro:path/well-known'
  import { PICTURES } from 'oro:path/well-known'
  import { DESKTOP } from 'oro:path/well-known'
  import { VIDEOS } from 'oro:path/well-known'
  import { CONFIG } from 'oro:path/well-known'
  import { MEDIA } from 'oro:path/well-known'
  import { MUSIC } from 'oro:path/well-known'
  import { HOME } from 'oro:path/well-known'
  import { DATA } from 'oro:path/well-known'
  import { LOG } from 'oro:path/well-known'
  import { TMP } from 'oro:path/well-known'
  import * as exports from 'oro:path/win32'
  export {
    mounts,
    posix,
    Path,
    DOWNLOADS,
    DOCUMENTS,
    RESOURCES,
    PICTURES,
    DESKTOP,
    VIDEOS,
    CONFIG,
    MEDIA,
    MUSIC,
    HOME,
    DATA,
    LOG,
    TMP,
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
