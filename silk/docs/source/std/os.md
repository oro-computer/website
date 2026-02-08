# `std::os`

Status: **Implemented subset**.

`std::os` provides:

- compiler-provided **target metadata** (platform/OS, architecture, and a small
  set of booleans),
- small hosted runtime helpers (uptime and CPU information).

This module is POSIX-first for hosted behavior, but its target-metadata surface
is available on every target.

See also:

- `docs/language/target-metadata.md` (the built-in target metadata constants).

## API

```silk
module std::os;

import std::memory;
import std::result;
import std::temporal;
import std::vector;

export const PLATFORM_NAME: string;
export const ARCH_NAME: string;
export const IS_UNIX: bool;
export const IS_POSIX: bool;

enum Architecture { X86_64, WASM32, Unknown }
enum Platform { Linux, WASI, Unknown }

export fn arch () -> Architecture;
export fn platform () -> Platform;

export type UptimeResult = std::result::Result(Duration, std::temporal::TemporalFailed);
export fn uptime () -> UptimeResult;

struct CPU { model: string }
export type CPUsResult = std::result::Result(std::vector::Vector(CPU), std::memory::AllocFailed);
export fn cpus () -> CPUsResult;

export fn cpu_count () -> int;
```

## Target metadata

The exported constants are compile-time constants derived from the built-in
target metadata values:

- `PLATFORM_NAME == OS_PLATFORM`
- `ARCH_NAME == OS_ARCH`
- `IS_UNIX == OS_IS_UNIX`
- `IS_POSIX == OS_IS_POSIX`

Use these when you prefer explicit namespacing over using `OS_PLATFORM` /
`OS_ARCH` directly.

## `Architecture` and `Platform`

`std::os::arch()` and `std::os::platform()` map `ARCH_NAME` and `PLATFORM_NAME`
into enums suitable for `match`.

The `Unknown` case is returned when the current compiler target is not covered
by the current enum set.

## Uptime

`std::os::uptime()` returns the current monotonic uptime as a `Duration`.

On the default hosted POSIX runtime, this uses `clock_gettime(CLOCK_MONOTONIC)`
via `std::temporal`.

## CPU information

### `cpu_count`

`std::os::cpu_count()` returns the number of logical CPUs available to the
current process (>= 1).

### `cpus`

`std::os::cpus()` returns a `Vector(CPU)` with `len == cpu_count()`.

Ownership:

- Callers must drop the returned vector when finished.

Current implementation:

- `CPU.model` is set to `ARCH_NAME` for each returned CPU record.
