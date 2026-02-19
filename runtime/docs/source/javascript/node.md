# `oro:node/*`

`oro:node/*` modules provide Node interop helpers used by the runtime’s module loader.
Most apps should not import these directly.

## Import

```js
import * as api from 'oro:node/index'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:node/index
```

### TypeScript declarations

<details>
<summary><code>oro:node/index</code></summary>

```ts
declare module 'oro:node/index' {
  export default network
  export function network(
    options: any
  ): Promise<import('oro:events').EventEmitter>
  import { Cache } from 'oro:latica/index'
  import { sha256 } from 'oro:latica/index'
  import { Encryption } from 'oro:latica/index'
  import { Packet } from 'oro:latica/index'
  import { NAT } from 'oro:latica/index'
  export { Cache, sha256, Encryption, Packet, NAT }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
