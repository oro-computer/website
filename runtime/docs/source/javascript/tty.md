# `oro:tty`

`oro:tty` exposes terminal streams and TTY detection helpers.

## Examples

Detect interactive terminals before enabling richer output:

```js
import { isatty } from 'oro:tty'

console.log(isatty(0))
console.log(isatty(1))
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:tty
```

### TypeScript declarations

<details>
<summary><code>oro:tty</code></summary>

```ts
declare module "oro:tty" {
    export function WriteStream(fd: any): Writable;
    export function ReadStream(fd: any): Readable;
    export function isatty(fd: any): boolean;
    namespace _default {
        export { WriteStream };
        export { ReadStream };
        export { isatty };
    }
    export default _default;
    import { Writable } from "oro:stream";
    import { Readable } from "oro:stream";
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
