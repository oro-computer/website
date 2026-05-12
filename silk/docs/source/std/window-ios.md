# `std::window::ios`

`std::window::ios` is the iOS-specific facade for applications that want to
select the iOS provider explicitly while still using the portable
`std::window` types.

It covers:

- `ios-aarch64` device output,
- `ios-simulator-aarch64`,
- `ios-simulator-x86_64`.

## Exported API

```silk
module std::window::ios;

import std::window;

export fn is_supported () -> bool;
export fn open (options: std::window::Options) -> std::window::WindowResult;
```

## Semantics

- `is_supported()` returns `true` only when the runtime selected
 `std::window::Backend::IOS`.
- `open(...)` delegates to `std::window::open(...)` after checking that the iOS
 provider is active.
- On non-iOS targets, `open(...)` returns `Err(UnsupportedPlatform)`.

Current provider

- The module is linkable, opts reachable `std::window` executables into the
 `UIKit` framework, and can produce a bootstrap handle on the current iOS
 device and simulator targets.
- The portable `std::window::run(...)` entrypoint enters `UIApplicationMain`,
 registers a runtime application delegate, and creates a `UIWindow` with a
 root view controller during application launch. The launch-owned path applies
 the requested title, frame size, visibility, and background color from
 `std::window::Options`; desktop chrome, positioning, size constraints, and
 always-on-top settings have no UIKit equivalent.
- The portable `std::window::run_loop(...)` API currently reports
 `ApplicationLifecycleRequired` on iOS because UIKit owns event delivery under
 `UIApplicationMain`.
- Direct portable `std::window::next_event(...)` returns
 `Err(ApplicationLifecycleRequired)` for a valid bootstrap handle because
 UIKit event delivery is owned by `UIApplicationMain`.
- Direct portable `std::window` control calls on the bootstrap handle also
 report `ApplicationLifecycleRequired`; UIKit-visible window mutation belongs
 inside lifecycle callbacks after `UIApplicationMain` has created the
 provider-owned `UIWindow`.
- CLI executable builds whose reachable module graph includes `std::window`
 automatically materialize an adjacent `<output>.app` bundle containing
 `Info.plist`, `PkgInfo`, and the executable. The bundle is generated without
 a separate CLI flag; importing/reaching `std::window` is the opt-in signal.
