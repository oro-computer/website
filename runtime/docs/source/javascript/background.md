# `oro:background`

`oro:background` lets you inspect and coordinate the runtime background task surface.

## Examples

Check whether background execution is available before scheduling work:

```js
import background from 'oro:background'

if (background.available) {
  console.log(await background.status())
}
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:background
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:background`

```ts
declare module "oro:background" {
    export default background;
    export namespace background {
        let available: boolean;
        function register(): Promise<never>;
        function schedule(): Promise<never>;
        function cancel(): Promise<never>;
        function status(): Promise<never>;
    }
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
