---
layout: "docs"
description: "Build Field Notes for Android and iOS, test local drafts, add native sharing, and install on devices."
docsCollection: "runtime"
section: "guides"
order: 19
sourcePath: "guides/mobile-targets-and-device-installs.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Build a mobile app

Take [Field Notes](/runtime/learn/getting-started/) or the [React version](/runtime/docs/guides/frontend-build-pipeline/) to Android and iOS. Keep the editor, local draft storage, and web assets; choose a mobile build target and add device capabilities where they help.

**Before you start:** build and run one of those examples on desktop. Run the commands below from its project root. Android needs the Android SDK/NDK, JDK, and an emulator or a device with USB debugging enabled. iOS needs macOS, Xcode, and the selected Simulator runtime; a physical device also needs signing and provisioning. See the [host and artifact matrix](/runtime/docs/guides/platform-support/).

## Make the editor fit a phone

Use this viewport declaration in the app’s HTML:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

The [React example’s CSS](/runtime/docs/guides/frontend-build-pipeline/#srcstylescss) already gives controls a 44px minimum height, keeps text at a readable size, wraps long notes, and pads around safe areas. Apply the same rules to a plain HTML app. Keep zoom enabled and test with the software keyboard open.

`localStorage` needs no import and keeps the draft in the app’s WebView storage. Reinstalling or clearing the app’s data can remove it. For multiple notes, use [SQLite in the writable app-data directory](/runtime/docs/guides/local-data-with-sqlite/).

## Build and run on Android

Install the target tools and inspect devices:

```bash
oroc setup --platform=android
oroc list-devices --platform=android
```

Start an Android virtual device in the SDK’s device manager, then build and launch:

```bash
oroc build --platform=android-emulator --allow-exec --run .
```

**Expected result:** the Field Notes app opens in the emulator. Type a note, save it, terminate the app, and relaunch it. The note should return without a network connection because the web assets ship in the bundle.

For a connected physical Android device, build and install the debug artifact explicitly:

```bash
oroc build --platform=android --allow-exec .
oroc install-app --platform=android --device emulator-5554
```

Replace `emulator-5554` with the exact identifier from `list-devices` for your device, then open the app from its launcher. Keep build and install in the same mode; use `--prod` on both for a production-mode build. Development installation does not produce a store release.

## Build and run in iOS Simulator

On macOS:

```bash
oroc setup --platform=ios
oroc list-devices --platform=ios
```

Set a Simulator device type installed in your Xcode version. In the project-local `.ororc`, use `settings.*` sections to override project configuration:

```ini
[settings.ios]
simulator_device = "iPhone 15"
```

`iPhone 15` is an example; choose an installed device type. Inspect available types with `xcrun simctl list devicetypes`. Add `.ororc` to `.gitignore` to keep machine-specific settings local.

```bash
oroc build --platform=ios-simulator --allow-exec --run .
```

**Expected result:** Simulator opens Field Notes. Save and relaunch to check persistence; rotate the device and open the keyboard to check layout. After rebuilding, use `oroc run --platform=ios-simulator .` to launch that existing build again.

## Install on an iPhone or iPad

Use a bundle identifier you control in `[meta] bundle_identifier`. Its signing profile must include the app identifier and the test device. In `.ororc`, configure your actual profile and identity:

```ini
[settings.ios]
provisioning_profile = "/absolute/path/to/FieldNotes.mobileprovision"
codesign_identity = "Apple Development: Your Name (TEAMID)"
```

The CLI reads the team identifier from the provisioning profile. Then build a signed device artifact:

```bash
oroc build --platform=ios --allow-exec --codesign .
oroc list-devices --platform=ios
oroc install-app --platform=ios --device YOUR_DEVICE_ECID
```

Replace `YOUR_DEVICE_ECID` with the physical device’s identifier. The iOS installer uses Apple’s `cfgutil` to install the generated IPA on a connected device; make `cfgutil` available through Apple Configurator’s automation tools. It does not install a Simulator `.app`; use the Simulator build/run flow above for that.

## Add native sharing to the React editor

Inside `FieldNotes`, add this handler:

```jsx
async function shareDraft() {
  if (!draft.trim()) {
    setStatus('Write a note before sharing.')
    return
  }
  if (typeof navigator.share !== 'function') {
    setStatus('Sharing is unavailable. You can still save your draft.')
    return
  }
  try {
    await navigator.share({ title: 'Field Notes', text: draft })
    setStatus('Shared your draft.')
  } catch (error) {
    setStatus(error.name === 'AbortError'
      ? 'Sharing cancelled; your draft is unchanged.'
      : `Could not share: ${error.message}`)
  }
}
```

Add this button after the existing Save button inside the form:

```jsx
<button type="button" onClick={shareDraft}>Share draft</button>
```

`navigator.share` is a web API; it needs no import. Invoke it from the user’s tap. Handle an absent API, cancellation, and native failures. Runtime provides a mobile sharing bridge; desktop support depends on the platform. Rebuild, tap Share, choose a destination, and try cancelling.

For a location-aware note, `navigator.geolocation.getCurrentPosition` is also available without an import. Enable only the permissions you use, handle denial in the UI, and test on physical hardware. See [web APIs and capability boundaries](/runtime/docs/guides/web-platform-apis/) and [permissions configuration](/runtime/docs/config/reference/#permissions).

## Verify before distributing

Check saved drafts across a force quit, airplane mode, portrait and landscape, keyboard display, and denied permissions. Test sharing and sensors on a real device as well as a simulator. Use the same built assets on each target; keep platform signing and packaging settings in their platform sections.

For distribution, follow [build and package](/runtime/docs/guides/build-and-package/) and [release packaging](/runtime/docs/guides/release-packaging-and-signed-updates/). A production build disables development features; store signing, entitlements, icons, and submission are additional release steps.
