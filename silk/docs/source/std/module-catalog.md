# `std::` Module Catalog

This page is the canonical inventory of shipped modules under `std/`.

Use it to answer two questions quickly:

1. Does a given `std::...` module exist in the shipped tree?
2. Which `docs/std/*.md` page is the canonical documentation surface for it?

Every shipped `std/**` Silk module is expected to have an exact canonical doc
page under `docs/std/`.

Naming rule:

- `std/foo.slk` -> `docs/std/foo.md`
- `std/foo/bar.slk` -> `docs/std/foo-bar.md`
- `std/runtime/posix/io.slk` -> [runtime posix io](?p=std/runtime-posix-io)

Owning family docs still exist for cross-module design/context, but they do not
replace the exact per-module page.

## Top-Level Public Modules

Every shipped top-level `std/*.slk` module has an exact-name canonical doc
page:

- `std::abort_controller` -> [abort controller](?p=std/abort_controller)
- `std::algorithms` -> [algorithms](?p=std/algorithms)
- `std::args` -> [args](?p=std/args)
- `std::atomic` -> [atomic](?p=std/atomic)
- `std::arrays` -> [arrays](?p=std/arrays)
- `std::bits` -> [bits](?p=std/bits)
- `std::boolean` -> [boolean](?p=std/boolean)
- `std::bytes` -> [bytes](?p=std/bytes)
- `std::buffer` -> [buffer](?p=std/buffer)
- `std::build` -> [build](?p=std/build)
- `std::crypto` -> [crypto](?p=std/crypto)
- `std::dylib` -> [dylib](?p=std/dylib)
- `std::env` -> [env](?p=std/env)
- `std::flag` -> [flag](?p=std/flag)
- `std::fmt` -> [fmt](?p=std/fmt)
- `std::formal` -> [formal](?p=std/formal)
- `std::fs` -> [fs](?p=std/fs)
- `std::function` -> [function](?p=std/function)
- `std::ggml` -> [ggml](?p=std/ggml)
- `std::gpu` -> [gpu](?p=std/gpu)
- `std::gpu::device` -> [gpu device](?p=std/gpu-device)
- `std::gpu::isa` -> [gpu isa](?p=std/gpu-isa)
- `std::graphics` -> [graphics](?p=std/graphics)
- `std::http` -> [http](?p=std/http)
- `std::https` -> [https](?p=std/https)
- `std::image` -> [image](?p=std/image)
- `std::interfaces` -> [interfaces](?p=std/interfaces)
- `std::io` -> [io](?p=std/io)
- `std::json` -> [json](?p=std/json)
- `std::limits` -> [limits](?p=std/limits)
- `std::list` -> [list](?p=std/list)
- `std::map` -> [map](?p=std/map)
- `std::math` -> [math](?p=std/math)
- `std::memory` -> [memory](?p=std/memory)
- `std::mime` -> [mime](?p=std/mime)
- `std::net` -> [net](?p=std/net)
- `std::number` -> [number](?p=std/number)
- `std::optional` -> [optional](?p=std/optional)
- `std::os` -> [os](?p=std/os)
- `std::path` -> [path](?p=std/path)
- `std::process` -> [process](?p=std/process)
- `std::protobuf` -> [protobuf](?p=std/protobuf)
- `std::queue` -> [queue](?p=std/queue)
- `std::range` -> [range](?p=std/range)
- `std::readline` -> [readline](?p=std/readline)
- `std::regex` -> [regex](?p=std/regex)
- `std::result` -> [result](?p=std/result)
- `std::semver` -> [semver](?p=std/semver)
- `std::set` -> [set](?p=std/set)
- `std::signal` -> [signal](?p=std/signal)
- `std::sqlite` -> [sqlite](?p=std/sqlite)
- `std::ssh` -> [ssh](?p=std/ssh)
- `std::ssh2` -> [ssh2](?p=std/ssh2)
- `std::stack` -> [stack](?p=std/stack)
- `std::stream` -> [stream](?p=std/stream)
- `std::strings` -> [strings](?p=std/strings)
- `std::sync` -> [sync](?p=std/sync)
- `std::tar` -> [tar](?p=std/tar)
- `std::task` -> [task](?p=std/task)
- `std::temporal` -> [temporal](?p=std/temporal)
- `std::test` -> [test](?p=std/test)
- `std::time` -> [time](?p=std/time)
- `std::tls` -> [tls](?p=std/tls)
- `std::toml` -> [toml](?p=std/toml)
- `std::unicode` -> [unicode](?p=std/unicode)
- `std::url` -> [url](?p=std/url)
- `std::uuid` -> [uuid](?p=std/uuid)
- `std::vector` -> [vector](?p=std/vector)
- `std::wasm` -> [wasm](?p=std/wasm)
- `std::websocket` -> [websocket](?p=std/websocket)
- `std::window` -> [window](?p=std/window)
- `std::xml` -> [xml](?p=std/xml)

