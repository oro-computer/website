# MCP Server Configuration

Oro Runtime ships with a lightweight MCP HTTP/SSE bridge. The bridge can be configured
statically through `oro.toml` or dynamically at runtime.

## CLI MCP server (`oroc mcp`)

The Oro CLI also ships with an MCP server that exposes common `oroc` workflows as MCP tools,
alongside safe workspace/config file access helpers.

### Stdio transport

`oroc mcp` defaults to JSON-RPC over stdio, which is the recommended transport for Codex and
other local agent runners.

```sh
oroc mcp --stdio
```

### Streamable HTTP transport

Use `--http` to run a Streamable HTTP MCP endpoint. The CLI prints a single JSON line to
stdout describing the bound host/port/endpoint/token, then continues serving requests.

```sh
oroc mcp --http --host 127.0.0.1 --port 0 --endpoint /mcp
```

Notes:
- The CLI follows the MCP Streamable HTTP transport (2025-06-18): JSON-RPC requests return
  `Content-Type: application/json`; notifications/responses return `202 Accepted` with no body.
- Sessions are normally created during `initialize`. Subsequent requests must include
  `Mcp-Session-Id` (missing: `400`). If a client supplies an unknown session id (POST or SSE),
  the CLI will create a new session for that id so stateless clients keep working.
- The CLI supports `GET` SSE streams for server-to-client messages, scoped to a session id.
  Only one active SSE stream is allowed per session (second connection returns `409` unless
  `--replace-sse-stream` is used).
- Loopback auth defaults to disabled unless `--token` is provided or `[mcp].token` is set.
- `--endpoint` normalises common variants (`mcp`, `/mcp/`) to avoid client/server mismatches.
- The HTTP server binds ports exclusively (no `SO_REUSEPORT`) so multiple `oroc mcp --http`
  instances cannot share a host/port. This prevents cross-session and cross-workspace confusion.

### Tools and resources

The CLI exposes:
- Tools: `run_cli`, workspace file read/write/list helpers, `oro.toml` read/write/validate,
  and convenience wrappers for common `oroc` commands (e.g., `build_app`, `run_app`).
- `read_file` reads absolute paths outside the workspace root by default. Use
  `--read-workspace-only` to disable this capability.
- Resources: `workspace:/` (root listing), `workspace:/oro.toml` (config), and additional
  resources discovered from `oro.toml` (build inputs/copy maps/icons) when present.

## oro.toml configuration

Add the optional `[mcp]` section to your app configuration to define defaults
the runtime uses whenever `mcp.startServer()` is invoked without overrides.

```ini
; [mcp]
; host = 127.0.0.1
; port = 0                  ; bind to an ephemeral port by default
; endpoint = /mcp           ; base HTTP/SSE endpoint
; token = my-shared-secret  ; static bearer token enforced by the runtime
; auth_timeout_ms = 5000    ; optional timeout used when awaiting dynamic auth handlers
```

- Setting `port = 0` instructs the runtime to bind to a random available port,
  which makes it easy to spin up multiple MCP servers in the same process.
- When `token` is provided the HTTP server enforces bearer authentication. The
  token still participates in the `Authorization` callback pipeline (see below),
  so you can mix static and dynamic checks.

## Dynamic Authorization

Use `mcp.setAuthorizationHandler()` to register a callback that approves or
rejects individual HTTP requests. The handler receives all available request
metadata and can return:

- `true` to accept the request.
- `false` (or throw) to reject the request with the default `401 Unauthorized`.
- An object `{ allow, status, message }` to customise both the decision and the
  HTTP response returned to clients.

```js
import mcp from 'oro:mcp'

await mcp.setAuthorizationHandler(({ authorization, headers }) => {
  // Reject requests that do not supply an Authorization header
  if (!authorization) {
    return { allow: false, status: 401, message: 'Missing bearer token' }
  }

  // Simple shared-secret check
  return authorization === `Bearer ${process.env.EXPECTED_TOKEN}`
})
```

Pass the same handler directly to `mcp.startServer({ authorize })` to configure
the server and set the callback in a single call.

```js
await mcp.startServer({
  port: 0, // bind to any free port
  authorize: ({ headers }) => headers['x-internal-key'] === 'expected-value',
})
```

Call `mcp.setAuthorizationHandler(null)` to remove the handler. Pending
authorization requests automatically fail closed when a handler is cleared or
the server shuts down.

## API Reference

The `oro:mcp` module now provides the following helpers in addition to the
existing registration functions:

| Function                          | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| `mcp.startServer(options)`        | Starts the embedded server. Accepts `authorize` and `token`.      |
| `mcp.setAuthorizationHandler(fn)` | Registers or clears the dynamic authorization handler at runtime. |

See the runtime TypeScript declarations in the source repository (for example `api/index.d.ts`)
for the full schema (`MCPAuthorizationRequest`, `MCPAuthorizationDecision`, `MCPStartServerOptions`).
