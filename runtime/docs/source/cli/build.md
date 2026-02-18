# `oroc build`

Build an Oro Runtime application.

You can provide a project directory, HTML file, or JavaScript module. When no `oro.toml` is found, `oroc` can infer a
minimal configuration automatically.

## Usage

```bash
oroc build [options] [<project-or-source>]
```

## Options

```text
--platform=<platform>   android | android-emulator | ios | ios-simulator (default: host)
--config=<path>         use an explicit oro.toml/oro.ini file
--copy=<source:dest>    extra copy mapping (like [build] copy; can be repeated)
--host=<host>           load index.html from host (default: 80 when port omitted)
--port=<port>           load index.html from port (default: localhost when host omitted)
--test[=path]           test mode (optionally import a test file)
--headless              build to run without a visible window
--prod                  production build (disables inspector/debugging)
-D, --debug             debug mode
-E, --env               add environment variables
-o, --only-build        only run the build step
-p, --package           package the app for distribution
-r, --run               run after building
-w, --watch             watch for changes to rerun build
--allow-exec            allow external command execution during builds
--sanitizers            enable ASan/UBSan on desktop core builds
--tls-keylog=<path>     write TLS key log lines (OpenSSL provider)
--log-file=<path>       mirror logs to a JSON file
```

## Environment

```text
ORO_ALLOW_EXEC          allow external exec during builds
ORO_ENABLE_SANITIZERS   enable ASan/UBSan on desktop builds
```

## Common errors

- Android builds: run `oroc setup --platform=android` and accept SDK licenses.
- macOS/iOS signing: set `ios.provisioning_profile` (or platform-specific signing keys) in your config.
- “external command execution is disabled”: pass `--allow-exec` or set `ORO_ALLOW_EXEC=1`.

## Platform-specific options

### Linux

```text
-f, --package-format=<format>   deb | rpm | zip | aur (default: deb)
--sign                          sign Linux packages with GPG (writes .asc next to the artifact)
--sign-key=<id>                 optional GPG key ID/fingerprint for --sign
```

Dependencies:

- deb packaging requires `dpkg` and `fakeroot` (example: `sudo apt-get install dpkg-dev fakeroot`)
- rpm packaging requires `rpmbuild` (example: `sudo dnf install rpm-build`)

### macOS

```text
-c, --codesign                  code sign the app with codesign
-n, --notarize                  notarize with notarytool
-f, --package-format=<format>   zip (default) | pkg
```

Dependencies:

- Xcode and Command Line Tools are required (`xcode-select --install`)
- For Gradle/JDK, install via Homebrew (`brew install gradle openjdk`) or SDKMAN

### iOS

```text
-c, --codesign                  code sign during xcodebuild (requires ios.provisioning_profile in config)
```

### Windows

```text
-f, --package-format=<format>   appx (default)
```

Dependencies:

- Windows 10/11 SDK and Visual Studio Build Tools are recommended
- Ensure `signtool.exe` is available (set `SIGNTOOL` or add SDK bin to `PATH`)

## Next

- Run: [`oroc run`](?p=cli/run)
- Config: [copy_map](?p=config/copy-map) · [reference](?p=config/reference)
