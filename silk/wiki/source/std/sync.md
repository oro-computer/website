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

### Example: `ChannelSender(u64)` across `task`s
```silk
import sync from "std/sync";

type ChanU64 = sync::Channel(u64);

task fn producer (tx: sync::ChannelSender(u64), value: u64) -> int {
  if tx.send(value) != None { return 10; }
  return 0;
}

async fn main () -> int {
  task {
    let mut c = match ChanU64.init(1) {
      Ok(v) => v,
      Err(_) => return 100,
    };

    let tx0 = match c.sender() {
      Ok(v) => v,
      Err(_) => { c.destroy(); return 101; },
    };
    let tx1 = match tx0.clone() {
      Ok(v) => v,
      Err(_) => { c.destroy(); return 102; },
    };

    let h0 = producer(tx0, 40);
    let h1 = producer(tx1, 2);

    let v1: u64 = (c.recv() ?? 0);
    let v2: u64 = (c.recv() ?? 0);
    let end = c.recv();

    let rc0: int = yield h0;
    let rc1: int = yield h1;
    c.destroy();

    if rc0 != 0 || rc1 != 0 { return 11; }
    if v1 + v2 != 42 { return 1; }
    if end != None { return 2; }
    return 0;
  }
}
```

## See also

- Canonical doc: `docs/std/sync.md`
- Concurrency: `docs/language/concurrency.md`
- End-to-end fixtures:
  - `tests/silk/pass_std_sync_channel_u64.slk`
  - `tests/silk/pass_std_sync_mutex_condvar.slk`
  - `tests/silk/pass_std_sync_cancellation_token.slk`
