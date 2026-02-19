# `oro:diagnostics`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:diagnostics'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:diagnostics
oro:diagnostics/channels
oro:diagnostics/index
oro:diagnostics/metric
oro:diagnostics/runtime
oro:diagnostics/window
```

### TypeScript declarations

<details>
<summary><code>oro:diagnostics</code></summary>

```ts
declare module 'oro:diagnostics' {
  export * from 'oro:diagnostics/index'
  export default exports
  import * as exports from 'oro:diagnostics/index'
}
```

</details>

<details>
<summary><code>oro:diagnostics/channels</code></summary>

```ts
declare module 'oro:diagnostics/channels' {
  /**
   * Normalizes a channel name to lower case replacing white space,
   * hyphens (-), underscores (_), with dots (.).
   * @ignore
   */
  export function normalizeName(group: any, name: any): string
  /**
   * Used to preallocate a minimum sized array of subscribers for
   * a channel.
   * @ignore
   */
  export const MIN_CHANNEL_SUBSCRIBER_SIZE: 64
  /**
   * A general interface for diagnostic channels that can be subscribed to.
   */
  export class Channel {
    constructor(name: any)
    name: any
    group: any
    /**
     * Computed subscribers for all channels in this group.
     * @type {Array<function>}
     */
    get subscribers(): Array<Function>
    /**
     * Accessor for determining if channel has subscribers. This
     * is always `false` for `Channel instances and `true` for `ActiveChannel`
     * instances.
     */
    get hasSubscribers(): boolean
    /**
     * Computed number of subscribers for this channel.
     */
    get length(): number
    /**
     * Resets channel state.
     * @param {(boolean)} [shouldOrphan = false]
     */
    reset(shouldOrphan?: boolean): void
    channel(name: any): Channel
    /**
     * Adds an `onMessage` subscription callback to the channel.
     * @return {boolean}
     */
    subscribe(_: any, onMessage: any): boolean
    /**
     * Removes an `onMessage` subscription callback from the channel.
     * @param {function} onMessage
     * @return {boolean}
     */
    unsubscribe(_: any, onMessage: Function): boolean
    /**
     * A no-op for `Channel` instances. This function always returns `false`.
     * @param {string|object} name
     * @param {object=} [message]
     * @return Promise<boolean>
     */
    publish(_name: any, _message?: any): Promise<boolean>
    /**
     * Returns a string representation of the `ChannelRegistry`.
     * @ignore
     */
    toString(): any
    /**
     * Iterator interface
     * @ignore
     */
    get [Symbol.iterator](): any[]
    /**
     * The `Channel` string tag.
     * @ignore
     */
    [Symbol.toStringTag](): string
    #private
  }
  /**
   * An `ActiveChannel` is a prototype implementation for a `Channel`
   * that provides an interface what is considered an "active" channel. The
   * `hasSubscribers` accessor always returns `true` for this class.
   */
  export class ActiveChannel extends Channel {
    unsubscribe(onMessage: any): boolean
    /**
     * @param {object|any} message
     * @return Promise<boolean>
     */
    publish(message: object | any): Promise<boolean>
  }
  /**
   * A container for a grouping of channels that are named and owned
   * by this group. A `ChannelGroup` can also be a regular channel.
   */
  export class ChannelGroup extends Channel {
    /**
     * @param {Array<Channel>} channels
     * @param {string} name
     */
    constructor(name: string, channels: Array<Channel>)
    channels: Channel[]
    /**
     * Subscribe to a channel or selection of channels in this group.
     * @param {string} name
     * @return {boolean}
     */
    subscribe(name: string, onMessage: any): boolean
    /**
     * Unsubscribe from a channel or selection of channels in this group.
     * @param {string} name
     * @return {boolean}
     */
    unsubscribe(name: string, onMessage: any): boolean
    /**
     * Gets or creates a channel for this group.
     * @param {string} name
     * @return {Channel}
     */
    channel(name: string): Channel
    /**
     * Select a test of channels from this group.
     * The following syntax is supported:
     *   - One Channel: `group.channel`
     *   - All Channels: `*`
     *   - Many Channel: `group.*`
     *   - Collections: `['group.a', 'group.b', 'group.c'] or `group.a,group.b,group.c`
     * @param {string|Array<string>} keys
     * @param {(boolean)} [hasSubscribers = false] - Enforce subscribers in selection
     * @return {Array<{name: string, channel: Channel}>}
     */
    select(
      keys: string | Array<string>,
      hasSubscribers?: boolean
    ): Array<{
      name: string
      channel: Channel
    }>
  }
  /**
   * An object mapping of named channels to `WeakRef<Channel>` instances.
   */
  export const registry: {
    /**
     * Subscribes callback `onMessage` to channel of `name`.
     * @param {string} name
     * @param {function} onMessage
     * @return {boolean}
     */
    subscribe(name: string, onMessage: Function): boolean
    /**
     * Unsubscribes callback `onMessage` from channel of `name`.
     * @param {string} name
     * @param {function} onMessage
     * @return {boolean}
     */
    unsubscribe(name: string, onMessage: Function): boolean
    /**
     * Predicate to determine if a named channel has subscribers.
     * @param {string} name
     */
    hasSubscribers(name: string): boolean
    /**
     * Get or set a channel by `name`.
     * @param {string} name
     * @return {Channel}
     */
    channel(name: string): Channel
    /**
     * Creates a `ChannelGroup` for a set of channels
     * @param {string} name
     * @param {Array<string>} [channels]
     * @return {ChannelGroup}
     */
    group(name: string, channels?: Array<string>): ChannelGroup
    /**
     * Get a channel by name. The name is normalized.
     * @param {string} name
     * @return {Channel?}
     */
    get(name: string): Channel | null
    /**
     * Checks if a channel is known by  name. The name is normalized.
     * @param {string} name
     * @return {boolean}
     */
    has(name: string): boolean
    /**
     * Set a channel by name. The name is normalized.
     * @param {string} name
     * @param {Channel} channel
     * @return {Channel?}
     */
    set(name: string, channel: Channel): Channel | null
    /**
     * Removes a channel by `name`
     * @return {boolean}
     */
    remove(name: any): boolean
    /**
     * Returns a string representation of the `ChannelRegistry`.
     * @ignore
     */
    toString(): any
    /**
     * Returns a JSON representation of the `ChannelRegistry`.
     * @return {object}
     */
    toJSON(): object
    /**
     * The `ChannelRegistry` string tag.
     * @ignore
     */
    [Symbol.toStringTag](): string
  }
  export default registry
}
```

</details>

<details>
<summary><code>oro:diagnostics/index</code></summary>

```ts
declare module 'oro:diagnostics/index' {
  /**
   * @param {string} name
   * @return {import('./channels.js').Channel}
   */
  export function channel(
    name: string
  ): import('oro:diagnostics/channels').Channel
  export default exports
  import * as exports from 'oro:diagnostics/index'
  import channels from 'oro:diagnostics/channels'
  import window from 'oro:diagnostics/window'
  import runtime from 'oro:diagnostics/runtime'
  export { channels, window, runtime }
}
```

</details>

<details>
<summary><code>oro:diagnostics/metric</code></summary>

```ts
declare module 'oro:diagnostics/metric' {
  export class Metric {
    init(): void
    update(_value: any): void
    destroy(): void
    toJSON(): {}
    toString(): string
    [Symbol.iterator](): any
    [Symbol.toStringTag](): string
  }
  export default Metric
}
```

</details>

<details>
<summary><code>oro:diagnostics/runtime</code></summary>

```ts
declare module 'oro:diagnostics/runtime' {
  /**
   * Queries runtime diagnostics.
   * @return {Promise<QueryDiagnostic>}
   */
  export function query(type: any): Promise<QueryDiagnostic>
  /**
   * A base container class for diagnostic information.
   */
  export class Diagnostic {
    /**
     * A container for handles related to the diagnostics
     */
    static Handles: {
      new (): {
        /**
         * The nunmber of handles in this diagnostics.
         * @type {number}
         */
        count: number
        /**
         * A set of known handle IDs
         * @type {string[]}
         */
        ids: string[]
      }
    }
    /**
     * Known handles for this diagnostics.
     * @type {Diagnostic.Handles}
     */
    handles: {
      new (): {
        /**
         * The nunmber of handles in this diagnostics.
         * @type {number}
         */
        count: number
        /**
         * A set of known handle IDs
         * @type {string[]}
         */
        ids: string[]
      }
    }
  }
  /**
   * A container for libuv diagnostics
   */
  export class UVDiagnostic extends Diagnostic {
    /**
     * A container for libuv metrics.
     */
    static Metrics: {
      new (): {
        /**
         * The number of event loop iterations.
         * @type {number}
         */
        loopCount: number
        /**
         * Number of events that have been processed by the event handler.
         * @type {number}
         */
        events: number
        /**
         * Number of events that were waiting to be processed when the
         * event provider was called.
         * @type {number}
         */
        eventsWaiting: number
      }
    }
    /**
     * Known libuv metrics for this diagnostic.
     * @type {UVDiagnostic.Metrics}
     */
    metrics: {
      new (): {
        /**
         * The number of event loop iterations.
         * @type {number}
         */
        loopCount: number
        /**
         * Number of events that have been processed by the event handler.
         * @type {number}
         */
        events: number
        /**
         * Number of events that were waiting to be processed when the
         * event provider was called.
         * @type {number}
         */
        eventsWaiting: number
      }
    }
    /**
     * The current idle time of the libuv loop
     * @type {number}
     */
    idleTime: number
    /**
     * The number of active requests in the libuv loop
     * @type {number}
     */
    activeRequests: number
  }
  /**
   * A container for Core Post diagnostics.
   */
  export class PostsDiagnostic extends Diagnostic {}
  /**
   * A container for child process diagnostics.
   */
  export class ChildProcessDiagnostic extends Diagnostic {}
  /**
   * A container for AI diagnostics.
   */
  export class AIDiagnostic extends Diagnostic {
    /**
     * A container for AI LLM diagnostics.
     */
    static LLMDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * Known AI LLM diagnostics.
     * @type {AIDiagnostic.LLMDiagnostic}
     */
    llm: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
  }
  /**
   * A container for various filesystem diagnostics.
   */
  export class FSDiagnostic extends Diagnostic {
    /**
     * A container for filesystem watcher diagnostics.
     */
    static WatchersDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * A container for filesystem descriptors diagnostics.
     */
    static DescriptorsDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * Known FS watcher diagnostics.
     * @type {FSDiagnostic.WatchersDiagnostic}
     */
    watchers: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * @type {FSDiagnostic.DescriptorsDiagnostic}
     */
    descriptors: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
  }
  /**
   * A container for various timers diagnostics.
   */
  export class TimersDiagnostic extends Diagnostic {
    /**
     * A container for core timeout timer diagnostics.
     */
    static TimeoutDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * A container for core interval timer diagnostics.
     */
    static IntervalDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * A container for core immediate timer diagnostics.
     */
    static ImmediateDiagnostic: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * @type {TimersDiagnostic.TimeoutDiagnostic}
     */
    timeout: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * @type {TimersDiagnostic.IntervalDiagnostic}
     */
    interval: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
    /**
     * @type {TimersDiagnostic.ImmediateDiagnostic}
     */
    immediate: {
      new (): {
        /**
         * Known handles for this diagnostics.
         * @type {Diagnostic.Handles}
         */
        handles: {
          new (): {
            /**
             * The nunmber of handles in this diagnostics.
             * @type {number}
             */
            count: number
            /**
             * A set of known handle IDs
             * @type {string[]}
             */
            ids: string[]
          }
        }
      }
      /**
       * A container for handles related to the diagnostics
       */
      Handles: {
        new (): {
          /**
           * The nunmber of handles in this diagnostics.
           * @type {number}
           */
          count: number
          /**
           * A set of known handle IDs
           * @type {string[]}
           */
          ids: string[]
        }
      }
    }
  }
  /**
   * A container for UDP diagnostics.
   */
  export class UDPDiagnostic extends Diagnostic {}
  /**
   * A container for various queried runtime diagnostics.
   */
  export class QueryDiagnostic {
    posts: PostsDiagnostic
    childProcess: ChildProcessDiagnostic
    ai: AIDiagnostic
    fs: FSDiagnostic
    timers: TimersDiagnostic
    udp: UDPDiagnostic
    uv: UVDiagnostic
  }
  namespace _default {
    export { query }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:diagnostics/window</code></summary>

```ts
declare module 'oro:diagnostics/window' {
  export class RequestAnimationFrameMetric extends Metric {
    constructor(options: any)
    originalRequestAnimationFrame: typeof requestAnimationFrame
    requestAnimationFrame(callback: any): any
    sampleSize: any
    sampleTick: number
    channel: import('oro:diagnostics/channels').Channel
    value: {
      rate: number
      samples: number
    }
    now: number
    samples: Uint8Array<any>
    update(_value: any): void
    toJSON(): {
      sampleSize: any
      sampleTick: number
      samples: number[]
      rate: number
      now: number
    }
  }
  export class FetchMetric extends Metric {
    constructor(_options: any)
    originalFetch: typeof fetch
    channel: import('oro:diagnostics/channels').Channel
    fetch(resource: any, options: any, extra: any): Promise<any>
  }
  export class XMLHttpRequestMetric extends Metric {
    constructor(_options: any)
    channel: import('oro:diagnostics/channels').Channel
    patched: {
      open: {
        (method: string, url: string | URL): void
        (
          method: string,
          url: string | URL,
          async: boolean,
          username?: string | null,
          password?: string | null
        ): void
      }
      send: (body?: Document | XMLHttpRequestBodyInit | null) => void
    }
  }
  export class WorkerMetric extends Metric {
    constructor(_options: any)
    GlobalWorker:
      | {
          new (scriptURL: string | URL, options?: WorkerOptions): Worker
          prototype: Worker
        }
      | {
          new (): {}
        }
    channel: import('oro:diagnostics/channels').Channel
    Worker: {
      new (url: any, options: any, ...args: any[]): {}
    }
  }
  export const metrics: {
    requestAnimationFrame: RequestAnimationFrameMetric
    XMLHttpRequest: XMLHttpRequestMetric
    Worker: WorkerMetric
    fetch: FetchMetric
    channel: import('oro:diagnostics/channels').ChannelGroup
    subscribe(...args: any[]): boolean
    unsubscribe(...args: any[]): boolean
    start(which: any): void
    stop(which: any): void
  }
  namespace _default {
    export { metrics }
  }
  export default _default
  import { Metric } from 'oro:diagnostics/metric'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
