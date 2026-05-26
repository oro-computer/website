# `std::sync`

`std::sync` provides synchronization primitives (hosted baseline).

Canonical doc: [sync](?p=std/sync).

## Notes

- Supported forms is available (mutex/condvar/channel/cancellation token).
- Details: [sync](?p=std/sync)

## Importing

```silk
import std::sync;
```

## Examples

### Example: `Channel(u64)` across `task`s
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
    match (ChanU64.init(1)) {
      Ok(channel) => {
        let mut c: ChanU64 = channel;

        let h = producer(c.borrow());

        let v1: u64 = (c.recv() ?? 0);
        c.close();
        let v2: u64 = (c.recv() ?? 99);

        let rc_values: int[] = yield * h;
        let rc: int = rc_values[0];
        c.destroy();

        if rc != 0 { return 11; }
        if v1 != 42 { return 1; }
        if v2 != 99 { return 2; }
        return 0;
      },
      Err(_) => {
        return 100;
      },
    }
  }
}
```

## See also

- Canonical doc: [sync](?p=std/sync)
- Concurrency: [concurrency](?p=language/concurrency)
- End-to-end fixtures:
 - `tests/silk/pass_std_sync_channel_u64.slk`
 - `tests/silk/pass_std_sync_mutex_condvar.slk`
 - `tests/silk/pass_std_sync_cancellation_token.slk`
