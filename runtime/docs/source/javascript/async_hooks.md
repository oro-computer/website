# `oro:async_hooks`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:async_hooks'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:async_hooks
```

### TypeScript declarations

<details>
<summary><code>oro:async_hooks</code></summary>

```ts
declare module 'oro:async_hooks' {
  export default exports
  import { AsyncLocalStorage } from 'oro:async/storage'
  import { AsyncResource } from 'oro:async/resource'
  import { executionAsyncResource } from 'oro:async/hooks'
  import { executionAsyncId } from 'oro:async/hooks'
  import { triggerAsyncId } from 'oro:async/hooks'
  import { createHook } from 'oro:async/hooks'
  import * as exports from 'oro:async_hooks'
  export {
    AsyncLocalStorage,
    AsyncResource,
    executionAsyncResource,
    executionAsyncId,
    triggerAsyncId,
    createHook,
  }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
