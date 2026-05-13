# Native extensions

Use a native extension when app code needs a capability that should not live in JavaScript: an existing C/C++ library,
platform-specific code, long-running native work, or a Wasm module that should be loaded through the same runtime
extension boundary as shared libraries.

Extensions are loaded by name from the app bundle. They register themselves with the runtime, usually map IPC routes,
and are then called from JavaScript with `oro:ipc`.

## 1) Choose the extension shape

| Shape | Use it for | Output |
| --- | --- | --- |
| C or C++ shared extension | Platform integration, existing native libraries, desktop and mobile native code | `<name>.so` on non-Windows, `<name>.dll` on Windows |
| Wasm extension | Portable compute or a constrained native boundary | `<name>.wasm` |

Both shapes use the same registration contract from `oro/extension.h`.

## 2) Add the extension to the app build

For a small single-file native extension, declare the source directly:

```toml
[build.extensions]
image_tools = "native/image_tools/extension.c"
```

For a multi-file extension, point at a directory. The directory can carry its own `oro.toml` or `oro.ini` extension
manifest.

```toml
[build.extensions.image_tools]
source = "native/image_tools"
```

During build, the runtime stages the extension under `oro/extensions/<name>/` in the app resources. The loader then
looks for `oro/extensions/<name>/<name>.wasm` first, then the shared-library filename for the current platform.

## 3) Write a C extension

`native/image_tools/extension.c`:

```c
#include <oro/extension.h>

static void on_resize(
  oapi_context_t* context,
  oapi_ipc_message_t* message,
  const oapi_ipc_router_t* router
) {
  (void) router;

  const char* request = oapi_ipc_message_get_value(message);
  oapi_ipc_result_t* result = oapi_ipc_result_create(context, message);
  oapi_json_object_t* data = oapi_json_object_create(context);

  oapi_json_object_set(
    data,
    "ok",
    oapi_json_boolean_create(context, true)
  );
  oapi_json_object_set(
    data,
    "request",
    oapi_json_string_create(context, request ? request : "")
  );

  oapi_ipc_result_set_json_data(result, oapi_json_any(data));
  oapi_ipc_reply(result);
}

static bool initialize(oapi_context_t* context, const void* data) {
  (void) data;

  if (!oapi_extension_is_allowed(context, "ipc_router_map")) {
    return false;
  }

  return oapi_ipc_router_map(context, "image_tools.resize", on_resize, NULL);
}

static bool deinitialize(oapi_context_t* context, const void* data) {
  (void) data;

  if (oapi_extension_is_allowed(context, "ipc_router_unmap")) {
    oapi_ipc_router_unmap(context, "image_tools.resize");
  }

  return true;
}

ORO_RUNTIME_REGISTER_EXTENSION(
  "image_tools",
  initialize,
  deinitialize,
  "Image manipulation helpers",
  "0.1.0"
);
```

The important part is the final `ORO_RUNTIME_REGISTER_EXTENSION(...)` call. It exports the canonical
`__oapi_extension_init` symbol that the runtime loader resolves when it opens the shared library.

## 4) Write the same extension as Wasm

Wasm extensions use the same header and registration macro. Set `target = "wasm32"` in the extension manifest:

```toml
[meta]
name = "image_tools"
type = "extension"

[extension]
target = "wasm32"
sources = ["extension.c"]

[extension.compiler]
flags = ["-I ../../.."]
```

The build uses the runtime's Wasm extension mode: it defines `ORO_RUNTIME_EXTENSION_WASM`, imports memory from the
host, exports the extension symbols, and writes `oro/extensions/image_tools/image_tools.wasm`.

Keep Wasm extension code inside the exported `oapi_*` surface. That keeps the module portable across hosts and avoids
depending on browser globals or a WASI surface that the extension loader may not provide.

## 5) Load and call the extension from app code

`src/main.js`:

```js
import extension from 'oro:extension'
import ipc from 'oro:ipc'

const imageTools = await extension.load('image_tools', {
  allow: ['ipc'],
})

const result = await ipc.request('image_tools.resize', {
  path: 'input/avatar.png',
  width: 256,
  height: 256,
})

if (result.err) throw result.err

console.log(result.data)
console.log(imageTools.name, imageTools.version, imageTools.type)

await imageTools.unload()
```

`allow` is the extension policy. With no policy, the extension runs with the default extension API surface. With a policy,
only matching API families are allowed. `ipc` covers route mapping and replies; use narrower policy names when you need a
stricter boundary.

## 6) Constrain production loading

For production builds, restrict where native extensions may be loaded from:

```toml
[extensions]
allowed_roots = "/Applications/FieldNotes.app/Contents/Resources/oro/extensions /opt/field-notes/extensions"
```

The runtime rejects extension names containing characters outside `A-Z`, `a-z`, `0-9`, `_`, and `-`. Keep that rule in
your package names and route prefixes.

The runtime also checks the extension ABI. Keep strict ABI checks enabled unless you are deliberately testing an older
extension against a newer runtime:

```toml
[build]
extensions_abi_strict = true
```

## 7) Debug the boundary

Use these checks when an extension does not load:

- confirm the staged file path is `oro/extensions/<name>/<name>.wasm` or the platform shared-library equivalent,
- confirm the extension name in `ORO_RUNTIME_REGISTER_EXTENSION` matches the name passed to `extension.load(...)`,
- confirm the extension exports `__oapi_extension_init`,
- confirm the ABI in the extension matches the runtime ABI,
- confirm the JavaScript `allow` policy includes the APIs used by the initializer and request handlers,
- inspect `await extension.stats()` before and after loading.

## See also

- [`oro:extension`](?p=javascript/extension)
- [`oro:ipc`](?p=javascript/ipc)
- [Configuration reference](?p=config/reference)
