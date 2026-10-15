---
layout: "docs"
description: "Run a Model Context Protocol (MCP) server for agent tooling."
docsCollection: "runtime"
section: "cli"
order: 34
sourcePath: "cli/mcp.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# [`oroc mcp`](/runtime/docs/cli/mcp/)

Run a Model Context Protocol (MCP) server for agent tooling.

By default this subcommand speaks JSON-RPC over stdio (stdout is reserved for MCP messages). Use `--http` to run an
HTTP/SSE transport.

## Usage

```bash
oroc mcp [options] [<workspace-dir>]
```

## Options

| Option | Description |
| --- | --- |
| `--stdio` | use stdio transport (default) |
| `--http` | use HTTP/SSE transport |
| `--host=<host>` | HTTP bind host (default: 127.0.0.1) |
| `--port=<port>` | HTTP bind port (default: 0 for ephemeral) |
| `--endpoint=<path>` | HTTP endpoint path (default: /mcp; normalizes mcp,/mcp,/mcp/) |
| `--token=<token>` | require this bearer token (default: auto-generated in HTTP mode) |
| `--no-auth` | disable token auth (loopback only) |
| `--workspace=<path>` | explicit workspace root (default: current directory or `<workspace-dir>`) |
| `--config=<path>` | workspace-relative oro.toml/oro.ini path to use as the active project config |
| `--read-workspace-only` | restrict filesystem reads to the workspace root (default; compatibility flag) |
| `--allow-read-outside-workspace` | explicitly allow reading arbitrary files outside the workspace root |
| `--replace-sse-stream` | allow a new SSE connection to replace an existing one for the same session id |

## Notes

- Stdio mode disables JSON logs and suppresses INFO output so stdout remains valid MCP JSON-RPC.
- HTTP mode implements MCP Streamable HTTP (2025-06-18). Clients must call `initialize` and then include `Mcp-Session-Id`
  on subsequent requests.

See also: [`oro:mcp`](/runtime/docs/javascript/mcp/).