## Nested Public Submodules

These modules are part of the shipped `std/` source tree and each also has an
exact canonical page:

- `std::crypto::aead` -> [crypto aead](?p=std/crypto-aead), [crypto](?p=std/crypto)
- `std::crypto::box` -> [crypto box](?p=std/crypto-box), [crypto](?p=std/crypto)
- `std::crypto::hash` -> [crypto hash](?p=std/crypto-hash), [crypto](?p=std/crypto)
- `std::crypto::random` -> [crypto random](?p=std/crypto-random), [crypto](?p=std/crypto)
- `std::crypto::secretbox` -> [crypto secretbox](?p=std/crypto-secretbox), [crypto](?p=std/crypto)
- `std::crypto::sign` -> [crypto sign](?p=std/crypto-sign), [crypto](?p=std/crypto)
- `std::ffi::c` -> [ffi c](?p=std/ffi-c)
- `std::ffi::c_owned` -> [ffi c owned](?p=std/ffi-c_owned), [ffi c](?p=std/ffi-c)
- `std::fs::stream` -> [fs stream](?p=std/fs-stream), [fs](?p=std/fs)
- `std::graphics::opengl` -> [graphics opengl](?p=std/graphics-opengl), [graphics](?p=std/graphics)
- `std::graphics::opengles` -> [graphics opengles](?p=std/graphics-opengles), [graphics](?p=std/graphics)
- `std::graphics::metal` -> [graphics metal](?p=std/graphics-metal), [graphics](?p=std/graphics)
- `std::graphics::window` -> [graphics window](?p=std/graphics-window), [graphics](?p=std/graphics)
- `std::graphics::vulkan` -> [graphics vulkan](?p=std/graphics-vulkan), [graphics](?p=std/graphics)
- `std::idl::web` -> [idl web](?p=std/idl-web)
- `std::image::color` -> [image color](?p=std/image-color), [image](?p=std/image)
- `std::image::jpeg` -> [image jpeg](?p=std/image-jpeg), [image](?p=std/image)
- `std::image::png` -> [image png](?p=std/image-png), [image](?p=std/image)
- `std::io::async` -> [io async](?p=std/io-async), [io](?p=std/io)
- `std::io::stream` -> [io stream](?p=std/io-stream), [io](?p=std/io)
- `std::js::ecma` -> [js ecma](?p=std/js-ecma)
- `std::math::matrix` -> [math matrix](?p=std/math-matrix), [math](?p=std/math)
- `std::math::vector` -> [math vector](?p=std/math-vector), [math](?p=std/math)
- `std::net::stream` -> [net stream](?p=std/net-stream), [net](?p=std/net)
- `std::process::child` -> [process child](?p=std/process-child), [process](?p=std/process)
- `std::tar::async` -> [tar async](?p=std/tar-async), [tar](?p=std/tar)
- `std::window::gtk` -> [window gtk](?p=std/window-gtk), [window](?p=std/window)
- `std::window::ios` -> [window ios](?p=std/window-ios), [window](?p=std/window)
- `std::window::macos` -> [window macos](?p=std/window-macos), [window](?p=std/window)
- `std::uuid::random` -> [uuid random](?p=std/uuid-random), [uuid](?p=std/uuid)

## Runtime And Platform Submodules

`std::runtime::*` and its platform-specific descendants are implementation
modules used by hosted stdlib surfaces. They still get exact canonical pages,
but those pages are implementation-facing and point back to the runtime family
docs for cross-module behavior.

Generic/runtime-family coverage:

