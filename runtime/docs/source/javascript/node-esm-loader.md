# `oro:node-esm-loader`

`oro:node-esm-loader` exposes the runtime’s ESM loader resolution hook.

## Examples

Reuse the runtime resolver from a custom ESM loader hook:

```js
import resolve from 'oro:node-esm-loader'

export async function resolveHook(specifier, context, nextResolve) {
  return resolve(specifier, context, nextResolve)
}
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:node-esm-loader
```

### TypeScript declarations

<details>
<summary><code>oro:node-esm-loader</code></summary>

```ts
declare module "oro:node-esm-loader" {
    export function resolve(specifier: any, _ctx: any, next: any): Promise<any>;
    export default resolve;
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
