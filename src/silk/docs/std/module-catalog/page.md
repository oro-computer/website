---
layout: "docs"
title: "std:: Module Catalog"
description: "This page is the canonical inventory of shipped modules under std/."
docsCollection: "silk"
section: "std"
order: 152
sourcePath: "std/module-catalog.md"
githubRepo: "oro-computer/silk"
githubRef: "master"
---

# `std::` Module Catalog

This page is the canonical inventory of shipped modules under [`std/`](https://github.com/oro-computer/silk/tree/master/std/).

Use it to answer two questions quickly:

1. Does a given `std::...` module exist in the shipped tree?
2. Which `docs/std/*.md` page is the canonical documentation surface for it?

Every shipped [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) Silk module is expected to have an exact canonical doc
page under `docs/std/`.

Naming rule:

- [`std/foo.slk`](https://github.com/oro-computer/silk/blob/master/std/foo.slk) -> `docs/std/foo.md`
- [`std/foo/bar.slk`](https://github.com/oro-computer/silk/blob/master/std/foo/bar.slk) -> `docs/std/foo-bar.md`
- [`std/runtime/posix/io.slk`](https://github.com/oro-computer/silk/blob/master/std/runtime/posix/io.slk) -> [runtime posix io](/silk/docs/std/runtime-posix-io/)

Owning family docs still exist for cross-module design/context, but they do not
replace the exact per-module page.

## Top-Level Public Modules

Every shipped top-level [`std/*.slk`](https://github.com/oro-computer/silk/blob/master/std/*.slk) module has an exact-name canonical doc
page:

- [`std::abort_controller`](/silk/docs/std/abort_controller/) -> [abort controller](/silk/docs/std/abort_controller/)
- [`std::algorithms`](/silk/docs/std/algorithms/) -> [algorithms](/silk/docs/std/algorithms/)
- [`std::args`](/silk/docs/std/args/) -> [args](/silk/docs/std/args/)
- [`std::atomic`](/silk/docs/std/atomic/) -> [atomic](/silk/docs/std/atomic/)
- [`std::arrays`](/silk/docs/std/arrays/) -> [arrays](/silk/docs/std/arrays/)
- [`std::bits`](/silk/docs/std/bits/) -> [bits](/silk/docs/std/bits/)
- [`std::boolean`](/silk/docs/std/boolean/) -> [boolean](/silk/docs/std/boolean/)
- [`std::bytes`](/silk/docs/std/bytes/) -> [bytes](/silk/docs/std/bytes/)
- [`std::buffer`](/silk/docs/std/buffer/) -> [buffer](/silk/docs/std/buffer/)
- [`std::build`](/silk/docs/std/build/) -> [build](/silk/docs/std/build/)
- [`std::crypto`](/silk/docs/std/crypto/) -> [crypto](/silk/docs/std/crypto/)
- [`std::dylib`](/silk/docs/std/dylib/) -> [dylib](/silk/docs/std/dylib/)
- [`std::env`](/silk/docs/std/env/) -> [env](/silk/docs/std/env/)
- [`std::flag`](/silk/docs/std/flag/) -> [flag](/silk/docs/std/flag/)
- [`std::fmt`](/silk/docs/std/fmt/) -> [fmt](/silk/docs/std/fmt/)
- [`std::formal`](/silk/docs/std/formal/) -> [formal](/silk/docs/std/formal/)
- [`std::fs`](/silk/docs/std/fs/) -> [fs](/silk/docs/std/fs/)
- [`std::function`](/silk/docs/std/function/) -> [function](/silk/docs/std/function/)
- [`std::ggml`](/silk/docs/std/ggml/) -> [ggml](/silk/docs/std/ggml/)
- [`std::gpu`](/silk/docs/std/gpu/) -> [gpu](/silk/docs/std/gpu/)
- [`std::gpu::device`](/silk/docs/std/gpu-device/) -> [gpu device](/silk/docs/std/gpu-device/)
- [`std::gpu::isa`](/silk/docs/std/gpu-isa/) -> [gpu isa](/silk/docs/std/gpu-isa/)
- `std::graphics` -> [graphics](/silk/docs/std/graphics/)
- [`std::http`](/silk/docs/std/http/) -> [http](/silk/docs/std/http/)
- [`std::https`](/silk/docs/std/https/) -> [https](/silk/docs/std/https/)
- `std::image` -> [image](/silk/docs/std/image/)
- [`std::interfaces`](/silk/docs/std/interfaces/) -> [interfaces](/silk/docs/std/interfaces/)
- [`std::io`](/silk/docs/std/io/) -> [io](/silk/docs/std/io/)
- [`std::json`](/silk/docs/std/json/) -> [json](/silk/docs/std/json/)
- [`std::limits`](/silk/docs/std/limits/) -> [limits](/silk/docs/std/limits/)
- [`std::list`](/silk/docs/std/list/) -> [list](/silk/docs/std/list/)
- [`std::map`](/silk/wiki/std/map/) -> [map](/silk/docs/std/map/)
- [`std::math`](/silk/docs/std/math/) -> [math](/silk/docs/std/math/)
- [`std::memory`](/silk/docs/std/memory/) -> [memory](/silk/docs/std/memory/)
- [`std::mime`](/silk/docs/std/mime/) -> [mime](/silk/docs/std/mime/)
- [`std::net`](/silk/docs/std/networking/) -> [net](/silk/docs/std/net/)
- [`std::number`](/silk/docs/std/number/) -> [number](/silk/docs/std/number/)
- [`std::optional`](/silk/docs/std/optional/) -> [optional](/silk/docs/std/optional/)
- [`std::os`](/silk/docs/std/os/) -> [os](/silk/docs/std/os/)
- [`std::path`](/silk/docs/std/path/) -> [path](/silk/docs/std/path/)
- [`std::process`](/silk/docs/std/process/) -> [process](/silk/docs/std/process/)
- [`std::protobuf`](/silk/docs/std/protobuf/) -> [protobuf](/silk/docs/std/protobuf/)
- [`std::queue`](/silk/docs/std/queue/) -> [queue](/silk/docs/std/queue/)
- [`std::range`](/silk/docs/std/range/) -> [range](/silk/docs/std/range/)
- [`std::readline`](/silk/docs/std/readline/) -> [readline](/silk/docs/std/readline/)
- [`std::regex`](/silk/docs/std/regex/) -> [regex](/silk/docs/std/regex/)
- [`std::result`](/silk/docs/std/result/) -> [result](/silk/docs/std/result/)
- [`std::semver`](/silk/docs/std/semver/) -> [semver](/silk/docs/std/semver/)
- [`std::set`](/silk/wiki/std/set/) -> [set](/silk/docs/std/set/)
- [`std::signal`](/silk/docs/std/signal/) -> [signal](/silk/docs/std/signal/)
- [`std::sqlite`](/silk/docs/std/sqlite/) -> [sqlite](/silk/docs/std/sqlite/)
- [`std::ssh`](/silk/docs/std/ssh/) -> [ssh](/silk/docs/std/ssh/)
- [`std::ssh2`](/silk/docs/std/ssh2/) -> [ssh2](/silk/docs/std/ssh2/)
- [`std::stack`](/silk/docs/std/stack/) -> [stack](/silk/docs/std/stack/)
- [`std::stream`](/silk/docs/std/stream/) -> [stream](/silk/docs/std/stream/)
- [`std::strings`](/silk/docs/std/strings/) -> [strings](/silk/docs/std/strings/)
- [`std::sync`](/silk/docs/std/sync/) -> [sync](/silk/docs/std/sync/)
- [`std::tar`](/silk/docs/std/tar/) -> [tar](/silk/docs/std/tar/)
- [`std::task`](/silk/docs/std/task/) -> [task](/silk/docs/std/task/)
- [`std::temporal`](/silk/docs/std/temporal/) -> [temporal](/silk/docs/std/temporal/)
- [`std::test`](/silk/docs/std/test/) -> [test](/silk/docs/std/test/)
- [`std::time`](/silk/docs/std/time/) -> [time](/silk/docs/std/time/)
- [`std::tls`](/silk/docs/std/tls/) -> [tls](/silk/docs/std/tls/)
- [`std::toml`](/silk/docs/std/toml/) -> [toml](/silk/docs/std/toml/)
- [`std::unicode`](/silk/docs/std/unicode/) -> [unicode](/silk/docs/std/unicode/)
- [`std::url`](/silk/docs/std/url/) -> [url](/silk/docs/std/url/)
- [`std::uuid`](/silk/docs/std/uuid/) -> [uuid](/silk/docs/std/uuid/)
- [`std::vector`](/silk/docs/std/vector/) -> [vector](/silk/docs/std/vector/)
- `std::wasm` -> [wasm](/silk/docs/std/wasm/)
- [`std::websocket`](/silk/docs/std/websocket/) -> [websocket](/silk/docs/std/websocket/)
- [`std::window`](/silk/docs/std/window/) -> [window](/silk/docs/std/window/)
- `std::xml` -> [xml](/silk/docs/std/xml/)

## Nested Public Submodules

These modules are part of the shipped [`std/`](https://github.com/oro-computer/silk/tree/master/std/) source tree and each also has an
exact canonical page:

- [`std::crypto::aead`](/silk/docs/std/crypto-aead/) -> [crypto aead](/silk/docs/std/crypto-aead/), [crypto](/silk/docs/std/crypto/)
- [`std::crypto::box`](/silk/docs/std/crypto-box/) -> [crypto box](/silk/docs/std/crypto-box/), [crypto](/silk/docs/std/crypto/)
- [`std::crypto::hash`](/silk/docs/std/crypto-hash/) -> [crypto hash](/silk/docs/std/crypto-hash/), [crypto](/silk/docs/std/crypto/)
- [`std::crypto::random`](/silk/docs/std/crypto-random/) -> [crypto random](/silk/docs/std/crypto-random/), [crypto](/silk/docs/std/crypto/)
- [`std::crypto::secretbox`](/silk/docs/std/crypto-secretbox/) -> [crypto secretbox](/silk/docs/std/crypto-secretbox/), [crypto](/silk/docs/std/crypto/)
- [`std::crypto::sign`](/silk/docs/std/crypto-sign/) -> [crypto sign](/silk/docs/std/crypto-sign/), [crypto](/silk/docs/std/crypto/)
- `std::ffi::c` -> [ffi c](/silk/docs/std/ffi-c/)
- [`std::ffi::c_owned`](/silk/docs/std/ffi-c_owned/) -> [ffi c owned](/silk/docs/std/ffi-c_owned/), [ffi c](/silk/docs/std/ffi-c/)
- [`std::fs::stream`](/silk/docs/std/fs-stream/) -> [fs stream](/silk/docs/std/fs-stream/), [fs](/silk/docs/std/fs/)
- [`std::graphics::opengl`](/silk/docs/std/graphics-opengl/) -> [graphics opengl](/silk/docs/std/graphics-opengl/), [graphics](/silk/docs/std/graphics/)
- [`std::graphics::opengles`](/silk/docs/std/graphics-opengles/) -> [graphics opengles](/silk/docs/std/graphics-opengles/), [graphics](/silk/docs/std/graphics/)
- [`std::graphics::metal`](/silk/docs/std/graphics-metal/) -> [graphics metal](/silk/docs/std/graphics-metal/), [graphics](/silk/docs/std/graphics/)
- [`std::graphics::window`](/silk/docs/std/graphics-window/) -> [graphics window](/silk/docs/std/graphics-window/), [graphics](/silk/docs/std/graphics/)
- [`std::graphics::vulkan`](/silk/docs/std/graphics-vulkan/) -> [graphics vulkan](/silk/docs/std/graphics-vulkan/), [graphics](/silk/docs/std/graphics/)
- `std::idl::web` -> [idl web](/silk/docs/std/idl-web/)
- [`std::image::color`](/silk/docs/std/image-color/) -> [image color](/silk/docs/std/image-color/), [image](/silk/docs/std/image/)
- [`std::image::jpeg`](/silk/docs/std/image-jpeg/) -> [image jpeg](/silk/docs/std/image-jpeg/), [image](/silk/docs/std/image/)
- [`std::image::png`](/silk/docs/std/image-png/) -> [image png](/silk/docs/std/image-png/), [image](/silk/docs/std/image/)
- [`std::io::async`](/silk/docs/std/io-async/) -> [io async](/silk/docs/std/io-async/), [io](/silk/docs/std/io/)
- [`std::io::stream`](/silk/docs/std/io-stream/) -> [io stream](/silk/docs/std/io-stream/), [io](/silk/docs/std/io/)
- `std::js::ecma` -> [js ecma](/silk/docs/std/js-ecma/)
- [`std::math::matrix`](/silk/docs/std/math-matrix/) -> [math matrix](/silk/docs/std/math-matrix/), [math](/silk/docs/std/math/)
- [`std::math::vector`](/silk/docs/std/math-vector/) -> [math vector](/silk/docs/std/math-vector/), [math](/silk/docs/std/math/)
- [`std::net::stream`](/silk/docs/std/net-stream/) -> [net stream](/silk/docs/std/net-stream/), [net](/silk/docs/std/net/)
- [`std::process::child`](/silk/docs/std/process-child/) -> [process child](/silk/docs/std/process-child/), [process](/silk/docs/std/process/)
- [`std::tar::async`](/silk/docs/std/tar-async/) -> [tar async](/silk/docs/std/tar-async/), [tar](/silk/docs/std/tar/)
- [`std::window::gtk`](/silk/docs/std/window-gtk/) -> [window gtk](/silk/docs/std/window-gtk/), [window](/silk/docs/std/window/)
- [`std::window::ios`](/silk/docs/std/window-ios/) -> [window ios](/silk/docs/std/window-ios/), [window](/silk/docs/std/window/)
- [`std::window::macos`](/silk/docs/std/window-macos/) -> [window macos](/silk/docs/std/window-macos/), [window](/silk/docs/std/window/)
- [`std::uuid::random`](/silk/docs/std/uuid-random/) -> [uuid random](/silk/docs/std/uuid-random/), [uuid](/silk/docs/std/uuid/)

## Runtime And Platform Submodules

[`std::runtime::*`](/silk/docs/std/runtime/) and its platform-specific descendants are implementation
modules used by hosted stdlib surfaces. They still get exact canonical pages,
but those pages are implementation-facing and point back to the runtime family
docs for cross-module behavior.

Generic/runtime-family coverage:

- [`std::runtime::build`](/silk/docs/std/runtime-build/) -> [runtime build](/silk/docs/std/runtime-build/)
- [`std::runtime::atomic`](/silk/docs/std/runtime-atomic/) -> [runtime atomic](/silk/docs/std/runtime-atomic/)
- [`std::runtime::dylib`](/silk/docs/std/runtime-dylib/) -> [runtime dylib](/silk/docs/std/runtime-dylib/)
- [`std::runtime::env`](/silk/docs/std/runtime-env/) -> [runtime env](/silk/docs/std/runtime-env/)
- [`std::runtime::event_loop`](/silk/docs/std/runtime-event_loop/) -> [runtime event loop](/silk/docs/std/runtime-event_loop/)
- [`std::runtime::fs`](/silk/docs/std/runtime-fs/) -> [runtime fs](/silk/docs/std/runtime-fs/)
- [`std::runtime::globals`](/silk/docs/std/runtime-globals/) -> [runtime globals](/silk/docs/std/runtime-globals/)
- [`std::runtime::gpu`](/silk/docs/std/runtime-gpu/) -> [runtime gpu](/silk/docs/std/runtime-gpu/)
- [`std::runtime::graphics::metal`](/silk/docs/std/runtime-graphics-metal/) -> [runtime graphics metal](/silk/docs/std/runtime-graphics-metal/), [graphics metal](/silk/docs/std/graphics-metal/)
- [`std::runtime::io`](/silk/docs/std/runtime-io/) -> [runtime io](/silk/docs/std/runtime-io/)
- [`std::runtime::mem`](/silk/docs/std/runtime-mem/) -> [runtime mem](/silk/docs/std/runtime-mem/)
- [`std::runtime::net`](/silk/docs/std/runtime-net/) -> [runtime net](/silk/docs/std/runtime-net/)
- [`std::runtime::number`](/silk/docs/std/runtime-number/) -> [runtime number](/silk/docs/std/runtime-number/)
- [`std::runtime::process`](/silk/docs/std/runtime-process/) -> [runtime process](/silk/docs/std/runtime-process/)
- [`std::runtime::readline`](/silk/docs/std/runtime-readline/) -> [runtime readline](/silk/docs/std/runtime-readline/)
- [`std::runtime::regex`](/silk/docs/std/runtime-regex/) -> [runtime regex](/silk/docs/std/runtime-regex/)
- [`std::runtime::signal`](/silk/docs/std/runtime-signal/) -> [runtime signal](/silk/docs/std/runtime-signal/)
- [`std::runtime::sync`](/silk/docs/std/runtime-sync/) -> [runtime sync](/silk/docs/std/runtime-sync/)
- [`std::runtime::task`](/silk/docs/std/runtime-task/) -> [runtime task](/silk/docs/std/runtime-task/)
- [`std::runtime::time`](/silk/docs/std/runtime-time/) -> [runtime time](/silk/docs/std/runtime-time/)
- [`std::runtime::unicode`](/silk/docs/std/runtime-unicode/) -> [runtime unicode](/silk/docs/std/runtime-unicode/)
- [`std::runtime::window`](/silk/docs/std/runtime-window/) -> [runtime window](/silk/docs/std/runtime-window/), [window](/silk/docs/std/window/)
- [`std::runtime::z3`](/silk/docs/std/runtime-z3/) -> [runtime z3](/silk/docs/std/runtime-z3/)

Linux-specific runtime modules:

- [`std::runtime::linux::event_loop`](/silk/docs/std/runtime-linux-event_loop/) -> [runtime linux event loop](/silk/docs/std/runtime-linux-event_loop/)

POSIX-specific runtime modules:

- [`std::runtime::posix::env`](/silk/docs/std/runtime-posix-env/) -> [runtime posix env](/silk/docs/std/runtime-posix-env/)
- [`std::runtime::posix::atomic`](/silk/docs/std/runtime-posix-atomic/) -> [runtime posix atomic](/silk/docs/std/runtime-posix-atomic/)
- [`std::runtime::posix::dylib`](/silk/docs/std/runtime-posix-dylib/) -> [runtime posix dylib](/silk/docs/std/runtime-posix-dylib/)
- [`std::runtime::posix::event_loop`](/silk/docs/std/runtime-posix-event_loop/) -> [runtime posix event loop](/silk/docs/std/runtime-posix-event_loop/)
- [`std::runtime::posix::fs`](/silk/docs/std/runtime-posix-fs/) -> [runtime posix fs](/silk/docs/std/runtime-posix-fs/)
- [`std::runtime::posix::io`](/silk/docs/std/runtime-posix-io/) -> [runtime posix io](/silk/docs/std/runtime-posix-io/)
- [`std::runtime::posix::mem`](/silk/docs/std/runtime-posix-mem/) -> [runtime posix mem](/silk/docs/std/runtime-posix-mem/)
- [`std::runtime::posix::net`](/silk/docs/std/runtime-posix-net/) -> [runtime posix net](/silk/docs/std/runtime-posix-net/)
- [`std::runtime::posix::process`](/silk/docs/std/runtime-posix-process/) -> [runtime posix process](/silk/docs/std/runtime-posix-process/)
- [`std::runtime::posix::signal`](/silk/docs/std/runtime-posix-signal/) -> [runtime posix signal](/silk/docs/std/runtime-posix-signal/)
- [`std::runtime::posix::sync`](/silk/docs/std/runtime-posix-sync/) -> [runtime posix sync](/silk/docs/std/runtime-posix-sync/)
- [`std::runtime::posix::task`](/silk/docs/std/runtime-posix-task/) -> [runtime posix task](/silk/docs/std/runtime-posix-task/)
- [`std::runtime::posix::time`](/silk/docs/std/runtime-posix-time/) -> [runtime posix time](/silk/docs/std/runtime-posix-time/)

WASI-specific runtime modules:

- [`std::runtime::wasi::cwd`](/silk/docs/std/runtime-wasi-cwd/) -> [runtime wasi cwd](/silk/docs/std/runtime-wasi-cwd/)
- [`std::runtime::wasi::env`](/silk/docs/std/runtime-wasi-env/) -> [runtime wasi env](/silk/docs/std/runtime-wasi-env/)
- [`std::runtime::wasi::event_loop`](/silk/docs/std/runtime-wasi-event_loop/) -> [runtime wasi event loop](/silk/docs/std/runtime-wasi-event_loop/)
- [`std::runtime::wasi::fs`](/silk/docs/std/runtime-wasi-fs/) -> [runtime wasi fs](/silk/docs/std/runtime-wasi-fs/)
- [`std::runtime::wasi::io`](/silk/docs/std/runtime-wasi-io/) -> [runtime wasi io](/silk/docs/std/runtime-wasi-io/)
- [`std::runtime::wasi::mem`](/silk/docs/std/runtime-wasi-mem/) -> [runtime wasi mem](/silk/docs/std/runtime-wasi-mem/)
- [`std::runtime::wasi::net`](/silk/docs/std/runtime-wasi-net/) -> [runtime wasi net](/silk/docs/std/runtime-wasi-net/)
- [`std::runtime::wasi::preopen`](/silk/docs/std/runtime-wasi-preopen/) -> [runtime wasi preopen](/silk/docs/std/runtime-wasi-preopen/)
- [`std::runtime::wasi::process`](/silk/docs/std/runtime-wasi-process/) -> [runtime wasi process](/silk/docs/std/runtime-wasi-process/)
- [`std::runtime::wasi::signal`](/silk/docs/std/runtime-wasi-signal/) -> [runtime wasi signal](/silk/docs/std/runtime-wasi-signal/)
- [`std::runtime::wasi::sync`](/silk/docs/std/runtime-wasi-sync/) -> [runtime wasi sync](/silk/docs/std/runtime-wasi-sync/)
- [`std::runtime::wasi::task`](/silk/docs/std/runtime-wasi-task/) -> [runtime wasi task](/silk/docs/std/runtime-wasi-task/)
- [`std::runtime::wasi::time`](/silk/docs/std/runtime-wasi-time/) -> [runtime wasi time](/silk/docs/std/runtime-wasi-time/)

## Notes

- This catalog is the audit-oriented coverage map for the entire shipped
 [`std/**`](https://github.com/oro-computer/silk/tree/master/std/**) tree.
- For downstream users, start with the exact-name top-level module docs first.
- For nested and runtime modules, use the exact canonical page first and then
 follow its owning-family links for broader context.
