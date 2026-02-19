# `oro:toml`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:toml'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:toml
```

### TypeScript declarations

<details>
<summary><code>oro:toml</code></summary>

```ts
declare module 'oro:toml' {
  /**
   * Parse a TOML document and return a JavaScript representation.
   *
   * @param {string} source
   * @param {{ reviver?: (key: string, value: unknown) => unknown }} [options]
   * @returns {any}
   */
  export function parse(
    source: string,
    options?: {
      reviver?: (key: string, value: unknown) => unknown
    }
  ): any
  /**
   * Serialize a JavaScript object into a TOML document.
   *
   * @param {Record<string, any>} table
   * @param {{}} [options]
   * @returns {string}
   */
  export function stringify(table: Record<string, any>, options?: {}): string
  /**
   * Represents a TOML local date.
   */
  export class TomlLocalDate {
    /**
     * @param {number} year
     * @param {number} month
     * @param {number} day
     */
    constructor(year: number, month: number, day: number)
    year: number
    month: number
    day: number
    toString(): string
    toJSON(): string
  }
  /**
   * Represents a TOML local time.
   */
  export class TomlLocalTime {
    /**
     * @param {number} hour
     * @param {number} minute
     * @param {number} second
     * @param {number} nanosecond
     */
    constructor(
      hour: number,
      minute: number,
      second: number,
      nanosecond: number
    )
    hour: number
    minute: number
    second: number
    nanosecond: number
    toString(): string
    toJSON(): string
  }
  /**
   * Represents a TOML local date-time.
   */
  export class TomlLocalDateTime {
    /**
     * @param {TomlLocalDate} date
     * @param {TomlLocalTime} time
     */
    constructor(date: TomlLocalDate, time: TomlLocalTime)
    date: TomlLocalDate
    time: TomlLocalTime
    toString(): string
    toJSON(): string
  }
  namespace _default {
    export { parse }
    export { stringify }
    export { TomlLocalDate }
    export { TomlLocalTime }
    export { TomlLocalDateTime }
  }
  export default _default
  export type TableMeta = {
    declared: boolean
    closed: boolean
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
