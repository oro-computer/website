# `oro:signal`

`oro:signal` exposes process-signal constants, conversion helpers, and event listeners.

## Examples

Listen for runtime process signals using the signal helper surface:

```js
import signal from 'oro:signal'

signal.addEventListener('SIGTERM', (event) => {
  console.log(event.type)
})
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:signal
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:signal`

```ts
declare module "oro:signal" {
    export * from "oro:process/signal";
    export default signal;
    import signal from "oro:process/signal";
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
