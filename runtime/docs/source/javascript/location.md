# `oro:location`

`oro:location` normalizes the current runtime location and origin semantics across platforms.

## Examples

Inspect the runtime-normalized location values for the current context:

```js
import location from 'oro:location'

console.log(location.href)
console.log(location.origin)
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:location
```

### TypeScript declarations

<details>
<summary><code>oro:location</code></summary>

```ts
declare module "oro:location" {
    export class Location {
        get url(): URL;
        get protocol(): string;
        get host(): string;
        get hostname(): string;
        get port(): string;
        get pathname(): string;
        get search(): string;
        get origin(): any;
        get href(): any;
        get hash(): string;
        toString(): any;
    }
    const _default: Location;
    export default _default;
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
