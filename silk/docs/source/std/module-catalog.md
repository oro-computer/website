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
- `std::arrays` -> [arrays](?p=std/arrays)
- `std::bits` -> [bits](?p=std/bits)
- `std::boolean` -> [boolean](?p=std/boolean)
- `std::buffer` -> [buffer](?p=std/buffer)
- `std::build` -> [build](?p=std/build)
- `std::crypto` -> [crypto](?p=std/crypto)
- `std::env` -> [env](?p=std/env)
- `std::flag` -> [flag](?p=std/flag)
- `std::fmt` -> [fmt](?p=std/fmt)
- `std::formal` -> [formal](?p=std/formal)
- `std::fs` -> [fs](?p=std/fs)
- `std::function` -> [function](?p=std/function)
- `std::ggml` -> [ggml](?p=std/ggml)
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
- `std::net` -> [net](?p=std/net)
- `std::number` -> [number](?p=std/number)
- `std::optional` -> [optional](?p=std/optional)
- `std::os` -> [os](?p=std/os)
- `std::path` -> [path](?p=std/path)
- `std::process` -> [process](?p=std/process)
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
- `std::tls` -> [tls](?p=std/tls)
- `std::toml` -> [toml](?p=std/toml)
- `std::unicode` -> [unicode](?p=std/unicode)
- `std::url` -> [url](?p=std/url)
- `std::uuid` -> [uuid](?p=std/uuid)
- `std::vector` -> [vector](?p=std/vector)
- `std::wasm` -> [wasm](?p=std/wasm)
- `std::websocket` -> [websocket](?p=std/websocket)
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
- `std::uuid::random` -> [uuid random](?p=std/uuid-random), [uuid](?p=std/uuid)

## Runtime And Platform Submodules

`std::runtime::*` and its platform-specific descendants are implementation
modules used by hosted stdlib surfaces. They still get exact canonical pages,
but those pages are implementation-facing and point back to the runtime family
docs for cross-module behavior.

Generic/runtime-family coverage:

- `std::runtime::build` -> [runtime](?p=std/runtime)
- `std::runtime::env` -> [runtime](?p=std/runtime)
- `std::runtime::event_loop` -> [runtime](?p=std/runtime)
- `std::runtime::fs` -> [runtime](?p=std/runtime)
- `std::runtime::globals` -> [runtime](?p=std/runtime)
- `std::runtime::io` -> [runtime](?p=std/runtime)
- `std::runtime::mem` -> [runtime](?p=std/runtime)
- `std::runtime::net` -> [runtime](?p=std/runtime)
- `std::runtime::number` -> [runtime](?p=std/runtime), [number](?p=std/number)
- `std::runtime::process` -> [runtime](?p=std/runtime)
- `std::runtime::readline` -> [runtime](?p=std/runtime), [readline](?p=std/readline)
- `std::runtime::regex` -> [runtime](?p=std/runtime), [regex](?p=std/regex)
- `std::runtime::signal` -> [runtime](?p=std/runtime)
- `std::runtime::sync` -> [runtime](?p=std/runtime)
- `std::runtime::task` -> [runtime](?p=std/runtime), [task](?p=std/task)
- `std::runtime::time` -> [runtime](?p=std/runtime), [temporal](?p=std/temporal)
- `std::runtime::unicode` -> [runtime](?p=std/runtime), [unicode](?p=std/unicode)
- `std::runtime::z3` -> [z3](?p=std/z3)

Linux-specific runtime modules:

- `std::runtime::linux::event_loop` -> [runtime](?p=std/runtime)

POSIX-specific runtime modules:

- `std::runtime::posix::env` -> [runtime](?p=std/runtime)
- `std::runtime::posix::event_loop` -> [runtime](?p=std/runtime)
- `std::runtime::posix::fs` -> [runtime](?p=std/runtime)
- `std::runtime::posix::io` -> [runtime](?p=std/runtime)
- `std::runtime::posix::mem` -> [runtime](?p=std/runtime)
- `std::runtime::posix::net` -> [runtime](?p=std/runtime)
- `std::runtime::posix::process` -> [runtime](?p=std/runtime)
- `std::runtime::posix::signal` -> [runtime](?p=std/runtime)
- `std::runtime::posix::sync` -> [runtime](?p=std/runtime)
- `std::runtime::posix::task` -> [runtime](?p=std/runtime)
- `std::runtime::posix::time` -> [runtime](?p=std/runtime)

WASI-specific runtime modules:

- `std::runtime::wasi::cwd` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::env` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::event_loop` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::fs` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::io` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::mem` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::net` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::preopen` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::process` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::signal` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::sync` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::task` -> [runtime](?p=std/runtime)
- `std::runtime::wasi::time` -> [runtime](?p=std/runtime)

## Notes

- This catalog is the audit-oriented coverage map for the entire shipped
 `std/**` tree.
- For downstream users, start with the exact-name top-level module docs first.
- For nested and runtime modules, use the exact canonical page first and then
 follow its owning-family links for broader context.
