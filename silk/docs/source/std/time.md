# `std::time`

`std::time` is a small CLI-oriented facade over the broader
`std::temporal` module. It exposes monotonic timing and basic duration helpers
without requiring tools to import calendar/date functionality.

## Exported API

```silk
module std::time;

export type InstantResult = std::temporal::InstantResult;

export fn monotonic_now () -> InstantResult;
export fn now () -> InstantResult;

export fn duration_zero () -> Duration;
export fn duration_from_secs (seconds: i64) -> Duration;
export fn duration_from_ms (milliseconds: i64) -> Duration;
export fn duration_to_secs_trunc (d: Duration) -> i64;
export fn duration_to_ms_trunc (d: Duration) -> i64;
export fn since (later: Instant, earlier: Instant) -> Duration;
```

## Notes

- `monotonic_now()` and `now()` read the same monotonic clock as
 `std::temporal::now_monotonic()`.
- Durations are the language-level `Duration` values documented in
 [duration instant](?p=language/duration-instant).
- Wall-clock time and calendar formatting remain in `std::temporal`.
