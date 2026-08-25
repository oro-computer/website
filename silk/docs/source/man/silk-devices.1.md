# [`silk-devices(1)`](?p=man/silk-devices.1) - Manage Platform Devices And App Lifecycles

> NOTE: This is the Markdown source for the eventual man 1 page for
> `silk devices`. The roff-formatted manpage should be generated from this
> content.

## Name

`silk-devices` - discover devices, install apps, launch apps, and inspect logs.

## Synopsis

- `silk devices list [--json] [--kind <desktop|ios-simulator|ios-device|android>]`
- `silk devices doctor [--json] [--kind <desktop|ios-simulator|ios-device|android>]`
- `silk devices setup [--kind <kind>] [-- <tool args...>]`
- `silk devices install --app <path> [--kind <kind>] [--device <id>|--booted] [-- <tool args...>]`
- `silk devices uninstall (--bundle-id <id>|--package <name>) [--kind <kind>] [--device <id>|--booted] [-- <tool args...>]`
- `silk devices boot [--kind ios-simulator --device <id>|--name <name>] [--kind android --name <avd>] [-- <tool args...>]`
- `silk devices shutdown [--kind ios-simulator|android] [--device <id>|--booted] [-- <tool args...>]`
- `silk devices launch (--bundle-id <id>|--package <name>|--app <path>) [--kind <kind>] [--device <id>|--booted] [--activity <name>] [-- <tool args...>]`
- `silk devices run ...`
- `silk devices logs [--kind <kind>] [--device <id>|--booted] [--bundle-id <id>|--package <name>] [-- <tool args...>]`

## Description

`silk devices` keeps common app lifecycle plumbing under the Silk CLI while
preserving access to the platform tools that actually operate on devices.

Supported backend kinds:

- `desktop` - the local host.
- `ios-simulator` - iOS simulators through `xcrun simctl`.
- `ios-device` - iPhone and iPad devices through `xcrun devicectl`.
- `android` - Android mobile, TV, attached devices, and emulators through
 `adb` and `emulator`.

`list` and `doctor` are discovery commands. They always report the local
desktop backend and detect whether the platform-specific tools are available on
the current host. Lifecycle actions fail with a missing-tool diagnostic when the
required SDK/tool is not installed.

## Options

- `--help`, `-h` - show command help and exit.
- `--json` - emit newline-terminated, schema-versioned discovery data for
 `list` and `doctor`.
- `--kind <kind>`, `--platform <kind>` - select `desktop`, `ios-simulator`,
 `ios-device`, or `android`.
- `--device`, `-d <id>` - select a simulator UDID, physical device id, or adb
 serial.
- `--booted` - use the currently booted iOS simulator.
- `--name <name>` - select a named simulator/emulator for boot actions.
- `--app <path>` - app path for install and run actions. `launch` / `run`
 derives Apple bundle identifiers from `.app` bundles; Android APK launch
 also requires `--package <name>`.
- `--bundle-id <id>` - Apple bundle identifier.
- `--package <name>` - Android package name.
- `--activity <name>` - Android activity for `adb shell am start`.
- `--` - pass remaining arguments to the selected platform tool.

## Lifecycle Mapping

- iOS simulator:
 - `install` -> `xcrun simctl install`
 - `boot` -> `xcrun simctl boot`
 - `launch` / `run` -> `xcrun simctl launch`
 - `logs` -> `xcrun simctl spawn <device> log stream`
 - `uninstall` -> `xcrun simctl uninstall`
 - `shutdown` -> `xcrun simctl shutdown`
- iPhone/iPad:
 - `install` -> `xcrun devicectl device install app`
 - `launch` / `run` -> `xcrun devicectl device process launch`
 - `logs` -> `xcrun devicectl device log stream`
 - `uninstall` -> `xcrun devicectl device uninstall app`
- Android:
 - `setup` -> `adb start-server`
 - `install` -> `adb install` for APK inputs
 - `boot` -> `emulator -avd <name>`
 - `launch` / `run` -> `adb shell monkey` or `adb shell am start`
 - `logs` -> `adb logcat`
 - `uninstall` -> `adb uninstall`
 - `shutdown` -> `adb emu kill`
- Desktop:
 - `run` launches a direct executable or, on macOS, a `.app` bundle through
 `open`.
 - `logs` uses `log stream` on macOS or `journalctl -f` on Linux when present.

`launch` / `run --app <path>` is intentionally platform-specific. For desktop
apps it launches an executable directly, or a macOS bundle path directly when
`--kind desktop` is passed. `.app` paths infer `ios-simulator` by default; for
iOS simulator and iPhone/iPad `.app` bundles, Silk reads `CFBundleIdentifier`
from `Info.plist` and launches that installed bundle id. `.ipa` and Android
`.apk` launches require an explicit `--bundle-id` or `--package` because those
archive formats are install inputs and are not parsed by this command yet.

Android install currently accepts APK inputs only. Android App Bundles (`.aab`)
need bundletool/device-specific APK generation and are rejected with a concrete
diagnostic until that lifecycle path is implemented.

## JSON Output

`list --json` and `doctor --json` emit `schemaVersion: 1`,
`command: "devices"`, `mode`, `host`, `devices`, `backends`, and `listings`.
The `doctor` mode keeps `listings` empty and reports the local desktop device
plus backend/tool availability. The `list` mode also invokes available platform
listing commands, adds normalized device records to `devices`, and stores raw
stdout/stderr in `listings` for diagnostics or platform-specific fields.

Each backend contains:

- `kind`
- `name`
- `available`
- `tool` with name, probe kind, role, availability, and discovered path
- `setupHint`

Each device contains:

- `kind`
- `id`
- `name`
- `state`
- optional platform metadata such as iOS simulator `runtime`

Each listing contains:

- `kind`
- `command`
- `ok`
- `unavailable`
- `stdout`
- `stderr`

## Examples

```sh
# Inspect available lifecycle backends.
silk devices doctor

# Emit machine-readable backend/tool facts.
silk devices doctor --json

# Install and launch an iOS simulator app built by silk build.
silk devices install --kind ios-simulator --booted --app build/ios-simulator/MyApp.app
silk devices run --kind ios-simulator --booted --app build/ios-simulator/MyApp.app

# Stream Android logs for a selected device.
silk devices logs --kind android --device emulator-5554 -- -s MyTag
```

## Exit Status

- `0` on success.
- non-zero when arguments are invalid, a required platform tool is unavailable,
 or the delegated tool exits non-zero.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-codesign(1)`](?p=man/silk-codesign.1), [`silk-targets(1)`](?p=man/silk-targets.1)
- [cli silk](?p=compiler/cli-silk)