- `std::runtime::build` -> [runtime build](?p=std/runtime-build)
- `std::runtime::atomic` -> [runtime atomic](?p=std/runtime-atomic)
- `std::runtime::dylib` -> [runtime dylib](?p=std/runtime-dylib)
- `std::runtime::env` -> [runtime env](?p=std/runtime-env)
- `std::runtime::event_loop` -> [runtime event loop](?p=std/runtime-event_loop)
- `std::runtime::fs` -> [runtime fs](?p=std/runtime-fs)
- `std::runtime::globals` -> [runtime globals](?p=std/runtime-globals)
- `std::runtime::gpu` -> [runtime gpu](?p=std/runtime-gpu)
- `std::runtime::graphics::metal` -> [runtime graphics metal](?p=std/runtime-graphics-metal), [graphics metal](?p=std/graphics-metal)
- `std::runtime::io` -> [runtime io](?p=std/runtime-io)
- `std::runtime::mem` -> [runtime mem](?p=std/runtime-mem)
- `std::runtime::net` -> [runtime net](?p=std/runtime-net)
- `std::runtime::number` -> [runtime number](?p=std/runtime-number)
- `std::runtime::process` -> [runtime process](?p=std/runtime-process)
- `std::runtime::readline` -> [runtime readline](?p=std/runtime-readline)
- `std::runtime::regex` -> [runtime regex](?p=std/runtime-regex)
- `std::runtime::signal` -> [runtime signal](?p=std/runtime-signal)
- `std::runtime::sync` -> [runtime sync](?p=std/runtime-sync)
- `std::runtime::task` -> [runtime task](?p=std/runtime-task)
- `std::runtime::time` -> [runtime time](?p=std/runtime-time)
- `std::runtime::unicode` -> [runtime unicode](?p=std/runtime-unicode)
- `std::runtime::window` -> [runtime window](?p=std/runtime-window), [window](?p=std/window)
- `std::runtime::z3` -> [runtime z3](?p=std/runtime-z3)

Linux-specific runtime modules:

- `std::runtime::linux::event_loop` -> [runtime linux event loop](?p=std/runtime-linux-event_loop)

POSIX-specific runtime modules:

- `std::runtime::posix::env` -> [runtime posix env](?p=std/runtime-posix-env)
- `std::runtime::posix::atomic` -> [runtime posix atomic](?p=std/runtime-posix-atomic)
- `std::runtime::posix::dylib` -> [runtime posix dylib](?p=std/runtime-posix-dylib)
- `std::runtime::posix::event_loop` -> [runtime posix event loop](?p=std/runtime-posix-event_loop)
- `std::runtime::posix::fs` -> [runtime posix fs](?p=std/runtime-posix-fs)
- `std::runtime::posix::io` -> [runtime posix io](?p=std/runtime-posix-io)
- `std::runtime::posix::mem` -> [runtime posix mem](?p=std/runtime-posix-mem)
- `std::runtime::posix::net` -> [runtime posix net](?p=std/runtime-posix-net)
- `std::runtime::posix::process` -> [runtime posix process](?p=std/runtime-posix-process)
- `std::runtime::posix::signal` -> [runtime posix signal](?p=std/runtime-posix-signal)
- `std::runtime::posix::sync` -> [runtime posix sync](?p=std/runtime-posix-sync)
- `std::runtime::posix::task` -> [runtime posix task](?p=std/runtime-posix-task)
- `std::runtime::posix::time` -> [runtime posix time](?p=std/runtime-posix-time)

WASI-specific runtime modules:

- `std::runtime::wasi::cwd` -> [runtime wasi cwd](?p=std/runtime-wasi-cwd)
- `std::runtime::wasi::env` -> [runtime wasi env](?p=std/runtime-wasi-env)
- `std::runtime::wasi::event_loop` -> [runtime wasi event loop](?p=std/runtime-wasi-event_loop)
- `std::runtime::wasi::fs` -> [runtime wasi fs](?p=std/runtime-wasi-fs)
- `std::runtime::wasi::io` -> [runtime wasi io](?p=std/runtime-wasi-io)
- `std::runtime::wasi::mem` -> [runtime wasi mem](?p=std/runtime-wasi-mem)
- `std::runtime::wasi::net` -> [runtime wasi net](?p=std/runtime-wasi-net)
- `std::runtime::wasi::preopen` -> [runtime wasi preopen](?p=std/runtime-wasi-preopen)
- `std::runtime::wasi::process` -> [runtime wasi process](?p=std/runtime-wasi-process)
- `std::runtime::wasi::signal` -> [runtime wasi signal](?p=std/runtime-wasi-signal)
- `std::runtime::wasi::sync` -> [runtime wasi sync](?p=std/runtime-wasi-sync)
- `std::runtime::wasi::task` -> [runtime wasi task](?p=std/runtime-wasi-task)
- `std::runtime::wasi::time` -> [runtime wasi time](?p=std/runtime-wasi-time)

## Notes

- This catalog is the audit-oriented coverage map for the entire shipped
 `std/**` tree.
- For downstream users, start with the exact-name top-level module docs first.
- For nested and runtime modules, use the exact canonical page first and then
 follow its owning-family links for broader context.
