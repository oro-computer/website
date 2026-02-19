# `oro:network`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:network'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:network
```

### TypeScript declarations

<details>
<summary><code>oro:network</code></summary>

```ts
declare module 'oro:network' {
  export default network
  export function network(options: any): Promise<events>
  import { Cache } from 'oro:latica/index'
  import { sha256 } from 'oro:latica/index'
  import { Encryption } from 'oro:latica/index'
  import { Packet } from 'oro:latica/index'
  import { NAT } from 'oro:latica/index'
  import events from 'oro:events'
  export { Cache, sha256, Encryption, Packet, NAT }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
