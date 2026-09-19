---
layout: "docs"
description: "oro:clipboard reads and writes clipboard text from the current application context."
docsCollection: "runtime"
section: "javascript"
order: 68
sourcePath: "javascript/clipboard.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:clipboard`](/runtime/docs/javascript/clipboard/)

[`oro:clipboard`](/runtime/docs/javascript/clipboard/) reads and writes clipboard text from the current application context.

## Related guides

- [Desktop integrations](/runtime/docs/guides/desktop-integrations/)

## Examples

Read and write plain-text clipboard content:

```js
import { writeText, readText, canWriteText } from 'oro:clipboard'

if (canWriteText()) {
  await writeText('Copied from Oro Runtime')
  console.log(await readText())
}
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:clipboard
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:clipboard`](/runtime/docs/javascript/clipboard/)

```ts
declare module "oro:clipboard" {
    /**
     * Write a string to the system clipboard.
     * @param {string} text
     * @returns {Promise<void>}
     */
    export function writeText(text: string): Promise<void>;
    /**
     * Read the current text contents from the system clipboard.
     * @returns {Promise<string>}
     */
    export function readText(): Promise<string>;
    /**
     * @returns {boolean} True when clipboard write operations are supported.
     */
    export function canWriteText(): boolean;
    /**
     * @returns {boolean} True when clipboard read operations are supported.
     */
    export function canReadText(): boolean;
    namespace _default {
        export { writeText };
        export { readText };
        export { canWriteText };
        export { canReadText };
    }
    export default _default;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
