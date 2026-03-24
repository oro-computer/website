# `oro:npm/*`

`oro:npm/*` supports package-resolution and service-worker plumbing for NPM-backed modules.

## Examples

Resolve an NPM specifier to the runtime module URL it will load:

```js
import { resolve } from 'oro:npm/module'

const resolved = resolve('react', import.meta.url)

console.log(resolved?.url)
console.log(resolved?.type)
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:npm/module
oro:npm/service-worker
```

### TypeScript declarations

<details>
<summary><code>oro:npm/module</code></summary>

```ts
declare module "oro:npm/module" {
    /**
     * @typedef {{
     * package: Package
     * origin: string,
     * type: 'commonjs' | 'module',
     * url: string
     * }} ModuleResolution
     */
    /**
     * Resolves an NPM module for a given `specifier` and an optional `origin`.
     * @param {string|URL} specifier
     * @param {string|URL=} [origin]
     * @param {{ prefix?: string, type?: 'commonjs' | 'module' }} [options]
     * @return {ModuleResolution|null}
     */
    export function resolve(specifier: string | URL, origin?: (string | URL) | undefined, options?: {
        prefix?: string;
        type?: "commonjs" | "module";
    }): ModuleResolution | null;
    namespace _default {
        export { resolve };
    }
    export default _default;
    export type ModuleResolution = {
        package: Package;
        origin: string;
        type: "commonjs" | "module";
        url: string;
    };
    import { Package } from "oro:commonjs/package";
}
```

</details>

<details>
<summary><code>oro:npm/service-worker</code></summary>

```ts
declare module "oro:npm/service-worker" {
    /**
     * @ignore
     * @param {Request}
     * @param {object} env
     * @param {import('../service-worker/context.js').Context} ctx
     * @return {Promise<Response|null>}
     */
    export function onRequest(request: any, env: object, ctx: import("oro:service-worker/context").Context): Promise<Response | null>;
    /**
     * Handles incoming 'npm://<module_name>/<pathspec...>' requests.
     * @param {Request} request
     * @param {object} env
     * @param {import('../service-worker/context.js').Context} ctx
     * @return {Response?}
     */
    export default function _default(request: Request, env: object, ctx: import("oro:service-worker/context").Context): Response | null;
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
