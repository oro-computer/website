---
layout: "docs"
description: "Development hosts, application targets, and platform-specific capability limits for Oro Runtime."
docsCollection: "runtime"
section: "guides"
order: 25
sourcePath: "guides/platform-support.md"
githubRepo: "oro-computer/runtime"
githubRef: "master"
---

# Platform support

Oro Runtime targets Linux, macOS, Windows, Android, and iOS. Native builds need
the compiler and SDKs for the selected target; API support varies by platform.

## Development hosts

| Host | Architectures | Mobile build artifacts |
| --- | --- | --- |
| Linux | x64, arm64 | Android SDK artifacts on x64 |
| macOS | x64, arm64 | iOS device and Simulator SDK artifacts |
| Windows | x64 | Desktop |

Use `oroc build --platform=android .` or `oroc build --platform=ios .` with
the appropriate host toolchain. See [mobile targets](/runtime/docs/guides/mobile-targets-and-device-installs/).

## Capability boundaries

- **TLS:** built-in providers are available on Linux (mbedTLS or OpenSSL) and
  Windows (Schannel). macOS, iOS, and Android do not ship a built-in TLS provider;
  `oro:tls` entry points return `NOT_IMPLEMENTED` without one. This is separate
  from the platform WebView's HTTPS support.
- **USB:** desktop WebUSB uses libusb. Android supports enumeration and permission
  flow, while transfer and configuration methods return `NotSupportedError`.
  iOS WebUSB is unavailable.
- **HID and Bluetooth:** Android WebHID is incomplete, and iOS/iPadOS do not expose
  a generic public HID API. Bluetooth has platform parity and validation gaps.
- **Local AI:** the embedded LLaMA server exposes compatible chat endpoints, but
  does not execute tool calls. Whisper validation on Windows and mobile is incomplete.

Hosted CI exercises desktop hosts, Android Emulator, and iOS Simulator. Physical
USB, HID, Bluetooth, camera, and microphone features need device-specific validation.

Consult the upstream [capability and validation notes](https://github.com/oro-computer/runtime/blob/master/docs/LIMITATIONS.md)
when choosing a platform-dependent API.
