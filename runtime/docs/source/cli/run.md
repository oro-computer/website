# `oroc run`

Run an Oro Runtime application.

You can provide a project directory, HTML file, or JavaScript module. When no `oro.toml` is found, `oroc` can infer a
minimal configuration automatically.

## Usage

```bash
oroc run [options] [<project-or-source>]
```

## Options

```text
--headless              run without a visible window
--platform=<platform>   android | android-emulator | ios | ios-simulator (default: host)
--config=<path>         use an explicit oro.toml/oro.ini file
--host=<host>           load index.html from host (default: 80 when port omitted)
--port=<port>           load index.html from port (default: localhost when host omitted)
--prod                  production build (disables inspector/debugging)
--test[=path]           test mode (optionally import a test file)
-D, --debug             debug mode
-E, --env               add environment variables
-V, --verbose           verbose output
--allow-exec            allow external command execution during builds
--tls-keylog=<path>     write TLS key log lines (OpenSSL provider)
--log-file=<path>       mirror logs to a JSON file
```

## Environment

```text
ORO_DEBUG               enable debug mode (like -D)
ORO_VERBOSE             enable verbose logs (like -V)
```

## Common errors

- CI/Linux headless: install `xvfb-run` or set a custom headless runner in your config.
- Use `--test=path` to run tests bundled with your app.

