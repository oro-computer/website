---
layout: "runtime-docs"
title: "oroc mcp"
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
| `--stdio` | stdio transport (default) |
| `--http` | HTTP/SSE transport |
| `--host=<host>` | bind host (default: 127.0.0.1) |
| `--port=<port>` | bind port (default: 0 for ephemeral) |
| `--endpoint=<path>` | endpoint path (default: /mcp) |
| `--token=<token>` | require bearer token (default varies) |
| `--no-auth` | disable token auth (loopback only) |
| `--workspace=<path>` | workspace root (default: CWD or <workspace-dir>) |
| `--config=<path>` | oro.toml path relative to workspace (default: oro.toml) |
| `--read-workspace-only` | restrict filesystem reads to workspace root |
| `--allow-read-outside-workspace` | allow reading files outside workspace (default) |
| `--replace-sse-stream` | allow a new SSE connection to replace an existing one |

## Notes

- Stdio mode disables JSON logs and suppresses INFO output so stdout remains valid MCP JSON-RPC.
- HTTP mode implements MCP Streamable HTTP (2025-06-18). Clients must call `initialize` and then include `Mcp-Session-Id`
  on subsequent requests.

See also: [`oro:mcp`](/runtime/docs/javascript/mcp/).
