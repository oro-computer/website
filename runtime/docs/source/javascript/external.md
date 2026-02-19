# `oro:external/*`

`oro:external/*` modules expose bundled third-party libraries that the runtime ships internally.
They are not a stable public API surface; prefer higher-level modules when available.

## Import

```js
import * as api from 'oro:external/libsodium/index'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:external/libsodium/index
```

### TypeScript declarations

<details>
<summary><code>oro:external/libsodium/index</code></summary>

```ts
declare module 'oro:external/libsodium/index' {
  const _default: any
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
