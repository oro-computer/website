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

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:signal
```

### TypeScript declarations

<details>
<summary><code>oro:signal</code></summary>

```ts
declare module "oro:signal" {
    export * from "oro:process/signal";
    export default signal;
    import signal from "oro:process/signal";
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
