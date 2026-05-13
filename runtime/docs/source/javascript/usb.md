# `oro:usb`

`oro:usb` installs and exposes the runtime WebUSB surface for window contexts.

## Examples

Install the runtime WebUSB surface and request a device in window contexts:

```js
import { installNavigatorUSB } from 'oro:usb'

const usb = installNavigatorUSB()

if (usb) {
  console.log(await usb.getDevices())
  // const device = await usb.requestDevice({ filters: [{ vendorId: 0x1209 }] })
}
```

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:usb
```

### TypeScript declarations

These declarations are generated from the runtime's published TypeScript surface.

#### `oro:usb`

```ts
declare module "oro:usb" {
    /**
     * Install the WebUSB scaffold on `navigator.usb` for the current global scope.
     *
     * This is the public `oro:usb` entrypoint for the downstream WebUSB surface.
     * It returns the singleton `NavigatorUSB` instance when `navigator` is
     * available, and `undefined` in non-window contexts.
     *
     * @returns {NavigatorUSB|undefined}
     */
    export function installNavigatorUSB(): NavigatorUSB | undefined;
    namespace _default {
        export { installNavigatorUSB };
        export { NavigatorUSB };
        export { USBDevice };
        export { USBInTransferResult };
        export { USBOutTransferResult };
        export { USBConnectionEvent };
    }
    export default _default;
    import { NavigatorUSB } from "oro:internal/usb-web";
    import { USBDevice } from "oro:internal/usb-web";
    import { USBInTransferResult } from "oro:internal/usb-web";
    import { USBOutTransferResult } from "oro:internal/usb-web";
    import { USBConnectionEvent } from "oro:internal/usb-web";
    export { NavigatorUSB, USBDevice, USBInTransferResult, USBOutTransferResult, USBConnectionEvent };
}
```

<!-- GENERATED: ORO_API_REFERENCE_END -->

## See also

- [JavaScript APIs overview](?p=javascript/overview)
- [All module specifiers](?p=javascript/all-modules)
