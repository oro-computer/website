# `oroc`

`oroc` is the Oro Runtime command line tool. It builds, runs, packages, and inspects Oro Runtime projects.

## Usage

```bash
oroc [SUBCOMMAND] [options] [<project-dir>]
oroc [SUBCOMMAND] -h
```

## Subcommands

- `build` — [Build](?p=cli/build)
- `run` — [Run](?p=cli/run)
- `init` — [Create a project](?p=cli/init)
- `setup` — [Install toolchain dependencies](?p=cli/setup)
- `install-app` — [Install to a device/target](?p=cli/install-app)
- `list-devices` — [List connected devices](?p=cli/list-devices)
- `print-build-dir` — [Print build output path](?p=cli/print-build-dir)
- `config` — [Inspect config values](?p=cli/config)
- `env` — [Print relevant environment variables](?p=cli/env)
- `mcp` — [Run an MCP server](?p=cli/mcp)
- `version` — [Inspect or bump project version](?p=cli/version)
- `versions` — [Print CLI/runtime dependency versions](?p=cli/versions)
- `update` — [Update tooling](?p=cli/update)

## Global options

```text
-h, --help            print help
--prefix              print install path
-v, --version         print program version
-q, --quiet           hint for less log output
-V, --verbose         verbose output (can be global)
-D, --debug           debug output (can be global)
--no-color            disable colored log output
--json                structured JSON logs on stdout
--log-file=<path>     mirror logs to a JSON file
```

## Logging and debug environment

```text
ORO_DEBUG             enable debug mode (like -D)
ORO_VERBOSE           enable verbose logs (like -V)
ORO_LOG_NO_COLOR      disable colored log output
ORO_LOG_JSON          enable structured JSON logs on stdout
ORO_LOG_FILE          mirror logs to a JSON file
ORO_ALLOW_EXEC        allow external exec during builds
ORO_ENABLE_SANITIZERS enable ASan/UBSan on desktop builds
```

## Config discovery (project vs source)

Most commands accept a project directory. `build` and `run` can also take a single HTML file or JavaScript module.
When no `oro.toml` is found, `oroc` infers a minimal configuration automatically.

See: [Config overview](?p=config/overview).

