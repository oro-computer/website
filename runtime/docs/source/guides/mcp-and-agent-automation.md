# MCP and agent automation

Oro Runtime supports MCP in two complementary ways:

- the CLI can expose a workspace-oriented MCP server with `oroc mcp`,
- the app can expose runtime tools and resources through `oro:mcp`.

Use the CLI server when the agent needs project context and command execution. Use the in-app server when the agent needs
live application state.

## 1) Start with the CLI-hosted server

For local editor and agent integrations, stdio is the clean default:

```bash
oroc mcp --stdio .
```

For a loopback HTTP server:

```bash
oroc mcp --http --host 127.0.0.1 --port 0 --endpoint /mcp .
```

That gives an agent a structured view of the workspace, configuration, and selected CLI workflows.

## 2) Register app-native tools with `oro:mcp`

`src/main.js`:

```js
import * as mcp from 'oro:mcp'

await mcp.registerTool({
  name: 'list_notes',
  description: 'Return note titles for the current workspace.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => ({
    notes: [
      { id: 1, title: 'Inspect libvirt host' },
      { id: 2, title: 'Ship signed update' },
    ],
  }),
})
```

This is where the app can expose live, high-value operations instead of generic command execution.

## 3) Register resources for read-oriented context

```js
await mcp.registerResource({
  uri: 'oro://field-notes/open-note',
  name: 'Open note',
  description: 'The note currently selected in the UI.',
  handler: async () => ({
    contents: [
      {
        type: 'text',
        text: 'Current note: Release checklist for version 1.2.0',
      },
    ],
  }),
})
```

Use tools for actions. Use resources for durable context.

## 4) Start the embedded MCP bridge with an explicit policy

```js
await mcp.setAuthorizationHandler(({ authorization }) => {
  return authorization === 'Bearer local-dev-token'
})

const status = await mcp.startServer({
  host: '127.0.0.1',
  port: 0,
  endpoint: '/mcp',
})

console.log(status)
```

If you expose an HTTP bridge, be explicit about authorization. Do not leave that to convention.

## 5) Choose the right boundary

Use `oroc mcp` when you want:

- workspace inspection,
- config and docs discovery,
- controlled CLI execution.

Use `oro:mcp` when you want:

- app state,
- in-memory note/search/session context,
- application-owned tools that do not make sense at the workspace level.

Most serious automation stacks use both.

## Considerations

- Keep tool names stable and descriptive.
- Treat MCP exposure as part of your security model.
- Prefer narrow, auditable tools over one generic “run anything” endpoint.

## Next

- [Testing and diagnostics](?p=guides/testing-and-diagnostics)
- [`oroc mcp`](?p=cli/mcp)
- [`oro:mcp`](?p=javascript/mcp)
