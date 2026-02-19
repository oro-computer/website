# `oro:module`

This page is the API reference for this runtime module family. It includes all exported bindings as
declared by the runtime’s published TypeScript definitions.

## Import

```js
import * as api from 'oro:module'

console.log(Object.keys(api))
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:module
```

### TypeScript declarations

<details>
<summary><code>oro:module</code></summary>

```ts
declare module 'oro:module' {
  export const builtinModules: object
  export default Module
  export type ModuleOptions = import('oro:commonjs/module').ModuleOptions
  export type ModuleResolver = import('oro:commonjs/module').ModuleResolver
  export type ModuleLoadOptions =
    import('oro:commonjs/module').ModuleLoadOptions
  export type RequireFunction = import('oro:commonjs/module').RequireFunction
  export type CreateRequireOptions =
    import('oro:commonjs/module').CreateRequireOptions
  import { createRequire } from 'oro:commonjs/module'
  import { Module } from 'oro:commonjs/module'
  import builtins from 'oro:commonjs/builtins'
  import { isBuiltin } from 'oro:commonjs/builtins'
  export { createRequire, Module, builtins, isBuiltin }
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
