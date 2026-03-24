# `oro:network`

`oro:network` exposes a higher-level networking surface built on the Latica stack.

## Examples

Start the higher-level networking surface and attach event listeners:

```js
import network from 'oro:network'

const bus = await network({})

bus.on('error', console.error)
bus.on('message', (message) => console.log(message))
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

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
declare module "oro:network" {
    export default network;
    export function network(options: any): Promise<events>;
    import { Cache } from "oro:latica/index";
    import { sha256 } from "oro:latica/index";
    import { Encryption } from "oro:latica/index";
    import { Packet } from "oro:latica/index";
    import { NAT } from "oro:latica/index";
    import events from "oro:events";
    export { Cache, sha256, Encryption, Packet, NAT };
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
