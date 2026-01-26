# `std::temporal`

Status: **Implemented subset**. A small, ergonomic subset
is implemented in `std/temporal.slk`:

- `Instant`/`Duration` convenience helpers, plus
- pure calendar/time utilities (`Date`, `TimeOfDay`, `DateTime`) that do not
  depend on OS clocks.

A hosted monotonic clock source (`now_monotonic`) is implemented via
`std::runtime::time`. The runtime also exposes Unix wall-clock timestamps via
`unix_now_ns` / `unix_now_ms`, but higher-level UTC/local timestamp helpers
remain future work.

`std::temporal` provides utilities built around the `Instant` and `Duration`
types (`docs/language/duration-instant.md`) and a proleptic Gregorian calendar
model for date/time computations.

See also:

- `docs/language/duration-instant.md`
- `docs/std/conventions.md`

## Implemented API

The following helpers exist today in `std/temporal.slk` and are available to
import.

```silk
module std::temporal;

export let NANOSECOND: Duration = 1ns;
export let MICROSECOND: Duration = 1us;
export let MILLISECOND: Duration = 1ms;
export let SECOND: Duration = 1s;
export let MINUTE: Duration = 1min;
export let HOUR: Duration = 1h;
export let DAY: Duration = 1d;

export fn duration_zero () -> Duration;
export fn is_zero (d: Duration) -> bool;
export fn is_negative (d: Duration) -> bool;
export fn duration_abs (d: Duration) -> Duration;
export fn duration_to_secs_trunc (d: Duration) -> i64;
export fn duration_from_secs (seconds: i64) -> Duration;

export fn add (t: Instant, d: Duration) -> Instant;
export fn sub (t: Instant, d: Duration) -> Instant;
export fn since (later: Instant, earlier: Instant) -> Duration;

export fn before (a: Instant, b: Instant) -> bool;
export fn after (a: Instant, b: Instant) -> bool;

enum TemporalErrorKind { OutOfMemory, NoMonotonicClock, InvalidInput, Overflow, Unknown }
error TemporalFailed { code: int, requested: i64 }
export type InstantResult = std::result::Result(Instant, TemporalFailed);
export type TemporalStringResult = std::result::Result(std::strings::String, TemporalFailed);

export fn now_monotonic () -> InstantResult;

struct Date { year: int, month: int, day: int }
struct TimeOfDay { hour: int, minute: int, second: int, nanosecond: int }
struct DateTime { date: Date, time: TimeOfDay }

// Validation + construction (pure; returns optional on invalid inputs).
Date.try_from_ymd(year: int, month: int, day: int) -> Date?;
TimeOfDay.try_from_hms_nano(hour: int, minute: int, second: int, nanosecond: int) -> TimeOfDay?;
DateTime.try_from_date_time(date: Date, time: TimeOfDay) -> DateTime?;

// Unix conversions (UTC; pure). Days are relative to 1970-01-01.
Date.to_unix_days(self: &Date) -> i64?;
Date.from_unix_days(days: i64) -> Date;
Date.iso_weekday(self: &Date) -> int?;

TimeOfDay.to_nanos_of_day(self: &TimeOfDay) -> i64?;
TimeOfDay.from_nanos_of_day(ns: i64) -> TimeOfDay?;

DateTime.to_unix_timestamp_ns(self: &DateTime) -> i64?;
DateTime.from_unix_timestamp_ns(ns: i64) -> DateTime?;

// Formatting/parsing (strict ISO-8601 subsets; allocation in formatting).
export fn format_date_iso (d: Date) -> TemporalStringResult;
export fn format_time_iso (t: TimeOfDay) -> TemporalStringResult;
export fn format_datetime_iso (dt: DateTime) -> TemporalStringResult;

enum ParseErrorKind { InvalidInput, InvalidLength, InvalidDigit, InvalidSeparator, InvalidRange, TrailingInput, Unknown }
error ParseError { code: int, offset: i64 }
export type DateParseResult = std::result::Result(Date, ParseError);
export type TimeParseResult = std::result::Result(TimeOfDay, ParseError);
export type DateTimeParseResult = std::result::Result(DateTime, ParseError);

export fn parse_date_iso (s: string) -> DateParseResult;
export fn parse_time_iso (s: string) -> TimeParseResult;
export fn parse_datetime_iso (s: string) -> DateTimeParseResult;
```

## Scope

`std::temporal` is responsible for:

- Access to time sources:
  - a monotonic clock for measuring durations (`Instant`),
  - a wall-clock time source (UTC/local timestamps) for `DateTime` (future work).
- Conversions between units and convenience helpers for `Duration`.
- Pure calendar/time computations that do not require OS services:
  - validation and construction of `Date`, `TimeOfDay`, and `DateTime`,
  - Unix epoch conversions (days/seconds/nanoseconds),
  - strict ISO formatting/parsing helpers.

## Clock APIs (Initial Design)

The language examples use `std::now()`; the stdlib should make the clock source
explicit:

`std::temporal` currently exposes only a monotonic clock read:

Notes:

- `now_monotonic()` must be monotonic (not subject to wall-clock adjustments).
- Sleeping is exposed via `std::task` (`sleep` / `sleep_until`) in the current
  stdlib.

## Duration Helpers

`Duration` literals exist at the language level. The stdlib adds helpers such
as:

- `to_millis(d)`, `to_secs(d)`
- checked arithmetic (`checked_add`, `checked_mul`) where overflow behavior
  needs to be explicit.

## Future Work

- Wall-clock time (`now_utc`, `now_local`) via higher-level wrappers on top of
  `std::runtime::time::unix_now_ns` / `unix_now_ms`.
- Time zones and DST rules (separate module layered on top of `DateTime`).
- Richer formatting/parsing (locale-aware, RFCs) layered on top of `std::fmt`.
