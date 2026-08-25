# [`silk-codesign(1)`](?p=man/silk-codesign.1) - Sign And Verify Platform Artifacts

> NOTE: This is the Markdown source for the eventual man 1 page for
> `silk codesign`. The roff-formatted manpage should be generated from this
> content.

## Name

`silk-codesign` - sign, verify, and inspect signing tools for platform
artifacts.

## Synopsis

- `silk codesign doctor [--json]`
- `silk codesign list-tools [--json]`
- `silk codesign setup-keystore --keystore <path> --ks-key-alias <alias> [-- <keytool args...>]`
- `silk codesign sign --input <path> [--platform <auto|macos|ios|android|linux>] [--identity <id>] [--keystore <path>] [--ks-key-alias <alias>] [--tool <name>] [-- <tool args...>]`
- `silk codesign verify --input <path> [--platform <auto|macos|ios|android|linux>] [--signature <path>] [--tool <name>] [-- <tool args...>]`

## Description

`silk codesign` exposes the platform signing tools needed after `silk build`
produces a native app, package, or platform artifact. It does not replace those
tools; it detects them, selects the one appropriate for the platform/artifact,
and delegates with an explicit command shape.

Supported platform modes:

- `macos` and `ios` - `codesign`
- `android` - `apksigner` for APK signing and verification, `jarsigner` for
 JAR-signature-compatible APK/App Bundle signing and verification, and
 `keytool` for keystore creation
- `linux` - `dpkg-sig`, `rpmsign`, `rpmkeys`, `appimagetool`, or `gpg`
- `auto` - infer from the input path and current host

## Options

- `--help`, `-h` - show command help and exit.
- `--json` - emit newline-terminated, schema-versioned tool discovery data for
 `doctor` and `list-tools`.
- `--platform <platform>`, `--kind <platform>` - select `auto`, `macos`, `ios`,
 `android`, or `linux`.
- `--input`, `-i <path>` - artifact to sign or verify.
- `--tool <name>` - override Android or Linux signing/verification tool
 selection.
- `--` - pass remaining arguments to the selected signing tool.

Apple options:

- `--identity`, `-s <id>` - signing identity. The default is `-`, which requests
 ad-hoc signing from `codesign`.

Android options:

- `--keystore`, `--ks <path>` - keystore path for `apksigner`, `jarsigner`,
 and `keytool`.
- `--ks-key-alias <alias>`, `--alias <alias>` - key alias.

Linux/OpenPGP options:

- `--role <name>` - `dpkg-sig` signing role. Default: `builder`.
- `--signature <path>` - detached signature path for verification.
- `--armor` - ask `gpg` to create ASCII-armored signatures.
- `--detached` - ask `gpg` to create detached signatures.

## Tool Selection

When `--platform auto` is selected:

- `.apk` and `.aab` select Android.
- `.deb`, `.rpm`, and `.AppImage` select Linux.
- `.ipa` selects iOS.
- `.app`, `.dylib`, and `.framework` select Apple signing on macOS hosts.
- Other inputs select the current host family where possible.

Android signing selection:

- `.apk` -> `apksigner` by default.
- `.aab` -> `jarsigner` by default.
- `--tool apksigner` or `--tool jarsigner` selects either backend explicitly.
- `jarsigner` signing requires `--ks-key-alias <alias>` and accepts
 `--keystore <path>` when the key is not in the default Java keystore.

Linux signing selection:

- `.deb` -> `dpkg-sig`
- `.rpm` signing -> `rpmsign`
- `.rpm` verification -> `rpmkeys`
- `.AppImage` signing -> `appimagetool`
- generic signing/verification -> `gpg`

`--tool <name>` can override Android or Linux selection when a project has a
policy-specific tool invocation.

## JSON Output

`doctor --json` and `list-tools --json` emit `schemaVersion: 1`,
`command: "codesign"`, `mode`, `host`, and `tools`.

Each tool record contains:

- `name`
- `role`
- `probe`
- `available`
- `path`

## Examples

```sh
# Inspect available signing tools.
silk codesign list-tools

# Ad-hoc sign a macOS or iOS simulator app bundle.
silk codesign sign --platform ios --input build/ios-simulator/MyApp.app

# Sign an APK with apksigner.
silk codesign sign --platform android --input app.apk --keystore release.jks --ks-key-alias release

# Sign an Android App Bundle with jarsigner.
silk codesign sign --platform android --tool jarsigner --input app.aab --keystore release.jks --ks-key-alias release

# Create a Java keystore before signing Android artifacts.
silk codesign setup-keystore --keystore release.jks --ks-key-alias release

# Sign a Debian package with an explicit dpkg-sig role.
silk codesign sign --platform linux --input app.deb --role maint
```

## Exit Status

- `0` on success.
- non-zero when arguments are invalid, a required signing tool is unavailable,
 or the delegated tool exits non-zero.

## See Also

- [`silk(1)`](?p=man/silk.1), [`silk-build(1)`](?p=man/silk-build.1), [`silk-devices(1)`](?p=man/silk-devices.1)
- [cli silk](?p=compiler/cli-silk)
