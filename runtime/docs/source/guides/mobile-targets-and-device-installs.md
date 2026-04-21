# Mobile targets and device installs

Oro Runtime can target Android and Apple devices from the same project model. The key is to separate three concerns:

- installing toolchains,
- choosing a target device,
- building and installing the app artifact.

## 1) Install the platform toolchains first

For Android:

```bash
oroc setup --platform=android
```

For Apple targets:

```bash
oroc setup --platform=ios
```

Run this before you debug device issues. Most "build is broken" reports are really missing SDK state.

## 2) Keep machine-local target choices in `.ororc`

`.ororc`:

```ini
[build]
platform = ios-simulator

[ios]
simulator_device = "iPhone 15"

[android]
sdk = "/Users/alex/Library/Android/sdk"
```

This keeps developer-specific device and SDK details out of the shared project config.

## 3) Inspect available devices before you install

For Android:

```bash
oroc list-devices --platform=android
```

For Apple devices and simulators:

```bash
oroc list-devices --platform=ios
```

Choose the exact identifier you intend to target. Do not rely on whatever happens to be connected first.

## 4) Build for the target you actually want

Android:

```bash
oroc build . --platform=android --prod
```

Apple simulator or device:

```bash
oroc build . --platform=ios --prod
```

If you are iterating on simulator flows, `oroc run . --platform=ios-simulator` is useful. For actual deployment,
produce a real build artifact first.

## 5) Install onto the selected device

Android:

```bash
oroc install-app --platform=android --device emulator-5554
```

Apple:

```bash
oroc install-app --platform=ios --device <device-or-simulator-id>
```

That makes installation an explicit step instead of a side effect of development.

## 6) Keep the project portable across desktop and mobile

The same app code can still use platform-specific configuration where needed:

```toml
[android]
permissions = "INTERNET"

[ios]
development_team = "ABCDE12345"
```

Use platform sections for packaging and deployment differences, not to fork the whole application model.

## 7) Make device deployment repeatable in CI and support workflows

The useful commands for support and automation are:

```bash
oroc env
oroc list-devices --platform=android
oroc list-devices --platform=ios
```

Those give you a concrete picture of the environment instead of guessing from failed installs.

## Considerations

- Keep provisioning, signing, and SDK paths in `.ororc` or CI secrets.
- Use `oroc list-devices` before `oroc install-app` on shared lab machines.
- Treat simulator convenience separately from production packaging.

## Next

- [Build and package](?p=guides/build-and-package)
- [Release packaging and signed updates](?p=guides/release-packaging-and-signed-updates)
- [`oroc setup`](?p=cli/setup) · [`oroc list-devices`](?p=cli/list-devices) · [`oroc install-app`](?p=cli/install-app)
