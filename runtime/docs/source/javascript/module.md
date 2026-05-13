# `oro:module`

`oro:module` exposes module-loader helpers and builtin-module inspection.

## Examples

Inspect builtin modules and create a `require()` function when you need one:

```js
import Module, { builtinModules, isBuiltin, createRequire } from 'oro:module'

const require = createRequire(import.meta.url)

console.log(isBuiltin('oro:path'))
console.log(Object.keys(builtinModules).length)
console.log(typeof Module)
console.log(typeof require)
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:module
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:module`

```ts
declare module "oro:module" {
    export const builtinModules: any;
    export default Module;
    export type ModuleOptions = import("oro:commonjs/module").ModuleOptions;
    export type ModuleResolver = import("oro:commonjs/module").ModuleResolver;
    export type ModuleLoadOptions = import("oro:commonjs/module").ModuleLoadOptions;
    export type RequireFunction = import("oro:commonjs/module").RequireFunction;
    export type CreateRequireOptions = import("oro:commonjs/module").CreateRequireOptions;
    import { createRequire } from "oro:commonjs/module";
    import { Module } from "oro:commonjs/module";
    import builtins from "oro:commonjs/builtins";
    import { isBuiltin } from "oro:commonjs/builtins";
    export { createRequire, Module, builtins, isBuiltin };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
