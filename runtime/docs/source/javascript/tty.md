# `oro:tty`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:tty'

console.log(Object.keys(api))
```

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
declare module 'oro:tty' {
  export function WriteStream(fd: any): Writable
  export function ReadStream(fd: any): Readable
  export function isatty(fd: any): boolean
  namespace _default {
    export { WriteStream }
    export { ReadStream }
    export { isatty }
  }
  export default _default
  import { Writable } from 'oro:stream'
  import { Readable } from 'oro:stream'
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
