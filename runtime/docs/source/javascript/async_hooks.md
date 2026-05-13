# `oro:async_hooks`

`oro:async_hooks` exposes hook-based async lifecycle inspection compatible with Node-style instrumentation.

## Examples

Inspect async-resource lifecycles as work is scheduled:

```js
import { createHook, executionAsyncId } from 'oro:async_hooks'

const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log({ asyncId, type, triggerAsyncId })
  }
})

hook.enable()
queueMicrotask(() => {
  console.log(executionAsyncId())
  hook.disable()
})
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:async_hooks
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:async_hooks`

```ts
declare module "oro:async_hooks" {
    export default exports;
    import { AsyncLocalStorage } from "oro:async/storage";
    import { AsyncResource } from "oro:async/resource";
    import { executionAsyncResource } from "oro:async/hooks";
    import { executionAsyncId } from "oro:async/hooks";
    import { triggerAsyncId } from "oro:async/hooks";
    import { createHook } from "oro:async/hooks";
    import * as exports from "oro:async_hooks";

    export { AsyncLocalStorage, AsyncResource, executionAsyncResource, executionAsyncId, triggerAsyncId, createHook };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
