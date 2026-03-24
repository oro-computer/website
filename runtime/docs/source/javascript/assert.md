# `oro:assert`

`oro:assert` provides Node-compatible assertion helpers for tests, runtime checks, and invariants.

## Examples

Use assertion helpers for runtime invariants or tests:

```js
import { ok, strictEqual, deepEqual } from 'oro:assert'

const payload = { id: 7, tags: ['runtime', 'docs'] }

ok(payload.id > 0)
strictEqual(payload.tags.length, 2)
deepEqual(payload.tags, ['runtime', 'docs'])
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:assert
```

### TypeScript declarations

<details>
<summary><code>oro:assert</code></summary>

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

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
