# `oro:url`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:url'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:url
oro:url/index
oro:url/url/url
oro:url/urlpattern/urlpattern
```

### TypeScript declarations

<details>
<summary><code>oro:url</code></summary>

```ts
declare module 'oro:url' {
  export * from 'oro:url/index'
  export default URL
  import URL from 'oro:url/index'
}
```

</details>

<details>
<summary><code>oro:url/index</code></summary>

```ts
declare module 'oro:url/index' {
  /**
   * Parse a URL-like input into a structured object.
   * - When `options === true`, includes a Node-compatible `query` object.
   * - When `options?.strict === true`, returns `null` if input cannot be parsed.
   *
   * Example:
   * ```js
   * parse('https://user:pass@example.com:8080/a/b?x=1#h')
   * // => {
   * //   protocol: 'https:', hostname: 'example.com', origin: 'https://example.com:8080',
   * //   username: 'user', password: 'pass', port: '8080', pathname: '/a/b',
   * //   search: '?x=1', hash: '#h', path: '/a/b', href: 'https://user:pass@example.com:8080/a/b?x=1#h',
   * //   auth: 'user:pass', searchParams: URLSearchParams, query: 'x=1'
   * // }
   * ```
   */
  export function parse(
    input: any,
    options?: any
  ): {
    hash: any
    host: any
    hostname: any
    origin: any
    auth: string
    password: any
    pathname: any
    path: any
    port: any
    protocol: any
    search: any
    searchParams: any
    username: any
    [Symbol.toStringTag]: string
  }
  /**
   * Resolve a target URL/path `to` against a base `from`.
   * Mirrors Node's legacy `url.resolve()` semantics.
   *
   * Example:
   * ```js
   * resolve('http://example.com/a/b', '../c') // => 'http://example.com/c'
   * resolve('/a/b', 'c') // => '/a/b/c'
   * ```
   */
  export function resolve(from: any, to: any): any
  /**
   * Format a URL from either a string or a partial object containing URL fields.
   * Returns an empty string if the input is invalid or insufficient.
   *
   * Example (object):
   * ```js
   * format({ protocol: 'https:', hostname: 'example.com', pathname: '/a/b' })
   * // => 'https://example.com/a/b'
   * ```
   *
   * Example (string):
   * ```js
   * format('https://example.com/a/b') // => 'https://example.com/a/b'
   * ```
   *
   * Notes
   * - When specifying `hostname` with an IPv6 literal, brackets are added automatically.
   *   Alternatively, you can pass `host` directly as `[2001:db8::1]:8080`.
   */
  export function format(input: any): any
  export function fileURLToPath(url: any): any
  /**
   * @type {Set & { handlers: Set<string> }}
   */
  export const protocols: Set<any> & {
    handlers: Set<string>
  }
  export default URL
  export class URL {
    private constructor()
  }
  export const URLSearchParams: any
  export const parseURL: any
  import { URLPattern } from 'oro:url/urlpattern/urlpattern'
  export { URLPattern }
}
```

</details>

<details>
<summary><code>oro:url/url/url</code></summary>

```ts
declare module 'oro:url/url/url' {
  const _default: any
  export default _default
}
```

</details>

<details>
<summary><code>oro:url/urlpattern/urlpattern</code></summary>

```ts
declare module 'oro:url/urlpattern/urlpattern' {
  export { me as URLPattern }
  var me: {
    new (
      t: {},
      r: any,
      n: any
    ): {
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
      get protocol(): any
      get username(): any
      get password(): any
      get hostname(): any
      get port(): any
      get pathname(): any
      get search(): any
      get hash(): any
      get hasRegExpGroups(): boolean
    }
    compareComponent(t: any, r: any, n: any): number
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
