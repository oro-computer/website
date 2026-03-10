# `std::net`

`std::net` provides networking primitives for the hosted POSIX baseline,
including byte-order helpers, TCP/UDP sockets, DNS resolution helpers, and a
small async subset.

Canonical doc: [`std::net`](../docs/?p=std/networking).

## Status

- IPv4/IPv6 TCP and UDP APIs are available today, along with hostname
  resolution helpers such as `resolve_host(...)` and
  `TCPStream.connect_host(...)`.
- Async `connect` / `accept` are already exposed; deeper async socket read/write
  coverage and richer cancellation semantics are still incomplete.

## Example: IPv4 helpers
```silk
import std::net;

fn main () -> int {
  let a = ipv4(127, 0, 0, 1);
  if !ipv4_is_loopback(a) { return 1; }
  return 0;
}
```

## Example: async host connect
```silk
import std::net;

async fn main () -> int {
  let conn_r = await std::net::TCPStream.connect_host_async("example.com", 443);
  return match (conn_r) {
    Ok(_) => 0,
    Err(_) => 1,
  };
}
```

## See also

- [Canonical doc](../docs/?p=std/networking)
- [I/O surface](?p=std/io)
- [TLS](?p=std/tls)
