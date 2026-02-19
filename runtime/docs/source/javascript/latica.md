# `oro:latica`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:latica'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:latica
oro:latica/api
oro:latica/cache
oro:latica/encryption
oro:latica/index
oro:latica/nat
oro:latica/packets
oro:latica/proxy
oro:latica/worker
```

### TypeScript declarations

<details>
<summary><code>oro:latica</code></summary>

```ts
declare module 'oro:latica' {
  export * from 'oro:latica/index'
  export default def
  import def from 'oro:latica/index'
}
```

</details>

<details>
<summary><code>oro:latica/api</code></summary>

```ts
declare module 'oro:latica/api' {
  export default api
  export type EventEmitter = import('oro:events').EventEmitter
  /**
   * @typedef {import('../events.js').EventEmitter} EventEmitter
   */
  /**
   * Initializes and returns the network bus.
   *
   * @async
   * @function
   * @param {object} options - Configuration options for the network bus.
   * @param {object} events - A nodejs compatibe implementation of the events module.
   * @param {object} dgram - A nodejs compatible implementation of the dgram module.
   * @returns {Promise<EventEmitter>} - A promise that resolves to the initialized network bus.
   */
  export function api(
    options: object,
    events: object,
    dgram: object
  ): Promise<EventEmitter>
}
```

</details>

<details>
<summary><code>oro:latica/cache</code></summary>

```ts
declare module 'oro:latica/cache' {
  /**
   * @typedef {Packet} CacheEntry
   * @typedef {function(CacheEntry, CacheEntry): number} CacheEntrySiblingResolver
   */
  /**
   * Default cache sibling resolver that computes a delta between
   * two entries clocks.
   * @param {CacheEntry} a
   * @param {CacheEntry} b
   * @return {number}
   */
  export function defaultSiblingResolver(a: CacheEntry, b: CacheEntry): number
  /**
   * Default max size of a `Cache` instance.
   */
  export const DEFAULT_MAX_SIZE: number
  /**
   * Internal mapping of packet IDs to packet data used by `Cache`.
   */
  export class CacheData extends Map<any, any> {
    constructor()
    constructor(entries?: readonly (readonly [any, any])[])
    constructor()
    constructor(iterable?: Iterable<readonly [any, any]>)
  }
  /**
   * A class for storing a cache of packets by ID. This class includes a scheme
   * for reconciling disjointed packet caches in a large distributed system. The
   * following are key design characteristics.
   *
   * Space Efficiency: This scheme can be space-efficient because it summarizes
   * the cache's contents in a compact binary format. By sharing these summaries,
   * two computers can quickly determine whether their caches have common data or
   * differences.
   *
   * Bandwidth Efficiency: Sharing summaries instead of the full data can save
   * bandwidth. If the differences between the caches are small, sharing summaries
   * allows for more efficient data synchronization.
   *
   * Time Efficiency: The time efficiency of this scheme depends on the size of
   * the cache and the differences between the two caches. Generating summaries
   * and comparing them can be faster than transferring and comparing the entire
   * dataset, especially for large caches.
   *
   * Complexity: The scheme introduces some complexity due to the need to encode
   * and decode summaries. In some cases, the overhead introduced by this
   * complexity might outweigh the benefits, especially if the caches are
   * relatively small. In this case, you should be using a query.
   *
   * Data Synchronization Needs: The efficiency also depends on the data
   * synchronization needs. If the data needs to be synchronized in real-time,
   * this scheme might not be suitable. It's more appropriate for cases where
   * periodic or batch synchronization is acceptable.
   *
   * Scalability: The scheme's efficiency can vary depending on the scalability
   * of the system. As the number of cache entries or computers involved
   * increases, the complexity of generating and comparing summaries will stay
   * bound to a maximum of 16Mb.
   *
   */
  export class Cache {
    static HASH_SIZE_BYTES: number
    static HASH_EMPTY: string
    /**
     * The encodeSummary method provides a compact binary encoding of the output
     * of summary()
     *
     * @param {Object} summary - the output of calling summary()
     * @return {Buffer}
     **/
    static encodeSummary(summary: any): Buffer
    /**
     * The decodeSummary method decodes the output of encodeSummary()
     *
     * @param {Buffer} bin - the output of calling encodeSummary()
     * @return {Object} summary
     **/
    static decodeSummary(bin: Buffer): any
    /**
     * Test a summary hash format is valid
     *
     * @param {string} hash
     * @returns boolean
     */
    static isValidSummaryHashFormat(hash: string): boolean
    /**
     * `Cache` class constructor.
     * @param {CacheData?} [data]
     */
    constructor(
      data?: CacheData | null,
      siblingResolver?: typeof defaultSiblingResolver
    )
    data: CacheData
    maxSize: number
    siblingResolver: typeof defaultSiblingResolver
    /**
     * Readonly count of the number of cache entries.
     * @type {number}
     */
    get size(): number
    /**
     * Readonly size of the cache in bytes.
     * @type {number}
     */
    get bytes(): number
    /**
     * Inserts a `CacheEntry` value `v` into the cache at key `k`.
     * @param {string} k
     * @param {CacheEntry} v
     * @return {boolean}
     */
    insert(k: string, v: CacheEntry): boolean
    /**
     * Gets a `CacheEntry` value at key `k`.
     * @param {string} k
     * @return {CacheEntry?}
     */
    get(k: string): CacheEntry | null
    /**
     * @param {string} k
     * @return {boolean}
     */
    delete(k: string): boolean
    /**
     * Predicate to determine if cache contains an entry at key `k`.
     * @param {string} k
     * @return {boolean}
     */
    has(k: string): boolean
    /**
     * Composes an indexed packet into a new `Packet`
     * @param {Packet} packet
     */
    compose(packet: Packet, source?: CacheData): Promise<Packet>
    sha1(value: any, toHex: any): Promise<any>
    /**
     *
     * The summarize method returns a terse yet comparable summary of the cache
     * contents.
     *
     * Think of the cache as a trie of hex characters, the summary returns a
     * checksum for the current level of the trie and for its 16 children.
     *
     * This is similar to a merkel tree as equal subtrees can easily be detected
     * without the need for further recursion. When the subtree checksums are
     * inequivalent then further negotiation at lower levels may be required, this
     * process continues until the two trees become synchonized.
     *
     * When the prefix is empty, the summary will return an array of 16 checksums
     * these checksums provide a way of comparing that subtree with other peers.
     *
     * When a variable-length hexidecimal prefix is provided, then only cache
     * member hashes sharing this prefix will be considered.
     *
     * For each hex character provided in the prefix, the trie will decend by one
     * level, each level divides the 2^128 address space by 16. For exmaple...
     *
     * ```
     * Level  0   1   2
     * ----------------
     * 2b00
     * aa0e  ━┓  ━┓
     * aa1b   ┃   ┃
     * aae3   ┃   ┃  ━┓
     * aaea   ┃   ┃   ┃
     * aaeb   ┃  ━┛  ━┛
     * ab00   ┃  ━┓
     * ab1e   ┃   ┃
     * ab2a   ┃   ┃
     * abef   ┃   ┃
     * abf0  ━┛  ━┛
     * bff9
     * ```
     *
     * @param {string} prefix - a string of lowercased hexidecimal characters
     * @return {Object}
     *
     */
    summarize(prefix?: string, predicate?: () => boolean): any
  }
  export default Cache
  export type CacheEntry = Packet
  export type CacheEntrySiblingResolver = (
    arg0: CacheEntry,
    arg1: CacheEntry
  ) => number
  import { Packet } from 'oro:latica/packets'
  import { Buffer } from 'oro:buffer'
}
```

</details>

<details>
<summary><code>oro:latica/encryption</code></summary>

```ts
declare module 'oro:latica/encryption' {
  /**
   * Class for handling encryption and key management.
   */
  export class Encryption {
    /**
     * Creates a shared key based on the provided seed or generates a random one.
     * @param {Uint8Array|string} seed - Seed for key generation.
     * @returns {Promise<Uint8Array>} - Shared key.
     */
    static createSharedKey(seed: Uint8Array | string): Promise<Uint8Array>
    /**
     * Creates a key pair for signing and verification.
     * @param {Uint8Array|string} seed - Seed for key generation.
     * @returns {Promise<{ publicKey: Uint8Array, privateKey: Uint8Array }>} - Key pair.
     */
    static createKeyPair(seed: Uint8Array | string): Promise<{
      publicKey: Uint8Array
      privateKey: Uint8Array
    }>
    /**
     * Creates an ID using SHA-256 hash.
     * @param {string} str - String to hash.
     * @returns {Promise<Uint8Array>} - SHA-256 hash.
     */
    static createId(str: string): Promise<Uint8Array>
    /**
     * Creates a cluster ID using SHA-256 hash with specified output size.
     * @param {string} str - String to hash.
     * @returns {Promise<Uint8Array>} - SHA-256 hash with specified output size.
     */
    static createClusterId(str: string): Promise<Uint8Array>
    /**
     * Signs a message using the given secret key.
     * @param {Buffer} b - The message to sign.
     * @param {Uint8Array} sk - The secret key to use.
     * @returns {Uint8Array} - Signature.
     */
    static sign(b: Buffer, sk: Uint8Array): Uint8Array
    /**
     * Verifies the signature of a message using the given public key.
     * @param {Buffer} b - The message to verify.
     * @param {Uint8Array} sig - The signature to check.
     * @param {Uint8Array} pk - The public key to use.
     * @returns {number} - Returns non-zero if the buffer could not be verified.
     */
    static verify(b: Buffer, sig: Uint8Array, pk: Uint8Array): number
    /**
     * Mapping of public keys to key objects.
     * @type {Object.<string, { publicKey: Uint8Array, privateKey: Uint8Array, ts: number }>}
     */
    keys: {
      [x: string]: {
        publicKey: Uint8Array
        privateKey: Uint8Array
        ts: number
      }
    }
    /**
     * Adds a key pair to the keys mapping.
     * @param {Uint8Array|string} publicKey - Public key.
     * @param {Uint8Array} privateKey - Private key.
     */
    add(publicKey: Uint8Array | string, privateKey: Uint8Array): void
    /**
     * Removes a key from the keys mapping.
     * @param {Uint8Array|string} publicKey - Public key.
     */
    remove(publicKey: Uint8Array | string): void
    /**
     * Checks if a key is in the keys mapping.
     * @param {Uint8Array|string} to - Public key or Uint8Array.
     * @returns {boolean} - True if the key is present, false otherwise.
     */
    has(to: Uint8Array | string): boolean
    /**
     * Opens a sealed message using the specified key.
     * @param {Buffer} message - The sealed message.
     * @param {Object|string} v - Key object or public key.
     * @returns {Buffer} - Decrypted message.
     * @throws {Error} - Throws ENOKEY if the key is not found.
     */
    openUnsigned(message: Buffer, v: any | string): Buffer
    sealUnsigned(message: any, v: any): any
    /**
     * Decrypts a sealed and signed message for a specific receiver.
     * @param {Buffer} message - The sealed message.
     * @param {Object|string} v - Key object or public key.
     * @returns {Buffer} - Decrypted message.
     * @throws {Error} - Throws ENOKEY if the key is not found, EMALFORMED if the message is malformed, ENOTVERIFIED if the message cannot be verified.
     */
    open(message: Buffer, v: any | string): Buffer
    /**
     * Seals and signs a message for a specific receiver using their public key.
     *
     * `Seal(message, receiver)` performs an _encrypt-sign-encrypt_ (ESE) on
     * a plaintext `message` for a `receiver` identity. This prevents repudiation
     * attacks and doesn't rely on packet chain guarantees.
     *
     * let ct = Seal(sender | pt, receiver)
     * let sig = Sign(ct, sk)
     * let out = Seal(sig | ct)
     *
     * In an setup between Alice & Bob, this means:
     * - Only Bob sees the plaintext
     * - Alice wrote the plaintext and the ciphertext
     * - Only Bob can see that Alice wrote the plaintext and ciphertext
     * - Bob cannot forward the message without invalidating Alice's signature.
     * - The outer encryption serves to prevent an attacker from replacing Alice's
     *   signature. As with _sign-encrypt-sign (SES), ESE is a variant of
     *   including the recipient's name inside the plaintext, which is then signed
     *   and encrypted Alice signs her plaintext along with her ciphertext, so as
     *   to protect herself from a laintext-substitution attack. At the same time,
     *   Alice's signed plaintext gives Bob non-repudiation.
     *
     * @see https://theworld.com/~dtd/sign_encrypt/sign_encrypt7.html
     *
     * @param {Buffer} message - The message to seal.
     * @param {Object|string} v - Key object or public key.
     * @returns {Buffer} - Sealed message.
     * @throws {Error} - Throws ENOKEY if the key is not found.
     */
    seal(message: Buffer, v: any | string): Buffer
  }
  import Buffer from 'oro:buffer'
}
```

</details>

<details>
<summary><code>oro:latica/index</code></summary>

```ts
declare module 'oro:latica/index' {
  /**
   * Computes rate limit predicate value for a port and address pair for a given
   * threshold updating an input rates map. This method is accessed concurrently,
   * the rates object makes operations atomic to avoid race conditions.
   *
   * @param {Map} rates
   * @param {number} type
   * @param {number} port
   * @param {string} address
   * @return {boolean}
   */
  export function rateLimit(
    rates: Map<any, any>,
    type: number,
    port: number,
    address: string,
    subclusterIdQuota: any
  ): boolean
  /**
   * Retry delay in milliseconds for ping.
   * @type {number}
   */
  export const PING_RETRY: number
  /**
   * Probe wait timeout in milliseconds.
   * @type {number}
   */
  export const PROBE_WAIT: number
  /**
   * Default keep alive timeout.
   * @type {number}
   */
  export const DEFAULT_KEEP_ALIVE: number
  /**
   * Default rate limit threshold in milliseconds.
   * @type {number}
   */
  export const DEFAULT_RATE_LIMIT_THRESHOLD: number
  export function getRandomPort(ports: object, p: number | null): number
  /**
   * A `RemotePeer` represents an initial, discovered, or connected remote peer.
   * Typically, you will not need to create instances of this class directly.
   */
  export class RemotePeer {
    /**
     * `RemotePeer` class constructor.
     * @param {{
     *   peerId?: string,
     *   address?: string,
     *   port?: number,
     *   natType?: number,
     *   clusters: object,
     *   reflectionId?: string,
     *   distance?: number,
     *   publicKey?: string,
     *   privateKey?: string,
     *   clock?: number,
     *   lastUpdate?: number,
     *   lastRequest?: number
     * }} o
     */
    constructor(
      o: {
        peerId?: string
        address?: string
        port?: number
        natType?: number
        clusters: object
        reflectionId?: string
        distance?: number
        publicKey?: string
        privateKey?: string
        clock?: number
        lastUpdate?: number
        lastRequest?: number
      },
      peer: any
    )
    peerId: any
    address: any
    port: number
    natType: any
    clusters: {}
    pingId: any
    distance: number
    connected: boolean
    opening: number
    probed: number
    proxy: any
    clock: number
    uptime: number
    lastUpdate: number
    lastRequest: number
    localPeer: any
    write(sharedKey: any, args: any): Promise<any[]>
  }
  /**
   * `Peer` class factory.
   * @param {{ createSocket: function('udp4', null, object?): object }} options
   */
  export class Peer {
    /**
     * Test a peerID is valid
     *
     * @param {string} pid
     * @returns boolean
     */
    static isValidPeerId(pid: string): boolean
    /**
     * Test a reflectionID is valid
     *
     * @param {string} rid
     * @returns boolean
     */
    static isValidReflectionId(rid: string): boolean
    /**
     * Test a pingID is valid
     *
     * @param {string} pid
     * @returns boolean
     */
    static isValidPingId(pid: string): boolean
    /**
     * Returns the online status of the browser, else true.
     *
     * note: globalThis.navigator was added to node in v22.
     *
     * @returns boolean
     */
    static onLine(): boolean
    /**
     * `Peer` class constructor.
     * @param {object=} opts - Options
     * @param {Buffer} opts.peerId - A 32 byte buffer (ie, `Encryption.createId()`).
     * @param {Buffer} opts.clusterId - A 32 byte buffer (ie, `Encryption.createClusterId()`).
     * @param {number=} opts.port - A port number.
     * @param {number=} opts.probeInternalPort - An internal port number (semi-private for testing).
     * @param {number=} opts.probeExternalPort - An external port number (semi-private for testing).
     * @param {number=} opts.natType - A nat type.
     * @param {string=} opts.address - An ipv4 address.
     * @param {number=} opts.keepalive - The interval of the main loop.
     * @param {function=} opts.siblingResolver - A function that can be used to determine canonical data in case two packets have concurrent clock values.
     * @param {object} dgram - A nodejs compatible implementation of the dgram module (sans multicast).
     */
    constructor(persistedState: {}, dgram: object)
    port: any
    address: any
    natType: 0
    nextNatType: 0
    clusters: {}
    syncs: {}
    reflectionId: any
    reflectionTimeout: any
    reflectionStage: number
    reflectionRetry: number
    reflectionFirstResponder: any
    peerId: string
    isListening: boolean
    ctime: number
    lastUpdate: number
    lastSync: number
    closing: boolean
    clock: number
    unpublished: {}
    cache: any
    uptime: number
    maxHops: number
    bdpCache: number[]
    dgram: any
    onListening: any
    onDelete: any
    sendQueue: any[]
    firewall: any
    rates: Map<any, any>
    streamBuffer: Map<any, any>
    gate: Map<any, any>
    returnRoutes: Map<any, any>
    metrics: {
      i: {
        0: number
        1: number
        2: number
        3: number
        4: number
        5: number
        6: number
        7: number
        8: number
        DROPPED: number
      }
      o: {
        0: number
        1: number
        2: number
        3: number
        4: number
        5: number
        6: number
        7: number
        8: number
      }
    }
    peers: any
    encryption: Encryption
    config: any
    _onError: (err: any) => any
    socket: any
    probeSocket: any
    /**
     * An implementation for clearing an interval that can be overridden by the test suite
     * @param Number the number that identifies the timer
     * @return {undefined}
     * @ignore
     */
    _clearInterval(tid: any): undefined
    /**
     * An implementation for clearing a timeout that can be overridden by the test suite
     * @param Number the number that identifies the timer
     * @return {undefined}
     * @ignore
     */
    _clearTimeout(tid: any): undefined
    /**
     * An implementation of an internal timer that can be overridden by the test suite
     * @return {Number}
     * @ignore
     */
    _setInterval(fn: any, t: any): number
    /**
     * An implementation of an timeout timer that can be overridden by the test suite
     * @return {Number}
     * @ignore
     */
    _setTimeout(fn: any, t: any): number
    _onDebug(...args: any[]): void
    _stableStringify(value: any): string
    _cpPayload(
      type: any,
      clusterId: any,
      subclusterId: any,
      message: any
    ): Uint8Array<any>
    _applyControlAuth(PacketCtor: any, props: any): any
    _verifyControlAuth(packet: any): any
    /**
     * A method that encapsulates the listing procedure
     * @return {undefined}
     * @ignore
     */
    _listen(): undefined
    init(cb: any): Promise<any>
    onReady: any
    mainLoopTimer: number
    /**
     * Continuously evaluate the state of the peer and its network
     * @return {undefined}
     * @ignore
     */
    _mainLoop(ts: any): undefined
    /**
     * Enqueue packets to be sent to the network
     * @param {Buffer} data - An encoded packet
     * @param {number} port - The desination port of the remote host
     * @param {string} address - The destination address of the remote host
     * @param {Socket=this.socket} socket - The socket to send on
     * @return {undefined}
     * @ignore
     */
    send(data: Buffer, port: number, address: string, socket?: any): undefined
    /**
     * @private
     */
    private stream
    /**
     * @private
     */
    private _scheduleSend
    sendTimeout: number
    /**
     * @private
     */
    private _dequeue
    /**
     * Send any unpublished packets
     * @return {undefined}
     * @ignore
     */
    sendUnpublished(): undefined
    /**
     * Get the serializable state of the peer (can be passed to the constructor or create method)
     * @return {undefined}
     */
    getState(): undefined
    getInfo(): Promise<{
      address: any
      port: any
      clock: number
      uptime: number
      natType: 0
      natName:
        | 'UNRESTRICTED'
        | 'ADDR_RESTRICTED'
        | 'PORT_RESTRICTED'
        | 'ENDPOINT_RESTRICTED'
        | 'UNKNOWN'
      peerId: string
    }>
    cacheInsert(packet: any): Promise<void>
    addIndexedPeer(info: any): Promise<void>
    reconnect(): Promise<void>
    disconnect(): Promise<void>
    probeReflectionTimeout: any
    sealUnsigned(...args: any[]): Promise<any>
    openUnsigned(...args: any[]): Promise<Buffer>
    seal(...args: any[]): Promise<Buffer>
    open(...args: any[]): Promise<Buffer>
    addEncryptionKey(...args: any[]): Promise<void>
    /**
     * Get a selection of known peers
     * @return {Array<RemotePeer>}
     * @ignore
     */
    getPeers(
      packet: any,
      peers: any,
      ignorelist: any,
      filter?: (o: any) => any
    ): Array<RemotePeer>
    /**
     * Send an eventually consistent packet to a selection of peers (fanout)
     * @return {undefined}
     * @ignore
     */
    mcast(packet: any, ignorelist?: any[]): undefined
    /**
     * The process of determining this peer's NAT behavior (firewall and dependentness)
     * @return {undefined}
     * @ignore
     */
    requestReflection(): undefined
    /**
     * Ping another peer
     * @return {PacketPing}
     * @ignore
     */
    ping(peer: any, withRetry: any, props: any, socket: any): PacketPing
    /**
     * Get a peer
     * @return {RemotePeer}
     * @ignore
     */
    getPeer(id: any): RemotePeer
    /**
     * This should be called at least once when an app starts to multicast
     * this peer, and starts querying the network to discover peers.
     * @param {object} keys - Created by `Encryption.createKeyPair()`.
     * @param {object=} args - Options
     * @param {number=MAX_BANDWIDTH} args.rateLimit - How many requests per second to allow for this subclusterId.
     * @return {RemotePeer}
     */
    join(sharedKey: any, args?: object | undefined): RemotePeer
    /**
     * @param {Packet} T - The constructor to be used to create packets.
     * @param {Any} message - The message to be split and packaged.
     * @return {Array<Packet<T>>}
     * @ignore
     */
    _message2packets(T: Packet, message: Any, args: any): Array<Packet<Packet>>
    /**
     * Sends a packet into the network that will be replicated and buffered.
     * Each peer that receives it will buffer it until TTL and then replicate
     * it provided it has has not exceeded their maximum number of allowed hops.
     *
     * @param {object} keys - the public and private key pair created by `Encryption.createKeyPair()`.
     * @param {object} args - The arguments to be applied.
     * @param {Buffer} args.message - The message to be encrypted by keys and sent.
     * @param {Packet<T>=} args.packet - The previous packet in the packet chain.
     * @param {Buffer} args.usr1 - 32 bytes of arbitrary clusterId in the protocol framing.
     * @param {Buffer} args.usr2 - 32 bytes of arbitrary clusterId in the protocol framing.
     * @return {Array<PacketPublish>}
     */
    publish(
      sharedKey: any,
      args: {
        message: Buffer
        packet?: Packet<T> | undefined
        usr1: Buffer
        usr2: Buffer
      }
    ): Array<PacketPublish>
    /**
     * @return {undefined}
     */
    sync(peer: any, ptime?: number): undefined
    close(): void
    /**
     * Deploy a query into the network
     * @return {undefined}
     *
     */
    query(query: any): undefined
    /**
     *
     * This is a default implementation for deciding what to summarize
     * from the cache when receiving a request to sync. that can be overridden
     *
     */
    cachePredicate(ts: any): (packet: any) => boolean
    /**
     * A connection was made, add the peer to the local list of known
     * peers and call the onConnection if it is defined by the user.
     *
     * @return {undefined}
     * @ignore
     */
    _onConnection(
      packet: any,
      peerId: any,
      port: any,
      address: any,
      proxy: any,
      socket: any
    ): undefined
    /**
     * Received a Sync Packet
     * @return {undefined}
     * @ignore
     */
    _onSync(packet: any, port: any, address: any): undefined
    /**
     * Received a Query Packet
     *
     * a -> b -> c -> (d) -> c -> b -> a
     *
     * @return {undefined}
     * @example
     *
     * ```js
     * peer.onQuery = (packet) => {
     *   //
     *   // read a database or something
     *   //
     *   return {
     *     message: Buffer.from('hello'),
     *     publicKey: '',
     *     privateKey: ''
     *   }
     * }
     * ```
     */
    _onQuery(packet: any, port: any, address: any): undefined
    /**
     * Received a Ping Packet
     * @return {undefined}
     * @ignore
     */
    _onPing(packet: any, port: any, address: any): undefined
    /**
     * Received a Pong Packet
     * @return {undefined}
     * @ignore
     */
    _onPong(packet: any, port: any, address: any): undefined
    reflectionFirstReponderTimeout: number
    /**
     * Received an Intro Packet
     * @return {undefined}
     * @ignore
     */
    _onIntro(
      packet: any,
      port: any,
      address: any,
      _: any,
      opts?: {
        attempts: number
      }
    ): undefined
    socketPool: any[]
    /**
     * Received an Join Packet
     * @return {undefined}
     * @ignore
     */
    _onJoin(packet: any, port: any, address: any, _data: any): undefined
    /**
     * Received an Publish Packet
     * @return {undefined}
     * @ignore
     */
    _onPublish(packet: any, port: any, address: any, _data: any): undefined
    /**
     * Received an Stream Packet
     * @return {undefined}
     * @ignore
     */
    _onStream(packet: any, port: any, address: any, _data: any): undefined
    /**
     * Received any packet on the probe port to determine the firewall:
     * are you port restricted, host restricted, or unrestricted.
     * @return {undefined}
     * @ignore
     */
    _onProbeMessage(
      data: any,
      {
        port,
        address,
      }: {
        port: any
        address: any
      }
    ): undefined
    /**
     * When a packet is received it is decoded, the packet contains the type
     * of the message. Based on the message type it is routed to a function.
     * like WebSockets, don't answer queries unless we know its another SRP peer.
     *
     * @param {Buffer|Uint8Array} data
     * @param {{ port: number, address: string }} info
     */
    _onMessage(
      data: Buffer | Uint8Array,
      {
        port,
        address,
      }: {
        port: number
        address: string
      }
    ): Promise<undefined>
  }
  export default Peer
  import { Packet } from 'oro:latica/packets'
  import { sha256 } from 'oro:latica/packets'
  import { Cache } from 'oro:latica/cache'
  import { Encryption } from 'oro:latica/encryption'
  import * as NAT from 'oro:latica/nat'
  import { Buffer } from 'oro:buffer'
  import { PacketPing } from 'oro:latica/packets'
  import { PacketPublish } from 'oro:latica/packets'
  export { Packet, sha256, Cache, Encryption, NAT }
}
```

</details>

<details>
<summary><code>oro:latica/nat</code></summary>

```ts
declare module 'oro:latica/nat' {
  /**
   * The NAT type is encoded using 5 bits:
   *
   * 0b00001 : the lsb indicates if endpoint dependence information is included
   * 0b00010 : the second bit indicates the endpoint dependence value
   *
   * 0b00100 : the third bit indicates if firewall information is included
   * 0b01000 : the fourth bit describes which requests can pass the firewall, only known IPs (0) or any IP (1)
   * 0b10000 : the fifth bit describes which requests can pass the firewall, only known ports (0) or any port (1)
   */
  /**
   * Every remote will see the same IP:PORT mapping for this peer.
   *
   *                        :3333 ┌──────┐
   *   :1111                ┌───▶ │  R1  │
   * ┌──────┐    ┌───────┐  │     └──────┘
   * │  P1  ├───▶│  NAT  ├──┤
   * └──────┘    └───────┘  │     ┌──────┐
   *                        └───▶ │  R2  │
   *                        :3333 └──────┘
   */
  export const MAPPING_ENDPOINT_INDEPENDENT: 3
  /**
   * Every remote will see a different IP:PORT mapping for this peer.
   *
   *                        :4444 ┌──────┐
   *   :1111                ┌───▶ │  R1  │
   * ┌──────┐    ┌───────┐  │     └──────┘
   * │  P1  ├───▶│  NAT  ├──┤
   * └──────┘    └───────┘  │     ┌──────┐
   *                        └───▶ │  R2  │
   *                        :5555 └──────┘
   */
  export const MAPPING_ENDPOINT_DEPENDENT: 1
  /**
   * The firewall allows the port mapping to be accessed by:
   * - Any IP:PORT combination (FIREWALL_ALLOW_ANY)
   * - Any PORT on a previously connected IP (FIREWALL_ALLOW_KNOWN_IP)
   * - Only from previously connected IP:PORT combinations (FIREWALL_ALLOW_KNOWN_IP_AND_PORT)
   */
  export const FIREWALL_ALLOW_ANY: 28
  export const FIREWALL_ALLOW_KNOWN_IP: 12
  export const FIREWALL_ALLOW_KNOWN_IP_AND_PORT: 4
  /**
   * The initial state of the nat is unknown and its value is 0
   */
  export const UNKNOWN: 0
  /**
   * Full-cone NAT, also known as one-to-one NAT
   *
   * Any external host can send packets to iAddr:iPort by sending packets to eAddr:ePort.
   *
   * @summary its a packet party at this mapping and everyone's invited
   */
  export const UNRESTRICTED: number
  /**
   * (Address)-restricted-cone NAT
   *
   * An external host (hAddr:any) can send packets to iAddr:iPort by sending packets to eAddr:ePort only
   * if iAddr:iPort has previously sent a packet to hAddr:any. "Any" means the port number doesn't matter.
   *
   * @summary The NAT will drop your packets unless a peer within its network has previously messaged you from *any* port.
   */
  export const ADDR_RESTRICTED: number
  /**
   * Port-restricted cone NAT
   *
   * An external host (hAddr:hPort) can send packets to iAddr:iPort by sending
   * packets to eAddr:ePort only if iAddr:iPort has previously sent a packet to
   * hAddr:hPort.
   *
   * @summary The NAT will drop your packets unless a peer within its network
   * has previously messaged you from this *specific* port.
   */
  export const PORT_RESTRICTED: number
  /**
   * Symmetric NAT
   *
   * Only an external host that receives a packet from an internal host can send
   * a packet back.
   *
   * @summary The NAT will only accept replies to a correspondence initialized
   * by itself, the mapping it created is only valid for you.
   */
  export const ENDPOINT_RESTRICTED: number
  export function isEndpointDependenceDefined(nat: any): boolean
  export function isFirewallDefined(nat: any): boolean
  export function isValid(nat: any): boolean
  export function toString(
    n: any
  ):
    | 'UNRESTRICTED'
    | 'ADDR_RESTRICTED'
    | 'PORT_RESTRICTED'
    | 'ENDPOINT_RESTRICTED'
    | 'UNKNOWN'
  export function toStringStrategy(
    n: any
  ):
    | 'STRATEGY_DEFER'
    | 'STRATEGY_DIRECT_CONNECT'
    | 'STRATEGY_TRAVERSAL_OPEN'
    | 'STRATEGY_TRAVERSAL_CONNECT'
    | 'STRATEGY_PROXY'
    | 'STRATEGY_UNKNOWN'
  export const STRATEGY_DEFER: 0
  export const STRATEGY_DIRECT_CONNECT: 1
  export const STRATEGY_TRAVERSAL_OPEN: 2
  export const STRATEGY_TRAVERSAL_CONNECT: 3
  export const STRATEGY_PROXY: 4
  export function connectionStrategy(a: any, b: any): 0 | 1 | 2 | 3 | 4
}
```

</details>

<details>
<summary><code>oro:latica/packets</code></summary>

```ts
declare module 'oro:latica/packets' {
  /**
   * The magic bytes prefixing every packet. They are the
   * 2nd, 3rd, 5th, and 7th, prime numbers.
   * @type {number[]}
   */
  export const MAGIC_BYTES_PREFIX: number[]
  /**
   * The version of the protocol.
   */
  export const VERSION: 6
  /**
   * The size in bytes of the prefix magic bytes.
   */
  export const MAGIC_BYTES: 4
  /**
   * The maximum size of the user message.
   */
  export const MESSAGE_BYTES: 1024
  /**
   * The cache TTL in milliseconds.
   */
  export const CACHE_TTL: number
  export namespace PACKET_SPEC {
    namespace type {
      let bytes: number
      let encoding: string
    }
    namespace version {
      let bytes_1: number
      export { bytes_1 as bytes }
      let encoding_1: string
      export { encoding_1 as encoding }
      export { VERSION as default }
    }
    namespace clock {
      let bytes_2: number
      export { bytes_2 as bytes }
      let encoding_2: string
      export { encoding_2 as encoding }
      let _default: number
      export { _default as default }
    }
    namespace hops {
      let bytes_3: number
      export { bytes_3 as bytes }
      let encoding_3: string
      export { encoding_3 as encoding }
      let _default_1: number
      export { _default_1 as default }
    }
    namespace index {
      let bytes_4: number
      export { bytes_4 as bytes }
      let encoding_4: string
      export { encoding_4 as encoding }
      let _default_2: number
      export { _default_2 as default }
      export let signed: boolean
    }
    namespace ttl {
      let bytes_5: number
      export { bytes_5 as bytes }
      let encoding_5: string
      export { encoding_5 as encoding }
      export { CACHE_TTL as default }
    }
    namespace clusterId {
      let bytes_6: number
      export { bytes_6 as bytes }
      let encoding_6: string
      export { encoding_6 as encoding }
      let _default_3: number[]
      export { _default_3 as default }
    }
    namespace subclusterId {
      let bytes_7: number
      export { bytes_7 as bytes }
      let encoding_7: string
      export { encoding_7 as encoding }
      let _default_4: number[]
      export { _default_4 as default }
    }
    namespace previousId {
      let bytes_8: number
      export { bytes_8 as bytes }
      let encoding_8: string
      export { encoding_8 as encoding }
      let _default_5: number[]
      export { _default_5 as default }
    }
    namespace packetId {
      let bytes_9: number
      export { bytes_9 as bytes }
      let encoding_9: string
      export { encoding_9 as encoding }
      let _default_6: number[]
      export { _default_6 as default }
    }
    namespace nextId {
      let bytes_10: number
      export { bytes_10 as bytes }
      let encoding_10: string
      export { encoding_10 as encoding }
      let _default_7: number[]
      export { _default_7 as default }
    }
    namespace usr1 {
      let bytes_11: number
      export { bytes_11 as bytes }
      let _default_8: number[]
      export { _default_8 as default }
    }
    namespace usr2 {
      let bytes_12: number
      export { bytes_12 as bytes }
      let _default_9: number[]
      export { _default_9 as default }
    }
    namespace usr3 {
      let bytes_13: number
      export { bytes_13 as bytes }
      let _default_10: number[]
      export { _default_10 as default }
    }
    namespace usr4 {
      let bytes_14: number
      export { bytes_14 as bytes }
      let _default_11: number[]
      export { _default_11 as default }
    }
    namespace message {
      let bytes_15: number
      export { bytes_15 as bytes }
      let _default_12: number[]
      export { _default_12 as default }
    }
    namespace sig {
      let bytes_16: number
      export { bytes_16 as bytes }
      let _default_13: number[]
      export { _default_13 as default }
    }
  }
  /**
   * The size in bytes of the total packet frame and message.
   */
  export const PACKET_BYTES: number
  /**
   * The maximum distance that a packet can be replicated.
   */
  export const MAX_HOPS: 16
  export function validateMessage(
    o: object,
    constraints: {
      [key: string]: constraint
    }
  ): void
  /**
   * Computes a SHA-256 hash of input returning a hex encoded string.
   * @type {function(string|Buffer|Uint8Array): Promise<string>}
   */
  export const sha256: (arg0: string | Buffer | Uint8Array) => Promise<string>
  export function decode(buf: Buffer): Packet
  export function getTypeFromBytes(buf: any): any
  export class Packet {
    static ttl: number
    static maxLength: number
    /**
     * Returns an empty `Packet` instance.
     * @return {Packet}
     */
    static empty(): Packet
    /**
     * @param {Packet|object} packet
     * @return {Packet}
     */
    static from(packet: Packet | object): Packet
    /**
     * Determines if input is a packet.
     * @param {Buffer|Uint8Array|number[]|object|Packet} packet
     * @return {boolean}
     */
    static isPacket(
      packet: Buffer | Uint8Array | number[] | object | Packet
    ): boolean
    /**
     */
    static encode(p: any): Promise<Uint8Array<any>>
    static decode(buf: any): Packet
    /**
     * `Packet` class constructor.
     * @param {Packet|object?} options
     */
    constructor(options?: Packet | (object | null))
    /**
     * @param {Packet} packet
     * @return {Packet}
     */
    copy(): Packet
    timestamp: any
    isComposed: any
    isReconciled: any
    meta: any
  }
  export class PacketPing extends Packet {
    static type: number
  }
  export class PacketPong extends Packet {
    static type: number
  }
  export class PacketIntro extends Packet {
    static type: number
  }
  export class PacketJoin extends Packet {
    static type: number
  }
  export class PacketPublish extends Packet {
    static type: number
  }
  export class PacketStream extends Packet {
    static type: number
  }
  export class PacketSync extends Packet {
    static type: number
  }
  export class PacketQuery extends Packet {
    static type: number
  }
  export default Packet
  export type constraint = {
    type: string
    required?: boolean
    /**
     * optional validator fn returning boolean
     */
    assert?: Function
  }
  import { Buffer } from 'oro:buffer'
}
```

</details>

<details>
<summary><code>oro:latica/proxy</code></summary>

```ts
declare module 'oro:latica/proxy' {
  export default PeerWorkerProxy
  /**
   * `Proxy` class factory, returns a Proxy class that is a proxy to the Peer.
   * @param {{ createSocket: function('udp4', null, object?): object }} options
   */
  export class PeerWorkerProxy {
    constructor(options: any, port: any, fn: any)
    init(): Promise<any>
    reconnect(): Promise<any>
    disconnect(): Promise<any>
    getInfo(): Promise<any>
    getMetrics(): Promise<any>
    getState(): Promise<any>
    open(...args: any[]): Promise<any>
    seal(...args: any[]): Promise<any>
    sealUnsigned(...args: any[]): Promise<any>
    openUnsigned(...args: any[]): Promise<any>
    addEncryptionKey(...args: any[]): Promise<any>
    send(...args: any[]): Promise<any>
    sendUnpublished(...args: any[]): Promise<any>
    cacheInsert(...args: any[]): Promise<any>
    mcast(...args: any[]): Promise<any>
    requestReflection(...args: any[]): Promise<any>
    stream(...args: any[]): Promise<any>
    join(...args: any[]): Promise<any>
    publish(...args: any[]): Promise<any>
    sync(...args: any[]): Promise<any>
    close(...args: any[]): Promise<any>
    query(...args: any[]): Promise<any>
    compileCachePredicate(src: any): Promise<any>
    callWorkerThread(prop: any, data: any): any
    callMainThread(prop: any, args: any): void
    resolveMainThread(seq: any, result: any): any
    #private
  }
}
```

</details>

<details>
<summary><code>oro:latica/worker</code></summary>

```ts
declare module 'oro:latica/worker' {
  export {}
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
