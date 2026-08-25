# Build LumenTrail, an iOS Objective-C App With Silk Stdlib Code

This how-to uses `examples/projects/lumen-trail/` to show the current iOS
embedding flow on Apple Silicon macOS through the `LumenTrail` simulator app:

1. Build Silk stdlib-backed model code.
2. Compile Objective-C/UIKit sources declared in `silk.toml`.
3. Link the app executable for `ios-simulator-aarch64`.
4. Materialize and ad-hoc sign a simulator `.app` bundle.

The app lets you adjust focus minutes, streak length, hydration, and day mode.
Silk owns the scoring/planning model and stdlib-backed helpers; Objective-C
owns the app lifecycle, UIKit controls, view drawing, and simulator
installation. All app sources live under `src/` inside the example directory.

## Build The Simulator App

From `examples/projects/lumen-trail/`:

```sh
../../../zig-out/bin/silk build \
  --strip-unused \
  --package . \
  --package-target ios_simulator_app
```

The package target declares its Objective-C source inputs, UIKit/CoreGraphics/
Foundation link flags, app `Info.plist`, and iOS bundle signing policy in
`silk.toml`. `silk build` produces:

- `build/ios-simulator/LumenTrail`
- `build/ios-simulator/LumenTrail.app`

The `.app` directory is a normal runnable simulator bundle containing the app
executable, `Info.plist`, `PkgInfo`, and code signature.

The Silk model imports public stdlib modules:

- `std::algorithms` for score normalization,
- Silk string equality for incoming mode strings and plan selection,
- built-in target metadata for platform/architecture strings,
- `std::runtime::build` for build kind/mode metadata.

The helper script is now only a convenience wrapper around the package target:

```sh
sh scripts/simulator-app.sh
```

Set `SILK_IOS_RUN=1` to install and launch on an already booted simulator after
the build:

```sh
SILK_IOS_RUN=1 sh scripts/simulator-app.sh
```

Or install and launch manually:

```sh
xcrun simctl install booted build/ios-simulator/LumenTrail.app
xcrun simctl launch booted computer.oro.silk.examples.lumentrail
```

## Build The Silk Library And Generated Header

For an Xcode-owned app target, build the Silk model directly as an unnamed root
source so `--c-header` can emit the C ABI header:

```sh
../../../zig-out/bin/silk build \
  --strip-unused \
  src/app_model.slk \
  --target ios-simulator-aarch64 \
  --kind static \
  --c-header build/SilkAppModel.h \
  -o build/libsilk_app_model.a
```

This emits:

- `build/libsilk_app_model.a`
- `build/SilkAppModel.h`

The one-command app target keeps a matching bridge header in
`src/SilkAppModel.h` so Objective-C inputs can compile directly during
`silk build --package`, where the Silk package name is part of the emitted
symbol names. The Silk model uses `export attr(abi=c) fn` for its Objective-C
entry points, and the bridge maps the friendly Objective-C call names to
`SILK_C_ABI_EXPORT_FN(lumen_trail, name)` from `silk/silk.h`.

## Use The Same Pattern In Xcode

For an Xcode-owned app target:

- build the Silk library with `--target ios-simulator-aarch64` for simulator
 runs or `--target ios-aarch64` for device builds,
- add the generated `build/SilkAppModel.h` and `../../../include/` to the app
 target's header search paths,
- add the Silk archive built for the same destination to the app target's
 linked libraries, such as `build/libsilk_app_model.a` for the simulator
 command above or a separate device archive built with `--target ios-aarch64`,
- call the generated C functions from Objective-C, using `SilkString { ptr,
 len }` for Silk `string` arguments.

Device signing, entitlements, provisioning profiles, and deployment selection
should remain in Xcode. The Silk artifact is an ordinary static library input
from the app target's perspective.
