# `oro:fs`

`oro:fs` provides filesystem APIs modeled on POSIX and Node.js.

## Import

The sync/callback surface:

```js
import * as fs from 'oro:fs'
```

Promises:

```js
import * as fs from 'oro:fs/promises'
```

## Basic example

```js
import * as fs from 'oro:fs/promises'

await fs.mkdir('./data', { recursive: true })
await fs.writeFile('./data/hello.txt', 'hello', 'utf8')
const text = await fs.readFile('./data/hello.txt', 'utf8')
console.log(text)
```

## Sandboxing

The runtime can restrict filesystem access via configuration. Common keys:

- `filesystem.sandbox_enabled`
- `filesystem.no_follow_symlinks`

See: [Config reference](?p=config/reference).

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:fs
oro:fs/bookmarks
oro:fs/constants
oro:fs/dir
oro:fs/fds
oro:fs/flags
oro:fs/handle
oro:fs/index
oro:fs/promises
oro:fs/stats
oro:fs/stream
oro:fs/watcher
oro:fs/web
```

### TypeScript declarations

<details>
<summary><code>oro:fs</code></summary>

```ts
declare module 'oro:fs' {
  export * from 'oro:fs/index'
  export default exports
  import * as exports from 'oro:fs/index'
}
```

</details>

<details>
<summary><code>oro:fs/bookmarks</code></summary>

```ts
declare module 'oro:fs/bookmarks' {
  /**
   * A map of known absolute file paths to file IDs that
   * have been granted access outside of the sandbox.
   * XXX(@jwerle): this is currently only used on linux, but values may
   * be added for all platforms, likely from a file system picker dialog.
   * @type {Map<string, string>}
   */
  export const temporary: Map<string, string>
  namespace _default {
    export { temporary }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:fs/constants</code></summary>

```ts
declare module 'oro:fs/constants' {
  /**
   * This flag can be used with uv_fs_copyfile() to return an error if the
   * destination already exists.
   * @type {number}
   */
  export const COPYFILE_EXCL: number
  /**
   * This flag can be used with uv_fs_copyfile() to attempt to create a reflink.
   * If copy-on-write is not supported, a fallback copy mechanism is used.
   * @type {number}
   */
  export const COPYFILE_FICLONE: number
  /**
   * This flag can be used with uv_fs_copyfile() to attempt to create a reflink.
   * If copy-on-write is not supported, an error is returned.
   * @type {number}
   */
  export const COPYFILE_FICLONE_FORCE: number
  /**
   * A constant representing a directory entry whose type is unknown.
   * It indicates that the type of the file or directory cannot be determined.
   * @type {number}
   */
  export const UV_DIRENT_UNKNOWN: number
  /**
   * A constant representing a directory entry of type file.
   * It indicates that the entry is a regular file.
   * @type {number}
   */
  export const UV_DIRENT_FILE: number
  /**
   * A constant epresenting a directory entry of type directory.
   * It indicates that the entry is a directory.
   * @type {number}
   */
  export const UV_DIRENT_DIR: number
  /**
   * A constant representing a directory entry of type symbolic link.
   * @type {number}
   */
  export const UV_DIRENT_LINK: number
  /**
   * A constant representing a directory entry of type FIFO (named pipe).
   * @type {number}
   */
  export const UV_DIRENT_FIFO: number
  /**
   * A constant representing a directory entry of type socket.
   * @type {number}
   */
  export const UV_DIRENT_SOCKET: number
  /**
   * A constant representing a directory entry of type character device
   * @type {number}
   */
  export const UV_DIRENT_CHAR: number
  /**
   * A constant representing a directory entry of type block device.
   * @type {number}
   */
  export const UV_DIRENT_BLOCK: number
  /**
   * A constant representing a symlink should target a directory.
   * @type {number}
   */
  export const UV_FS_SYMLINK_DIR: number
  /**
   * A constant representing a symlink should be created as a Windows junction.
   * @type {number}
   */
  export const UV_FS_SYMLINK_JUNCTION: number
  /**
   * A constant representing an opened file for memory mapping on Windows systems.
   * @type {number}
   */
  export const UV_FS_O_FILEMAP: number
  /**
   * Opens a file for read-only access.
   * @type {number}
   */
  export const O_RDONLY: number
  /**
   * Opens a file for write-only access.
   * @type {number}
   */
  export const O_WRONLY: number
  /**
   * Opens a file for both reading and writing.
   * @type {number}
   */
  export const O_RDWR: number
  /**
   * Appends data to the file instead of overwriting.
   * @type {number}
   */
  export const O_APPEND: number
  /**
   * Enables asynchronous I/O notifications.
   * @type {number}
   */
  export const O_ASYNC: number
  /**
   * Ensures file descriptors are closed on `exec()` calls.
   * @type {number}
   */
  export const O_CLOEXEC: number
  /**
   * Creates a new file if it does not exist.
   * @type {number}
   */
  export const O_CREAT: number
  /**
   * Minimizes caching effects for file I/O.
   * @type {number}
   */
  export const O_DIRECT: number
  /**
   * Ensures the opened file is a directory.
   * @type {number}
   */
  export const O_DIRECTORY: number
  /**
   * Writes file data synchronously.
   * @type {number}
   */
  export const O_DSYNC: number
  /**
   * Fails the operation if the file already exists.
   * @type {number}
   */
  export const O_EXCL: number
  /**
   * Enables handling of large files.
   * @type {number}
   */
  export const O_LARGEFILE: number
  /**
   * Prevents updating the file's last access time.
   * @type {number}
   */
  export const O_NOATIME: number
  /**
   * Prevents becoming the controlling terminal for the process.
   * @type {number}
   */
  export const O_NOCTTY: number
  /**
   * Does not follow symbolic links.
   * @type {number}
   */
  export const O_NOFOLLOW: number
  /**
   * Opens the file in non-blocking mode.
   * @type {number}
   */
  export const O_NONBLOCK: number
  /**
   * Alias for `O_NONBLOCK` on some systems.
   * @type {number}
   */
  export const O_NDELAY: number
  /**
   * Obtains a file descriptor for a file but does not open it.
   * @type {number}
   */
  export const O_PATH: number
  /**
   * Writes both file data and metadata synchronously.
   * @type {number}
   */
  export const O_SYNC: number
  /**
   * Creates a temporary file that is not linked to a directory.
   * @type {number}
   */
  export const O_TMPFILE: number
  /**
   * Truncates the file to zero length if it exists.
   * @type {number}
   */
  export const O_TRUNC: number
  /**
   * Bitmask for extracting the file type from a mode.
   * @type {number}
   */
  export const S_IFMT: number
  /**
   * Indicates a regular file.
   * @type {number}
   */
  export const S_IFREG: number
  /**
   * Indicates a directory.
   * @type {number}
   */
  export const S_IFDIR: number
  /**
   * Indicates a character device.
   * @type {number}
   */
  export const S_IFCHR: number
  /**
   * Indicates a block device.
   * @type {number}
   */
  export const S_IFBLK: number
  /**
   * Indicates a FIFO (named pipe).
   * @type {number}
   */
  export const S_IFIFO: number
  /**
   * Indicates a symbolic link.
   * @type {number}
   */
  export const S_IFLNK: number
  /**
   * Indicates a socket.
   * @type {number}
   */
  export const S_IFSOCK: number
  /**
   * Grants read, write, and execute permissions for the file owner.
   * @type {number}
   */
  export const S_IRWXU: number
  /**
   * Grants read permission for the file owner.
   * @type {number}
   */
  export const S_IRUSR: number
  /**
   * Grants write permission for the file owner.
   * @type {number}
   */
  export const S_IWUSR: number
  /**
   * Grants execute permission for the file owner.
   * @type {number}
   */
  export const S_IXUSR: number
  /**
   * Grants read, write, and execute permissions for the group.
   * @type {number}
   */
  export const S_IRWXG: number
  /**
   * Grants read permission for the group.
   * @type {number}
   */
  export const S_IRGRP: number
  /**
   * Grants write permission for the group.
   * @type {number}
   */
  export const S_IWGRP: number
  /**
   * Grants execute permission for the group.
   * @type {number}
   */
  export const S_IXGRP: number
  /**
   * Grants read, write, and execute permissions for others.
   * @type {number}
   */
  export const S_IRWXO: number
  /**
   * Grants read permission for others.
   * @type {number}
   */
  export const S_IROTH: number
  /**
   * Grants write permission for others.
   * @type {number}
   */
  export const S_IWOTH: number
  /**
   * Grants execute permission for others.
   * @type {number}
   */
  export const S_IXOTH: number
  /**
   * Checks for the existence of a file.
   * @type {number}
   */
  export const F_OK: number
  /**
   * Checks for read permission on a file.
   * @type {number}
   */
  export const R_OK: number
  /**
   * Checks for write permission on a file.
   * @type {number}
   */
  export const W_OK: number
  /**
   * Checks for execute permission on a file.
   * @type {number}
   */
  export const X_OK: number
  export default exports
  import * as exports from 'oro:fs/constants'
}
```

</details>

<details>
<summary><code>oro:fs/dir</code></summary>

```ts
declare module 'oro:fs/dir' {
  /**
   * Sorts directory entries
   * @param {string|Dirent} a
   * @param {string|Dirent} b
   * @return {number}
   */
  export function sortDirectoryEntries(
    a: string | Dirent,
    b: string | Dirent
  ): number
  export const kType: unique symbol
  /**
   * A containerr for a directory and its entries. This class supports scanning
   * a directory entry by entry with a `read()` method. The `Symbol.asyncIterator`
   * interface is exposed along with an AsyncGenerator `entries()` method.
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#class-fsdir}
   */
  export class Dir {
    static from(fdOrHandle: any, options: any): Dir
    /**
     * `Dir` class constructor.
     * @param {DirectoryHandle} handle
     * @param {object=} options
     */
    constructor(handle: DirectoryHandle, options?: object | undefined)
    path: any
    handle: DirectoryHandle
    encoding: any
    withFileTypes: boolean
    /**
     * `true` if closed, otherwise `false`.
     * @ignore
     * @type {boolean}
     */
    get closed(): boolean
    /**
     * `true` if closing, otherwise `false`.
     * @ignore
     * @type {boolean}
     */
    get closing(): boolean
    /**
     * Closes container and underlying handle.
     * @param {object|function} options
     * @param {function=} callback
     */
    close(
      options?: object | Function,
      callback?: Function | undefined
    ): Promise<any>
    /**
     * Closes container and underlying handle
     * synchronously.
     * @param {object=} [options]
     */
    closeSync(options?: object | undefined): void
    /**
     * Reads and returns directory entry.
     * @param {object|function} options
     * @param {function=} callback
     * @return {Promise<Dirent[]|string[]>}
     */
    read(
      options: object | Function,
      callback?: Function | undefined
    ): Promise<Dirent[] | string[]>
    /**
     * Reads and returns directory entry synchronously.
     * @param {object|function} options
     * @return {Dirent[]|string[]}
     */
    readSync(options?: object | Function): Dirent[] | string[]
    /**
     * AsyncGenerator which yields directory entries.
     * @param {object=} options
     */
    entries(
      options?: object | undefined
    ): AsyncGenerator<string | Dirent, void, unknown>
    /**
     * `for await (...)` AsyncGenerator support.
     */
    get [Symbol.asyncIterator](): (
      options?: object | undefined
    ) => AsyncGenerator<string | Dirent, void, unknown>
  }
  /**
   * A container for a directory entry.
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#class-fsdirent}
   */
  export class Dirent {
    static get UNKNOWN(): number
    static get FILE(): number
    static get DIR(): number
    static get LINK(): number
    static get FIFO(): number
    static get SOCKET(): number
    static get CHAR(): number
    static get BLOCK(): number
    /**
     * Creates `Dirent` instance from input.
     * @param {object|string} name
     * @param {(string|number)=} type
     */
    static from(
      name: object | string,
      type?: (string | number) | undefined
    ): Dirent
    /**
     * `Dirent` class constructor.
     * @param {string} name
     * @param {string|number} type
     */
    constructor(name: string, type: string | number)
    name: string
    /**
     * Read only type.
     */
    get type(): number
    /**
     * `true` if `Dirent` instance is a directory.
     */
    isDirectory(): boolean
    /**
     * `true` if `Dirent` instance is a file.
     */
    isFile(): boolean
    /**
     * `true` if `Dirent` instance is a block device.
     */
    isBlockDevice(): boolean
    /**
     * `true` if `Dirent` instance is a character device.
     */
    isCharacterDevice(): boolean
    /**
     * `true` if `Dirent` instance is a symbolic link.
     */
    isSymbolicLink(): boolean
    /**
     * `true` if `Dirent` instance is a FIFO.
     */
    isFIFO(): boolean
    /**
     * `true` if `Dirent` instance is a socket.
     */
    isSocket(): boolean
    [kType]: number
  }
  export default exports
  import { DirectoryHandle } from 'oro:fs/handle'
  import * as exports from 'oro:fs/dir'
}
```

</details>

<details>
<summary><code>oro:fs/fds</code></summary>

```ts
declare module 'oro:fs/fds' {
  const _default: {
    types: Map<any, any>
    fds: Map<any, any>
    ids: Map<any, any>
    get size(): number
    get(id: any): any
    syncOpenDescriptors(): Promise<void>
    set(id: any, fd: any, type: any): void
    has(id: any): boolean
    fd(id: any): any
    id(fd: any): any
    release(id: any, closeDescriptor?: boolean): Promise<void>
    retain(id: any): Promise<string | object | Uint8Array<ArrayBufferLike>>
    delete(id: any): void
    clear(): void
    typeof(id: any): any
    entries(): MapIterator<[any, any]>
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:fs/flags</code></summary>

```ts
declare module 'oro:fs/flags' {
  export function normalizeFlags(flags: any): number
  export default exports
  import * as exports from 'oro:fs/flags'
}
```

</details>

<details>
<summary><code>oro:fs/handle</code></summary>

```ts
declare module 'oro:fs/handle' {
  export const kOpening: unique symbol
  export const kClosing: unique symbol
  export const kClosed: unique symbol
  /**
   * A container for a descriptor tracked in `fds` and opened in the native layer.
   * This class implements the Node.js `FileHandle` interface
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#class-filehandle}
   */
  export class FileHandle extends EventEmitter {
    [x: number]: (options: any) => import('oro:gc').Finalizer
    /**
     * Emitted when the file handle has been opened.
     * @event FileHandle#open
     * @type {(fd: number) => void}
     */
    /**
     * Emitted when the file handle has been closed.
     * @event FileHandle#close
     * @type {() => void}
     */
    static get DEFAULT_ACCESS_MODE(): () => void
    static get DEFAULT_OPEN_FLAGS(): string
    static get DEFAULT_OPEN_MODE(): number
    /**
     * Creates a `FileHandle` from a given `id` or `fd`
     * @param {string|number|FileHandle|object|FileSystemFileHandle} id
     * @return {FileHandle}
     */
    static from(
      id: string | number | FileHandle | object | FileSystemFileHandle
    ): FileHandle
    /**
     * Determines if access to `path` for `mode` is possible.
     * @param {string} path
     * @param {number} [mode = 0o666]
     * @param {object=} [options]
     * @return {Promise<boolean>}
     */
    static access(
      path: string,
      mode?: number,
      options?: object | undefined
    ): Promise<boolean>
    /**
     * Asynchronously open a file.
     * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromisesopenpath-flags-mode}
     * @param {string | Buffer | URL} path
     * @param {string=} [flags = 'r']
     * @param {string|number=} [mode = 0o666]
     * @param {object=} [options]
     * @return {Promise<FileHandle>}
     */
    static open(
      path: string | Buffer | URL,
      flags?: string | undefined,
      mode?: (string | number) | undefined,
      options?: object | undefined
    ): Promise<FileHandle>
    /**
     * `FileHandle` class constructor
     * @ignore
     * @param {object} options
     */
    constructor(options: object)
    flags: number
    path: any
    mode: any
    id: string
    fd: any
    /**
     * `true` if the `FileHandle` instance has been opened.
     * @type {boolean}
     */
    get opened(): boolean
    /**
     * `true` if the `FileHandle` is opening.
     * @type {boolean}
     */
    get opening(): boolean
    /**
     * `true` if the `FileHandle` is closing.
     * @type {boolean}
     */
    get closing(): boolean
    /**
     * `true` if the `FileHandle` is closed.
     */
    get closed(): boolean
    /**
     * Appends to a file, if handle was opened with `O_APPEND`, otherwise this
     * method is just an alias to `FileHandle#writeFile()`.
     * @param {string|Buffer|TypedArray|Array} data
     * @param {object=} [options]
     * @param {string=} [options.encoding = 'utf8']
     * @param {object=} [options.signal]
     */
    appendFile(
      data: string | Buffer | TypedArray | any[],
      options?: object | undefined
    ): Promise<
      | TypeError
      | {
          buffer: any
          bytesWritten: number
        }
    >
    /**
     * Change permissions of file handle.
     * @param {number} mode
     * @param {object=} [options]
     */
    chmod(mode: number, options?: object | undefined): Promise<TypeError>
    /**
     * Change ownership of file handle.
     * @param {number} uid
     * @param {number} gid
     * @param {object=} [options]
     */
    chown(
      uid: number,
      gid: number,
      options?: object | undefined
    ): Promise<TypeError>
    /**
     * Close underlying file handle
     * @param {object=} [options]
     */
    close(options?: object | undefined): Promise<any>
    /**
     * Creates a `ReadStream` for the underlying file.
     * @param {object=} [options] - An options object
     */
    createReadStream(options?: object | undefined): ReadStream
    /**
     * Creates a `WriteStream` for the underlying file.
     * @param {object=} [options] - An options object
     */
    createWriteStream(options?: object | undefined): WriteStream
    /**
     * @param {object=} [options]
     */
    datasync(): Promise<TypeError>
    /**
     * Opens the underlying descriptor for the file handle.
     * @param {object=} [options]
     */
    open(options?: object | undefined): Promise<any>
    /**
     * Reads `length` bytes starting from `position` into `buffer` at
     * `offset`.
     * @param {Buffer|object} buffer
     * @param {number=} [offset]
     * @param {number=} [length]
     * @param {number=} [position]
     * @param {object=} [options]
     */
    read(
      buffer: Buffer | object,
      offset?: number | undefined,
      length?: number | undefined,
      position?: number | undefined,
      options?: object | undefined
    ): Promise<{
      bytesRead: number
      buffer: any
    }>
    /**
     * Read into multiple buffers sequentially (vector read)
     * @param {Array<Buffer|TypedArray>} buffers
     * @param {number|null=} [position]
     * @returns {Promise<{ bytesRead: number, buffers: any[] }>}
     */
    readv(
      buffers: Array<Buffer | TypedArray>,
      position?: (number | null) | undefined
    ): Promise<{
      bytesRead: number
      buffers: any[]
    }>
    /**
     * Reads the entire contents of a file and returns it as a buffer or a string
     * specified of a given encoding specified at `options.encoding`.
     * @param {object=} [options]
     * @param {string=} [options.encoding = 'utf8']
     * @param {object=} [options.signal]
     */
    readFile(options?: object | undefined): Promise<string | Uint8Array<any>>
    /**
     * Returns the stats of the underlying file.
     * @param {object=} [options]
     * @return {Promise<Stats>}
     */
    stat(options?: object | undefined): Promise<Stats>
    /**
     * Returns the stats of the underlying symbolic link.
     * @param {object=} [options]
     * @return {Promise<Stats>}
     */
    lstat(options?: object | undefined): Promise<Stats>
    /**
     * Synchronize a file's in-core state with storage device
     * @return {Promise}
     */
    sync(): Promise<any>
    /**
     * @param {number} [offset = 0]
     * @return {Promise}
     */
    truncate(offset?: number): Promise<any>
    /**
     * Writes `length` bytes at `offset` in `buffer` to the underlying file
     * at `position`.
     * @param {Buffer|object} buffer
     * @param {number} offset
     * @param {number} length
     * @param {number} position
     * @param {object=} [options]
     */
    write(
      buffer: Buffer | object,
      offset: number,
      length: number,
      position: number,
      options?: object | undefined
    ): Promise<
      | TypeError
      | {
          buffer: any
          bytesWritten: number
        }
    >
    /**
     * Write multiple buffers sequentially (vector write)
     * @param {Array<Buffer|TypedArray>} buffers
     * @param {number|null=} [position]
     * @returns {Promise<number>} bytesWritten
     */
    writev(
      buffers: Array<Buffer | TypedArray>,
      position?: (number | null) | undefined
    ): Promise<number>
    /**
     * Writes `data` to file.
     * @param {string|Buffer|TypedArray|Array} data
     * @param {object=} [options]
     * @param {string=} [options.encoding = 'utf8']
     * @param {object=} [options.signal]
     */
    writeFile(
      data: string | Buffer | TypedArray | any[],
      options?: object | undefined
    ): Promise<TypeError>
    [kOpening]: any;
    [kClosing]: any;
    [kClosed]: boolean
    #private
  }
  /**
   * A container for a directory handle tracked in `fds` and opened in the
   * native layer.
   */
  export class DirectoryHandle extends EventEmitter {
    [x: number]: (options: any) => import('oro:gc').Finalizer
    /**
     * The max number of entries that can be bufferd with the `bufferSize`
     * option.
     */
    static get MAX_BUFFER_SIZE(): number
    static get MAX_ENTRIES(): number
    /**
     * The default number of entries `Dirent` that are buffered
     * for each read request.
     */
    static get DEFAULT_BUFFER_SIZE(): number
    /**
     * Creates a `DirectoryHandle` from a given `id` or `fd`
     * @param {string|number|DirectoryHandle|object|FileSystemDirectoryHandle} id
     * @param {object} options
     * @return {DirectoryHandle}
     */
    static from(
      id:
        | string
        | number
        | DirectoryHandle
        | object
        | FileSystemDirectoryHandle,
      options: object
    ): DirectoryHandle
    /**
     * Asynchronously open a directory.
     * @param {string | Buffer | URL} path
     * @param {object=} [options]
     * @return {Promise<DirectoryHandle>}
     */
    static open(
      path: string | Buffer | URL,
      options?: object | undefined
    ): Promise<DirectoryHandle>
    /**
     * `DirectoryHandle` class constructor
     * @private
     * @param {object} options
     */
    private constructor()
    id: string
    path: any
    bufferSize: number
    /**
     * DirectoryHandle file descriptor id
     */
    get fd(): string
    /**
     * `true` if the `DirectoryHandle` instance has been opened.
     * @type {boolean}
     */
    get opened(): boolean
    /**
     * `true` if the `DirectoryHandle` is opening.
     * @type {boolean}
     */
    get opening(): boolean
    /**
     * `true` if the `DirectoryHandle` is closing.
     * @type {boolean}
     */
    get closing(): boolean
    /**
     * `true` if `DirectoryHandle` is closed.
     */
    get closed(): boolean
    /**
     * Opens the underlying handle for a directory.
     * @param {object=} options
     * @return {Promise<boolean>}
     */
    open(options?: object | undefined): Promise<boolean>
    /**
     * Close underlying directory handle
     * @param {object=} [options]
     */
    close(options?: object | undefined): Promise<any>
    /**
     * Reads directory entries
     * @param {object=} [options]
     * @param {number=} [options.entries = DirectoryHandle.MAX_ENTRIES]
     */
    read(options?: object | undefined): Promise<any>
    [kOpening]: any;
    [kClosing]: any;
    [kClosed]: boolean
    #private
  }
  export default exports
  export type TypedArray = Uint8Array | Int8Array
  import { EventEmitter } from 'oro:events'
  import { Buffer } from 'oro:buffer'
  import { ReadStream } from 'oro:fs/stream'
  import { WriteStream } from 'oro:fs/stream'
  import { Stats } from 'oro:fs/stats'
  import * as exports from 'oro:fs/handle'
}
```

</details>

<details>
<summary><code>oro:fs/index</code></summary>

```ts
declare module 'oro:fs/index' {
  /**
   * Polls for file changes and invokes listener with (curr, prev) Stats.
   * This is a compatibility helper; prefer fs.watch for evented changes.
   * @param {string} path
   * @param {object|function} [options]
   * @param {number} [options.interval=5007]
   * @param {boolean} [options.bigint=false]
   * @param {function(Stats, Stats)} [listener]
   */
  export function watchFile(
    path: string,
    options?: object | Function,
    listener?: (arg0: Stats, arg1: Stats) => any
  ): void
  /**
   * Removes a watchFile listener or stops watching entirely for a path.
   * @param {string} path
   * @param {function=} listener
   */
  export function unwatchFile(
    path: string,
    listener?: Function | undefined
  ): void
  /**
   * Asynchronously check access to a file for a given mode calling `callback`
   * upon success or error.
   * @see {@link https://nodejs.org/api/fs.html#fsopenpath-flags-mode-callback}
   * @param {string | Buffer | URL} path
   * @param {number|function(Error|null):any} [mode = F_OK(0)]
   * @param {function(Error|null):any} [callback]
   */
  export function access(
    path: string | Buffer | URL,
    mode?: number | ((arg0: Error | null) => any),
    callback?: (arg0: Error | null) => any
  ): void
  /**
   * Synchronously check access to a file for a given mode calling `callback`
   * upon success or error.
   * @see {@link https://nodejs.org/api/fs.html#fsopenpath-flags-mode-callback}
   * @param {string | Buffer | URL} path
   * @param {number} [mode = F_OK(0)]
   */
  export function accessSync(
    path: string | Buffer | URL,
    mode?: number
  ): boolean
  /**
   * Checks if a path exists
   * @param {string | Buffer | URL} path
   * @param {function(Boolean)?} [callback]
   */
  export function exists(
    path: string | Buffer | URL,
    callback?: ((arg0: boolean) => any) | null
  ): void
  /**
   * Checks if a path exists
   * @param {string | Buffer | URL} path
   * @param {function(Boolean)?} [callback]
   */
  export function existsSync(path: string | Buffer | URL): boolean
  /**
   * Asynchronously changes the permissions of a file.
   * No arguments other than a possible exception are given to the completion callback
   *
   * @see {@link https://nodejs.org/api/fs.html#fschmodpath-mode-callback}
   *
   * @param {string | Buffer | URL} path
   * @param {number} mode
   * @param {function(Error?)} callback
   */
  export function chmod(
    path: string | Buffer | URL,
    mode: number,
    callback: (arg0: Error | null) => any
  ): TypeError
  /**
   * Synchronously changes the permissions of a file.
   *
   * @see {@link https://nodejs.org/api/fs.html#fschmodpath-mode-callback}
   * @param {string | Buffer | URL} path
   * @param {number} mode
   */
  export function chmodSync(path: string | Buffer | URL, mode: number): void
  /**
   * Changes ownership of file or directory at `path` with `uid` and `gid`.
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   * @param {function} callback
   */
  export function chown(
    path: string,
    uid: number,
    gid: number,
    callback: Function
  ): TypeError
  /**
   * Changes ownership of file or directory at `path` with `uid` and `gid`.
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   */
  export function chownSync(path: string, uid: number, gid: number): void
  /**
   * Asynchronously close a file descriptor calling `callback` upon success or error.
   * @see {@link https://nodejs.org/api/fs.html#fsclosefd-callback}
   * @param {number} fd
   * @param {function(Error?)?} [callback]
   */
  export function close(
    fd: number,
    callback?: ((arg0: Error | null) => any) | null
  ): void
  /**
   * Synchronously close a file descriptor.
   * @param {number} fd  - fd
   */
  export function closeSync(fd: number): void
  /**
   * Asynchronously copies `src` to `dest` calling `callback` upon success or error.
   * @param {string} src - The source file path.
   * @param {string} dest - The destination file path.
   * @param {number} flags - Modifiers for copy operation.
   * @param {function(Error=)=} [callback] - The function to call after completion.
   * @see {@link https://nodejs.org/api/fs.html#fscopyfilesrc-dest-mode-callback}
   */
  export function copyFile(
    src: string,
    dest: string,
    flags?: number,
    callback?: ((arg0: Error | undefined) => any) | undefined
  ): void
  /**
   * Synchronously copies `src` to `dest` calling `callback` upon success or error.
   * @param {string} src - The source file path.
   * @param {string} dest - The destination file path.
   * @param {number} flags - Modifiers for copy operation.
   * @see {@link https://nodejs.org/api/fs.html#fscopyfilesrc-dest-mode-callback}
   */
  export function copyFileSync(src: string, dest: string, flags?: number): void
  /**
   * @see {@link https://nodejs.org/api/fs.html#fscreatewritestreampath-options}
   * @param {string | Buffer | URL} path
   * @param {object?} [options]
   * @returns {ReadStream}
   */
  export function createReadStream(
    path: string | Buffer | URL,
    options?: object | null
  ): ReadStream
  /**
   * @see {@link https://nodejs.org/api/fs.html#fscreatewritestreampath-options}
   * @param {string | Buffer | URL} path
   * @param {object?} [options]
   * @returns {WriteStream}
   */
  export function createWriteStream(
    path: string | Buffer | URL,
    options?: object | null
  ): WriteStream
  /**
   * Invokes the callback with the <fs.Stats> for the file descriptor. See
   * the POSIX fstat(2) documentation for more detail.
   *
   * @see {@link https://nodejs.org/api/fs.html#fsfstatfd-options-callback}
   *
   * @param {number} fd - A file descriptor.
   * @param {object?|function?} [options] - An options object.
   * @param {function?} callback - The function to call after completion.
   */
  export function fstat(
    fd: number,
    options: any,
    callback: Function | null
  ): void
  /**
   * Request that all data for the open file descriptor is flushed
   * to the storage device.
   * @param {number} fd - A file descriptor.
   * @param {function} callback - The function to call after completion.
   */
  export function fsync(fd: number, callback: Function): void
  /**
   * Truncates the file up to `offset` bytes.
   * @param {number} fd - A file descriptor.
   * @param {number=|function} [offset = 0]
   * @param {function?} callback - The function to call after completion.
   */
  export function ftruncate(
    fd: number,
    offset: any,
    callback: Function | null
  ): void
  /**
   * Chages ownership of link at `path` with `uid` and `gid.
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   * @param {function} callback
   */
  export function lchown(
    path: string,
    uid: number,
    gid: number,
    callback: Function
  ): TypeError
  /**
   * Changes permissions of link at `path` with `mode` (POSIX). No-op where unsupported.
   */
  export function lchmod(path: any, mode: any, callback: any): void
  export function lchmodSync(path: any, mode: any): void
  /**
   * Creates a link to `dest` from `src`.
   * @param {string} src
   * @param {string} dest
   * @param {function}
   */
  export function link(src: string, dest: string, callback: any): void
  /**
   * Creates a hard link synchronously
   * @param {string} src
   * @param {string} dest
   */
  export function linkSync(src: string, dest: string): void
  /**
   * @ignore
   */
  export function mkdir(path: any, options: any, callback: any): void
  /**
   * @ignore
   * @param {string|URL} path
   * @param {object=} [options]
   */
  export function mkdirSync(
    path: string | URL,
    options?: object | undefined
  ): void
  /**
   * Create a unique temporary directory. The `prefix` is appended with a
   * platform-specific unique suffix.
   * @param {string} prefix
   * @param {object|string|function} [options]
   * @param {string} [options.encoding='utf8']
   * @param {function(Error|null, string|Buffer):any} [callback]
   */
  export function mkdtemp(
    prefix: string,
    options?: object | string | Function,
    callback?: (arg0: Error | null, arg1: string | Buffer) => any
  ): void
  /** Create a unique temporary directory synchronously */
  export function mkdtempSync(prefix: any, options?: any): any
  /**
   * Asynchronously open a file calling `callback` upon success or error.
   * @see {@link https://nodejs.org/api/fs.html#fsopenpath-flags-mode-callback}
   * @param {string | Buffer | URL} path
   * @param {string=} [flags = 'r']
   * @param {number=} [mode = 0o666]
   * @param {(object|function(Error|null, number|undefined):any)=} [options]
   * @param {(function(Error|null, number|undefined):any)|null} [callback]
   */
  export function open(
    path: string | Buffer | URL,
    flags?: string | undefined,
    mode?: number | undefined,
    options?:
      | (object | ((arg0: Error | null, arg1: number | undefined) => any))
      | undefined,
    callback?: ((arg0: Error | null, arg1: number | undefined) => any) | null
  ): void
  /**
   * Synchronously open a file.
   * @param {string|Buffer|URL} path
   * @param {string=} [flags = 'r']
   * @param {string=} [mode = 0o666]
   * @param {object=} [options]
   */
  export function openSync(
    path: string | Buffer | URL,
    flags?: string | undefined,
    mode?: string | undefined,
    options?: object | undefined
  ): any
  /**
   * Asynchronously open a directory calling `callback` upon success or error.
   * @see {@link https://nodejs.org/api/fs.html#fsreaddirpath-options-callback}
   * @param {string | Buffer | URL} path
   * @param {(object|function(Error|null, Dir|undefined):any)=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {boolean=} [options.withFileTypes = false]
   * @param {function(Error|null, Dir|undefined):any)} callback
   */
  export function opendir(
    path: string | Buffer | URL,
    options?:
      | (object | ((arg0: Error | null, arg1: Dir | undefined) => any))
      | undefined,
    callback: any
  ): void
  /**
   * Synchronously open a directory.
   * @see {@link https://nodejs.org/api/fs.html#fsreaddirpath-options-callback}
   * @param {string|Buffer|URL} path
   * @param {object} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {boolean=} [options.withFileTypes = false]
   * @return {Dir}
   */
  export function opendirSync(
    path: string | Buffer | URL,
    options?: {
      encoding?: string | undefined
      withFileTypes?: boolean | undefined
    }
  ): Dir
  /**
   * Asynchronously read from an open file descriptor.
   * @see {@link https://nodejs.org/api/fs.html#fsreadfd-buffer-offset-length-position-callback}
   * @param {number} fd
   * @param {object|Buffer|Uint8Array} buffer - The buffer that the data will be written to.
   * @param {number} offset - The position in buffer to write the data to.
   * @param {number} length - The number of bytes to read.
   * @param {number|BigInt|null} position - Specifies where to begin reading from in the file. If position is null or -1 , data will be read from the current file position, and the file position will be updated. If position is an integer, the file position will be unchanged.
   * @param {function(Error|null, number|undefined, Buffer|undefined):any} callback
   */
  export function read(
    fd: number,
    buffer: object | Buffer | Uint8Array,
    offset: number,
    length: number,
    position: number | bigint | null,
    options: any,
    callback: (
      arg0: Error | null,
      arg1: number | undefined,
      arg2: Buffer | undefined
    ) => any
  ): void
  /**
   * Asynchronously write to an open file descriptor.
   * @see {@link https://nodejs.org/api/fs.html#fswritefd-buffer-offset-length-position-callback}
   * @param {number} fd
   * @param {object|Buffer|Uint8Array} buffer - The buffer that the data will be written to.
   * @param {number} offset - The position in buffer to write the data to.
   * @param {number} length - The number of bytes to read.
   * @param {number|BigInt|null} position - Specifies where to begin reading from in the file. If position is null or -1 , data will be read from the current file position, and the file position will be updated. If position is an integer, the file position will be unchanged.
   * @param {function(Error|null, number|undefined, Buffer|undefined):any} callback
   */
  export function write(
    fd: number,
    buffer: object | Buffer | Uint8Array,
    offset: number,
    length: number,
    position: number | bigint | null,
    options: any,
    callback: (
      arg0: Error | null,
      arg1: number | undefined,
      arg2: Buffer | undefined
    ) => any
  ): void
  /**
   * Vector write convenience: writes multiple buffers sequentially to fd
   * @param {number} fd
   * @param {Array<Buffer|TypedArray>} buffers
   * @param {number|null|function} [position]
   * @param {function(Error|null, number=):any} [callback]
   */
  export function writev(
    fd: number,
    buffers: Array<Buffer | TypedArray>,
    position?: number | null | Function,
    callback?: (arg0: Error | null, arg1: number | undefined) => any
  ): void
  /**
   * Vector read convenience: reads into multiple buffers sequentially from fd
   * @param {number} fd
   * @param {Array<Buffer|TypedArray>} buffers
   * @param {number|null|function} [position]
   * @param {function(Error|null, number, any[]):any} [callback]
   */
  export function readv(
    fd: number,
    buffers: Array<Buffer | TypedArray>,
    position?: number | null | Function,
    callback?: (arg0: Error | null, arg1: number, arg2: any[]) => any
  ): void
  /**
   * Asynchronously read all entries in a directory.
   * @see {@link https://nodejs.org/api/fs.html#fsreaddirpath-options-callback}
   * @param {string|Buffer|URL} path
   * @param {object|function(Error|null, (Dirent|string)[]|undefined):any} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {boolean=} [options.withFileTypes = false]
   * @param {function(Error|null, (Dirent|string)[]):any} callback
   */
  export function readdir(
    path: string | Buffer | URL,
    options?:
      | object
      | ((arg0: Error | null, arg1: (Dirent | string)[] | undefined) => any),
    callback: (arg0: Error | null, arg1: (Dirent | string)[]) => any
  ): void
  /**
   * Synchronously read all entries in a directory.
   * @see {@link https://nodejs.org/api/fs.html#fsreaddirpath-options-callback}
   * @param {string|Buffer | URL } path
   * @param {object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {boolean=} [options.withFileTypes = false]
   * @return {(Dirent|string)[]}
   */
  export function readdirSync(
    path: string | Buffer | URL,
    options?: object | undefined
  ): (Dirent | string)[]
  /**
   * @param {string|Buffer|URL|number} path
   * @param {object|function(Error|null, Buffer|string|undefined):any} options
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.flag = 'r']
   * @param {AbortSignal|undefined} [options.signal]
   * @param {function(Error|null, Buffer|string|undefined):any} callback
   */
  export function readFile(
    path: string | Buffer | URL | number,
    options:
      | object
      | ((arg0: Error | null, arg1: Buffer | string | undefined) => any),
    callback: (arg0: Error | null, arg1: Buffer | string | undefined) => any
  ): void
  /**
   * @param {string|Buffer|URL|number} path
   * @param {{ encoding?: string, flags?: string }} [options]
   * @param {object|function(Error|null, Buffer|undefined):any} [options]
   * @param {AbortSignal|undefined} [options.signal]
   * @return {string|Buffer}
   */
  export function readFileSync(
    path: string | Buffer | URL | number,
    options?: {
      encoding?: string
      flags?: string
    }
  ): string | Buffer
  /**
   * Reads link at `path`
   * @param {string} path
   * @param {function(Error|null, string|undefined):any} callback
   */
  export function readlink(
    path: string,
    options: any,
    callback: (arg0: Error | null, arg1: string | undefined) => any
  ): void
  /**
   * Reads link target at `path` synchronously
   * @param {string} path
   * @return {string}
   */
  export function readlinkSync(path: string, options?: any): string
  /**
   * Computes real path for `path`
   * @param {string} path
   * @param {function(Error|null, string|undefined):any} callback
   */
  export function realpath(
    path: string,
    callback: (arg0: Error | null, arg1: string | undefined) => any
  ): void
  /**
   * Computes real path for `path`
   * @param {string} path
   * @return {string}
   */
  export function realpathSync(path: string): string
  /**
   * Renames file or directory at `src` to `dest`.
   * @param {string} src
   * @param {string} dest
   * @param {function(Error|null):any} callback
   */
  export function rename(
    src: string,
    dest: string,
    callback: (arg0: Error | null) => any
  ): void
  /**
   * Renames file or directory at `src` to `dest`, synchronously.
   * @param {string} src
   * @param {string} dest
   */
  export function renameSync(src: string, dest: string): void
  /**
   * Removes directory at `path`.
   * @param {string} path
   * @param {function(Error|null):any} callback
   */
  export function rmdir(
    path: string,
    callback: (arg0: Error | null) => any
  ): void
  /**
   * Removes directory at `path`, synchronously.
   * @param {string} path
   */
  export function rmdirSync(path: string): void
  /**
   * Synchronously get the stats of a file
   * @param {string} path - filename or file descriptor
   * @param {object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.flag = 'r']
   */
  export function statSync(path: string, options?: object | undefined): Stats
  /**
   * Synchronously get the stats of an open file descriptor.
   * @param {number|FileHandle} fd
   * @param {object=} [options]
   */
  export function fstatSync(
    fd: number | FileHandle,
    options?: object | undefined
  ): Stats
  /**
   * Get the stats of a file
   * @param {string|Buffer|URL|number} path - filename or file descriptor
   * @param {(object|function(Error|null, Stats|undefined):any)=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.flag = 'r']
   * @param {AbortSignal|undefined} [options.signal]
   * @param {function(Error|null, Stats|undefined):any} callback
   */
  export function stat(
    path: string | Buffer | URL | number,
    options?:
      | (object | ((arg0: Error | null, arg1: Stats | undefined) => any))
      | undefined,
    callback: (arg0: Error | null, arg1: Stats | undefined) => any
  ): void
  /**
   * Get the stats of a symbolic link
   * @param {string|Buffer|URL|number} path - filename or file descriptor
   * @param {(object|function(Error|null, Stats|undefined):any)=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.flag = 'r']
   * @param {AbortSignal|undefined} [options.signal]
   * @param {function(Error|null, Stats|undefined):any} callback
   */
  export function lstat(
    path: string | Buffer | URL | number,
    options?:
      | (object | ((arg0: Error | null, arg1: Stats | undefined) => any))
      | undefined,
    callback: (arg0: Error | null, arg1: Stats | undefined) => any
  ): void
  /**
   * Synchronously get stats of a symbolic link
   * @param {string|Buffer|URL} path
   * @param {object=} [options]
   */
  export function lstatSync(
    path: string | Buffer | URL,
    options?: object | undefined
  ): Stats
  /**
   * Creates a symlink of `src` at `dest`.
   * @param {string} src
   * @param {string} dest
   * @param {function(Error|null):any} callback
   */
  export function symlink(
    src: string,
    dest: string,
    type: any,
    callback: (arg0: Error | null) => any
  ): void
  /**
   * Synchronously create a symlink
   * @param {string} src
   * @param {string} dest
   * @param {string=} [type]
   */
  export function symlinkSync(
    src: string,
    dest: string,
    type?: string | undefined
  ): void
  /**
   * Unlinks (removes) file at `path`.
   * @param {string} path
   * @param {function(Error|null):any} callback
   */
  export function unlink(
    path: string,
    callback: (arg0: Error | null) => any
  ): void
  /**
   * Unlinks (removes) file at `path`, synchronously.
   * @param {string} path
   */
  export function unlinkSync(path: string): void
  /**
   * Changes ownership of link at `path` synchronously
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   */
  export function lchownSync(path: string, uid: number, gid: number): void
  /**
   * @see {@link https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback}
   * @param {string|Buffer|URL|number} path - filename or file descriptor
   * @param {string|Buffer|TypedArray|DataView|object} data
   * @param {(object|function(Error|null):any)=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.mode = 0o666]
   * @param {string=} [options.flag = 'w']
   * @param {AbortSignal|undefined} [options.signal]
   * @param {function(Error|null):any} callback
   */
  export function writeFile(
    path: string | Buffer | URL | number,
    data: string | Buffer | TypedArray | DataView | object,
    options?: (object | ((arg0: Error | null) => any)) | undefined,
    callback: (arg0: Error | null) => any
  ): void
  /**
   * Writes data to a file synchronously.
   * @param {string|Buffer|URL|number} path - filename or file descriptor
   * @param {string|Buffer|TypedArray|DataView|object} data
   * @param {object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {string=} [options.mode = 0o666]
   * @param {string=} [options.flag = 'w']
   * @param {AbortSignal|undefined} [options.signal]
   * @see {@link https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options}
   */
  export function writeFileSync(
    path: string | Buffer | URL | number,
    data: string | Buffer | TypedArray | DataView | object,
    options?: object | undefined
  ): void
  /**
   * Truncate file at `path` to `len` bytes (default 0)
   * @param {string} path
   * @param {number|function} [len=0]
   * @param {function(Error|null):any} [callback]
   */
  export function truncate(
    path: string,
    len?: number | Function,
    callback?: (arg0: Error | null) => any
  ): void
  /** Truncate file synchronously */
  export function truncateSync(path: any, len?: number): void
  /**
   * Append data to a file
   * @param {string|Buffer|URL|number} path
   * @param {string|Buffer|TypedArray|DataView|object} data
   * @param {(object|function(Error|null):any)=} [options]
   * @param {string=} [options.encoding]
   * @param {number=} [options.mode]
   * @param {string=} [options.flag]
   * @param {function(Error|null):any} callback
   */
  export function appendFile(
    path: string | Buffer | URL | number,
    data: string | Buffer | TypedArray | DataView | object,
    options?: (object | ((arg0: Error | null) => any)) | undefined,
    callback?: (arg0: Error | null) => any
  ): void
  /** Append data synchronously */
  export function appendFileSync(path: any, data: any, options: any): void
  /**
   * Remove a file or directory
   * @param {string} path
   * @param {{ recursive?: boolean, force?: boolean }} [options]
   * @param {function(Error|null):any} callback
   */
  export function rm(
    path: string,
    options?: {
      recursive?: boolean
      force?: boolean
    },
    callback?: (arg0: Error | null) => any
  ): void
  /** Remove synchronously */
  export function rmSync(path: any, options?: {}): void
  /**
   * Copy file or directory.
   * Options:
   * - recursive: copy directories recursively
   * - dereference: follow symlinks (default true). When false, copies symlinks as symlinks
   * - force: overwrite if destination exists; when false and errorOnExist is false, leaves dest untouched
   * - errorOnExist: if true and destination exists, error (when force is false)
   * - preserveTimestamps: set atime/mtime on dest to match src (files)
   * - preserveMode: apply src mode (chmod) to dest
   * - preserveOwner: attempt to apply src uid/gid (chown) to dest (may be ignored by platform; may require privileges)
   * - filter: function (src, dest) => boolean|Promise<boolean> to include/exclude entries
   * @param {string} src
   * @param {string} dest
   * @param {{ recursive?: boolean, dereference?: boolean, force?: boolean, errorOnExist?: boolean, preserveTimestamps?: boolean, preserveMode?: boolean, preserveOwner?: boolean, filter?: function(string, string): (boolean|Promise<boolean>) }} [options]
   * @param {function(Error|null):any} callback
   */
  export function cp(
    src: string,
    dest: string,
    options?: {
      recursive?: boolean
      dereference?: boolean
      force?: boolean
      errorOnExist?: boolean
      preserveTimestamps?: boolean
      preserveMode?: boolean
      preserveOwner?: boolean
      filter?: (arg0: string, arg1: string) => boolean | Promise<boolean>
    },
    callback?: (arg0: Error | null) => any
  ): void
  /** Copy synchronously */
  export function cpSync(src: any, dest: any, options?: {}): void
  /**
   * Update atime/mtime for a path
   * @param {string} path
   * @param {number|Date|string} atime
   * @param {number|Date|string} mtime
   * @param {function(Error=)=} [callback]
   */
  export function utimes(
    path: string,
    atime: number | Date | string,
    mtime: number | Date | string,
    callback?: ((arg0: Error | undefined) => any) | undefined
  ): void
  /**
   * Update atime/mtime for a symlink without following it
   */
  export function lutimes(
    path: any,
    atime: any,
    mtime: any,
    callback: any
  ): void
  /** Update atime/mtime for a symlink without following it (sync) */
  export function lutimesSync(path: any, atime: any, mtime: any): void
  /**
   * Update atime/mtime for a path (sync)
   */
  export function utimesSync(path: any, atime: any, mtime: any): void
  /**
   * Update atime/mtime for an fd
   * @param {number|FileHandle} fd
   */
  export function futimes(
    fd: number | FileHandle,
    atime: any,
    mtime: any,
    callback: any
  ): void
  /**
   * Update atime/mtime for an fd (sync)
   */
  export function futimesSync(fd: any, atime: any, mtime: any): void
  /**
   * Watch for changes at `path` calling `callback`
   * @param {string}
   * @param {function|object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {function=} [callback]
   * @return {Watcher}
   */
  export function watch(
    path: any,
    options?: (Function | object) | undefined,
    callback?: Function | undefined
  ): Watcher
  export default exports
  export type Buffer = import('oro:buffer').Buffer
  export type TypedArray = Uint8Array | Int8Array
  import { Stats } from 'oro:fs/stats'
  import { Buffer } from 'oro:buffer'
  import { ReadStream } from 'oro:fs/stream'
  import { WriteStream } from 'oro:fs/stream'
  import { Dir } from 'oro:fs/dir'
  import { Dirent } from 'oro:fs/dir'
  import { FileHandle } from 'oro:fs/handle'
  import { Watcher } from 'oro:fs/watcher'
  import bookmarks from 'oro:fs/bookmarks'
  import * as constants from 'oro:fs/constants'
  import { DirectoryHandle } from 'oro:fs/handle'
  import fds from 'oro:fs/fds'
  import * as promises from 'oro:fs/promises'
  import * as exports from 'oro:fs/index'
  export {
    bookmarks,
    constants,
    Dir,
    DirectoryHandle,
    Dirent,
    fds,
    FileHandle,
    promises,
    ReadStream,
    Stats,
    Watcher,
    WriteStream,
  }
}
```

</details>

<details>
<summary><code>oro:fs/promises</code></summary>

```ts
declare module 'oro:fs/promises' {
  /**
   * Asynchronously check access a file.
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromisesaccesspath-mode}
   * @param {string|Buffer|URL} path
   * @param {number=} [mode]
   * @param {object=} [options]
   */
  export function access(
    path: string | Buffer | URL,
    mode?: number | undefined,
    options?: object | undefined
  ): Promise<boolean>
  /**
   * @see {@link https://nodejs.org/api/fs.html#fspromiseschmodpath-mode}
   * @param {string | Buffer | URL} path
   * @param {number} mode
   * @returns {Promise<void>}
   */
  export function chmod(
    path: string | Buffer | URL,
    mode: number
  ): Promise<void>
  /**
   * Changes ownership of file or directory at `path` with `uid` and `gid`.
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   * @return {Promise}
   */
  export function chown(path: string, uid: number, gid: number): Promise<any>
  /**
   * Asynchronously copies `src` to `dest` calling `callback` upon success or error.
   * @param {string} src - The source file path.
   * @param {string} dest - The destination file path.
   * @param {number} flags - Modifiers for copy operation.
   * @return {Promise}
   */
  export function copyFile(
    src: string,
    dest: string,
    flags?: number
  ): Promise<any>
  /**
   * Chages ownership of link at `path` with `uid` and `gid.
   * @param {string} path
   * @param {number} uid
   * @param {number} gid
   * @return {Promise}
   */
  export function lchown(path: string, uid: number, gid: number): Promise<any>
  export function lchmod(path: any, mode: any): Promise<void>
  /**
   * Creates a link to `dest` from `dest`.
   * @param {string} src
   * @param {string} dest
   * @return {Promise}
   */
  export function link(src: string, dest: string): Promise<any>
  /**
   * Asynchronously creates a directory.
   *
   * @param {string} path - The path to create
   * @param {object} [options] - The optional options argument can be an integer specifying mode (permission and sticky bits), or an object with a mode property and a recursive property indicating whether parent directories should be created. Calling fs.mkdir() when path is a directory that exists results in an error only when recursive is false.
   * @param {boolean} [options.recursive=false] - Recursively create missing path segments.
   * @param {number} [options.mode=0o777] - Set the mode of directory, or missing path segments when recursive is true.
   * @return {Promise} - Upon success, fulfills with undefined if recursive is false, or the first directory path created if recursive is true.
   */
  export function mkdir(
    path: string,
    options?: {
      recursive?: boolean
      mode?: number
    }
  ): Promise<any>
  /** Create a unique temporary directory */
  export function mkdtemp(prefix: any, options: any): Promise<any>
  /**
   * Asynchronously open a file.
   * @see {@link https://nodejs.org/api/fs.html#fspromisesopenpath-flags-mode }
   *
   * @param {string | Buffer | URL} path
   * @param {string=} flags - default: 'r'
   * @param {number=} mode - default: 0o666
   * @return {Promise<FileHandle>}
   */
  export function open(
    path: string | Buffer | URL,
    flags?: string | undefined,
    mode?: number | undefined
  ): Promise<FileHandle>
  /**
   * @see {@link https://nodejs.org/api/fs.html#fspromisesopendirpath-options}
   * @param {string | Buffer | URL} path
   * @param {object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {number=} [options.bufferSize = 32]
   * @return {Promise<Dir>}
   */
  export function opendir(
    path: string | Buffer | URL,
    options?: object | undefined
  ): Promise<Dir>
  /**
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromisesreaddirpath-options}
   * @param {string|Buffer|URL} path
   * @param {object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {boolean=} [options.withFileTypes = false]
   * @return {Promise<(string|Dirent)[]>}
   */
  export function readdir(
    path: string | Buffer | URL,
    options?: object | undefined
  ): Promise<(string | Dirent)[]>
  /**
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromisesreadfilepath-options}
   * @param {string} path
   * @param {object=} [options]
   * @param {(string|null)=} [options.encoding = null]
   * @param {string=} [options.flag = 'r']
   * @param {AbortSignal|undefined} [options.signal]
   * @return {Promise<Buffer | string>}
   */
  export function readFile(
    path: string,
    options?: object | undefined
  ): Promise<Buffer | string>
  /**
   * Reads link at `path`
   * @param {string} path
   * @return {Promise<string>}
   */
  export function readlink(path: string, options: any): Promise<string>
  /**
   * Computes real path for `path`
   * @param {string} path
   * @return {Promise<string>}
   */
  export function realpath(path: string): Promise<string>
  /**
   * Renames file or directory at `src` to `dest`.
   * @param {string} src
   * @param {string} dest
   * @return {Promise}
   */
  export function rename(src: string, dest: string): Promise<any>
  /**
   * Removes directory at `path`.
   * @param {string} path
   * @return {Promise}
   */
  export function rmdir(path: string): Promise<any>
  /**
   * Get the stats of a file
   * @see {@link https://nodejs.org/api/fs.html#fspromisesstatpath-options}
   * @param {string | Buffer | URL} path
   * @param {object=} [options]
   * @param {boolean=} [options.bigint = false]
   * @return {Promise<Stats>}
   */
  export function stat(
    path: string | Buffer | URL,
    options?: object | undefined
  ): Promise<Stats>
  /**
   * Get the stats of an open file descriptor.
   * @see {@link https://nodejs.org/api/fs.html#fspromisesfstatfd-options}
   * @param {number|FileHandle} fd
   * @param {object=} [options]
   * @param {boolean=} [options.bigint = false]
   * @return {Promise<Stats>}
   */
  export function fstat(
    fd: number | FileHandle,
    options?: object | undefined
  ): Promise<Stats>
  /**
   * Get the stats of a symbolic link.
   * @see {@link https://nodejs.org/api/fs.html#fspromiseslstatpath-options}
   * @param {string | Buffer | URL} path
   * @param {object=} [options]
   * @param {boolean=} [options.bigint = false]
   * @return {Promise<Stats>}
   */
  export function lstat(
    path: string | Buffer | URL,
    options?: object | undefined
  ): Promise<Stats>
  /**
   * Creates a symlink of `src` at `dest`.
   * @param {string} src
   * @param {string} dest
   * @return {Promise}
   */
  export function symlink(src: string, dest: string, type?: any): Promise<any>
  /**
   * Update atime/mtime for a path (promises)
   */
  export function utimes(path: any, atime: any, mtime: any): Promise<void>
  /**
   * Update atime/mtime for an fd (promises)
   */
  export function futimes(fd: any, atime: any, mtime: any): Promise<void>
  /** Update atime/mtime for a symlink without following it (promises) */
  export function lutimes(path: any, atime: any, mtime: any): Promise<void>
  /**
   * Unlinks (removes) file at `path`.
   * @param {string} path
   * @return {Promise}
   */
  export function unlink(path: string): Promise<any>
  /**
   * @see {@link https://nodejs.org/dist/latest-v20.x/docs/api/fs.html#fspromiseswritefilefile-data-options}
   * @param {string|Buffer|URL|FileHandle} path - filename or FileHandle
   * @param {string|Buffer|Array|DataView|TypedArray} data
   * @param {object=} [options]
   * @param {(string|null)=} [options.encoding = 'utf8']
   * @param {number=} [options.mode = 0o666]
   * @param {string=} [options.flag = 'w']
   * @param {AbortSignal|undefined} [options.signal]
   * @return {Promise<void>}
   */
  export function writeFile(
    path: string | Buffer | URL | FileHandle,
    data: string | Buffer | any[] | DataView | TypedArray,
    options?: object | undefined
  ): Promise<void>
  /** Vector write: write multiple buffers to a FileHandle or fd */
  export function writev(
    fdOrHandle: any,
    buffers: any,
    position?: any
  ): Promise<number>
  /** Vector read: read into multiple buffers from a FileHandle or fd */
  export function readv(
    fdOrHandle: any,
    buffers: any,
    position?: any
  ): Promise<{
    bytesRead: number
    buffers: any[]
  }>
  /** Truncate file */
  export function truncate(path: any, len?: number): Promise<void>
  /** Append data */
  export function appendFile(path: any, data: any, options: any): Promise<void>
  /** Remove file or directory */
  export function rm(path: any, options: any): Promise<void>
  /**
   * Copy file or directory.
   * Options:
   * - recursive: copy directories recursively
   * - dereference: follow symlinks (default true). When false, copies symlinks as symlinks
   * - force: overwrite if destination exists; when false and errorOnExist is false, leaves dest untouched
   * - errorOnExist: if true and destination exists, error (when force is false)
   * - preserveTimestamps: set atime/mtime on dest to match src (files)
   * - preserveMode: apply src mode (chmod) to dest
   * - preserveOwner: attempt to apply src uid/gid (chown) to dest (may be ignored by platform; may require privileges)
   * - filter: function (src, dest) => boolean|Promise<boolean> to include/exclude entries
   */
  export function cp(src: any, dest: any, options: any): Promise<void>
  /**
   * Watch for changes at `path` calling `callback`
   * @param {string}
   * @param {function|object=} [options]
   * @param {string=} [options.encoding = 'utf8']
   * @param {AbortSignal=} [options.signal]
   * @return {Watcher}
   */
  export function watch(
    path: any,
    options?: (Function | object) | undefined
  ): Watcher
  export type Stats = import('oro:fs/stats').Stats
  export default exports
  export type Buffer = import('oro:buffer').Buffer
  export type TypedArray = Uint8Array | Int8Array
  import { Buffer } from 'oro:buffer'
  import { FileHandle } from 'oro:fs/handle'
  import { Dir } from 'oro:fs/dir'
  import { Dirent } from 'oro:fs/dir'
  import { Stats } from 'oro:fs/stats'
  import { Watcher } from 'oro:fs/watcher'
  import bookmarks from 'oro:fs/bookmarks'
  import * as constants from 'oro:fs/constants'
  import { DirectoryHandle } from 'oro:fs/handle'
  import fds from 'oro:fs/fds'
  import { ReadStream } from 'oro:fs/stream'
  import { WriteStream } from 'oro:fs/stream'
  import * as exports from 'oro:fs/promises'
  export {
    bookmarks,
    constants,
    Dir,
    DirectoryHandle,
    Dirent,
    fds,
    FileHandle,
    ReadStream,
    Watcher,
    WriteStream,
  }
}
```

</details>

<details>
<summary><code>oro:fs/stats</code></summary>

```ts
declare module 'oro:fs/stats' {
  /**
   * A container for various stats about a file or directory.
   */
  export class Stats {
    /**
     * Creates a `Stats` instance from input, optionally with `BigInt` data types
     * @param {object|Stats} [stat]
     * @param {fromBigInt=} [fromBigInt = false]
     * @return {Stats}
     */
    static from(stat?: object | Stats, fromBigInt?: any | undefined): Stats
    /**
     * `Stats` class constructor.
     * @param {object|Stats} stat
     */
    constructor(stat: object | Stats)
    dev: any
    ino: any
    mode: any
    nlink: any
    uid: any
    gid: any
    rdev: any
    size: any
    blksize: any
    blocks: any
    atimeMs: any
    mtimeMs: any
    ctimeMs: any
    birthtimeMs: any
    atime: Date
    mtime: Date
    ctime: Date
    birthtime: Date
    /**
     * Returns `true` if stats represents a directory.
     * @return {Boolean}
     */
    isDirectory(): boolean
    /**
     * Returns `true` if stats represents a file.
     * @return {Boolean}
     */
    isFile(): boolean
    /**
     * Returns `true` if stats represents a block device.
     * @return {Boolean}
     */
    isBlockDevice(): boolean
    /**
     * Returns `true` if stats represents a character device.
     * @return {Boolean}
     */
    isCharacterDevice(): boolean
    /**
     * Returns `true` if stats represents a symbolic link.
     * @return {Boolean}
     */
    isSymbolicLink(): boolean
    /**
     * Returns `true` if stats represents a FIFO.
     * @return {Boolean}
     */
    isFIFO(): boolean
    /**
     * Returns `true` if stats represents a socket.
     * @return {Boolean}
     */
    isSocket(): boolean
  }
  export default exports
  import * as exports from 'oro:fs/stats'
}
```

</details>

<details>
<summary><code>oro:fs/stream</code></summary>

```ts
declare module 'oro:fs/stream' {
  export const DEFAULT_STREAM_HIGH_WATER_MARK: number
  /**
   * @typedef {import('./handle.js').FileHandle} FileHandle
   */
  /**
   * A `Readable` stream for a `FileHandle`.
   */
  /**
   * Emitted when the underlying file descriptor is opened.
   * @event ReadStream#open
   * @type {(fd: number) => void}
   */
  /**
   * Emitted when the stream is ready to be used.
   * @event ReadStream#ready
   * @type {() => void}
   */
  /**
   * Emitted when the stream is closed.
   * @event ReadStream#close
   * @type {() => void}
   */
  export class ReadStream extends Readable {
    /**
     * `ReadStream` class constructor
     * @ignore
     */
    constructor(options: any)
    end: any
    start: any
    handle: any
    buffer: ArrayBuffer
    signal: any
    timeout: any
    bytesRead: number
    shouldEmitClose: boolean
    /**
     * Sets file handle for the ReadStream.
     * @param {FileHandle} handle
     */
    setHandle(handle: FileHandle): void
    /**
     * The max buffer size for the ReadStream.
     */
    get highWaterMark(): number
    /**
     * Relative or absolute path of the underlying `FileHandle`.
     */
    get path(): any
    /**
     * `true` if the stream is in a pending state.
     */
    get pending(): boolean
    /**
     * Handles `shouldEmitClose` setting from `options.emitClose` in constructor.
     * @protected
     */
    protected emit(event: any, ...args: any[]): boolean
    _open(callback: any): Promise<any>
    _read(callback: any): Promise<any>
  }
  export namespace ReadStream {
    export { DEFAULT_STREAM_HIGH_WATER_MARK as highWaterMark }
  }
  /**
   * A `Writable` stream for a `FileHandle`.
   */
  /**
   * Emitted when the underlying file descriptor is opened.
   * @event WriteStream#open
   * @type {(fd: number) => void}
   */
  /**
   * Emitted when the stream is ready to be used.
   * @event WriteStream#ready
   * @type {() => void}
   */
  /**
   * Emitted when the stream is closed.
   * @event WriteStream#close
   * @type {() => void}
   */
  export class WriteStream extends Writable {
    /**
     * `WriteStream` class constructor
     * @ignore
     */
    constructor(options: any)
    start: any
    handle: any
    signal: any
    timeout: any
    bytesWritten: number
    shouldEmitClose: boolean
    /**
     * Sets file handle for the WriteStream.
     * @param {FileHandle} handle
     */
    setHandle(handle: FileHandle): void
    /**
     * The max buffer size for the Writetream.
     */
    get highWaterMark(): number
    /**
     * Relative or absolute path of the underlying `FileHandle`.
     */
    get path(): any
    /**
     * `true` if the stream is in a pending state.
     */
    get pending(): boolean
    _open(callback: any): Promise<any>
    /**
     * Handles `shouldEmitClose` setting from `options.emitClose` in constructor.
     * @protected
     */
    protected emit(event: any, ...args: any[]): boolean
    _write(buffer: any, callback: any): any
  }
  export namespace WriteStream {
    export { DEFAULT_STREAM_HIGH_WATER_MARK as highWaterMark }
  }
  export const FileReadStream: typeof ReadStream
  export const FileWriteStream: typeof WriteStream
  export default exports
  export type FileHandle = import('oro:fs/handle').FileHandle
  import { Readable } from 'oro:stream'
  import { Writable } from 'oro:stream'
  import * as exports from 'oro:fs/stream'
}
```

</details>

<details>
<summary><code>oro:fs/watcher</code></summary>

```ts
declare module 'oro:fs/watcher' {
  /**
   * A container for a file system path watcher.
   *
   * @event Watcher#change
   * @type {(eventType: string, filename: (string|Buffer)) => void}
   * Emitted when a file change is detected.
   *
   * @event Watcher#error
   * @type {(err: Error) => void}
   * Emitted when an error occurs during watching.
   *
   * @event Watcher#close
   * @type {() => void}
   * Emitted when the watcher is closed.
   */
  export class Watcher extends EventEmitter {
    [x: number]: (options: any) => import('oro:gc').Finalizer
    /**
     * `Watcher` class constructor.
     * @ignore
     * @param {string} path
     * @param {object=} [options]
     * @param {AbortSignal=} [options.signal]
     * @param {string|number|bigint=} [options.id]
     * @param {string=} [options.encoding = 'utf8']
     */
    constructor(path: string, options?: object | undefined)
    /**
     * The underlying `fs.Watcher` resource id.
     * @ignore
     * @type {string}
     */
    id: string
    /**
     * The path the `fs.Watcher` is watching
     * @type {string}
     */
    path: string
    /**
     * `true` if closed, otherwise `false`.
     * @type {boolean}
     */
    closed: boolean
    /**
     * `true` if aborted, otherwise `false`.
     * @type {boolean}
     */
    aborted: boolean
    /**
     * The encoding of the `filename`
     * @type {'utf8'|'buffer'}
     */
    encoding: 'utf8' | 'buffer'
    /**
     * An `AbortController` `AbortSignal` for async aborts.
     * @type {AbortSignal?}
     */
    signal: AbortSignal | null
    /**
     * Internal abort event handler reference for cleanup.
     * @ignore
     * @type {Function|null}
     */
    abortHandler: Function | null
    /**
     * Internal event listener cancellation.
     * @ignore
     * @type {function?}
     */
    stopListening: Function | null
    /**
     * Internal starter for watcher.
     * @ignore
     */
    start(): Promise<void>
    /**
     * Closes watcher and stops listening for changes.
     * @return {Promise}
     */
    close(): Promise<any>
    /**
     * Implements the `AsyncIterator` (`Symbol.asyncIterator`) interface.
     * @ignore
     * @return {AsyncIterator<{ eventType: string, filename: string }>}
     */
    [Symbol.asyncIterator](): AsyncIterator<{
      eventType: string
      filename: string
    }>
    #private
  }
  export default Watcher
  import { EventEmitter } from 'oro:events'
}
```

</details>

<details>
<summary><code>oro:fs/web</code></summary>

```ts
declare module 'oro:fs/web' {
  /**
   * Creates a new `File` instance from `filename`.
   * @param {string} filename
   * @param {{ fd: fs.FileHandle, highWaterMark?: number }=} [options]
   * @return {File}
   */
  export function createFile(
    filename: string,
    options?:
      | {
          fd: fs.FileHandle
          highWaterMark?: number
        }
      | undefined
  ): File
  /**
   * Creates a `FileSystemWritableFileStream` instance backed
   * by `oro:fs:` module from a given `FileSystemFileHandle` instance.
   * @param {string|File} file
   * @return {Promise<FileSystemFileHandle>}
   */
  export function createFileSystemWritableFileStream(
    handle: any,
    options: any
  ): Promise<FileSystemFileHandle>
  /**
   * Creates a `FileSystemFileHandle` instance backed by `oro:fs:` module from
   * a given `File` instance or filename string.
   * @param {string|File} file
   * @param {object} [options]
   * @return {Promise<FileSystemFileHandle>}
   */
  export function createFileSystemFileHandle(
    file: string | File,
    options?: object
  ): Promise<FileSystemFileHandle>
  /**
   * Creates a `FileSystemDirectoryHandle` instance backed by `oro:fs:` module
   * from a given directory name string.
   * @param {string} dirname
   * @return {Promise<FileSystemFileHandle>}
   */
  export function createFileSystemDirectoryHandle(
    dirname: string,
    options?: any
  ): Promise<FileSystemFileHandle>
  export const kFileSystemHandleFullName: unique symbol
  export const kFileDescriptor: unique symbol
  export const kFileFullName: unique symbol
  export const File:
    | {
        new (
          fileBits: BlobPart[],
          fileName: string,
          options?: FilePropertyBag
        ): File
        prototype: File
      }
    | {
        new (): {
          get lastModifiedDate(): Date
          get lastModified(): number
          get name(): any
          get size(): number
          get type(): string
          slice(): void
          arrayBuffer(): Promise<void>
          bytes(): Promise<void>
          text(): Promise<void>
          stream(): void
        }
      }
  export const FileSystemHandle: {
    new (): {
      get name(): any
      get kind(): any
    }
  }
  export const FileSystemFileHandle:
    | {
        new (): FileSystemFileHandle
        prototype: FileSystemFileHandle
      }
    | {
        new (): {
          getFile(): Promise<void>
          createWritable(_options?: any): Promise<void>
          createSyncAccessHandle(): Promise<void>
          get name(): any
          get kind(): any
        }
      }
  export const FileSystemDirectoryHandle:
    | {
        new (): FileSystemDirectoryHandle
        prototype: FileSystemDirectoryHandle
      }
    | {
        new (): {
          entries(): AsyncGenerator<never, void, unknown>
          values(): AsyncGenerator<never, void, unknown>
          keys(): AsyncGenerator<never, void, unknown>
          resolve(_possibleDescendant: any): Promise<void>
          removeEntry(_name: any, _options?: any): Promise<void>
          getDirectoryHandle(_name: any, _options?: any): Promise<void>
          getFileHandle(_name: any, _options?: any): Promise<void>
          get name(): any
          get kind(): any
        }
      }
  export const FileSystemWritableFileStream: {
    new (
      underlyingSink?: UnderlyingSink<any>,
      strategy?: QueuingStrategy<any>
    ): {
      seek(_position: any): Promise<void>
      truncate(_size: any): Promise<void>
      write(_data: any): Promise<void>
      readonly locked: boolean
      abort(reason?: any): Promise<void>
      close(): Promise<void>
      getWriter(): WritableStreamDefaultWriter<any>
    }
  }
  namespace _default {
    export { createFileSystemWritableFileStream }
    export { createFileSystemDirectoryHandle }
    export { createFileSystemFileHandle }
    export { createFile }
  }
  export default _default
  import fs from 'oro:fs/promises'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
