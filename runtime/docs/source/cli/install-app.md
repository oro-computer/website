# `oroc install-app`

Install the app to the device or host target.

## Usage

```bash
oroc install-app [--platform=<platform>] [--device=<identifier>] [options]
```

## Options

```text
-D, --debug             debug output
--device[=identifier]   device identifier (ECID/UDID/ID)
--platform=<platform>   android | ios (default: host)
--prod                  install production build
-V, --verbose           verbose output
```

macOS only:

```text
--target=<target>       install into '$target/Applications' (default: /)
```

## Common errors

- Android: list devices with `adb devices` or pass `--device`.
- iOS/macOS: list devices with `oroc list-devices --platform=ios` and pass `--device`.

