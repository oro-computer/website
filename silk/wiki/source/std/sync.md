# `std::sync`

`std::sync` provides synchronization primitives (hosted baseline).

Canonical doc: `docs/std/sync.md`.

## Status

- Implemented subset is available (mutex/condvar/channel/cancellation token).
- Details: `docs/std/sync.md`

## Importing

```silk
import std::sync;
```

## Examples

### Works today: `Channel(u64)` across `task`s

```silk
import sync from "std/sync";

type ChanU64 = sync::Channel(u64);

task fn producer (c: sync::ChannelBorrow(u64)) -> int {
 let err: sync::SyncFailed? = c.send(42);
 if err != None { return 10; }
 return 0;
}

async fn main () -> int {
 task {
 let c_r = ChanU64.init(1);
 if c_r.is_err() {
 return 100;
 }
 let mut c: ChanU64 = match (c_r) {
 Ok(v) => v,
 Err(_) => ChanU64.invalid(),
 };

 let h = producer(c.borrow());

 let v1: u64 = (c.recv() ?? 0);
 c.close();
 let v2: u64 = (c.recv() ?? 99);

 let rc_values: int[] = yield * h;
 let rc: int = rc_values[0];
 (mut c).destroy();

 if rc != 0 { return 11; }
 if v1 != 42 { return 1; }
 if v2 != 99 { return 2; }
 return 0;
 }
}
```

## See also

- Canonical doc: `docs/std/sync.md`
- Concurrency: `docs/wiki/language/concurrency.md`
- End-to-end fixtures:
 - `tests/silk/pass_std_sync_channel_u64.slk`
 - `tests/silk/pass_std_sync_mutex_condvar.slk`
 - `tests/silk/pass_std_sync_cancellation_token.slk`
