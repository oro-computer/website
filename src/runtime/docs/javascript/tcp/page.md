---
layout: "docs"
description: "oro:tcp exposes lower-level TCP client and server helpers alongside the higher-level oro:net API."
docsCollection: "runtime"
section: "javascript"
order: 117
sourcePath: "javascript/tcp.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:tcp`](/runtime/docs/javascript/tcp/)

[`oro:tcp`](/runtime/docs/javascript/tcp/) exposes lower-level TCP client and server helpers alongside the higher-level [`oro:net`](/runtime/docs/javascript/net/) API.

## Examples

Open a lower-level TCP server when you want more direct socket control:

```js
import { createServer } from 'oro:tcp'

const server = createServer((socket) => {
  socket.write(Buffer.from('connected'))
})

server.listen({ port: 5050, host: '127.0.0.1' })
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:tcp
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:tcp`](/runtime/docs/javascript/tcp/)

```ts
declare module "oro:tcp" {
    export function connect(options: any, cb: any, ...args: any[]): import("oro:net").TCPSocket;
    export const createServer: typeof _createServer;
    namespace _default {
        export { connect };
        export { createServer };
    }
    export default _default;
    import { createServer as _createServer } from "oro:net";
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
