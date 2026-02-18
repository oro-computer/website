# `oro:mcp`

`oro:mcp` provides runtime MCP helpers for registering tools/resources and controlling the embedded HTTP/SSE bridge.

If you want the CLI-hosted server for a workspace, see: [`oroc mcp`](?p=cli/mcp).

## Register a tool

```js
import * as mcp from 'oro:mcp'

await mcp.registerTool({
  name: 'echo',
  description: 'Echo the input.',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string' } },
    required: ['text'],
  },
  handler: ({ arguments: args }) => ({ text: args.text }),
})
```

## Register a resource

```js
import * as mcp from 'oro:mcp'

await mcp.registerResource({
  uri: 'oro://runtime/version',
  name: 'Runtime version',
  handler: async () => ({ contents: [{ type: 'text', text: 'ok' }] }),
})
```

## Start the embedded server

```js
const status = await mcp.startServer({ host: '127.0.0.1', port: 0 })
console.log(status)
```

