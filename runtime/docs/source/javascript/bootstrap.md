# `oro:bootstrap`

`oro:bootstrap` downloads and verifies application payloads during bootstrap and update flows.

## Examples

Verify a downloaded artifact before handing it to the bootstrap helper:

```js
import { bootstrap, checkHash } from 'oro:bootstrap'

const manifest = { url: 'https://updates.example/app.tar' }
const expectedHash = '0123456789abcdef'

const ok = await checkHash('./downloads/app.tar', expectedHash, 'sha256')
if (!ok) throw new Error('artifact hash mismatch')

const job = bootstrap({ url: manifest.url, dest: './downloads/app.tar' })
await job.run()
```

## See also

- [Module index](?p=javascript/module-index)
- [All module specifiers](?p=javascript/all-modules)

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:bootstrap
```

### TypeScript declarations

<details>
<summary><code>oro:bootstrap</code></summary>

```ts
declare module "oro:bootstrap" {
    /**
     * @param {string} dest - file path
     * @param {string} hash - hash string
     * @param {string} hashAlgorithm - hash algorithm
     * @returns {Promise<boolean>}
     */
    export function checkHash(dest: string, hash: string, hashAlgorithm: string): Promise<boolean>;
    export function bootstrap(options: any): Bootstrap;
    namespace _default {
        export { bootstrap };
        export { checkHash };
    }
    export default _default;
    class Bootstrap extends EventEmitter {
        constructor(options: any);
        options: any;
        run(): Promise<void>;
        /**
         * @param {object} options
         * @param {Uint8Array} options.fileBuffer
         * @param {string} options.dest
         * @returns {Promise<void>}
         */
        write({ fileBuffer, dest }: {
            fileBuffer: Uint8Array;
            dest: string;
        }): Promise<void>;
        /**
         * @param {string} url - url to download
         * @returns {Promise<Uint8Array>}
         * @throws {Error} - if status code is not 200
         */
        download(url: string): Promise<Uint8Array>;
        cleanup(): void;
    }
    import { EventEmitter } from "oro:events";
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
