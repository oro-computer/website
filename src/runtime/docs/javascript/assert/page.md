---
layout: "runtime-docs"
title: "oro:assert"
description: "oro:assert provides Node-compatible assertion helpers for tests, runtime checks, and invariants."
docsCollection: "runtime"
section: "javascript"
order: 61
sourcePath: "javascript/assert.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oro:assert`](/runtime/docs/javascript/assert/)

[`oro:assert`](/runtime/docs/javascript/assert/) provides Node-compatible assertion helpers for tests, runtime checks, and invariants.

## Related guides

- [Testing and diagnostics](/runtime/docs/guides/testing-and-diagnostics/)

## Examples

Use assertion helpers for runtime invariants or tests:

```js
import { ok, strictEqual, deepEqual } from 'oro:assert'

const payload = { id: 7, tags: ['runtime', 'docs'] }

ok(payload.id > 0)
strictEqual(payload.tags.length, 2)
deepEqual(payload.tags, ['runtime', 'docs'])
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:assert
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### [`oro:assert`](/runtime/docs/javascript/assert/)

```ts
declare module "oro:assert" {
    export function assert(value: any, message?: any): void;
    export function ok(value: any, message?: any): void;
    export function equal(actual: any, expected: any, message?: any): void;
    export function notEqual(actual: any, expected: any, message?: any): void;
    export function strictEqual(actual: any, expected: any, message?: any): void;
    export function notStrictEqual(actual: any, expected: any, message?: any): void;
    export function deepEqual(actual: any, expected: any, message?: any): void;
    export function notDeepEqual(actual: any, expected: any, message?: any): void;
    export class AssertionError extends Error {
        constructor(options: any);
        actual: any;
        expected: any;
        operator: any;
    }
    const _default: typeof assert & {
        AssertionError: typeof AssertionError;
        ok: typeof ok;
        equal: typeof equal;
        notEqual: typeof notEqual;
        strictEqual: typeof strictEqual;
        notStrictEqual: typeof notStrictEqual;
        deepEqual: typeof deepEqual;
        notDeepEqual: typeof notDeepEqual;
    };
    export default _default;
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](/runtime/docs/javascript/overview/)
- [All module specifiers](/runtime/docs/javascript/all-modules/)
